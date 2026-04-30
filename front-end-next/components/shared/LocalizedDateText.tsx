"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateTime, formatDeletedAt } from "@/lib/format";

type LocalizedDateTextProps = {
  value?: string | null;
  variant?: "date" | "dateTime" | "deletedAt";
  fallback?: string;
  className?: string;
  options?: Intl.DateTimeFormatOptions;
};

function formatByVariant(
  value: string | null | undefined,
  variant: NonNullable<LocalizedDateTextProps["variant"]>,
  options?: Intl.DateTimeFormatOptions
) {
  if (variant === "deletedAt") {
    return formatDeletedAt(value);
  }

  if (variant === "dateTime") {
    return formatDateTime(value, options);
  }

  return formatDate(value, options);
}

export function LocalizedDateText({
  value,
  variant = "date",
  fallback = "",
  className,
  options,
}: LocalizedDateTextProps) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    const formatted = formatByVariant(value, variant, options);
    setText(formatted || fallback);
  }, [fallback, options, value, variant]);

  return (
    <time className={className} dateTime={value || undefined} suppressHydrationWarning>
      {text}
    </time>
  );
}
