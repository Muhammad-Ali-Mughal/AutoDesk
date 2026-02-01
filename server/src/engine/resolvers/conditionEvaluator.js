/**
 * 🔧 Condition Evaluator
 * Safely evaluates condition rules against execution context
 * Supports template variables, type coercion, and multiple operators
 */

/**
 * Resolve template variables like {{context.payload.email}}
 * Supports nested object access with dot notation
 */
export function resolveTemplate(template, context) {
  if (!template || typeof template !== "string") {
    return template;
  }

  // Replace {{...}} patterns with resolved values
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const resolved = getNestedValue(path, context);
    return resolved !== undefined ? resolved : match;
  });
}

/**
 * Get nested value from object using dot notation
 * e.g., "context.payload.user.email" -> user.email from context object
 */
function getNestedValue(path, context) {
  const keys = path.trim().split(".");
  let value = context;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

/**
 * Safely parse and coerce value to target type
 */
function coerceValue(value, targetType) {
  if (value === null || value === undefined) {
    return value;
  }

  switch (targetType) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? value : num;

    case "boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      }
      return Boolean(value);

    case "json":
      if (typeof value === "object") return value;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value; // return original if parse fails
        }
      }
      return value;

    case "null":
      return null;

    case "string":
    default:
      return String(value);
  }
}

/**
 * Evaluate a single rule
 * Returns boolean result
 */
export function evaluateRule(rule, context) {
  const { left, operator, right, rightType = "string" } = rule;

  // Resolve template in left value
  const resolvedLeft = resolveTemplate(left, context);

  // Handle exists/not_exists operators (right value ignored)
  if (operator === "exists") {
    return resolvedLeft !== undefined && resolvedLeft !== null;
  }
  if (operator === "not_exists") {
    return resolvedLeft === undefined || resolvedLeft === null;
  }

  // Coerce right value to target type
  const resolvedRight = coerceValue(right, rightType);

  // Perform comparison
  return performComparison(resolvedLeft, operator, resolvedRight);
}

/**
 * Perform comparison based on operator
 */
function performComparison(left, operator, right) {
  switch (operator) {
    case "eq":
      return strictEqual(left, right);

    case "neq":
      return !strictEqual(left, right);

    case "gt":
      return toNumber(left) > toNumber(right);

    case "gte":
      return toNumber(left) >= toNumber(right);

    case "lt":
      return toNumber(left) < toNumber(right);

    case "lte":
      return toNumber(left) <= toNumber(right);

    case "contains":
      return performContains(left, right);

    case "not_contains":
      return !performContains(left, right);

    case "starts_with":
      if (typeof left !== "string" || typeof right !== "string") {
        return false;
      }
      return left.startsWith(right);

    case "ends_with":
      if (typeof left !== "string" || typeof right !== "string") {
        return false;
      }
      return left.endsWith(right);

    case "regex":
      return performRegex(left, right);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Strict equality with reasonable type coercion
 */
function strictEqual(a, b) {
  if (a === b) return true;

  // Try numeric comparison if both look like numbers
  const aNum = Number(a);
  const bNum = Number(b);
  if (!isNaN(aNum) && !isNaN(bNum)) {
    return aNum === bNum;
  }

  // String comparison
  return String(a) === String(b);
}

/**
 * Convert to number, return NaN if not possible
 */
function toNumber(value) {
  return Number(value);
}

/**
 * Check if left contains right (string or array)
 */
function performContains(left, right) {
  if (typeof left === "string" && typeof right === "string") {
    return left.includes(right);
  }

  if (Array.isArray(left)) {
    return left.includes(right);
  }

  if (typeof left === "object" && left !== null) {
    return JSON.stringify(left).includes(JSON.stringify(right));
  }

  return false;
}

/**
 * Safely evaluate regex pattern
 */
function performRegex(left, pattern) {
  if (typeof left !== "string" || typeof pattern !== "string") {
    return false;
  }

  try {
    const regex = new RegExp(pattern);
    return regex.test(left);
  } catch (err) {
    console.error(`Invalid regex pattern: ${pattern}`, err);
    return false;
  }
}

/**
 * Evaluate all rules in condition node
 * mode: "all" (AND logic) or "any" (OR logic)
 */
export function evaluateCondition(config, context) {
  const { mode = "all", rules = [] } = config;

  if (!rules || rules.length === 0) {
    console.warn("Condition has no rules, defaulting to false");
    return false;
  }

  if (mode === "all") {
    // All rules must be true (AND)
    return rules.every((rule) => {
      try {
        return evaluateRule(rule, context);
      } catch (err) {
        console.error("Error evaluating rule:", rule, err);
        return false;
      }
    });
  } else if (mode === "any") {
    // At least one rule must be true (OR)
    return rules.some((rule) => {
      try {
        return evaluateRule(rule, context);
      } catch (err) {
        console.error("Error evaluating rule:", rule, err);
        return false;
      }
    });
  }

  console.warn(`Unknown mode: ${mode}`);
  return false;
}

/**
 * Mask sensitive fields in rule for logging
 * Prevents logging passwords, tokens, etc.
 */
export function maskSensitiveFields(rule) {
  const sensitivePatterns = [
    "password",
    "token",
    "secret",
    "api_key",
    "apikey",
    "auth",
    "credential",
  ];

  const masked = { ...rule };
  const ruleStr = String(masked.left).toLowerCase();

  if (sensitivePatterns.some((p) => ruleStr.includes(p))) {
    masked.left = masked.left.replace(/{{.*}}/, "{{***}}");
    masked.right = "***";
  }

  return masked;
}

/**
 * Validate condition config
 * Returns { valid: boolean, error: string | null }
 */
export function validateConditionConfig(config) {
  if (!config) {
    return { valid: false, error: "Config is required" };
  }

  const { mode, rules } = config;

  // Validate mode
  if (!mode || !["all", "any"].includes(mode)) {
    return {
      valid: false,
      error: `Mode must be 'all' or 'any', got: ${mode}`,
    };
  }

  // Validate rules array
  if (!Array.isArray(rules) || rules.length === 0) {
    return { valid: false, error: "At least one rule is required" };
  }

  // Validate each rule
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (!rule.left || typeof rule.left !== "string") {
      return {
        valid: false,
        error: `Rule ${i}: 'left' must be a non-empty string`,
      };
    }

    if (!rule.operator) {
      return { valid: false, error: `Rule ${i}: 'operator' is required` };
    }

    const validOperators = [
      "eq",
      "neq",
      "gt",
      "gte",
      "lt",
      "lte",
      "contains",
      "not_contains",
      "starts_with",
      "ends_with",
      "exists",
      "not_exists",
      "regex",
    ];

    if (!validOperators.includes(rule.operator)) {
      return {
        valid: false,
        error: `Rule ${i}: Invalid operator '${rule.operator}'`,
      };
    }

    // For exists/not_exists, right value is optional
    if (!["exists", "not_exists"].includes(rule.operator)) {
      if (rule.right === undefined || rule.right === null) {
        return {
          valid: false,
          error: `Rule ${i}: 'right' is required for operator '${rule.operator}'`,
        };
      }
    }

    const validTypes = ["string", "number", "boolean", "json", "null"];
    if (rule.rightType && !validTypes.includes(rule.rightType)) {
      return {
        valid: false,
        error: `Rule ${i}: Invalid 'rightType' '${rule.rightType}'`,
      };
    }
  }

  return { valid: true, error: null };
}
