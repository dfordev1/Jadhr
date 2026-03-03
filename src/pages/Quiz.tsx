import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { ArabicRoot } from '../types';
import { Check, X, RefreshCw, Volume2, Flame } from 'lucide-react';
import { playArabicAudio } from '../lib/audio';

export function Quiz() {
  const { roots, progress, updateProgress, recordActivity } = useData();
  const [currentRoot, setCurrentRoot] = useState<ArabicRoot | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (roots.length > 0 && !currentRoot && !quizFinished) {
      nextQuestion();
    }
  }, [roots]);

  const nextQuestion = () => {
    if (roots.length === 0) return;
    
    // Spaced Repetition System (SRS) Algorithm
    const scoredRoots = roots.map(root => {
      const prog = progress[root.id];
      let score = 0;
      
      if (!prog || prog.status === 'new') {
        score = 50; // High priority for new words
      } else if (prog.status === 'learning') {
        const hoursSince = prog.last_reviewed ? (Date.now() - new Date(prog.last_reviewed).getTime()) / 3600000 : 999;
        score = 100 + hoursSince; // Higher priority the longer it's been
      } else if (prog.status === 'mastered') {
        const hoursSince = prog.last_reviewed ? (Date.now() - new Date(prog.last_reviewed).getTime()) / 3600000 : 999;
        score = hoursSince > 168 ? hoursSince * 0.1 : 0; // Only review mastered words after a week (168 hours)
      }
      
      // Add slight randomness to prevent exact same order every time
      score += Math.random() * 10;
      
      return { root, score };
    });

    // Sort by score descending
    scoredRoots.sort((a, b) => b.score - a.score);
    
    // Take from the top 5 highest priority roots
    const pool = scoredRoots.slice(0, Math.min(5, scoredRoots.length));
    const selected = pool[Math.floor(Math.random() * pool.length)].root;
    
    setCurrentRoot(selected);
    setShowAnswer(false);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentRoot) return;
    await updateProgress(currentRoot.id, correct);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    
    if (score.total >= 9) { // 10 questions per session
      setQuizFinished(true);
      recordActivity(); // Record streak when a session is completed
    } else {
      nextQuestion();
    }
  };

  const restartQuiz = () => {
    setScore({ correct: 0, total: 0 });
    setQuizFinished(false);
    nextQuestion();
  };

  if (roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-center">Empty Dictionary</h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest text-center">Upload roots to start learning</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Flame className="w-24 h-24 text-orange-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">Session Complete</h1>
          <p className="text-4xl font-bold text-gray-400 uppercase tracking-widest mb-2">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-xl font-bold text-black uppercase tracking-widest bg-orange-100 inline-block px-4 py-2 border-2 border-black">
            Daily Streak Recorded!
          </p>
        </motion.div>
        <Button onClick={restartQuiz} size="lg" className="text-2xl font-black uppercase h-16 px-12 mt-8">
          <RefreshCw className="mr-4 w-8 h-8" /> Play Again
        </Button>
      </div>
    );
  }

  if (!currentRoot) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Quiz Mode</h1>
        <div className="text-2xl font-bold uppercase tracking-widest text-gray-400">
          {score.total + 1} / 10
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
          <Card className="border-8 min-h-[450px] flex flex-col relative overflow-hidden">
            <CardHeader className="border-b-8 flex-1 flex flex-col items-center justify-center py-16 bg-gray-50 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full hover:bg-black hover:text-white w-12 h-12"
                onClick={() => playArabicAudio(currentRoot.root_arabic)}
              >
                <Volume2 className="w-8 h-8" />
              </Button>
              <CardTitle className="text-9xl font-arabic text-center" dir="rtl">
                {currentRoot.root_arabic}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 flex-1 flex flex-col justify-center items-center px-8">
              {!showAnswer ? (
                <Button 
                  onClick={() => setShowAnswer(true)} 
                  className="w-full h-24 text-3xl font-black uppercase tracking-widest"
                >
                  Reveal Meaning
                </Button>
              ) : (
                <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <p className="text-6xl font-black uppercase leading-tight">{currentRoot.core_meaning}</p>
                    <p className="text-2xl font-bold text-gray-500 uppercase tracking-widest">
                      {currentRoot.root_transliterated}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Button 
                      variant="outline" 
                      onClick={() => handleAnswer(false)}
                      className="h-24 text-3xl font-black uppercase border-4 hover:bg-red-500 hover:text-white hover:border-red-500"
                    >
                      <X className="mr-4 w-10 h-10" /> Incorrect
                    </Button>
                    <Button 
                      onClick={() => handleAnswer(true)}
                      className="h-24 text-3xl font-black uppercase border-4 border-black hover:bg-green-500 hover:border-green-500"
                    >
                      <Check className="mr-4 w-10 h-10" /> Correct
                    </Button>
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
