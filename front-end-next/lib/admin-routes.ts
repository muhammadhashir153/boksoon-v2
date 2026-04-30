export type AdminRole = "admin" | "manager" | "author" | "reviwer";

type RoutePermission = {
  pattern: RegExp;
  roles: AdminRole[];
};

const routePermissions: RoutePermission[] = [
  { pattern: /^\/admin$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/profile$/, roles: ["admin", "manager", "author", "reviwer"] },
  { pattern: /^\/admin\/donations$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/donations\/new$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/donations\/[^/]+$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/donors$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/donors\/new$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/donors\/[^/]+$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/transactions$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/transactions\/new$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/transactions\/[^/]+$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/trash$/, roles: ["admin", "manager", "author", "reviwer"] },
  { pattern: /^\/admin\/testimonials$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/testimonials\/new$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/testimonials\/[^/]+$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/comments$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/comments\/[^/]+$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/blogs$/, roles: ["admin", "manager", "author"] },
  { pattern: /^\/admin\/blogs\/new$/, roles: ["admin", "manager", "author"] },
  { pattern: /^\/admin\/blogs\/[^/]+$/, roles: ["admin", "manager", "author"] },
  { pattern: /^\/admin\/books$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/books\/new$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/books\/[^/]+$/, roles: ["admin", "manager", "reviwer"] },
  { pattern: /^\/admin\/contacts$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/newsletter$/, roles: ["admin", "manager"] },
  { pattern: /^\/admin\/users$/, roles: ["admin"] },
  { pattern: /^\/admin\/users\/new$/, roles: ["admin"] },
  { pattern: /^\/admin\/users\/update-pass$/, roles: ["admin"] },
  { pattern: /^\/admin\/users\/[^/]+$/, roles: ["admin"] },
  { pattern: /^\/admin\/ministries$/, roles: ["admin"] },
  { pattern: /^\/admin\/ministries\/new$/, roles: ["admin"] },
  { pattern: /^\/admin\/ministries\/[^/]+$/, roles: ["admin"] }
];

export function normalizeAdminRole(roleName: string | null | undefined): AdminRole {
  if (roleName === "reviewer") {
    return "reviwer";
  }

  return (roleName || "admin") as AdminRole;
}

export function defaultAdminRouteForRole(role: AdminRole) {
  switch (role) {
    case "manager":
      return "/admin";
    case "author":
      return "/admin/blogs";
    case "reviwer":
      return "/admin/testimonials";
    case "admin":
    default:
      return "/admin";
  }
}

export function adminRouteAllowed(pathname: string, role: AdminRole) {
  const permission = routePermissions.find((entry) => entry.pattern.test(pathname));
  if (!permission) {
    return role === "admin";
  }

  return permission.roles.includes(role);
}
