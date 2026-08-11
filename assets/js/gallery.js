/**
 * Gallery filtering (Photos/Videos/All) and a lightweight lightbox.
 * All media are placeholders (.ph-media divs) until real photography
 * is supplied , swap the markup in gallery.html, this script doesn't
 * need to change.
 */
(function () {
  var grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;

  var items = grid.querySelectorAll(".gallery-item");
  var tabsWrap = document.querySelector("[data-gallery-tabs]");
  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxMedia = lightbox && lightbox.querySelector("[data-lightbox-media]");
  var lightboxCaption = lightbox && lightbox.querySelector("[data-lightbox-caption]");
  var lightboxClose = lightbox && lightbox.querySelector(".lightbox-close");

  if (tabsWrap) {
    tabsWrap.addEventListener("click", function (e) {
      var pill = e.target.closest(".filter-pill");
      if (!pill) return;
      tabsWrap.querySelectorAll(".filter-pill").forEach(function (p) {
        p.classList.remove("is-active");
      });
      pill.classList.add("is-active");
      var filter = pill.getAttribute("data-filter");

      items.forEach(function (item) {
        var type = item.getAttribute("data-type");
        item.style.display = filter === "all" || filter === type ? "" : "none";
      });
    });
  }

  if (lightbox) {
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var mediaHTML = item.querySelector(".ph-media").outerHTML;
        var caption = item.getAttribute("data-caption") || "";
        lightboxMedia.innerHTML = mediaHTML;
        lightboxCaption.textContent = caption;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();
