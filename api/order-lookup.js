const axios = require('axios');

module.exports = async (req, res) => {
  try {
    console.log('📥 Incoming Method:', req.method);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST method is allowed.' });
    }

    console.log('📦 Body Received:', req.body);

    const { order_number, email } = req.body || {};

    if (!order_number || !email) {
      console.log('⚠️ Missing order_number or email');
      return res.status(400).json({ error: 'Order number and email are required.' });
    }

    const url = `${process.env.SHOPIFY_API_URL}?status=any&name=${order_number}`;
    console.log('🔗 Requesting Shopify URL:', url);

    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const orders = response.data.orders || [];
    const match = orders.find(order => order.email.toLowerCase() === email.toLowerCase());

    console.log('🔍 Orders found:', orders.length);

    if (match) {
      console.log('✅ Match found');
      return res.status(200).json(match);
    } else {
      console.log('❌ No match');
      return res.status(404).json({ error: 'Order not found. Please check your details.' });
    }
  } catch (error) {
    console.error('🔥 Error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
