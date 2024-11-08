import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import Suggestion from './Suggestion';
import '../styles/Chat.css';

const Chat = () => {
  // State to hold messages
  const [messages, setMessages] = useState([]);
  // State to set message input
  const [messageInput, setMessageInput] = useState('');
  // Temporary for loading older messages
  const [loadingTop, setLoadingTop] = useState(false);
  // Temporary for loading newer messages
  const [loadingBottom, setLoadingBottom] = useState(false);
  // State to check if user has scrolled
  const [userScrolled, setUserScrolled] = useState(false);
  // State to show suggestions at the start of the chat
  const [showSuggestions, setShowSuggestions] = useState(true);
  const suggestions = ["Hello!", "Tell me a joke", "What's the weather?", "Help"];

  const messageEndRef = useRef(null);
  const messageStartRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolled(false); // Reset user scroll flag after programmatic scroll
  };

  const scrollToTop = () => {
    messageStartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loadingBottom && !userScrolled) { // Check userScrolled flag
      scrollToBottom();
    }
  }, [loadingBottom, userScrolled]);

  useEffect(() => {
    if (!loadingTop) {
      scrollToTop();
    }
  }, [loadingTop]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(messageInput);
  };

  const sendMessage = async (message) => {
    const finalMessage = message || messageInput;
  
    if (finalMessage.trim()) {
      // Add user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: finalMessage }
      ]);
  
      try {
        const response = await axios.post("/api/chat", { message: finalMessage });
        // Add the server's response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: response.data.reply }
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
  
      // Clear the input field only if messageInput was used
      setMessageInput("");
      setShowSuggestions(false);
      scrollToBottom();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessageInput(suggestion);
    sendMessage(suggestion);
  };

  // Infinite scroll - Load more messages when near top
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Set userScrolled to true when user scrolls
    setUserScrolled(true);

    // Top Scroll: Load older messages
    if (scrollTop === 0 && !loadingTop) {
      setLoadingTop(true);

      setTimeout(() => {
        setMessages((prevMessages) => [
          { sender: "bot", text: "Loaded older message 1" },
          { sender: "bot", text: "Loaded older message 2" },
          ...prevMessages
        ]);
        setLoadingTop(false);
      }, 1000); // Simulate network delay
    }

    // Bottom Scroll: Load newer messages
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loadingBottom && userScrolled) {
      setLoadingBottom(true);

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Loaded newer message 1" }
        ]);
        setLoadingBottom(false);
      }, 1000); // Simulate network delay
    }
  };

  return (
    <div className="Chat">
      <div className="message-container" onScroll={handleScroll}>
      <div ref={messageStartRef} />
        {loadingTop && <div className="loading">Loading older messages...</div>}
        
        {messages.map((message, index) => (
          <Message key={index} sender={message.sender} text={message.text} />
        ))}

        {loadingBottom && <div className="loading">Loading newer messages...</div>}
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