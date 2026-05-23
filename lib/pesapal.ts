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
  bookingId: string;
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  currency?: string;
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
    redirectUrl: process.env.PESAPAL_REDIRECT_URL || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
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
export async function getOAuthToken(): Promise<string> {
  const cfg = getConfig();

  try {
    const response = await fetch(`${cfg.apiUrl}/oauth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: cfg.consumerKey,
        client_secret: cfg.consumerSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get OAuth token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[PesaPal OAuth]', error);
    throw error;
  }
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

    const payload = {
      id: payment.bookingId,
      currency: payment.currency || 'KES',
      amount: payment.amount,
      description: payment.description,
      callback_url: `${cfg.redirectUrl}?bookingId=${payment.bookingId}`,
      notification_id: `booking-${payment.bookingId}`,
      merchant_reference: `DWELL-${payment.bookingId}-${Date.now()}`,
      billing_address: {
        email_address: payment.customerEmail,
        phone_number: payment.customerPhone,
        first_name: payment.customerName.split(' ')[0],
        last_name: payment.customerName.split(' ')[1] || '',
      },
    };

    const response = await fetch(`${cfg.apiUrl}/pesapal/parse-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error_description || 'Failed to initiate payment'
      );
    }

    const data = await response.json();
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
      `${cfg.apiUrl}/pesapal/query-payment-status?order_tracking_id=${orderTrackingId}`,
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
