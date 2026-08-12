import { resolveAction } from "./resolvers/actionResolver.js";
import handlers from "./handlers/index.js";

function resolveActionType({ node, action }) {
  if (node?.data?.actionType) {
    return node.data.actionType.toLowerCase();
  }
  if (node?.data?.label) {
    return node.data.label.toLowerCase().replace(/\s+/g, "_");
  }
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

export async function executeNode(nodeId, workflow, context, log, visited = new Set()) {
  if (visited.has(nodeId)) {
    console.warn(`⚠️ Cycle detected at node ${nodeId} — stopping this branch to avoid infinite loop`);
    log.executionSteps.push({
      nodeId,
      stepName: "Cycle guard",
      action: "cycle_detected",
      status: "skipped",
      errorMessage: "Cycle detected — this branch was stopped to avoid an infinite loop",
      startedAt: new Date(),
      completedAt: new Date(),
    });
    return;
  }
  visited.add(nodeId);

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
      stepLog.status = "failed";
      stepLog.errorMessage = `No handler registered for action type: ${actionType}`;
      stepLog.completedAt = new Date();
      log.executionSteps.push(stepLog);
      return; // stop this branch only, other branches/steps are unaffected
    }

    try {
      console.log(`➡ Forwarding to ${actionType} handler`);
      output = await handler(action || {}, context, log);
      console.log(`✅ Handler output:`, output);
      context.steps ??= {};
      context.steps[node.id] = output;

      stepLog.status = "success";
      stepLog.output = output;
      stepLog.completedAt = new Date();
    } catch (err) {
      console.error(`❌ Node ${nodeId} (${actionType}) failed:`, err.message);
      stepLog.status = "failed";
      stepLog.errorMessage = err.message;
      stepLog.completedAt = new Date();
      log.executionSteps.push(stepLog);
      return; // stop following edges from a failed node, but keep earlier successful steps
    }
  } else {
    stepLog.status = "skipped";
  }
  log.executionSteps.push(stepLog);
  const nextEdges = pickNextEdges(nodeId, output, workflow.edges, actionType);
  console.log(
    `📍 Node ${nodeId} (${actionType}): Found ${nextEdges.length} outgoing edges`,
  );
  for (const edge of nextEdges) {
    console.log(`↪️ Following edge to ${edge.target}`);
    await executeNode(edge.target, workflow, context, log, visited);
  }
}
