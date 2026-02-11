<<<<<<< HEAD
"use client";

import { useEffect } from "react";

/**
 * Attaches a single IntersectionObserver to all `.reveal` elements.
 * When an element enters the viewport it gets `.visible` (triggers CSS transition).
 * Also re-scans the DOM on every route change via MutationObserver.
 */
=======
﻿"use client";

import { useEffect } from "react";

>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
export default function RevealProvider() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
<<<<<<< HEAD
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "-40px" }
=======
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "-30px" }
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
    );

    function scan() {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => io.observe(el));
    }

    scan();
<<<<<<< HEAD

    // Re-scan on DOM mutations (route changes in SPA)
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
=======
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
>>>>>>> d767d44c790a81da87a628ee26c740ecfe1fdfc4
  }, []);

  return null;
}
