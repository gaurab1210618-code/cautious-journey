import { Router, type IRouter } from "express";
import { mineAssociationRules, getDataStats } from "../lib/apriori.js";

const router: IRouter = Router();

router.get("/rules", (req, res) => {
  try {
    const minSupport = parseFloat(String(req.query.minSupport ?? "0.1"));
    const minConfidence = parseFloat(String(req.query.minConfidence ?? "0.5"));
    const topN = parseInt(String(req.query.topN ?? "20"), 10);

    const validMinSupport = Math.max(0.01, Math.min(1.0, isNaN(minSupport) ? 0.1 : minSupport));
    const validMinConfidence = Math.max(0.01, Math.min(1.0, isNaN(minConfidence) ? 0.5 : minConfidence));
    const validTopN = Math.max(1, Math.min(200, isNaN(topN) ? 20 : topN));

    const { rules, top3 } = mineAssociationRules(validMinSupport, validMinConfidence, validTopN);

    res.json({
      rules,
      top3,
      totalRules: rules.length,
      parameters: {
        minSupport: validMinSupport,
        minConfidence: validMinConfidence,
      },
    });
  } catch (err) {
    console.error("Error mining association rules:", err);
    res.status(500).json({ error: "Failed to mine association rules" });
  }
});

router.get("/stats", (_req, res) => {
  try {
    const stats = getDataStats();
    res.json(stats);
  } catch (err) {
    console.error("Error getting stats:", err);
    res.status(500).json({ error: "Failed to get data stats" });
  }
});

export default router;
