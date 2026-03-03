import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { ArabicRoot } from '../types';
import { Check, X, RefreshCw, Volume2, Flame, Keyboard, Type } from 'lucide-react';
import { playArabicAudio } from '../lib/audio';

export function Quiz() {
  const { roots, progress, updateProgress, recordActivity } = useData();
  const [currentRoot, setCurrentRoot] = useState<ArabicRoot | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  // Hard Mode State
  const [isHardMode, setIsHardMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isTypedCorrect, setIsTypedCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roots.length > 0 && !currentRoot && !quizFinished) {
      nextQuestion();
    }
  }, [roots]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in input
      if (document.activeElement?.tagName === 'INPUT') return;
      
      if (e.code === 'Space' && !showAnswer && !isHardMode) {
        e.preventDefault();
        setShowAnswer(true);
      } else if (showAnswer) {
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handleAnswer(false);
        }
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          handleAnswer(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, currentRoot, isHardMode]);

  useEffect(() => {
    if (isHardMode && !showAnswer) {
      inputRef.current?.focus();
    }
  }, [isHardMode, showAnswer, currentRoot]);

  const nextQuestion = () => {
    if (roots.length === 0) return;
    
    const scoredRoots = roots.map(root => {
      const prog = progress[root.id];
      let score = 0;
      
      if (!prog || prog.status === 'new') {
        score = 50;
      } else if (prog.status === 'learning') {
        const hoursSince = prog.last_reviewed ? (Date.now() - new Date(prog.last_reviewed).getTime()) / 3600000 : 999;
        score = 100 + hoursSince;
      } else if (prog.status === 'mastered') {
        const hoursSince = prog.last_reviewed ? (Date.now() - new Date(prog.last_reviewed).getTime()) / 3600000 : 999;
        score = hoursSince > 168 ? hoursSince * 0.1 : 0;
      }
      
      score += Math.random() * 10;
      return { root, score };
    });

    scoredRoots.sort((a, b) => b.score - a.score);
    const pool = scoredRoots.slice(0, Math.min(5, scoredRoots.length));
    const selected = pool[Math.floor(Math.random() * pool.length)].root;
    
    setCurrentRoot(selected);
    setShowAnswer(false);
    setTypedAnswer('');
    setIsTypedCorrect(null);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentRoot) return;
    await updateProgress(currentRoot.id, correct);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    
    if (score.total >= 9) {
      setQuizFinished(true);
      recordActivity();
    } else {
      nextQuestion();
    }
  };

  const handleHardModeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoot || !typedAnswer.trim()) return;
    
    const answer = typedAnswer.toLowerCase().trim();
    const meaning = currentRoot.core_meaning.toLowerCase();
    const transliteration = currentRoot.root_transliterated.toLowerCase();
    
    // Check if typed answer is in meaning or transliteration
    const correct = meaning.includes(answer) || transliteration.includes(answer);
    
    setIsTypedCorrect(correct);
    setShowAnswer(true);
  };

  const restartQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setQuizFinished(false);
    nextQuestion();
  };

  if (roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center">Empty Dictionary</h1>
        <p className="text-lg md:text-xl font-bold text-gray-400 uppercase tracking-widest text-center">Upload roots to start learning</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Flame className="w-20 h-20 md:w-24 md:h-24 text-orange-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4">Session Complete</h1>
          <p className="text-2xl md:text-4xl font-bold text-gray-400 uppercase tracking-widest mb-6">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-sm md:text-xl font-bold text-black uppercase tracking-widest bg-orange-100 inline-block px-4 py-2 border-2 border-black">
            Daily Streak Recorded!
          </p>
        </motion.div>
        <Button onClick={restartQuiz} size="lg" className="text-xl md:text-2xl font-black uppercase h-14 md:h-16 px-8 md:px-12 mt-8">
          <RefreshCw className="mr-3 md:mr-4 w-6 h-6 md:w-8 md:h-8" /> Play Again
        </Button>
      </div>
    );
  }

  if (!currentRoot) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Quiz Mode</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant={isHardMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsHardMode(!isHardMode)}
            className="font-bold uppercase tracking-widest border-2"
          >
            <Type className="w-4 h-4 mr-2" /> Hard Mode
          </Button>
          <div className="text-xl md:text-2xl font-bold uppercase tracking-widest text-gray-400">
            {score.total + 1} / 10
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentRoot.id + (showAnswer ? '-answer' : '-question')}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-4 md:border-8 min-h-[400px] md:min-h-[450px] flex flex-col relative overflow-hidden">
            <CardHeader className="border-b-4 md:border-b-8 flex-1 flex flex-col items-center justify-center py-12 md:py-16 bg-gray-50 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 md:top-4 md:right-4 rounded-full hover:bg-black hover:text-white w-10 h-10 md:w-12 md:h-12"
                onClick={() => playArabicAudio(currentRoot.root_arabic)}
              >
                <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
              </Button>
              <CardTitle className="text-7xl md:text-9xl font-arabic text-center" dir="rtl">
                {currentRoot.root_arabic}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 flex-1 flex flex-col justify-center items-center px-4 md:px-8">
              {!showAnswer ? (
                isHardMode ? (
                  <form onSubmit={handleHardModeSubmit} className="w-full flex flex-col gap-4">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Type meaning or transliteration..."
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      className="h-16 md:h-20 text-xl md:text-2xl font-bold uppercase tracking-widest text-center border-4"
                    />
                    <Button 
                      type="submit"
                      className="w-full h-14 md:h-16 text-xl md:text-2xl font-black uppercase tracking-widest"
                      disabled={!typedAnswer.trim()}
                    >
                      Submit
                    </Button>
                  </form>
                ) : (
                  <div className="w-full flex flex-col gap-4">
                    <Button 
                      onClick={() => setShowAnswer(true)} 
                      className="w-full h-20 md:h-24 text-2xl md:text-3xl font-black uppercase tracking-widest"
                    >
                      Reveal Meaning
                    </Button>
                    <div className="hidden md:flex items-center justify-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest">
                      <Keyboard className="w-4 h-4" /> Press Space
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-2 md:space-y-4">
                    {isHardMode && isTypedCorrect !== null && (
                      <div className={`text-sm md:text-lg font-black uppercase mb-4 inline-block px-4 py-1 border-2 ${isTypedCorrect ? 'bg-green-100 text-green-800 border-green-800' : 'bg-red-100 text-red-800 border-red-800'}`}>
                        {isTypedCorrect ? 'Good Guess!' : `You typed: ${typedAnswer}`}
                      </div>
                    )}
                    <p className="text-4xl md:text-6xl font-black uppercase leading-tight">{currentRoot.core_meaning}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-500 uppercase tracking-widest">
                      {currentRoot.root_transliterated}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleAnswer(false)}
                        className="h-20 md:h-24 text-xl md:text-3xl font-black uppercase border-4 hover:bg-red-500 hover:text-white hover:border-red-500"
                      >
                        <X className="mr-2 md:mr-4 w-6 h-6 md:w-10 md:h-10" /> Incorrect
                      </Button>
                      <div className="hidden md:flex items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                        <Keyboard className="w-3 h-3 mr-1" /> Left Arrow
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => handleAnswer(true)}
                        className="h-20 md:h-24 text-xl md:text-3xl font-black uppercase border-4 border-black hover:bg-green-500 hover:border-green-500"
                      >
                        <Check className="mr-2 md:mr-4 w-6 h-6 md:w-10 md:h-10" /> Correct
                      </Button>
                      <div className="hidden md:flex items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                        <Keyboard className="w-3 h-3 mr-1" /> Right Arrow
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
