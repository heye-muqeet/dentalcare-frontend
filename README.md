# Dental Practice Management System (Frontend)

React + TypeScript + Vite SPA for the Dental Care platform. Implements role-based routing, Redux Toolkit state, Axios API layer with credentials, and optional AI-powered analysis.

## Quick Start
```bash
npm install
npm run dev
# http://localhost:5173
```

## Environment
Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:1337
# Optional:
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Scripts
- dev: Run dev server
- build: Type-check + build
- preview: Preview production build
- lint: ESLint

## Documentation
- Detailed frontend docs: `./DOCUMENTATION.md`
- Full project docs: `../DOCUMENTATION.md`

---

# Dental Practice Management System

A comprehensive dental practice management system built with React, TypeScript, and Vite. Features include appointment scheduling, patient management, treatment tracking, and AI-powered dental X-ray analysis.

## 🚀 Features

- **Patient Management**: Complete patient records with medical history
- **Appointment Scheduling**: Advanced booking system with time slot management
- **Treatment Tracking**: Detailed treatment records with medication management
- **Services Management**: Configurable dental services and pricing
- **Role-Based Access Control**: Owner, Receptionist, and Doctor roles
- **AI-Powered X-ray Analysis**: Automated dental radiograph analysis using Google Gemini AI
- **Report Management**: Upload and analyze medical reports with AI assistance

## 🤖 AI-Powered Dental X-ray Analysis

This system includes advanced AI capabilities for analyzing dental X-rays using **Google Gemini AI**:

### Features:
- **Automatic X-ray Validation**: Detects if uploaded images are actually dental X-rays
- **Comprehensive Analysis**: Provides detailed findings about dental structures, bone density, and abnormalities
- **Condition Detection**: Identifies common dental conditions like caries, bone loss, impactions
- **Clinical Recommendations**: Suggests follow-up actions and clinical correlations
- **Confidence Scoring**: Provides confidence levels for analysis results
- **Professional Medical Analysis**: Uses Google's advanced AI for high-quality medical image analysis

### 🆓 Google Gemini API (FREE)

- **Free Tier**: 60 requests per minute, 1500 requests per day
- **Get API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **High-quality image analysis** with generous free limits
- **Specifically optimized** for medical and dental imaging

### Setup:
1. Get your free Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the project root:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Restart your development server
4. The system will automatically validate images and provide AI analysis

### Usage:
1. Navigate to Appointment Details
2. Click "Attach New Report"
3. Upload a dental X-ray image
4. Click "Analyze X-ray" for AI-powered analysis
5. Review findings, detected conditions, and recommendations
6. Use AI findings to populate the report or add manual notes

### 🔒 Image Validation:
The system automatically validates that uploaded images are actually dental X-rays and will reject:
- Regular photos
- Pictures of animals or people
- Non-medical images
- Other types of medical scans

Only genuine dental radiographs will be analyzed!

## 🛠️ Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
