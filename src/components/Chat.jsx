import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Chat.css';

const Chat = () => {
  // State to hold messages
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    if (messageInput.trim()) {
      // Add user's message to the chat
      setMessages([...messages, { sender: "user", text: messageInput }]);

      try {
        const response = await axios.post("/api/chat", { message: messageInput });

        // Add the server's response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: response.data.reply }
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
      }

      // Clear the input field
      setMessageInput("");
    }
  };

  return (
    <div className="Chat">
      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input 
          type="text" 
          value={messageInput} 
          onChange={(e) => setMessageInput(e.target.value)} 
          placeholder="Type your message..." 
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;