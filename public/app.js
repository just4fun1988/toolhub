(() => {
  "use strict";

  const root = document.documentElement;
  const searchInput = document.querySelector("#search-input");
  const clearSearch = document.querySelector("#clear-search");
  const resetSearch = document.querySelector("#reset-search");
  const searchForm = document.querySelector("#search-form");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const toolGroups = [...document.querySelectorAll(".tool-group")];
  const toolCards = [...document.querySelectorAll(".tool-card")];
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const languageButtons = [...document.querySelectorAll(".language-option")];
  const themeToggle = document.querySelector("#theme-toggle");

  const storedLanguage = localStorage.getItem("toolhub-language");
  const browserLanguage = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  const storedTheme = localStorage.getItem("toolhub-theme");
  const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const state = {
    language: storedLanguage === "zh" || storedLanguage === "en" ? storedLanguage : browserLanguage,
    theme: storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme,
    category: "all",
    query: ""
  };

  const strings = {
    en: {
      count: (value) => `${value} ${value === 1 ? "tool" : "tools"}`,
      themeLight: "Switch to light theme",
      themeDark: "Switch to dark theme",
      title: "ToolHub — 24 useful browser tools, carefully curated",
      description: "A fast, bilingual directory of 24 practical browser tools for file sharing, conversion, images, documents, development and creative work."
    },
    zh: {
      count: (value) => `${value} 个工具`,
      themeLight: "切换到浅色主题",
      themeDark: "切换到深色主题",
      title: "ToolHub — 精选 24 个实用在线工具",
      description: "快速、双语的在线工具目录，精选 24 个文件传输、格式转换、图像、文档、开发与创作工具。"
    }
  };

  const normalize = (value) => value.toLocaleLowerCase().trim();

  function buildSearchIndex(card) {
    const translated = [...card.querySelectorAll("[data-en][data-zh]")]
      .flatMap((element) => [element.dataset.en, element.dataset.zh]);
    const visibleText = card.textContent;
    return normalize([visibleText, ...translated].filter(Boolean).join(" "));
  }

  toolCards.forEach((card) => {
    card.dataset.searchIndex = buildSearchIndex(card);
  });

  function setTheme(theme, persist = true) {
    state.theme = theme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", strings[state.language][nextTheme === "light" ? "themeLight" : "themeDark"]);
    themeToggle.setAttribute("title", themeToggle.getAttribute("aria-label"));
    if (persist) localStorage.setItem("toolhub-theme", theme);
  }

  function setLanguage(language, persist = true) {
    state.language = language;
    root.lang = language === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-en][data-zh]").forEach((element) => {
      element.textContent = element.dataset[language];
    });

    document.querySelectorAll("[data-label-en][data-label-zh]").forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`label${language === "en" ? "En" : "Zh"}`]);
    });

    languageButtons.forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    searchInput.placeholder = searchInput.dataset[`placeholder${language === "en" ? "En" : "Zh"}`];
    document.title = strings[language].title;
    document.querySelector('meta[name="description"]').content = strings[language].description;
    setTheme(state.theme, false);
    applyFilters();
    if (persist) localStorage.setItem("toolhub-language", language);
  }

  function setCategory(category, shouldScroll = false) {
    state.category = category;
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    applyFilters();
    if (shouldScroll) {
      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.querySelector("#tools").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function applyFilters() {
    const query = normalize(state.query);
    let visibleCount = 0;

    toolGroups.forEach((group) => {
      let groupVisibleCount = 0;
      const categoryMatches = state.category === "all" || state.category === group.dataset.group;

      group.querySelectorAll(".tool-card").forEach((card) => {
        const queryMatches = !query || card.dataset.searchIndex.includes(query);
        const isVisible = categoryMatches && queryMatches;
        card.hidden = !isVisible;
        if (isVisible) {
          groupVisibleCount += 1;
          visibleCount += 1;
        }
      });

      group.hidden = groupVisibleCount === 0;
    });

    emptyState.hidden = visibleCount !== 0;
    resultCount.textContent = strings[state.language].count(visibleCount);
    clearSearch.hidden = state.query.length === 0;
  }

  function resetCatalog({ focus = false } = {}) {
    state.query = "";
    searchInput.value = "";
    setCategory("all");
    if (focus) searchInput.focus();
  }

  searchForm.addEventListener("submit", (event) => event.preventDefault());

  searchInput.addEventListener("input", (event) => {
    state.query = event.currentTarget.value;
    applyFilters();
  });

  clearSearch.addEventListener("click", () => {
    state.query = "";
    searchInput.value = "";
    applyFilters();
    searchInput.focus();
  });

  resetSearch.addEventListener("click", () => resetCatalog({ focus: true }));

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setCategory(button.dataset.filter));
  });

  document.querySelectorAll("[data-quick-filter]").forEach((button) => {
    button.addEventListener("click", () => setCategory(button.dataset.quickFilter, true));
  });

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  themeToggle.addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;

    if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }

    if (event.key === "Escape" && document.activeElement === searchInput && state.query) {
      resetCatalog({ focus: true });
    }
  });

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
  setTheme(state.theme, false);
  setLanguage(state.language, false);
})();
