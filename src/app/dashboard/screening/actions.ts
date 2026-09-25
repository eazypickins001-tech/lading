"use server";

import { getCurrentUser } from "@/lib/auth";
import { screenName, type ScreeningMatch } from "@/lib/screening";

export type ScreenNameState =
  | {
      status: "success" | "error";
      matches: ScreeningMatch[];
      query: string;
      message?: string;
    }
  | undefined;

export async function screenNameAction(
  _state: ScreenNameState,
  formData: FormData,
): Promise<ScreenNameState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      status: "error",
      matches: [],
      query: "",
      message: "Please sign in to screen a name.",
    };
  }

  const query = String(formData.get("name") ?? "").trim();
  if (query.length < 2) {
    return {
      status: "error",
      matches: [],
      query,
      message: "Enter at least two characters.",
    };
  }

  const matches = await screenName(query);
  return { status: "success", matches, query };
}
