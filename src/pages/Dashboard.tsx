import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Calendar as CalendarIcon } from 'lucide-react';

export function Dashboard() {
  const { roots, progress, streak, activityHistory } = useData();

  const totalRoots = roots.length;
  const mastered = Object.values(progress).filter((p: any) => p.status === 'mastered').length;
  const learning = Object.values(progress).filter((p: any) => p.status === 'learning').length;
  const newRoots = totalRoots - mastered - learning;

  const chartData = [
    { name: 'Mastered', value: mastered, fill: '#000000' },
    { name: 'Learning', value: learning, fill: '#666666' },
    { name: 'New', value: newRoots, fill: '#cccccc' },
  ];

  // Generate last 30 days for heatmap
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-baseline justify-between gap-2"
      >
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Overview</h1>
        <p className="text-lg md:text-xl font-bold text-gray-400 uppercase tracking-widest">Your Progress</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-4 h-full bg-black text-white">
            <CardHeader className="border-b-4 border-white/20 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-5xl md:text-6xl font-black">{streak} <span className="text-xl md:text-2xl text-gray-400">Days</span></div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Total Roots</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-5xl md:text-6xl font-black">{totalRoots}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Mastered</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-5xl md:text-6xl font-black">{mastered}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Learning</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-5xl md:text-6xl font-black">{learning}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4">
              <CardTitle className="text-xl md:text-2xl font-black uppercase">Progress Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: '#000', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
                  <YAxis tick={{ fill: '#000', fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
                  <Tooltip cursor={{ fill: '#f4f4f0' }} contentStyle={{ border: '2px solid #000', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Bar dataKey="value" fill="#000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4">
              <CardTitle className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" /> Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {last30Days.map((date, i) => {
                  const isActive = activityHistory.includes(date);
                  return (
                    <div 
                      key={date} 
                      title={date}
                      className={`aspect-square border-2 transition-colors ${
                        isActive ? 'bg-black border-black' : 'bg-gray-100 border-gray-200'
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 mt-6 text-center tracking-widest">
                Last 30 Days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
