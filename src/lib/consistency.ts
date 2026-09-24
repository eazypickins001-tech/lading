import type { ShipmentItem, ShipmentWithItems } from "@/lib/shipments";

export type FindingSeverity = "info" | "warning" | "error" | "critical";

export type ConsistencyFinding = {
  code: string;
  severity: FindingSeverity;
  field: string | null;
  docsInvolved: string[];
  message: string;
};

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
};

const SEA_INCOTERMS = new Set(["FAS", "FOB", "CFR", "CIF"]);
const NON_SEA_MODES = new Set(["air", "road", "rail", "courier"]);

const MODE_LABELS: Record<string, string> = {
  air: "air",
  road: "road",
  rail: "rail",
  courier: "courier",
};

function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}

function normalizeHsCode(value: string): string {
  return value.replace(/[\s.]/g, "");
}

function normalizeDescription(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isValidHsCode(value: string): boolean {
  return /^\d{6,}$/.test(normalizeHsCode(value));
}

function lineLabel(index: number, description: string): string {
  const trimmed = description.trim();
  return trimmed.length > 0
    ? `Line ${index + 1} (${trimmed})`
    : `Line ${index + 1}`;
}

function itemFindings(
  item: ShipmentItem,
  index: number,
  shipmentCurrency: string,
): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];
  const label = lineLabel(index, item.description);
  const hsCode = item.hs_code;

  if (hsCode === null || hsCode.trim().length === 0) {
    findings.push({
      code: "missing_hs_code",
      severity: "warning",
      field: "hs_code",
      docsInvolved: [],
      message: `${label} has no HS code.`,
    });
  } else if (!isValidHsCode(hsCode)) {
    findings.push({
      code: "invalid_hs_code",
      severity: "warning",
      field: "hs_code",
      docsInvolved: [],
      message: `${label} has an invalid HS code "${hsCode.trim()}".`,
    });
  }

  if (!(item.quantity > 0)) {
    findings.push({
      code: "non_positive_quantity",
      severity: "error",
      field: "quantity",
      docsInvolved: [],
      message: `${label} has a non-positive quantity.`,
    });
  }

  if (!(item.unit_value > 0)) {
    findings.push({
      code: "non_positive_value",
      severity: "error",
      field: "unit_value",
      docsInvolved: [],
      message: `${label} has a non-positive unit value.`,
    });
  }

  if (item.gross_weight_kg === null) {
    findings.push({
      code: "missing_gross_weight",
      severity: "info",
      field: "gross_weight_kg",
      docsInvolved: [],
      message: `${label} has no gross weight.`,
    });
  }

  if (
    !isEmpty(item.currency) &&
    item.currency.trim().toUpperCase() !== shipmentCurrency.trim().toUpperCase()
  ) {
    findings.push({
      code: "currency_mismatch",
      severity: "warning",
      field: "currency",
      docsInvolved: [],
      message: `${label} is priced in ${item.currency
        .trim()
        .toUpperCase()}, but the shipment currency is ${shipmentCurrency
        .trim()
        .toUpperCase()}.`,
    });
  }

  return findings;
}

function duplicateFindings(items: ShipmentItem[]): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];
  const seen = new Map<string, number>();

  items.forEach((item, index) => {
    const description = normalizeDescription(item.description);
    const hsCode = normalizeHsCode(item.hs_code ?? "").toLowerCase();
    if (description.length === 0 && hsCode.length === 0) {
      return;
    }
    const key = `${description}|${hsCode}`;
    const firstIndex = seen.get(key);
    if (firstIndex === undefined) {
      seen.set(key, index);
      return;
    }
    findings.push({
      code: "duplicate_line",
      severity: "info",
      field: null,
      docsInvolved: [],
      message: `${lineLabel(index, item.description)} duplicates ${lineLabel(
        firstIndex,
        items[firstIndex].description,
      )}.`,
    });
  });

  return findings;
}

export function runConsistencyChecks(
  shipment: ShipmentWithItems,
): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = [];

  if (isEmpty(shipment.origin_country) || isEmpty(shipment.destination_country)) {
    findings.push({
      code: "missing_route",
      severity: "error",
      field: "origin_country",
      docsInvolved: [],
      message: "The shipment is missing its origin or destination country.",
    });
  }

  if (isEmpty(shipment.reference)) {
    findings.push({
      code: "missing_reference",
      severity: "info",
      field: "reference",
      docsInvolved: [],
      message: "The shipment has no reference.",
    });
  }

  if (shipment.exporter === null) {
    findings.push({
      code: "missing_exporter",
      severity: "warning",
      field: "exporter",
      docsInvolved: [],
      message: "The shipment has no exporter.",
    });
  }

  if (shipment.consignee === null) {
    findings.push({
      code: "missing_consignee",
      severity: "warning",
      field: "consignee",
      docsInvolved: [],
      message: "The shipment has no consignee.",
    });
  }

  const incoterm = shipment.incoterm?.trim().toUpperCase() ?? "";
  if (incoterm.length === 0) {
    findings.push({
      code: "missing_incoterm",
      severity: "warning",
      field: "incoterm",
      docsInvolved: [],
      message: "The shipment has no Incoterm.",
    });
  } else {
    if (isEmpty(shipment.incoterm_place)) {
      findings.push({
        code: "incoterm_place_missing",
        severity: "info",
        field: "incoterm_place",
        docsInvolved: [],
        message: `Incoterm ${incoterm} is set, but no place is given.`,
      });
    }
    if (SEA_INCOTERMS.has(incoterm) && NON_SEA_MODES.has(shipment.mode)) {
      findings.push({
        code: "incoterm_mode_mismatch",
        severity: "error",
        field: "incoterm",
        docsInvolved: [],
        message: `Incoterm ${incoterm} is for sea and inland waterway transport, but this shipment moves by ${
          MODE_LABELS[shipment.mode] ?? shipment.mode
        }.`,
      });
    }
  }

  shipment.items.forEach((item, index) => {
    findings.push(...itemFindings(item, index, shipment.currency));
  });
  findings.push(...duplicateFindings(shipment.items));

  return findings.sort((a, b) => {
    if (SEVERITY_RANK[a.severity] !== SEVERITY_RANK[b.severity]) {
      return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    }
    return a.code.localeCompare(b.code);
  });
}
