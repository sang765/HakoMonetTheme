var phrasePushButtonEnabled = 'Tắt nhận thông báo';
var phrasePushButtonDisabled = 'Đăng ký nhận thông báo';
var phrasePushButtonComputing = 'Đang xử lý ...';
var phrasePushButtonIncompat = 'Trình duyệt không hỗ trợ nhận thông báo';

document.addEventListener("DOMContentLoaded", () => {
    const applicationServerKey = "BILrThJKHnp4yHKJUpkRJ3n9l056r8dVIA3WhznKTgF9QxQOkoC3MxjB97T9044A82Iyy0k3qACX223_tvIM1Kg";
    let isPushEnabled = false;

    const pushButton = document.querySelector('#push-subscription-button');

    if (pushButton) {
      pushButton.addEventListener('click', function() {
          if (isPushEnabled) {
              push_unsubscribe();
          } else {
              push_subscribe();
          }
      });
    }

    if (!('serviceWorker' in navigator)) {
        console.warn("Service workers are not supported by this browser");
        changePushButtonState('incompatible');
        return;
    }

    if (!('PushManager' in window)) {
        console.warn('Push notifications are not supported by this browser');
        changePushButtonState('incompatible');
        return;
    }

    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        console.warn('Notifications are not supported by this browser');
        changePushButtonState('incompatible');
        return;
    }

    // Check the current Notification permission.
    // If its denied, the button should appears as such, until the user changes the permission manually
    if (Notification.permission === 'denied') {
        console.warn('Notifications are denied by the user');
        changePushButtonState('incompatible');
        return;
    }

    // Check for existing service worker registrations
    navigator.serviceWorker.getRegistration().then(existingRegistration => {
        if (existingRegistration) {
            console.log('[SW] Reusing existing service worker registration');
            push_updateSubscription();
        } else {
            navigator.serviceWorker.register("/service-worker.js")
                .then(() => {
                    console.log('[SW] Service worker has been registered');
                    push_updateSubscription();
                }, e => {
                    console.error('[SW] Service worker registration failed', e);
                    changePushButtonState('incompatible');
                });
        }
    });

    function changePushButtonState (state) {
        if (!pushButton) {
          return;
        }

        switch (state) {
            case 'enabled':
                pushButton.disabled = false;
                pushButton.textContent = phrasePushButtonEnabled;
                isPushEnabled = true;
                break;
            case 'disabled':
                pushButton.disabled = false;
                pushButton.textContent = phrasePushButtonDisabled;
                isPushEnabled = false;
                break;
            case 'computing':
                pushButton.disabled = true;
                pushButton.textContent = phrasePushButtonComputing;
                break;
            case 'incompatible':
                pushButton.disabled = true;
                pushButton.textContent = phrasePushButtonIncompat;
                break;
            default:
                console.error('Unhandled push button state', state);
                break;
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Improved error handling in push_subscribe
    function push_subscribe() {
        if (!pushButton) {
            return;
        }

        changePushButtonState('computing');

        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
            }))
            .then(subscription => {
                return push_sendSubscriptionToServer(subscription, 'POST').then(() => subscription);
            })
            .then(subscription => {
                if (subscription) {
                    addPushUser(userId);
                    // Save subscription info to localStorage for future comparison
                    const currentEndpoint = subscription.endpoint;
                    const currentP256dh = subscription.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))) : null;
                    const currentAuth = subscription.getKey('auth') ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))) : null;
                    localStorage.setItem('push_subscription_info', JSON.stringify({
                        endpoint: currentEndpoint,
                        p256dh: currentP256dh,
                        auth: currentAuth
                    }));
                    changePushButtonState('enabled');
                } else {
                    throw new Error('Subscription failed on the server.');
                }
            })
            .catch(e => {
                if (Notification.permission === 'denied') {
                    console.warn('Notifications are denied by the user.');
                    changePushButtonState('incompatible');
                } else {
                    console.error('Impossible to subscribe to push notifications', e);
                    alert('Failed to subscribe to push notifications. Please try again later.');
                    changePushButtonState('disabled');
                }
            });
    }

    // Improved push_updateSubscription to check if the subscription endpoint has changed before sending it to the server
    function push_updateSubscription() {
        if (!pushButton) {
            return;
        }

        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
            .then(subscription => {
                if (!subscription) {
                    removePushUser(userId);
                    changePushButtonState('disabled');
                    return;
                }

                const currentEndpoint = subscription.endpoint;
                const currentP256dh = subscription.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))) : null;
                const currentAuth = subscription.getKey('auth') ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))) : null;

                let stored = {};
                try {
                    stored = JSON.parse(localStorage.getItem('push_subscription_info') || '{}');
                } catch (e) {
                    stored = {};
                }

                // Compare endpoint and keys
                if (currentEndpoint !== stored.endpoint || currentP256dh !== stored.p256dh || currentAuth !== stored.auth) {
                    // Send the subscription to the server
                    return push_sendSubscriptionToServer(subscription, 'PUT').then(() => {
                        // Update the stored info
                        localStorage.setItem('push_subscription_info', JSON.stringify({
                            endpoint: currentEndpoint,
                            p256dh: currentP256dh,
                            auth: currentAuth
                        }));
                    });
                } else {
                    console.log('Subscription info has not changed. Skipping server update.');

                    return subscription;
                }
            })
            .then(subscription => {
                if (subscription && hasPushUser(userId)) {
                    changePushButtonState('enabled');
                }
            })
            .catch(e => {
                console.error('Error when updating the subscription', e);
                alert('Failed to update the subscription. Please try again later.');
            });
    }

    function push_unsubscribe() {
        if (!pushButton) {
          return;
        }

        changePushButtonState('computing');

        navigator.serviceWorker.ready
        .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
        .then(subscription => {
            if (!subscription) {
                changePushButtonState('disabled');
                console.log('No subscription to unsubscribe');
                return;
            }

            return push_sendSubscriptionToServer(subscription, 'DELETE');
        })
        .then(subscription => removePushUser(userId) && subscription && subscription.unsubscribe())
        .then(() => changePushButtonState('disabled'))
        .catch(e => {
            console.error('Error when unsubscribing the user', e);
            changePushButtonState('disabled');
        });
    }

    function push_sendSubscriptionToServer(subscription, method) {
        const key = subscription.getKey('p256dh');
        const token = subscription.getKey('auth');
        const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

        return fetch('/others/push_subscription', {
            method: 'POST',
            body: JSON.stringify({
                method: method,
                endpoint: subscription.endpoint,
                publicKey: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                authToken: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
                contentEncoding,
            }),
        })
        .then(response => response.json())
        .then(json => json.status == 'success' ? subscription : null);
    }

    function hasPushUser(userId) {
        return getPushUsers().indexOf(userId) != -1;
    }

    // Check for localStorage availability
    function isLocalStorageAvailable() {
        try {
            const testKey = '__test__';
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    function getPushUsers() {
        if (!isLocalStorageAvailable()) {
            return [];
        }
        return JSON.parse(window.localStorage.getItem('ln_hako_push_subscription_users') || '[]');
    }

    function addPushUser(userId) {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        var pushUsers = getPushUsers();
        pushUsers.push(userId);
        pushUsers = [...new Set(pushUsers)];

        window.localStorage.setItem('ln_hako_push_subscription_users', JSON.stringify(pushUsers));

        return true;
    }

    function removePushUser(userId) {
        if (!isLocalStorageAvailable()) {
            return false;
        }
        var pushUsers = getPushUsers();
        pushUsers = pushUsers.filter(u => u != userId);

        window.localStorage.setItem('ln_hako_push_subscription_users', JSON.stringify(pushUsers));

        return true;
    }
});
