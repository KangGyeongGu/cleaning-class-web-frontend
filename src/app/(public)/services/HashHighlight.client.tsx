"use client";

import { useEffect } from "react";

export function HashHighlight(): null {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || !hash.startsWith("service-")) return;

    const article = document.getElementById(hash);
    if (!article) return;

    const heading = article.querySelector("h3");
    if (!heading) return;

    heading.style.transition = "background-color 0.4s ease, padding 0.4s ease";
    heading.style.backgroundColor = "rgb(241 245 249)";
    heading.style.padding = "0.25rem 0.5rem";
    heading.style.marginLeft = "-0.5rem";
    heading.style.borderRadius = "0.25rem";

    const timer = setTimeout(() => {
      heading.style.backgroundColor = "transparent";
      heading.style.padding = "0";
      heading.style.marginLeft = "0";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
