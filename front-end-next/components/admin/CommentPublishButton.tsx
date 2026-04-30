"use client";

declare global {
  interface Window {
    uiAlert?: (message: string, type?: string, title?: string) => Promise<unknown>;
  }
}

type CommentPublishButtonProps = {
  endpoint: string;
  nextPublishedState: boolean;
};

export function CommentPublishButton({ endpoint, nextPublishedState }: CommentPublishButtonProps) {
  const label = nextPublishedState ? "Publish" : "Unpublish";
  const className = nextPublishedState ? "btn btn-sm btn-outline-success" : "btn btn-sm btn-outline-warning";

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const response = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ is_published: nextPublishedState })
        });

        const payload = await response.json().catch(() => ({ success: false, message: "Status update failed." }));
        if (!payload.success) {
          if (window.uiAlert) {
            await window.uiAlert(payload.message || "Status update failed.", "error", "Action Failed");
          } else {
            window.alert(payload.message || "Status update failed.");
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
