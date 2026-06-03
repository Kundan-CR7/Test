type RegisterServiceWorkerOptions = {
  onNeedRefresh?: (refresh: () => void) => void;
  onOfflineReady?: () => void;
};

export function registerProductionEntryServiceWorker({
  onNeedRefresh,
  onOfflineReady,
}: RegisterServiceWorkerOptions = {}) {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  let offlineReadyShown = false;
  let reloadOnControllerChange = false;
  let hasReloadedForUpdate = false;

  function notifyOfflineReady() {
    if (offlineReadyShown) return;
    offlineReadyShown = true;
    onOfflineReady?.();
  }

  function promptRefresh(worker: ServiceWorker) {
    onNeedRefresh?.(() => {
      reloadOnControllerChange = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadOnControllerChange || hasReloadedForUpdate) return;
    hasReloadedForUpdate = true;
    window.location.reload();
  });

  function startRegistration() {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          promptRefresh(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state !== 'installed') return;

            if (navigator.serviceWorker.controller) {
              promptRefresh(worker);
            } else {
              notifyOfflineReady();
            }
          });
        });

        navigator.serviceWorker.ready.then(() => {
          notifyOfflineReady();
        });
      })
      .catch(() => {
        return;
      });
  }

  if (document.readyState === 'complete') {
    startRegistration();
  } else {
    window.addEventListener('load', startRegistration, { once: true });
  }
}
