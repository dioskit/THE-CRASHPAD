/**
 * PREVIEW ONLY — compare design versions A and B section by section.
 * Remove this file (and its <script> tag) before going live.
 */
(() => {
  const SECTIONS = [
    ['vTeam', 'Team'], ['vActs', 'Activities'], ['vSuru', 'Suru story'],
    ['vPartners', 'Partners'], ['vClients', 'Past clients'], ['vInvolve', 'Get involved']
  ];
  const KEY = 'crashpad-preview-variants';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { /* storage blocked */ }
  const params = new URLSearchParams(location.search);

  const set = (key, v) => {
    document.body.dataset[key] = v;
    saved[key] = v;
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ }
    panel.querySelectorAll(`[data-key="${key}"] button`).forEach(b => b.classList.toggle('on', b.dataset.v === v));
  };

  const panel = document.createElement('div');
  panel.className = 'preview-panel';
  panel.innerHTML = '<button type="button" class="pp-toggle">Versions A / B</button><div class="pp-body">'
    + SECTIONS.map(([k, label]) => `<div class="pp-row" data-key="${k}"><span>${label}</span>`
      + '<button type="button" data-v="a">A</button><button type="button" data-v="b">B</button></div>').join('')
    + '<div class="pp-row pp-all"><span>All</span><button type="button" data-all="a">A</button><button type="button" data-all="b">B</button></div></div>';
  document.body.appendChild(panel);
  if (window.matchMedia('(max-width: 720px)').matches) panel.classList.add('collapsed');

  panel.querySelector('.pp-toggle').addEventListener('click', () => panel.classList.toggle('collapsed'));
  panel.addEventListener('click', e => {
    const b = e.target.closest('button[data-v], button[data-all]');
    if (!b) return;
    if (b.dataset.all) SECTIONS.forEach(([k]) => set(k, b.dataset.all));
    else set(b.closest('.pp-row').dataset.key, b.dataset.v);
  });

  SECTIONS.forEach(([k]) => set(k, params.get(k) || saved[k] || 'a'));
})();
