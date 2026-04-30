"use client";

import { FormEvent, useRef, useState } from "react";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";
import { Comment } from "@/lib/types";

type BlogCommentSectionProps = {
  blogId: string;
  comments: Comment[];
};

const commentEmojis = ["😀", "😍", "🙏", "❤️", "🔥", "👏", "😊", "✨", "🎉", "💛", "🙌", "🌟"];

export function BlogCommentSection({ blogId, comments }: BlogCommentSectionProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDuplicateEmailError, setHasDuplicateEmailError] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  function insertEmoji(emoji: string) {
    const input = messageRef.current;
    if (!input) {
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const value = input.value;
    const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;

    input.value = nextValue;
    input.focus();

    const nextCursorPosition = start + emoji.length;
    window.requestAnimationFrame(() => {
      input.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });

    setEmojiOpen(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("blog_id", blogId);

    setIsSubmitting(true);
    setMessage("Sending your comment...");
    setHasDuplicateEmailError(false);

    try {
      const response = await fetch("/api/public/comments", {
        method: "POST",
        body: formData,
      });
      const payload = await readApiPayload(response);
      const emailErrors = payload.errors?.email;
      const duplicateCommentMessage = response.status === 422
        ? Array.isArray(emailErrors)
          ? emailErrors.find((error) => typeof error === "string") || ""
          : typeof emailErrors === "string"
            ? emailErrors
            : ""
        : "";
      const nextMessage = payload.success
        ? payload.message || "Comment submitted. Please verify via email."
        : resolveResponseMessage(response, payload, "Comment failed to send.", {
            validationMessage: "Please review your comment details and try again.",
          });

      setMessage(nextMessage);
      setHasDuplicateEmailError(typeof duplicateCommentMessage === "string" && duplicateCommentMessage.length > 0);

      if (payload.success) {
        form.reset();
      }
    } catch {
      setMessage("Comment failed to send.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="contact-us-wrapper-2">
        <div className="from-fill-up-box">
          <h3>Leave a Comment</h3>
          <p className="mb-5">Share your thoughts below. We will email you a verification link before your comment goes live.</p>
          <form onSubmit={onSubmit} >
            <input type="hidden" name="blog_id" value={blogId} />
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-clt">
                  <input type="text" name="name" placeholder="Your Name" required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-clt">
                  <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      required
                      aria-invalid={hasDuplicateEmailError}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-clt blog-comment-textarea-wrap">
                  <div className="blog-comment-toolbar">
                    <button
                      type="button"
                      className="blog-comment-emoji-trigger"
                      aria-label="Open emoji picker"
                      aria-expanded={emojiOpen}
                      onClick={() => setEmojiOpen((open) => !open)}
                    >
                      <i className="fa-regular fa-face-smile" />
                    </button>
                    {emojiOpen ? (
                      <div className="blog-comment-emoji-picker" role="dialog" aria-label="Emoji picker">
                        {commentEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="blog-comment-emoji"
                            onClick={() => insertEmoji(emoji)}
                            aria-label={`Insert ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <textarea ref={messageRef} name="message" placeholder="Write your comment" required rows={2 } />
                </div>
              </div>
              <div className="col-12">
                {message ? (
                    <div
                        className={`blog-comment-message${hasDuplicateEmailError ? " is-error" : ""}`}
                        role="status"
                        aria-live="polite"
                    >
                      {message}
                    </div>
                ) : null}
              </div>
              <div className="col-12">
                <button type="submit" className="theme-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Post Comment"} <i className="fa-solid fa-arrow-right-long" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="comment-area">
        <h3>{comments.length.toString().padStart(2, "0")} Comments</h3>
        {comments.length ? (
          comments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div className="client-image">
                <div className="blog-comment-avatar">
                  {comment.name.trim().charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <div className="comment-content">
                <h4>{comment.name}</h4>
                <p>{comment.message}</p>
                <ul className="comment-list">
                  <li>
                    <i className="fa-regular fa-clock" />
                    <LocalizedDateText value={comment.created_at} variant="dateTime" />
                  </li>
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="comment-item">
            <div className="comment-content">
              <h4>No comments yet</h4>
              <p>Be the first to comment on this blog post.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
