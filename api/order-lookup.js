console.log("Incoming request:", req.body);

try {
  const response = await axios.get(
    `${process.env.SHOPIFY_API_URL}?status=any&name=${order_number}`,
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log("Shopify Response:", response.data); // Add this

  const orders = response.data.orders || [];
  const match = orders.find(order => order.email.toLowerCase() === email.toLowerCase());

  if (match) {
    return res.status(200).json(match);
  } else {
    return res.status(404).json({ error: 'Order not found. Please check your details.' });
  }
} catch (error) {
  console.error("API ERROR:", error.message); // Add this
  return res.status(500).json({ error: 'Something went wrong.', details: error.message });
}
