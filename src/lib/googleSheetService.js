import { getSetting } from './db';

export async function syncToGoogleSheets(action, payload) {
  const webhookUrl = await getSetting('googleSheetWebhookUrl', '');
  const apiSecret = await getSetting('apiSecretToken', 'IOC_USAARI_SECURE_2026');

  if (!webhookUrl) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        token: apiSecret,
        payload,
        clientTimestamp: Date.now()
      })
    });

    const result = await response.json();
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function testSheetConnection(url, token) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ping',
        token: token || 'IOC_USAARI_SECURE_2026'
      })
    });
    const result = await response.json();
    return result.status === 'ok';
  } catch (_) {
    return false;
  }
}
