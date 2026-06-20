const parseActivityPayload = (log) => {
  try {
    const parsed = JSON.parse(log?.activity);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const parseLogEntry = (log) => {
  let activityName = log?.activity || "-";
  let timestamp = log?.timestamp;
  const payload = parseActivityPayload(log);

  if (payload) {
    activityName =
      payload.activity ||
      payload.name ||
      payload.action ||
      payload.event ||
      payload.type ||
      payload.title ||
      payload.template ||
      log?.template ||
      Object.values(payload).find((value) => typeof value === "string" && !value.includes("T")) ||
      activityName;

    if (!timestamp) timestamp = payload.timestamp || payload.time;
  }

  return { activityName: String(activityName), timestamp, payload };
};
