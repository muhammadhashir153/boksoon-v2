"use client";

type LogoutButtonProps = {
  className?: string;
  iconClassName?: string;
};

export function LogoutButton({ className = "pc-link", iconClassName = "ti ti-logout" }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      <span className="pc-micon"><i className={iconClassName} /></span>
      <span className="pc-mtext">Logout</span>
    </button>
  );
}
