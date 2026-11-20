'use strict';

const PROTECTED_POST_FALLBACK = '此文章受密码保护，输入密码后可阅读。';

function isProtectedPost(post) {
  return post.password_protected === true || String(post.password_protected).toLowerCase() === 'true';
}

hexo.extend.filter.register('after_post_render', function (post) {
  if (!post || !isProtectedPost(post)) return post;

  const publicDescription = [post.description, post.summary]
    .find((value) => typeof value === 'string' && value.trim());
  post.description = publicDescription ? publicDescription.trim() : PROTECTED_POST_FALLBACK;
  return post;
});
