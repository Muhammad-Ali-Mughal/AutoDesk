/**
 * Resolve {{path.to.value}} templates from context
 */
export function resolveTemplate(template, context = {}) {
  if (!template || typeof template !== "string") return template;

  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    const value = getByPath(context, path.trim());

    // 🔥 Important: undefined → empty string
    if (value === undefined || value === null) return "";

    // Convert objects safely
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Deep getter: webhook.user.id → context.webhook.user.id
 */
function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
      return acc[key];
    }
    return undefined;
  }, obj);
}
