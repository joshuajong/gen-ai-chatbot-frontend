import React from 'react';
import '../styles/Suggestion.css';

const Suggestion = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="suggestion-container">
      {suggestions.map((suggestion, index) => (
        <button 
          key={index} 
          className="suggestion-bubble" 
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default Suggestion;