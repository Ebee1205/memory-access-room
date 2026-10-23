const VALID_LINK = /^(https:\/\/|mailto:)/i;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const appendText = (parent, tag, className, text) => parent.appendChild(el(tag, className, text ?? ''));

export function createPanel(profile) {
  const backdrop = document.getElementById('panel-backdrop');
  const content = document.getElementById('panel-content');
  const kind = document.getElementById('panel-kind');
  const closeButton = document.getElementById('close-panel');
  let opened = false;
  let focusReturn = null;
  let currentChannel = 0;

  function renderChannel(index) {
    currentChannel = index;
    content.replaceChildren();
    const channels = profile.channels ?? [];
    const selected = channels[index];
    if (!selected) return appendText(content, 'p', 'empty', 'ARCHIVE IS OFFLINE');
    const tabs = el('div', 'channel-tabs');
    tabs.setAttribute('role', 'tablist');
    for (let i = 0; i < channels.length; i++) {
      const button = el('button', i === index ? 'channel-tabs__tab is-active' : 'channel-tabs__tab', `CH ${String(i + 1).padStart(2, '0')} / ${channels[i].label}`);
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(i === index));
      button.addEventListener('click', () => renderChannel(i));
      tabs.appendChild(button);
    }
    content.appendChild(tabs);
    appendText(content, 'div', 'content-kicker', 'PERSONAL INTERPRETATION DATABASE');
    appendText(content, 'h2', 'content-heading', selected.title ?? selected.label);
    appendText(content, 'p', 'lead', selected.summary ?? '');
    for (const entry of selected.entries ?? []) {
      const section = el('section', 'archive-entry');
      appendText(section, 'h3', null, entry.heading ?? 'ENTRY');
      appendText(section, 'p', null, entry.body ?? '');
      if (Array.isArray(entry.tags) && entry.tags.length) {
        const tags = el('div', 'tags');
        entry.tags.forEach((tag) => appendText(tags, 'span', 'tag', tag));
        section.appendChild(tags);
      }
      if (entry.link?.href && VALID_LINK.test(entry.link.href)) {
        const link = el('a', 'archive-link', entry.link.label ?? 'VIEW SOURCE ↗');
        link.href = entry.link.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        section.appendChild(link);
      }
      content.appendChild(section);
    }
    appendText(content, 'p', 'metadata-note', `SOURCE: ${profile.meta?.generator ?? 'unknown'} • ${profile.meta?.approved ? 'APPROVED' : 'SAMPLE / UNREVIEWED'}`);
  }
  function renderContact() {
    content.replaceChildren();
    appendText(content, 'div', 'content-kicker', 'OUTGOING TRANSMISSION');
    appendText(content, 'h2', 'content-heading', 'EXTERNAL LINE');
    appendText(content, 'p', 'lead', '이 방의 밖으로 연결되는 통신 장치입니다. 사용 가능한 회선을 선택하세요.');
    const list = el('div', 'contact-list');
    for (const item of profile.contacts ?? []) {
      if (!VALID_LINK.test(item.href ?? '')) continue;
      const a = el('a', 'contact-item');
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      appendText(a, 'strong', null, item.label ?? 'CONTACT');
      appendText(a, 'span', null, item.description ?? 'OPEN EXTERNAL LINK');
      appendText(a, 'b', null, '↗');
      list.appendChild(a);
    }
    content.appendChild(list);
    if (!list.children.length) appendText(content, 'p', 'empty', 'NO PUBLIC LINES CONFIGURED');
  }
  function open(type) {
    focusReturn = document.activeElement;
    backdrop.hidden = false;
    opened = true;
    content.scrollTop = 0;
    kind.textContent = type === 'phone' ? 'EXTERNAL LINE / 02' : 'MEMORY ARCHIVE / 01';
    if (type === 'phone') renderContact();
    else renderChannel(currentChannel);
    closeButton.focus();
  }
  function close() {
    if (!opened) return;
    backdrop.hidden = true;
    opened = false;
    focusReturn?.focus?.();
  }
  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) close(); });
  window.addEventListener('keydown', (event) => {
    if (!opened) return;
    if (event.code === 'Escape') close();
    if (event.code === 'Tab') {
      const controls = [...backdrop.querySelectorAll('button, a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  return { open, close, get opened() { return opened; } };
}
