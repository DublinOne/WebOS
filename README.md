# WebOS

A modern, feature-rich web-based operating system built with React and TypeScript.

## Features

- **Desktop Environment**: Full-featured desktop with draggable windows, taskbar, and start menu
- **File Explorer**: Browse and manage files with folder navigation
- **Web Browser**: Built-in browser with navigation controls
- **Code Studio**: Live HTML/CSS/JS editor with real-time preview
- **AI Assistant**: Integrated AI chat powered by Gemini
- **Media Player**: Play audio and video files
- **PixelPaint**: Simple drawing application
- **Notepad**: Text editor with save/load functionality
- **Calculator**: Basic calculator app
- **DevVault**: Secure password manager
- **Task Manager**: View and manage running applications
- **Terminal**: Command-line interface
- **Settings**: Theme customization (dark/light/auto)

## Tech Stack

- React 18+
- TypeScript
- Lucide React (icons)
- TailwindCSS (styling)
- Gemini AI API

## Getting Started

This is a Next.js component that can be integrated into your Next.js application.

1. Install dependencies:
```bash
npm install react lucide-react
```

2. Add the component to your Next.js app (e.g., `app/page.tsx`)

3. Configure your Gemini API key in the `callAI` function

4. Run your Next.js development server:
```bash
npm run dev
```

## Usage

- Click desktop icons to open applications
- Drag windows by their title bar
- Resize windows from the bottom-right corner
- Minimize/maximize/close windows using title bar buttons
- Right-click desktop for context menu
- Use Alt+Tab to cycle through windows
- Access all apps from the start menu (bottom-left)

## License

MIT
