/**
 * Header, mobile nav, dropdowns, back-to-top.
 * Safe to include on every page — it no-ops if elements aren't present.
 */
(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  var backToTop = document.querySelector(".back-to-top");

  // Sticky header shadow on scroll
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      if (backToTop) {
        backToTop.classList.toggle("is-visible", window.scrollY > 600);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu toggle
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close mobile menu when a plain link is clicked
    nav.querySelectorAll(".nav-link:not([aria-haspopup])").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // Dropdowns: hover on desktop (handled by CSS), click/tap on mobile
  document.querySelectorAll(".nav-item.has-dropdown > .nav-link").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      if (window.innerWidth > 960) return; // desktop uses CSS hover
      e.preventDefault();
      var dropdown = trigger.nextElementSibling;
      var isOpen = dropdown.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  });

  // Back to top
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Highlight current nav item based on the page's data-page attribute
  var currentPage = document.body.getAttribute("data-page");
  if (currentPage) {
    document.querySelectorAll('[data-nav="' + currentPage + '"]').forEach(function (el) {
      el.closest(".nav-item").classList.add("current");
    });
  }
})();
