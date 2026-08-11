/**
 * Renders publication cards from assets/js/data/publications.js , the
 * real AFRICSIS publications archive (153 posts, 2013-2026), each with
 * its full article body, hosted locally on this site (this redesign is
 * slated to become the live africsis.org, so publications live here now
 * as real pages , research-article.html?id=... , not outbound links to
 * the old WordPress site).
 *
 * Handles three contexts on the same script:
 *  - [data-recent-research]  → homepage "recent research" strip (latest 3)
 *  - [data-research-grid]    → full Research/Publications library page,
 *                               with search + category + year/month archive
 *                               filters and "Load More" pagination.
 */
(function () {
  var DATA = window.AFRICSIS_PUBLICATIONS || [];
  var PAGE_SIZE = 12;

  // Exposed so research-article.html's "Related Publications" section
  // (rendered by render-research-article.js) can reuse the same card
  // markup instead of duplicating it.
  window.AFRICSIS_FORMAT_PUB_CARD = function (pub) {
    return formatCard(pub);
  };

  function truncate(text, max) {
    if (!text || text.length <= max) return text || "";
    return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
  }

  function formatCard(pub, linkPrefix) {
    linkPrefix = linkPrefix || "";
    var cats = pub.categories || [];
    var visibleCats = cats.slice(0, 2);
    var extra = cats.length - visibleCats.length;
    var badge = cats[0] || "Publication";

    return (
      '<article class="card" data-aos="fade-up">' +
      '<div class="card-media"><div class="ph-media" style="background:linear-gradient(160deg,' +
      programGradient(pub.program) +
      ')">' +
      badge +
      "</div></div>" +
      '<div class="card-body">' +
      '<div class="card-cats">' +
      visibleCats.map(function (c) { return '<span class="card-tag">' + c + "</span>"; }).join("") +
      (extra > 0 ? '<span class="card-tag card-tag-more">+' + extra + "</span>" : "") +
      "</div>" +
      '<h3 class="card-title">' +
      pub.title +
      "</h3>" +
      (pub.summary ? '<p class="card-summary">' + truncate(pub.summary, 150) + "</p>" : "") +
      '<div class="card-meta"><span>' +
      pub.monthLabel +
      " " +
      pub.year +
      "</span></div>" +
      '<a class="card-link" href="' +
      linkPrefix +
      "research-article.html?id=" +
      pub.id +
      '">Read Full Publication ' +
      arrowSvg() +
      "</a>" +
      "</div>" +
      "</article>"
    );
  }

  function programGradient(program) {
    var map = {
      "nuclear-security-nonproliferation": "#2B99CE,#145170",
      "peaceful-nuclear-use": "#3AACD9,#1F7AA8",
      "chemical-biological-threats": "#145170,#0D3852",
      "export-controls": "#2B99CE,#E57200",
      "global-warming-security": "#1F7AA8,#2B99CE",
      "space-satellite": "#0D3852,#2B99CE",
    };
    return map[program] || "#2B99CE,#145170";
  }

  function arrowSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function sortByDateDesc(a, b) {
    return b.year * 100 + b.month - (a.year * 100 + a.month);
  }

  // ---- Homepage / program pages: recent research (latest 3) ----
  // Program pages add data-program-filter="<program-id>" to scope results,
  // and data-link-prefix="../" so links still resolve from a subfolder.
  var recentEl = document.querySelector("[data-recent-research]");
  if (recentEl) {
    var programFilter = recentEl.getAttribute("data-program-filter");
    var linkPrefix = recentEl.getAttribute("data-link-prefix") || "";
    var pool = programFilter ? DATA.filter(function (p) { return p.program === programFilter; }) : DATA;
    var recent = pool.slice().sort(sortByDateDesc).slice(0, 3);
    recentEl.innerHTML = recent.length
      ? recent.map(function (pub) { return formatCard(pub, linkPrefix); }).join("")
      : '<p class="empty-state">No publications yet in this program , check back soon.</p>';
  }

  // ---- Full Research/Publications library ----
  var gridEl = document.querySelector("[data-research-grid]");
  if (!gridEl) return;

  var searchInput = document.querySelector("[data-research-search]");
  var categoryWrap = document.querySelector("[data-category-filters]");
  var archiveWrap = document.querySelector("[data-archive-filters]");
  var chipsWrap = document.querySelector("[data-active-filters]");
  var clearAllBtn = document.querySelector("[data-clear-filters]");
  var resultCountEl = document.querySelector("[data-result-count]");
  var loadMoreBtn = document.querySelector("[data-load-more]");
  var emptyState = document.querySelector("[data-research-empty]");

  var state = {
    categories: new Set(),
    year: null,
    month: null,
    query: "",
    visible: PAGE_SIZE,
  };

  // ---- Build the category checklist from the real data ----
  var allCategories = Array.from(new Set(DATA.reduce(function (acc, p) { return acc.concat(p.categories || []); }, []))).sort();
  if (categoryWrap) {
    categoryWrap.innerHTML = allCategories
      .map(function (cat) {
        var count = DATA.filter(function (p) { return p.categories.indexOf(cat) !== -1; }).length;
        return (
          '<label class="category-check">' +
          '<input type="checkbox" value="' + cat + '" />' +
          '<span>' + cat + '</span>' +
          '<span class="category-count">' + count + "</span>" +
          "</label>"
        );
      })
      .join("");

    categoryWrap.addEventListener("change", function (e) {
      var input = e.target.closest('input[type="checkbox"]');
      if (!input) return;
      if (input.checked) state.categories.add(input.value);
      else state.categories.delete(input.value);
      state.visible = PAGE_SIZE;
      render();
    });
  }

  // ---- Build the Year → Month archive accordion from the real data ----
  var byYear = {};
  DATA.forEach(function (p) {
    byYear[p.year] = byYear[p.year] || {};
    byYear[p.year][p.month] = (byYear[p.year][p.month] || 0) + 1;
  });
  var years = Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; });
  var MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (archiveWrap) {
    archiveWrap.innerHTML = years
      .map(function (year) {
        var months = Object.keys(byYear[year]).map(Number).sort(function (a, b) { return b - a; });
        var yearCount = months.reduce(function (sum, m) { return sum + byYear[year][m]; }, 0);
        return (
          '<div class="archive-year" data-year="' + year + '">' +
          '<button class="archive-year-btn" type="button">' +
          '<span>' + year + '</span>' +
          '<span class="archive-year-count">' + yearCount + "</span>" +
          '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>' +
          "</button>" +
          '<div class="archive-months">' +
          months
            .map(function (m) {
              return (
                '<button class="archive-month-btn" type="button" data-year="' + year + '" data-month="' + m + '">' +
                MONTH_NAMES[m] + ' <span class="archive-year-count">' + byYear[year][m] + "</span>" +
                "</button>"
              );
            })
            .join("") +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    archiveWrap.addEventListener("click", function (e) {
      var monthBtn = e.target.closest(".archive-month-btn");
      var yearBtn = e.target.closest(".archive-year-btn");

      if (monthBtn) {
        var y = parseInt(monthBtn.getAttribute("data-year"), 10);
        var m = parseInt(monthBtn.getAttribute("data-month"), 10);
        if (state.year === y && state.month === m) {
          state.year = null;
          state.month = null;
        } else {
          state.year = y;
          state.month = m;
        }
        state.visible = PAGE_SIZE;
        render();
        return;
      }

      if (yearBtn) {
        var yearBlock = yearBtn.closest(".archive-year");
        var year = parseInt(yearBlock.getAttribute("data-year"), 10);
        // Toggle open/closed for browsing months...
        yearBlock.classList.toggle("is-open");
        // ...and also filter to "this year, any month" as a convenience,
        // unless it's already the active year filter (click again to clear).
        if (state.year === year && state.month === null) {
          state.year = null;
        } else {
          state.year = year;
          state.month = null;
        }
        state.visible = PAGE_SIZE;
        render();
      }
    });
  }

  function syncArchiveUI() {
    if (!archiveWrap) return;
    archiveWrap.querySelectorAll(".archive-year").forEach(function (block) {
      var year = parseInt(block.getAttribute("data-year"), 10);
      var isActiveYear = state.year === year;
      block.classList.toggle("is-active", isActiveYear && state.month === null);
      if (isActiveYear) block.classList.add("is-open");
      block.querySelectorAll(".archive-month-btn").forEach(function (btn) {
        var m = parseInt(btn.getAttribute("data-month"), 10);
        btn.classList.toggle("is-active", isActiveYear && state.month === m);
      });
    });
  }

  function renderChips() {
    if (!chipsWrap) return;
    var chips = [];
    state.categories.forEach(function (cat) {
      chips.push({ label: cat, remove: function () { state.categories.delete(cat); } });
    });
    if (state.year !== null) {
      var label = state.month ? MONTH_NAMES[state.month] + " " + state.year : String(state.year);
      chips.push({
        label: label,
        remove: function () {
          state.year = null;
          state.month = null;
        },
      });
    }
    chipsWrap.style.display = chips.length ? "flex" : "none";
    chipsWrap.innerHTML = chips
      .map(function (chip, i) {
        return '<button class="filter-chip" type="button" data-chip="' + i + '">' + chip.label + " ✕</button>";
      })
      .join("");
    chipsWrap.querySelectorAll(".filter-chip").forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        chips[i].remove();
        syncCheckboxes();
        state.visible = PAGE_SIZE;
        render();
      });
    });
  }

  function syncCheckboxes() {
    if (!categoryWrap) return;
    categoryWrap.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
      input.checked = state.categories.has(input.value);
    });
  }

  function render() {
    state.query = (searchInput && searchInput.value.trim().toLowerCase()) || "";

    var results = DATA.filter(function (pub) {
      var matchesCategory = state.categories.size === 0 || pub.categories.some(function (c) { return state.categories.has(c); });
      var matchesYear = state.year === null || pub.year === state.year;
      var matchesMonth = state.month === null || pub.month === state.month;
      var matchesQuery =
        !state.query ||
        pub.title.toLowerCase().indexOf(state.query) !== -1 ||
        (pub.summary && pub.summary.toLowerCase().indexOf(state.query) !== -1) ||
        pub.categories.some(function (c) { return c.toLowerCase().indexOf(state.query) !== -1; });
      return matchesCategory && matchesYear && matchesMonth && matchesQuery;
    }).sort(sortByDateDesc);

    var visibleResults = results.slice(0, state.visible);
    gridEl.innerHTML = visibleResults.map(formatCard).join("");

    if (emptyState) emptyState.style.display = results.length ? "none" : "block";
    if (resultCountEl) {
      resultCountEl.textContent = results.length
        ? "Showing " + visibleResults.length + " of " + results.length + " publication" + (results.length === 1 ? "" : "s")
        : "No publications found";
    }
    if (loadMoreBtn) loadMoreBtn.style.display = results.length > state.visible ? "inline-flex" : "none";

    renderChips();
    syncArchiveUI();
    if (typeof AOS !== "undefined") AOS.refreshHard();
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.visible = PAGE_SIZE;
      render();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      state.visible += PAGE_SIZE;
      render();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", function () {
      state.categories.clear();
      state.year = null;
      state.month = null;
      state.visible = PAGE_SIZE;
      if (searchInput) searchInput.value = "";
      syncCheckboxes();
      render();
    });
  }

  render();
})();
