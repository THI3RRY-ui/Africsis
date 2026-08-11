/**
 * Buttery smooth scrolling via Lenis, wired into GSAP's ScrollTrigger
 * so scroll-driven animations stay perfectly in sync.
 * Both libraries are loaded from CDN in each page's <head>/before </body>.
 */
(function () {
  if (typeof Lenis === "undefined") return; // CDN blocked/offline: page still works, just no smooth scroll

  var lenis = new Lenis({
    duration: 1.1,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    smoothWheel: true,
  });

  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Smooth-scroll same-page anchor links (nav, breadcrumbs, "back to top", etc.)
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
    });
  });
})();
