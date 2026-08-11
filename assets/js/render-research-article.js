/**
 * Populates research-article.html from the ?id= query param.
 * Every publication card across the site links here , the real article
 * content lives on this site now (this redesign is slated to become the
 * live africsis.org), not as an outbound link to the old WordPress site.
 */
(function () {
  var root = document.querySelector("[data-article-root]");
  if (!root) return;

  var DATA = window.AFRICSIS_PUBLICATIONS || [];
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var pub = DATA.find(function (p) { return p.id === id; });

  var breadcrumbCurrent = document.querySelector("[data-breadcrumb-current]");
  var titleEl = document.querySelector("[data-article-title]");
  var metaEl = document.querySelector("[data-article-meta]");
  var catsEl = document.querySelector("[data-article-cats]");
  var bodyEl = document.querySelector("[data-article-body]");
  var relatedEl = document.querySelector("[data-related-publications]");

  if (!pub) {
    root.innerHTML =
      '<div class="empty-state"><h2>Publication not found</h2><p>This publication may have been moved or the link is out of date.</p>' +
      '<a class="btn btn-primary" href="research.html">Back to Research &amp; Publications</a></div>';
    return;
  }

  document.title = pub.title + " , AFRICSIS";

  if (breadcrumbCurrent) breadcrumbCurrent.textContent = pub.title;
  if (titleEl) titleEl.textContent = pub.title;
  if (metaEl) metaEl.textContent = pub.monthLabel + " " + pub.year;
  if (catsEl) {
    catsEl.innerHTML = pub.categories
      .map(function (c) { return '<span class="card-tag">' + c + "</span>"; })
      .join("");
  }
  if (bodyEl) {
    if (pub.body) {
      bodyEl.innerHTML = pub.body;
    } else if (pub.summary) {
      bodyEl.innerHTML = "<p>" + pub.summary + "</p>";
    } else {
      bodyEl.innerHTML = "<p>The full text for this publication is being migrated to the new site , check back soon.</p>";
    }
  }

  // ---- Related publications: same primary category, excluding this one ----
  if (relatedEl) {
    var primaryCat = pub.categories[0];
    var related = DATA.filter(function (p) {
      return p.id !== pub.id && p.categories.indexOf(primaryCat) !== -1;
    })
      .sort(function (a, b) { return b.year * 100 + b.month - (a.year * 100 + a.month); })
      .slice(0, 3);

    if (related.length && window.AFRICSIS_FORMAT_PUB_CARD) {
      relatedEl.innerHTML = related.map(function (p) { return window.AFRICSIS_FORMAT_PUB_CARD(p); }).join("");
    } else {
      var relatedSection = relatedEl.closest("section");
      if (relatedSection) relatedSection.style.display = "none";
    }
  }
})();
