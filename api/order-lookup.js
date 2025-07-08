const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = async (req, res) => {
  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Preflight check
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ✅ Serve HTML on GET /
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
    return res.status(200).send(html);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed.' });
  }

  const { order_number, email } = req.body || {};

  if (!order_number || !email) {
    return res.status(400).json({ error: 'Order number and email are required.' });
  }

  const cleanOrderNumber = order_number.replace(/^#/, '').trim();

  try {
    const response = await axios.get(`${process.env.SHOPIFY_API_URL}?status=any&name=${cleanOrderNumber}`, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const orders = response.data.orders || [];

    const match = orders.find(order => {
      if (!order.email) return false;
      return order.email.toLowerCase().trim() === email.toLowerCase().trim();
    });

    // 🔍 Debug full matched order object
    console.log("🧾 Full matched order object:", JSON.stringify(match, null, 2));

    if (match) {
      const result = {
        name: match.name,
        email: match.email || 'Not provided',
        financial_status: match.financial_status,
        current_total_price: match.current_total_price,
        currency: match.currency,
        line_items: match.line_items,
        fulfillments: match.fulfillments,
        order_status_url: match.order_status_url || null
      };
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ error: 'Order not found. Please check your details.' });
    }

  } catch (error) {
    console.error("❌ Error in order lookup:", error.response?.data || error.message || error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
