"use client";

import { FormEvent, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type LegacyUserFormProps = {
  mode: "create" | "edit";
  endpoint: string;
  redirectTo: string;
  roleOptions: Option[];
  ministryOptions: Option[];
  initialValues?: {
    name?: string;
    email?: string;
    role_id?: string | null;
    ministry_id?: string | null;
  };
};

export function LegacyUserForm({
  mode,
  endpoint,
  redirectTo,
  roleOptions,
  ministryOptions,
  initialValues
}: LegacyUserFormProps) {
  const [message, setMessage] = useState("");
  const [roleId, setRoleId] = useState(initialValues?.role_id || "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const pass = String(formData.get("pass") || "");
    const confirmPass = String(formData.get("confirmPass") || "");

    if (mode === "create" && pass !== confirmPass) {
      setMessage("Password does not match the confirmation.");
      return;
    }

    setMessage(mode === "edit" ? "Updating user..." : "Creating user...");

    const body = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role_id: String(formData.get("role_id") || "") || null,
      ministry_id: String(formData.get("ministry_id") || "") || null,
      ...(mode === "create" ? { pass } : {})
    };

    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({ success: false, message: "Save failed." }));

    if (!payload.success) {
      setMessage(payload.message || "Save failed.");
      return;
    }

    window.location.href = redirectTo;
  }

  const selectedRoleLabel = roleOptions.find((role) => role.value === roleId)?.label.toLowerCase() || "";
  const showMinistry = selectedRoleLabel.includes("author");

  return (
    <div className="row">
      <div className="col-lg-7">
        <div className="card">
          <div className="card-header">
            <h3>{mode === "edit" ? "Update User" : "Create New User"}</h3>
            <p className="section-copy mb-0">
              {mode === "edit"
                ? "Update staff details, ministry assignment, and access settings from the same screen."
                : "Set role, ministry, and access details with a cleaner onboarding flow."}
            </p>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} id={mode === "edit" ? "updateUserForm" : "addUser"}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input type="text" id="name" name="name" className="form-control" required defaultValue={initialValues?.name || ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" id="email" name="email" className="form-control" required defaultValue={initialValues?.email || ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="role_id">Select Role</label>
                <select
                  className="form-select"
                  name="role_id"
                  id="role_id"
                  required
                  value={roleId}
                  onChange={(event) => setRoleId(event.target.value)}
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" id="ministryBox" style={{ display: showMinistry ? "block" : "none" }}>
                <label className="form-label" htmlFor="ministry_id">Select Ministry</label>
                <select
                  className="form-select"
                  name="ministry_id"
                  id="ministry_id"
                  defaultValue={initialValues?.ministry_id || ""}
                >
                  <option value="">Select Ministry</option>
                  {ministryOptions.map((ministry) => (
                    <option key={ministry.value} value={ministry.value}>{ministry.label}</option>
                  ))}
                </select>
              </div>
              {mode === "create" ? (
                <>
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="pass">Password</label>
                    <input type="password" id="pass" name="pass" className="form-control" placeholder="Password" required minLength={8} />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="confirmPass">Confirm Password</label>
                    <input type="password" id="confirmPass" name="confirmPass" className="form-control" placeholder="Confirm Password" required minLength={8} />
                  </div>
                </>
              ) : null}
              <div id="form-message">{message}</div>
              <div className="page-toolbar-actions mt-4">
                <button type="submit" className="btn btn-primary">{mode === "edit" ? "Update User" : "Create User"}</button>
                <a href={redirectTo} className="btn btn-outline-secondary">Back to Users</a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="card detail-panel">
          <div className="card-header">
            <h3>Role Guidance</h3>
          </div>
          <div className="card-body">
            <div className="detail-list">
              <div className="detail-list-item">
                <span>Admin</span>
                <strong>Full access to all campaigns, staff, lead inboxes, and publishing tools.</strong>
              </div>
              <div className="detail-list-item">
                <span>Author / Reviewer</span>
                <strong>Use ministry assignment where content ownership matters for publishing workflows.</strong>
              </div>
              <div className="detail-list-item">
                <span>Password</span>
                <strong>
                  {mode === "edit"
                    ? "Use the dedicated reset flow from the staff list when credentials need to be rotated."
                    : "Use a temporary strong password and rotate it after the first sign-in when needed."}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
