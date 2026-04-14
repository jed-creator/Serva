/**
 * Expo Push API client for sending push notifications to mobile devices.
 * Uses the "https://exp.host/--/api/v2/push/send" endpoint — no SDK needed.
 */

interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
}

export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<{
  ok: boolean;
  tickets?: ExpoPushTicket[];
  error?: string;
}> {
  if (messages.length === 0) return { ok: true, tickets: [] };

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { data: ExpoPushTicket[] };
    return { ok: true, tickets: data.data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function sendPushToUser(
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (pushTokens.length === 0) return;

  const messages: ExpoPushMessage[] = pushTokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data,
  }));

  await sendExpoPush(messages);
}
