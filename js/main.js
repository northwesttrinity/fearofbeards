(function () {
  // stamp current year into footer
  document.querySelectorAll(".js-year").forEach((el) => {
    el.textContent = el.textContent.replace("{{YEAR}}", new Date().getFullYear());
  });

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
