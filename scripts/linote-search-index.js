'use strict';

const moment = require('moment-timezone');

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value.toArray === 'function') return value.toArray();
  if (Array.isArray(value.data)) return value.data;
  if (typeof value.each === 'function') {
    const items = [];
    value.each((item) => items.push(item));
    return items;
  }
  return [];
}

function plainText(html) {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function formatSiteDate(value) {
  const timezone = hexo.config.timezone || 'UTC';
  return moment(value).tz(timezone).format('YYYY-MM-DD');
}

hexo.extend.generator.register('linote-search-index', function (locals) {
  const posts = toArray(locals.posts)
    .filter((post) => post && post.published !== false)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((post) => {
      const tags = toArray(post.tags).map((tag) => ({
        name: String(tag.name || tag),
        path: String(tag.path || '')
      }));
      const content = plainText(post.content || post._content || '');
      const summary = plainText(post.summary || post.excerpt || content).slice(0, 500);
      return {
        slug: String(post.slug || ''),
        title: String(post.title || ''),
        date: formatSiteDate(post.date),
        summary,
        read: String(post.read || ''),
        tags,
        path: String(post.path || ''),
        text: `${post.title || ''} ${summary} ${tags.map((tag) => tag.name).join(' ')} ${content}`
      };
    });

  return {
    path: 'search.json',
    data: JSON.stringify(posts)
  };
});
