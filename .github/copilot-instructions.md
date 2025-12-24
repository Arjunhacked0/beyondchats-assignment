# Copilot instructions for BeyondChats

Purpose: give AI coding agents the minimal, actionable knowledge to be productive in this repo.

Big picture
- Three main components:
  - Frontend: `frontend-react` (React + Vite). UI reads the REST API and subscribes to SSE progress.
  - Backend: `backend-laravel` (Node/Express-based server scripts in this repo). Key files: `real-server.js`, `setup-db.js`, and `routes/api.php` (controller-like handlers).
  - LLM pipeline: `node-llm-pipeline` — standalone Node scripts that fetch an article from the backend, search the web, scrape context, call Gemini (`llm.js`), then PUT results back to the backend (`publishArticle.js`). See `index.js` for orchestration.

Core integration points
- API endpoints: `GET /api/articles/latest`, `GET /api/scrape-trigger`, full resource at `/api/articles` (check `backend-laravel/real-server.js` and `backend-laravel/routes/api.php`).
- Pipeline triggers:
  - Run pipeline manually: `node node-llm-pipeline/index.js [articleId]` (defaults to latest if no id).
  - Backend can spawn the pipeline: `POST /api/enhance/:id` (spawns `node index.js <id>` and streams logs).
- SSE: progress is sent from `real-server.js` at `/api/enhance/progress/:id`.

Data model & conventions (important to keep consistent)
- Article fields (DB and model): `title`, `slug`, `original_content`, `updated_content`, `source_url`, `status`, `references` / `references_json`.
- `status` values: use `original` (raw scraped) and `updated` (LLM produced). Code relies on these exact strings (see `real-server.js` query for `status = "original"`).
- `references` are stored as JSON (`references_json`) and cast to array in the Laravel model (`backend-laravel/app/Models/Article.php`). Publish step writes `references` as an array (see `node-llm-pipeline/publishArticle.js`).
- Slug generation: scraper adds a random suffix to ensure uniqueness (see `ScraperService.php`).

Developer workflows (commands agents should recommend or run)
- Setup DB and start backend (local dev):
```bash
cd backend-laravel
npm install
node setup-db.js   # creates `articles` table in MySQL (DB: LMS)
node real-server.js
```
- Start frontend UI:
```bash
cd frontend-react
npm install
npm run dev
```
- Run the LLM pipeline locally (requires Gemini key):
```bash
cd node-llm-pipeline
# set GEMINI_API_KEY in .env or environment
node index.js        # or `node index.js <articleId>`
```

Environment notes
- `node-llm-pipeline` expects `GEMINI_API_KEY` (env) and optionally `LARAVEL_API_URL` to point to the backend. If missing, code uses simulation/fallbacks.
- `backend-laravel` uses `DB_PASSWORD` env for MySQL; defaults are present in scripts but should be overridden for real deployments.

Project-specific patterns agents must follow
- Many pieces include explicit simulation fallbacks (search, scraper, and LLM). Code intentionally continues with simulated content if scraping or API calls fail — do not remove these fallbacks without adding alternative graceful handling (`googleSearch.js`, `scraper.js`, `llm.js`).
- Prompting lives in `node-llm-pipeline/llm.js` — changes to voice/structure should be made there. Keep the prompt's instructions about plagiarism and reference section.
- When updating publish logic, ensure backend `real-server.js` update query writes `references_json` and that `publishArticle.js` sends an array of `{ title, url }` objects.

Where to look for examples
- Scraping and storage pipeline: `backend-laravel/app/Services/ScraperService.php` and `backend-laravel/app/Http/Controllers/ArticleController.php`.
- Pipeline orchestration: `node-llm-pipeline/index.js` (flow: fetch → search → scrape → rewrite → publish).
- LLM call & prompt: `node-llm-pipeline/llm.js`.
- Search + scraping helpers: `node-llm-pipeline/googleSearch.js`, `node-llm-pipeline/scraper.js`.
- Publishing & API usage: `node-llm-pipeline/publishArticle.js` and `backend-laravel/real-server.js`.
- Frontend examples: `frontend-react/src/components/ArticleCard.jsx` and `ArticleModal.jsx` (UI patterns for displaying progress and article states).

Quick validation steps (manual)
1. Start MySQL locally and run `node backend-laravel/setup-db.js`.
2. Start backend with `node backend-laravel/real-server.js` and confirm `GET /` responds.
3. Seed data: `GET /api/scrape-trigger` (adds sample articles).
4. Run pipeline: `node node-llm-pipeline/index.js` (observe logs). Alternatively `POST /api/enhance/:id` to trigger from backend and subscribe to `/api/enhance/progress/:id` for SSE messages.

If anything above is unclear or you want more detail (example requests, sample `.env`, or a checklist for testing a change), tell me which area to expand.
