"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";
import { User } from "@/lib/types";

type ProfileFormsProps = {
  user: User;
};

export function ProfileForms({ user }: ProfileFormsProps) {
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(user.dp_url || "/admin-assets/images/user/avatar-2.jpg");

  async function onProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setProfileMessage("Saving profile...");

    const response = await fetch("/api/auth/profile", {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);
    setProfileMessage(
      payload.success
        ? payload.message || "Profile updated."
        : resolveResponseMessage(response, payload, "Profile update failed.", {
            validationMessage: "Please upload a valid PNG, JPG, or WEBP image."
          })
    );

    if (payload.success) {
      window.location.reload();
    }
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPasswordMessage("Updating password...");

    const response = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        current_pass: String(formData.get("current_pass") || ""),
        new_pass: String(formData.get("new_pass") || ""),
        confirm_pass: String(formData.get("confirm_pass") || "")
      })
    });
    const payload = await readApiPayload(response);
    setPasswordMessage(
      payload.success
        ? payload.message || "Password updated."
        : resolveResponseMessage(response, payload, "Password update failed.")
    );

    if (payload.success) {
      form.reset();
    }
  }

  function onProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div className="card">
          <div className="card-body">
            <h3 className="mb-4">Profile Details</h3>
            <form onSubmit={onProfileSubmit} className="admin-form-grid">
              <label className="form-label">
                <span>Name</span>
                <input className="form-control" type="text" name="name" defaultValue={user.name} required />
              </label>
              <label className="form-label">
                <span>Email</span>
                <input className="form-control" type="email" name="email" defaultValue={user.email} required />
              </label>
              <label className="form-label">
                <span>Profile Image</span>
                <input
                  className="form-control"
                  type="file"
                  id="profile_dp"
                  name="dp"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onProfileImageChange}
                  data-upload-label="Drop profile image here"
                  data-upload-help="PNG, JPG, or WEBP. Square images work best for the header avatar."
                  data-upload-preview="#profile_dp_preview"
                />
              </label>
              <small className="text-muted d-block mt-1">Allowed formats: PNG, JPG, WEBP.</small>
              <div className="mb-3">
                <img
                  id="profile_dp_preview"
                  src={previewUrl}
                  alt="Profile"
                  style={{ maxWidth: "100px", borderRadius: "12px" }}
                />
              </div>
              <div className="admin-actions">
                <button className="btn btn-primary" type="submit">Save Profile</button>
              </div>
              {profileMessage ? <p className="status-message">{profileMessage}</p> : null}
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card">
          <div className="card-body">
            <h3 className="mb-4">Change Password</h3>
            <form onSubmit={onPasswordSubmit} className="admin-form-grid">
              <label className="form-label">
                <span>Current Password</span>
                <input className="form-control" type="password" name="current_pass" required />
              </label>
              <label className="form-label">
                <span>New Password</span>
                <input className="form-control" type="password" name="new_pass" minLength={8} required />
              </label>
              <label className="form-label">
                <span>Confirm Password</span>
                <input className="form-control" type="password" name="confirm_pass" minLength={8} required />
              </label>
              <div className="admin-actions">
                <button className="btn btn-primary" type="submit">Update Password</button>
              </div>
              {passwordMessage ? <p className="status-message">{passwordMessage}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
