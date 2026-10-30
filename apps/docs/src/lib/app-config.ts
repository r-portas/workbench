import { BookOpen, History, Home } from "lucide-react";

import type { SidebarItem } from "@/components/ui/sidebar";

/**
 * The app name, used for the page title and meta tags.
 */
export const APP_NAME = "Workbench";

/** Icons listed in the sidebar nav rail. */
export const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: Home, title: "Home", to: "/", activeOptions: { exact: true } },
  { icon: BookOpen, title: "README", to: "/readme" },
  { icon: History, title: "Changelog", to: "/changelog" },
];
