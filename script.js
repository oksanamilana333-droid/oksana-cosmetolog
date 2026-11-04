/* ЗАПОЛНИТЕ ПЕРЕД ПУБЛИКАЦИЕЙ. Только полные ссылки на ваши аккаунты.
   Примеры форматов: https://vk.me/..., https://t.me/..., https://max.ru/...
   Пустое значение не отправит посетителя в чужой аккаунт. */
const SITE_CONFIG = {
  contacts: { vk: 'https://vk.ru/milaya__ksu_cosm', telegram: 'https://t.me/milaya_ksu', max: '' },
  address: '',
  // При подключении аналитики задайте обработчик: (event, parameters) => ...
  onEvent: null
};

(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const contactDialog = document.querySelector('#contact-dialog');
  const documentsDialog = document.querySelector('#documents-dialog');
  const status = document.querySelector('#contact-status');
  let contactPosition = 'dialog';

  function track(name, position) {
    const detail = { name, position };
    document.dispatchEvent(new CustomEvent('site:analytics', { detail }));
    if (typeof SITE_CONFIG.onEvent === 'function') {
      try { SITE_CONFIG.onEvent(name, { position }); } catch (error) { console.warn('Ошибка аналитики', error); }
    }
  }
  function openDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function closeMenu() {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('is-open', expanded);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.querySelectorAll('[data-contact]').forEach(button => {
    button.addEventListener('click', () => {
      contactPosition = button.dataset.position;
      status.textContent = '';
      track('contact_picker_open', contactPosition);
      openDialog(contactDialog);
    });
  });
  document.querySelectorAll('[data-channel]').forEach(button => {
    button.addEventListener('click', () => {
      const channel = button.dataset.channel;
      const url = SITE_CONFIG.contacts[channel];
      if (!url) {
        if (!contactDialog.open) { contactPosition = button.dataset.position || 'contacts'; openDialog(contactDialog); }
        status.textContent = 'Ссылка на этот мессенджер пока не добавлена. Сайт готовится к публикации.';
        return;
      }
      let parsed;
      try { parsed = new URL(url); } catch { status.textContent = 'Проверьте ссылку на мессенджер в настройках сайта.'; openDialog(contactDialog); return; }
      if (parsed.protocol !== 'https:') { status.textContent = 'Для связи необходима безопасная ссылка HTTPS.'; openDialog(contactDialog); return; }
      track(`contact_${channel}_click`, button.dataset.position || contactPosition);
      window.open(parsed.href, '_blank', 'noopener,noreferrer');
    });
  });
  document.querySelector('#documents-button').addEventListener('click', () => openDialog(documentsDialog));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    });
  });
  if (SITE_CONFIG.address.trim()) document.querySelector('#clinic-address').textContent = SITE_CONFIG.address;
})();

