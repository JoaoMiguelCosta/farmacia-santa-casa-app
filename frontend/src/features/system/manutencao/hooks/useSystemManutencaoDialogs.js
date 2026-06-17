import { useState } from "react";

export function useSystemManutencaoDialogs({ runJob }) {
  const [pendingRunJobKey, setPendingRunJobKey] = useState(null);

  function handleRequestRun(jobKey) {
    setPendingRunJobKey(jobKey);
  }

  function handleCancelRun() {
    setPendingRunJobKey(null);
  }

  async function handleConfirmRun() {
    if (!pendingRunJobKey) return;

    await runJob(pendingRunJobKey);
    setPendingRunJobKey(null);
  }

  return {
    pendingRunJobKey,
    handleRequestRun,
    handleCancelRun,
    handleConfirmRun,
  };
}
