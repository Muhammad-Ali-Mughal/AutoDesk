export default async function scheduleHandler(action, context) {
  return {
    triggeredAt: new Date().toISOString(),
    source: context?._source || "schedule",
  };
}
