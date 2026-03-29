import fs from "fs";
import path from "path";

export interface Transaction {
  items: string[];
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
  conviction: number;
  antecedentSupport: number;
  consequentSupport: number;
}

export interface ItemFrequency {
  item: string;
  count: number;
  support: number;
}

export interface DataStats {
  totalTransactions: number;
  totalItems: number;
  itemFrequencies: ItemFrequency[];
  avgItemsPerTransaction: number;
}

function findCsvPath(): string {
  const candidates = [
    path.join(process.cwd(), "artifacts/api-server/src/data/basket_data.csv"),
    path.join(process.cwd(), "src/data/basket_data.csv"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`basket_data.csv not found. Tried:\n${candidates.join("\n")}`);
}

function loadTransactions(): Transaction[] {
  const csvPath = findCsvPath();
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.trim().split("\n");
  const header = lines[0].split(",");
  const itemNames = header.slice(1);

  const transactions: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    const items: string[] = [];
    for (let j = 1; j < row.length; j++) {
      if (row[j]?.trim().toUpperCase() === "TRUE") {
        items.push(itemNames[j - 1].trim());
      }
    }
    if (items.length > 0) {
      transactions.push({ items });
    }
  }
  return transactions;
}

function getFrequentItemsets(
  transactions: Transaction[],
  minSupport: number
): Map<string, number> {
  const n = transactions.length;
  const minCount = Math.ceil(minSupport * n);
  const frequentSets = new Map<string, number>();

  const itemCounts = new Map<string, number>();
  for (const t of transactions) {
    for (const item of t.items) {
      itemCounts.set(item, (itemCounts.get(item) ?? 0) + 1);
    }
  }

  const freq1: string[] = [];
  for (const [item, count] of itemCounts) {
    if (count >= minCount) {
      freq1.push(item);
      frequentSets.set(JSON.stringify([item].sort()), count);
    }
  }

  let prevLevel = freq1.map((i) => [i]);
  let k = 2;

  while (prevLevel.length > 0 && k <= 5) {
    const candidates = generateCandidates(prevLevel);
    const counts = new Map<string, number>();

    for (const t of transactions) {
      const itemSet = new Set(t.items);
      for (const candidate of candidates) {
        if (candidate.every((item) => itemSet.has(item))) {
          const key = JSON.stringify(candidate);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }

    const nextLevel: string[][] = [];
    for (const [key, count] of counts) {
      if (count >= minCount) {
        const items = JSON.parse(key) as string[];
        frequentSets.set(key, count);
        nextLevel.push(items);
      }
    }

    prevLevel = nextLevel;
    k++;
  }

  return frequentSets;
}

function generateCandidates(prevLevel: string[][]): string[][] {
  const candidates: string[][] = [];
  for (let i = 0; i < prevLevel.length; i++) {
    for (let j = i + 1; j < prevLevel.length; j++) {
      const a = prevLevel[i];
      const b = prevLevel[j];
      const prefix = a.slice(0, -1);
      const bPrefix = b.slice(0, -1);
      if (JSON.stringify(prefix) === JSON.stringify(bPrefix)) {
        const candidate = [...a, b[b.length - 1]].sort();
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}

function getSubsets(items: string[]): string[][] {
  const subsets: string[][] = [];
  const n = items.length;
  for (let i = 1; i < (1 << n) - 1; i++) {
    const subset: string[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) subset.push(items[j]);
    }
    subsets.push(subset);
  }
  return subsets;
}

export function mineAssociationRules(
  minSupport: number,
  minConfidence: number,
  topN: number
): { rules: AssociationRule[]; top3: AssociationRule[] } {
  const transactions = loadTransactions();
  const n = transactions.length;
  const frequentSets = getFrequentItemsets(transactions, minSupport);

  const rules: AssociationRule[] = [];

  for (const [key, count] of frequentSets) {
    const items = JSON.parse(key) as string[];
    if (items.length < 2) continue;

    const subsets = getSubsets(items);
    for (const antecedent of subsets) {
      const antKey = JSON.stringify(antecedent.slice().sort());
      const antCount = frequentSets.get(antKey);
      if (!antCount) continue;

      const consequent = items.filter((i) => !antecedent.includes(i)).sort();
      if (consequent.length === 0) continue;

      const consequentKey = JSON.stringify(consequent.slice().sort());
      const consequentCount = frequentSets.get(consequentKey);
      if (!consequentCount) continue;

      const support = count / n;
      const antecedentSupport = antCount / n;
      const consequentSupport = consequentCount / n;
      const confidence = support / antecedentSupport;

      if (confidence < minConfidence) continue;

      const lift = confidence / consequentSupport;
      const conviction =
        consequentSupport === 1
          ? Infinity
          : (1 - consequentSupport) / (1 - confidence);

      rules.push({
        antecedent,
        consequent,
        support: Math.round(support * 10000) / 10000,
        confidence: Math.round(confidence * 10000) / 10000,
        lift: Math.round(lift * 10000) / 10000,
        conviction:
          conviction === Infinity
            ? 999
            : Math.round(conviction * 10000) / 10000,
        antecedentSupport: Math.round(antecedentSupport * 10000) / 10000,
        consequentSupport: Math.round(consequentSupport * 10000) / 10000,
      });
    }
  }

  rules.sort((a, b) => b.lift - a.lift);

  const top3 = rules.slice(0, 3);
  const topNRules = rules.slice(0, topN);

  return { rules: topNRules, top3 };
}

export interface RecommendedProduct {
  product: string;
  confidence: number;
  lift: number;
  support: number;
  triggeringRules: number;
}

export interface RecommendationResponse {
  product: string;
  recommendations: RecommendedProduct[];
  rulesUsed: number;
  allItems: string[];
}

export function recommendProducts(
  product: string,
  minSupport: number,
  minConfidence: number
): RecommendationResponse {
  const transactions = loadTransactions();

  // Collect all unique items
  const allItemsSet = new Set<string>();
  for (const t of transactions) {
    for (const item of t.items) allItemsSet.add(item);
  }
  const allItems = Array.from(allItemsSet).sort();

  const { rules } = mineAssociationRules(minSupport, minConfidence, 200);

  // Python-equivalent logic:
  // for rule in rules:
  //   if product in rule.antecedent:
  //     recommendations.update(rule.consequent)
  const productMap = new Map<string, { confidences: number[]; lifts: number[]; supports: number[] }>();

  let rulesUsed = 0;
  for (const rule of rules) {
    if (rule.antecedent.includes(product)) {
      rulesUsed++;
      for (const rec of rule.consequent) {
        if (rec === product) continue;
        const entry = productMap.get(rec) ?? { confidences: [], lifts: [], supports: [] };
        entry.confidences.push(rule.confidence);
        entry.lifts.push(rule.lift);
        entry.supports.push(rule.support);
        productMap.set(rec, entry);
      }
    }
  }

  const recommendations: RecommendedProduct[] = Array.from(productMap.entries())
    .map(([prod, stats]) => ({
      product: prod,
      confidence: Math.round((stats.confidences.reduce((a, b) => a + b, 0) / stats.confidences.length) * 10000) / 10000,
      lift: Math.round((stats.lifts.reduce((a, b) => a + b, 0) / stats.lifts.length) * 10000) / 10000,
      support: Math.round((stats.supports.reduce((a, b) => a + b, 0) / stats.supports.length) * 10000) / 10000,
      triggeringRules: stats.confidences.length,
    }))
    .sort((a, b) => b.lift - a.lift);

  return { product, recommendations, rulesUsed, allItems };
}

export function getDataStats(): DataStats {
  const transactions = loadTransactions();
  const n = transactions.length;

  const itemCounts = new Map<string, number>();
  let totalItemsInTransactions = 0;

  for (const t of transactions) {
    for (const item of t.items) {
      itemCounts.set(item, (itemCounts.get(item) ?? 0) + 1);
    }
    totalItemsInTransactions += t.items.length;
  }

  const itemFrequencies: ItemFrequency[] = Array.from(itemCounts.entries())
    .map(([item, count]) => ({
      item,
      count,
      support: Math.round((count / n) * 10000) / 10000,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTransactions: n,
    totalItems: itemCounts.size,
    itemFrequencies,
    avgItemsPerTransaction:
      Math.round((totalItemsInTransactions / n) * 100) / 100,
  };
}
