import React from 'react';
import Draggable from 'react-draggable';

const GameInstructions = ({onClose}) => {
  return (
    <Draggable>
      <div className="game-instructions" style={{ opacity: 0.95 }}>
        <h3>Game Instructions</h3>
        <ul>
          <li>
            <strong>Blackjack:</strong> The player (or the dealer) will automatically win if the first two cards they receive equal 21.
          </li>
          <li>
            <strong>Win:</strong> Players will win if their card total is greater than the dealer and they do not bust (exceed 21). Players will also win if the dealer busts at any point in the game.
          </li>
          <li>
            <strong>Bust:</strong> Players will lose the match if they choose to “hit” and their cards exceed 21. This will also occur if the dealer exceeds 21.
          </li>
          <li>
            <strong>Cards:</strong> Each numbered card is equal to the value listed (1 through 9), and each face card (jack, queen, and king) is equal to 10. Aces can be worth 1 or 11, based on what the player prefers in each situation.
          </li>
          <li>
            <strong>Hit or stand:</strong> After players have received their cards, they will be offered the option to either hit (receive another card) or stand (choose not to receive any additional cards for the current turn).
          </li>
          <li>
            <strong>Split:</strong> The ability to separate two matching cards (such as two 6’s) in a single hand into two separate hands. This is only possible with your first two cards. Some versions of the game include this feature while others do not.
          </li>
          <li>
            <strong>Start a new game:</strong> Players can start a new game at any time. Both the player and the dealer will receive two cards each to begin the game.
          </li>
        </ul>
        <button className="btn btn-danger" onClick={onClose}>
          Hide Instructions
        </button>
      </div>
    </Draggable>
  );
};

export default GameInstructions;
