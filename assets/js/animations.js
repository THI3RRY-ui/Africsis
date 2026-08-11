/**
 * Scroll reveals (AOS), count-up stats, hero orbital parallax,
 * and the partners carousel controls.
 */
(function () {
  // ---- AOS scroll-reveal init ----
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }

  // ---- Fallback reveal for elements not using AOS ----
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---- Count-up stats ----
  var counters = document.querySelectorAll(".count-up");
  if (counters.length && "IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-target") || el.textContent);
          var suffix = el.getAttribute("data-suffix") || "";
          var duration = 1400;
          var start = null;

          function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countIO.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      countIO.observe(el);
    });
  }

  // ---- Hero orbital parallax (subtle, follows the pointer) ----
  var orbital = document.querySelector(".orbital-hero");
  if (orbital && window.matchMedia("(pointer: fine)").matches) {
    var bounds;
    window.addEventListener("resize", function () {
      bounds = orbital.getBoundingClientRect();
    });
    bounds = orbital.getBoundingClientRect();

    document.addEventListener("mousemove", function (e) {
      var relX = (e.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      var relY = (e.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      var x = Math.max(-1, Math.min(1, relX)) * 10;
      var y = Math.max(-1, Math.min(1, relY)) * 10;
      orbital.style.transform = "translate(" + x + "px, " + y + "px)";
    });
  }

  // ---- Partners carousel ----
  var track = document.querySelector(".partners-track");
  var prevBtn = document.querySelector(".carousel-btn.prev");
  var nextBtn = document.querySelector(".carousel-btn.next");
  if (track && prevBtn && nextBtn) {
    var scrollAmount = function () {
      return track.clientWidth * 0.7;
    };
    prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });
    nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
  }

  // ---- GSAP scroll-driven touches (only runs if GSAP + ScrollTrigger loaded) ----
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var items = group.children;
      gsap.from(items, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: group,
          start: "top 85%",
        },
      });
    });
  }
})();
