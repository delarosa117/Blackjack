import React from 'react';

const suitSymbols = {
  'Hearts': '♥',
  'Diamonds': '♦',
  'Clubs': '♣',
  'Spades': '♠'
};

const Card = ({ card }) => {
  const { suit, value } = card;
  const suitSymbol = suitSymbols[suit];

  return (
    <div className={`card ${suit.toLowerCase()}`}>
      <div className="card-body">
        <div className="card-value">{value}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;