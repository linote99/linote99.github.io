'use strict';

// Adds ?v=<content hash> to fixed-name source assets (such as the reward QR codes)
// so a replaced image is not served from an old browser/CDN cache.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

hexo.extend.helper.register('versioned_asset', function versionedAsset(assetPath) {
  const relative = String(assetPath || '').replace(/^\/+/, '');
  const url = this.url_for(`/${relative}`);
  try {
    const file = path.join(hexo.source_dir, relative);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    return `${url}?v=${hash}`;
  } catch (_) {
    return url;
  }
});
