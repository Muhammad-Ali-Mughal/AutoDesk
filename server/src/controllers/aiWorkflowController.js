import Workflow from "../models/Workflow.model.js";
import AIScenario from "../models/AIScenario.model.js";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { validateConditionConfig } from "../engine/resolvers/conditionEvaluator.js";

const MODEL = "gpt-4o-mini";
const SUPPORTED_APPS = new Set([
  "webhook",
  "google_sheets",
  "email",
  "condition",
  "schedule",
]);
const SUPPORTED_ACTIONS = {
  google_sheets: new Set(["append_row"]),
  email: new Set(["send_email"]),
  condition: new Set(["evaluate"]),
  schedule: new Set(["configure_schedule"]),
};

const formatLabel = (app) => {
  switch (app) {
    case "google_sheets":
      return "Google Sheets";
    case "email":
      return "Email";
    case "webhook":
      return "Webhook";
    case "condition":
      return "Condition";
    case "schedule":
      return "Schedule";
    default:
      return app.charAt(0).toUpperCase() + app.slice(1);
  }
};

const buildSystemPrompt = ({
  strictConditionRequired = false,
  strictScheduleRequired = false,
} = {}) => {
  const conditionRule = strictConditionRequired
    ? "8. Because the user prompt implies branching logic, include at least one condition action."
    : "8. Include condition actions only when the prompt implies if/else or branching.";
  const scheduleRule = strictScheduleRequired
    ? "9. Because the user prompt implies scheduled timing/recurrence, include at least one schedule action."
    : "9. Include schedule actions only when the prompt implies timing/recurrence needs.";

  return `You are an expert workflow automation generator like make.com or zapier.
Your job is to design automation workflows using ONLY the supported modules below.

SUPPORTED MODULES:
- webhook: Trigger that starts the workflow when data is received.
- google_sheets: Append data to a Google Sheet.
- email: Send an email notification.
- condition: Evaluate rules and branch into true/false paths.
- schedule: Configure timing metadata for delayed/periodic workflow steps.

RULES:
1. Respond ONLY with valid JSON (no text, no markdown).
2. Use ONLY supported modules listed above.
3. Workflow trigger must be webhook with app "webhook".
4. Workflow must include at least one action node.
5. For non-condition actions, use:
   - google_sheets: { app: "google_sheets", action: "append_row", type: "google_sheets", config: { ... } }
   - email: { app: "email", action: "send_email", type: "email", config: { ... } }
   - schedule: { app: "schedule", action: "configure_schedule", type: "schedule", config: { ... } }
6. Condition action must use:
   {
     "app": "condition",
     "action": "evaluate",
     "type": "condition",
     "config": {
       "mode": "all" | "any",
       "rules": [
         { "left": "{{webhook.user.id}}", "operator": "eq", "right": "1", "rightType": "number" }
       ]
     },
     "branches": {
       "true": [ ...actions... ],
       "false": [ ...actions... ]
     }
   }
7. Schedule action config should support:
   {
     "frequency": "hourly" | "daily" | "weekly" | "monthly" | "custom" | "once",
     "time": "HH:mm",
     "timezone": "UTC",
     "minute": 0,
     "dayOfWeek": 1,
     "dayOfMonth": 1,
     "cron": "* * * * *",
     "runOnce": false,
     "runAt": "YYYY-MM-DD"
   }
   If scheduling is requested but details are missing, default to:
   frequency="daily", time="09:00", timezone="UTC", runOnce=false.
${conditionRule}
${scheduleRule}

SCHEMA:
{
  "name": "string",
  "description": "string",
  "trigger": { "app": "webhook", "event": "on_receive" },
  "actions": [ ... ]
}`;
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in server/.env and restart server.");
  }

  return new OpenAI({ apiKey });
}

