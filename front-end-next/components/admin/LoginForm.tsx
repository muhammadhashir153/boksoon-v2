"use client";

import { FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

export function LoginForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const pass = String(formData.get("pass") || "");

    setMessage("Signing in...");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pass })
    });
    const payload = await readApiPayload(response);

    if (payload.success) {
      window.location.href = "/admin";
      return;
    }

    setMessage(resolveResponseMessage(response, payload, "Login failed."));
  }

  return (
    <form id="login" onSubmit={onSubmit}>
      <div className="form-group mb-3">
        <label className="form-label">Email Address</label>
        <input type="email" name="email" className="form-control" placeholder="Email Address" />
      </div>
      <div className="form-group mb-3">
        <label className="form-label">Password</label>
        <input type="password" name="pass" className="form-control" placeholder="Password" />
      </div>
      <div className="d-flex mt-1 justify-content-between">
        <div id="form-message">{message}</div>
      </div>
      <div className="d-grid mt-4">
        <button type="submit" className="btn btn-primary">Sign In</button>
      </div>
    </form>
  );
}
