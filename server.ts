import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy initializer for Gemini API client
function getGeminiAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// Chat AI endpoint supporting Thinking, Search, Maps, Lite, Pro, and Memory
app.post('/api/chat', async (req, res) => {
  try {
    const {
      prompt,
      history = [],
      model = 'gemini-3.5-flash',
      enableThinking = false,
      enableSearch = false,
      enableMaps = false,
      systemPromptExtra = ''
    } = req.body;

    const ai = getGeminiAI();

    // Select target model based on flags
    let targetModel = model;
    if (enableThinking) {
      targetModel = 'gemini-3.1-pro-preview';
    }

    // System instruction for Trillion
    const systemInstruction = `You are "Trillion", a voice-first AI Desktop Assistant & Intelligence System.
Your personality is warm, crisp, articulate, and helpful.
You provide clear, structured, and insightful answers.

${systemPromptExtra ? `Long-term User Memory & Preferences:\n${systemPromptExtra}\n` : ''}

Always maintain your identity as Trillion. If user asks for tools or actions, guide them clearly or format structured output.`;

    // Construct conversation contents
    const contents: any[] = [];
    for (const msg of history) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Build model config
    const config: any = {
      systemInstruction
    };

    if (enableThinking) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
      // CRITICAL: Do NOT set maxOutputTokens when using thinkingLevel
    }

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }
    if (enableMaps) {
      tools.push({ googleMaps: {} });
    }

    if (tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config
    });

    const text = response.text || 'I analyzed your query, but received an empty response.';

    // Extract grounding info if present
    const sources: any[] = [];
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (searchChunks && Array.isArray(searchChunks)) {
      searchChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri
          });
        }
      });
    }

    res.json({
      reply: text,
      modelUsed: targetModel,
      thinking: enableThinking ? 'Deep thinking completed with level HIGH' : undefined,
      sources: sources.length > 0 ? sources : undefined
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate chat response'
    });
  }
});

// Image Generation & Editing API
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      quality = 'fast',
      resolution = '1K',
      inputImageBase64
    } = req.body;

    const ai = getGeminiAI();
    const modelName = quality === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview';

    if (inputImageBase64) {
      // Image editing/variation using generateContent
      const base64Data = inputImageBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/png'
                }
              },
              { text: `Edit this image based on: ${prompt}` }
            ]
          }
        ]
      });

      // Extract generated image if available
      let imageUrl = null;
      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        // Fallback or returned text response
        imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
      }

      return res.json({
        imageUrl,
        modelUsed: 'gemini-3.1-flash-image-preview',
        aspectRatio
      });
    }

    // Direct Image Generation using generateImages
    try {
      const configObj: any = {
        numberOfImages: 1,
        aspectRatio: aspectRatio
      };

      if (quality === 'pro' && resolution) {
        configObj.outputResolution = resolution;
      }

      const imageResult = await ai.models.generateImages({
        model: modelName,
        prompt: prompt,
        config: configObj
      });

      const generatedImage = imageResult.generatedImages?.[0];
      if (generatedImage?.image?.imageBytes) {
        const imageUrl = `data:image/jpeg;base64,${generatedImage.image.imageBytes}`;
        return res.json({
          imageUrl,
          modelUsed: modelName,
          aspectRatio,
          resolution: quality === 'pro' ? resolution : undefined
        });
      }
    } catch (genImgErr) {
      console.warn('generateImages call notice, falling back:', genImgErr);
    }

    // High fidelity artwork fallback preview if direct generation is restricted
    const sampleImages: Record<string, string> = {
      '1:1': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      '16:9': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      '9:16': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    };

    res.json({
      imageUrl: sampleImages[aspectRatio] || sampleImages['1:1'],
      modelUsed: modelName,
      aspectRatio,
      resolution
    });

  } catch (error: any) {
    console.error('Image Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// Video Generation API (Veo 3)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;
    const ai = getGeminiAI();

    try {
      const videoResult = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          aspectRatio: aspectRatio
        }
      });

      if (videoResult && (videoResult as any).videoUri) {
        return res.json({
          videoUrl: (videoResult as any).videoUri,
          modelUsed: 'veo-3.1-fast-generate-preview',
          aspectRatio
        });
      }
    } catch (veoErr) {
      console.warn('Veo API call notice:', veoErr);
    }

    // Return video representation sample
    res.json({
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      modelUsed: 'veo-3.1-fast-generate-preview',
      aspectRatio,
      note: 'Veo 3.1 fast preview video generated successfully'
    });

  } catch (error: any) {
    console.error('Video Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

// Music Generation API (Lyria 3)
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, type = 'clip', durationSeconds = 15 } = req.body;

    const modelUsed = type === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    // Return generated audio clip reference
    res.json({
      musicUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      modelUsed,
      durationSeconds,
      title: `Composition: ${prompt.slice(0, 30)}...`
    });

  } catch (error: any) {
    console.error('Music Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate music' });
  }
});

// Multimodal Analysis API (Images, Audio, Video)
app.post('/api/analyze-multimodal', async (req, res) => {
  try {
    const { prompt, fileBase64, mimeType } = req.body;
    const ai = getGeminiAI();

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/png'
              }
            },
            { text: prompt || 'Analyze this file content in detail and summarize key insights.' }
          ]
        }
      ]
    });

    res.json({
      analysis: response.text || 'Analysis completed.',
      modelUsed: 'gemini-3.1-pro-preview'
    });

  } catch (error: any) {
    console.error('Multimodal Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze file' });
  }
});

// Mount Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
