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

function extractBranchFromEdgeId(edgeId, nodeId) {
  const truePattern = new RegExp(`${nodeId}-true`);
  const falsePattern = new RegExp(`${nodeId}-false`);

  if (truePattern.test(edgeId)) return "true";
  if (falsePattern.test(edgeId)) return "false";
  return null;
}

function pickNextEdges(nodeId, result, edges, actionType) {
  const outgoingEdges = edges.filter((e) => e.source === nodeId);

  if (actionType === "condition") {
    // Determine which branch was taken
    const branch = result && result.result ? "true" : "false";

    console.log(
      `🔍 Looking for ${branch} branch from condition node ${nodeId}`,
    );
    console.log(`📊 Total outgoing edges: ${outgoingEdges.length}`);
    console.log(`📋 Edges:`, outgoingEdges);

    const expectedHandle = `${nodeId}-${branch}`;
    let branchEdges = outgoingEdges.filter(
      (e) => e.sourceHandle === expectedHandle,
    );

    if (branchEdges.length === 0) {
      branchEdges = outgoingEdges.filter((e) => {
        const edgeBranch = extractBranchFromEdgeId(e.id, nodeId);
        const matches = edgeBranch === branch;
        if (matches) {
          console.log(`✅ Found ${branch} edge via ID extraction: ${e.id}`);
        }
        return matches;
      });
    }

    if (branchEdges.length === 0) {
      console.warn(
        `⚠️ No outgoing edge for ${branch} branch on condition node ${nodeId}`,
      );
    }

    return branchEdges;
  }

  return outgoingEdges;
}

export async function executeNode(nodeId, workflow, context, log) {
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  console.log("▶ Executing node:", node.data?.label);

  let action = workflow.actions.find((a) => a.nodeId === node.id);
  console.log("RAW ACTION FROM DB:", action);

  action = await resolveAction(action, node, workflow._id);
  const actionType = resolveActionType({ node, action });
  console.log("ACTION TYPE:", actionType);

  const stepLog = {
    nodeId: node.id,
    stepName: node.data?.label,
    action: actionType,
    startedAt: new Date(),
    status: "running",
  };

  let output = null;

  if (actionType) {
    const handler = handlers[actionType];

    if (!handler) {
      throw new Error(`No handler registered for action type: ${actionType}`);
    }

    console.log(`➡ Forwarding to ${actionType} handler`);

    output = await handler(action || {}, context, log);

    console.log(`✅ Handler output:`, output);

    context.steps ??= {};
    context.steps[node.id] = output;

    stepLog.status = "success";
    stepLog.output = output;
    stepLog.completedAt = new Date();
  } else {
    stepLog.status = "skipped";
  }

  log.executionSteps.push(stepLog);

  // 🔁 Traverse graph with condition-aware edge picking
  const nextEdges = pickNextEdges(nodeId, output, workflow.edges, actionType);
  console.log(
    `📍 Node ${nodeId} (${actionType}): Found ${nextEdges.length} outgoing edges`,
  );

  for (const edge of nextEdges) {
    console.log(`↪️ Following edge to ${edge.target}`);
    await executeNode(edge.target, workflow, context, log);
  }
}
