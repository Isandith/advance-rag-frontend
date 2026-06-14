const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  providers?: Provider[];
}

export interface ChatResponse {
  answer: string;
  session_id: string | null;
}

export interface Provider {
  id: string;
  name: string;
  profession: string;
  work_description: string;
  reliability_score: number;
  keywords: string[];
  domain: string;
}

export interface CreateProviderInput {
  name: string;
  profession: string;
  work_description: string;
  reliability_score: number;
  keywords: string[];
  domain: string;
}

export interface CreateProviderResponse {
  id: string;
  name: string;
  profession: string;
  domain: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let message = `Request failed with status ${res.status}`;
  let fieldErrors: Record<string, string> | undefined;

  try {
    const data = await res.json();
    if (res.status === 422 && Array.isArray(data?.detail)) {
      fieldErrors = {};
      for (const err of data.detail) {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : "field";
        fieldErrors[String(field)] = err.msg ?? "Invalid value";
      }
      message = "Validation failed";
    } else if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (typeof data?.message === "string") {
      message = data.message;
    }
  } catch {
    // response body wasn't JSON; fall back to default message
  }

  return new ApiError(message, res.status, fieldErrors);
}

export async function sendChatMessage(message: string, sessionId: string | null): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json();
}

export async function fetchProviders(): Promise<Provider[]> {
  const res = await fetch(`${API_BASE_URL}/providers/`);

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json();
}

export function findMentionedProviders(answer: string, providers: Provider[]): Provider[] {
  return providers.filter((provider) =>
    new RegExp(`\\b${provider.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(answer)
  );
}

export async function createProvider(input: CreateProviderInput): Promise<CreateProviderResponse> {
  const res = await fetch(`${API_BASE_URL}/providers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json();
}
