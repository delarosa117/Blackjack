import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from './Card';
import backOfCardImage from '../backofcard.jpeg';

const Game = () => {
  const [deckId, setDeckId] = useState('');
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('initial');
  const [message, setMessage] = useState('');

  const initializeDeck = useCallback(() => {
    axios
      .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(response => {
        setDeckId(response.data.deck_id);
      })
      .catch(error => {
        console.error('Error initializing deck:', error);
      });
  }, []);

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  const drawCard = async (count, targetHandSetter) => {
    try {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
        const newCards = response.data.cards;
        targetHandSetter(prevHand => [...prevHand, ...newCards]);
    } catch (error) {
        console.error('Error drawing cards:', error);
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const dealCards = async () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setMessage('');
    setGameStatus('player-turn');

    // Draw the first card for the player
    await drawCard(1, setPlayerHand);
    await delay(1000); // wait for 1 second

    // Draw the second card for the player
    await drawCard(1, setPlayerHand);
    await delay(1000); // wait for 1 second

    // Draw the initial card for the dealer
    await drawCard(1, setDealerHand);
    await delay(1000); // wait for 1 second

    // Draw the second card for the dealer but don't show it
    // Assuming you have a way to handle the hidden card
    await drawCard(1, setDealerHand);
};

const playerHit = async () => {
  try {
    const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const newCard = response.data.cards[0];

    setPlayerHand(prevHand => {
      const updatedHand = [...prevHand, newCard];
      const newScore = calculateScore(updatedHand);
      setPlayerScore(newScore);

      if (newScore > 21) {
        setGameStatus('ended');
        setMessage('Player busts!');
      }
      
      return updatedHand;
    });
  } catch (error) {
    console.error('Error drawing a card:', error);
  }
};

  const playerStand = async () => {
    setGameStatus('dealer-turn');
    try {
      let newHand = [...dealerHand];
      while (calculateScore(newHand) < 17) {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const newCard = response.data.cards[0];
        newHand = [...newHand, newCard];
      }

      setDealerHand(newHand);
      const newScore = calculateScore(newHand);
      setDealerScore(newScore);

      setGameStatus('ended');
      determineWinner(newScore);
    } catch (error) {
      console.error('Error drawing a card:', error);
    }
  };

  const dealerTurn = async () => {
    try {
      let newHand = [...dealerHand];
      while (calculateScore(newHand) < 17) {
        // Adding a delay before drawing a new card
        await delay(1000);
  
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const newCard = response.data.cards[0];
        newHand = [...newHand, newCard];
  
        // Update dealer's hand immediately after drawing each card
        setDealerHand([...newHand]);
  
        // Adding another delay after setting the new hand to give a feel of real-time dealing
        await delay(1000);
      }
  
      const newScore = calculateScore(newHand);
      setDealerScore(newScore);
  
      setGameStatus('ended');
      determineWinner(newScore);
    } catch (error) {
      console.error('Error drawing a card:', error);
    }
  };

  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'ACE') {
        aces += 1;
        score += 11;
      } else if (['JACK', 'QUEEN', 'KING'].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const determineWinner = (dealerScore) => {
    const playerCurrentScore = calculateScore(playerHand);

    if (playerCurrentScore > 21) {
      setGameStatus('ended');
      setMessage('Player busts!');
    } else if (dealerScore > 21 || playerCurrentScore > dealerScore) {
      setGameStatus('ended');
      setMessage('Player wins!');
    } else if (playerCurrentScore < dealerScore) {
      setGameStatus('ended');
      setMessage('Dealer wins!');
    } else {
      setGameStatus('ended');
      setMessage('Push!');
    }
  };

  const resetGame = () => {
    initializeDeck();
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setGameStatus('initial');
    setMessage('');
  };

  return (
    <div className="container">
      <h1>Blackjack Game</h1>
      {gameStatus === 'initial' && (
        <button className="btn btn-primary" onClick={dealCards}>
          Start Game
        </button>
      )}
      <div className="row mt-3 flex-column">
        {/* Dealer's Hand */}
        <div className="col">
          <h2>Dealer's Hand</h2>
          <div className="d-flex justify-content-center align-items-center">
            {/* Always show the first card */}
            {dealerHand.slice(0, 1).map((card, index) => (
              <Card key={index} card={card} />
            ))}
            {/* Render the back of a card if it's the player's turn */}
            {gameStatus === 'player-turn' && (
              <div className="card">
                <img src={backOfCardImage} alt="Card Back" />
              </div>
            )}
            {/* If it's not the player's turn, render the second and subsequent cards */}
            {gameStatus !== 'player-turn' && dealerHand.slice(1).map((card, index) => (
              <Card key={`dealer-${index}`} card={card} />
            ))}
          </div>
          <p>Score: {gameStatus === 'player-turn' ? '?' : calculateScore(dealerHand)}</p>
        </div>
        {/* Player's Hand */}
        <div className="col">
          <h2>Player's Hand</h2>
          <div className="d-flex justify-content-center align-items-center">
            {playerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
          <p>Score: {calculateScore(playerHand)}</p>
        </div>
      </div>
      {/* Game Controls */}
      {gameStatus === 'player-turn' && (
        <>
          <button className="btn btn-secondary" onClick={playerHit}>
            Hit
          </button>
          <button className="btn btn-secondary" onClick={playerStand}>
            Stand
          </button>
        </>
      )}
      {gameStatus === 'ended' && (
        <button className="btn btn-warning" onClick={resetGame}>
          Play Again
        </button>
      )}
      {/* Game Messages */}
      {message && <div className="alert alert-info">{message}</div>}
    </div>
  );
};

export default Game;