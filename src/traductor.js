import React, { createContext, useState } from "react";
import axios from "axios";

export const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "es");
  const [translations, setTranslations] = useState({});

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translateText = async (text, id) => {
    if (translations[id]) return translations[id]; // Usa traducción en caché

    try {
      const response = await axios.post("https://libretranslate.com/translate", {
        q: text,
        source: "auto",
        target: language,
        format: "text",
      });
      const translatedText = response.data.translatedText;

      // Guarda la traducción en caché
      setTranslations((prev) => ({ ...prev, [id]: translatedText }));
      return translatedText;
    } catch (error) {
      console.error("Error en la traducción:", error);
      return text; // Devuelve el texto original si hay un error
    }
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: updateLanguage, translateText }}>
      {children}
    </TranslationContext.Provider>
  );
};
