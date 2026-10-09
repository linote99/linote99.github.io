const posts = [
  {
    slug: 'start-with-a-note', date: '2026-10-09', title: '把零散的技术想法，整理成可检索的笔记', excerpt: '一个轻量的笔记系统，不必一开始就很复杂。先记下来，再用标签和链接，让知识慢慢长出脉络。', tags: ['写作', '工作流'], read: '3 分钟',
    sections: [
      ['p', '灵感常常出现在不方便整理的时候：调试到一半、读到一段解释，或者刚好解决了一个重复出现的问题。与其等有空再整理，不如先留下标题、结论和一个关键词。'],
      ['h2', '先记录，再整理'], ['p', '给笔记一个稳定的入口，比设计完美的分类更重要。标题尽量描述问题或结论；正文先写最有用的一句话；标签只在它确实能帮助检索时添加。'],
      ['h2', '让笔记可以被找回来'], ['p', '当内容开始增加，全文搜索、日期归档和少量主题标签就能覆盖大多数查找场景。写作系统应该让记录变轻，而不是让维护分类成为新的工作。'],
      ['p', 'Linote 的第一版也从这里开始：保持简单，持续写下真实遇到的问题，再根据使用习惯逐步调整。']
    ]
  },
  {
    slug: 'launch-checklist', date: '2026-10-06', title: '前端页面上线前，我会检查这 7 件事', excerpt: '从移动端布局、可访问性到资源路径，把发布前容易遗漏的细节变成一份简短清单。', tags: ['前端', '清单'], read: '4 分钟',
    sections: [
      ['p', '功能能跑通只是上线检查的起点。把下面几项快速过一遍，通常能提前发现那些“在自己电脑上没问题”的小坑。'],
      ['h2', '视觉与交互'], ['ul', '窄屏下没有横向溢出', '导航、表单和按钮可用键盘操作', '焦点状态清楚，图片有合适的替代文本', '空状态和加载失败时也有明确提示'],
      ['h2', '内容与资源'], ['ul', '页面标题、描述和 favicon 已设置', '内部链接、图片路径在生产环境有效', '控制台没有未处理的错误或意外请求'],
      ['p', '最后用真实设备或浏览器缩放检查一次。清单的价值不是追求零风险，而是让常见问题有固定的发现机会。']
    ]
  },
  {
    slug: 'css-fluid-type', date: '2026-09-28', title: '用 CSS clamp() 做一套更顺手的响应式字号', excerpt: '让字号在小屏与大屏之间平滑变化，不用为每个断点都手动写一套完全不同的规则。', tags: ['CSS', '前端'], read: '3 分钟',
    sections: [
      ['p', '响应式排版常见的两种极端，是字号始终固定，或在多个断点突然跳变。CSS 的 <code>clamp()</code> 可以定义一个最小值、理想值和最大值，让数值在范围内流动。'],
      ['h2', '基本写法'], ['code', 'font-size: clamp(1.8rem, 4vw, 3.6rem);'],
      ['p', '中间的 <code>4vw</code> 会随视口变化；左右两端则限制字号不会过小或过大。标题、留白和容器宽度都可以用同样的思路建立弹性范围。'],
      ['h2', '使用时的小提醒'], ['p', '先定义可读的最小和最大值，再观察常见屏幕尺寸下的结果。对正文来说，行长和行高也同样重要；只调字号并不能自动解决阅读体验。']
    ]
  },
  {
    slug: 'git-small-experiments', date: '2026-09-20', title: 'Git 分支：一次小实验也值得隔离', excerpt: '把尝试放进单独分支，能让临时方案更容易比较、回退，也更放心地试错。', tags: ['Git', '工具'], read: '3 分钟',
    sections: [
      ['p', '不确定的重构、依赖升级，甚至只是一个样式方向，都可以先放进独立分支。这样主线保持稳定，实验结果也能通过提交记录被清楚地审视。'],
      ['h2', '一个简单流程'], ['code', 'git switch -c experiment/idea\n# 完成尝试后检查变更\ngit diff\n# 保留成果或回到主线'],
      ['p', '如果实验值得保留，就用清晰的提交说明保存它；如果不合适，切回主分支即可。分支的创建成本很低，心理负担也会因此小很多。']
    ]
  },
  {
    slug: 'browser-cache-debug', date: '2026-09-12', title: '排查浏览器缓存：从强刷到缓存策略', excerpt: '页面更新没有生效时，先确认浏览器、代理和 CDN 各自缓存了什么，再调整对应策略。', tags: ['浏览器', '排错'], read: '4 分钟',
    sections: [
      ['p', '遇到“代码已经改了，页面还是旧的”，可以先在开发者工具中禁用缓存并重新加载。若问题消失，说明浏览器缓存值得继续检查；若仍然存在，再沿请求链路向外排查。'],
      ['h2', '从近到远定位'], ['ul', '确认请求 URL、响应内容和状态码', '检查浏览器缓存与 Service Worker', '查看反向代理或 CDN 是否返回旧响应', '对比资源文件名、ETag 与 Cache-Control'],
      ['p', '带哈希的静态资源适合长时间缓存；HTML 文档通常需要更快地重新验证。让文件名和缓存策略配合，能减少发布后新旧内容混用的情况。']
    ]
  },
  {
    slug: 'cli-small-tools', date: '2026-09-01', title: '命令行里的几个高频小技巧', excerpt: '善用历史搜索、管道和参数补全，让重复的小操作少一点摩擦。', tags: ['CLI', '工具'], read: '2 分钟',
    sections: [
      ['p', '命令行效率往往来自减少重复输入。优先熟悉正在使用的 Shell 自带功能，通常比额外安装一整套工具更直接。'],
      ['h2', '从三个习惯开始'], ['ul', '用 Ctrl-R 搜索之前执行过的命令', '先用管道组合小工具，再考虑写脚本', '为常用但容易输错的参数设置安全别名'],
      ['p', '把复杂命令存进脚本或项目任务中，也能让之后的自己理解当时为什么这么做。']
    ]
  }
];

