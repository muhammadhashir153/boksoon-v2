"use client";

import { FormEvent, useMemo, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";
import { Donation } from "@/lib/types";

type DonationFormProps = {
  donation: Donation;
};

export function DonationForm({ donation }: DonationFormProps) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("test");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const amountLabel = useMemo(() => amount.toFixed(2).replace(".00", ""), [amount]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (!firstName || !lastName || !email || !address) {
      setMessage("First name, last name, email, and address are required.");
      return;
    }

    setMessage("Processing donation...");
    const payload = {
      donation_id: donation.id,
      amount,
      payment_method: paymentMethod,
      status: "pending",
      currency: "USD",
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: String(formData.get("phone_number") || ""),
      address,
      note: String(formData.get("note") || ""),
      card_number: "4242424242424242"
    };

    const response = await fetch("/api/public/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await readApiPayload(response);
    setMessage(
      result.success
        ? result.message || "Donation saved successfully."
        : resolveResponseMessage(response, result, "Donation failed.")
    );
    if (result.success) {
      form.reset();
    }
  }

  return (
    <>
      <h5>Your Donation:</h5>
      <div className="donation-display">
        <span className="currency">$</span>
        <span>{amountLabel}</span>
      </div>
      <div className="donation-options">
        {[50, 100, 200].map((preset) => (
          <button
            key={preset}
            type="button"
            className={`donation-btn${!isCustomAmount && amount === preset ? " active" : ""}`}
            onClick={() => {
              setIsCustomAmount(false);
              setAmount(preset);
            }}
          >
            {preset}
          </button>
        ))}
        {isCustomAmount ? (
          <input
            id="custom-btn"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            value={Number.isFinite(amount) ? amount : ""}
            onChange={(event) => {
              const numeric = Number(event.target.value);
              setAmount(Number.isFinite(numeric) && numeric > 0 ? numeric : 0);
            }}
            onBlur={() => {
              if (!amount || amount <= 0) {
                setAmount(100);
              }
            }}
            placeholder="Custom"
            className="active"
            style={{ maxWidth: "180px" }}
            aria-label="Custom donation amount"
            autoFocus
          />
        ) : (
          <button
            id="custom-btn"
            type="button"
            onClick={() => {
              setIsCustomAmount(true);
            }}
          >
            Custom
          </button>
        )}
      </div>
      <h5>Select Payment Method</h5>
      <div className="select-item">
        {[
          ["test", "Test Donation"],
          ["offline", "Offline Donation"],
          ["card", "Credit Card"]
        ].map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="payment_method"
              value={value}
              checked={paymentMethod === value}
              onChange={() => setPaymentMethod(value)}
            />
            {label}
          </label>
        ))}
      </div>
      <a href="#contact-form" className="theme-btn">
        Donate Now <i className="fa-solid fa-arrow-right-long" />
      </a>
      <h3 className="text">Details Information</h3>
      <form id="contact-form" onSubmit={onSubmit}>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="form-clt">
              <input type="text" name="first_name" placeholder="First Name" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-clt">
              <input type="text" name="last_name" placeholder="Last Name" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-clt">
              <input type="text" name="email" placeholder="Your Email" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-clt">
              <input type="text" name="phone_number" placeholder="Your Number" />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="form-clt">
              <input type="text" name="address" placeholder="Your Address" />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="form-clt">
              <textarea name="note" placeholder="Type your message" />
            </div>
          </div>
          <div className="col-lg-6">
            <button type="submit" className="theme-btn">
              Save Information <i className="fa-solid fa-arrow-right-long" />
            </button>
          </div>
          <div className="col-lg-12">
            <p id="donation_form_message" style={{ margin: 0 }}>
              {message}
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
