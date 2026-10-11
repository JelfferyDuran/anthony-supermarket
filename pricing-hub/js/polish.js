/* Small interaction polish for the Loading Dock shell.
   Deliberately DOM-only: no backend calls and no changes to the scene contract. */

const zoneKeys = ['dock', 'intake', 'review', 'aisles', 'vault'];
const zoneButtons = [...document.querySelectorAll('#zonenav [data-zone]')];
const panel = document.getElementById('panel');
const panelScrim = document.getElementById('panelScrim');
const panelClose = document.getElementById('panelClose');

function closePanel() {
  if (!panel || panel.classList.contains('hidden')) return;
  panelClose?.click();
}

function syncZoneState(button) {
  zoneButtons.forEach((item) => {
    const active = item === button || item.classList.contains('active');
    item.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

zoneButtons.forEach((button, index) => {
  button.setAttribute('aria-keyshortcuts', String(index + 1));
  button.addEventListener('click', () => {
    syncZoneState(button);
    document.body.dataset.zone = button.dataset.zone || '';
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePanel();
    return;
  }
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  const index = Number(event.key) - 1;
  if (index >= 0 && index < zoneKeys.length) {
    const button = zoneButtons.find((item) => item.dataset.zone === zoneKeys[index]);
    button?.click();
  }
});

panelScrim?.addEventListener('click', closePanel);

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('pointerdown', () => {
    button.classList.add('is-pressing');
    window.setTimeout(() => button.classList.remove('is-pressing'), 180);
  });
});

const loaderStatus = document.getElementById('loaderStatus');
const loaderMessages = [
  'Calibrating the control room…',
  'Connecting the review line…',
  'Loading the approved pricing rule…',
];
let loaderIndex = 0;
const loaderTimer = window.setInterval(() => {
  if (!loaderStatus || document.getElementById('loader')?.classList.contains('hidden')) {
    window.clearInterval(loaderTimer);
    return;
  }
  loaderIndex = (loaderIndex + 1) % loaderMessages.length;
  loaderStatus.textContent = loaderMessages[loaderIndex];
}, 1450);

document.documentElement.dataset.polishReady = 'true';
