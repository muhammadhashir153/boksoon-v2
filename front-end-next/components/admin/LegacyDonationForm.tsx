"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

type LegacyDonationFormProps = {
  mode: "create" | "edit";
  endpoint: string;
  redirectTo: string;
  adminId?: string | null;
  initialValues?: {
    title?: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    target_amount?: number;
    placeholder_url?: string | null;
  };
};

const FALLBACK_PREVIEW = "/admin-assets/images/user/avatar-2.jpg";

export function LegacyDonationForm({
  mode,
  endpoint,
  redirectTo,
  adminId,
  initialValues
}: LegacyDonationFormProps) {
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialValues?.placeholder_url || FALLBACK_PREVIEW);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setMessage(mode === "edit" ? "Saving changes..." : "Creating campaign...");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);

    if (!payload.success) {
      setMessage(
        resolveResponseMessage(response, payload, "Save failed.", {
          validationMessage: "Please upload a valid PNG, JPG, or WEBP image for the campaign."
        })
      );
      return;
    }

    window.location.href = redirectTo;
  }

  function handlePreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="row">
      <div className="col-lg-7">
        <div className="card">
          <div className="card-header">
            <h3>{mode === "edit" ? "Edit Campaign" : "Create Donation Campaign"}</h3>
            <p className="section-copy mb-0">
              {mode === "edit"
                ? "Update campaign details without changing any backend behavior or workflow."
                : "Set the campaign story, timing, goal, and supporting visual in one place."}
            </p>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmit} id={mode === "edit" ? "updateDonation" : "addDonation"} encType="multipart/form-data">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input type="text" id="title" name="title" className="form-control" required placeholder="Title" defaultValue={initialValues?.title || ""} />
                {mode === "create" && adminId ? <input type="hidden" value={adminId} name="admin_id" /> : null}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea name="description" id="description" className="form-control" required placeholder="Describe briefly" defaultValue={initialValues?.description || ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date" className="form-control" required defaultValue={initialValues?.start_date || ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="end_date">End Date (Optional)</label>
                <input type="date" id="end_date" name="end_date" className="form-control" defaultValue={initialValues?.end_date || ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="target_amount">Target Amount</label>
                <input type="number" id="target_amount" name="target_amount" className="form-control" required placeholder="Please enter target amount" defaultValue={initialValues?.target_amount ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="placeholder">{mode === "edit" ? "Change Image" : "Dsiplay Image"}</label>
                <input
                  type="file"
                  id="placeholder"
                  name="placeholder"
                  className="form-control"
                  accept="image/png,image/jpeg,image/webp"
                  required={mode === "create"}
                  onChange={handlePreview}
                  data-upload-label={mode === "edit" ? "Drop updated campaign image here" : "Drop campaign image here"}
                  data-upload-help={mode === "edit" ? "PNG, JPG, or WEBP. Replace the current campaign visual with a new hero image." : "PNG, JPG, or WEBP. Recommended wide hero image."}
                  data-upload-preview="#placeholderImage"
                />
                <small className="text-muted d-block mt-1">Allowed formats: PNG, JPG, WEBP.</small>
              </div>
              <div id="form-message">{message}</div>
              <div className={mode === "edit" ? "page-toolbar-actions" : ""}>
                <button type="submit" className="btn btn-primary">{mode === "edit" ? "Save Changes" : "Add"}</button>
                {mode === "edit" ? <a href={redirectTo} className="btn btn-outline-secondary">Back to Campaigns</a> : null}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="card detail-panel">
          <div className="card-header">
            <h3>{mode === "edit" ? "Current Campaign Visual" : "Publishing Guidance"}</h3>
          </div>
          <div className="card-body">
            <img
              src={previewUrl}
              data-fallback-src={FALLBACK_PREVIEW}
              id="placeholderImage"
              alt="Campaign preview"
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "18px",
                display: mode === "edit" || previewUrl !== FALLBACK_PREVIEW ? "block" : "none"
              }}
            />
            <div className="detail-list">
              <div className="detail-list-item">
                <span>{mode === "edit" ? "Tip" : "Story"}</span>
                <strong>{mode === "edit" ? "Refreshing the story or image can improve clarity without affecting donations already recorded." : "Keep the description concise and emotionally clear."}</strong>
              </div>
              <div className="detail-list-item">
                <span>{mode === "edit" ? "Consistency" : "Goal"}</span>
                <strong>{mode === "edit" ? "Keep naming and timing aligned with the public-facing campaign page." : "Use a realistic target amount for better progress visibility."}</strong>
              </div>
              {mode === "create" ? (
                <div className="detail-list-item">
                  <span>Visual</span>
                  <strong>Upload a strong hero image that represents the campaign purpose.</strong>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
