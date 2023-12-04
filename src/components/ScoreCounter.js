import React from 'react';
import Draggable from 'react-draggable';

const ScoreCounter = ({ wins, losses, onReset }) => {
  return (
    <Draggable>
      <div className="score-counter">
        <h3>Wins: {wins}</h3>
        <h3>Losses: {losses}</h3>
        <button className="btn btn-danger" onClick={onReset}>
          Reset Counter
        </button>
      </div>
    </Draggable>
  );
};

export default ScoreCounter;