import { useState } from "react";
import { useGetAssociationRules, useGetDataStats } from "@workspace/api-client-react";

export function useAnalysisContext() {
  const [minSupport, setMinSupport] = useState<number>(0.05);
  const [minConfidence, setMinConfidence] = useState<number>(0.2);

  const rulesQuery = useGetAssociationRules({
    minSupport,
    minConfidence,
    topN: 50 // Fetch enough for scatter plot
  });

  const statsQuery = useGetDataStats();

  return {
    minSupport,
    setMinSupport,
    minConfidence,
    setMinConfidence,
    rulesQuery,
    statsQuery
  };
}
