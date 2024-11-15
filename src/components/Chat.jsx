import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Message from './Message';
import Suggestion from './Suggestion';
import '../styles/Chat.css';

const Chat = () => {
  // Constants
  const MAX_MESSAGES = 10;

  // State to hold messages
  const [messages, setMessages] = useState([]);
  // State to set message input
  const [messageInput, setMessageInput] = useState('');
  // State to track if the message limit is reached
  const [isLimitReached, setIsLimitReached] = useState(false);
  // State to show suggestions at the start of the chat
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [generalContext, setGeneralContext] = useState(''); // State to hold general context
  const suggestions = ["Hello!", "Tell me a joke", "What's the weather?", "Help"];

  // Holds the bottom message for reference
  const messageEndRef = useRef(null);

  // State to hold error messages
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch general context on component mount
  useEffect(() => {
    fetch('/general_context.txt')
      .then(response => response.text())
      .then(data => setGeneralContext(data))
      .catch(error => console.error("Error fetching general context:", error));
  }, []);

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(messageInput);
  };

  const sendMessage = async (message) => {
    // Calculate the maximum number of user messages allowed
    const maxUserMessages = Math.floor(MAX_MESSAGES / 2);
    // Count only user messages
    const userMessagesCount = messages.filter(msg => msg.sender === "user").length;
    if (userMessagesCount >= maxUserMessages) {
      setIsLimitReached(true);
      return;
    }

    setMessageInput("");
    const finalMessage = message || messageInput;
  
    if (finalMessage.trim()) {
      // Add user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: finalMessage }
      ]);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "..." }
      ]);
  
      try {
        // Combine general context, all previous messages, and the final message into one string
        const fullMessage = generalContext + ' ' + messages.map(msg => msg.text).join(' ') + ' ' + finalMessage;
        
        const apiHost = process.env.REACT_APP_BACKEND_API_HOST; // Access the environment variable
        const response = await axios.post(`${apiHost}/api/ask`, { message: fullMessage }); 
        
        // Clear any previous error message
        setErrorMessage('');

        // Add the server's response to the chat
        setMessages((prevMessages) => {
          const newMessages = prevMessages.slice(0, -1); // Remove the last "..." message
          newMessages.push({ sender: "bot", text: response.data.reply });

          // Check if the total number of messages has reached the limit
          if (newMessages.length >= MAX_MESSAGES) {
            setIsLimitReached(true);
          }
        
          return newMessages;
        });
      } catch (error) {
        console.error("Error sending message:", error);
        // Set the error message to display to the user
        setErrorMessage('Failed to send message. Please try again later.');
        // Optionally handle the error by removing the typing indicator
        setMessages((prevMessages) => prevMessages.slice(0, -1));
      }
      // Clear the input field only if messageInput was used
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessageInput(suggestion);
    sendMessage(suggestion);
  };

  return (
    <div className="Chat">
      <div className="message-container">
        {messages.map((message, index) => (
          <Message key={index} sender={message.sender} text={`${message.text}`} />
        ))}
        
        <div ref={messageEndRef} />
      </div>
      
      {/* Display error message if it exists */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {isLimitReached && (
        <div className="limit-message">
          You have exceeded the message limit. Please start a new session.
        </div>
      )}
      <form className="message-input-form" onSubmit={handleFormSubmit}>
        <input 
          type="text" 
          value={messageInput} 
          onChange={(e) => setMessageInput(e.target.value)} 
          placeholder="Type your message..." 
          disabled={isLimitReached}  //  Disable message box if limit is reached
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