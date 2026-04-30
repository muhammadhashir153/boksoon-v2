"use client";

import Script from "next/script";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

type LegacyBookFormProps = {
  mode: "create" | "edit";
  endpoint: string;
  redirectTo: string;
  initialValues?: {
    title?: string;
    description?: string;
    link_url?: string;
    link_label?: string;
    language?: string | null;
    author_name?: string | null;
    sort_order?: number;
    is_published?: boolean;
    cover_image_url?: string | null;
  };
};

const FALLBACK_PREVIEW = "/admin-assets/images/user/avatar-2.jpg";

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

export function LegacyBookForm({ mode, endpoint, redirectTo, initialValues }: LegacyBookFormProps) {
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialValues?.cover_image_url || FALLBACK_PREVIEW);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<{
    getData: () => string;
    setData: (value: string) => void;
    destroy: () => Promise<void>;
  } | null>(null);
  const editorInitializingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => undefined);
      }
    };
  }, []);

  async function initializeEditor() {
    if (!window.ClassicEditor || !editorRef.current || editorInstanceRef.current || editorInitializingRef.current) {
      return;
    }

    editorInitializingRef.current = true;
    setMessage("");

    try {
      const editor = await window.ClassicEditor.create(editorRef.current, {
        initialData: initialValues?.description || "",
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "blockQuote",
          "|",
          "undo",
          "redo"
        ]
      });

      editorInstanceRef.current = editor;
      setEditorReady(true);
    } finally {
      editorInitializingRef.current = false;
    }
  }

  const handleEditorLoadFailure = (error: unknown) => {
    if (editorInstanceRef.current || editorInitializingRef.current) {
      return;
    }

    console.error(error);
    setMessage("Description editor failed to load.");
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("description", editorInstanceRef.current?.getData() || String(formData.get("description") || ""));

    setMessage(mode === "edit" ? "Saving changes..." : "Saving book...");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });
    const payload = await readApiPayload(response);

    if (!payload.success) {
      setMessage(
        resolveResponseMessage(response, payload, "Save failed.", {
          validationMessage: "Please upload a valid PNG, JPG, or WEBP image for the book cover."
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
              <h3>{mode === "edit" ? "Edit Book Entry" : "Create Book Entry"}</h3>
              <p className="section-copy mb-0">
                {mode === "edit"
                  ? "Update the public book content without re-entering seeded records."
                  : "Add a cover, summary, and external purchase link for the public books page."}
              </p>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit} id={mode === "edit" ? "updateBookForm" : "addBookForm"} encType="multipart/form-data">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Title</label>
                  <input type="text" id="title" name="title" className="form-control" required defaultValue={initialValues?.title || ""} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cover_image">{mode === "edit" ? "Change Cover Image" : "Cover Image"}</label>
                  <input
                    type="file"
                    id="cover_image"
                    name="cover_image"
                    className="form-control"
                    accept="image/png,image/jpeg,image/webp"
                    required={mode === "create"}
                    onChange={handlePreview}
                    data-upload-label={mode === "edit" ? "Drop updated cover here" : "Drop book cover here"}
                    data-upload-help={mode === "edit" ? "PNG, JPG, or WEBP. Leave empty to keep the current cover." : "PNG, JPG, or WEBP. Used for the book card and hover treatment."}
                    data-upload-preview="#bookCoverPreview"
                  />
                  <small className="text-muted d-block mt-1">Allowed formats: PNG, JPG, WEBP.</small>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <div className="editor-frame">
                    <div
                      ref={editorRef}
                      id="description"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-8">
                    <div className="form-group">
                      <label className="form-label" htmlFor="link_url">Link URL</label>
                      <input type="url" id="link_url" name="link_url" className="form-control" required defaultValue={initialValues?.link_url || ""} placeholder="https://www.amazon.com/..." />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="link_label">Button Label</label>
                      <input type="text" id="link_label" name="link_label" className="form-control" defaultValue={initialValues?.link_label || "Check Out on Amazon"} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="language">Language</label>
                      <input type="text" id="language" name="language" className="form-control" defaultValue={initialValues?.language || ""} placeholder="English" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="author_name">Author</label>
                      <input type="text" id="author_name" name="author_name" className="form-control" defaultValue={initialValues?.author_name || "Boksoon Kim"} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="sort_order">Sort Order</label>
                      <input type="number" id="sort_order" name="sort_order" className="form-control" defaultValue={initialValues?.sort_order ?? 0} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="is_published">Status</label>
                  <select id="is_published" name="is_published" className="form-control" defaultValue={initialValues?.is_published === false ? "0" : "1"}>
                    <option value="0">Draft</option>
                    <option value="1">Published</option>
                  </select>
                </div>
                <div id="form-message">{message}</div>
                <div className="page-toolbar-actions">
                  <button type="submit" className="btn btn-primary" disabled={!editorReady}>{mode === "edit" ? "Save Changes" : "Save Book"}</button>
                  <a href={redirectTo} className="btn btn-outline-secondary">Back to Books</a>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card detail-panel">
            <div className="card-header">
              <h3>{mode === "edit" ? "Current Cover" : "Preview & Notes"}</h3>
            </div>
            <div className="card-body">
              <img
                src={previewUrl}
                data-fallback-src={FALLBACK_PREVIEW}
                id="bookCoverPreview"
                alt="Book cover preview"
                style={{ width: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "20px", marginBottom: "18px" }}
              />
              <div className="detail-list">
                <div className="detail-list-item">
                  <span>Links</span>
                  <strong>{mode === "edit" ? "Both the card title and button reuse the same external URL." : "The same URL will power both the title link and the CTA button on the public page."}</strong>
                </div>
                <div className="detail-list-item">
                  <span>{mode === "edit" ? "Publishing" : "Formatting"}</span>
                  <strong>{mode === "edit" ? "Switch to draft if you need to hide a book without deleting its content." : "Use the editor to format paragraphs, bullets, and quotes without typing HTML manually."}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