function parseAndValidateAIJson(rawText) {
  let structured;

  try {
    structured = JSON.parse(rawText);
  } catch (err) {
    throw new Error("Invalid AI response format: expected valid JSON");
  }

  if (!structured || typeof structured !== "object") {
    throw new Error("Invalid AI response format: root must be an object");
  }

  if (!structured.trigger || structured.trigger.app !== "webhook") {
    throw new Error("Invalid AI response: trigger.app must be 'webhook'");
  }

  if (!Array.isArray(structured.actions) || structured.actions.length === 0) {
    throw new Error("Invalid AI response: actions must be a non-empty array");
  }

  validateActionList(structured.actions, "actions");

  return structured;
}

function getDefaultRunAtDate() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}

function normalizeScheduleConfig(config = {}, actionPath) {
  if (!config || typeof config !== "object") {
    throw new Error(`Invalid AI response: ${actionPath}.config must be an object`);
  }

  const normalized = { ...config };
  const rawFrequency = (normalized.frequency || "daily").toString().toLowerCase();
  const allowedFrequencies = new Set([
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "custom",
    "once",
  ]);

  if (!allowedFrequencies.has(rawFrequency)) {
    throw new Error(
      `Invalid schedule config at ${actionPath}: unsupported frequency '${rawFrequency}'`,
    );
  }

  normalized.frequency = rawFrequency;
  normalized.timezone = normalized.timezone || "UTC";

  if (rawFrequency === "once") {
    normalized.runOnce = true;
    normalized.time = normalized.time || "09:00";
    const runAt = normalized.runAt || getDefaultRunAtDate();
    normalized.runAt = String(runAt).includes("T")
      ? String(runAt).split("T")[0]
      : String(runAt);
    return normalized;
  }

  normalized.runOnce = false;
  normalized.runAt = null;

  if (rawFrequency === "custom") {
    const cron = (normalized.cron || "").toString().trim();
    if (!cron) {
      throw new Error(
        `Invalid schedule config at ${actionPath}: custom frequency requires cron`,
      );
    }
    normalized.cron = cron;
    return normalized;
  }

  normalized.time = normalized.time || "09:00";

  if (rawFrequency === "hourly") {
    const minute = Number(normalized.minute);
    normalized.minute = Number.isNaN(minute) ? 0 : Math.min(Math.max(minute, 0), 59);
    return normalized;
  }

  if (rawFrequency === "weekly") {
    const dayOfWeek = Number(normalized.dayOfWeek);
    normalized.dayOfWeek = Number.isNaN(dayOfWeek)
      ? 1
      : Math.min(Math.max(dayOfWeek, 0), 6);
    return normalized;
  }

  if (rawFrequency === "monthly") {
    const dayOfMonth = Number(normalized.dayOfMonth);
    normalized.dayOfMonth = Number.isNaN(dayOfMonth)
      ? 1
      : Math.min(Math.max(dayOfMonth, 1), 31);
  }

  return normalized;
}

function validateActionList(actions, path) {
  for (let i = 0; i < actions.length; i += 1) {
    const action = actions[i];
    const actionPath = `${path}[${i}]`;

    if (!action || typeof action !== "object") {
      throw new Error(`Invalid AI response: ${actionPath} must be an object`);
    }

    const { app, type, config, branches, action: actionName } = action;

    if (!SUPPORTED_APPS.has(app)) {
      throw new Error(`Invalid AI response: unsupported app '${app}' at ${actionPath}`);
    }

    if (type !== app) {
      throw new Error(`Invalid AI response: type must match app at ${actionPath}`);
    }

    const allowedActionNames = SUPPORTED_ACTIONS[app];
    if (!allowedActionNames || !allowedActionNames.has(actionName)) {
      throw new Error(
        `Invalid AI response: unsupported action '${actionName}' for app '${app}' at ${actionPath}`,
      );
    }

    if (app === "condition") {
      if (!branches || typeof branches !== "object") {
        throw new Error(`Invalid AI response: ${actionPath}.branches is required`);
      }

      const trueBranch = branches.true;
      const falseBranch = branches.false;

      if (!Array.isArray(trueBranch) || !Array.isArray(falseBranch)) {
        throw new Error(
          `Invalid AI response: ${actionPath}.branches.true and .false must be arrays`,
        );
      }
      if (trueBranch.length === 0 || falseBranch.length === 0) {
        throw new Error(
          `Invalid AI response: ${actionPath}.branches.true and .false must be non-empty`,
        );
      }

      const conditionValidation = validateConditionConfig(config || {});
      if (!conditionValidation.valid) {
        throw new Error(`Invalid condition config at ${actionPath}: ${conditionValidation.error}`);
      }

      validateActionList(trueBranch, `${actionPath}.branches.true`);
      validateActionList(falseBranch, `${actionPath}.branches.false`);
      continue;
    }

    if (app === "schedule") {
      action.config = normalizeScheduleConfig(config, actionPath);
      continue;
    }

    if (!config || typeof config !== "object") {
      throw new Error(`Invalid AI response: ${actionPath}.config must be an object`);
    }
  }
}

