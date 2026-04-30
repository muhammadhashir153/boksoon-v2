"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

type MinistryOption = {
  value: string;
  label: string;
};

type BlogEditorFormProps = {
  mode: "create" | "edit";
  endpoint: string;
  redirectTo: string;
  title: string;
  submitLabel: string;
  initialValues?: {
    title?: string;
    ministry_id?: string | null;
    is_published?: boolean;
    content?: string;
  };
  ministries: MinistryOption[];
  userRole?: string | null;
};

declare global {
  interface Window {
    ClassicEditor?: {
      create: (element: Element, config?: Record<string, unknown>) => Promise<{
        getData: () => string;
        setData: (value: string) => void;
        destroy: () => Promise<void>;
        plugins: {
          get: (name: string) => {
            createUploadAdapter?: (loader: unknown) => unknown;
          };
        };
      }>;
    };
  }
}

export function BlogEditorForm({
  mode,
  endpoint,
  redirectTo,
  title,
  submitLabel,
  initialValues,
  ministries,
  userRole
}: BlogEditorFormProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<{
    getData: () => string;
    setData: (value: string) => void;
    destroy: () => Promise<void>;
  } | null>(null);
  const editorInitializingRef = useRef(false);
  const [editorReady, setEditorReady] = useState(false);
  const [message, setMessage] = useState("");
  const normalizedRole = userRole === "reviewer" ? "reviwer" : userRole;
  const canChooseMinistry = normalizedRole === "admin" || normalizedRole === "manager";

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => undefined);
      }
    };
  }, []);

  const initializeEditor = async () => {
    if (!editorRef.current || editorInstanceRef.current || editorInitializingRef.current || !window.ClassicEditor) {
      return;
    }

    editorInitializingRef.current = true;
    setMessage("");

    function uploadPlugin(editor: {
      plugins: {
        get: (name: string) => {
          createUploadAdapter?: (loader: {
            file: Promise<File>;
          }) => {
            upload: () => Promise<{ default: string }>;
            abort: () => void;
          };
        };
      };
    }) {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader: { file: Promise<File> }) => ({
        upload: async () => {
          const file = await loader.file;
          const formData = new FormData();
          formData.append("upload", file);

          const response = await fetch("/api/admin/blogs/upload-image", {
            method: "POST",
            body: formData
          });
          const payload = await readApiPayload(response);

          if (!payload.success || !payload.data || typeof payload.data !== "object" || !("url" in payload.data)) {
            throw new Error(
              resolveResponseMessage(response, payload, "Image upload failed.", {
                validationMessage: "Please upload a valid PNG, JPG, or WEBP image."
              })
            );
          }

          return { default: String((payload.data as { url: string }).url) };
        },
        abort: () => undefined
      });
    }

    try {
      const editor = await window.ClassicEditor.create(editorRef.current, {
        extraPlugins: [uploadPlugin],
        initialData: initialValues?.content || ""
      });

      editorInstanceRef.current = editor;
      setEditorReady(true);
    } finally {
      editorInitializingRef.current = false;
    }
  };

  const handleEditorLoadFailure = (error: unknown) => {
    if (editorInstanceRef.current || editorInitializingRef.current) {
      return;
    }

    console.error(error);
    setMessage("Editor failed to load.");
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("content", editorInstanceRef.current?.getData() || "");

    setMessage(mode === "edit" ? "Updating..." : "Saving...");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);

    if (!payload.success) {
      setMessage(
        resolveResponseMessage(response, payload, "Save failed.", {
          validationMessage: "Please upload a valid PNG, JPG, or WEBP image for the banner."
        })
      );
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <>
      <Script
        src="/admin-assets/js/plugins/ckeditor/classic/ckeditor.js"
        strategy="afterInteractive"
        onLoad={() => {
          initializeEditor().catch(handleEditorLoadFailure);
        }}
        onReady={() => {
          initializeEditor().catch(handleEditorLoadFailure);
        }}
        onError={(error) => {
          handleEditorLoadFailure(error);
        }}
      />
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3>{title}</h3>
              <p className="section-copy mb-0">
                {mode === "edit"
                  ? "Refine content, metadata, and publishing status without disrupting the existing blog workflow."
                  : "Craft long-form ministry content with a polished editorial writing surface."}
              </p>
            </div>
            <div className="card-body">
              <form id={mode === "edit" ? "updateBlog" : "addBlogForm"} onSubmit={onSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" name="title" className="form-control" required defaultValue={initialValues?.title || ""} />
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image</label>
                  <input
                    type="file"
                    name="banner_image"
                    className="form-control"
                    accept="image/png,image/jpeg,image/webp"
                    required={mode === "create"}
                    data-upload-label="Drop banner image here"
                    data-upload-help="PNG, JPG, or WEBP. Used for the article card and blog header."
                  />
                  <small className="text-muted d-block mt-1">Allowed formats: PNG, JPG, WEBP.</small>
                </div>

                <div className="form-group" id="ministryWrapper" style={{ display: canChooseMinistry ? "block" : "none" }}>
                  <label className="form-label">Select Ministry</label>
                  <select
                    name="ministry_id"
                    id="ministry"
                    className="form-control"
                    required={canChooseMinistry}
                    defaultValue={initialValues?.ministry_id || ""}
                  >
                    <option value="">Select ministry</option>
                    {ministries.map((ministry) => (
                      <option key={ministry.value} value={ministry.value}>
                        {ministry.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="is_published"
                    id="is_published"
                    className="form-control"
                    defaultValue={initialValues?.is_published ? "1" : "0"}
                  >
                    <option value="0">Draft</option>
                    <option value="1">Published</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <div className="editor-frame">
                    <div
                      ref={editorRef}
                      id="contentEditor"
                      className="form-control"
                    />
                  </div>
                </div>

                <div id="form-message">{message}</div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary" disabled={!editorReady}>
                    {submitLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card detail-panel">
            <div className="card-header">
              <h3>{mode === "edit" ? "Publishing Checklist" : "Editorial Notes"}</h3>
            </div>
            <div className="card-body">
              <div className="detail-list">
                <div className="detail-list-item">
                  <span>{mode === "edit" ? "Ministry" : "Headline"}</span>
                  <strong>
                    {mode === "edit"
                      ? "Make sure the post stays assigned to the correct ministry for filtering and ownership."
                      : "Write titles that are clear, human, and easy to scan from the list view."}
                  </strong>
                </div>
                <div className="detail-list-item">
                  <span>Status</span>
                  <strong>
                    {mode === "edit"
                      ? "Double-check draft vs published before saving if the update is public-facing."
                      : "Use Draft while collaborating, then publish when the story is ready for the front-end."}
                  </strong>
                </div>
                <div className="detail-list-item">
                  <span>{mode === "edit" ? "Readability" : "Visuals"}</span>
                  <strong>
                    {mode === "edit"
                      ? "Use short sections and clean hierarchy so the front-end article remains easy to scan."
                      : "Choose a banner image that still reads well when cropped into cards."}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
