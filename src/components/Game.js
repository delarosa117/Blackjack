import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from './Card';
import backOfCardImage from '../backofcard.jpeg';
import Popup from './Popup';
import ScoreCounter from './ScoreCounter';

const Game = () => {
  const [deckId, setDeckId] = useState('');
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('initial');
  const [message, setMessage] = useState('');
  const [winsCount, setWinsCount] = useState(0);
  const [lossesCount, setLossesCount] = useState(0);
  const [isScoreVisible, setIsScoreVisible] = useState(true);

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

  const dealCards = async () => {
    const playerResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
    const dealerResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
  
    setPlayerHand(playerResponse.data.cards);
    setDealerHand(dealerResponse.data.cards);
  
    const playerInitialScore = calculateScore(playerResponse.data.cards);
    const dealerInitialScore = calculateScore(dealerResponse.data.cards);
  
    if (playerInitialScore === 21 && dealerInitialScore === 21) {
      setGameStatus('ended');
      setMessage('Push! Both players have Blackjack!');
    } else if (playerInitialScore === 21) {
      setWinsCount(winsCount + 1); 
      setGameStatus('ended');
      setMessage('You Got Blackjack!');
    } else if (dealerInitialScore === 21) {
      setDealerScore(dealerInitialScore);
      setLossesCount(lossesCount + 1); 
      setGameStatus('ended');
      setMessage('Dealer wins with Blackjack!');
    } else {
      setGameStatus('player-turn');
    }
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
          setMessage('You Busted!');
          setLossesCount(lossesCount + 1); 
        }
        
        return updatedHand;
      });
    } catch (error) {
      console.error('Error drawing a card:', error);
    }
  };

  const playerStand = async () => {
    setGameStatus('dealer-turn');
    dealerTurn();
  };

  const dealerTurn = async () => {
    try {
      let newHand = [...dealerHand];
      while (calculateScore(newHand) < 17) {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const newCard = response.data.cards[0];
        newHand = [...newHand, newCard];
        setDealerHand([...newHand]);
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
      setMessage('You Busted!');
      setLossesCount(lossesCount + 1);
    } else if (dealerScore > 21 || playerCurrentScore > dealerScore) {
      setGameStatus('ended');
      setMessage('You Win!');
      setWinsCount(winsCount + 1); 
    } else if (playerCurrentScore < dealerScore) {
      setGameStatus('ended');
      setMessage('Dealer wins!');
      setLossesCount(lossesCount + 1); 
    } else {
      setGameStatus('ended');
      setMessage('Push!');
    }
  };

  const toggleScoreVisibility = () => {
    setIsScoreVisible(!isScoreVisible);
  };

  const resetCounters = () => {
    setWinsCount(0);
    setLossesCount(0);
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
      <h1>SI 579 React Blackjack</h1>
  
      {gameStatus === 'initial' && (
        <div>
          <button className="btn btn-primary" onClick={dealCards}>
            Start Game
          </button>
        </div>
      )}
  
      <div style={{ marginTop: '10px' }}>
        <button className="btn btn-info" onClick={toggleScoreVisibility}>
          {isScoreVisible ? 'Hide Score Counter' : 'Show Score Counter'}
        </button>
      </div>
  
      {isScoreVisible && (
        <ScoreCounter 
          wins={winsCount} 
          losses={lossesCount} 
          onReset={resetCounters} 
        />
      )}
  
      <div className="row mt-3 flex-column">
        <div className="col">
          <h4>Dealer's Hand</h4>
          <div className="d-flex justify-content-center align-items-center">
            {dealerHand.slice(0, 1).map((card, index) => (
              <Card key={index} card={card} />
            ))}
            {gameStatus === 'player-turn' && (
              <div className="card">
                <img src={backOfCardImage} alt="Card Back" />
              </div>
            )}
            {gameStatus !== 'player-turn' && dealerHand.slice(1).map((card, index) => (
              <Card key={`dealer-${index}`} card={card} />
            ))}
          </div>
          <p>Score: {gameStatus === 'player-turn' ? '?' : calculateScore(dealerHand)}</p>
        </div>
        <div className="col">
          <h4>Player's Hand</h4>
          <div className="d-flex justify-content-center align-items-center">
            {playerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
          <p>Score: {calculateScore(playerHand)}</p>
        </div>
      </div>
  
      {gameStatus === 'player-turn' && (
        <>
          <button className="btn btn-success" style={{ border: '1px solid black' }} onClick={playerHit}>
            Hit
          </button>
          <button className="btn btn-secondary" onClick={playerStand}>
            Stand
          </button>
        </>
      )}
  
      {gameStatus === 'ended' && (
        <Popup message={message} onPlayAgain={resetGame} />
      )}
    </div>
  );
};

export default Game;