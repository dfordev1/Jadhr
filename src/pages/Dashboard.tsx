import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { roots, progress } = useData();

  const totalRoots = roots.length;
  const mastered = Object.values(progress).filter((p: any) => p.status === 'mastered').length;
  const learning = Object.values(progress).filter((p: any) => p.status === 'learning').length;
  const newRoots = totalRoots - mastered - learning;

  const chartData = [
    { name: 'Mastered', value: mastered, fill: '#000000' },
    { name: 'Learning', value: learning, fill: '#666666' },
    { name: 'New', value: newRoots, fill: '#cccccc' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between"
      >
        <h1 className="text-6xl font-black uppercase tracking-tighter">Overview</h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Your Progress</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Total Roots</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-6xl font-black">{totalRoots}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Mastered</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-6xl font-black">{mastered}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-4 h-full">
            <CardHeader className="border-b-4 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Learning</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-6xl font-black">{learning}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-4">
          <CardHeader className="border-b-4">
            <CardTitle className="text-2xl font-black uppercase">Progress Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#000', fontWeight: 'bold', textTransform: 'uppercase' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
                <YAxis tick={{ fill: '#000', fontWeight: 'bold' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} />
                <Tooltip cursor={{ fill: '#f4f4f0' }} contentStyle={{ border: '2px solid #000', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="value" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
