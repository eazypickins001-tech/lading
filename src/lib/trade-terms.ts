import type { SupabaseClient } from "@supabase/supabase-js";

export type ClearanceParty = "seller" | "buyer";
export type InsuranceRequirement = "none" | "seller_required";
export type RiskAppetite = "low" | "medium" | "high";

export type TradeTerm = {
  code: string;
  name: string;
  modeScope: string[];
  riskTransfer: string;
  exportClearance: ClearanceParty;
  mainCarriage: ClearanceParty;
  importClearance: ClearanceParty;
  insurance: InsuranceRequirement;
};

export type TradeTermInput = {
  mode: string;
  preferSellerControlsFreight: boolean;
  sellerProvidesInsurance: boolean;
  riskAppetite: RiskAppetite;
};

export type TradeTermRecommendation = {
  code: string;
  rationale: string;
};

type IncotermObligations = {
  risk_transfer?: string;
  export_clearance?: string;
  main_carriage?: string;
  import_clearance?: string;
  insurance?: string;
};

type IncotermRow = {
  code: string;
  name: string;
  mode_scope: string[] | null;
  obligations: IncotermObligations | null;
};

type SellerRisk = "minimal" | "low" | "medium" | "high" | "maximal";

type TermProfile = {
  code: string;
  seaOnly: boolean;
  mainCarriage: ClearanceParty;
  insurance: InsuranceRequirement;
  sellerRisk: SellerRisk;
};

const RISK_RANK: Record<SellerRisk, number> = {
  minimal: 0,
  low: 1,
  medium: 2,
  high: 3,
  maximal: 4,
};

const SEA_ORDER = [
  "FCA",
  "FOB",
  "CFR",
  "CIF",
  "FAS",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
  "EXW",
];

const GENERAL_ORDER = [
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
  "EXW",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
];

const TERM_PROFILES: TermProfile[] = [
  {
    code: "EXW",
    seaOnly: false,
    mainCarriage: "buyer",
    insurance: "none",
    sellerRisk: "minimal",
  },
  {
    code: "FCA",
    seaOnly: false,
    mainCarriage: "buyer",
    insurance: "none",
    sellerRisk: "low",
  },
  {
    code: "CPT",
    seaOnly: false,
    mainCarriage: "seller",
    insurance: "none",
    sellerRisk: "medium",
  },
  {
    code: "CIP",
    seaOnly: false,
    mainCarriage: "seller",
    insurance: "seller_required",
    sellerRisk: "medium",
  },
  {
    code: "DAP",
    seaOnly: false,
    mainCarriage: "seller",
    insurance: "none",
    sellerRisk: "high",
  },
  {
    code: "DPU",
    seaOnly: false,
    mainCarriage: "seller",
    insurance: "none",
    sellerRisk: "high",
  },
  {
    code: "DDP",
    seaOnly: false,
    mainCarriage: "seller",
    insurance: "none",
    sellerRisk: "maximal",
  },
  {
    code: "FAS",
    seaOnly: true,
    mainCarriage: "buyer",
    insurance: "none",
    sellerRisk: "low",
  },
  {
    code: "FOB",
    seaOnly: true,
    mainCarriage: "buyer",
    insurance: "none",
    sellerRisk: "medium",
  },
  {
    code: "CFR",
    seaOnly: true,
    mainCarriage: "seller",
    insurance: "none",
    sellerRisk: "medium",
  },
  {
    code: "CIF",
    seaOnly: true,
    mainCarriage: "seller",
    insurance: "seller_required",
    sellerRisk: "medium",
  },
];

function toClearance(value: string | undefined): ClearanceParty {
  return value === "seller" ? "seller" : "buyer";
}

function toInsurance(value: string | undefined): InsuranceRequirement {
  return value === "seller_required" ? "seller_required" : "none";
}

export async function getTradeTerms(
  client?: SupabaseClient,
): Promise<TradeTerm[]> {
  const supabase =
    client ?? (await (await import("@/lib/supabase/server")).createClient());
  const { data, error } = await supabase
    .from("incoterms")
    .select("code, name, mode_scope, obligations")
    .order("code", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as IncotermRow[]).map((row) => {
    const obligations = row.obligations ?? {};
    return {
      code: row.code,
      name: row.name,
      modeScope: row.mode_scope ?? [],
      riskTransfer: obligations.risk_transfer ?? "",
      exportClearance: toClearance(obligations.export_clearance),
      mainCarriage: toClearance(obligations.main_carriage),
      importClearance: toClearance(obligations.import_clearance),
      insurance: toInsurance(obligations.insurance),
    };
  });
}

function riskAdjustment(
  risk: SellerRisk,
  appetite: RiskAppetite,
): { score: number; reason: string | null } {
  const rank = RISK_RANK[risk];
  if (appetite === "low") {
    return {
      score: 2 - rank,
      reason:
        rank <= 1 ? "it keeps the seller's exposure to a minimum" : null,
    };
  }
  if (appetite === "high") {
    return {
      score: rank - 2,
      reason:
        rank >= 3
          ? "the seller carries the goods through to the destination"
          : null,
    };
  }
  return {
    score: 2 - Math.abs(rank - 2),
    reason: rank === 2 ? "risk passes at a balanced handover point" : null,
  };
}

export function recommendTradeTerm(
  input: TradeTermInput,
): TradeTermRecommendation[] {
  const isSea =
    input.mode === "sea" ||
    input.mode === "inland_waterway" ||
    input.mode === "multimodal";
  const order = isSea ? SEA_ORDER : GENERAL_ORDER;
  const profiles = TERM_PROFILES.filter((profile) => isSea || !profile.seaOnly);

  const scored = profiles.map((profile) => {
    let score = 0;
    const reasons: string[] = [];

    if (input.preferSellerControlsFreight) {
      if (profile.mainCarriage === "seller") {
        score += 3;
        reasons.push("the seller arranges and pays the main carriage");
      } else {
        score -= 1;
      }
    } else if (profile.mainCarriage === "buyer") {
      score += 1;
      reasons.push("the buyer keeps control of the main carriage");
    }

    if (input.sellerProvidesInsurance) {
      if (profile.insurance === "seller_required") {
        score += 2;
        reasons.push("the seller provides cargo insurance cover");
      }
    } else if (profile.insurance === "none") {
      score += 1;
    }

    const risk = riskAdjustment(profile.sellerRisk, input.riskAppetite);
    score += risk.score;
    if (risk.reason) {
      reasons.push(risk.reason);
    }

    if (profile.seaOnly) {
      score += 1;
      reasons.push("it is built for sea and inland waterway movements");
    } else if (!isSea) {
      score += 1;
      reasons.push("it works for air, road, rail and courier movements");
    }

    return {
      code: profile.code,
      score,
      order: order.indexOf(profile.code),
      reasons,
    };
  });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.order - b.order;
    })
    .slice(0, 3)
    .map((entry) => ({
      code: entry.code,
      rationale:
        entry.reasons.length > 0
          ? `${entry.code} suits this movement because ${entry.reasons.join(", ")}.`
          : `${entry.code} is a balanced default for this movement.`,
    }));
}

export function clauseSnippet(term: TradeTerm, place: string): string {
  const cleanPlace = place.trim() === "" ? "[place]" : place.trim();
  return `${term.code} ${cleanPlace}, Incoterms 2020.`;
}
