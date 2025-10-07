# LinguaLive 🌍

**Privacy-first real-time translation, subtitles, and AI-powered meeting summaries with built-in Chrome AI**

LinguaLive is a comprehensive real-time translation and meeting notes application that combines the power of Chrome's built-in AI with a robust web platform for seamless multilingual communication and collaboration.

## 🚀 Features

### Core Features
- **Real-time Translation**: Instant translation using Chrome's built-in AI with cloud fallbacks
- **Live Subtitles**: Real-time speech recognition and subtitle display
- **Meeting Summaries**: AI-powered meeting summaries and key points extraction
- **Multi-language Support**: Support for 100+ languages
- **Privacy-first**: Processes data locally when possible using Chrome AI
- **Cross-platform**: Chrome extension + Web application + Mobile-responsive

### AI-Powered Features
- **Smart Translation**: Context-aware translation using Chrome's AI translator
- **Intelligent Summarization**: Meeting summaries with key topics and action items
- **Text Enhancement**: Grammar checking and text improvement
- **Language Detection**: Automatic language detection
- **Custom Prompts**: AI-powered custom prompts for specific use cases

### Collaboration Features
- **Real-time Rooms**: Join or create meeting rooms for live collaboration
- **Live Subtitles Overlay**: See translations overlaid on any webpage
- **Message History**: Persistent message and translation history
- **User Profiles**: Customizable user preferences and language settings
- **Multi-device Sync**: Seamless experience across devices

## 🏗️ Architecture

### Components
1. **Chrome Extension** - Browser integration with content scripts and popup interface
2. **React Web App** - Standalone web application for meeting rooms
3. **Node.js Backend** - Real-time server with Socket.IO and MongoDB
4. **AI Services** - Chrome AI integration with cloud fallbacks

### Technology Stack
- **Frontend**: React 18, Material-UI, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, MongoDB, Mongoose
- **Extension**: Chrome Extension API, Manifest V3
- **AI Integration**: Chrome AI APIs (translator, summarizer, rewriter)
- **Real-time**: WebSocket with Socket.IO
- **Database**: MongoDB with advanced indexing

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Chrome browser (for extension)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lingualive.git
cd lingualive
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install web app dependencies**
```bash
cd ../webapp
npm install
```

4. **Set up environment variables**
```bash
cd ../server
cp .env.example .env
# Edit .env with your configuration
```

5. **Start MongoDB**
```bash
# Using system MongoDB
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. **Start the backend server**
```bash
cd server
npm start
```

7. **Start the web application**
```bash
cd ../webapp
npm start
```

8. **Load the Chrome extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

### Development Setup

For development with hot reloading:

```bash
# Terminal 1 - Backend with nodemon
cd server
npm run dev

# Terminal 2 - Frontend with hot reload
cd webapp
npm run dev

# Terminal 3 - Extension development (optional)
cd extension
# Manual reload in chrome://extensions/ after changes
```

## 🎯 Usage

### Chrome Extension Usage

1. **Install and Pin**: Install the extension and pin it to your toolbar
2. **Set Language**: Click the extension icon and set your preferred language
3. **Start Translation**: Navigate to any webpage and click "Start Translation"
4. **View Subtitles**: Real-time subtitles will appear as an overlay
5. **Join Rooms**: Join meeting rooms for collaborative translation

### Web Application Usage

1. **Access the App**: Navigate to `http://localhost:3000`
2. **Create Account**: Set up your profile with preferred languages
3. **Create/Join Room**: Create a new room or join an existing one
4. **Start Meeting**: Begin real-time translation and collaboration
5. **View History**: Access your meeting history and summaries

### API Usage

The backend provides RESTful APIs for integration:

```bash
# Get all public rooms
GET /api/rooms/public

# Create a new room
POST /api/rooms

# Join a room
POST /api/rooms/:roomId/join

# Send a message
POST /api/messages

# Get user statistics
GET /api/users/:email/statistics
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Basic Configuration
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lingualive

# CORS (update with your extension ID)
CORS_ORIGINS=chrome-extension://your-extension-id,http://localhost:3000

# Security Keys (generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key
ADMIN_KEY=your-admin-key

# Optional: AI Service Fallbacks
OPENAI_API_KEY=your-openai-key
GOOGLE_TRANSLATE_API_KEY=your-google-key
```

### Chrome Extension Configuration

Update the `extension/manifest.json` with your domain:

```json
{
  "host_permissions": [
    "http://localhost:3001/*",
    "https://your-domain.com/*"
  ]
}
```

### Database Configuration

MongoDB collections will be automatically created with proper indexing:
- `users` - User profiles and settings
- `rooms` - Meeting rooms and metadata
- `messages` - Chat messages, subtitles, and translations

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd webapp
npm test

# Extension tests (manual testing recommended)
```

### Integration Testing
```bash
# Start test environment
npm run test:integration

