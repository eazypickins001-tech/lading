"use server";

import { getCurrentUser } from "@/lib/auth";
import { suggestHsCodes, type HsSuggestion } from "@/lib/hs-suggest";
import { allowRequest } from "@/lib/rate-limit";

export type HsSuggestState =
  | {
      status: "success" | "error";
      message?: string;
      suggestions?: HsSuggestion[];
    }
  | undefined;

export async function suggestHsAction(
  state: HsSuggestState,
  formData: FormData,
): Promise<HsSuggestState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Please sign in to use the assistant." };
  }

  const allowed = await allowRequest(`ai:${user.id}`, 30, 3600);
  if (!allowed) {
    return {
      status: "error",
      message: "Too many requests. Please try again later.",
    };
  }

  const description = String(formData.get("description") ?? "").trim();
  const destination =
    String(formData.get("destination") ?? "NG").trim().toUpperCase() || "NG";

  if (description.length < 3) {
    return { status: "error", message: "Enter a short product description first." };
  }

  try {
    const suggestions = await suggestHsCodes(description, destination);
    if (suggestions.length === 0) {
      return {
        status: "error",
        message: "No suggestions found. Try a more specific description.",
      };
    }
    return { status: "success", suggestions };
  } catch {
    return {
      status: "error",
      message: "The AI assistant is unavailable right now. Please try again.",
    };
  }
}