const app = document.querySelector('#app');
const yearNode = document.querySelector('#year');
const nav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const pageSize = 4;
let searchTerm = '';
let currentPage = 1;
let selectedTag = '';
yearNode.textContent = new Date().getFullYear();

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const allTags = () => [...new Set(posts.flatMap(post => post.tags))].sort((a,b) => a.localeCompare(b, 'zh-CN'));
const tagCount = tag => posts.filter(post => post.tags.includes(tag)).length;
const dateLabel = date => date.replaceAll('-', '.');
const tagLinks = tags => tags.map(tag => `<a class="post-tag" href="#tag/${encodeURIComponent(tag)}">${escapeHTML(tag)}</a>`).join('');
const activeNav = route => {
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.nav === route));
};

function homeMarkup() {
  return `<section class="hero fade-in" aria-labelledby="hero-title">
    <div class="hero-text">
      <div class="eyebrow">PERSONAL TECH NOTES&nbsp; / &nbsp;记录 · 思考 · 实践</div>
      <h1 id="hero-title">把知识写下来，<br>让灵感<em>可追溯。</em></h1>
      <p class="hero-copy">你好，欢迎来到 Linote。这里收集技术实践、问题排查和那些值得留下来的小想法。慢慢写，常回来。</p>
      <div class="hero-actions"><a class="button-primary" href="#notes">浏览笔记 <span aria-hidden="true">↘</span></a><a class="button-secondary" href="#tags">按标签探索 <span aria-hidden="true">→</span></a></div>
    </div>
    <div class="hero-art"><img src="/assets/linote-logo.png" alt="黑底白字的 Linote 标志"><div class="art-caption"><span>LINOTE / NOTEBOOK Nº 01</span><span>EST. 2026</span></div><div class="art-mark" aria-hidden="true">✳</div></div>
  </section>
  <div class="hero-rule"></div>
  <div class="quick-note"><span class="spark" aria-hidden="true">✳</span><span>一处安静的角落，记录正在学习和正在解决的问题。</span></div>
  <section class="content-wrap" id="notes" aria-labelledby="notes-title">
    <div class="section-head"><div><p class="section-kicker">THE NOTEBOOK</p><h2 id="notes-title">最近的笔记</h2><p>把好奇心变成可以回看的记录。</p></div><div class="section-count" id="result-count"></div></div>
    <div class="filter-row"><div class="tag-list" id="tag-filter" aria-label="筛选标签"></div><label class="search-box"><span class="search-icon" aria-hidden="true">⌕</span><input id="search" type="search" placeholder="搜索标题、内容或标签…" aria-label="搜索笔记"></label></div>
    <div id="post-list" class="post-list"></div><div id="pagination" class="pagination" aria-label="笔记分页"></div>
  </section>`;
}

function postCards(items) {
  if (!items.length) return `<div class="empty-state"><strong>没有找到匹配的笔记</strong><span>换个关键词或标签试试。</span></div>`;
  return items.map(post => `<article class="post-card"><time class="post-date" datetime="${post.date}">${dateLabel(post.date)} <span class="sample-badge">示例</span></time><div class="post-body"><h3><a href="#post/${post.slug}">${escapeHTML(post.title)}</a></h3><p class="post-excerpt">${escapeHTML(post.excerpt)}</p><div class="post-meta">${tagLinks(post.tags)}</div></div><a class="post-arrow" href="#post/${post.slug}" aria-label="阅读：${escapeHTML(post.title)}">↗</a></article>`).join('');
}