# Test API endpoints
npm run test:api

# Test Socket.IO connections
npm run test:socket
```

### Manual Testing Checklist
- [ ] Extension loads and shows popup
- [ ] Translation overlay appears on websites
- [ ] Web app connects to backend
- [ ] Real-time room synchronization works
- [ ] AI services respond correctly
- [ ] Message history persists

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t lingualive-server ./server
docker build -t lingualive-webapp ./webapp
```

### Cloud Deployment

#### Backend (Heroku/Railway/DigitalOcean)
```bash
# Deploy to Heroku
heroku create your-app-name
git subtree push --prefix server heroku main

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
```

#### Frontend (Netlify/Vercel)
```bash
# Deploy to Netlify
cd webapp
npm run build
netlify deploy --dir=build --prod
```

#### Extension (Chrome Web Store)
1. Zip the `extension` folder
2. Upload to Chrome Web Store Developer Dashboard
3. Fill out store listing and submit for review

### Production Configuration

Update production environment variables:
- Set `NODE_ENV=production`
- Use strong secrets for `JWT_SECRET` and `ADMIN_KEY`
- Configure proper CORS origins
- Set up MongoDB Atlas or managed database
- Enable HTTPS with SSL certificates
- Configure rate limiting for production load

## 📚 API Documentation

### REST Endpoints

#### Rooms
- `GET /api/rooms/public` - List public rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `GET /api/rooms/:roomId/stats` - Room statistics

#### Messages
- `GET /api/messages/room/:roomId` - Get room messages
- `POST /api/messages` - Send message
- `POST /api/messages/:messageId/reactions` - Add reaction
- `GET /api/messages/search/:userId` - Search messages

#### Users
- `POST /api/users` - Create/update user
- `GET /api/users/:email` - Get user profile
- `PATCH /api/users/:email/settings` - Update settings
- `GET /api/users/:email/rooms` - Get user rooms

#### AI Services
- `POST /api/ai/translate` - Translate text
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/proofread` - Proofread text
- `POST /api/ai/detect-language` - Detect language

### WebSocket Events

#### Client to Server
- `join-room` - Join a meeting room
- `leave-room` - Leave a meeting room
- `message` - Send chat message
- `subtitle` - Send subtitle data
- `translation` - Send translation
- `typing` - Typing indicator

#### Server to Client
- `room-joined` - Confirmation of room join
- `user-joined` - New user joined room
- `user-left` - User left room
- `new-message` - New chat message
- `subtitle-update` - New subtitle data
- `translation-update` - New translation
- `user-typing` - User typing indicator

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Add tests**: Ensure your code is well-tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes

### Development Guidelines
- Follow ESLint configuration for code style
- Write unit tests for new features
- Update documentation for API changes
- Test Chrome extension thoroughly
- Ensure mobile responsiveness for web app

### Code Structure
```
lingualive/
├── extension/          # Chrome extension files
├── webapp/            # React web application
├── server/            # Node.js backend server
├── docs/              # Documentation
├── docker-compose.yml # Docker configuration
└── README.md          # This file
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

LinguaLive prioritizes user privacy:
- **Local Processing**: Uses Chrome's built-in AI when available
- **Minimal Data Collection**: Only essential data is stored
- **Encryption**: All communications are encrypted
- **No Tracking**: No user tracking or analytics without consent
- **Open Source**: Full transparency of code and data handling

## 🆘 Support

### Common Issues

**Extension not working?**
- Ensure you're using Chrome 121+ with AI features enabled
- Check if the extension has proper permissions
- Verify the backend server is running

**Translation not accurate?**
- Chrome AI is still experimental - fallback services provide better accuracy
- Check language support in Chrome AI
- Verify internet connection for cloud fallbacks

**Real-time features not working?**
- Check WebSocket connection in browser developer tools
- Ensure CORS configuration includes your domain
- Verify Socket.IO server is running

### Getting Help
- 📧 Email: support@lingualive.com
- 💬 Discord: [Join our community](https://discord.gg/lingualive)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/lingualive/issues)
- 📖 Docs: [Full Documentation](https://docs.lingualive.com)

## 🌟 Roadmap

### Upcoming Features
- [ ] Mobile native applications (React Native)
- [ ] Advanced AI models integration
- [ ] Offline translation capabilities
- [ ] Video call integration
- [ ] API for third-party integrations
- [ ] Enterprise features (SSO, admin dashboard)
- [ ] Advanced analytics and insights
- [ ] Multi-modal AI (image, audio, video)

### Version History
- **v1.0.0** - Initial release with basic translation
- **v1.1.0** - Added Chrome AI integration
- **v1.2.0** - Real-time collaboration features
- **v1.3.0** - Meeting summaries and AI enhancement
- **v2.0.0** - Complete rewrite with modern architecture (current)

---

Made with ❤️ for global communication. Star ⭐ this repo if you find it helpful!