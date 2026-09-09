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
  const POLL_INTERVAL = 4000; // Poll every 4 seconds for instant live updates

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

  // Safe localStorage write that handles QuotaExceededError
  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('[CloudSync] Quota warning on ' + key + ', attempting cleanup...', e);
      try {
        // If quota exceeded, clean up old non-critical caches
        localStorage.removeItem('khurshid_clean_catalog_v2');
        localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.error('[CloudSync] localStorage write failed permanently', err);
        return false;
      }
    }
  }

  // Write to localStorage & trigger React state updates in ALL tabs & current window
  function writeToLocalAndNotify(storageKey, data, broadcastType) {
    try {
      const json = JSON.stringify(data);
      _suppressCloudWrite = true;
      safeLocalStorageSet(storageKey, json);

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

  // Normalize data retrieved from Cloud (handles wrappers, arrays, objects)
  function normalizeCloudData(cloudData, isArray) {
    if (cloudData === null || cloudData === undefined) {
      return isArray ? [] : null;
    }

    // Wrapped structure: { list: [...], updatedAt: 12345 } or { data: ..., updatedAt: ... }
    let raw = cloudData;
    if (cloudData && typeof cloudData === 'object' && ('list' in cloudData || 'data' in cloudData)) {
      raw = cloudData.list !== undefined ? cloudData.list : cloudData.data;
      if (raw === null || raw === undefined) {
        return isArray ? [] : {};
      }
    }

    if (isArray) {
      if (Array.isArray(raw)) {
        return raw;
      }
      if (raw && typeof raw === 'object') {
        return Object.values(raw);
      }
      return [];
    }

    return raw && typeof raw === 'object' ? raw : {};
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

  // Write to Firebase REST API with wrapper to protect empty arrays from being converted to null
  function writeToCloud(remotePath, data, isArray) {
    const url = DATABASE_URL + STORE_PATH + '/' + remotePath + '.json';
    const payload = isArray 
      ? { list: Array.isArray(data) ? data : [], updatedAt: Date.now() }
      : { data: data, updatedAt: Date.now() };

    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
            // Cloud has never been initialized: seed from local storage if available
            const localRaw = localStorage.getItem(item.local);
            if (localRaw) {
              try {
                const localData = JSON.parse(localRaw);
                const hasContent = item.isArray 
                  ? (Array.isArray(localData) && localData.length > 0)
                  : (localData && Object.keys(localData).length > 0);

                if (hasContent) {
                  return writeToCloud(item.remote, localData, item.isArray).then(function() {
                    console.log('[CloudSync] ☁️ Seeded ' + item.remote + ' to cloud');
                    _lastHashes[item.remote] = simpleHash(localRaw);
                  });
                }
              } catch (e) {}
            }
          } else {
            // Cloud is initialized -> Cloud is the single source of truth
            const normalized = normalizeCloudData(cloudData, item.isArray);
            const json = JSON.stringify(normalized);
            _lastHashes[item.remote] = simpleHash(json);
            writeToLocalAndNotify(item.local, normalized, item.broadcast);
            console.log('[CloudSync] 📥 Loaded ' + item.remote + ' from cloud (' + (item.isArray ? normalized.length + ' items' : 'settings') + ')');
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

          const normalized = normalizeCloudData(cloudData, item.isArray);
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
          // Silent fail during background polling
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
        writeToCloud(target.remote, data, target.isArray)
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
