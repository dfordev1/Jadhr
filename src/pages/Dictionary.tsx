import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

export function Dictionary() {
  const { roots } = useData();
  const [search, setSearch] = useState('');

  const filteredRoots = roots.filter(
    (root) =>
      root.root_arabic.includes(search) ||
      root.root_transliterated.toLowerCase().includes(search.toLowerCase()) ||
      root.core_meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between"
      >
        <h1 className="text-6xl font-black uppercase tracking-tighter">Dictionary</h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">{roots.length} Roots</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoots.map((root, index) => (
          <motion.div
            key={root.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-4 h-full hover:bg-black hover:text-white transition-colors group cursor-pointer">
              <CardHeader className="border-b-4 group-hover:border-white pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-4xl font-arabic" dir="rtl">
                  {root.root_arabic}
                </CardTitle>
                <span className="text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300">
                  {root.root_transliterated}
                </span>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-2xl font-black uppercase mb-4">{root.core_meaning}</p>
                <div className="space-y-2">
                  {root.common_words.slice(0, 3).map((word, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-bold border-b-2 border-gray-200 group-hover:border-gray-800 pb-2">
                      <span className="uppercase text-gray-600 group-hover:text-gray-400">{word.meaning}</span>
                      <span className="font-arabic text-lg" dir="rtl">{word.word}</span>
                    </div>
                  ))}
                  {root.common_words.length > 3 && (
                    <p className="text-xs font-bold uppercase text-gray-400 group-hover:text-gray-500 pt-2">
                      + {root.common_words.length - 3} more words
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredRoots.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-4xl font-black uppercase text-gray-300">No roots found</p>
          </div>
        )}
      </div>
    </div>
  );
}
