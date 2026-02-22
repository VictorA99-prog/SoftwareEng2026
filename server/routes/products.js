const express = require('express');
const operations =  require('../../database/operations.js');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Products landing page.' });
});

router.get('/all', async (req, res) => {
  try {
    const products = await operations.getAllProducts();
    console.log('Products fetched successfully:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;