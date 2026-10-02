import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper model constant
const TEXT_MODEL = "gemini-3.6-flash";

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Climate Digital Twin AI Server",
    timestamp: new Date().toISOString()
  });
});

// AI Chatbot Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, location, currentMetrics } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemInstruction = `You are the Climate Twin AI Assistant, an expert meteorologist, disaster management specialist, and agronomy advisor.
You are monitoring a real-time Digital Twin climate model for ${location || "Kaveri River Delta Region"}.
Current Telemetry context:
- Temperature: ${currentMetrics?.temperatureC ?? 34.8}°C
- Humidity: ${currentMetrics?.humidityPercent ?? 82}%
- Rainfall: ${currentMetrics?.rainfallMm ?? 124.5} mm
- Wind Speed: ${currentMetrics?.windSpeedKmh ?? 42.5} km/h
- Air Quality (AQI): ${currentMetrics?.airQualityAQI ?? 118}
- Water Level: ${currentMetrics?.waterLevelMeters ?? 4.85} meters
- Flood Risk: 78% (High), Cyclone Risk: 62% (Medium), Heatwave Risk: 45% (Medium)

Provide a direct, accurate, concise, and helpful answer. Use bullet points for steps or recommendations when helpful.
Keep tone professional, urgent if safety-critical, and highly informative.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I am currently analyzing live climate telemetry. Please rephrase your question or check the emergency alerts tab.";

    return res.json({
      reply: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ["Digital Twin Sensor Array IOT-101..106", "Open-Meteo Real-time Stream", "IMD Local Radar"]
    });
  } catch (error: any) {
    console.error("AI Chatbot Error:", error);
    return res.status(500).json({
      error: "Failed to generate AI response",
      details: error?.message || "Internal server error"
    });
  }
});

// AI Dynamic Recommendations Endpoint
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { climateData, hazardContext } = req.body;

    const prompt = `Based on the following Digital Twin climate telemetry:
Temperature: ${climateData?.temperatureC ?? 34.8}°C
Humidity: ${climateData?.humidityPercent ?? 82}%
Rainfall: ${climateData?.rainfallMm ?? 124.5} mm
Water Level: ${climateData?.waterLevelMeters ?? 4.85} m
AQI: ${climateData?.airQualityAQI ?? 118}
Flood Risk: ${hazardContext?.floodRisk ?? 78}%
Cyclone Risk: ${hazardContext?.cycloneRisk ?? 62}%

Generate specific, actionable recommendations tailored for three key stakeholder personas:
1. Government & Disaster Response
2. Local Farmers & Agricultural Sector
3. Citizens & General Public

Return JSON format matching:
{
  "government": ["step 1", "step 2", "step 3"],
  "farmers": ["step 1", "step 2", "step 3"],
  "citizens": ["step 1", "step 2", "step 3"]
}`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Recommendations Error:", error);
    return res.status(500).json({ error: "Failed to generate AI recommendations" });
  }
});

// AI Comprehensive Executive Report Generator
app.post("/api/ai/report", async (req, res) => {
  try {
    const { region, metrics, hazardPredictions, scenarioInput } = req.body;

    const prompt = `Generate a comprehensive Executive AI Climate & Risk Assessment Report for region: ${region || "Kaveri River Delta Region"}.
Metrics: Temp ${metrics?.temperatureC ?? 34.8}°C, Rain ${metrics?.rainfallMm ?? 124.5}mm, Humidity ${metrics?.humidityPercent ?? 82}%, River Level ${metrics?.waterLevelMeters ?? 4.85}m, AQI ${metrics?.airQualityAQI ?? 118}.
Flood Risk: ${hazardPredictions?.[0]?.riskPercentage ?? 78}%, Cyclone Risk: ${hazardPredictions?.[1]?.riskPercentage ?? 62}%, Heatwave Risk: ${hazardPredictions?.[2]?.riskPercentage ?? 45}%.

Provide a detailed structured text report with sections:
1. Executive Summary & Digital Twin State
2. Machine Learning Multi-Hazard Forecast Analysis (XGBoost, LSTM, Random Forest)
3. Explainable AI (XAI) Driver Attribution
4. Hyperlocal Risk Exposure & Infrastructure Vulnerabilities
5. Strategic Action Directives (Government, Farming, Citizens)
6. Long-term Resilience & Carbon Abatement Recommendations`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5
      }
    });

    return res.json({
      reportTitle: `Digital Twin Climate Assessment - ${region || "Kaveri Delta Sector"}`,
      generatedAt: new Date().toLocaleString(),
      reportText: response.text || "Report generation incomplete.",
      status: "Success"
    });
  } catch (error: any) {
    console.error("AI Report Error:", error);
    return res.status(500).json({ error: "Failed to generate climate report" });
  }
});

// Server Initialization with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌍 Climate Digital Twin AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
