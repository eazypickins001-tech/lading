export type TradeChannel = "import" | "export";

export type TransportMode =
  | "sea"
  | "air"
  | "road"
  | "rail"
  | "courier"
  | "multimodal";

export type ShipmentStatus =
  | "draft"
  | "documents_pending"
  | "ready"
  | "submitted"
  | "cleared"
  | "closed"
  | "cancelled";

export type DocType =
  | "commercial_invoice"
  | "packing_list"
  | "proforma_invoice"
  | "certificate_of_origin"
  | "bill_of_lading"
  | "airway_bill"
  | "form_m"
  | "paar"
  | "soncap"
  | "nafdac_permit"
  | "nepc_certificate"
  | "phytosanitary"
  | "insurance_certificate"
  | "other";

export type DocumentParty = {
  name: string;
  address: string | null;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  taxId: string | null;
};

export type DocumentLineItem = {
  description: string;
  hsCode: string | null;
  quantity: number;
  unit: string;
  unitValue: number;
  netWeightKg: number | null;
  grossWeightKg: number | null;
};

export type ShipmentDocumentPayload = {
  reference: string | null;
  channel: TradeChannel;
  originCountry: string;
  destinationCountry: string;
  mode: TransportMode;
  incoterm: string | null;
  incotermName: string | null;
  incotermPlace: string | null;
  currency: string;
  status: ShipmentStatus;
  createdAt: string;
  organization: { name: string; country: string | null };
  exporter: DocumentParty | null;
  consignee: DocumentParty | null;
  notify: DocumentParty | null;
  items: DocumentLineItem[];
};
