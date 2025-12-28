export function getActionType(node) {
  if (!node) return null;

  // trigger node
  if (node.type === "trigger") return "webhook";

  // explicit actionType (best)
  if (node.data?.actionType) return node.data.actionType;

  // fallback (email, delay, etc.)
  if (node.data?.label) {
    return node.data.label.toLowerCase();
  }

  return null;
}
