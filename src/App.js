import React from 'react';
import Game from './components/Game'; // Ensure the path is correct
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import './App.css'; // App-specific styles
import './style.css'; // Custom styles for the game

function App() {
  return (
    <div className="App">
      <Game /> {/* Render the Game component */}
    </div>
  );
}

export default App;
