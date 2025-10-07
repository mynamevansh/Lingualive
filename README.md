# LinguaLive 🌍<<<<<<< HEAD

# LinguaLive 🌍

**Real-time multilingual meeting assistant—Chrome Extension & web app with live translation, instant summaries, and grammar-perfect notes using Chrome Built-in AI (Gemini Nano).**

**Privacy-first real-time translation, subtitles, and AI-powered meeting summaries with built-in Chrome AI**

LinguaLive is a comprehensive real-time translation and meeting notes application that combines the power of Chrome's built-in AI with a robust web platform for seamless multilingual communication and collaboration.

LinguaLive is a comprehensive real-time translation and meeting notes application that combines the power of Chrome's built-in AI with a robust web platform for seamless multilingual communication and collaboration.

## 🚀 Features

## 🚀 Features

### Core Features

- **Real-time Translation**: Instant translation using Chrome's built-in AI with cloud fallbacks### Core Features

- **Live Subtitles**: Real-time speech recognition and subtitle display- **Real-time Translation**: Instant translation using Chrome's built-in AI with cloud fallbacks

- **Meeting Summaries**: AI-powered meeting summaries and key points extraction- **Live Subtitles**: Real-time speech recognition and subtitle display

- **Multi-language Support**: Support for 100+ languages- **Meeting Summaries**: AI-powered meeting summaries and key points extraction

- **Privacy-first**: Processes data locally when possible using Chrome AI- **Multi-language Support**: Support for 100+ languages

- **Cross-platform**: Chrome extension + Web application + Mobile-responsive- **Privacy-first**: Processes data locally when possible using Chrome AI

- **Cross-platform**: Chrome extension + Web application + Mobile-responsive

### AI-Powered Features

- **Smart Translation**: Context-aware translation using Chrome's AI translator### AI-Powered Features

- **Intelligent Summarization**: Meeting summaries with key topics and action items- **Smart Translation**: Context-aware translation using Chrome's AI translator

- **Text Enhancement**: Grammar checking and text improvement- **Intelligent Summarization**: Meeting summaries with key topics and action items

- **Language Detection**: Automatic language detection- **Text Enhancement**: Grammar checking and text improvement

- **Custom Prompts**: AI-powered custom prompts for specific use cases- **Language Detection**: Automatic language detection

- **Custom Prompts**: AI-powered custom prompts for specific use cases

### Collaboration Features

- **Real-time Rooms**: Join or create meeting rooms for live collaboration### Collaboration Features

- **Live Subtitles Overlay**: See translations overlaid on any webpage- **Real-time Rooms**: Join or create meeting rooms for live collaboration

- **Message History**: Persistent message and translation history- **Live Subtitles Overlay**: See translations overlaid on any webpage

- **User Profiles**: Customizable user preferences and language settings- **Message History**: Persistent message and translation history

- **Multi-device Sync**: Seamless experience across devices- **User Profiles**: Customizable user preferences and language settings

- **Multi-device Sync**: Seamless experience across devices

## 🏗️ Architecture

## 🏗️ Architecture

### Components

1. **Chrome Extension** - Browser integration with content scripts and popup interface### Components

2. **React Web App** - Standalone web application for meeting rooms1. **Chrome Extension** - Browser integration with content scripts and popup interface

3. **Node.js Backend** - Real-time server with Socket.IO and MongoDB2. **React Web App** - Standalone web application for meeting rooms

4. **AI Services** - Chrome AI integration with cloud fallbacks3. **Node.js Backend** - Real-time server with Socket.IO and MongoDB

4. **AI Services** - Chrome AI integration with cloud fallbacks

### Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Socket.IO Client### Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO, MongoDB, Mongoose- **Frontend**: React 18, Material-UI, Socket.IO Client

- **Extension**: Chrome Extension API, Manifest V3- **Backend**: Node.js, Express.js, Socket.IO, MongoDB, Mongoose

- **AI Integration**: Chrome AI APIs (translator, summarizer, rewriter)- **Extension**: Chrome Extension API, Manifest V3

- **Real-time**: WebSocket with Socket.IO- **AI Integration**: Chrome AI APIs (translator, summarizer, rewriter)

- **Database**: MongoDB with advanced indexing- **Real-time**: WebSocket with Socket.IO

- **Database**: MongoDB with advanced indexing

## 📦 Installation

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm### Prerequisites

- MongoDB 4.4+- Node.js 16+ and npm

- Chrome browser (for extension)- MongoDB 4.4+

- Git- Chrome browser (for extension)

- Git

### Quick Start

### Quick Start

1. **Clone the repository**

```bash1. **Clone the repository**

git clone https://github.com/mynamevansh/Lingualive.git```bash

cd lingualivegit clone https://github.com/yourusername/lingualive.git

```cd lingualive

```

2. **Install server dependencies**

```bash2. **Install server dependencies**

cd server```bash

npm installcd server

```npm install

```

3. **Install web app dependencies**

```bash3. **Install web app dependencies**

cd ../webapp```bash

npm installcd ../webapp

```npm install

```

