"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { readApiPayload, resolveResponseMessage } from "@/lib/client/api-feedback";

type VerificationState = "loading" | "success" | "error";
const VERIFY_EMAIL_ATTEMPT_PREFIX = "verify-email-attempt:";
const verificationRequests = new Map();

export default function AdminVerifyEmailPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token")?.trim() || "";
	const [state, setState] = useState<VerificationState>("loading");
	const [message, setMessage] = useState("Checking your email verification link...");


	useEffect(() => {
		if (!token) {
			setState("error");
			setMessage("A verification token is required.");
			return;
		}

		let active = true;

		const run = async () => {
			try {
				setState("loading");
				setMessage("Checking your email verification link...");

				let requestPromise = verificationRequests.get(token);

				if (!requestPromise) {
					requestPromise = fetch(`/api/public/verify-email/${encodeURIComponent(token)}`, {
						method: "GET",
						headers: {
							Accept: "application/json",
						},
					})
						.then(async (response) => {
							const payload = await readApiPayload(response);
							return { response, payload };
						})
						.finally(() => {
							verificationRequests.delete(token);
						});

					verificationRequests.set(token, requestPromise);
				}

				const { response, payload } = await requestPromise;

				if (!active) return;

				console.log(payload);

				if (response.ok && payload.success !== false) {
					setState("success");
					setMessage(payload.message || "Your email address has been verified successfully.");
					return;
				}

				setState("error");
				setMessage(resolveResponseMessage(response, payload, "Email verification failed."));
			} catch {
				if (!active) return;
				setState("error");
				setMessage("Email verification failed.");
			}
		};

		run();

		return () => {
			active = false;
		};
	}, [token]);

  return (
	<>
	  <link rel="icon" href="/assets/img/favicon.svg" />
	  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:wght@600;700&display=swap" />
	  <link rel="stylesheet" href="/admin-assets/css/style.css" />
	  <link rel="stylesheet" href="/admin-assets/css/style-preset.css" />
	  <link rel="stylesheet" href="/admin-assets/css/interactive-ui.css" />
	  <link rel="stylesheet" href="/admin-assets/fonts/tabler-icons.min.css" />
	  <link rel="stylesheet" href="/admin-assets/fonts/feather.css" />
	  <link rel="stylesheet" href="/admin-assets/fonts/fontawesome.css" />
	  <link rel="stylesheet" href="/admin-assets/fonts/material.css" />
	  <div className="loader-bg">
		<div className="loader-track">
		  <div className="loader-fill" />
		</div>
	  </div>
	  <Script id="admin-verify-email-body-setup" strategy="beforeInteractive">
		{`
		  document.documentElement.lang = 'en';
		  document.body.classList.add('admin-shell');
		  document.body.setAttribute('data-pc-theme', 'light');
		`}
	  </Script>
	  <div className="auth-main admin-shell" data-pc-theme="light">
		<div className="auth-wrapper v3">
		  <div className="auth-form">
			<div className="auth-header">
			  <div className="auth-header-row">
				<div className="admin-brand auth-brand-mark">
				  <img src="/assets/img/logo/logo.png" className="admin-brand-logo" alt="logo" />
				  <span className="admin-brand-copy">
					<strong>Boksoon Kim</strong>
					<small>Admin Panel</small>
				  </span>
				</div>
				<h1 className="auth-brand-title">Email verification</h1>
				<p className="auth-brand-copy">We are confirming your email address using the link you opened.</p>
			  </div>
			</div>

			<div className="card my-5">
			  <div className="card-body text-center p-4 p-md-5">
				<div className={`mb-3 fs-1 ${state === "success" ? "text-success" : state === "error" ? "text-danger" : "text-primary"}`}>
				  {state === "loading" ? (
					<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
				  ) : state === "success" ? (
					"✓"
				  ) : (
					"!"
				  )}
				</div>

				<h3 className="mb-2">
				  <b>{state === "success" ? "Email Verified" : state === "error" ? "Verification Error" : "Verifying Email"}</b>
				</h3>

				<p className="mb-4 text-muted">{message}</p>

				{token ? (
				  <div className="alert alert-light border text-start mb-4">
					<small className="text-muted d-block mb-1">Verification token</small>
					<code style={{ wordBreak: "break-all" }}>{token}</code>
				  </div>
				) : null}

				<div className="d-flex justify-content-center gap-2 flex-wrap">
				  <a href="/admin/" className="btn btn-primary">
					Go to Login
				  </a>
				  {state === "error" ? (
					<button type="button" className="btn btn-outline-secondary" onClick={() => window.location.reload()}>
					  Try Again
					</button>
				  ) : null}
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	  <Script src="/admin-assets/js/plugins/jquery.min.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/plugins/popper.min.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/plugins/simplebar.min.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/plugins/bootstrap.min.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/pcoded.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/plugins/feather.min.js" strategy="afterInteractive" />
	  <Script src="/admin-assets/js/interactive-ui.js" strategy="afterInteractive" />
	  <Script id="admin-verify-email-theme-init" strategy="afterInteractive">
		{`
		  (function () {
			var savedTheme = null;
			try {
			  savedTheme = localStorage.getItem('adminTheme');
			} catch (e) {
			  savedTheme = null;
			}

			if (typeof layout_change === 'function') {
			  if (savedTheme === 'dark' || savedTheme === 'light') {
				layout_change(savedTheme);
			  } else {
				layout_change('light');
			  }
			}

			if (typeof change_box_container === 'function') change_box_container('false');
			if (typeof layout_rtl_change === 'function') layout_rtl_change('false');
			if (typeof preset_change === 'function') preset_change('preset-1');
			if (typeof font_change === 'function') font_change('Manrope');
			document.body.classList.add('admin-shell-ready');
		  })();
		`}
	  </Script>
	</>
  );
}

