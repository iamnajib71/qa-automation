import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FolderKanban,
  Gauge,
  Globe,
  PlayCircle,
  Rocket
} from "lucide-react";

export type NavigationItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const mainNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Gauge,
    description: "Portfolio summary, release readiness, and recent QA activity."
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    description: "Business systems and delivery streams under test."
  },
  {
    href: "/releases",
    label: "Releases",
    icon: Rocket,
    description: "Planned builds, release windows, and testing checkpoints."
  },
  {
    href: "/test-cases",
    label: "Test Cases",
    icon: ClipboardCheck,
    description: "Reusable functional, regression, and UAT scenarios."
  },
  {
    href: "/test-runs",
    label: "Test Runs",
    icon: PlayCircle,
    description: "Execution progress for the current release cycle."
  },
  {
    href: "/defects",
    label: "Defects",
    icon: AlertTriangle,
    description: "Logged issues, triage status, and retest outcomes."
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    description: "Operational metrics for quality and release readiness."
  },
  {
    href: "/smoke-test",
    label: "Smoke Test",
    icon: Globe,
    description: "Run a quick website smoke check and review the outcome."
  }
];
