import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        navigate('/login');
        return;
      }
      
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Create a new conversation on component mount
  useEffect(() => {
    const createConversation = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3002/api/chat/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title: 'New Conversation'
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create conversation');
          }
          
          const data = await response.json();
          setConversationId(data.data.id);
          
          // Add initial welcome message
          setMessages([
            { 
              id: 'welcome', 
              text: 'Hello! How can I help you today?', 
              sender: 'bot', 
              timestamp: new Date() 
            }
          ]);
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    };
    
    if (user && !conversationId) {
      createConversation();
    }
  }, [user, conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !conversationId || loadingResponse) return;
    
    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoadingResponse(true);
    
    // Add typing indicator
    const typingIndicator = {
      id: 'typing',
      text: '',
      sender: 'bot',
      isTyping: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingIndicator]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          message: inputMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Remove typing indicator and add bot response
      setMessages(prev => 
        prev.filter(msg => msg.id !== 'typing').concat({
          id: data.data.botMessage.id,
          text: data.data.botMessage.content,
          sender: 'bot',
          timestamp: new Date(data.data.botMessage.timestamp)
        })
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator and add error message
      setMessages(prev => 
        prev.filter(msg => msg.id !== 'typing').concat({
          id: Date.now(),
          text: 'Sorry, there was an error processing your request. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        })
      );
    } finally {
      setLoadingResponse(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Format message text with line breaks and links
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const textWithLinks = text.replace(urlRegex, url => 
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
    );
    
    // Replace line breaks with <br>
    return textWithLinks.replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-300 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2.5"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none mr-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Logo size="sm" withText={true} />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
            
            <div className="hidden md:flex items-center">
              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-800 text-xs font-medium">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
              <span className="ml-2 text-sm text-gray-700 truncate max-w-[100px]">
                {user?.firstName || user?.username || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg z-30 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Logo size="md" withText={true} />
            <button
              className="ml-auto p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
              className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ml-3">Dashboard</span>
            </a>

            <a href="#" className="flex items-center px-4 py-3 text-primary-600 bg-primary-50 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="ml-3 font-medium">Chat</span>
            </a>
            
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50">
              <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="ml-3">Knowledge Bases</span>
            </a>
          </nav>
        </div>
      </div>
      
      {/* Chat container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full p-4">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-xl shadow-sm p-4">
          <div className="space-y-6">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center mr-2">
                    <Logo size="sm" withText={false} />
                  </div>
                )}
                
                <div
                  className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl 
                    ${message.sender === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                      : message.isTyping 
                        ? 'bg-gray-100 text-gray-500' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                >
                  {message.isTyping ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
                      ></div>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                      } flex justify-end`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  )}
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center ml-2">
                    <span className="text-gray-600 text-xs font-medium">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || user?.email?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loadingResponse}
            className={`w-full py-4 pl-4 pr-24 rounded-xl border-gray-300 focus:ring-primary-500 focus:border-primary-500 shadow-sm
              ${loadingResponse ? 'bg-gray-50' : 'bg-white'}`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="submit"
              disabled={loadingResponse}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium 
                ${loadingResponse 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-white bg-primary-600 hover:bg-primary-700 shadow-sm'
                }`}
            >
              {loadingResponse ? 'Sending...' : (
                <>
                  Send
                  <svg className="ml-1 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage; 