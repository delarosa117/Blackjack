
import React from 'react';

const Card = ({ card }) => {
  const { value, suit, image } = card;

  return (
    <div className="card">
      <img src={image} alt={`${value} of ${suit}`} />
    </div>
  );
};

export default Card;


