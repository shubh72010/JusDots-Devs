// Mobile nav
document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', navToggle.classList.contains('active'));
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  }
});

// Page navigation
function sp(id) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active') });
  document.getElementById('page-' + id).classList.add('active');
  if (id === 'research') {
    document.getElementById('research-main').style.display = 'block';
    document.querySelectorAll('.research-detail').forEach(function (d) { d.style.display = 'none' });
  }
  document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.remove('active') });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var txt = a.textContent.toLowerCase();
    if (txt.includes(id) || (id === 'home' && txt === 'home')) a.classList.add('active');
  });
  window.scrollTo(0, 0);
  // Close mobile nav
  var navLinks = document.querySelector('.nav-links');
  var navToggle = document.querySelector('.nav-toggle');
  if (navLinks && navToggle) { navLinks.classList.remove('active'); navToggle.classList.remove('active'); }
}
function sr(id) {
  document.getElementById('research-main').style.display = 'none';
  document.querySelectorAll('.research-detail').forEach(function (d) { d.style.display = 'none' });
  var detail = document.getElementById('research-detail-' + id);
  if (detail) {
    detail.style.display = 'block';
    window.scrollTo(0, 0);
  }
}
function tr(h) { var rc = h.closest('.rc'); rc.classList.toggle('open'); h.setAttribute('aria-expanded', rc.classList.contains('open')) }
function goToPage(id) { sp(id); document.getElementById('global-search').value = ''; document.getElementById('search-results').classList.remove('active'); }

// Advanced Search Engine
(function () {
  const searchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  let index = [];

  function buildIndex() {
    index = [];
    document.querySelectorAll('.page').forEach(page => {
      const pageId = page.id.replace('page-', '');
      const pageTitle = page.querySelector('.stitle')?.textContent ||
        page.querySelector('h1')?.innerText ||
        pageId.charAt(0).toUpperCase() + pageId.slice(1);

      // Collect all searchable chunks
      const chunks = [];
      page.querySelectorAll('h2, h3, h4, p, li, td').forEach(el => {
        const text = el.innerText.trim();
        if (text.length > 3) {
          chunks.push({
            text: text,
            weight: el.tagName.startsWith('H') ? 2 : 1,
            subId: el.closest('.research-detail')?.id || null
          });
        }
      });

      index.push({
        id: pageId,
        title: pageTitle,
        chunks: chunks,
        cat: page.dataset.cat || (pageId === 'home' || pageId === 'browse' || pageId === 'chat' || pageId === 'notes' ? 'App' : 'Technical')
      });
    });
  }

  function getSnippet(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text.slice(0, 60) + '...';
    const start = Math.max(0, idx - 20);
    const end = Math.min(text.length, idx + 40);
    return (start > 0 ? '...' : '') + text.slice(start, end).replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>') + (end < text.length ? '...' : '');
  }

  function performSearch() {
    const q = searchInput.value.toLowerCase().trim();
    if (q.length < 2) {
      searchResults.classList.remove('active');
      return;
    }

    const results = [];
    index.forEach(item => {
      let score = 0;
      let matchedSnippet = '';
      let targetSubId = null;

      if (item.title.toLowerCase().includes(q)) score += 50;

      item.chunks.forEach(chunk => {
        if (chunk.text.toLowerCase().includes(q)) {
          const matchScore = chunk.weight * 10;
          if (matchScore > 0) {
            score += matchScore;
            if (!matchedSnippet) {
              matchedSnippet = getSnippet(chunk.text, q);
              targetSubId = chunk.subId;
            }
          }
        }
      });

      if (score > 0) {
        results.push({ ...item, score, snippet: matchedSnippet, subId: targetSubId });
      }
    });

    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-empty">No matching results found</div>';
    } else {
      searchResults.innerHTML = results.slice(0, 8).map(res => `
        <div class="search-result" onclick="handleSearchResultClick('${res.id}', '${res.subId}')">
          <div class="search-result-title">
            ${res.title}
            <span class="badge">${res.cat}</span>
          </div>
          <div class="search-result-desc">${res.snippet || 'Navigate to page'}</div>
        </div>
      `).join('');
    }
    searchResults.classList.add('active');
  }

  window.handleSearchResultClick = function (id, subId) {
    if (subId) {
      sp(id);
      const resId = subId.replace('research-detail-', '');
      sr(resId);
    } else {
      sp(id);
    }
    searchInput.value = '';
    searchResults.classList.remove('active');
  };

  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', () => {
    if (index.length === 0) buildIndex();
    performSearch();
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });

})();

