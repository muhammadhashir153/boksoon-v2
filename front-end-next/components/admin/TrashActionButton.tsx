"use client";

import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

declare global {
  interface Window {
    uiConfirm?: (message: string, title?: string) => Promise<boolean>;
    uiAlert?: (message: string, type?: string, title?: string) => Promise<unknown>;
  }
}

type TrashActionButtonProps = {
  endpoint: string;
  method?: "POST" | "DELETE";
  className?: string;
  confirmMessage?: string;
  confirmTitle?: string;
  label: string;
};

export function TrashActionButton({
  endpoint,
  method = "POST",
  className = "btn btn-sm btn-outline-secondary",
  confirmMessage,
  confirmTitle = "Please Confirm",
  label,
}: TrashActionButtonProps) {
  return (
    <button
      className={className}
      type="button"
      onClick={async () => {
        if (confirmMessage) {
          const confirmed = window.uiConfirm
            ? await window.uiConfirm(confirmMessage, confirmTitle)
            : window.confirm(confirmMessage);

          if (!confirmed) {
            return;
          }
        }

        const response = await fetch(endpoint, { method });
        const payload = await readApiPayload(response);

        if (!payload.success) {
          const errorMessage = resolveResponseMessage(response, payload, "Action failed.");
          if (window.uiAlert) {
            await window.uiAlert(errorMessage, "error", "Action Failed");
          } else {
            window.alert(errorMessage);
          }
          return;
        }

        window.location.reload();
      }}
    >
      {label}
    </button>
  );
}
