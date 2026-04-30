import { ReactNode } from "react";

export default function VerifyCommentLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Comment</title>
        <link rel="icon" href="/assets/img/favicon.svg" type="image/x-icon" />
      </head>
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7fb", color: "#1f2937", fontFamily: "Arial, Helvetica, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
