import { resolveAction } from "./resolvers/actionResolver.js";
import handlers from "./handlers/index.js";

/**
 * 🔑 Robust action type resolver
 */
function resolveActionType({ node, action }) {
  // 1️⃣ Preferred (explicit)
  if (node?.data?.actionType) {
    return node.data.actionType.toLowerCase();
  }

  // 2️⃣ UI label fallback
  if (node?.data?.label) {
    return node.data.label.toLowerCase().replace(/\s+/g, "_");
  }

  // 3️⃣ Legacy DB fallback (LAST)
  if (action?.type) {
    return action.type.toLowerCase();
  }

  return null;
}

export async function executeNode(nodeId, workflow, context, log) {
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  console.log("▶ Executing node:", node.data?.label);

  // 🔹 Load action config
  let action = workflow.actions.find((a) => a.nodeId === node.id);
  console.log("RAW ACTION FROM DB:", action);

  action = await resolveAction(action, node, workflow._id);

  // 🔹 Resolve action type SAFELY
  const actionType = resolveActionType({ node, action });

  console.log("ACTION TYPE:", actionType);
  // console.log("AVAILABLE HANDLERS:", Object.keys(handlers));

  const stepLog = {
    nodeId: node.id,
    stepName: node.data?.label,
    action: actionType,
    startedAt: new Date(),
    status: "running",
  };

  if (actionType) {
    const handler = handlers[actionType];

    if (!handler) {
      throw new Error(`No handler registered for action type: ${actionType}`);
    }

    console.log(`➡ Forwarding to ${actionType} handler`);

    const output = await handler(action || {}, context);

    context.steps ??= {};
    context.steps[node.id] = output;

    stepLog.status = "success";
    stepLog.output = output;
    stepLog.completedAt = new Date();
  } else {
    stepLog.status = "skipped";
  }

  log.executionSteps.push(stepLog);

  // 🔁 Traverse graph
  const nextEdges = workflow.edges.filter((e) => e.source === node.id);
  for (const edge of nextEdges) {
    await executeNode(edge.target, workflow, context, log);
  }
}
