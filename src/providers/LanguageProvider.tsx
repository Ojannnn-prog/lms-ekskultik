"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries, Locale } from "../lib/dictionaries";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    // Check localStorage first
    const savedLocale = localStorage.getItem("lms_lang") as Locale;
    if (savedLocale && (savedLocale === "id" || savedLocale === "en")) {
      setLocaleState(savedLocale);
    } else {
      // Check document cookie
      const cookies = document.cookie.split("; ");
      const langCookie = cookies.find((row) => row.startsWith("lms_lang="));
      if (langCookie) {
        const val = langCookie.split("=")[1] as Locale;
        if (val === "id" || val === "en") {
          setLocaleState(val);
        }
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("lms_lang", newLocale);
    document.cookie = `lms_lang=${newLocale}; path=/; max-age=31536000`; // 1 year
  };

  const t = (path: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[locale];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return path; // return key if not found
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
