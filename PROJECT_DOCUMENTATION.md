# ClimateTwin AI — Project Documentation

## 1. Project summary

ClimateTwin AI is a browser-based climate and multi-hazard digital-twin dashboard prototype. It presents climate telemetry, sensor status, hazard risk estimates, explainability summaries, map overlays, scenario simulations, early-warning advisories, carbon and health indicators, and historical charts. A small Express server also exposes a Gemini-powered chat, recommendation, and report API.

**Important:** The application is currently a demonstration/prototype, not an operational emergency-management system. Most climate readings, hazard estimates, historical records, sensor records, alerts, map overlays, and scenario results are fixtures or local simulations. The project does not ingest real-time weather, IoT, satellite, or government-alert feeds and does not dispatch emergency notifications.

## 2. Technology stack

| Area | Technology | Role |
|---|---|---|
| Frontend | React 19, TypeScript | Dashboard UI and client-side state |
| Development/build | Vite 6 | Frontend bundling and development middleware |
| Styling | Tailwind CSS 4 | Utility-based responsive styling |
| Backend | Express 4, TypeScript, tsx | JSON API and development web server |
| AI integration | `@google/genai` | Gemini requests made from the server |
| Charts | Recharts | Historical and climate visualizations |
| Maps | Leaflet | Interactive map and sample overlays |
| Icons | lucide-react | UI iconography |
| Production bundling | esbuild | Bundles the Express server |

Dependencies and npm scripts are defined in [package.json](package.json). The browser entry is [src/main.tsx](src/main.tsx), and the Express/Vite server is [server.ts](server.ts).

## 3. Repository structure

```text
.
├── assets/                         # Static project assets
├── index.html                      # Browser document and root element
├── metadata.json                   # App metadata
├── package.json                    # Dependencies and npm scripts
├── package-lock.json               # npm dependency lockfile
├── bun.lock                        # Bun lockfile
├── server.ts                       # Express API and Vite integration
├── tsconfig.json                   # TypeScript compiler settings
├── vite.config.ts                  # Vite, React, Tailwind, and HMR setup
└── src/
    ├── App.tsx                     # Main application state and dashboard routing
    ├── index.css                   # Global styles and Tailwind import
    ├── main.tsx                    # React mount point
    ├── types.ts                    # Shared data contracts
    ├── data/
    │   └── mockClimateData.ts      # Locations, metrics, alerts, charts, scenarios
    └── components/                 # Dashboard views and modal components
```

## 4. Main application areas

The navigation and top-level state are managed by `App.tsx`. The dashboard has seven navigation views:

1. **Digital Twin Overview** — Climate metric cards, simulated rainfall/heatwave/reset anomaly controls, and the IoT sensor grid with sample readings/history and an in-memory add-sensor interaction.
2. **AI Multi-Hazard Risk** — Risk cards, rainfall/temperature charts based on fixture data, and explainability risk-driver summaries. Some hazard contributions are preset in the UI.
3. **Hyperlocal GIS Map** — Leaflet map, region/sensor markers, and sample hazard/AQI overlay toggles.
4. **What-If Simulation** — Local sliders and presets calculate illustrative risk and economic estimates; no backend model is called.
5. **Early Warning Advisories** — Fixture alerts and persona-based recommendations, with an AI recommendation refresh option.
6. **Carbon and Health Index** — Carbon emissions breakdown and climate-health indicators.
7. **Historical Analytics and News** — Historical fixture charts and a static news/advisory list.

The navbar also opens two modals:

- **Climate chatbot** — Sends a question, selected location, and metrics to the server's chat endpoint.
- **AI report generator** — Requests a report from the server and supports browser print/Save as PDF.

Core UI files are in [src/components](src/components), and shared interfaces such as `ClimateMetrics`, `HazardPrediction`, `IoTSensorNode`, and `PersonaRecommendations` are in [src/types.ts](src/types.ts).

## 5. Frontend behavior and state flow

1. [src/main.tsx](src/main.tsx) mounts the React app inside `StrictMode`.
2. [src/App.tsx](src/App.tsx) initializes dashboard state from the fixture exports in [src/data/mockClimateData.ts](src/data/mockClimateData.ts).
3. Changing the selected location calls `getClimateDataForLocation()` to choose a canned location-category scenario and refresh the related client state. The function does not request external climate data.
4. The app passes state and callbacks to the active view component.
5. Manual sync and the 30-minute timer perturb selected metric values with random changes. Anomaly buttons update metrics/risk values locally. Added sensors and alert-broadcast status also remain in browser memory and reset on reload.
6. Chat, report, and recommendation refresh actions make HTTP requests to the Express API. The Gemini key remains on the server and is not sent to the browser.

The location presets are scenario categories rather than measured forecasts for each location. Historical charts, news, sensor history, and many alert/recommendation values are shared static/demo data.

## 6. Backend API

The backend is implemented in [server.ts](server.ts). It listens on port `3000` and serves Vite middleware when not in production. In production, it serves the built `dist` directory and falls back to `index.html` for frontend routes.

