import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Volume2, Filter, ArrowDownAZ, Network } from 'lucide-react';
import { playArabicAudio } from '../lib/audio';

export function Dictionary() {
  const { roots, progress } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'difficulty' | 'frequency'>('default');
  const [expandedRoot, setExpandedRoot] = useState<string | number | null>(null);

  let processedRoots = roots.filter(
    (root) =>
      root.root_arabic.includes(search) ||
      root.root_transliterated.toLowerCase().includes(search.toLowerCase()) ||
      root.core_meaning.toLowerCase().includes(search.toLowerCase())
  );

  if (filterStatus !== 'all') {
    processedRoots = processedRoots.filter(root => {
      const status = progress[root.id]?.status || 'new';
      return status === filterStatus;
    });
  }

  if (sortBy === 'difficulty') {
    processedRoots.sort((a, b) => a.difficulty - b.difficulty);
  } else if (sortBy === 'frequency') {
    processedRoots.sort((a, b) => a.frequency_rank - b.frequency_rank);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-baseline justify-between gap-4"
      >
        <h1 className="text-6xl font-black uppercase tracking-tighter">Dictionary</h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">{processedRoots.length} Roots</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <Input
            type="text"
            placeholder="Search roots, meanings, or transliterations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 h-16 text-xl font-bold uppercase tracking-widest border-4"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white border-2 border-black p-1">
            <Filter className="w-4 h-4 ml-2 text-gray-500" />
            <select 
              className="bg-transparent font-bold uppercase text-sm outline-none cursor-pointer p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="learning">Learning</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border-2 border-black p-1">
            <ArrowDownAZ className="w-4 h-4 ml-2 text-gray-500" />
            <select 
              className="bg-transparent font-bold uppercase text-sm outline-none cursor-pointer p-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="default">Default Sort</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="frequency">Sort by Frequency</option>
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedRoots.map((root, index) => {
          const isExpanded = expandedRoot === root.id;
          const status = progress[root.id]?.status || 'new';

          return (
            <motion.div
              key={root.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`border-4 transition-all duration-300 ${isExpanded ? 'ring-4 ring-black ring-offset-4' : 'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}`}
              >
                <CardHeader className="border-b-4 pb-4 flex flex-row items-center justify-between bg-gray-50 cursor-pointer" onClick={() => setExpandedRoot(isExpanded ? null : root.id)}>
                  <div>
                    <CardTitle className="text-5xl font-arabic flex items-center gap-4" dir="rtl">
                      {root.root_arabic}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full hover:bg-black hover:text-white"
                        onClick={(e) => { e.stopPropagation(); playArabicAudio(root.root_arabic); }}
                      >
                        <Volume2 className="w-6 h-6" />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                        {root.root_transliterated}
                      </span>
                      <span className={`text-xs font-black uppercase px-2 py-1 border-2 ${
                        status === 'mastered' ? 'bg-black text-white border-black' :
                        status === 'learning' ? 'bg-gray-200 text-black border-gray-400' :
                        'bg-white text-gray-400 border-gray-200'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black uppercase">{root.core_meaning}</p>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-6 bg-white">
                        <div className="flex items-center gap-2 mb-6 text-gray-400">
                          <Network className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-widest text-sm">Derivation Tree</span>
                        </div>
                        
                        <div className="relative border-l-4 border-black ml-4 pl-6 space-y-4">
                          {root.common_words.map((word, i) => (
                            <div key={i} className="relative group">
                              <div className="absolute -left-[28px] top-1/2 w-6 border-t-4 border-black"></div>
                              <div className="bg-gray-50 p-4 border-2 border-black flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-black hover:text-white transition-colors">
                                <div className="flex flex-col">
                                  <span className="font-arabic text-3xl" dir="rtl">{word.word}</span>
                                  <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-gray-400 mt-1">{word.transliteration}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="uppercase font-black text-lg">{word.meaning}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="border-2 group-hover:border-white group-hover:text-white group-hover:hover:bg-white group-hover:hover:text-black"
                                    onClick={(e) => { e.stopPropagation(); playArabicAudio(word.word); }}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {processedRoots.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-4xl font-black uppercase text-gray-300">No roots found</p>
          </div>
        )}
      </div>
    </div>
  );
}
