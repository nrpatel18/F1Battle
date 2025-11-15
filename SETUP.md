# Setup Instructions

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the run script:
```bash
chmod +x run.sh
./run.sh
```

The API will be available at `http://localhost:8000`

**Note:** The first time you load a session, FastF1 will download data (30-60 seconds). Subsequent loads will be faster due to caching.

### Frontend Setup

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

## Testing the Application

1. Open `http://localhost:3000` in your browser
2. Select a year (2023 or 2024)
3. Choose a Grand Prix
4. Select session type (Practice 3, Qualifying, or Race)
5. Select 2 drivers
6. Watch the 3D race visualization!

## Troubleshooting

### Backend Issues

- **Import errors**: Make sure you're in the virtual environment and all dependencies are installed
- **FastF1 cache errors**: Delete the `f1_cache` directory and try again
- **Port already in use**: Change the port in the uvicorn command or kill the process using port 8000

### Frontend Issues

- **API connection errors**: Make sure the backend is running and `NEXT_PUBLIC_API_URL` is correct
- **3D visualization not loading**: Check browser console for errors. Some browsers may have issues with WebGL
- **Build errors**: Make sure all dependencies are installed with `npm install`

### Data Issues

- **No drivers found**: Some sessions may not have complete data. Try a different session or year
- **Position data missing**: Not all sessions have position data. Race and Qualifying sessions are most reliable
- **Slow loading**: First load takes time as FastF1 downloads data. Subsequent loads are cached

## Production Deployment

See the main README.md for deployment instructions to Railway/Render (backend) and Vercel (frontend).

