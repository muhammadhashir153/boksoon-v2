"use client";

import { FormEvent, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

type Option = {
  value: string;
  label: string;
};

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea" | "number" | "file" | "checkbox" | "select";
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  options?: Option[];
  helperText?: string;
};

type ResourceFormProps = {
  title: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  redirectTo: string;
  submitLabel: string;
  fields: Field[];
};

export function ResourceForm({
  title,
  endpoint,
  method = "POST",
  redirectTo,
  submitLabel,
  fields
}: ResourceFormProps) {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("Saving...");

    const hasFileField = fields.some((field) => field.type === "file");
    const requestPayload = fields.reduce<Record<string, unknown>>((accumulator, field) => {
      if (field.type === "checkbox") {
        accumulator[field.name] = formData.has(field.name);
        return accumulator;
      }

      if (field.type === "file") {
        const file = formData.get(field.name);
        if (file instanceof File && file.size > 0) {
          accumulator[field.name] = file;
        }
        return accumulator;
      }

      const value = formData.get(field.name);
      if (typeof value !== "string") {
        return accumulator;
      }

      if (value === "") {
        accumulator[field.name] = null;
        return accumulator;
      }

      accumulator[field.name] = value;
      return accumulator;
    }, {});

    const response = hasFileField
      ? await fetch(endpoint, {
          method,
          body: formData
        })
      : await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestPayload)
        });
    const responsePayload = await readApiPayload(response);
    if (!responsePayload.success) {
      setMessage(resolveResponseMessage(response, responsePayload, "Save failed."));
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="admin-form-grid">
          {fields.map((field) => (
            <label key={field.name} className="form-label">
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  className="form-control"
                  name={field.name}
                  required={field.required}
                  defaultValue={String(field.defaultValue || "")}
                />
              ) : null}
              {field.type === "select" ? (
                <select
                  className="form-control"
                  name={field.name}
                  required={field.required}
                  defaultValue={String(field.defaultValue || "")}
                >
                  <option value="">Select</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
              {field.type === "checkbox" ? (
                <input
                  className="form-check-input ms-2"
                  type="checkbox"
                  name={field.name}
                  value="1"
                  defaultChecked={Boolean(field.defaultValue)}
                />
              ) : null}
              {!field.type || ["text", "email", "password", "number", "file"].includes(field.type) ? (
                <input
                  className="form-control"
                  type={field.type || "text"}
                  name={field.name}
                  required={field.required}
                  accept={field.type === "file" ? "image/png,image/jpeg,image/webp" : undefined}
                  defaultValue={field.type === "file" ? undefined : String(field.defaultValue || "")}
                />
              ) : null}
              {field.helperText ? <small className="text-muted">{field.helperText}</small> : null}
            </label>
          ))}
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">
              {submitLabel}
            </button>
            <a className="btn btn-outline-secondary" href={redirectTo}>
              Cancel
            </a>
          </div>
          {message ? <p className="status-message">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
