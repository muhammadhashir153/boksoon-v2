"use client";

import { ReactNode } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

declare global {
  interface Window {
    uiConfirm?: (message: string, title?: string) => Promise<boolean>;
    uiAlert?: (message: string, type?: string, title?: string) => Promise<unknown>;
  }
}

type DeleteButtonProps = {
  endpoint: string;
  className?: string;
  children?: ReactNode;
  confirmMessage?: string;
  failureMessage?: string;
  confirmTitle?: string;
};

export function DeleteButton({
  endpoint,
  className = "btn btn-danger btn-sm",
  children = "Delete",
  confirmMessage = "Are you sure you want to delete this record?",
  failureMessage = "Delete failed.",
  confirmTitle = "Please Confirm",
}: DeleteButtonProps) {
  return (
    <button
      className={className}
      type="button"
      onClick={async () => {
        const confirmed = window.uiConfirm
          ? await window.uiConfirm(confirmMessage, confirmTitle)
          : window.confirm(confirmMessage);

        if (!confirmed) {
          return;
        }

        const response = await fetch(endpoint, { method: "DELETE" });
        const payload = await readApiPayload(response);
        if (!payload.success) {
          const errorMessage = resolveResponseMessage(response, payload, failureMessage);
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
      {children}
    </button>
  );
}
