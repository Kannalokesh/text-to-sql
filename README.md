# Text-to-SQL

Convert plain English questions into SQL, run the query, and return results from the Olist analytics database.

## What it does

- Uses OpenAI to generate SQL from user questions
- Uses ChromaDB + semantic schema retrieval to pick the right tables
- Executes safe SELECT queries against `data/olist.db`
- Returns SQL and result rows for the frontend

## Core features

- Natural language → SQL
- Retrieval-augmented schema selection
- Few-shot examples for consistent SQL
- Safety guard for write operations

## Quick start

```bash
git clone https://github.com/Kannalokesh/text-to-sql.git
cd text-to-sql

pip install -r requirements.txt
cp .env.example .env
# edit .env and set OPENAI_API_KEY

python -m data.seed
python -m agent.build_index

uvicorn api.main:app --reload --port 8000

cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Notes

- `OPENAI_API_KEY` is required
- `DATABASE_URL` defaults to `sqlite:///./data/olist.db`
- Seed the database before running the app

## Important files

- `agent/sql_chain.py` — question → SQL → execute
- `agent/retriever.py` — schema retrieval with ChromaDB
- `agent/semantic_layer.py` — business-aware table/column descriptions
- `data/seed.py` — load raw CSVs into SQLite
- `frontend/` — React UI
