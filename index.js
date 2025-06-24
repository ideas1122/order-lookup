require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const SHOP = process.env.SHOPIFY_SHOP;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

// Helper: Search order by name and email
async function findOrder(orderNumber, email) {
  const url = `https://${SHOP}/admin/api/2023-01/orders.json?name=%23${orderNumber}&email=${encodeURIComponent(email)}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.orders && response.data.orders.length > 0) {
      return response.data.orders[0]; // return the first match
    }
    return null;
  } catch (error) {
    return null;
  }
}

// API Endpoint
app.post('/order-lookup', async (req, res) => {
  const { order_number, email } = req.body || {};
  if (!order_number || !email) {
    return res.status(400).json({ error: 'Order number and email are required.' });
  }
  const order = await findOrder(order_number, email);
  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your details.' });
  }

  // Extract info (customize as needed)
  res.json({
    order_number: order.name,
    created_at: order.created_at,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    total_price: order.total_price,
    line_items: order.line_items.map(i => ({
      title: i.title,
      quantity: i.quantity
    })),
    shipping_address: order.shipping_address,
    fulfillments: order.fulfillments.map(f => ({
      tracking_number: f.tracking_number,
      tracking_url: f.tracking_url,
      tracking_company: f.tracking_company,
      status: f.status
    }))
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Order lookup server running on port ${PORT}`);
});
