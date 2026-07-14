"use client";

import { createContext, useContext, useState, useEffect } from "react";
import si from "@/locales/si.json";
import en from "@/locales/en.json";

const translations = { si, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("si");

  useEffect(() => {
    const saved = localStorage.getItem("sathkara_lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("sathkara_lang", newLang);
  };

  const t = (key) => {
    return key.split(".").reduce((obj, k) => obj?.[k], translations[lang]) || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
