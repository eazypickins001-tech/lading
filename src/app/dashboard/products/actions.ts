"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { ImportSummary } from "@/lib/parties";
import {
  deleteProduct,
  importProductsCsv,
  upsertProduct,
} from "@/lib/products";

export type SaveProductState =
  | {
      status: "success" | "error";
      message: string;
      fieldErrors?: Record<string, string>;
    }
  | undefined;

export type ImportProductsState =
  | {
      status: "success" | "error";
      message: string;
      summary?: ImportSummary;
    }
  | undefined;

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function saveProductAction(
  state: SaveProductState,
  formData: FormData,
): Promise<SaveProductState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = text(formData, "id") || null;
  const description = text(formData, "description");

  if (!description) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: { description: "Description is required." },
    };
  }

  try {
    await upsertProduct({
      id,
      description,
      hsCode: text(formData, "hsCode") || null,
    });
  } catch {
    return {
      status: "error",
      message: "We could not save this product. Please try again.",
    };
  }

  revalidatePath("/dashboard/products");
  return { status: "success", message: "Product saved." };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = text(formData, "id");
  if (id) {
    try {
      await deleteProduct(id);
    } catch {
      return;
    }
  }

  revalidatePath("/dashboard/products");
}

export async function importProductsAction(
  state: ImportProductsState,
  formData: FormData,
): Promise<ImportProductsState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const csv = String(formData.get("csv") ?? "");
  if (!csv.trim()) {
    return { status: "error", message: "Paste some CSV rows first." };
  }

  try {
    const summary = await importProductsCsv(csv);
    revalidatePath("/dashboard/products");
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
