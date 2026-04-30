import { fetchPublicResource } from "@/lib/server/laravel";
import {inverse} from "next/dist/lib/picocolors";

export default async function VerifyCommentPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  let success = false;
  let message = "A verification token is required.";

  if (token) {
    try {
      await fetchPublicResource(`comments/verify/${token}`);
      success = true;
      message = "Your comment has been verified.";
    } catch (error) {
      message = error instanceof Error ? error.message : "Verification failed.";
    }
  }

  return (
    <main style={{ width: "min(100%, 560px)", margin: 24, padding: 32, borderRadius: 18, background: "#fff", boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)", textAlign: "center" }}>
      <img src="/assets/img/logo/logo.png" alt="NGO logo" style={{ display: "block", margin: "0 auto 20px", maxWidth: 160, filter: "invert(0) brightness(0%)"  }} />
      <h1 style={{ margin: "0 0 12px", fontSize: "1.6rem", lineHeight: 1.2, color: success ? "#0f9d58" : "#d92d20" }}>
        {success ? "Comment Verified" : "Verification Error"}
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: "1rem", lineHeight: 1.6, color: "#4b5563" }}>{message}</p>
      <a href="/" style={{ display: "inline-block", padding: "12px 20px", borderRadius: 999, textDecoration: "none", background: "#2563eb", color: "#fff", fontWeight: 600 }}>
        Return to Home
      </a>
    </main>
  );
}