function getFilteredPosts() {
  const needle = searchTerm.trim().toLocaleLowerCase();
  return [...posts].sort((a,b) => b.date.localeCompare(a.date)).filter(post => {
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')} ${post.sections.map(section => section.slice(1).join(' ')).join(' ')}`.toLocaleLowerCase();
    return matchesTag && (!needle || haystack.includes(needle));
  });
}

function renderHome() {
  app.innerHTML = homeMarkup();
  const filter = document.querySelector('#tag-filter');
  filter.innerHTML = `<a class="tag-pill ${selectedTag ? '' : 'selected'}" href="#home">全部 <span class="tag-num">${posts.length}</span></a>` + allTags().map(tag => `<a class="tag-pill ${selectedTag === tag ? 'selected' : ''}" href="#tag/${encodeURIComponent(tag)}">${escapeHTML(tag)} <span class="tag-num">${tagCount(tag)}</span></a>`).join('');
  const input = document.querySelector('#search');
  input.value = searchTerm;
  input.addEventListener('input', () => { searchTerm = input.value; currentPage = 1; updatePosts(); });
  updatePosts();
  activeNav(selectedTag ? 'tags' : 'home');
  if (location.hash === '#notes') requestAnimationFrame(() => document.querySelector('#notes')?.scrollIntoView({behavior:'smooth'}));
}

function updatePosts() {
  const filtered = getFilteredPosts();
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, maxPage);
  const start = (currentPage - 1) * pageSize;
  document.querySelector('#result-count').textContent = `${filtered.length.toString().padStart(2,'0')} NOTES`;
  document.querySelector('#post-list').innerHTML = postCards(filtered.slice(start, start + pageSize));
  const pagination = document.querySelector('#pagination');
  pagination.innerHTML = filtered.length > pageSize ? Array.from({length:maxPage}, (_, index) => `<button class="page-button ${currentPage === index+1 ? 'current' : ''}" data-page="${index+1}" aria-label="第 ${index+1} 页">${index+1}</button>`).join('') : '';
  pagination.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { currentPage = Number(button.dataset.page); updatePosts(); document.querySelector('#notes')?.scrollIntoView({behavior:'smooth'}); }));
}

function renderArchive() {
  const years = [...new Set(posts.map(post => post.date.slice(0,4)))].sort().reverse();
  app.innerHTML = `<section class="content-wrap fade-in"><div class="section-head"><div><p class="section-kicker">ARCHIVE</p><h2>按时间归档</h2><p>每一条记录，都是走过的一个小步骤。</p></div><div class="section-count">${posts.length.toString().padStart(2,'0')} NOTES</div></div>${years.map(year => `<div class="archive-year">${year} <span>— ${posts.filter(post => post.date.startsWith(year)).length} 篇</span></div><div class="post-list">${postCards(posts.filter(post => post.date.startsWith(year)).sort((a,b)=>b.date.localeCompare(a.date)))}</div>`).join('')}</section>`;
  activeNav('archive');
}

function renderTags() {
  app.innerHTML = `<section class="content-wrap fade-in"><div class="section-head"><div><p class="section-kicker">TOPICS</p><h2>按主题探索</h2><p>从一个关键词开始，继续往下读。</p></div><div class="section-count">${allTags().length.toString().padStart(2,'0')} TAGS</div></div><div class="tag-cloud">${allTags().map(tag => `<a class="tag-pill" href="#tag/${encodeURIComponent(tag)}">${escapeHTML(tag)} <span class="tag-num">${tagCount(tag)}</span></a>`).join('')}</div><div class="section-head"><div><p class="section-kicker">ALL NOTES</p><h2>所有笔记</h2></div></div><div class="post-list">${postCards([...posts].sort((a,b)=>b.date.localeCompare(a.date)))}</div></section>`;
  activeNav('tags');
}

function renderTag(tag) {
  selectedTag = tag;
  searchTerm = '';
  const matched = [...posts].filter(post => post.tags.includes(tag)).sort((a,b)=>b.date.localeCompare(a.date));
  app.innerHTML = `<section class="content-wrap fade-in"><div class="breadcrumbs"><a href="#home">首页</a> / <a href="#tags">标签</a> / ${escapeHTML(tag)}</div><div class="section-head"><div><p class="section-kicker">TAG ARCHIVE</p><h2># ${escapeHTML(tag)}</h2><p>与这个主题相关的记录。</p></div><div class="section-count">${matched.length.toString().padStart(2,'0')} NOTES</div></div><div class="post-list">${postCards(matched)}</div><p style="margin-top:28px"><a class="back-link" href="#tags">← 查看全部标签</a></p></section>`;
  activeNav('tags');
}

