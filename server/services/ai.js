import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { classifyComplaintFallback, matchSchemesFallback, analyzeImageFallback } from './classifier.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const classifyComplaint = async (description, imagePath) => {
  if (!ai) {
    console.log('No GEMINI_API_KEY found, using fallback classifier.');
    return classifyComplaintFallback(description);
  }

  try {
    const prompt = `
You are a civic complaint classifier for an Indian constituency. 
Analyze the following complaint which may be in English, Tamil, or mixed language.
Classify it accurately into one of the following department codes: roads, sanitation, water, drainage, electrical, transport, general.
Also provide category, subcategory, severity (low/medium/high/critical), and priority (low/medium/high/critical).

Complaint: "${description}"
`;

    let contents = [{ role: 'user', parts: [{ text: prompt }] }];

    if (imagePath && fs.existsSync(imagePath)) {
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      const imageBytes = fs.readFileSync(imagePath).toString("base64");
      contents[0].parts.push({
        inlineData: { data: imageBytes, mimeType }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            subcategory: { type: "STRING" },
            severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
            priority: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
            department_code: { type: "STRING" },
            location_extracted: { type: "STRING" },
            explanation: { type: "STRING" },
            language_detected: { type: "STRING", enum: ["en", "ta", "mixed"] }
          },
          required: ["category", "subcategory", "severity", "priority", "department_code", "explanation", "language_detected"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in classifyComplaint AI, falling back:', error);
    return classifyComplaintFallback(description);
  }
};

export const findMatchingSchemes = async (profile, schemes) => {
  if (!ai) {
    return matchSchemesFallback(profile, schemes);
  }

  try {
    const prompt = `
Given the citizen profile and the list of government schemes, identify which schemes the citizen is eligible for.
Return a list of matches with a match_score (0-100) and explanation.

Profile:
${JSON.stringify(profile, null, 2)}

Schemes:
${JSON.stringify(schemes, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              scheme_id: { type: "INTEGER" },
              match_score: { type: "INTEGER" },
              explanation: { type: "STRING" },
              why_eligible: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["scheme_id", "match_score", "explanation", "why_eligible"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in findMatchingSchemes AI, falling back:', error);
    return matchSchemesFallback(profile, schemes);
  }
};

export const analyzeImage = async (imagePath) => {
  if (!ai || !imagePath || !fs.existsSync(imagePath)) {
    return analyzeImageFallback(imagePath);
  }

  try {
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : imagePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    const imageBytes = fs.readFileSync(imagePath).toString("base64");

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: "Analyze this image of a civic issue. Assess severity and describe details." },
          { inlineData: { data: imageBytes, mimeType } }
        ]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
            description: { type: "STRING" },
            details: { type: "STRING" }
          },
          required: ["severity", "description", "details"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error in analyzeImage AI, falling back:', error);
    return analyzeImageFallback(imagePath);
  }
};
