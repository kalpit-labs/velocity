# MongoDB Dashboard

A full-featured MongoDB dashboard for browsing, searching, visualizing, and exporting data from any MongoDB database.

## Features

- **Database & Collection Browsing**: View all databases and collections with statistics
- **Document Browsing**: Paginated document viewing with table and JSON views
- **Search & Filter**: Search documents with MongoDB query syntax
- **Data Visualization**: Interactive charts showing field distributions and analytics
- **CSV Export**: Export filtered data to CSV format
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Node.js Driver
- JSON to CSV conversion

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- React Router (navigation)
- Axios (API calls)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB connection URI

### Setup

1. Clone or download this repository

2. Install dependencies for both backend and frontend:
```bash
npm run install:all
```

Or install individually:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Configure environment variables:

Edit `backend/.env` with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5001
NODE_ENV=development
```

## Running the Application

### Option 1: Run both servers separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend API will start on http://localhost:5001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173 (or next available port)

### Option 2: Use workspace scripts

From the root directory:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Usage

1. Open your browser and navigate to the frontend URL (e.g., http://localhost:5173)

2. **Home Page**: You'll see all databases in your MongoDB cluster
   - Click on any database to view its collections

3. **Database View**: Shows all collections in the selected database
   - Click on a collection to view its documents

4. **Collection View**: Browse documents with the following features:
   - **Table View**: See documents in a table format
   - **JSON View**: Toggle to see raw JSON format
   - **Pagination**: Navigate through large collections
   - **Search**: Use MongoDB query syntax to filter documents
     - Example: `{"status": "active"}`
     - Example: `{"age": {"$gt": 18}}`
   - **Export**: Download filtered results as CSV

5. **Analytics View**: Click "Analytics" button to see:
   - Field type analysis
   - Field presence statistics
   - Value distribution charts
   - Data visualization

## API Endpoints

### Databases
- `GET /api/databases` - List all databases
- `GET /api/databases/:dbName/stats` - Get database statistics

### Collections
- `GET /api/databases/:dbName/collections` - List collections
- `GET /api/databases/:dbName/collections/:collName/stats` - Collection stats

### Documents
- `GET /api/databases/:dbName/collections/:collName/documents` - Get documents (paginated)
  - Query params: `page`, `limit`, `sort`, `order`, `filter`
- `GET /api/databases/:dbName/collections/:collName/documents/:id` - Get single document

### Analytics
- `GET /api/databases/:dbName/collections/:collName/aggregate` - Aggregate data
  - Query params: `groupBy`, `metric`, `field`
- `GET /api/databases/:dbName/collections/:collName/field-analysis` - Analyze fields

### Export
- `GET /api/databases/:dbName/collections/:collName/export` - Export to CSV
  - Query params: `filter`, `fields`, `limit`

## Project Structure

```
velocity/
├── backend/
│   ├── src/
│   │   ├── config/database.js          # MongoDB connection
│   │   ├── services/
│   │   │   ├── mongoService.js         # Core MongoDB operations
│   │   │   ├── queryService.js         # Query building
│   │   │   └── exportService.js        # CSV export
│   │   ├── routes/api.js               # API endpoints
│   │   ├── middleware/errorHandler.js  # Error handling
│   │   └── server.js                   # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                 # Layout components
│   │   │   ├── document/               # Document viewing
│   │   │   ├── search/                 # Search components
│   │   │   └── common/                 # Shared components
│   │   ├── pages/                      # Main pages
│   │   ├── services/api.js             # API client
│   │   └── App.jsx                     # Main app
│   └── package.json
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

## Build for Production

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

## Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" error, change the port in `backend/.env` and update `frontend/vite.config.js` proxy target accordingly.

### MongoDB Connection Error
- Verify your MongoDB URI is correct
- Check network connectivity
- Ensure IP whitelist includes your IP (for MongoDB Atlas)
- Verify username/password are correct

### CORS Issues
If you see CORS errors, ensure the backend CORS configuration in `backend/src/server.js` includes your frontend URL.

## Features in Detail

### Search & Filter
Use MongoDB query syntax in the search bar:
- Simple match: `{"status": "active"}`
- Greater than: `{"age": {"$gt": 18}}`
- Multiple conditions: `{"status": "active", "age": {"$gte": 21}}`
- Text search: Use field-specific searches

### CSV Export
- Exports current filtered results
- Flattens nested objects automatically
- Handles arrays by converting to JSON strings
- Downloads directly to your browser

### Data Visualization
- Field type distribution (pie chart)
- Value frequency (bar chart)
- Field presence analysis
- Sample-based analysis for performance

## License

MIT

## Contributing

Feel free to submit issues and pull requests.
