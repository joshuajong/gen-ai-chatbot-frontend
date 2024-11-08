import React from 'react';
import Chat from './components/Chat'; // Adjust the path if necessary
import ErrorBoundary from './components/ErrorBoundary'; // Adjust the path if necessary
import './App.css'; // If you have global styles

const App = () => {
  return (
    <div className="App">
      <h1>Chat with Us</h1> {/* Optional title */}
      <ErrorBoundary>
        <Chat />
      </ErrorBoundary>
    </div>
  );
}

export default App;