import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import axios from '../api/axios';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { 
      text: "hello!,I'm your medical assistant how can i help you today?", 
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Questions médicales prédéfinies
  const quickQuestions = [
    "Comment prendre rendez-vous ?",
    "Quelles sont vos heures d'ouverture ?",
    "Où puis-je trouver mes résultats d'analyse ?",
    "Comment renouveler une ordonnance ?",
    "Quels sont les symptômes du COVID-19 ?"
  ];

  // Défilement automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get response from backend API
  const getBotResponse = async (userMessage) => {
    try {
      setIsTyping(true);
      
      const response = await axios.post('/chatbot/process', {  // Remove full URL
        query: userMessage
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      return response.data.response;
    } catch (error) {
      console.error('Error fetching bot response:', error);
      return "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = input;
    setMessages(prev => [
      ...prev,
      { 
        text: userMessage, 
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');

    // Get and display bot response
    const botResponse = await getBotResponse(userMessage);
    setMessages(prev => [
      ...prev,
      { 
        text: botResponse, 
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleQuickQuestion = async (question) => {
    setInput(question);
    
    // Automatically send the quick question
    setMessages(prev => [
      ...prev,
      { 
        text: question, 
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const botResponse = await getBotResponse(question);
    setMessages(prev => [
      ...prev,
      { 
        text: botResponse, 
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <FaRobot className="chatbot-icon" />
        <h2>Medical Assistant</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              {msg.sender === 'bot' ? (
                <FaRobot className="message-icon" />
              ) : (
                <FaUser className="message-icon" />
              )}
              <div>
                <p>{msg.text}</p>
                <span className="message-time">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-content">
              <FaRobot className="message-icon" />
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

   

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your medical question..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;