| Method and route | Request purpose | Response behavior |
|---|---|---|
| `GET /api/health` | Basic service health check | Returns status, service label, and timestamp |
| `POST /api/ai/chat` | Generates a climate-assistant response | Requires `message`; may also receive `location` and `currentMetrics`; returns reply, time, and a sources label array |
| `POST /api/ai/recommendations` | Generates stakeholder actions | Accepts `climateData` and `hazardContext`; asks Gemini for JSON arrays for government, farmers, and citizens |
| `POST /api/ai/report` | Generates an executive climate-risk report | Accepts region, metrics, and hazard predictions; returns report text and metadata |

The Gemini client uses `@google/genai` and the model identifier `gemini-3.6-flash`. AI routes require a valid `GEMINI_API_KEY`; without one, those requests can fail even though the dashboard itself can render.

### External resources

- Gemini API is called by the server for the AI endpoints.
- Leaflet map tiles are requested from CartoDB; the project uses OpenStreetMap/CARTO attribution in the map UI.
- Leaflet CSS is loaded from unpkg in [index.html](index.html).
- The app does not contain actual Open-Meteo or IMD data-fetching code. Those names appear in the chat endpoint's returned source labels and should not be interpreted as active integrations.

## 7. Local setup

### Requirements

- Node.js and npm. The repository does not specify a precise supported Node version.
- A Gemini API key only if you want to use the Gemini-backed features.

### Install and run

1. Open a terminal at the repository root.
2. Install the locked dependencies with `npm ci` (or use `npm install` if you need npm to update the lockfile).
3. For AI features, create a root-level `.env` file and set `GEMINI_API_KEY` to your own key. `dotenv.config()` loads `.env` by default. Although [README.md](README.md) mentions `.env.local`, the current server does not explicitly load that filename.
4. Start the application with `npm run dev`.
5. Open `http://localhost:3000` in a browser.

The checked-in [.env.example](.env.example) is a template; replace its placeholder value locally. Do not commit real credentials. The repository ignores `.env*` files while allowing `.env.example` in [.gitignore](.gitignore).

### Available npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Runs the Express server with `tsx` and Vite development middleware |
| `npm run build` | Builds the frontend and bundles the server to `dist/server.cjs` |
| `npm start` | Runs the production server; build first |
| `npm run preview` | Starts Vite's frontend-only preview server; it does not provide the Express API |
| `npm run lint` | Runs `tsc --noEmit` for TypeScript checking; no dedicated lint tool is configured |
| `npm run clean` | Removes generated build output using `rm -rf`; this command may not work in a default Windows shell |

There is no test script configured in `package.json`.

## 8. Windows startup troubleshooting

This workspace folder name contains an ampersand (`&`): `climate-twin-ai---digital-twin-&-disaster-engine`. Windows `cmd.exe` treats `&` as a command separator. If `npm run dev` reports that a `node_modules\.bin` path is “not recognized” or Node tries to load a truncated path such as `Downloads\tsx\dist\cli.mjs`, the shell may be splitting the project path at that ampersand.

The simplest workaround is to move or rename the project folder to a path without `&` (for example, `climate-twin-ai-digital-twin-disaster-engine`), open the renamed folder in VS Code, then reinstall dependencies there with `npm ci` and retry `npm run dev`. Also check that `node_modules` exists; if it does not, install dependencies from the project root first.

## 9. Production build and deployment notes

- Run `npm run build`, then `npm start` with `NODE_ENV=production` and the Gemini environment variable configured.
- The production server expects the built frontend in `dist` and listens on fixed port `3000` on `0.0.0.0`; `PORT` is not currently read from the environment.
- `npm run preview` is not a production API test because it starts only Vite's static preview server.
- The server's default behavior relies on the current working directory when locating `dist`.
- For hosting, supply a compatible Node environment, network access to Gemini and the map tile/CSS providers, and secure secret injection. Do not expose the Gemini key in frontend code.

## 10. Prototype scope, limitations, and safety

- Risk values and named methods (including XGBoost, LSTM, Random Forest, and SHAP) are presentation data or preset logic; no trained model files or model inference pipeline are included.
- The map uses fixed sample overlays and coordinates. It is not a geospatial hazard service.
- What-if results use local illustrative calculations, not a validated physical or economic model.
- The alert broadcast interaction only marks an alert as sent in client state; it does not send SMS, email, or push notifications.
- There is no database, user authentication, durable storage, sensor ingestion service, or audit trail.
- AI-generated outputs can be incomplete or incorrect. Neither these outputs nor the mock dashboard values should be used for emergency response, evacuation decisions, medical care, or other safety-critical decisions. Consult official local authorities and verified data sources.

## 11. Suggested development workflow

- Add or update domain shapes in [src/types.ts](src/types.ts), then update the fixture data and consuming components consistently.
- Keep API keys and other secrets on the server; do not prefix secrets with frontend-exposed environment conventions.
- Validate UI behavior in the browser after component changes and run `npm run lint` for the configured TypeScript check.
- If adding live data, document its source, timestamp/refresh behavior, error handling, and validation; replace the demo labels with accurate provenance.
- Add automated tests before relying on calculations or alert workflows beyond demonstration use.
