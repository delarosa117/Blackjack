import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card'; // Import the Card component

const Game = () => {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameStatus, setGameStatus] = useState('initial'); // 'initial', 'player-turn', 'dealer-turn', 'ended'
    const [message, setMessage] = useState('');
    
  
    const initializeDeck = useCallback(() => {
      let newDeck = createDeck();
      newDeck = shuffleDeck(newDeck);
      setDeck(newDeck);
    }, []); 

    useEffect(() => {
      initializeDeck();
    }, [initializeDeck]);
  
    const createDeck = () => {
      const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
      let deck = [];
  
      for (let suit of suits) {
        for (let value of values) {
          deck.push({ suit, value });
        }
      }
  
      return deck;
    };
  
    const shuffleDeck = (deck) => {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    };

    // const dealOneCard = (handSetter) => {
    //   const newCard = deck.pop();
    //   handSetter(prevHand => [...prevHand, newCard]);
    // };

    const dealCards = () => {
      initializeDeck();
  
      // Deal the first card to the player
      setTimeout(() => {
          const newPlayerCard1 = deck.pop();
          setPlayerHand(prevHand => [...prevHand, newPlayerCard1]);
      }, 500);
  
      // Deal the first card to the dealer
      setTimeout(() => {
          const newDealerCard1 = deck.pop();
          setDealerHand(prevHand => [...prevHand, newDealerCard1]);
      }, 1000);
  
      // Deal the second card to the player
      setTimeout(() => {
          const newPlayerCard2 = deck.pop();
          setPlayerHand(prevHand => {
              const newPlayerHand = [...prevHand, newPlayerCard2];
              const playerScore = calculateScore(newPlayerHand);
              setPlayerScore(playerScore);
  
              // Check for auto win will be done after the dealer's second card is dealt
              return newPlayerHand;
          });
      }, 1500);
  
      // Deal the second card to the dealer and check for 21
      setTimeout(() => {
          const newDealerCard2 = deck.pop();
          setDealerHand(prevHand => {
              const newDealerHand = [...prevHand, newDealerCard2];
              const dealerScore = calculateScore(newDealerHand);
              setDealerScore(dealerScore);
  
              // Now, check for auto win
              checkForAutoWin(playerScore, dealerScore);
  
              return newDealerHand;
          });
      }, 2000);
  };
  
  const checkForAutoWin = (playerScore, dealerScore) => {
      if (playerScore === 21 || dealerScore === 21) {
          setGameStatus('ended');
          if (playerScore === 21) {
              setMessage('Player hits 21, player wins!');
          } else if (dealerScore === 21) {
              setMessage('Dealer hits 21, dealer wins!');
          }
      } else {
          setGameStatus('player-turn');
      }
  };
  
    const playerHit = () => {
      const newHand = [...playerHand, deck.pop()];
      setPlayerHand(newHand);
      const newScore = calculateScore(newHand);
      setPlayerScore(newScore);
  
      if (newScore > 21) {
        setGameStatus('ended');
        setMessage('Player busts!');
      }
    };
  
    const playerStand = () => {
      setGameStatus('dealer-turn');
      dealerTurn();
    };
  
    const dealerTurn = () => {
      let newHand = dealerHand;
      while (calculateScore(newHand) < 17) {
        newHand = [...newHand, deck.pop()];
      }
      setDealerHand(newHand);
      const newScore = calculateScore(newHand);
      setDealerScore(newScore);
      setGameStatus('ended');
      determineWinner(newScore);
    };
  
    const calculateScore = (hand) => {
      let score = 0;
      let aces = 0;
  
      for (let card of hand) {
        if (card.value === 'Ace') {
          aces += 1;
          score += 11;
        } else if (['Jack', 'Queen', 'King'].includes(card.value)) {
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
      if (dealerScore > 21) {
        setMessage('Dealer busts, player wins!');
      } else if (dealerScore > playerScore) {
        setMessage('Dealer wins!');
      } else if (dealerScore < playerScore) {
        setMessage('Player wins!');
      } else {
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
            <button className="btn btn-primary" onClick={dealCards}>Start Game</button>
          )}
          {gameStatus === 'player-turn' && (
            <>
              <button className="btn btn-secondary" onClick={playerHit}>Hit</button>
              <button className="btn btn-secondary" onClick={playerStand}>Stand</button>
            </>
          )}
          {gameStatus === 'ended' && (
            <button className="btn btn-warning" onClick={resetGame}>Play Again</button>
          )}
          <div className="row mt-3">
            <div className="col">
              <h2>Player's Hand</h2>
              <div className="d-flex">
                {playerHand.map((card, index) => (
                  <Card key={index} card={card} />
                ))}
              </div>
              <p>Score: {playerScore}</p>
            </div>
            <div className="col">
              <h2>Dealer's Hand</h2>
              <div className="d-flex">
                {dealerHand.map((card, index) => (
                  <Card key={index} card={card} />
                ))}
              </div>
              <p>Score: {dealerScore}</p>
            </div>
          </div>
          {message && <div className="alert alert-info">{message}</div>}
        </div>
      );
    };
    
export default Game;
