import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion, AnimatePresence } from 'motion/react';
import { ArabicRoot } from '../types';
import { Check, X, RefreshCw } from 'lucide-react';

export function Quiz() {
  const { roots, updateProgress } = useData();
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
    const randomRoot = roots[Math.floor(Math.random() * roots.length)];
    setCurrentRoot(randomRoot);
    setShowAnswer(false);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentRoot) return;
    await updateProgress(currentRoot.id, correct);
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    
    if (score.total >= 9) { // 10 questions per session
      setQuizFinished(true);
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
          <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">Session Complete</h1>
          <p className="text-4xl font-bold text-gray-400 uppercase tracking-widest">
            Score: {score.correct} / {score.total}
          </p>
        </motion.div>
        <Button onClick={restartQuiz} size="lg" className="text-2xl font-black uppercase h-16 px-12">
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
          <Card className="border-8 min-h-[400px] flex flex-col">
            <CardHeader className="border-b-8 flex-1 flex items-center justify-center py-12">
              <CardTitle className="text-9xl font-arabic text-center" dir="rtl">
                {currentRoot.root_arabic}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 flex-1 flex flex-col justify-center items-center">
              {!showAnswer ? (
                <Button 
                  onClick={() => setShowAnswer(true)} 
                  className="w-full h-20 text-3xl font-black uppercase tracking-widest"
                >
                  Reveal Meaning
                </Button>
              ) : (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-2">
                    <p className="text-5xl font-black uppercase">{currentRoot.core_meaning}</p>
                    <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">
                      {currentRoot.root_transliterated}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleAnswer(false)}
                      className="h-20 text-2xl font-black uppercase border-4 hover:bg-red-500 hover:text-white hover:border-red-500"
                    >
                      <X className="mr-2 w-8 h-8" /> Incorrect
                    </Button>
                    <Button 
                      onClick={() => handleAnswer(true)}
                      className="h-20 text-2xl font-black uppercase border-4 border-black hover:bg-green-500 hover:border-green-500"
                    >
                      <Check className="mr-2 w-8 h-8" /> Correct
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
