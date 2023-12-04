import React from 'react';

const Popup = ({ message, onPlayAgain }) => {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{message}</h2>
        <button className="btn btn-warning" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Popup

