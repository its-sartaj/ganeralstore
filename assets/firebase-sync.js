// ============================================================
// Cloud Real-Time Sync Layer for Khurshid General Store
// Powered by Firebase Realtime Database (REST API)
// Bridges localStorage <-> Cloud Database
// Instant Cross-Device Sync for Admin & Customer Website
// ============================================================

(function() {
  'use strict';

  // 1. Database Configuration
  const DATABASE_URL = 'https://khurshid-store-481f4-default-rtdb.asia-southeast1.firebasedatabase.app';
  const STORE_PATH = '/khurshid_store';
  const POLL_INTERVAL = 5000; // Poll every 5 seconds for real-time customer updates

  const SYNC_CONFIG = [
    { local: 'khurshid_products', remote: 'products', broadcast: 'SYNC_PRODUCTS', isArray: true },
    { local: 'khurshid_settings', remote: 'settings', broadcast: 'SYNC_SETTINGS', isArray: false },
    { local: 'khurshid_invoices', remote: 'invoices', broadcast: 'SYNC_INVOICES', isArray: true }
  ];

  let _suppressCloudWrite = false;
  let _lastHashes = {};
  let _initialSyncCompleted = false;

  // BroadcastChannel for cross-context / tab sync
  let syncChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      syncChannel = new BroadcastChannel('khurshid_store_channel');
    }
  } catch (e) {}

  // Fast String Hash for Change Detection
  function simpleHash(str) {
    if (!str) return '0';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  // Write to localStorage & trigger React state updates in ALL tabs & current window
  function writeToLocalAndNotify(storageKey, data, broadcastType) {
    try {
      const json = JSON.stringify(data);
      _suppressCloudWrite = true;
      localStorage.setItem(storageKey, json);

      // 1. Dispatch custom StorageEvent for current window's React listener
      try {
        const storageEvent = new StorageEvent('storage', {
          key: storageKey,
          newValue: json,
          oldValue: null,
          url: window.location.href,
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      } catch (e) {
        // Fallback for older browsers
        try {
          const evt = document.createEvent('StorageEvent');
          if (evt.initStorageEvent) {
            evt.initStorageEvent('storage', false, false, storageKey, null, json, window.location.href, localStorage);
            window.dispatchEvent(evt);
          }
        } catch (err) {}
      }

      // 2. BroadcastChannel message for React app BroadcastChannel listener
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: broadcastType, payload: data });
        } catch (e) {}
      }

      setTimeout(function() {
        _suppressCloudWrite = false;
      }, 300);
    } catch (err) {
      _suppressCloudWrite = false;
      console.error('[CloudSync] localStorage update error:', err);
    }
  }

  // Fetch from Firebase REST API
  function fetchFromCloud(remotePath) {
    const url = DATABASE_URL + STORE_PATH + '/' + remotePath + '.json?t=' + Date.now();
    return fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  // Write to Firebase REST API
  function writeToCloud(remotePath, data) {
    const url = DATABASE_URL + STORE_PATH + '/' + remotePath + '.json';
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  // Initial Sync on Page Load
  function initialSync() {
    const promises = SYNC_CONFIG.map(function(item) {
      return fetchFromCloud(item.remote)
        .then(function(cloudData) {
          if (cloudData === null || cloudData === undefined) {
            // Cloud is completely empty: check if local has existing data to seed cloud
            const localRaw = localStorage.getItem(item.local);
            if (localRaw) {
              try {
                const localData = JSON.parse(localRaw);
                // Only seed if not empty array/object
                const hasContent = Array.isArray(localData) ? localData.length > 0 : (localData && Object.keys(localData).length > 0);
                if (hasContent) {
                  return writeToCloud(item.remote, localData).then(function() {
                    console.log('[CloudSync] ☁️ Seeded ' + item.remote + ' to cloud');
                    _lastHashes[item.remote] = simpleHash(localRaw);
                  });
                }
              } catch (e) {}
            }
          } else {
            // Cloud has data -> Cloud is source of truth
            let normalized = cloudData;
            if (item.isArray && !Array.isArray(cloudData)) {
              normalized = Object.values(cloudData);
            }
            const json = JSON.stringify(normalized);
            _lastHashes[item.remote] = simpleHash(json);
            writeToLocalAndNotify(item.local, normalized, item.broadcast);
            console.log('[CloudSync] 📥 Loaded ' + item.remote + ' from cloud');
          }
        })
        .catch(function(err) {
          console.warn('[CloudSync] Fetch failed for ' + item.remote + ':', err.message);
        });
    });

    Promise.all(promises).then(function() {
      _initialSyncCompleted = true;
      console.log('[CloudSync] ✅ Initial sync complete');
    });
  }

  // Periodic polling to fetch updates made on other devices
  function pollForUpdates() {
    SYNC_CONFIG.forEach(function(item) {
      fetchFromCloud(item.remote)
        .then(function(cloudData) {
          if (cloudData === null || cloudData === undefined) return;

          let normalized = cloudData;
          if (item.isArray && !Array.isArray(cloudData)) {
            normalized = Object.values(cloudData);
          }

          const json = JSON.stringify(normalized);
          const hash = simpleHash(json);

          // Update local state only if remote cloud data changed
          if (_lastHashes[item.remote] !== hash) {
            _lastHashes[item.remote] = hash;
            writeToLocalAndNotify(item.local, normalized, item.broadcast);
            console.log('[CloudSync] 🔄 Live update for ' + item.remote + ' received from cloud');
          }
        })
        .catch(function() {
          // Network errors silently ignored during background polling
        });
    });
  }

  // Intercept Admin localStorage writes and push to Cloud
  const _origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    _origSetItem(key, value);

    if (_suppressCloudWrite) return;

    let target = null;
    for (let i = 0; i < SYNC_CONFIG.length; i++) {
      if (SYNC_CONFIG[i].local === key) {
        target = SYNC_CONFIG[i];
        break;
      }
    }
    if (!target) return;

    try {
      const data = JSON.parse(value);
      const hash = simpleHash(value);

      if (_lastHashes[target.remote] !== hash) {
        _lastHashes[target.remote] = hash;
        writeToCloud(target.remote, data)
          .then(function() {
            console.log('[CloudSync] ☁️ Uploaded ' + target.remote + ' to cloud');
          })
          .catch(function(err) {
            console.error('[CloudSync] Upload error for ' + target.remote + ':', err);
          });
      }
    } catch (e) {}
  };

  // Connection Indicator UI
  function showStatusIndicator(isOnline) {
    let el = document.getElementById('cloud-sync-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cloud-sync-status';
      el.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:9999;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:600;font-family:system-ui,sans-serif;transition:all 0.4s;pointer-events:none;box-shadow:0 2px 5px rgba(0,0,0,0.15);';
      document.body.appendChild(el);
    }
    if (isOnline) {
      el.textContent = '🟢 Cloud Live';
      el.style.background = '#166534';
      el.style.color = '#dcfce7';
      el.style.border = '1px solid #22c55e';
      setTimeout(function() {
        if (el) el.style.opacity = '0';
      }, 4000);
    } else {
      el.textContent = '🔴 Offline';
      el.style.background = '#991b1b';
      el.style.color = '#fee2e2';
      el.style.border = '1px solid #ef4444';
      el.style.opacity = '0.9';
    }
  }

  // Initialize and attach listeners
  fetch(DATABASE_URL + '/.json', { method: 'GET' })
    .then(function(res) {
      if (res.ok) {
        showStatusIndicator(true);
        console.log('[CloudSync] 🚀 Cloud database connected');
        initialSync();
        setInterval(pollForUpdates, POLL_INTERVAL);

        // Instant refresh when user returns to website tab or focuses screen
        window.addEventListener('visibilitychange', function() {
          if (!document.hidden) pollForUpdates();
        });
        window.addEventListener('focus', pollForUpdates);
      } else {
        throw new Error('HTTP ' + res.status);
      }
    })
    .catch(function(err) {
      showStatusIndicator(false);
      console.warn('[CloudSync] Cloud sync offline:', err.message);
    });

})();
