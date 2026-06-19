# UrbanMine AI – Deconstruction GPT for Circular Construction

A hackathon MVP that analyzes building components and generates AI-powered deconstruction plans to maximize reusable materials instead of demolition waste.

## 🌟 Project Overview

UrbanMine AI transforms buildings from demolition targets into material banks. The platform uses AI to analyze building components and generate step-by-step deconstruction plans that maximize material reuse, minimize waste, and create circular construction workflows.

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Framer Motion** for animations
- **shadcn/ui** for UI components

### Backend (Node.js + Express)
- **Express.js** REST API
- **MongoDB** with Mongoose for data storage
- **Groq API** for AI-powered deconstruction plans
- **Reusability scoring engine**

## 📁 Project Structure

```
urbanmine-ai/
├── client/                 # React frontend (root directory)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   └── ...
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── data/            # Sample datasets
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/urbanmine-ai

# AI API Configuration (Optional - will use mock data if not provided)
GROQ_API_KEY=your_groq_api_key_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### 4. Run the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

## 🎯 Core Features

### 1. Building Component Input
- Upload JSON files with building data
- Manual component entry form
- Sample dataset for testing

### 2. AI-Powered Analysis
- **Reusability Scoring Engine** - Analyzes materials, connections, and conditions
- **Categories:** Reusable (75+), Recyclable (45-74), Waste (<45)
- **Environmental impact calculations**

### 3. Interactive Dashboard
- Real-time analysis metrics
- Material distribution charts
- Component scoring tables
- Environmental savings visualization

### 4. Deconstruction Plan Generator
- AI-generated step-by-step instructions
- Tool requirements and time estimates
- Safety considerations
- Material sorting guidelines

### 5. Reuse Marketplace
- AI-matched reuse opportunities
- Value recovery estimates
- CO2 savings calculations
- Project suggestions

## 📊 API Endpoints

### Analysis Routes
- `GET /api/analysis/health` - Health check
- `GET /api/analysis/components` - Get all components
- `POST /api/analysis/analyze` - Analyze building components
- `GET /api/analysis/sample` - Load sample data
- `POST /api/analysis/deconstruction-plan` - Generate AI plan

## 🧪 Sample Data Format

```json
{
  "components": [
    {
      "id": "W001",
      "name": "Window Panel",
      "material": "Glass + Aluminum",
      "connectionType": "Bolted",
      "condition": "Good",
      "quantity": 12,
      "location": "Floor 2",
      "dimensions": "1.2m x 1.5m",
      "estimatedAge": 8
    }
  ]
}
```

## 🔄 Workflow

1. **Upload** building data or use sample dataset
2. **Analyze** components with AI scoring engine
3. **View** dashboard with metrics and charts
4. **Generate** deconstruction plan
5. **Explore** reuse opportunities

## 🌍 Environmental Impact

The platform calculates:
- **Landfill waste avoided**
- **CO2 emissions saved**
- **Material value recovered**
- **Circular economy score**

## 🛠️ Development

### Frontend Development
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd server
npm run dev      # Start with nodemon
npm start        # Start production server
```

### Database Operations
```bash
# Connect to MongoDB shell
mongo urbanmine-ai

# View components
db.components.find()

# Clear database
db.components.deleteMany({})
```

## 🤖 AI Integration

The app integrates with **Groq API** for generating deconstruction plans. If no API key is provided, it falls back to a mock implementation with realistic sample plans.

### Getting a Groq API Key
1. Sign up at [Groq](https://groq.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file

## 📈 Future Enhancements

- [ ] Real-time collaboration
- [ ] Mobile app
- [ ] Advanced 3D visualization
- [ ] Integration with BIM software
- [ ] Marketplace for material trading
- [ ] Blockchain for material tracking

## 🏆 Hackathon Highlights

- **Innovation:** "Buildings as Material Banks" concept
- **AI Integration:** GPT-powered deconstruction planning
- **Environmental Impact:** Quantifiable CO2 savings
- **Circular Economy:** Complete material lifecycle tracking
- **Scalability:** MVP architecture ready for production

## 📄 License

MIT License - feel free to use this project for your circular construction initiatives!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support during the hackathon, reach out to the development team.

---

**Built with ❤️ for a sustainable construction future**