function hasConditionAction(actions = []) {
  return actions.some((action) => {
    if (action?.app === "condition") return true;
    if (!action?.branches) return false;
    return (
      hasConditionAction(action.branches.true || []) ||
      hasConditionAction(action.branches.false || [])
    );
  });
}

function hasScheduleAction(actions = []) {
  return actions.some((action) => {
    if (action?.app === "schedule") return true;
    if (!action?.branches) return false;
    return (
      hasScheduleAction(action.branches.true || []) ||
      hasScheduleAction(action.branches.false || [])
    );
  });
}

function detectBranchingIntent(prompt = "") {
  const lowered = prompt.toLowerCase();
  const keywords = [
    "if ",
    " else",
    "condition",
    "branch",
    "otherwise",
    "based on",
    "when",
    "then",
  ];

  const keywordHits = keywords.filter((keyword) => lowered.includes(keyword)).length;

  if (lowered.includes("if") && lowered.includes("else")) return true;
  if (lowered.includes("when") && lowered.includes("otherwise")) return true;
  return keywordHits >= 2;
}

function detectSchedulingIntent(prompt = "") {
  const lowered = prompt.toLowerCase();
  const keywords = [
    "schedule",
    "every",
    "daily",
    "weekly",
    "monthly",
    "hourly",
    "cron",
    "run at",
    "once",
    "remind",
  ];

  return keywords.some((keyword) => lowered.includes(keyword));
}

async function requestAIWorkflow({
  prompt,
  strictConditionRequired = false,
  strictScheduleRequired = false,
}) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt({ strictConditionRequired, strictScheduleRequired }),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
  });

  const rawText = completion?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error("AI did not return any content");
  }

  const structured = parseAndValidateAIJson(rawText);
  return { rawText, structured };
}

