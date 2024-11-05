import React from 'react';
import '../styles/Chat.css';

const Message = ({ sender, text }) => {
  return (
    <div className={`message ${sender}`}>
      {text}
    </div>
  );
}

export default Message;