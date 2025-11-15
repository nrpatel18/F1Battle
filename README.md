# 🏎️ F1 Telemetry Battle

A minimalistic, visually stunning F1 telemetry comparison tool. Compare two drivers' laps with real-time 3D visualization and telemetry stats.

## Features

- 🎯 Session selection (Practice 3, Qualifying, Race)
- 👥 Driver selection with team colors
- 🏁 3D race visualization with animated cars
- 📊 Real-time telemetry panels (Speed, Throttle, Brake, Gear, Gap)
- 🎮 Play/Pause/Speed controls
- 🎨 Official F1 dark theme styling

## Tech Stack

### Backend
- FastAPI
- FastF1 (F1 telemetry data)
- Pandas
- Python 3.9+

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Three.js / React Three Fiber
- Tailwind CSS
- Framer Motion

## Setup

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (optional, defaults are set):
```env
F1_CACHE_DIR=./f1_cache
CORS_ORIGINS=http://localhost:3000
```

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. Select a year (2023-2024)
2. Choose a Grand Prix
3. Select session type (Practice 3, Qualifying, or Race)
4. Select 2 drivers to compare
5. Watch the 3D race visualization with real-time telemetry!

## API Endpoints

- `GET /api/sessions?year={year}` - Get all GPs for a year
- `GET /api/drivers?year={year}&round={round}&session={session}` - Get drivers for a session
- `GET /api/race-data?year={year}&round={round}&session={session}&driver1={num}&driver2={num}` - Get race visualization data

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)
- **Frontend**: Deploy to [Vercel](https://vercel.com)

Both platforms support GitHub integration for automatic deployments.

## Notes

- First session load takes 30-60 seconds (FastF1 downloads data)
- Position data is required for 3D visualization
- Some sessions may not have complete telemetry data
- Cache directory stores downloaded F1 data for faster subsequent loads

## License

MIT

