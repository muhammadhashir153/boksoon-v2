type ApiPayload = {
  success?: boolean;
  message?: string;
  errors?: Record<string, unknown>;
  data?: unknown;
  meta?: Record<string, unknown>;
};

function findFirstError(errors?: Record<string, unknown>) {
  if (!errors) {
    return "";
  }

  for (const value of Object.values(errors)) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (Array.isArray(value)) {
      const firstString = value.find((item) => typeof item === "string" && item.trim());
      if (typeof firstString === "string") {
        return firstString;
      }
    }
  }

  return "";
}

export async function readApiPayload(response: Response): Promise<ApiPayload> {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: response.ok ? "Request completed." : "Request failed."
    };
  }
}

export function resolveResponseMessage(
  response: Response,
  payload: ApiPayload,
  fallbackMessage: string,
  options?: {
    tooManyRequestsMessage?: string;
    validationMessage?: string;
    unauthorizedMessage?: string;
    forbiddenMessage?: string;
  }
) {
  if (payload.message) {
    return payload.message;
  }

  if (response.status === 429) {
    return options?.tooManyRequestsMessage || "Too many attempts. Please wait a moment and try again.";
  }

  if (response.status === 422) {
    return findFirstError(payload.errors) || options?.validationMessage || "Please review the highlighted fields and try again.";
  }

  if (response.status === 401) {
    return options?.unauthorizedMessage || "Your session has expired. Please sign in again.";
  }

  if (response.status === 403) {
    return options?.forbiddenMessage || "You do not have permission to perform this action.";
  }

  return fallbackMessage;
}
