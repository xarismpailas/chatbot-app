# Chatbot SaaS Platform

A comprehensive SaaS platform for creating, training, and managing custom chatbots with specific knowledge bases.

## Features

- **Authentication**: User registration, login, and profile management
- **Message Handling**: Real-time chat with WebSockets
- **Custom Knowledge Bases**: Train your chatbot on specific documents
- **Data Analytics**: Monitor usage and performance metrics
- **Security**: JWT authentication and data encryption
- **Support System**: Ticket-based support with priorities

## Subscription Plans

### Basic Plan (€290/€235 per month)
- 1,000 messages
- Custom Training
- Data Analytics
- Security
- 24/7 Regular Support

### Premium Plan
- Unlimited messages
- Advanced AI Training
- Priority Support

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Socket.io for real-time communication
- OpenAI/GPT-4 for AI processing

### Frontend
- React with Tailwind CSS
- Responsive dashboard and chat interface
- Analytics visualizations
- Knowledge base management

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/chatbot-saas.git
cd chatbot-saas
```

2. Install dependencies
```
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables
```
# Create .env file in the server directory
cp server/.env.example server/.env
# Edit the .env file with your settings
```

4. Start the development servers
```
# Start the backend server
cd server
npm run dev

# Start the frontend server
cd ../client
npm start
```

5. Open your browser at http://localhost:3000

## API Documentation

The API documentation is available at `/api-docs` when running the server locally.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@chatbotsaas.com or open a support ticket in the application. 