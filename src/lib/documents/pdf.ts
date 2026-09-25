import {
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  StandardFonts,
  rgb,
  type RGB,
} from "pdf-lib";
import type { DocumentBranding, DocumentLineItem } from "./types";

export const BRAND = {
  deepHarbor: rgb(11 / 255, 31 / 255, 51 / 255),
  signalTeal: rgb(14 / 255, 159 / 255, 142 / 255),
  ink: rgb(31 / 255, 41 / 255, 55 / 255),
  muted: rgb(100 / 255, 116 / 255, 139 / 255),
  hairline: rgb(226 / 255, 232 / 255, 240 / 255),
  white: rgb(1, 1, 1),
  cloud: rgb(245 / 255, 247 / 255, 250 / 255),
  amber: rgb(242 / 255, 169 / 255, 59 / 255),
  amberTint: rgb(1, 0.96, 0.87),
} satisfies Record<string, RGB>;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FOOTER_Y = 36;

export type TableColumn = {
  key: string;
  label: string;
  width: number;
  align?: "left" | "right";
};

export type TableRow = Record<string, string>;

export type KeyValue = { label: string; value: string };

export type PartyBlock = { title: string; lines: string[] };

export function formatNumber(value: number, maximumFractionDigits = 3): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

export function formatMoney(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function lineAmount(item: DocumentLineItem): number {
  return item.quantity * item.unitValue;
}

export function sumAmount(items: DocumentLineItem[]): number {
  return items.reduce((total, item) => total + lineAmount(item), 0);
}

function sanitize(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x00-\xFF]/g, "?");
}

type BrandingImages = {
  logo: PDFImage | null;
  signature: PDFImage | null;
  seal: PDFImage | null;
};

const NO_BRANDING: BrandingImages = {
  logo: null,
  signature: null,
  seal: null,
};

async function embedBrandingImage(
  doc: PDFDocument,
  url: string | null,
): Promise<PDFImage | null> {
  if (!url) {
    return null;
  }
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < 4) {
      return null;
    }
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (isPng) {
      return await doc.embedPng(bytes);
    }
    if (isJpg) {
      return await doc.embedJpg(bytes);
    }
    return null;
  } catch {
    return null;
  }
}

async function embedBranding(
  doc: PDFDocument,
  branding: DocumentBranding | undefined,
): Promise<BrandingImages> {
  if (!branding) {
    return NO_BRANDING;
  }
  return {
    logo: await embedBrandingImage(doc, branding.logoUrl),
    signature: await embedBrandingImage(doc, branding.signatureUrl),
    seal: await embedBrandingImage(doc, branding.sealUrl),
  };
}

export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [""];
  }
  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

export class PdfLayout {
  private readonly doc: PDFDocument;
  private readonly regular: PDFFont;
  private readonly bold: PDFFont;
  private readonly title: string;
  private readonly generatedAt: Date;
  private readonly branding: BrandingImages;
  private readonly contentWidth = PAGE_WIDTH - MARGIN * 2;
  private page: PDFPage;
  private cursorY: number;

  private constructor(
    doc: PDFDocument,
    regular: PDFFont,
    bold: PDFFont,
    title: string,
    generatedAt: Date,
    branding: BrandingImages,
  ) {
    this.doc = doc;
    this.regular = regular;
    this.bold = bold;
    this.title = title;
    this.generatedAt = generatedAt;
    this.branding = branding;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.drawHeader();
    this.cursorY = PAGE_HEIGHT - 132;
  }

  static async create(
    title: string,
    branding?: DocumentBranding,
  ): Promise<PdfLayout> {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const images = await embedBranding(doc, branding);
    return new PdfLayout(doc, regular, bold, title, new Date(), images);
  }

