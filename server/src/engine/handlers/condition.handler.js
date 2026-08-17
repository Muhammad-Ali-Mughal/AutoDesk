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
    const { config = {} } = action;

    console.log(`🔀 Evaluating condition: ${action.config?.name || "Unnamed"}`);

    const result = evaluateCondition(config, context);

    console.log(`🔀 Condition result: ${result ? "TRUE" : "FALSE"}`);

    const evaluation = {
      mode: config.mode,
      rulesCount: config.rules?.length || 0,
      maskedRules: (config.rules || []).map(maskSensitiveFields),
      result,
    };

    return {
      result,
      branchTaken: result ? "true" : "false",
      evaluatedAt: new Date().toISOString(),
      rulesEvaluated: config.rules?.length || 0,
      evaluation, // NEW — ab yeh return object ka hi part hai, log ko directly touch nahi kar raha
    };
  } catch (err) {
    console.error("❌ Condition evaluation error:", err);
    throw new Error(`Condition evaluation failed: ${err.message}`);
  }
}
