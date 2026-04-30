"use client";

import { FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

export function NewsletterForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage("Submitting...");
    const response = await fetch("/api/public/newsletters", {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);
    setMessage(
      payload.success
        ? payload.message || "Subscribed successfully."
        : resolveResponseMessage(response, payload, "Subscription failed.")
    );
    if (payload.success) {
      form.reset();
    }
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="form-clt">
          <input type="text" name="email" placeholder="Enter Your Email" />
          <button type="submit" className="theme-btn">
            Subscribe Now
          </button>
        </div>
      </form>
      {message ? <p className="mt-3 mb-0">{message}</p> : null}
    </>
  );
}
