# FitTracker - Expo Fitness App

A minimalist workout tracking app built with Expo and React Native.

## Features

- 2-day workout split tracking
- Exercise progress monitoring
- Workout history and analytics
- Body weight tracking
- Data export functionality

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd fittracker
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Deployment

This app is configured for automatic deployment to Netlify via GitHub integration.

### Manual Deployment

To build for production:

```bash
npm run build:web
```

The built files will be in the `dist` directory.

### Netlify Deployment Setup

1. **Push to GitHub:**
   - Create a new repository on GitHub
   - Push your code to the repository

2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings are automatically configured via `netlify.toml`

3. **Automatic Deployments:**
   - Every push to main/master branch will trigger a new deployment
   - Pull requests will create preview deployments

## Project Structure

```
├── app/                    # App routes (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── workout.tsx    # Workout screen
│   │   ├── progress.tsx   # Progress tracking
│   │   └── settings.tsx   # Settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── data/                  # Static data and configurations
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── hooks/                 # Custom React hooks
```

## Technologies Used

- **Expo SDK 52** - React Native framework
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **AsyncStorage** - Local data persistence
- **Lucide React Native** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License