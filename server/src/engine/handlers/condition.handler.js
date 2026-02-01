/**
 * 🔌 Condition Handler
 * Executes condition node and returns boolean result
 * Used by executeNode to determine which branch to follow
 */

import {
  evaluateCondition,
  maskSensitiveFields,
} from "../resolvers/conditionEvaluator.js";

export default async function conditionHandler(action, context, log = null) {
  try {
    // action.config contains { mode, rules[] }
    const { config = {} } = action;

    console.log(`🔀 Evaluating condition: ${action.config?.name || "Unnamed"}`);

    // Evaluate all rules based on mode (all/any)
    const result = evaluateCondition(config, context);

    console.log(`🔀 Condition result: ${result ? "TRUE" : "FALSE"}`);

    // Log evaluation with masked sensitive data
    if (log && log.executionSteps) {
      const lastStep = log.executionSteps[log.executionSteps.length - 1];
      if (lastStep) {
        lastStep.evaluation = {
          mode: config.mode,
          rulesCount: config.rules?.length || 0,
          maskedRules: (config.rules || []).map(maskSensitiveFields),
          result,
        };
      }
    }

    // Return result - will be used to pick true/false branch
    return {
      result,
      branchTaken: result ? "true" : "false",
      evaluatedAt: new Date().toISOString(),
      rulesEvaluated: config.rules?.length || 0,
    };
  } catch (err) {
    console.error("❌ Condition evaluation error:", err);
    throw new Error(`Condition evaluation failed: ${err.message}`);
  }
}
