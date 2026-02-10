import OpenAI from 'openai';

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

const SYSTEM_PROMPT = `You are an expert waste classification assistant. Your job is to analyze images of waste items and provide accurate classification for proper disposal.

You MUST respond with a valid JSON object in this exact format:
{
  "category": "recyclable" | "organic" | "hazardous",
  "itemName": "specific name of the item (e.g., 'Plastic Water Bottle', 'Banana Peel', 'AA Battery')",
  "binType": "name of the bin (e.g., 'Recycling Bin', 'Compost Bin', 'Hazardous Waste Collection')",
  "binColor": "Blue" | "Green" | "Red",
  "confidence": number between 0 and 100,
  "disposalSteps": ["step 1", "step 2", "step 3"],
  "environmentalTip": "an interesting fact about recycling or environmental impact of this item",
  "warnings": ["any safety warnings if applicable"] or []
}

Classification Guidelines:
- RECYCLABLE (Blue Bin): Plastic bottles, paper, cardboard, metal cans, glass bottles, aluminum foil, magazines
- ORGANIC (Green Bin): Food scraps, fruit/vegetable peels, coffee grounds, tea bags, eggshells, garden waste, leaves
- HAZARDOUS (Red/Special): Batteries, electronics, chemicals, paint, medicines, light bulbs, aerosol cans, motor oil

Important:
- Be specific about the item name
- Provide actionable disposal steps
- Include relevant safety warnings for hazardous items
- Make environmental tips educational and interesting
- If uncertain, classify as the safer option and note lower confidence`;

/**
 * Analyze a waste image using OpenAI GPT-4 Vision
 * @param {string} base64Image - Base64 encoded image with data URI
 * @returns {Object} Classification result
 */
export async function analyzeWasteImage(base64Image) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this waste item and classify it for proper disposal. Respond with JSON only."
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "low" // Use low detail for faster processing and lower cost
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI model');
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonString = content;
    if (content.includes('```json')) {
      jsonString = content.split('```json')[1].split('```')[0];
    } else if (content.includes('```')) {
      jsonString = content.split('```')[1].split('```')[0];
    }

    const result = JSON.parse(jsonString.trim());

    // Validate required fields
    const requiredFields = ['category', 'itemName', 'binType', 'binColor', 'disposalSteps', 'environmentalTip'];
    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate category
    if (!['recyclable', 'organic', 'hazardous'].includes(result.category)) {
      throw new Error(`Invalid category: ${result.category}`);
    }

    return {
      category: result.category,
      itemName: result.itemName,
      binType: result.binType,
      binColor: result.binColor,
      confidence: result.confidence || 85,
      disposalSteps: result.disposalSteps || [],
      environmentalTip: result.environmentalTip,
      warnings: result.warnings || []
    };

  } catch (error) {
    // If parsing fails or API error, provide fallback response
    if (error instanceof SyntaxError) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Fallback classification when API is unavailable
 * Uses basic image analysis heuristics
 */
export function fallbackClassification() {
  return {
    category: 'recyclable',
    itemName: 'Unidentified Item',
    binType: 'General Recycling Bin',
    binColor: 'Blue',
    confidence: 50,
    disposalSteps: [
      'If unsure, check the recycling symbol on the item',
      'Clean the item before disposal',
      'When in doubt, place in general waste'
    ],
    environmentalTip: 'When uncertain about an item, check your local recycling guidelines or contact your waste management provider.',
    warnings: ['Classification uncertain - please verify before disposal']
  };
}
