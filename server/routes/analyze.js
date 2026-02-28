import express from 'express';
import { analyzeWasteImage } from '../services/openai.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze waste image and return classification
 * 
 * Accepts either:
 * - Multipart file upload (field name: "image") 
 * - JSON body: { image: "base64_encoded_image" } (legacy support)
 */
router.post('/analyze', authMiddleware, (req, res, next) => {
  // Try multipart upload first, fall back to JSON body
  upload.single('image')(req, res, async (uploadErr) => {
    try {
      let imageForAI;
      let imageUrl = '';

      if (req.file) {
        // --- Multer file upload path ---
        console.log(`📸 Received image upload: ${req.file.originalname} (${Math.round(req.file.size / 1024)}KB)`);

        // Upload to Cloudinary if configured
        if (isCloudinaryConfigured()) {
          try {
            const cloudResult = await uploadToCloudinary(req.file.buffer);
            imageUrl = cloudResult.url;
            imageForAI = cloudResult.url;
            console.log(`☁️ Uploaded to Cloudinary: ${imageUrl}`);
          } catch (cloudErr) {
            console.warn('☁️ Cloudinary upload failed, using base64 fallback:', cloudErr.message);
            // Fall back to base64
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            imageForAI = base64;
          }
        } else {
          // No Cloudinary — convert buffer to base64 for OpenAI
          const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
          imageForAI = base64;
        }

      } else if (req.body && req.body.image) {
        // --- Legacy JSON base64 path ---
        const { image } = req.body;
        const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
        if (!base64Regex.test(image)) {
          return res.status(400).json({
            error: 'Invalid image format',
            message: 'Image must be a valid base64 encoded string with data URI'
          });
        }
        imageForAI = image;
        console.log(`📸 Analyzing base64 waste image... (${Math.round(image.length / 1024)}KB)`);

      } else {
        return res.status(400).json({
          error: 'Image is required',
          message: 'Please upload an image file or provide a base64 encoded image'
        });
      }

      const startTime = Date.now();
      const result = await analyzeWasteImage(imageForAI);
      const processingTime = Date.now() - startTime;

      console.log(`✅ Analysis complete in ${processingTime}ms: ${result.category} - ${result.itemName}`);

      res.json({
        ...result,
        imageUrl,
        processingTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Analysis error:', error.message);

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
});

/**
 * GET /api/categories
 * Get all waste categories information (public)
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
