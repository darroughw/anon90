"use client";

import { useSyncExternalStore } from "react";
import { Switch } from "@/components/ui";

const STORAGE_KEY = "rr-theme";
const THEME_EVENT = "rr-theme-change";

function getSnapshot() {
  return document.documentElement.dataset.theme !== "light";
}

// Matches the <html> attribute the blocking inline script (see layout.tsx)
// sets before hydration: dark is the default, so the SSR snapshot has to
// agree with that or React will complain about a hydration mismatch.
function getServerSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleChange(checked: boolean) {
    const theme = checked ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing / storage disabled -- the toggle still works for
      // this page load, it just won't persist.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return <Switch label="Dark mode" checked={isDark} onCheckedChange={handleChange} />;
}