function renderPost(slug) {
  const post = posts.find(item => item.slug === slug);
  if (!post) return renderNotFound();
  selectedTag = '';
  const body = post.sections.map(([type, ...values]) => {
    if (type === 'h2') return `<h2>${values.join('')}</h2>`;
    if (type === 'ul') return `<ul>${values.map(value => `<li>${value}</li>`).join('')}</ul>`;
    if (type === 'code') return `<pre><code>${escapeHTML(values.join(''))}</code></pre>`;
    return `<p>${values.join('')}</p>`;
  }).join('');
  app.innerHTML = `<article class="article-wrap fade-in"><div class="breadcrumbs"><a href="#home">首页</a> / <a href="#archive">笔记</a> / ${escapeHTML(post.title)}</div><div class="article-meta">${dateLabel(post.date)} &nbsp;·&nbsp; ${post.read}阅读 &nbsp;·&nbsp; 示例笔记</div><h1 class="article-title">${escapeHTML(post.title)}</h1><p class="article-deck">${escapeHTML(post.excerpt)}</p><div class="article-tags">${tagLinks(post.tags)}</div><div class="article-content">${body}</div><div class="article-end"><span>这是一篇用于展示页面效果的示例笔记。</span><a class="back-link" href="#home">← 回到首页</a></div></article>`;
  activeNav('');
}

function renderInfo(kind) {
  const privacy = kind === 'privacy';
  const title = privacy ? '使用与隐私' : '关于 Linote';
  const lead = privacy ? 'Linote 第一版是一个轻量的静态笔记站点，页面内容在浏览器中展示。' : 'Linote 是一个记录技术实践、整理思路和收藏灵感的小站。';
  const cards = privacy ? `<div class="info-card"><h2>搜索与数据</h2><p>当前版本的站内搜索和标签筛选在浏览器本地运行；页面不会要求访客提交个人资料，也没有评论或订阅表单。</p></div><div class="info-card"><h2>托管与访问日志</h2><p>本站由托管平台提供访问服务，平台可能按其政策处理基础请求日志。当前临时预览域名用于体验第一版，不代表正式站点配置。</p></div><div class="info-card"><h2>后续更新</h2><p>如果未来加入统计、评论、订阅或其他第三方服务，会在启用前补充说明。页面中的文章目前是展示用示例内容。</p></div>` : `<div class="info-card"><h2>一个简单的开始</h2><p>这里的示例文章用于展示搜索、分页、标签和文章详情的效果。你可以把它们替换成自己的笔记，也可以继续调整站点的颜色、栏目和内容结构。</p></div><div class="info-card"><h2>保持轻量</h2><p>第一版采用静态页面，首页可搜索，内容可按标签和日期浏览。没有账户系统或后台编辑器；内容更新可以直接修改站点文件。</p></div>`;
  app.innerHTML = `<section class="info-wrap fade-in"><div class="eyebrow">${privacy ? 'SITE NOTES' : 'A LITTLE ABOUT'}</div><h1>${title}</h1><p class="info-lead">${lead}</p>${cards}<p style="margin-top:28px"><a class="back-link" href="#home">← 回到首页</a></p></section>`;
  activeNav(privacy ? '' : 'about');
}

function renderNotFound() {
  app.innerHTML = `<section class="info-wrap"><div class="eyebrow">404 / NOTE NOT FOUND</div><h1>这条笔记<br>还没有出现。</h1><p class="info-lead">链接可能已过期，或者地址里有一点小错误。</p><p style="margin-top:28px"><a class="back-link" href="#home">← 回到首页</a></p></section>`;
}

function route() {
  const path = decodeURIComponent(location.hash.replace(/^#/, '') || 'home');
  selectedTag = '';
  currentPage = 1;
  if (path === 'home' || path === 'notes') { renderHome(); if (path === 'notes') requestAnimationFrame(()=>document.querySelector('#notes')?.scrollIntoView({behavior:'smooth'})); }
  else if (path === 'archive') renderArchive();
  else if (path === 'tags') renderTags();
  else if (path === 'about' || path === 'privacy') renderInfo(path);
  else if (path.startsWith('tag/')) renderTag(path.slice(4));
  else if (path.startsWith('post/')) renderPost(path.slice(5));
  else renderNotFound();
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
});
window.addEventListener('hashchange', route);
window.addEventListener('scroll', () => document.querySelector('.back-to-top')?.classList.toggle('visible', window.scrollY > 450), {passive:true});
route();
