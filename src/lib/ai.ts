const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const REQUEST_TIMEOUT_MS = 30000;

const FALLBACK_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "liquid/lfm-2.5-2.6b:free",
];

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  validate?: (content: string) => boolean;
};

export function aiModel(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

async function singleChat(
  messages: ChatMessage[],
  options: ChatOptions,
  model: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AI is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return data.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timeout);
  }
}

export async function chatComplete(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const primary = options.model ?? aiModel();
  const chain = [
    primary,
    ...FALLBACK_MODELS.filter((model) => model !== primary),
  ];

  let lastError: unknown = null;

  for (const model of chain) {
    try {
      const content = await singleChat(messages, options, model);
      if (
        content.length > 0 &&
        (!options.validate || options.validate(content))
      ) {
        return content;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return "";
}
