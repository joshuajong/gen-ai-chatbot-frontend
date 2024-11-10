import React, { useState, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import Suggestion from './Suggestion';
import '../styles/Chat.css';

const Chat = () => {
  // Constants
  const MAX_MESSAGES = 30;

  // State to hold messages
  const [messages, setMessages] = useState([]);
  // State to set message input
  const [messageInput, setMessageInput] = useState('');
  // State to show suggestions at the start of the chat
  const [showSuggestions, setShowSuggestions] = useState(true);
  const suggestions = ["Hello!", "Tell me a joke", "What's the weather?", "Help"];

  // Holds the top/bottom message for reference
  const messageEndRef = useRef(null);
  const messageStartRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    messageStartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(messageInput);
  };

  const sendMessage = async (message) => {
    setMessageInput("");
    const finalMessage = message || messageInput;
  
    if (finalMessage.trim()) {
      // Add user's message to the chat
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { sender: "user", text: finalMessage, index: prevMessages.length }
        ];
        const slicedMessages = newMessages.slice(-MAX_MESSAGES);
        const indexedMessages = slicedMessages.map((msg, idx) => ({
          ...msg,
          index: idx
        }));
        return indexedMessages;
      });
  
      try {
        const apiHost = process.env.REACT_APP_BACKEND_API_HOST; // Access the environment variable
        const response = { data: { reply: "testing" } }; // await axios.post(`${apiHost}/api/ask`, { message: finalMessage });

        // Add the server's response to the chat
        setMessages((prevMessages) => {
          const newMessages = [
            ...prevMessages,
            { sender: "bot", text: response.data.reply, index: prevMessages.length }
          ];
          // Ensure FIFO by slicing the array to the last MAX_MESSAGES
          const slicedMessages = newMessages.slice(-MAX_MESSAGES);

          // Recalculate indices for all messages
          const indexedMessages = slicedMessages.map((msg, idx) => ({
            ...msg,
            index: idx
          }));
          return indexedMessages;
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
  
      // Clear the input field only if messageInput was used
      setShowSuggestions(false);
      scrollToBottom();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessageInput(suggestion);
    sendMessage(suggestion);
  };

  return (
    <div className="Chat">
      <div className="message-container">
        <div ref={messageStartRef} />

        {messages.map((message, index) => (
          <Message key={index} sender={message.sender} text={`${message.index}: ${message.text}`} />
        ))}
        
        <div ref={messageEndRef} />
      </div>
      <form className="message-input-form" onSubmit={handleFormSubmit}>
        <input 
          type="text" 
          value={messageInput} 
          onChange={(e) => setMessageInput(e.target.value)} 
          placeholder="Type your message..." 
        />
        <button type="submit">Send</button>
      </form>
      {showSuggestions && (
        <Suggestion 
          suggestions={suggestions} 
          onSuggestionClick={handleSuggestionClick} 
        />
      )}
    </div>
  );
}

export default Chat;