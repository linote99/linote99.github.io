(() => {
  'use strict';

  const body = document.body;
  const configuredRoot = body?.dataset.root || '/';
  const siteRoot = `/${configuredRoot.replace(/^\/+|\/+$/g, '')}${configuredRoot.replace(/^\/+|\/+$/g, '') ? '/' : ''}`;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const safeInternalURL = (value) => {
    try {
      const base = new URL(siteRoot, window.location.origin);
      const target = new URL(String(value || siteRoot), base);
      if (target.origin !== window.location.origin || !target.pathname.startsWith(base.pathname)) return siteRoot;
      return `${target.pathname}${target.search}${target.hash}`;
    } catch (_) {
      return siteRoot;
    }
  };

  const pathURL = (value) => {
    let path = String(value || '').replace(/^\/+/, '');
    path = path.replace(/(?:^|\/)index\.html$/i, '/');
    if (path && !path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) path += '/';
    return safeInternalURL(`${siteRoot}${path}`);
  };

  const legacyPost = window.location.hash.match(/^#post\/([a-z0-9]+(?:-[a-z0-9]+)*)$/i);
  if (legacyPost) {
    window.location.replace(pathURL(`posts/${legacyPost[1]}/`));
    return;
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open', !expanded);
    });
  }

  const backToTop = document.getElementById('back-to-top');
  const syncBackToTop = () => backToTop?.classList.toggle('visible', window.scrollY > 480);
  window.addEventListener('scroll', syncBackToTop, { passive: true });
  syncBackToTop();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const postList = document.getElementById('post-list');
  const searchInput = document.getElementById('search');
  if (!postList || !searchInput) return;

  const tagFilter = document.getElementById('tag-filter');
  const pagination = document.getElementById('pagination');
  const resultCount = document.getElementById('result-count');
  const pageSize = 4;
  let allPosts = [];
  let selectedTag = '';
  let currentPage = 1;

  const makeCard = (post) => {
    const postHref = pathURL(post.path);
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const date = String(post.date || '').replace(/-/g, '.');
    const tagLinks = tags.map((tag) => `<a class="post-tag" href="${pathURL(tag.path)}">${escapeHTML(tag.name)}</a>`).join('');
    return `<article class="post-card">
      <time class="post-date" datetime="${escapeHTML(post.date)}">${escapeHTML(date)}</time>
      <div class="post-body"><h3><a href="${postHref}">${escapeHTML(post.title)}</a></h3>
        <p class="post-excerpt">${escapeHTML(post.summary)}</p><div class="post-meta">${tagLinks}</div></div>
      <a class="post-arrow" href="${postHref}" aria-label="阅读：${escapeHTML(post.title)}">↗</a>
    </article>`;
  };

  const renderTags = () => {
    if (!tagFilter) return;
    const counts = new Map();
    allPosts.forEach((post) => (post.tags || []).forEach((tag) => {
      const name = String(tag.name || '');
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }));
    const tags = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
    tagFilter.innerHTML = `<button class="tag-pill${selectedTag ? '' : ' selected'}" type="button" data-tag="">全部 <span class="tag-num">${allPosts.length}</span></button>`
      + tags.map(([name, count]) => `<button class="tag-pill${selectedTag === name ? ' selected' : ''}" type="button" data-tag="${escapeHTML(name)}">${escapeHTML(name)} <span class="tag-num">${count}</span></button>`).join('');
  };

  const renderPagination = (pageCount) => {
    if (!pagination) return;
    if (pageCount <= 1) {
      pagination.replaceChildren();
      pagination.hidden = true;
      return;
    }
    pagination.hidden = false;
    const buttons = [];
    if (currentPage > 1) buttons.push(`<button class="page-button" type="button" data-page="${currentPage - 1}" aria-label="上一页">←</button>`);
    for (let page = 1; page <= pageCount; page += 1) {
      buttons.push(`<button class="page-button${page === currentPage ? ' current' : ''}" type="button" data-page="${page}"${page === currentPage ? ' aria-current="page"' : ''}>${page}</button>`);
    }
    if (currentPage < pageCount) buttons.push(`<button class="page-button" type="button" data-page="${currentPage + 1}" aria-label="下一页">→</button>`);
    pagination.innerHTML = buttons.join('');
  };

  const render = () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filtered = allPosts.filter((post) => {
      const hasTag = !selectedTag || (post.tags || []).some((tag) => tag.name === selectedTag);
      const hasQuery = !query || String(post.text || `${post.title} ${post.summary}`).toLocaleLowerCase().includes(query);
      return hasTag && hasQuery;
    });
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * pageSize;
    const pagePosts = filtered.slice(start, start + pageSize);
    postList.innerHTML = pagePosts.length
      ? pagePosts.map(makeCard).join('')
      : '<div class="empty-state"><strong>没有找到匹配的笔记</strong><span>试试其他关键词或标签。</span></div>';
    if (resultCount) resultCount.textContent = `${String(filtered.length).padStart(2, '0')} NOTES`;
    renderPagination(pageCount);
  };

  tagFilter?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag]');
    if (!button) return;
    selectedTag = button.dataset.tag || '';
    currentPage = 1;
    tagFilter.querySelectorAll('.tag-pill').forEach((pill) => pill.classList.toggle('selected', pill === button));
    render();
  });
  searchInput.addEventListener('input', () => { currentPage = 1; render(); });
  pagination?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    currentPage = Number(button.dataset.page) || 1;
    render();
    document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  fetch(safeInternalURL(`${siteRoot}search.json`), { cache: 'no-store', headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Search index returned HTTP ${response.status}`);
      return response.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts)) throw new Error('Invalid search index');
      allPosts = posts;
      renderTags();
      render();
    })
    .catch(() => {
      // Keep the server-rendered list visible if the index cannot be fetched.
      searchInput.placeholder = '搜索索引暂不可用';
      if (pagination) pagination.hidden = true;
    });
})();
