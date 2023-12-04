import React from 'react';

const Popup = ({ message, onPlayAgain }) => {
  const popupStyle = {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '999', // Ensure it's above other elements
    background: 'none',
  };

  const messageStyle = {
    background: 'transparent', // Remove the background
    opacity: '1',
  };

  const buttonStyle = {
    opacity: '1',
    backgroundColor: 'green', // Change button color to green
  };

  return (
    <div className="popup" style={popupStyle}>
      <div className="popup-content">
        <h2 style={messageStyle}>{message}</h2>
        <button className="btn btn-success" style={buttonStyle} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Popup;