"use client";

import { FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

export function ContactForm() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("Sending...");

    const response = await fetch("/api/public/contacts", {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);
    setMessage(
      payload.success
        ? payload.message || "Message sent successfully."
        : resolveResponseMessage(response, payload, "Message failed to send.")
    );
    if (payload.success) {
      form.reset();
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="row g-4">
        <div className="col-lg-12">
          <div className="form-clt">
            <input type="text" name="name" placeholder="Your Name" />
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-clt">
            <input type="text" name="email" placeholder="Enter Your Email" />
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-clt">
            <input type="text" name="number" placeholder="Phone Number" />
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-clt">
            <textarea name="message" placeholder="Type your message" />
          </div>
        </div>
        <div className="col-lg-12">{message ? <div id="form_message">{message}</div> : null}</div>
        <div className="col-lg-6">
          <button type="submit" className="theme-btn">
            Get A Quote <i className="fa-solid fa-arrow-right-long" />
          </button>
        </div>
      </div>
    </form>
  );
}
