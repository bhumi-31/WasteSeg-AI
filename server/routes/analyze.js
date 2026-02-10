import express from 'express';
import { analyzeWasteImage } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze waste image and return classification
 * 
 * Request body: { image: "base64_encoded_image" }
 * Response: { category, itemName, binType, binColor, disposalSteps, environmentalTip, confidence }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ 
        error: 'Image is required',
        message: 'Please provide a base64 encoded image in the request body'
      });
    }

    // Validate base64 image
    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!base64Regex.test(image)) {
      return res.status(400).json({ 
        error: 'Invalid image format',
        message: 'Image must be a valid base64 encoded string with data URI'
      });
    }

    console.log(`📸 Analyzing waste image... (${Math.round(image.length / 1024)}KB)`);
    
    const startTime = Date.now();
    const result = await analyzeWasteImage(image);
    const processingTime = Date.now() - startTime;

    console.log(`✅ Analysis complete in ${processingTime}ms: ${result.category} - ${result.itemName}`);

    res.json({
      ...result,
      processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    
    // Handle specific OpenAI errors
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key is not configured properly'
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limited',
        message: 'Too many requests to AI service. Please try again in a moment.'
      });
    }

    next(error);
  }
});

/**
 * GET /api/categories
 * Get all waste categories information
 */
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      {
        id: 'recyclable',
        name: 'Recyclable',
        emoji: '♻️',
        binColor: 'Blue',
        examples: ['Plastic bottles', 'Paper', 'Cardboard', 'Metal cans', 'Glass'],
        description: 'Materials that can be processed and reused'
      },
      {
        id: 'organic',
        name: 'Organic',
        emoji: '🌿',
        binColor: 'Green',
        examples: ['Food scraps', 'Fruit peels', 'Coffee grounds', 'Garden waste'],
        description: 'Biodegradable waste that can be composted'
      },
      {
        id: 'hazardous',
        name: 'Hazardous',
        emoji: '⚠️',
        binColor: 'Red',
        examples: ['Batteries', 'Electronics', 'Chemicals', 'Medicines', 'Paint'],
        description: 'Dangerous materials requiring special disposal'
      }
    ]
  });
});

export default router;