4. **Set up environment variables**

```bash4. **Set up environment variables**

cd ../server```bash

# Create .env file with the following:cd ../server

NODE_ENV=developmentcp .env.example .env

PORT=3001# Edit .env with your configuration

MONGODB_URI=mongodb://localhost:27017/lingualive```

CORS_ORIGINS=chrome-extension://your-extension-id,http://localhost:5173

CLIENT_URL=http://localhost:51735. **Start MongoDB**

``````bash

# Using system MongoDB

5. **Start MongoDB**sudo systemctl start mongod

```bash

# Using system MongoDB# Or using Docker

sudo systemctl start mongoddocker run -d -p 27017:27017 --name mongodb mongo:latest

```

# Or using Docker

docker run -d -p 27017:27017 --name mongodb mongo:latest6. **Start the backend server**

``````bash

cd server

6. **Start the backend server**npm start

```bash```

cd server

npm run dev7. **Start the web application**

``````bash

cd ../webapp

7. **Start the web application**npm start

```bash```

cd ../webapp

npm start8. **Load the Chrome extension**

```   - Open Chrome and go to `chrome://extensions/`

   - Enable "Developer mode"

8. **Load the Chrome extension**   - Click "Load unpacked" and select the `extension` folder

   - Open Chrome and go to `chrome://extensions/`

   - Enable "Developer mode"### Development Setup

   - Click "Load unpacked" and select the `extension` folder

For development with hot reloading:

## 🎯 Usage

```bash

### Web Application Usage# Terminal 1 - Backend with nodemon

cd server

1. **Access the App**: Navigate to `http://localhost:5173`npm run dev

2. **Test Connection**: Click "Test API Connection" to verify backend connectivity

3. **Start Meeting**: Click "Start Meeting" to begin real-time translation# Terminal 2 - Frontend with hot reload

4. **Join Room**: Use "Join Room" to collaborate with otherscd webapp

5. **Real-time Features**: Experience live translation, subtitles, and AI summariesnpm run dev



### Chrome Extension Usage# Terminal 3 - Extension development (optional)

cd extension

1. **Install and Pin**: Install the extension and pin it to your toolbar# Manual reload in chrome://extensions/ after changes

2. **Set Language**: Click the extension icon and set your preferred language```

3. **Start Translation**: Navigate to any webpage and click "Start Translation"

4. **View Subtitles**: Real-time subtitles will appear as an overlay## 🎯 Usage

5. **Join Rooms**: Join meeting rooms for collaborative translation

### Chrome Extension Usage

## 🔧 Configuration

1. **Install and Pin**: Install the extension and pin it to your toolbar

### Environment Variables2. **Set Language**: Click the extension icon and set your preferred language

3. **Start Translation**: Navigate to any webpage and click "Start Translation"

Create a `.env` file in the `server` directory:4. **View Subtitles**: Real-time subtitles will appear as an overlay

5. **Join Rooms**: Join meeting rooms for collaborative translation

```env

# Basic Configuration### Web Application Usage

NODE_ENV=development

PORT=30011. **Access the App**: Navigate to `http://localhost:3000`

MONGODB_URI=mongodb://localhost:27017/lingualive2. **Create Account**: Set up your profile with preferred languages

3. **Create/Join Room**: Create a new room or join an existing one

# CORS Configuration4. **Start Meeting**: Begin real-time translation and collaboration

CORS_ORIGINS=chrome-extension://your-extension-id,http://localhost:51735. **View History**: Access your meeting history and summaries

CLIENT_URL=http://localhost:5173

### API Usage

# Security Keys (generate secure keys for production)

JWT_SECRET=your-super-secret-jwt-keyThe backend provides RESTful APIs for integration:

ADMIN_KEY=your-admin-key

```bash

# Optional: AI Service Fallbacks# Get all public rooms

OPENAI_API_KEY=your-openai-keyGET /api/rooms/public

GOOGLE_TRANSLATE_API_KEY=your-google-key

```# Create a new room

POST /api/rooms

## 📚 API Documentation

# Join a room

### REST EndpointsPOST /api/rooms/:roomId/join



#### Health Check# Send a message

- `GET /health` - Server health statusPOST /api/messages



#### AI Services# Get user statistics

- `POST /api/ai/translate` - Translate textGET /api/users/:email/statistics

- `POST /api/ai/summarize` - Summarize content```

- `POST /api/ai/proofread` - Proofread text

## 🔧 Configuration

#### Rooms

- `GET /api/rooms` - List rooms### Environment Variables

- `POST /api/rooms` - Create new room

Copy `.env.example` to `.env` and configure:

#### Messages

- `POST /api/messages` - Send message```env

# Basic Configuration

#### UsersNODE_ENV=development

- `GET /api/users` - Get usersPORT=3001

- `POST /api/users` - Create userMONGODB_URI=mongodb://localhost:27017/lingualive



### WebSocket Events# CORS (update with your extension ID)

CORS_ORIGINS=chrome-extension://your-extension-id,http://localhost:3000

#### Client to Server

