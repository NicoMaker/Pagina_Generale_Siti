document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");

  const updateURLOnScroll = () => {
    let scrollY = window.scrollY + 120; // aggiusta se il tuo header è fisso

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        history.replaceState(null, null, `#${sectionId}`);
      }
    });
  };

  window.addEventListener("scroll", updateURLOnScroll);
});
