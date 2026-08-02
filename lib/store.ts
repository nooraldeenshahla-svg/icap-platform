import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "ar" | "en";

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: "ar",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "ar" ? "en" : "ar" }),
    }),
    { name: "icap-app-store" }
  )
);