  private drawHeader(): void {
    const top = PAGE_HEIGHT;
    this.page.drawRectangle({
      x: 0,
      y: top - 96,
      width: PAGE_WIDTH,
      height: 96,
      color: BRAND.deepHarbor,
    });
    this.page.drawRectangle({
      x: 0,
      y: top - 100,
      width: PAGE_WIDTH,
      height: 4,
      color: BRAND.signalTeal,
    });
    this.page.drawText("LADING", {
      x: MARGIN,
      y: top - 48,
      size: 20,
      font: this.bold,
      color: BRAND.white,
    });
    this.page.drawText("Trade documentation & compliance", {
      x: MARGIN,
      y: top - 68,
      size: 9,
      font: this.regular,
      color: rgb(0.78, 0.83, 0.88),
    });
    const label = sanitize(this.title);
    const labelWidth = this.bold.widthOfTextAtSize(label, 12);
    this.page.drawText(label, {
      x: PAGE_WIDTH - MARGIN - labelWidth,
      y: top - 50,
      size: 12,
      font: this.bold,
      color: BRAND.white,
    });
    if (this.branding.logo) {
      this.drawFittedImage(this.branding.logo, PAGE_WIDTH - MARGIN - 120, top - 76, 120, 22, true);
    }
  }

  private drawFittedImage(
    image: PDFImage,
    x: number,
    top: number,
    maxWidth: number,
    maxHeight: number,
    alignRight = false,
  ): void {
    const scale = Math.min(
      maxWidth / image.width,
      maxHeight / image.height,
      1,
    );
    const width = image.width * scale;
    const height = image.height * scale;
    const drawX = alignRight ? x + maxWidth - width : x;
    this.page.drawImage(image, {
      x: drawX,
      y: top - height,
      width,
      height,
    });
  }

  private drawBrandingSignature(): void {
    const { signature, seal } = this.branding;
    if (!signature && !seal) {
      return;
    }
    const blockHeight = 100;
    this.ensureSpace(blockHeight);
    const top = this.cursorY;
    this.page.drawText("Authorised signature", {
      x: MARGIN,
      y: top,
      size: 9,
      font: this.bold,
      color: BRAND.muted,
    });
    if (signature) {
      this.drawFittedImage(signature, MARGIN, top - 14, 170, 52);
    }
    if (seal) {
      this.drawFittedImage(seal, MARGIN + 200, top - 14, 90, 72);
    }
    this.cursorY = top - blockHeight;
  }

  private drawContinuationHeader(): void {
    const top = PAGE_HEIGHT;
    this.page.drawRectangle({
      x: 0,
      y: top - 56,
      width: PAGE_WIDTH,
      height: 56,
      color: BRAND.deepHarbor,
    });
    this.page.drawRectangle({
      x: 0,
      y: top - 60,
      width: PAGE_WIDTH,
      height: 4,
      color: BRAND.signalTeal,
    });
    this.page.drawText("LADING", {
      x: MARGIN,
      y: top - 34,
      size: 12,
      font: this.bold,
      color: BRAND.white,
    });
    const label = sanitize(this.title);
    const labelWidth = this.bold.widthOfTextAtSize(label, 10);
    this.page.drawText(label, {
      x: PAGE_WIDTH - MARGIN - labelWidth,
      y: top - 34,
      size: 10,
      font: this.bold,
      color: BRAND.white,
    });
  }

