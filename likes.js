/* Parfum-Titia — compteur public de pouces 👍. Aucun vote fictif et aucune collecte de données personnelles. */
(function () {
  "use strict";
  var endpoint = "https://api.github.com/repos/Titiaparfum/Parfum-Titia./issues/3";
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-like-count]"));
  var statuses = Array.prototype.slice.call(document.querySelectorAll("[data-like-status]"));
  if (!counters.length) return;
  var inProgress = false;
  var lastRequest = 0;
  function show(status, count) {
    var english = document.documentElement.lang === "en";
    counters.forEach(function (node) {
      node.textContent = status === "ok" ? new Intl.NumberFormat(english ? "en" : "fr").format(count) : "—";
    });
    statuses.forEach(function (node) {
      var frNode = node.querySelector("[data-like-fr]");
      var enNode = node.querySelector("[data-like-en]");
      var frText = status === "ok"
        ? "Pouces 👍 vérifiés sur GitHub, et non visites du site."
        : "Compteur indisponible pour le moment. Consultez GitHub pour les 👍 actuels.";
      var enText = status === "ok"
        ? "Verified GitHub 👍 reactions, not page views."
        : "Count temporarily unavailable. Check GitHub for current 👍 reactions.";
      if (frNode && enNode) {
        frNode.textContent = frText;
        enNode.textContent = enText;
      } else {
        node.textContent = english ? enText : frText;
      }
    });
  }
  function refresh() {
    if (inProgress || Date.now() - lastRequest < 15000) return;
    inProgress = true;
    lastRequest = Date.now();
    fetch(endpoint, {
      cache: "no-store",
      headers: { "Accept": "application/vnd.github+json" }
    }).then(function (response) {
      if (!response.ok) throw new Error("GitHub unavailable: " + response.status);
      return response.json();
    }).then(function (data) {
      var n = data && data.reactions && data.reactions["+1"];
      if (!Number.isInteger(n) || n < 0) throw new Error("No verified 👍 count");
      show("ok", n);
    }).catch(function () { show("error", null); })
      .finally(function () { inProgress = false; });
  }
  refresh();
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) refresh();
  });
  window.addEventListener("focus", refresh);
  document.querySelectorAll("[data-like-refresh]").forEach(function (node) {
    node.addEventListener("click", function () {
      lastRequest = 0;
      refresh();
    });
  });
}());
