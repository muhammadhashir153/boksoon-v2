export function money(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(value || 0);
  } catch {
    return `$${Math.round(value || 0)}`;
  }
}

export function parseApiDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatLocalDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  const date = parseApiDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", options || {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export function formatLocalDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  const date = parseApiDate(value);
  if (!date) return "";
  return date.toLocaleString("en-US", options || {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatDeletedAt(value?: string | null) {
  return formatLocalDateTime(value) || "recently";
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  return formatLocalDate(value, options);
}

export function formatDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  return formatLocalDateTime(value, options);
}
