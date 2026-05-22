export async function initiatePesapalPayment(
  bookingId: number,
  amount: number,
  customerEmail: string,
  customerName: string
) {
  const payload = {
    id: `DWELL-${bookingId}-${Date.now()}`,
    currency: 'KES',
    amount,
    description: `Dwell KE Booking Payment - Booking #${bookingId}`,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
    notification_id: 'web_notification',
    billing_address: {
      email_address: customerEmail,
      phone_number: '',
      country_code: 'KE',
      first_name: customerName.split(' ')[0],
      last_name: customerName.split(' ').slice(1).join(' ') || '',
      line_1: '',
      line_2: '',
      postal_code: '',
      city: 'Nairobi',
      state: 'Nairobi',
    },
  };

  try {
    // Step 1: Get Auth Token
    const authResponse = await fetch('https://api.pesapal.com/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET,
      }),
    });

    const { token } = await authResponse.json();

    // Step 2: Submit Order
    const orderResponse = await fetch('https://api.pesapal.com/api/Pesapal/SubmitOrderInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const orderData = await orderResponse.json();

    if (orderData.status === '200') {
      return {
        success: true,
        reference: orderData.pesapal_reference_id,
        redirectUrl: `https://www.pesapal.com/api/redirect?pesapal_reference_id=${orderData.pesapal_reference_id}`,
      };
    } else {
      return {
        success: false,
        error: orderData.error || 'Failed to initiate payment',
      };
    }
  } catch (error) {
    console.error('[v0] PesaPal Error:', error);
    return {
      success: false,
      error: 'Payment service unavailable',
    };
  }
}

export async function queryPesapalPayment(pesapalReference: string) {
  try {
    // Get Auth Token
    const authResponse = await fetch('https://api.pesapal.com/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET,
      }),
    });

    const { token } = await authResponse.json();

    // Query Payment Status
    const statusResponse = await fetch(
      `https://api.pesapal.com/api/Pesapal/QueryPaymentStatus?pesapal_reference_id=${pesapalReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await statusResponse.json();
  } catch (error) {
    console.error('[v0] PesaPal Query Error:', error);
    return null;
  }
}
