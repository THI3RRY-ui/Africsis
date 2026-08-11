/**
 * Populates event.html from the ?id= query param, including the full
 * event page content — every event card across the site links here, so
 * there is always a real destination — no more dead-end "EXPIRED! /
 * ATTEND" buttons, and the full content lives on this site now rather
 * than linking out to the old WordPress site.
 */
(function () {
  var root = document.querySelector("[data-event-detail]");
  if (!root) return;

  var DATA = window.AFRICSIS_EVENTS || [];
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var event = DATA.find(function (e) { return e.id === id; });

  var breadcrumbCurrent = document.querySelector("[data-breadcrumb-current]");
  var relatedEl = document.querySelector("[data-related-events]");

  var PROGRAM_LABELS = {
    "nuclear-security-nonproliferation": "Nuclear Security & Nonproliferation",
    "peaceful-nuclear-use": "Peaceful Nuclear Use",
    "chemical-biological-threats": "Chemical & Biological Threats",
    "export-controls": "Export Controls & Strategic Trade Management",
    "global-warming-security": "Global Warming & Security",
    "space-satellite": "Space & Satellite",
  };

  if (!event) {
    root.innerHTML =
      '<div class="empty-state"><h2>Event not found</h2><p>This event may have been removed or the link is out of date.</p>' +
      '<a class="btn btn-primary" href="events.html">Back to Capacity Building</a></div>';
    if (relatedEl) {
      var relSection = relatedEl.closest(".sidebar-panel");
      if (relSection) relSection.style.display = "none";
    }
    return;
  }

  function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  var isUpcoming = new Date(event.date + "T23:59:59") >= new Date();
  var dateLabel = event.endDate && event.endDate !== event.date
    ? formatDate(event.date) + " – " + formatDate(event.endDate)
    : formatDate(event.date);

  document.title = event.title + " — AFRICSIS";
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = event.title;

  var bodyHtml = event.body
    ? event.body
    : "<p>" + (event.summary || "Details for this event are being migrated to the new site — check back soon.") + "</p>";

  root.innerHTML =
    '<span class="badge ' +
    (isUpcoming ? "badge-upcoming" : "badge-past") +
    '">' +
    (isUpcoming ? "Upcoming" : "Past Event") +
    "</span>" +
    "<h1>" +
    event.title +
    "</h1>" +
    '<div class="card-meta" style="margin-bottom:1.5rem;font-size:1rem;gap:1rem;">' +
    "<span>&#128197; " +
    dateLabel +
    "</span><span>&#127919; " +
    (PROGRAM_LABELS[event.program] || event.program) +
    "</span>" +
    "</div>" +
    '<div class="article-body">' +
    bodyHtml +
    "</div>" +
    '<div style="margin-top:2rem;display:flex;gap:0.75rem;flex-wrap:wrap;">' +
    (isUpcoming
      ? '<a class="btn btn-cta" href="donate.html#contact">Register Interest</a>'
      : '<a class="btn btn-secondary" href="gallery.html">View Event Gallery</a>') +
    '<a class="btn btn-secondary" href="events.html">Back to All Events</a>' +
    "</div>";

  // ---- Related events: same program, excluding this one ----
  if (relatedEl) {
    var related = DATA.filter(function (e) { return e.id !== event.id && e.program === event.program; })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, 3);

    if (related.length && window.AFRICSIS_FORMAT_EVENT_CARD) {
      relatedEl.innerHTML = related.map(function (e) { return window.AFRICSIS_FORMAT_EVENT_CARD(e); }).join("");
    } else {
      var panel = relatedEl.closest(".sidebar-panel");
      if (panel) panel.style.display = "none";
    }
  }
})();
