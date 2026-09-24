"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  PARTY_TYPES,
  deleteParty,
  importPartiesCsv,
  upsertParty,
  type ImportSummary,
  type PartyType,
} from "@/lib/parties";

export type SavePartyState =
  | {
      status: "success" | "error";
      message: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

export type ImportPartiesState =
  | {
      status: "success" | "error";
      message: string;
      summary?: ImportSummary;
    }
  | undefined;

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function toPartyType(value: string): PartyType | null {
  return (PARTY_TYPES as readonly string[]).includes(value)
    ? (value as PartyType)
    : null;
}

export async function savePartyAction(
  state: SavePartyState,
  formData: FormData,
): Promise<SavePartyState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = text(formData, "id") || null;
  const type = toPartyType(text(formData, "type"));
  const name = text(formData, "name");

  const fieldErrors: Record<string, string> = {};
  if (!type) {
    fieldErrors.type = "Choose a valid party type.";
  }
  if (!name) {
    fieldErrors.name = "Name is required.";
  }
  if (!type || !name) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    await upsertParty({
      id,
      type,
      name,
      address: text(formData, "address") || null,
      country: text(formData, "country") || null,
      contactName: text(formData, "contactName") || null,
      contactEmail: text(formData, "contactEmail") || null,
      contactPhone: text(formData, "contactPhone") || null,
      taxId: text(formData, "taxId") || null,
    });
  } catch {
    return {
      status: "error",
      message: "We could not save this contact. Please try again.",
    };
  }

  revalidatePath("/dashboard/parties");
  return { status: "success", message: "Contact saved." };
}

export async function deletePartyAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = text(formData, "id");
  if (id) {
    try {
      await deleteParty(id);
    } catch {
      return;
    }
  }

  revalidatePath("/dashboard/parties");
}

export async function importPartiesAction(
  state: ImportPartiesState,
  formData: FormData,
): Promise<ImportPartiesState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const csv = String(formData.get("csv") ?? "");
  if (!csv.trim()) {
    return { status: "error", message: "Paste some CSV rows first." };
  }

  try {
    const summary = await importPartiesCsv(csv);
    revalidatePath("/dashboard/parties");
    return {
      status: "success",
      message: `Imported ${summary.created} new, updated ${summary.updated}, skipped ${summary.skipped}.`,
      summary,
    };
  } catch {
    return {
      status: "error",
      message: "We could not import the CSV. Please check the format.",
    };
  }
}