function buildWorkflowGraph(structured) {
  const nodes = [];
  const edges = [];
  const actions = [];

  let nodeCounter = 1;
  let edgeCounter = 1;

  const nextNodeId = () => `ai-node-${nodeCounter++}`;
  const nextEdgeId = () => `ai-edge-${edgeCounter++}`;

  const addEdge = (source, target, sourceHandle) => {
    const branchSuffix =
      sourceHandle && sourceHandle.endsWith("-true")
        ? "true"
        : sourceHandle && sourceHandle.endsWith("-false")
          ? "false"
          : null;

    const edge = {
      id: branchSuffix ? `${source}-${branchSuffix}-${nextEdgeId()}` : nextEdgeId(),
      source,
      target,
    };

    if (sourceHandle) {
      edge.sourceHandle = sourceHandle;
    }

    edges.push(edge);
  };

  const triggerNodeId = nextNodeId();
  nodes.push({
    id: triggerNodeId,
    type: "trigger",
    position: { x: 150, y: 100 },
    data: {
      label: formatLabel("webhook"),
      actionType: "webhook",
      config: structured.trigger,
    },
  });

  const xSpacing = 280;
  const ySpacing = 150;

  const createChain = (chainActions, incomingConnections, depth, yRef) => {
    let activeConnections = [...incomingConnections];

    for (const action of chainActions) {
      const nodeId = nextNodeId();
      const isCondition = action.app === "condition";
      const currentY = yRef.value;
      yRef.value += ySpacing;

      nodes.push({
        id: nodeId,
        type: isCondition ? "condition" : "action",
        position: {
          x: 150 + depth * xSpacing,
          y: currentY,
        },
        data: {
          label: formatLabel(action.app),
          actionType: action.app,
          config: action.config || {},
          ...(action.app === "schedule" ? action.config || {} : {}),
        },
      });

      actions.push({
        nodeId,
        type: action.type || action.app,
        service: action.app,
        config: action.config || {},
      });

      for (const connection of activeConnections) {
        addEdge(connection.nodeId, nodeId, connection.sourceHandle);
      }

      if (!isCondition) {
        activeConnections = [{ nodeId, sourceHandle: null }];
        continue;
      }

      const trueTerminals = createChain(
        action.branches.true || [],
        [{ nodeId, sourceHandle: `${nodeId}-true` }],
        depth + 1,
        { value: currentY - ySpacing },
      );

      const falseTerminals = createChain(
        action.branches.false || [],
        [{ nodeId, sourceHandle: `${nodeId}-false` }],
        depth + 1,
        { value: currentY + ySpacing },
      );

      activeConnections = [...trueTerminals, ...falseTerminals];
    }

    return activeConnections;
  };

  createChain(structured.actions, [{ nodeId: triggerNodeId, sourceHandle: null }], 1, {
    value: 120,
  });

  return { nodes, edges, actions };
}

function getAiApiError(err) {
  const status = err?.status || err?.code || null;
  const providerCode = err?.error?.code || err?.code || "";

  if (status === 429 || providerCode === "insufficient_quota") {
    return {
      statusCode: 429,
      message:
        "OpenAI quota exceeded. Add billing/credits or change API key, then retry.",
    };
  }

  return {
    statusCode: 500,
    message: err?.message || "Failed to generate workflow",
  };
}

/**
 * Generate a workflow from AI prompt
 */
export const generateAIWorkflow = async (req, res) => {
  let aiScenario = null;

  try {
    const { prompt } = req.body;
    const userId = req.user._id;
    const organizationId = req.user.organizationId;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    aiScenario = await AIScenario.create({
      userId,
      organizationId,
      name: `Workflow: ${prompt.slice(0, 50)}...`,
      prompt,
      model: MODEL,
      status: "processing",
    });

    const branchingRequested = detectBranchingIntent(prompt);
    const schedulingRequested = detectSchedulingIntent(prompt);

    let aiResult = await requestAIWorkflow({
      prompt,
      strictConditionRequired: false,
      strictScheduleRequired: false,
    });

    const needsConditionRetry =
      branchingRequested && !hasConditionAction(aiResult.structured.actions);
    const needsScheduleRetry =
      schedulingRequested && !hasScheduleAction(aiResult.structured.actions);

    if (needsConditionRetry || needsScheduleRetry) {
      aiResult = await requestAIWorkflow({
        prompt,
        strictConditionRequired: branchingRequested,
        strictScheduleRequired: schedulingRequested,
      });
    }

    const { rawText, structured } = aiResult;
    const { nodes, edges, actions } = buildWorkflowGraph(structured);

    const workflow = await Workflow.create({
      organizationId,
      userId,
      name: structured.name || "Untitled Workflow",
      description: structured.description || "Generated by AI",
      triggers: { type: "webhook", webhookSecret: uuidv4() },
      nodes,
      edges,
      actions,
      status: "draft",
    });

    aiScenario.response = rawText;
    aiScenario.status = "completed";
    await aiScenario.save();

    res.status(200).json({
      success: true,
      workflow,
      message: "Workflow generated successfully!",
    });
  } catch (err) {
    console.error("❌ Error generating workflow:", err);

    if (aiScenario) {
      aiScenario.status = "failed";
      aiScenario.response = err.message;
      await aiScenario.save().catch(() => {});
    }

    const aiError = getAiApiError(err);
    res.status(aiError.statusCode).json({
      message: aiError.message,
    });
  }
};
