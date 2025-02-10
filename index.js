const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Main endpoint to get properties
app.get('/api/properties', async (req, res) => {
  try {
    // Fetch Rightmove page
    const response = await axios.get('https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E984&#039;, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
      }
    });

    const $ = cheerio.load(response.data);
    const properties = [];

    // Extract property data
    $('.propertyCard').each((i, element) => {
      const price = $(element).find('.propertyCard-priceValue').text().replace('£', '').replace(',', '');
      const title = $(element).find('.propertyCard-title').text().trim();
      const image = $(element).find('.propertyCard-img img').attr('src');
      const url = 'https://www.rightmove.co.uk&#039; + $(element).find('a.propertyCard-link').attr('href');
      
      properties.push({
        id: url.split('/').pop(),
        price: parseInt(price) || 0,
        title,
        image,
        url,
        addedDate: new Date().toISOString().split('T')[0]
      });
    });

    res.json({
      success: true,
      total: properties.length,
      properties
    });

  } catch (error) {
    console.error('Scraper error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(Server running on port ${port});
});
