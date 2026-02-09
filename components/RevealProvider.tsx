"use client";

import { useEffect } from "react";

<<<<<<< HEAD
=======
/**
 * Attaches a single IntersectionObserver to all `.reveal` elements.
 * When an element enters the viewport it gets `.visible` (triggers CSS transition).
 * Also re-scans the DOM on every route change via MutationObserver.
 */
>>>>>>> 79ae6ec (Update version)
export default function RevealProvider() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
<<<<<<< HEAD
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "-30px" }
=======
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "-40px" }
>>>>>>> 79ae6ec (Update version)
    );

    function scan() {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => io.observe(el));
    }

    scan();
<<<<<<< HEAD
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
=======

    // Re-scan on DOM mutations (route changes in SPA)
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
>>>>>>> 79ae6ec (Update version)
  }, []);

  return null;
}
