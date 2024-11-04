import React from 'react';
import Chat from './components/Chat'; // Adjust the path if necessary
import './App.css'; // If you have global styles

const App = () => {
  return (
    <div className="App">
      <h1>Chatbot</h1> {/* Optional title */}
      <Chat />
    </div>
  );
}

export default App;