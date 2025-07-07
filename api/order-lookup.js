const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = async (req, res) => {
  // ✅ CORS HEADERS — required for browser to access
  res.setHeader('Access-Control-Allow-Origin', '*'); // or specify domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Support preflight requests from browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed.' });
  }

  const { order_number, email } = req.body || {};

  if (!order_number || !email) {
    return res.status(400).json({ error: 'Order number and email are required.' });
  }

  try {
    const response = await axios.get(`${process.env.SHOPIFY_API_URL}?status=any&name=${order_number}`, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const orders = response.data.orders || [];
    const match = orders.find(order => order.email.toLowerCase() === email.toLowerCase());
  if (req.method === 'GET' && req.url === '/') {
  res.setHeader('Content-Type', 'text/html');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'));
  return res.status(200).send(html);
}

    if (match) {
      return res.status(200).json(match);
    } else {
      return res.status(404).json({ error: 'Order not found. Please check your details.' });
    }
 } catch (error) {
  console.error("Error in order lookup:", error.response?.data || error.message || error); // 👈 add this
  res.status(500).json({ error: "Internal server error." });
}
};
