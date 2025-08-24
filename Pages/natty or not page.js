import React, { useState, useEffect } from 'react';
import { GameResult } from '@/entities/GameResult';
import { motion } from 'framer-motion';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ScoreDisplay from '../components/ScoreDisplay';
import ImageDisplay from '../components/ImageDisplay';
import GuessButtons from '../components/GuessButtons';
import ResultOverlay from '../components/ResultOverlay';

const PHYSIQUE_DATA = [
  {
    name: "Steve Reeves",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    isNatty: true,
    explanation: "Steve Reeves competed in the 1940s-50s, well before steroids were available. His classic physique represents peak natural development."
  },
  {
    name: "Eugen Sandow",
    imageUrl: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=400",
    isNatty: true,
    explanation: "The father of modern bodybuilding from the late 1800s. Achieved incredible development through natural training methods only."
  },
  {
    name: "Modern Mass Monster",
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400",
    isNatty: false,
    explanation: "Extreme muscle mass and conditioning that's virtually impossible to achieve naturally. Clear signs of performance enhancement."
  },
  {
    name: "Classic Natural",
    imageUrl: "https://images.unsplash.com/photo-1534368270820-9de3d8053204?w=400",
    isNatty: true,
    explanation: "Well-developed physique with proportions and muscle mass achievable through consistent natural training and nutrition."
  },
  {
    name: "Enhanced Competitor",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
    isNatty: false,
    explanation: "Extreme vascularity, muscle density, and size that exceeds natural genetic limits. Typical of enhanced athletes."
  },
  {
    name: "Natural Athlete",
    imageUrl: "https://images.unsplash.com/photo-1556516541-9e44c271ea19?w=400",
    isNatty: true,
    explanation: "Athletic physique with natural proportions and muscle development consistent with natural training methods."
  },
  {
    name: "Modern Enhanced",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
    isNatty: false,
    explanation: "Exceptional muscle mass, low body fat, and vascular development that strongly suggests performance enhancement."
  },
  {
    name: "Classic Natural Build",
    imageUrl: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400",
    isNatty: true,
    explanation: "Well-proportioned natural physique with muscle development achievable through dedicated natural training."
  }
];

export default function Game() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shuffledData, setShuffledData] = useState([]);

  useEffect(() => {
    const shuffled = [...PHYSIQUE_DATA].sort(() => Math.random() - 0.5);
    setShuffledData(shuffled);
  }, []);

  const currentPerson = shuffledData[currentIndex];

  const handleGuess = async (guess) => {
    if (!currentPerson) return;
    
    setUserGuess(guess);
    setIsLoading(true);
    
    const isCorrect = guess === currentPerson.isNatty;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1
    };
    
    setScore(newScore);
    setStreak(isCorrect ? streak + 1 : 0);
    
    // Save result to database
    try {
      await GameResult.create({
        image_url: currentPerson.imageUrl,
        person_name: currentPerson.name,
        is_natural: currentPerson.isNatty,
        user_guess: guess,
        was_correct: isCorrect,
        score: newScore.correct
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }
    
    setIsLoading(false);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setUserGuess(null);
    
    if (currentIndex < shuffledData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reshuffle when reaching the end
      const reshuffled = [...PHYSIQUE_DATA].sort(() => Math.random() - 0.5);
      setShuffledData(reshuffled);
      setCurrentIndex(0);
    }
  };

  const resetGame = () => {
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setCurrentIndex(0);
    setShowResult(false);
    setUserGuess(null);
    const reshuffled = [...PHYSIQUE_DATA].sort(() => Math.random() - 0.5);
    setShuffledData(reshuffled);
  };

  if (!currentPerson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
            NATTY OR NOT
          </h1>
          <p className="text-gray-300 text-xl">Can you tell who's natural and who's enhanced?</p>
        </motion.div>

        {/* Score Display */}
        <div className="max-w-md mx-auto mb-8">
          <ScoreDisplay correct={score.correct} total={score.total} streak={streak} />
        </div>

        {/* Main Game Area */}
        <div className="max-w-lg mx-auto">
          {/* Image Display */}
          <div className="mb-8">
            <ImageDisplay 
              imageUrl={currentPerson.imageUrl}
              personName={currentPerson.name}
              isLoading={isLoading}
            />
          </div>

          {/* Guess Buttons */}
          <div className="flex justify-center mb-8">
            <GuessButtons 
              onGuess={handleGuess}
              disabled={showResult || isLoading}
              showResult={showResult}
              userGuess={userGuess}
              correctAnswer={currentPerson.isNatty}
            />
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <Button
              onClick={resetGame}
              variant="outline"
              className="bg-transparent border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Game
            </Button>
          </div>
        </div>
      </div>

      {/* Result Overlay */}
      <ResultOverlay
        show={showResult}
        isCorrect={userGuess === currentPerson?.isNatty}
        explanation={currentPerson?.explanation}
        onNext={handleNext}
      />
    </div>
  );
}