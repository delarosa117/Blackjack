import React from 'react';

const Popup = ({ message, onPlayAgain }) => {
  const popupStyle = {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '999',
    background: 'none',
  };

  const messageStyle = {
    background: 'transparent',
    opacity: '1',
  };

  const buttonStyle = {
    opacity: '1',
    backgroundColor: 'green',
  };

  // Split the messages 
  const messageLines = message.split('\n').map((line, index) => (
    <h2 key={index} style={messageStyle}>{line}</h2>
  ));

  return (
    <div className="popup" style={popupStyle}>
      <div className="popup-content">
        {messageLines}
        <button className="btn btn-success" style={buttonStyle} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Popup;