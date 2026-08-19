(function () {
  // stamp current year into footer
  document.querySelectorAll(".js-year").forEach((el) => {
    el.textContent = el.textContent.replace("{{YEAR}}", new Date().getFullYear());
  });

  // unique visitor counter — reads/increments via /api/hit (Cloudflare Pages
  // Function + KV). Stays hidden if the endpoint isn't configured, so the
  // footer looks intentional either way. See functions/api/hit.js.
  (function loadVisitorCounter() {
    const wrap = document.getElementById("visitorCounter");
    const digitsEl = document.getElementById("vcDigits");
    if (!wrap || !digitsEl) return;

    fetch("/api/hit", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!data || typeof data.count !== "number") return;
        const digits = String(data.count).padStart(6, "0").split("");
        digitsEl.innerHTML = "";
        digits.forEach((d) => {
          const span = document.createElement("span");
          span.className = "vc-digit";
          span.textContent = d;
          digitsEl.appendChild(span);
        });
        wrap.hidden = false;
      })
      .catch(() => {
        // endpoint missing / KV not bound — stay hidden
      });
  })();

  // gentle reveal-on-scroll for section headings
  const targets = document.querySelectorAll(".split-heading, .photo-item, .player");
  if ("IntersectionObserver" in window) {
    targets.forEach((t) => (t.style.opacity = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => {
      t.style.transform = "translateY(14px)";
      io.observe(t);
    });
  }
})();
