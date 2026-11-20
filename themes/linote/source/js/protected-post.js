(() => {
  'use strict';

  const card = document.querySelector('[data-protected-post]');
  if (!card) return;
  const form = card.querySelector('[data-protected-form]');
  const input = card.querySelector('[data-protected-password]');
  const error = card.querySelector('[data-protected-error]');
  const content = document.querySelector('[data-protected-content]');
  const encoded = card.dataset.ciphertext;
  const saltEncoded = card.dataset.salt;
  const version = card.dataset.version;
  const genericError = '密码错误或文章数据无效，请重试。';

  const decodeBase64 = (value) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  };

  const showError = () => {
    if (error) {
      error.textContent = genericError;
      error.hidden = false;
    }
    input?.focus();
  };

  const decrypt = async (password) => {
    if (version !== '1' || !encoded || !saltEncoded) throw new Error('invalid payload');
    const salt = decodeBase64(saltEncoded);
    const ciphertext = decodeBase64(encoded);
    if (salt.byteLength !== 16 || ciphertext.byteLength <= 12 + 16) throw new Error('invalid payload');
    const iv = ciphertext.slice(0, 12);
    const encrypted = ciphertext.slice(12);
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode('linote-post-v1') }, key, encrypted);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    if (!payload || typeof payload.html !== 'string' || typeof payload.markdown !== 'string') throw new Error('invalid content');
    return payload.html;
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (error) error.hidden = true;
    const password = input?.value || '';
    if (!password) { showError(); return; }
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      const html = await decrypt(password);
      if (content) content.innerHTML = html;
      card.hidden = true;
      if (content) content.hidden = false;
      input.value = '';
    } catch (_) {
      showError();
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
