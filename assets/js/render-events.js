/**
 * Renders event cards from assets/js/data/events.js , the real AFRICSIS
 * capacity building archive (12 events, Aug 2017 - Dec 2022), each with
 * full event page content, hosted locally on this site (this redesign is
 * slated to become the live africsis.org, so events live here as real
 * pages , event.html?id=... , not outbound links to the old WordPress
 * site).
 *
 * Upcoming/Past status is computed live against the viewer's actual
 * clock, not hardcoded , every event in the current archive happens to
 * be in the past, but a newly added future-dated event would correctly
 * surface as "Upcoming" with no code changes.
 *
 *  - [data-recent-events]  → homepage strip: soonest upcoming events, or
 *                            (since the real archive currently has none
 *                            upcoming) the most recent past ones instead
 *                            of showing an empty section.
 *  - [data-events-grid]    → full Capacity Building page with
 *                            Upcoming / Past / All tabs.
 *
 * Every card links to event.html?id=... which always resolves to real
 * content , audit fix for the old "EXPIRED! / ATTEND" dead-link buttons.
 */
(function () {
  var DATA = window.AFRICSIS_EVENTS || [];
  var TODAY = new Date();

  // Exposed so event.html's "Related Events" sidebar (rendered by
  // render-event-detail.js) can reuse the same card markup.
  window.AFRICSIS_FORMAT_EVENT_CARD = function (evt) {
    return formatCard(evt);
  };

  function isUpcoming(evt) {
    return new Date(evt.date + "T23:59:59") >= TODAY;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function dateRangeLabel(evt) {
    if (evt.endDate && evt.endDate !== evt.date) {
      return formatDate(evt.date) + " – " + formatDate(evt.endDate);
    }
    return formatDate(evt.date);
  }

  function programLabel(program) {
    var map = {
      "nuclear-security-nonproliferation": "Nuclear Security & Nonproliferation",
      "peaceful-nuclear-use": "Peaceful Nuclear Use",
      "chemical-biological-threats": "Chemical & Biological Threats",
      "export-controls": "Export Controls & Strategic Trade Management",
      "global-warming-security": "Global Warming & Security",
      "space-satellite": "Space & Satellite",
    };
    return map[program] || program;
  }

  function formatCard(evt, linkPrefix) {
    linkPrefix = linkPrefix || "";
    var upcoming = isUpcoming(evt);
    return (
      '<article class="card" data-aos="fade-up">' +
      '<div class="card-media"><div class="ph-media" style="background:linear-gradient(160deg,#2B99CE,#145170)">' +
      programLabel(evt.program) +
      "</div></div>" +
      '<div class="card-body">' +
      '<span class="badge ' +
      (upcoming ? "badge-upcoming" : "badge-past") +
      '">' +
      (upcoming ? "Upcoming" : "Past Event") +
      "</span>" +
      '<h3 class="card-title">' +
      evt.title +
      "</h3>" +
      '<div class="card-meta"><span>' +
      dateRangeLabel(evt) +
      "</span></div>" +
      '<a class="card-link" href="' +
      linkPrefix +
      'event.html?id=' +
      evt.id +
      '">View Event Details ' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      "</a>" +
      "</div>" +
      "</article>"
    );
  }

  // ---- Homepage / program pages: next 3 upcoming events, falling back ----
  // to the 3 most recent past ones if nothing is genuinely upcoming.
  // Program pages add data-program-filter="<program-id>" to scope results.
  // formatCard() links to "event.html?id=..." , program pages pass
  // data-link-prefix="../" so those links still resolve from a subfolder.
  var recentEl = document.querySelector("[data-recent-events]");
  if (recentEl) {
    var programFilter = recentEl.getAttribute("data-program-filter");
    var linkPrefix = recentEl.getAttribute("data-link-prefix") || "";
    var pool = programFilter ? DATA.filter(function (e) { return e.program === programFilter; }) : DATA;

    var upcomingSorted = pool.filter(isUpcoming).sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    var picked = upcomingSorted.slice(0, 3);
    if (!picked.length) {
      picked = pool.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 3);
    }

    recentEl.innerHTML = picked.length
      ? picked.map(function (evt) { return formatCard(evt, linkPrefix); }).join("")
      : '<p class="empty-state">No events yet in this program , check the full calendar.</p>';
  }

  // ---- Full events page ----
  var gridEl = document.querySelector("[data-events-grid]");
  if (!gridEl) return;

  var tabsWrap = document.querySelector("[data-events-tabs]");
  var emptyState = document.querySelector("[data-events-empty]");
  var activeTab = (tabsWrap && tabsWrap.querySelector(".filter-pill.is-active") &&
    tabsWrap.querySelector(".filter-pill.is-active").getAttribute("data-filter")) || "all";

  function render() {
    var results = DATA.filter(function (evt) {
      if (activeTab === "upcoming") return isUpcoming(evt);
      if (activeTab === "past") return !isUpcoming(evt);
      return true;
    }).sort(function (a, b) {
      return activeTab === "past" || activeTab === "all" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
    });

    gridEl.innerHTML = results.map(function (evt) { return formatCard(evt); }).join("");
    if (emptyState) emptyState.style.display = results.length ? "none" : "block";
    if (typeof AOS !== "undefined") AOS.refreshHard();
  }

  if (tabsWrap) {
    tabsWrap.addEventListener("click", function (e) {
      var pill = e.target.closest(".filter-pill");
      if (!pill) return;
      tabsWrap.querySelectorAll(".filter-pill").forEach(function (p) {
        p.classList.remove("is-active");
      });
      pill.classList.add("is-active");
      activeTab = pill.getAttribute("data-filter");
      render();
    });
  }

  render();
})();
