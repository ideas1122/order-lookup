const axios = require('axios');

module.exports = async (req, res) => {
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

    if (match) {
      return res.status(200).json(match);
    } else {
      return res.status(404).json({ error: 'Order not found. Please check your details.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong.', details: error.message });
  }
};