  private ensureSpace(height: number): void {
    if (this.cursorY - height < FOOTER_Y + 34) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.drawContinuationHeader();
      this.cursorY = PAGE_HEIGHT - 84;
    }
  }

  spacer(height: number): void {
    this.cursorY -= height;
  }

  titleBlock(meta: KeyValue[]): void {
    this.ensureSpace(64);
    this.page.drawText(sanitize(this.title.toUpperCase()), {
      x: MARGIN,
      y: this.cursorY - 18,
      size: 20,
      font: this.bold,
      color: BRAND.deepHarbor,
    });
    this.cursorY -= 34;
    const metaText = meta
      .map((entry) => `${entry.label}: ${entry.value}`)
      .join("     ");
    this.page.drawText(sanitize(metaText), {
      x: MARGIN,
      y: this.cursorY,
      size: 9,
      font: this.regular,
      color: BRAND.muted,
    });
    this.cursorY -= 14;
    this.page.drawLine({
      start: { x: MARGIN, y: this.cursorY },
      end: { x: MARGIN + this.contentWidth, y: this.cursorY },
      thickness: 1,
      color: BRAND.signalTeal,
    });
    this.cursorY -= 20;
  }

  notice(text: string): void {
    const lines = wrapText(sanitize(text), this.bold, 9, this.contentWidth - 20);
    const height = lines.length * 13 + 16;
    this.ensureSpace(height + 8);
    this.page.drawRectangle({
      x: MARGIN,
      y: this.cursorY - height,
      width: this.contentWidth,
      height,
      color: BRAND.amberTint,
      borderColor: BRAND.amber,
      borderWidth: 0.75,
    });
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN + 10,
        y: this.cursorY - 14 - index * 13,
        size: 9,
        font: this.bold,
        color: BRAND.ink,
      });
    });
    this.cursorY -= height + 14;
  }

  heading(text: string): void {
    this.ensureSpace(34);
    this.page.drawText(sanitize(text.toUpperCase()), {
      x: MARGIN,
      y: this.cursorY,
      size: 10,
      font: this.bold,
      color: BRAND.deepHarbor,
    });
    this.cursorY -= 6;
    this.page.drawLine({
      start: { x: MARGIN, y: this.cursorY },
      end: { x: MARGIN + this.contentWidth, y: this.cursorY },
      thickness: 1,
      color: BRAND.signalTeal,
    });
    this.cursorY -= 16;
  }

  keyValueSection(rows: KeyValue[]): void {
    const labelWidth = 140;
    const valueX = MARGIN + labelWidth;
    for (const row of rows) {
      const lines = wrapText(
        sanitize(row.value),
        this.regular,
        9,
        this.contentWidth - labelWidth,
      );
      const height = Math.max(lines.length, 1) * 13 + 6;
      this.ensureSpace(height);
      this.page.drawText(sanitize(row.label), {
        x: MARGIN,
        y: this.cursorY,
        size: 9,
        font: this.bold,
        color: BRAND.muted,
      });
      lines.forEach((line, index) => {
        this.page.drawText(line, {
          x: valueX,
          y: this.cursorY - index * 13,
          size: 9,
          font: this.regular,
          color: BRAND.ink,
        });
      });
      this.cursorY -= height;
    }
    this.cursorY -= 4;
  }

  partySection(blocks: PartyBlock[]): void {
    const gap = 24;
    const width = (this.contentWidth - gap * (blocks.length - 1)) / blocks.length;
    const prepared = blocks.map((block) => {
      const lines = block.lines.flatMap((line) =>
        wrapText(sanitize(line), this.regular, 9, width),
      );
      return { block, lines };
    });
    const maxHeight =
      Math.max(...prepared.map((item) => item.lines.length), 1) * 13 + 22;
    this.ensureSpace(maxHeight + 6);
    const startY = this.cursorY;
    prepared.forEach((item, index) => {
      const x = MARGIN + index * (width + gap);
      this.page.drawText(sanitize(item.block.title.toUpperCase()), {
        x,
        y: startY,
        size: 9,
        font: this.bold,
        color: BRAND.deepHarbor,
      });
      item.lines.forEach((line, lineIndex) => {
        this.page.drawText(line, {
          x,
          y: startY - 18 - lineIndex * 13,
          size: 9,
          font: this.regular,
          color: BRAND.ink,
        });
      });
    });
    this.cursorY = startY - maxHeight;
  }

  table(columns: TableColumn[], rows: TableRow[]): void {
    const totalWeight = columns.reduce((sum, column) => sum + column.width, 0);
    const widths = columns.map(
      (column) => (column.width / totalWeight) * this.contentWidth,
    );
    const fontSize = 9;
    const lineHeight = 12;
    const paddingX = 6;
    const paddingY = 6;
    const headerHeight = 22;

    this.ensureSpace(headerHeight + 40);
    this.page.drawRectangle({
      x: MARGIN,
      y: this.cursorY - headerHeight,
      width: this.contentWidth,
      height: headerHeight,
      color: BRAND.deepHarbor,
    });
    let x = MARGIN;
    columns.forEach((column, index) => {
      const label = sanitize(column.label);
      const textWidth = this.bold.widthOfTextAtSize(label, fontSize);
      const textX =
        column.align === "right"
          ? x + widths[index] - paddingX - textWidth
          : x + paddingX;
      this.page.drawText(label, {
        x: textX,
        y: this.cursorY - headerHeight + 8,
        size: fontSize,
        font: this.bold,
        color: BRAND.white,
      });
      x += widths[index];
    });
    this.cursorY -= headerHeight;

    rows.forEach((row, rowIndex) => {
      const cellLines = columns.map((column, index) =>
        wrapText(
          sanitize(row[column.key] ?? ""),
          this.regular,
          fontSize,
          widths[index] - paddingX * 2,
        ),
      );
      const lineCount = Math.max(...cellLines.map((lines) => lines.length), 1);
      const rowHeight = lineCount * lineHeight + paddingY * 2;

      this.ensureSpace(rowHeight);
      if (rowIndex % 2 === 1) {
        this.page.drawRectangle({
          x: MARGIN,
          y: this.cursorY - rowHeight,
          width: this.contentWidth,
          height: rowHeight,
          color: BRAND.cloud,
        });
      }
      x = MARGIN;
      columns.forEach((column, index) => {
        cellLines[index].forEach((line, lineIndex) => {
          const textWidth = this.regular.widthOfTextAtSize(line, fontSize);
          const textX =
            column.align === "right"
              ? x + widths[index] - paddingX - textWidth
              : x + paddingX;
          this.page.drawText(line, {
            x: textX,
            y: this.cursorY - paddingY - fontSize + 2 - lineIndex * lineHeight,
            size: fontSize,
            font: this.regular,
            color: BRAND.ink,
          });
        });
        x += widths[index];
      });
      this.cursorY -= rowHeight;
      this.page.drawLine({
        start: { x: MARGIN, y: this.cursorY },
        end: { x: MARGIN + this.contentWidth, y: this.cursorY },
        thickness: 0.5,
        color: BRAND.hairline,
      });
    });
    this.cursorY -= 6;
  }

  totals(rows: KeyValue[]): void {
    const width = 240;
    const x = MARGIN + this.contentWidth - width;
    this.ensureSpace(rows.length * 18 + 24);
    this.page.drawLine({
      start: { x, y: this.cursorY },
      end: { x: x + width, y: this.cursorY },
      thickness: 1,
      color: BRAND.deepHarbor,
    });
    this.cursorY -= 16;
    rows.forEach((row, index) => {
      const isLast = index === rows.length - 1;
      const font = isLast ? this.bold : this.regular;
      const size = isLast ? 11 : 9;
      const label = sanitize(row.label);
      const value = sanitize(row.value);
      this.page.drawText(label, {
        x,
        y: this.cursorY,
        size,
        font,
        color: isLast ? BRAND.deepHarbor : BRAND.muted,
      });
      const valueWidth = font.widthOfTextAtSize(value, size);
      this.page.drawText(value, {
        x: x + width - valueWidth,
        y: this.cursorY,
        size,
        font,
        color: isLast ? BRAND.deepHarbor : BRAND.ink,
      });
      this.cursorY -= isLast ? 22 : 16;
    });
  }

  async save(): Promise<Uint8Array> {
    this.drawBrandingSignature();
    const pages = this.doc.getPages();
    const generated = `Generated ${this.generatedAt
      .toISOString()
      .slice(0, 10)}`;
    const brandLine = "Lading - Every document, right the first time.";
    pages.forEach((page, index) => {
      page.drawLine({
        start: { x: MARGIN, y: FOOTER_Y + 14 },
        end: { x: PAGE_WIDTH - MARGIN, y: FOOTER_Y + 14 },
        thickness: 0.5,
        color: BRAND.hairline,
      });
      page.drawText(generated, {
        x: MARGIN,
        y: FOOTER_Y,
        size: 8,
        font: this.regular,
        color: BRAND.muted,
      });
      const brandWidth = this.regular.widthOfTextAtSize(brandLine, 8);
      page.drawText(brandLine, {
        x: (PAGE_WIDTH - brandWidth) / 2,
        y: FOOTER_Y,
        size: 8,
        font: this.regular,
        color: BRAND.muted,
      });
      const note = `Page ${index + 1} of ${pages.length}`;
      const noteWidth = this.regular.widthOfTextAtSize(note, 8);
      page.drawText(note, {
        x: PAGE_WIDTH - MARGIN - noteWidth,
        y: FOOTER_Y,
        size: 8,
        font: this.regular,
        color: BRAND.muted,
      });
    });
    return this.doc.save();
  }
}