// Nav Search Functions (Basic proxy for deep search)
window.handleNavSearch = function (query) {
  const input = document.getElementById('global-search');
  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input'));
    document.getElementById('nav-search-results').classList.remove('active');
    window.scrollTo(0, 0);
  }
};

window.showNavSearchResults = function () {
  var input = document.getElementById('nav-search-input');
  var resultsEl = document.getElementById('nav-search-results');
  if (input && input.value.trim().length > 0 && resultsEl) resultsEl.classList.add('active');
};

window.hideNavSearchResults = function () {
  setTimeout(function () {
    var resultsEl = document.getElementById('nav-search-results');
    if (resultsEl) resultsEl.classList.remove('active');
  }, 200);
};

// Mobile Search Handler
window.handleMobileSearch = function (query) {
  if (query.length < 1) {
    return;
  }
  if (query.length >= 2) {
    sp('releases');
    setTimeout(function () {
      var searchInput = document.getElementById('release-search');
      if (searchInput) {
        searchInput.value = query;
        searchReleases(query);
      }
    }, 100);
  }
};

// Reveal on scroll
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.app-card,.feat,.docs-card').forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

// Keyboard shortcut for search
document.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('global-search').focus();
  }
});

// ============================================
// GitHub API Auto-Update Service
// ============================================
(function () {
  console.log('[GitHub API] Initializing...');

  var CACHE_TTL = 3600000;
  var repos = [
    { owner: 'shubh72010', repo: 'JusBrowse', id: 'browse' },
    { owner: 'R37BGXRPG', repo: 'JusChatz_by_JusDots', id: 'chat' },
    { owner: 'shubh72010', repo: 'DotNotes', id: 'notes' }
  ];

  var globalReleases = [];
  var currentFilter = 'all';
  var currentSearch = '';
  var currentSort = 'newest';

  // Cache functions
  function getCache(key) {
    try {
      var cached = localStorage.getItem('github_' + key);
      if (!cached) return null;
      var data = JSON.parse(cached);
      if (Date.now() > data.expiry) {
        localStorage.removeItem('github_' + key);
        return null;
      }
      console.log('[GitHub API] Cache hit for:', key);
      return data.value;
    } catch (e) {
      console.error('[GitHub API] Cache error:', e);
      return null;
    }
  }

  function setCache(key, value) {
    try {
      localStorage.setItem('github_' + key, JSON.stringify({ value: value, expiry: Date.now() + CACHE_TTL }));
      console.log('[GitHub API] Cached:', key);
    } catch (e) {
      console.error('[GitHub API] Cache write error:', e);
    }
  }

  // Utility functions
  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    var date = new Date(dateStr);
    var now = new Date();
    var diff = now - date;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + ' weeks ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num ? num.toString() : '0';
  }

  function getAPKUrl(assets) {
    if (!assets) return null;
    var apk = assets.find(function (a) { return a.name && a.name.toLowerCase().endsWith('.apk'); });
    return apk ? apk.browser_download_url : null;
  }

  // Update UI functions
  function updateAppCard(repo, data) {
    console.log('[GitHub API] Updating app card:', repo.id);

    var starsEl = document.getElementById('stars-' + repo.id);
    var versionEl = document.getElementById('version-' + repo.id);
    var sizeEl = document.getElementById('size-' + repo.id);
    var downloadEl = document.getElementById('download-' + repo.id);

    if (starsEl) {
      starsEl.textContent = formatNumber(data.stars);
      starsEl.classList.remove('skeleton');
    }

    if (versionEl && data.latestRelease) {
      versionEl.textContent = data.latestRelease.tag_name.replace('v', '');
    }

    if (sizeEl && data.latestRelease) {
      var apk = data.latestRelease.assets && data.latestRelease.assets.find(function (a) { return a.name && a.name.toLowerCase().endsWith('.apk'); });
      if (apk && apk.size) {
        sizeEl.textContent = '~' + (apk.size / (1024 * 1024)).toFixed(1) + 'MB';
      }
    }

    if (downloadEl && data.latestRelease) {
      var apkUrl = getAPKUrl(data.latestRelease.assets);
      if (apkUrl) downloadEl.href = apkUrl;
    }
  }

  function updateWidget(repo, data) {
    console.log('[GitHub API] Updating widget:', repo.id);

    var starsEl = document.getElementById('stars-widget-' + repo.id);
    var downloadEl = document.getElementById('download-widget-' + repo.id);

    if (starsEl) {
      starsEl.textContent = '⭐ ' + formatNumber(data.stars);
      starsEl.classList.remove('skeleton');
    }

    if (downloadEl && data.latestRelease) {
      var apkUrl = getAPKUrl(data.latestRelease.assets);
      if (apkUrl) downloadEl.href = apkUrl;
    }

    var containerId = repo.id === 'browse' ? 'releases-browse' : repo.id === 'chat' ? 'releases-chat' : 'releases-notes';
    renderAppReleases(data.releases, containerId);
  }

  function renderAppReleases(releases, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!releases || releases.length === 0) {
      container.innerHTML = '<p style="color:var(--tx3)">No releases found</p>';
      return;
    }

    var sorted = releases.slice().sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); });
    var latest = sorted.slice(0, 5);

    container.innerHTML = latest.map(function (r) {
      var apkUrl = getAPKUrl(r.assets);
      var version = r.tag_name || 'Unknown';
      var date = formatDate(r.published_at);
      return '<div class="release-mini">' +
        '<div class="meta"><span class="version">v' + version + '</span><span class="date">' + date + '</span></div>' +
        '<a class="release-action download" href="' + (apkUrl || '#') + '" target="_blank" style="padding:6px 12px;font-size:12px">Download</a>' +
        '</div>';
    }).join('');

    var countEl = document.getElementById('count-' + containerId.split('-')[1]);
    if (countEl) countEl.textContent = sorted.length;
  }

  function updateCounts() {
    console.log('[GitHub API] Updating counts, total releases:', globalReleases.length);

    var counts = { all: globalReleases.length, JusBrowse: 0, JusChatz: 0, DotNotes: 0 };

    globalReleases.forEach(function (r) {
      if (r.repo === 'JusBrowse') counts.JusBrowse++;
      else if (r.repo === 'JusChatz_by_JusDots') counts.JusChatz++;
      else if (r.repo === 'DotNotes') counts.DotNotes++;
    });

    ['all', 'JusBrowse', 'JusChatz', 'DotNotes'].forEach(function (filter) {
      var el = document.getElementById('count-' + filter);
      if (el) el.textContent = counts[filter];
    });

    var totalEl = document.getElementById('total-release-count');
    if (totalEl) totalEl.textContent = counts.all;

    document.getElementById('count-browse').textContent = counts.JusBrowse;
    document.getElementById('count-chat').textContent = counts.JusChatz;
    document.getElementById('count-notes').textContent = counts.DotNotes;
  }

  function applyFiltersAndRender() {
    console.log('[GitHub API] Applying filters - filter:', currentFilter, 'search:', currentSearch, 'sort:', currentSort);

    var container = document.getElementById('releases-container');
    if (!container) {
      console.error('[GitHub API] Releases container not found!');
      return;
    }

    var filtered = globalReleases.filter(function (r) {
      if (currentFilter !== 'all') {
        var repoMatch = false;
        if (currentFilter === 'JusBrowse' && r.repo === 'JusBrowse') repoMatch = true;
        if (currentFilter === 'JusChatz' && r.repo === 'JusChatz_by_JusDots') repoMatch = true;
        if (currentFilter === 'DotNotes' && r.repo === 'DotNotes') repoMatch = true;
        if (!repoMatch) return false;
      }

      if (currentSearch) {
        var searchText = ((r.release.name || '') + ' ' + (r.release.tag_name || '') + ' ' + (r.release.body || '')).toLowerCase();
        if (!searchText.includes(currentSearch)) return false;
      }

      return true;
    });

    filtered.sort(function (a, b) {
      var dateA = new Date(a.release.published_at);
      var dateB = new Date(b.release.published_at);
      return currentSort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    console.log('[GitHub API] Filtered releases:', filtered.length);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div><p>No releases found matching your criteria.</p></div>';
      return;
    }

    container.innerHTML = filtered.map(function (r, i) {
      var isNew = i === 0;
      var body = r.release.body || '';
      body = body.substring(0, 500);
      if (r.release.body && r.release.body.length > 500) body += '...';
      body = body.replace(/## /g, '<br><strong>').replace(/\n/g, '<br>');

      var version = r.release.tag_name || 'Unknown';
      var title = r.release.name || version;
      var date = formatDate(r.release.published_at);
      var downloadUrl = r.release.html_url || '';
      var apkUrl = getAPKUrl(r.release.assets);

      return '<div class="rc' + (isNew ? ' open' : '') + '">' +
        '<div class="rh" onclick="tr(this)" onkeydown="if(event.key===\'Enter\')tr(this)" role="button" tabindex="0" aria-expanded="' + isNew + '">' +
        '<div class="rhl"><span class="rv">' + (r.release.prerelease ? 'Pre' : 'v' + version) + '</span>' +
        '<div class="ri"><div class="rn">' + title + '</div><div class="rd">' + r.repo + ' • ' + date + '</div></div></div>' +
        '<div class="rmeta">' + (isNew ? '<span class="tag tla">Latest</span>' : '') + '<span class="chev">▾</span></div></div>' +
        '<div class="rb"><div class="release-body">' + body + '</div>' +
        '<div class="release-actions">' +
        (apkUrl ? '<a class="release-action download" href="' + apkUrl + '" target="_blank">⬇ Download APK</a>' : '') +
        '<a class="release-action" href="' + downloadUrl + '" target="_blank">🌐 GitHub</a>' +
        '</div></div></div>';
    }).join('');
  }

  // Global filter function
  window.filterReleases = function (app) {
    console.log('[GitHub API] Filtering by:', app);
    currentFilter = app;

    document.querySelectorAll('.filter-tab').forEach(function (tab) {
      tab.classList.remove('active');
      if (tab.dataset.filter === app) tab.classList.add('active');
    });

    applyFiltersAndRender();
  };

  // Global search function
  window.searchReleases = function (query) {
    console.log('[GitHub API] Searching:', query);
    currentSearch = query.toLowerCase().trim();
    applyFiltersAndRender();
  };

  // Global sort function
  window.sortReleases = function (order) {
    console.log('[GitHub API] Sorting:', order);
    currentSort = order;
    applyFiltersAndRender();
  };

  // Fetch repo data
  async function fetchRepoData(repo) {
    console.log('[GitHub API] Fetching:', repo.owner + '/' + repo.repo);

    var cacheKey = repo.owner + '_' + repo.repo;
    var cached = getCache(cacheKey);

    if (cached) {
      console.log('[GitHub API] Using cached data for:', repo.repo);
      updateAppCard(repo, cached);
      updateWidget(repo, cached);
      return cached;
    }

    try {
      console.log('[GitHub API] Fetching from GitHub API...');

      var repoRes = await fetch('https://api.github.com/repos/' + repo.owner + '/' + repo.repo);
      if (!repoRes.ok) throw new Error('Repo fetch failed: ' + repoRes.status);
      var repoData = await repoRes.json();

      var releaseRes = await fetch('https://api.github.com/repos/' + repo.owner + '/' + repo.repo + '/releases');
      var releases = releaseRes.ok ? await releaseRes.json() : [];

      var data = {
        stars: repoData.stargazers_count,
        latestRelease: releases[0] || null,
        releases: releases
      };

      setCache(cacheKey, data);
      console.log('[GitHub API] Fetched and cached:', repo.repo, '-', releases.length, 'releases');

      updateAppCard(repo, data);
      updateWidget(repo, data);

      return data;
    } catch (e) {
      console.error('[GitHub API] Error fetching', repo.repo, ':', e);
      if (cached) {
        updateAppCard(repo, cached);
        updateWidget(repo, cached);
      }
      return cached;
    }
  }

  // Initialize
  async function init() {
    console.log('[GitHub API] Starting initialization...');

    globalReleases = [];

    for (var i = 0; i < repos.length; i++) {
      var repo = repos[i];
      var data = await fetchRepoData(repo);

      if (data && data.releases) {
        data.releases.forEach(function (r) {
          globalReleases.push({
            release: r,
            repo: repo.repo,
            owner: repo.owner,
            download: 'https://github.com/' + repo.owner + '/' + repo.repo + '/releases'
          });
        });
      }
    }

    console.log('[GitHub API] Total releases collected:', globalReleases.length);

    currentSort = 'newest';
    updateCounts();
    applyFiltersAndRender();

    console.log('[GitHub API] Initialization complete!');
  }

  // Refresh function
  window.GitHubAPI = {
    refresh: async function () {
      console.log('[GitHub API] Refreshing...');

      var btn = document.querySelector('.refresh-btn');
      if (btn) {
        btn.classList.add('loading');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Refreshing...';
      }

      repos.forEach(function (r) {
        localStorage.removeItem('github_' + r.owner + '_' + r.repo);
      });

      globalReleases = [];
      currentFilter = 'all';
      currentSearch = '';

      document.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
      var searchInput = document.getElementById('release-search');
      if (searchInput) searchInput.value = '';

      await init();

      if (btn) {
        btn.classList.remove('loading');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Refresh';
      }
    }
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
