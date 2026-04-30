"use client";

import { FormEvent, useState } from "react";

type LegacyPasswordResetFormProps = {
  userId: string;
};

export function LegacyPasswordResetForm({ userId }: LegacyPasswordResetFormProps) {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const pass = String(formData.get("pass") || "");
    const confirmPass = String(formData.get("confirm_pass") || "");

    if (pass !== confirmPass) {
      setMessage("Password not match");
      return;
    }

    setMessage("Updating password...");

    const response = await fetch(`/api/admin/users/${userId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pass })
    });
    const payload = await response.json().catch(() => ({ success: false, message: "Password update failed." }));

    setMessage(payload.message || (payload.success ? "Password updated." : "Password update failed."));
    if (payload.success) {
      form.reset();
    }
  }

  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h3>Update Password</h3>
            <p className="text-muted">Please choose your new password</p>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} id="updatePass">
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="pass">Password</label>
                <input type="password" id="pass" name="pass" className="form-control" placeholder="Password" required minLength={8} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="confirm_pass">Confirm Password</label>
                <input type="password" id="confirm_pass" name="confirm_pass" className="form-control" placeholder="Confirm Password" required minLength={8} />
              </div>
              <div id="form-message">{message}</div>
              <div className="d-grid mt-4">
                <button className="btn btn-primary" type="submit" id="btn-submit">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card detail-panel">
          <div className="card-header">
            <h3>Password Notes</h3>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-list-item">
                <span>Security</span>
                <strong>Use a unique password and avoid reusing credentials across team members.</strong>
              </div>
              <div className="detail-list-item">
                <span>Access</span>
                <strong>Resetting the password keeps the same role, ministry, and all current permissions intact.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
