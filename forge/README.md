# ForgeMentor

**AI-powered software engineering mentor for VS Code.**

ForgeMentor helps developers understand code, reason through problems, and learn software engineering concepts instead of simply generating solutions.

## Features

* 💬 Ask ForgeMentor technical questions directly from VS Code
* 🧠 Get explanations focused on reasoning and understanding
* ✨ React-based interactive chat interface
* 🤖 Gemini-powered mentoring
* 📋 Send selected code directly to ForgeMentor
* 🔌 Configurable backend endpoint
* ☁️ Spring Boot backend deployed with Docker and Kubernetes

## Architecture

```text
VS Code Extension
       │
       ▼
React WebView
       │
       ▼
ForgeMentor Backend
       │
       ▼
Spring AI
       │
       ▼
Google Gemini
```

## Development

### Extension

```bash
npm install
npm run compile
```

### React WebView

```bash
cd webview
npm install
npm run build
```

### Backend

```bash
cd ../backend
./mvnw spring-boot:run
```

## Configuration

ForgeMentor supports configuring the backend URL through the VS Code setting:

```text
forgeMentor.backendUrl
```

The default backend URL is:

```text
http://forgementor.local
```

## Project Status

**Version:** 0.1.0

This release represents the initial MVP of ForgeMentor.

## License

MIT
