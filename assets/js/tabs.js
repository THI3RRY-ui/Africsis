/**
 * Generic tab controller for the About page's five sub-sections
 * (Who We Are / Where We Work / Our Staff / Partnerships / Advisory Board).
 * Syncs with the URL hash so header dropdown links like
 * about.html#staff land directly on the right tab.
 */
(function () {
  var tabsWrap = document.querySelector("[data-tabs]");
  if (!tabsWrap) return;

  var buttons = tabsWrap.querySelectorAll(".tab-btn");
  var panels = document.querySelectorAll("[data-tab-panel]");

  function activate(tabId, scroll) {
    buttons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-tab") === tabId);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === tabId);
    });
    if (scroll) {
      var target = document.querySelector("[data-tabs-anchor]");
      if (target) {
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -90 });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tabId = btn.getAttribute("data-tab");
      activate(tabId, false);
      history.replaceState(null, "", "#" + tabId);
    });
  });

  var initial = window.location.hash ? window.location.hash.slice(1) : null;
  if (initial && tabsWrap.querySelector('[data-tab="' + initial + '"]')) {
    activate(initial, true);
  }
})();
