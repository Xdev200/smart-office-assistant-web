import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatMessage, UserRole } from '../types';
import { getChatbotResponse, getAIPrediction } from '../services/geminiService';
import { Button } from './common/Button';
import { ChatIcon } from './icons/ChatIcon';
import { Spinner } from './common/Spinner';
import { useAuth } from '../hooks/useAuth'; // To get user role for context
import { useLocation } from 'react-router-dom'; // To get current page for context

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initial welcome message from bot
    if (isOpen && messages.length === 0) {
      setMessages([{ id: Date.now().toString(), sender: 'bot', text: "Hello! I'm your Smart Office Assistant. How can I help you today?", timestamp: Date.now() }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (e?: FormEvent, predefinedMessage?: string) => {
    if (e) e.preventDefault();
    const messageText = predefinedMessage || inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: messageText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    if (!predefinedMessage) setInputValue('');
    setIsLoading(true);

    try {
      const context = {
        currentPage: location.pathname,
        userRole: currentUser?.role
      }
      const botResponseText = await getChatbotResponse(messageText, [...messages, userMessage], context);
      const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chatbot error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const quickActions = [
    { label: "Mark Attendance Help", query: "How to mark attendance?" },
    { label: "Book a Room Help", query: "How to book a room?" },
    { label: "Parking Info", query: "Tell me about parking" },
  ];

  if (!currentUser) return null; // Don't show chatbot if not logged in

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-sky-600 text-white p-4 rounded-full shadow-xl hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 z-50"
        aria-label={isOpen ? 'Close Chatbot' : 'Open Chatbot'}
      >
        <ChatIcon className="w-7 h-7" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-300 z-50 transform transition-all duration-300 ease-out origin-bottom-right scale-95 opacity-0 animate-chatOpen">
          <header className="bg-sky-600 text-white p-4 rounded-t-xl">
            <h3 className="text-lg font-semibold">Smart Office Assistant</h3>
          </header>

          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-xl shadow ${
                    msg.sender === 'user'
                      ? 'bg-sky-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                   <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-sky-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                   </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-lg shadow bg-gray-200 text-gray-800">
                  <Spinner size="sm" color="text-sky-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
            
          {messages.length <= 2 && ( // Show quick actions if chat is relatively new
            <div className="p-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1 px-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-2 px-1">
                    {quickActions.map(action => (
                        <Button key={action.label} variant="ghost" size="sm" className="text-xs !px-2 !py-1 border border-sky-200 hover:bg-sky-100" onClick={() => handleSendMessage(undefined, action.query)}>
                            {action.label}
                        </Button>
                    ))}
                     {currentUser.role === UserRole.ADMIN && (
                        <Button variant="ghost" size="sm" className="text-xs !px-2 !py-1 border border-sky-200 hover:bg-sky-100" onClick={async () => {
                             const prediction = await getAIPrediction('peak_days');
                             // Explicitly create a message for the AI's "action" or query for its prediction
                             const aiQueryMessage = `Show peak day prediction`;
                             const userQueryForAIPrediction: ChatMessage = { id: Date.now().toString(), sender: 'user', text: aiQueryMessage, timestamp: Date.now() };
                             setMessages(prev => [...prev, userQueryForAIPrediction]);
                             setIsLoading(true);
                             // Then display the AI's actual prediction as a bot response
                             const botPredictionMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: prediction, timestamp: Date.now() };
                             setMessages(prev => [...prev, botPredictionMessage]);
                             setIsLoading(false);
                        }}>
                            Predict Peak Days
                        </Button>
                     )}
                </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask something..."
                className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                disabled={isLoading}
              />
              <Button type="submit" variant="primary" size="md" disabled={isLoading || !inputValue.trim()} className="!py-2 !px-3">
                {isLoading ? <Spinner size="sm" color="text-white" /> : 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 3.105a1.5 1.5 0 012.122-.001L17.5 12.5a1.5 1.5 0 010 2.121L5.227 16.895a1.5 1.5 0 01-2.122-.001 1.5 1.5 0 01-.001-2.121L13.28 12.5 3.105 5.227a1.5 1.5 0 01-.001-2.121z" /></svg>
                }
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
