import fetch from "node-fetch";

// Handlers for different action types
const actionHandlers = {
  webhook: async (action, context) => {
    const res = await fetch(action.service, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    return await res.json();
  },

  delay: async (action, context) => {
    const ms = action?.config?.ms || 1000;
    console.log(`Delay for ${ms}ms`);
    await new Promise(r => setTimeout(r, ms));
    return context;
  },

  email: async (action, context) => {
    // Example: integrate with nodemailer, SendGrid, etc.
    console.log(`Sending email to ${action.to} | subject: ${action.subject}`);
    return { delivered: true, ...context };
  },

  condition: async (action, context) => {
    const result = action.filters.every(f => applyFilter(f, context));
    console.log(`Condition evaluated: ${result}`);
    return result ? context : null;
  },
};

// Evaluate filters
function applyFilter(filter, context) {
  const value = context[filter.field];
  switch (filter.condition) {
    case "equals": return value === filter.value;
    case "not_equals": return value !== filter.value;
    case "greater_than": return value > filter.value;
    case "less_than": return value < filter.value;
    case "contains": return String(value).includes(filter.value);
    case "not_contains": return !String(value).includes(filter.value);
    case "starts_with": return String(value).startsWith(filter.value);
    case "ends_with": return String(value).endsWith(filter.value);
    default: return false;
  }
}

// Workflow runner
export async function executeWorkflow(workflow, inputData) {
  let context = inputData;

  // Find trigger node
  const triggerNode = workflow.nodes.find(n => n.type === "trigger");
  if (!triggerNode) throw new Error("No trigger node found");

  await executeNode(triggerNode.id, workflow, context);
}

async function executeNode(nodeId, workflow, context) {
  const node = workflow.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const action = workflow.actions.find(a => a.service === node.data.label);
  if (action) {
    const handler = actionHandlers[action.type];
    if (handler) {
      context = await handler(action, context);
    }
  }

  // Traverse edges
  const nextEdges = workflow.edges.filter(e => e.source === node.id);
  for (let edge of nextEdges) {
    await executeNode(edge.target, workflow, context);
  }
}
