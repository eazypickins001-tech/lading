export const PARTY_TYPES = [
  "exporter",
  "consignee",
  "notify",
  "agent",
  "bank",
  "carrier",
] as const;

export type PartyType = (typeof PARTY_TYPES)[number];

export type Party = {
  id: string;
  org_id: string;
  type: PartyType;
  name: string;
  address: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PartyInput = {
  id?: string | null;
  type: PartyType;
  name: string;
  address?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  taxId?: string | null;
};

export type ImportSummary = {
  created: number;
  updated: number;
  skipped: number;
};
