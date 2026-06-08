/**
 * PesaPal Payment Integration
 * Handles payment processing with PesaPal API
 */

interface PesaPalConfig {
  consumerKey: string;
  consumerSecret: string;
  apiUrl: string;
  redirectUrl: string;
}

interface PaymentRequest {
  id: string;
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  currency?: string;
  callbackType?: 'booking' | 'propertyRequest';
}

interface PaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status_code: string;
  status_description: string;
}

let config: PesaPalConfig | null = null;

export function initPesaPal(cfg: Partial<PesaPalConfig> = {}): PesaPalConfig {
  const defaultConfig: PesaPalConfig = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
    apiUrl: process.env.PESAPAL_API_URL || 'https://pesapal.com/api',
    redirectUrl: process.env.PESAPAL_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://dwell-ke.vercel.app'}/api/pesapal/callback`,
    ...cfg,
  };

  if (!defaultConfig.consumerKey || !defaultConfig.consumerSecret) {
    console.warn(
      '[PesaPal] Missing PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET environment variables'
    );
  }

  config = defaultConfig;
  return config;
}

export function getConfig(): PesaPalConfig {
  if (!config) {
    initPesaPal();
  }
  return config!;
}

/**
 * Get OAuth token from PesaPal
 */
function getSafeContentType(response: Response): string {
  return (response.headers.get('content-type') || '').toLowerCase();
}

async function parseJsonOrThrow(response: Response, context: string): Promise<any> {
  const contentType = getSafeContentType(response);

  // Happy path
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (e) {
      // fallthrough to text
    }
  }

  const text = await response.text();
  const snippet = text.trim().slice(0, 300);

  // Include snippet for diagnosing HTML/endpoint issues, but never include secrets.
  throw new Error(
    `[PesaPal ${context}] Non-JSON response (content-type: ${contentType}). Snippet: ${snippet}`
  );
}

  export async function getOAuthToken(): Promise<string> {
    const cfg = getConfig();
    const url = `${cfg.apiUrl}/api/Auth/RequestToken`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: cfg.consumerKey,
        consumer_secret: cfg.consumerSecret,
      }),
    });

    if (!response.ok) {
      const errorBody = await parseJsonOrThrow(response, 'OAuth');
      const msg =
        typeof errorBody === 'string'
          ? errorBody
          : JSON.stringify(errorBody);
      throw new Error(
        `PesaPal OAuth failed (${response.status}): ${msg.slice(0, 500)}`
      );
    }

    const data = await parseJsonOrThrow(response, 'OAuth');
    if (data.error || !data.token) {
      throw new Error(
        data.message || data.error_description || 'PesaPal auth error'
      );
    }
    return data.token;
  }


/**
 * Initiate a payment request with PesaPal
 */
export async function initiatePayment(
  payment: PaymentRequest
): Promise<PaymentResponse> {
  const cfg = getConfig();

  try {
    const token = await getOAuthToken();

    const callbackType = payment.callbackType || 'booking';
    const callbackUrl = `${cfg.redirectUrl}`;

    const safePaymentId = (payment.id || '')
      .toString()
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64);

    const safeCallbackType = (callbackType || 'booking')
      .toString()
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 32);

    // PesaPal “IPN Listener URL” is the callback URL we receive on.
    // However, PesaPal also validates a separate “IPN URL ID” value (notification_id).
    // Use a stable, sanitized notification_id; allow override via env if your dashboard expects a specific one.
    const notificationIdFromEnv = process.env.PESAPAL_IPN_URL_ID;

    const defaultNotificationId = `DWELL_${safeCallbackType}_${safePaymentId}`.slice(0, 64);

    const notificationId = (notificationIdFromEnv || defaultNotificationId)
      .toString()
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64);

    const payload: any = {
      id: payment.id,
      currency: payment.currency || 'KES',
      amount: payment.amount,
      description: payment.description,
      callback_url: callbackUrl,
      // This should match what PesaPal validates as “IPN URL ID”.
      notification_id: notificationId,
      merchant_reference: `DWELL-${payment.id}-${Date.now()}`,
      billing_address: {
        email_address: payment.customerEmail,
        phone_number: payment.customerPhone,
        first_name: payment.customerName.split(' ')[0],
        last_name: payment.customerName.split(' ')[1] || '',
      },
    };

    console.log('[PesaPal] Submitting order', {
      url: `${cfg.apiUrl}/api/Transactions/SubmitOrderRequest`,
      payload,
    });

    const response = await fetch(`${cfg.apiUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await parseJsonOrThrow(response, 'Payment Initiation');
      console.log('[PesaPal] HTTP error response', { status: response.status, body: errorBody });
      throw new Error(
        errorBody?.error_description ||
          errorBody?.message ||
          'Failed to initiate payment'
      );
    }

    const data = await parseJsonOrThrow(response, 'Payment Initiation');
    console.log('[PesaPal] Full response', { data });

    if (data.status_code && data.status_code !== '000') {
      throw new Error(
        `PesaPal error ${data.status_code}: ${data.status_description || 'Unknown error'}`
      );
    }

    if (!data.redirect_url) {
      console.log('[PesaPal] Missing redirect_url in response', { data });
    }

    return {
      order_tracking_id: data.order_tracking_id,
      merchant_reference: payload.merchant_reference,
      redirect_url: data.redirect_url,
      status_code: data.status_code,
      status_description: data.status_description,
    };

  } catch (error) {
    console.error('[PesaPal Payment Initiation]', error);
    throw error;
  }
}

/**
 * Get payment status from PesaPal
 */
export async function getPaymentStatus(
  orderTrackingId: string
): Promise<any> {
  const cfg = getConfig();

  try {
    const token = await getOAuthToken();

    const response = await fetch(
      `${cfg.apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to query payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('[PesaPal Status Query]', error);
    throw error;
  }
}

/**
 * Verify IPN signature (for webhook callbacks)
 */
export function verifyIPNSignature(
  orderTrackingId: string,
  orderMerchantReference: string,
  pesaPalSignature: string
): boolean {
  const cfg = getConfig();

  try {
    const hashString = `${orderTrackingId}${cfg.consumerSecret}${orderMerchantReference}`;
    // In production, properly hash the signature
    // This is a simplified check - implement proper HMAC verification
    return !!pesaPalSignature;
  } catch (error) {
    console.error('[PesaPal IPN Verification]', error);
    return false;
  }
}
