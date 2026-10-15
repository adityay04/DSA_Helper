(function () {
  "use strict";

  const workbook = window.DSA_DATA;
  const problems = workbook["250 Problems"];
  const patterns = workbook["Pattern Summary"];
  const priorities = workbook["Priority Summary"];
  const studyPlan = workbook["Study Plan"];
  const storageKey = "dsa-atlas-completed-v1";
  const themeStorageKey = "dsa-atlas-theme-v1";
  const pageSize = 20;
  const state = {
    page: 1,
    layout: "table",
    view: "problems",
    completed: loadProgress()
  };

  const elements = {
    nav: Array.from(document.querySelectorAll(".nav-link")),
    views: {
      problems: document.getElementById("view-problems"),
      patterns: document.getElementById("view-patterns"),
      plan: document.getElementById("view-plan")
    },
    search: document.getElementById("search-input"),
    pattern: document.getElementById("filter-pattern"),
    difficulty: document.getElementById("filter-difficulty"),
    priority: document.getElementById("filter-priority"),
    status: document.getElementById("filter-status"),
    table: document.getElementById("problem-table-body"),
    tableWrap: document.getElementById("problem-table-wrap"),
    cards: document.getElementById("problem-card-grid"),
    empty: document.getElementById("empty-state"),
    summary: document.getElementById("results-summary"),
    pageIndicator: document.getElementById("page-indicator"),
    previous: document.getElementById("previous-page"),
    next: document.getElementById("next-page"),
    activeFilterRow: document.getElementById("active-filter-row"),
    activeFilterLabel: document.getElementById("active-filter-label")
  };

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
      console.warn("Could not read saved DSA progress.", error);
      return {};
    }
  }

  function setTheme(theme, shouldSave) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.body.dataset.theme = selectedTheme;
    const toggle = document.getElementById("theme-toggle");
    const isDark = selectedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + nextTheme + " theme");
    toggle.setAttribute("title", "Switch to " + nextTheme + " theme");
    toggle.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
    toggle.querySelector(".theme-label").textContent = isDark ? "Light" : "Dark";
    document.querySelector('meta[name="theme-color"]').setAttribute("content", isDark ? "#11110f" : "#f3f1e9");
    if (shouldSave) {
      try {
        localStorage.setItem(themeStorageKey, selectedTheme);
      } catch (error) {
        console.error("Could not save the theme preference to this browser.", error);
      }
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.completed));
    } catch (error) {
      console.error("Could not save DSA progress to this browser.", error);
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function isCompleted(problem) {
    return Boolean(state.completed[problem["No."]]);
  }

  function completedCount() {
    return problems.reduce(function (count, problem) {
      return count + (isCompleted(problem) ? 1 : 0);
    }, 0);
  }

  function updateProgress() {
    const done = completedCount();
    const percentage = done ? Math.max(1, Math.round((done / problems.length) * 100)) : 0;
    document.getElementById("top-progress-text").textContent = done + " / " + problems.length + " completed";
    document.getElementById("stat-progress").textContent = percentage + "%";
    document.getElementById("stat-progress-foot").textContent = done + " problem" + (done === 1 ? "" : "s") + " completed";
    renderPatterns();
  }

  function setupOverview() {
    document.getElementById("stat-total").textContent = problems.length;
    document.getElementById("stat-patterns").textContent = patterns.length;
    const mustDo = priorities.find(function (item) { return item.Priority === "Must Do"; });
    document.getElementById("stat-must").textContent = mustDo ? mustDo.Count : "—";
    document.getElementById("problem-count").textContent = problems.length;
    const names = Array.from(new Set(problems.map(function (problem) { return problem.Pattern; })));
    names.forEach(function (name) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      elements.pattern.appendChild(option);
    });
  }

  function currentProblems() {
    const query = elements.search.value.trim().toLowerCase();
    return problems.filter(function (problem) {
      const matchesQuery = !query || [
        problem["No."], problem["LeetCode #"], problem.Problem, problem.Pattern,
        problem["Core Technique"], problem.Notes, problem.Priority, problem.Difficulty
      ].some(function (value) { return String(value || "").toLowerCase().includes(query); });
      const matchesPattern = !elements.pattern.value || problem.Pattern === elements.pattern.value;
      const matchesDifficulty = !elements.difficulty.value || problem.Difficulty === elements.difficulty.value;
      const matchesPriority = !elements.priority.value || problem.Priority === elements.priority.value;
      const matchesStatus = !elements.status.value ||
        (elements.status.value === "done" ? isCompleted(problem) : !isCompleted(problem));
      return matchesQuery && matchesPattern && matchesDifficulty && matchesPriority && matchesStatus;
    });
  }

  function statusCheckbox(problem, className) {
    return '<input class="status-check ' + className + '" type="checkbox" data-problem="' +
      escapeHtml(problem["No."]) + '" aria-label="Mark ' + escapeHtml(problem.Problem) +
      ' as completed"' + (isCompleted(problem) ? " checked" : "") + '>';
  }

  function difficultyBadge(difficulty) {
    const className = { Easy: "easy", Medium: "medium", Hard: "hard" }[difficulty] || "easy";
    return '<span class="badge difficulty-' + className + '">' + escapeHtml(difficulty) + "</span>";
  }

  function priorityBadge(priority) {
    const className = {
      "Must Do": "must",
      "Should Do": "should",
      Advanced: "advanced",
      "Good to Know": "good"
    }[priority] || "good";
    return '<span class="badge priority-' + className + '">' + escapeHtml(priority) + "</span>";
  }

  function problemUrl(problem) {
    return /^https:\/\/leetcode\.com\/problems\/[\w-]+\/?$/.test(problem["Practice Link"])
      ? problem["Practice Link"]
      : "#";
  }

  function renderTable(items) {
    elements.table.innerHTML = items.map(function (problem) {
      const technique = problem["Core Technique"] +
        (problem.Notes ? " · " + problem.Notes : "");
      return "<tr>" +
        '<td class="problem-number">' + escapeHtml(problem["No."]) + "</td>" +
        '<td><div class="problem-name"><div><a href="' + escapeHtml(problemUrl(problem)) +
          '" target="_blank" rel="noopener noreferrer">' + escapeHtml(problem.Problem) +
          '</a><div class="technique">' + escapeHtml(technique) +
          '</div></div><span class="leetcode-id">LC ' +
          escapeHtml(problem["LeetCode #"]) + "</span></div></td>" +
        '<td><button class="pattern-link" data-pattern="' + escapeHtml(problem.Pattern) +
          '" title="Pattern ' + escapeHtml(problem["Pattern #"]) + '">' +
          escapeHtml(problem.Pattern) + "</button></td>" +
        "<td>" + difficultyBadge(problem.Difficulty) + "</td>" +
        "<td>" + priorityBadge(problem.Priority) + "</td>" +
        '<td class="status-cell">' + statusCheckbox(problem, "table-check") + "</td>" +
        "</tr>";
    }).join("");
  }

  function renderCards(items) {
    elements.cards.innerHTML = items.map(function (problem) {
      return '<article class="problem-card"><div class="problem-card-top">' +
        '<span class="problem-card-number">#' + escapeHtml(problem["No."]) + " · LC " +
        escapeHtml(problem["LeetCode #"]) + "</span>" + statusCheckbox(problem, "card-check") +
        '</div><h3><a href="' + escapeHtml(problemUrl(problem)) +
        '" target="_blank" rel="noopener noreferrer">' + escapeHtml(problem.Problem) + "</a></h3>" +
        '<p class="problem-card-technique">' + escapeHtml(problem["Core Technique"]) +
        (problem.Notes ? " · " + escapeHtml(problem.Notes) : "") + "</p>" +
        '<div class="problem-card-footer"><div class="card-tags">' +
        difficultyBadge(problem.Difficulty) + priorityBadge(problem.Priority) +
        '</div></div><div class="problem-card-pattern">' + escapeHtml(problem.Pattern) +
        "</div></article>";
    }).join("");
  }

  function renderProblems() {
    const filtered = currentProblems();
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.page = Math.min(state.page, pageCount);
    const start = (state.page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    const hasResults = filtered.length > 0;

    elements.tableWrap.hidden = !hasResults || state.layout !== "table";
    elements.cards.hidden = !hasResults || state.layout !== "cards";
    elements.empty.hidden = hasResults;
    elements.summary.textContent = hasResults
      ? "Showing " + (start + 1) + "–" + Math.min(start + pageSize, filtered.length) + " of " + filtered.length
      : "No results";
    elements.pageIndicator.textContent = state.page + " / " + pageCount;
    elements.previous.disabled = state.page <= 1;
    elements.next.disabled = state.page >= pageCount;
    elements.activeFilterRow.hidden = !(elements.pattern.value || elements.difficulty.value ||
      elements.priority.value || elements.status.value || elements.search.value);
    const activeFilters = [
      elements.pattern.value,
      elements.difficulty.value,
      elements.priority.value,
      elements.status.value ? (elements.status.value === "done" ? "Completed" : "To do") : "",
      elements.search.value ? 'Search: "' + elements.search.value + '"' : ""
    ].filter(Boolean);
    elements.activeFilterLabel.textContent = activeFilters.length
      ? activeFilters.join(" · ") + " — " + filtered.length + " result" + (filtered.length === 1 ? "" : "s")
      : "";

    if (state.layout === "table") renderTable(pageItems);
    else renderCards(pageItems);
  }

  function renderPatterns() {
    const container = document.getElementById("pattern-summary");
    if (!container) return;
    document.getElementById("priority-breakdown").innerHTML = priorities.map(function (item) {
      return '<div class="priority-stat"><span>' + escapeHtml(item.Priority) +
        '</span><strong>' + escapeHtml(item.Count) + "</strong></div>";
    }).join("");
    container.innerHTML = patterns.map(function (pattern) {
      const related = problems.filter(function (problem) { return problem.Pattern === pattern.Pattern; });
      const done = related.filter(isCompleted).length;
      const percent = related.length ? Math.round((done / related.length) * 100) : 0;
      const mustDo = pattern.Must_Do || "0";
      const shouldDo = pattern.Should_Do || "0";
      const advanced = pattern.Advanced || "0";
      return '<article class="pattern-card" tabindex="0" role="button" data-pattern-card="' +
        escapeHtml(pattern.Pattern) + '"><div class="pattern-card-top"><span class="pattern-index">PATTERN ' +
        String(pattern["Pattern #"]).padStart(2, "0") + '</span><span class="pattern-count">' +
        escapeHtml(pattern.Problems) + " problems</span></div><h3>" + escapeHtml(pattern.Pattern) +
        '</h3><div class="pattern-progress"><span>' + mustDo + ' Must · ' + shouldDo +
        ' Should · ' + advanced + ' Advanced</span></div><div class="pattern-progress">' +
        '<span>' + done + "/" + related.length +
        ' done</span><div class="mini-progress"><span style="width:' + percent +
        '%"></span></div><span>' + percent + "%</span></div></article>";
    }).join("");
  }

  function renderPlan() {
    document.getElementById("plan-timeline").innerHTML = studyPlan.map(function (phase, index) {
      return '<article class="phase-card"><span class="phase-number">' +
        String(index + 1).padStart(2, "0") + '</span><div><span class="phase-label">' +
        escapeHtml(phase.Phase) + '</span><h3>' + escapeHtml(phase.Topics) +
        '</h3><p class="phase-goal"><strong>Goal:</strong> ' + escapeHtml(phase.Goal) +
        '</p></div><span class="phase-range">' + escapeHtml(phase["Pattern #"]) + "</span></article>";
    }).join("");
  }

  function showView(view) {
    state.view = view;
    Object.keys(elements.views).forEach(function (name) {
      elements.views[name].hidden = name !== view;
    });
    elements.nav.forEach(function (button) {
      const active = button.dataset.view === view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (view === "patterns") renderPatterns();
    if (view === "problems") renderProblems();
  }

  function resetFilters() {
    elements.search.value = "";
    elements.pattern.value = "";
    elements.difficulty.value = "";
    elements.priority.value = "";
    elements.status.value = "";
    state.page = 1;
    renderProblems();
  }

  function setPatternFilter(pattern) {
    elements.pattern.value = pattern;
    state.page = 1;
    showView("problems");
  }

  function toggleProblem(problemNumber, checked) {
    if (checked) state.completed[problemNumber] = true;
    else delete state.completed[problemNumber];
    saveProgress();
    updateProgress();
    renderProblems();
  }

  elements.nav.forEach(function (button) {
    button.addEventListener("click", function () { showView(button.dataset.view); });
  });
  document.querySelectorAll(".hero [data-view]").forEach(function (button) {
    button.addEventListener("click", function () { showView(button.dataset.view); });
  });

  [elements.search, elements.pattern, elements.difficulty, elements.priority, elements.status]
    .forEach(function (control) {
      control.addEventListener(control === elements.search ? "input" : "change", function () {
        state.page = 1;
        renderProblems();
      });
    });

  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("empty-reset").addEventListener("click", resetFilters);
  document.getElementById("clear-pattern-filter").addEventListener("click", resetFilters);
  elements.previous.addEventListener("click", function () {
    if (state.page > 1) { state.page -= 1; renderProblems(); }
  });
  elements.next.addEventListener("click", function () {
    const pageCount = Math.max(1, Math.ceil(currentProblems().length / pageSize));
    if (state.page < pageCount) { state.page += 1; renderProblems(); }
  });

  document.querySelectorAll(".layout-button").forEach(function (button) {
    button.addEventListener("click", function () {
      state.layout = button.dataset.layout;
      document.querySelectorAll(".layout-button").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      renderProblems();
    });
  });

  document.addEventListener("change", function (event) {
    if (event.target.matches(".status-check")) {
      toggleProblem(event.target.dataset.problem, event.target.checked);
    }
  });

  document.addEventListener("click", function (event) {
    const patternButton = event.target.closest("[data-pattern]");
    if (patternButton) {
      setPatternFilter(patternButton.dataset.pattern);
      return;
    }
    const patternCard = event.target.closest("[data-pattern-card]");
    if (patternCard) setPatternFilter(patternCard.dataset.patternCard);
  });

  document.addEventListener("keydown", function (event) {
    const tagName = event.target.tagName;
    const isTyping = tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
    if (event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      elements.search.focus();
    }
    if ((event.key === "Enter" || event.key === " ") &&
        event.target.matches("[data-pattern-card]")) {
      event.preventDefault();
      setPatternFilter(event.target.dataset.patternCard);
    }
  });

  let savedTheme = "dark";
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark") savedTheme = storedTheme;
  } catch (error) {
    console.warn("Could not read the saved theme preference.", error);
  }
  setTheme(savedTheme, false);
  document.getElementById("theme-toggle").addEventListener("click", function () {
    setTheme(document.body.dataset.theme === "dark" ? "light" : "dark", true);
  });

  setupOverview();
  renderPlan();
  renderPatterns();
  updateProgress();
  renderProblems();
}());
