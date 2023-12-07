import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // https://axios-http.com/docs/intro
import Card from './Card';
import backOfCardImage from '../backofcard.jpeg';
import Popup from './Popup';
import ScoreCounter from './ScoreCounter';
import GameInstructions from './GameInstructions';

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
  const [isSplitAvailable, setIsSplitAvailable] = useState(false);
  const [playerSplitHand, setPlayerSplitHand] = useState([]);
  const [splitScore, setSplitScore] = useState(0);
  const [isSplitActive, setIsSplitActive] = useState(false);
  const [activeHand, setActiveHand] = useState('original'); 
  const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);
  
  const initializeDeck = useCallback(() => {
    axios // Axios is a JavaScript library for making HTTP requests. We decided to go with Axios to simplify(easier-to-use) the process of making the network requests.
      .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1') // https://www.deckofcardsapi.com/
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

    // Checking for  split 
    if (playerResponse.data.cards[0].value === playerResponse.data.cards[1].value) {
      setIsSplitAvailable(true);
    }
  
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

  const splitHand = async () => {
    if (!isSplitAvailable) return;

    const newPlayerHand = [playerHand[0]];
    const newSplitHand = [playerHand[1]];

    setPlayerHand(newPlayerHand);
    setPlayerSplitHand(newSplitHand);
    setIsSplitActive(true);
    setIsSplitAvailable(false);

    // Draws new card for each hand
    await drawCard(1, setPlayerHand);
    await drawCard(1, setPlayerSplitHand);
  };

  const playerHit = async () => {
    const isSplit = activeHand === 'split';
    const targetHandSetter = isSplit ? setPlayerSplitHand : setPlayerHand;
    const scoreSetter = isSplit ? setSplitScore : setPlayerScore;
  
    try {
      const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
      const newCard = response.data.cards[0];
      targetHandSetter(prevHand => [...prevHand, newCard]);
      const newScore = calculateScore([...(isSplit ? playerSplitHand : playerHand), newCard]);
      scoreSetter(newScore);
  
      if (newScore > 21) {
        if (!isSplit && isSplitActive) {
          setActiveHand('split');
        } else if (isSplit) {
          // If split hand busts check if original hand is done and  proceed to dealer's turn
          setActiveHand('original');
          if (calculateScore(playerHand) <= 21) {
            setGameStatus('dealer-turn');
            dealerTurn();
          } else {
            setGameStatus('ended');
            setMessage('Both Hands Busted!');
            setLossesCount(lossesCount + 2); 
            // Updates losses for both hands
          }
        } else {
          setGameStatus('ended');
          setMessage('You Busted!');
          setLossesCount(lossesCount + 1);
        }
      }
  
      // Disables split option after hitting
      setIsSplitAvailable(false);
    } catch (error) {
      console.error('Error drawing a card:', error);
    }
  };

  const playerStand = async () => {
    if (activeHand === 'original' && isSplitActive) {
      setActiveHand('split');
    } else {
      setGameStatus('dealer-turn');
      dealerTurn();
    }
  };

  const dealerTurn = async () => {
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
    const splitHandScore = isSplitActive ? calculateScore(playerSplitHand) : 0;
  
    let originalHandMessage = '';
    let splitHandMessage = '';
    let tempWinsCount = winsCount;
    let tempLossesCount = lossesCount;
  
    // Determine outcome for the first hand
    if (playerCurrentScore > 21) {
      originalHandMessage = 'You Busted!';
      tempLossesCount += 1;
    } else if (playerCurrentScore <= 21 && (dealerScore > 21 || playerCurrentScore > dealerScore)) {
      originalHandMessage = 'You Win!';
      tempWinsCount += 1;
    } else if (playerCurrentScore === dealerScore) {
      originalHandMessage = 'Push!';
    } else {
      originalHandMessage = 'Dealer Wins!';
      tempLossesCount += 1;
    }
  
    // Determine outcome for the split hand 
    if (isSplitActive) {
      if (splitHandScore > 21) {
        splitHandMessage = 'Split Hand Busted!';
        tempLossesCount += 1;
      } else if (splitHandScore <= 21 && (dealerScore > 21 || splitHandScore > dealerScore)) {
        splitHandMessage = 'Split Hand Wins!';
        tempWinsCount += 1;
      } else if (splitHandScore === dealerScore) {
        splitHandMessage = 'Push on Split Hand!';
      } else {
        splitHandMessage = 'Dealer Wins Against Split Hand!';
        tempLossesCount += 1;
      }
    }
  
    // Update new counts
    setWinsCount(tempWinsCount);
    setLossesCount(tempLossesCount);
  
    // final message 
    let finalMessage = originalHandMessage;
    if (isSplitActive && splitHandMessage) {
      finalMessage += `\n${splitHandMessage}`; // Use \n for a new line
    }
    setMessage(finalMessage);
    setGameStatus('ended');
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
    setIsSplitActive(false);
    setIsSplitAvailable(false);
    setActiveHand('original');
  };
  const hideInstructions = () => {
    setIsInstructionsVisible(!isInstructionsVisible);
  };

  return (
    <div className="container">
      <h1><strong>SI 579 React Blackjack</strong></h1>
  
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

        <button className="btn btn-info" onClick={hideInstructions}>
          {isInstructionsVisible ? 'Hide Instructions' : 'How to Play'}
        </button>
      </div>
  
      {isScoreVisible && (
        <ScoreCounter wins={winsCount} losses={lossesCount} onReset={resetCounters} />
      )}
      {isInstructionsVisible && (
        <GameInstructions onClose={hideInstructions} />
      )}
  
      <div className="row mt-3">
        <div className="col">
          <h4>Dealer's Hand</h4>
          <div className="d-flex justify-content-center align-items-center">
            {dealerHand.slice(0, 1).map((card, index) => (
              <Card key={index} card={card} />
            ))}
            {gameStatus === 'player-turn' && <img src={backOfCardImage} alt="Card Back" className="card" />}
            {gameStatus !== 'player-turn' && dealerHand.slice(1).map((card, index) => (
              <Card key={`dealer-${index}`} card={card} />
            ))}
          </div>
          <p>Score: {gameStatus === 'player-turn' ? '?' : calculateScore(dealerHand)}</p>
        </div>
      </div>
  
      <div className="row">
        <div className={`col ${isSplitActive && activeHand === 'original' ? 'highlight-hand' : ''}`}>
          <h4>Your Hand</h4>
          <div className="d-flex justify-content-center align-items-center">
            {playerHand.map((card, index) => (
              <Card key={index} card={card} />
            ))}
          </div>
          <p>Score: {calculateScore(playerHand)}</p>
        </div>
  
        {isSplitActive && (
          <div className={`col ${activeHand === 'split' ? 'highlight-hand' : ''}`}>
            <h4>Split Hand</h4>
            <div className="d-flex justify-content-center align-items-center">
              {playerSplitHand.map((card, index) => (
                <Card key={`split-${index}`} card={card} />
              ))}
            </div>
            <p>Split Hand Score: {calculateScore(playerSplitHand)}</p>
          </div>
        )}
      </div>
  
      {gameStatus === 'player-turn' && (
        <>
          {isSplitAvailable && !isSplitActive && (
            <button className="btn btn-warning" onClick={splitHand}>
              Split
            </button>
          )}
          <button className="btn btn-success" onClick={playerHit}>
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