- `join-room` - Join a meeting room# Security Keys (generate secure keys for production)

- `leave-room` - Leave a meeting roomJWT_SECRET=your-super-secret-jwt-key

- `message` - Send chat messageADMIN_KEY=your-admin-key

- `subtitle` - Send subtitle data

- `translation` - Send translation# Optional: AI Service Fallbacks

OPENAI_API_KEY=your-openai-key

#### Server to ClientGOOGLE_TRANSLATE_API_KEY=your-google-key

- `room-joined` - Confirmation of room join```

- `user-joined` - New user joined room

- `user-left` - User left room### Chrome Extension Configuration

- `new-message` - New chat message

- `subtitle-update` - New subtitle dataUpdate the `extension/manifest.json` with your domain:

- `translation-update` - New translation

```json

## 🤝 Contributing{

  "host_permissions": [

We welcome contributions! Please follow these steps:    "http://localhost:3001/*",

    "https://your-domain.com/*"

1. **Fork the repository**  ]

2. **Create a feature branch**: `git checkout -b feature/amazing-feature`}

3. **Make your changes**: Follow the coding standards```

4. **Add tests**: Ensure your code is well-tested

5. **Commit changes**: `git commit -m 'Add amazing feature'`### Database Configuration

6. **Push to branch**: `git push origin feature/amazing-feature`

7. **Open a Pull Request**: Describe your changesMongoDB collections will be automatically created with proper indexing:

- `users` - User profiles and settings

### Code Structure- `rooms` - Meeting rooms and metadata

```- `messages` - Chat messages, subtitles, and translations

lingualive/

├── extension/          # Chrome extension files## 🧪 Testing

├── webapp/            # React web application

├── server/            # Node.js backend server### Unit Tests

├── docs/              # Documentation```bash

└── README.md          # This file# Backend tests

```cd server

npm test

## 📄 License

# Frontend tests

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.cd webapp

npm test

## 🔒 Privacy & Security

# Extension tests (manual testing recommended)

LinguaLive prioritizes user privacy:```

- **Local Processing**: Uses Chrome's built-in AI when available

- **Minimal Data Collection**: Only essential data is stored### Integration Testing

- **Encryption**: All communications are encrypted```bash

- **No Tracking**: No user tracking or analytics without consent# Start test environment

- **Open Source**: Full transparency of code and data handlingnpm run test:integration



## 🆘 Support# Test API endpoints

npm run test:api

### Common Issues

# Test Socket.IO connections

**Frontend not loading CSS?**npm run test:socket

- Ensure Tailwind CSS v4 is properly configured```

- Check if both frontend (port 5173) and backend (port 3001) are running

- Clear browser cache with Ctrl+Shift+R### Manual Testing Checklist

- [ ] Extension loads and shows popup

**Backend connection issues?**- [ ] Translation overlay appears on websites

- Verify MongoDB is running- [ ] Web app connects to backend

- Check if port 3001 is available- [ ] Real-time room synchronization works

- Ensure CORS origins include your frontend URL- [ ] AI services respond correctly

- [ ] Message history persists

**Extension not working?**

- Ensure you're using Chrome 121+ with AI features enabled## 🚀 Deployment

- Check if the extension has proper permissions

- Verify the backend server is running### Docker Deployment

```bash

### Getting Help# Build and run with Docker Compose

- 🐛 Issues: [GitHub Issues](https://github.com/mynamevansh/Lingualive/issues)docker-compose up -d

- 💬 Discussions: [GitHub Discussions](https://github.com/mynamevansh/Lingualive/discussions)

# Or build individual containers

## 🌟 Roadmapdocker build -t lingualive-server ./server

docker build -t lingualive-webapp ./webapp

### Current Features (v2.0.0)```

- ✅ Complete React frontend with Tailwind CSS v4

- ✅ Node.js backend with Express and Socket.IO### Cloud Deployment

- ✅ MongoDB integration

- ✅ Real-time communication#### Backend (Heroku/Railway/DigitalOcean)

- ✅ AI translation services```bash

- ✅ Professional UI components# Deploy to Heroku

heroku create your-app-name

### Upcoming Featuresgit subtree push --prefix server heroku main

- [ ] Chrome AI integration (Gemini Nano)

- [ ] Mobile native applications (React Native)# Set environment variables

- [ ] Advanced AI models integrationheroku config:set MONGODB_URI=your-mongodb-uri

- [ ] Offline translation capabilitiesheroku config:set JWT_SECRET=your-secret

- [ ] Video call integration```

- [ ] Enterprise features (SSO, admin dashboard)

#### Frontend (Netlify/Vercel)

---```bash

# Deploy to Netlify

Made with ❤️ for global communication. Star ⭐ this repo if you find it helpful!cd webapp
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
=======
# Lingualive
Real-time multilingual meeting assistant—Chrome Extension &amp; web app with live translation, instant summaries, and grammar-perfect notes using Chrome Built-in AI (Gemini Nano).
>>>>>>> fbc5ae6798f81d40a1243a19cb4b7ebb102ccd0a
