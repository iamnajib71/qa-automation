export type AppRole = "admin" | "qa_analyst" | "viewer";

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  qa_analyst: "QA Analyst",
  viewer: "Viewer"
};

export function canEdit(role: AppRole) {
  return role === "admin" || role === "qa_analyst";
}
