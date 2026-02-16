# InstaGen 🎨

AI-powered Instagram content generation platform with multi-stage orchestration and visual governance.

## 🚀 Features

- **Multi-Stage AI Pipeline**: 5-layer architecture for consistent, professional output
- **Storyboard Preview**: See all slides before final generation
- **Visual Consistency Guardrails**: Automated QA prevents style drift
- **Niche-Agnostic**: Works for tech, marketing, film, education, finance, and more
- **No Prompt Engineering Required**: Natural language input only

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **AI Layer**: Google Gemini LLM
- **Styling**: Vanilla CSS with modern design tokens
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## 🏃 Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Gemini API key.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
instaGen/
├── src/
│   ├── components/        # React components
│   │   ├── common/       # Reusable UI components
│   │   ├── input/        # Input layer components
│   │   ├── preview/      # Storyboard preview
│   │   └── export/       # Export functionality
│   ├── services/         # AI services
│   │   ├── ai/          # Gemini integration
│   │   ├── intent/      # Intent understanding
│   │   ├── content/     # Content structuring
│   │   ├── visual/      # Visual planning
│   │   └── generation/  # Image generation
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   ├── config/          # Configuration files
│   └── assets/          # Static assets
├── public/              # Public assets
└── docs/               # Documentation
```

## 🎯 Architecture

InstaGen uses a 5-layer AI architecture:

1. **Intent Understanding Engine** - Converts user input to creative intent
2. **Content Structuring Engine** - Optimizes text for Instagram
3. **Visual Planning Engine** - Generates storyboard preview
4. **Prompt Engineering Engine** - Creates perfect prompts for AI
5. **Image Generation + QA** - Produces final images with quality checks

See [PROJECT_VISION.md](./PROJECT_VISION.md) for detailed architecture documentation.

## 📝 Usage

1. **Select post type**: Single post or Carousel
2. **Choose your niche**: Tech, marketing, film, etc.
3. **Describe your idea**: Use natural language
4. **Review storyboard**: See preview of all slides
5. **Generate finals**: Create Instagram-ready images
6. **Export**: Download 1080×1080 images

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `VITE_MAX_SLIDES` | Maximum slides per carousel | No (default: 10) |
| `VITE_IMAGE_RESOLUTION` | Final image resolution | No (default: 1080) |
| `VITE_STORYBOARD_RESOLUTION` | Storyboard preview resolution | No (default: 512) |

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the project owner.

## 📄 License

Private - All rights reserved

---

**Built with ❤️ using Google Gemini AI**
