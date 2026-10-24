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

  const setupReward = (fab, dialog) => {
    const STORE_KEY = 'linote-reward-fab-v1';
    const DRAG_THRESHOLD = 6;
    const panel = dialog.querySelector('.reward-panel');
    const tabs = [...dialog.querySelectorAll('[data-reward-tab]')];
    const panes = [...dialog.querySelectorAll('[data-reward-pane]')];
    const probe = document.createElement('div');
    probe.className = 'reward-safe-probe';
    probe.setAttribute('aria-hidden', 'true');
    body.appendChild(probe);

    const readStored = () => {
      try {
        const value = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
        if (value && (value.side === 'left' || value.side === 'right') && Number.isFinite(value.y)) return { side: value.side, y: Math.min(1, Math.max(0, value.y)) };
      } catch (_) { /* storage may be unavailable (private mode) */ }
      return null;
    };
    const writeStored = (value) => {
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(value)); } catch (_) { /* ignore */ }
    };
    const bounds = () => {
      const style = window.getComputedStyle(probe);
      const inset = (name) => parseFloat(style[name]) || 0;
      const width = document.documentElement.clientWidth || window.innerWidth;
      const height = window.innerHeight;
      const size = width <= 560 ? 44 : 46; // matches CSS; offsetWidth can be stale before styles apply in WebKit
      const margin = width <= 560 ? 12 : 20;
      const header = document.querySelector('.site-header');
      const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      const minTop = Math.max(headerBottom, inset('paddingTop')) + margin;
      const maxTop = Math.max(minTop, height - size - margin - inset('paddingBottom'));
      return {
        width, height, size, minTop, maxTop,
        minLeft: margin + inset('paddingLeft'),
        maxLeft: Math.max(margin, width - size - margin - inset('paddingRight'))
      };
    };
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const defaultSpot = (box) => {
      // Sit just above the back-to-top button on the right edge.
      const backTop = document.getElementById('back-to-top');
      const reserved = backTop ? (parseFloat(window.getComputedStyle(backTop).bottom) || 22) + (backTop.offsetHeight || 41) + 12 : 74;
      const top = box.height - reserved - box.size;
      return { side: 'right', y: box.maxTop > box.minTop ? clamp((top - box.minTop) / (box.maxTop - box.minTop), 0, 1) : 1 };
    };
    let spot = null;
    const placeAt = (left, top) => {
      fab.style.left = `${Math.round(left)}px`;
      fab.style.top = `${Math.round(top)}px`;
    };
    const applySpot = (animate) => {
      const box = bounds();
      const current = spot || readStored() || defaultSpot(box);
      if (!animate) fab.style.transition = 'none';
      placeAt(current.side === 'left' ? box.minLeft : box.maxLeft, box.minTop + current.y * (box.maxTop - box.minTop));
      fab.classList.add('is-placed');
      if (!animate) {
        void fab.offsetWidth;
        fab.style.transition = '';
      }
    };
    applySpot(false);
    let resizeFrame = 0;
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(() => { resizeFrame = 0; if (!drag) applySpot(false); });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('load', () => { if (!drag) applySpot(false); });

    let drag = null;
    let suppressClick = false;
    fab.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const rect = fab.getBoundingClientRect();
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false };
      try { fab.setPointerCapture(event.pointerId); } catch (_) { /* ignore */ }
    });
    fab.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD) return;
        drag.moved = true;
        fab.classList.add('is-dragging');
      }
      event.preventDefault();
      const box = bounds();
      placeAt(clamp(event.clientX - drag.offsetX, 0, box.width - box.size), clamp(event.clientY - drag.offsetY, 0, box.height - box.size));
    });
    const finishDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const moved = drag.moved;
      drag = null;
      try { fab.releasePointerCapture(event.pointerId); } catch (_) { /* ignore */ }
      if (!moved) return;
      fab.classList.remove('is-dragging');
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 350);
      const box = bounds();
      const rect = fab.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const top = clamp(rect.top, box.minTop, box.maxTop);
      spot = { side: centerX < box.width / 2 ? 'left' : 'right', y: box.maxTop > box.minTop ? (top - box.minTop) / (box.maxTop - box.minTop) : 0 };
      writeStored(spot);
      applySpot(true);
    };
    fab.addEventListener('pointerup', finishDrag);
    fab.addEventListener('pointercancel', finishDrag);
    fab.addEventListener('contextmenu', (event) => event.preventDefault());

    const selectTab = (name) => {
      tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.rewardTab === name)));
      panes.forEach((pane) => pane.classList.toggle('active', pane.dataset.rewardPane === name));
    };
    tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.rewardTab)));

    let savedScroll = 0;
    let lastFocus = null;
    const focusables = () => [...panel.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter((node) => node.offsetParent !== null);
    const onKeydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const openDialog = () => {
      if (!dialog.hidden) return;
      dialog.querySelectorAll('img[data-src]').forEach((image) => { image.src = image.dataset.src; image.removeAttribute('data-src'); });
      const agent = navigator.userAgent || '';
      selectTab(/AlipayClient/i.test(agent) ? 'alipay' : 'wechat');
      lastFocus = document.activeElement;
      savedScroll = window.scrollY || window.pageYOffset || 0;
      body.style.top = `-${savedScroll}px`;
      body.classList.add('reward-lock');
      dialog.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKeydown);
      panel.scrollTop = 0;
      (dialog.querySelector('.reward-close') || panel).focus({ preventScroll: true });
    };
    const closeDialog = () => {
      if (dialog.hidden) return;
      dialog.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
      body.classList.remove('reward-lock');
      body.style.top = '';
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, savedScroll);
      root.style.scrollBehavior = previous;
      (lastFocus && lastFocus !== body ? lastFocus : fab).focus({ preventScroll: true });
    };
    fab.setAttribute('aria-expanded', 'false');
    fab.addEventListener('click', (event) => {
      if (suppressClick) { event.preventDefault(); return; }
      openDialog();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.closest('[data-reward-close]')) closeDialog();
    });
  };
  const rewardFab = document.getElementById('reward-fab');
  const rewardDialog = document.getElementById('reward-dialog');
  if (rewardFab && rewardDialog) setupReward(rewardFab, rewardDialog);

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
  let tagsExpanded = false;
  const allTagsLabel = (tagFilter?.querySelector('[data-tag=""]')?.firstChild?.textContent || '全部').trim() || '全部';

  // Collapse the tag filter to one row; the selected tag always stays visible.
  const layoutTags = () => {
    if (!tagFilter) return;
    let toggle = tagFilter.querySelector('.tag-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'tag-pill tag-toggle';
      toggle.setAttribute('aria-controls', 'tag-filter');
      tagFilter.appendChild(toggle);
    }
    const pills = [...tagFilter.querySelectorAll('.tag-pill[data-tag]')];
    pills.forEach((pill) => pill.classList.remove('tag-hidden'));
    if (pills.length < 2) { toggle.hidden = true; return; }
    const rowTop = (node) => node.getBoundingClientRect().top;
    toggle.hidden = true;
    const firstTop = rowTop(pills[0]);
    const fitsOneRow = rowTop(pills[pills.length - 1]) - firstTop < 4;
    if (fitsOneRow) return;
    toggle.hidden = false;
    toggle.setAttribute('aria-expanded', String(tagsExpanded));
    if (tagsExpanded) {
      toggle.innerHTML = '收起<span class="tag-caret" aria-hidden="true">▾</span>';
      toggle.setAttribute('aria-label', '收起标签');
      return;
    }
    const candidates = pills.slice(1).filter((pill) => !pill.classList.contains('selected')).reverse();
    let hidden = 0;
    const setLabel = () => {
      toggle.innerHTML = `展开 <span class="tag-num">+${hidden}</span><span class="tag-caret" aria-hidden="true">▾</span>`;
      toggle.setAttribute('aria-label', `展开全部标签，还有 ${hidden} 个`);
    };
    setLabel();
    for (const pill of candidates) {
      if (rowTop(toggle) - firstTop < 4) break;
      pill.classList.add('tag-hidden');
      hidden += 1;
      setLabel();
    }
  };
  if (tagFilter) {
    layoutTags();
    let tagWidth = tagFilter.clientWidth;
    const relayout = () => {
      if (tagFilter.clientWidth === tagWidth) return;
      tagWidth = tagFilter.clientWidth;
      layoutTags();
    };
    let relayoutFrame = 0;
    const scheduleRelayout = () => {
      if (relayoutFrame) return;
      relayoutFrame = window.requestAnimationFrame(() => { relayoutFrame = 0; relayout(); });
    };
    if ('ResizeObserver' in window) new ResizeObserver(scheduleRelayout).observe(tagFilter);
    else window.addEventListener('resize', relayout);
    document.fonts?.ready?.then(layoutTags).catch(() => {});
  }

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
    tagFilter.innerHTML = `<button class="tag-pill${selectedTag ? '' : ' selected'}" type="button" data-tag="">${escapeHTML(allTagsLabel)} <span class="tag-num">${allPosts.length}</span></button>`
      + tags.map(([name, count]) => `<button class="tag-pill${selectedTag === name ? ' selected' : ''}" type="button" data-tag="${escapeHTML(name)}">${escapeHTML(name)} <span class="tag-num">${count}</span></button>`).join('');
    layoutTags();
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
    if (event.target.closest('.tag-toggle')) {
      tagsExpanded = !tagsExpanded;
      layoutTags();
      tagFilter.querySelector('.tag-toggle')?.focus({ preventScroll: true });
      return;
    }
    const button = event.target.closest('[data-tag]');
    if (!button) return;
    selectedTag = button.dataset.tag || '';
    currentPage = 1;
    tagFilter.querySelectorAll('.tag-pill[data-tag]').forEach((pill) => pill.classList.toggle('selected', pill === button));
    if (!tagsExpanded) layoutTags();
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
