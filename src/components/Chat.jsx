import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import Suggestion from './Suggestion';
import '../styles/Chat.css';

const Chat = () => {
  // Constants
  const MAX_MESSAGES = 30;
  const INITIAL_LOAD = 15; // Load 15 messages initially
  const LOAD_COUNT = 3;

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

  const [visibleIndex, setVisibleIndex] = useState(Math.max(0, messages.length - INITIAL_LOAD));

  const visibleMessages = messages.slice(visibleIndex, visibleIndex + 15);

  // Holds the top/bottom message for reference
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

  useEffect(() => {
    // Update visibleIndex to always show the latest messages when messages change.
    setVisibleIndex(Math.max(0, messages.length - 15));
  }, [messages]);

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

  // Infinite scroll - Load more messages when near top
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Set userScrolled to true when user scrolls
    setUserScrolled(true);
    // Top Scroll: Load older messages
    if (scrollTop === 0 && !loadingTop) {
      setLoadingTop(true);
      setTimeout(() => {
        setMessages((prevMessages) => {
          const start = Math.max(0, prevMessages.length - INITIAL_LOAD - LOAD_COUNT);
          const end = prevMessages.length - INITIAL_LOAD;
          const olderMessages = end > start ? prevMessages.slice(start, end) : [];
          const newMessages = [...olderMessages, ...prevMessages];

          const indexedMessages = newMessages.map((msg, idx) => ({
            ...msg,
            index: idx,
          }));

          // Update visibleIndex to shift window up by LOAD_COUNT
          setVisibleIndex((prevIndex) => Math.max(0, prevIndex - LOAD_COUNT));

          return indexedMessages;
        });
        setLoadingTop(false);
      }, 1000); // Simulate network delay
    }
  
    // Bottom Scroll: Load newer messages
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loadingBottom && userScrolled) {
      setLoadingBottom(true);
      setTimeout(() => {
        setMessages((prevMessages) => {
          const start = prevMessages.length - INITIAL_LOAD;
          const end = Math.min(prevMessages.length, start + LOAD_COUNT);
          const newerMessages = prevMessages.slice(start, end);
          const newMessages = [...prevMessages, ...newerMessages];

          // Update visibleIndex to shift window down by LOAD_COUNT
          setVisibleIndex((prevIndex) => Math.min(newMessages.length - 15, prevIndex + LOAD_COUNT));

          return newMessages;
        });
        setLoadingBottom(false);
      }, 1000); // Simulate network delay
    }
  };

  return (
    <div className="Chat">
      <div className="message-container" onScroll={handleScroll}>
        <div ref={messageStartRef} />
        {loadingTop && <div className="loading-indicator">Loading older messages...</div>}

        {visibleMessages.map((message, index) => (
          <Message key={index} sender={message.sender} text={`${message.index}: ${message.text}`} />
        ))}
        
        {loadingBottom && <div className="loading-indicator">Loading newer messages...</div>}
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