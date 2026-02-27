import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'motion/react';
import Papa from 'papaparse';
import { ArabicRoot } from '../types';
import { Upload as UploadIcon, FileJson, FileText, CheckCircle } from 'lucide-react';

export function Upload() {
  const { uploadRoots } = useData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        // Handle if it's an array directly or wrapped in an object
        const roots: ArabicRoot[] = Array.isArray(data) ? data : (data.roots || data.data || []);
        if (roots.length === 0) throw new Error('No valid roots found in JSON');
        await uploadRoots(roots);
        setSuccess(true);
        setMessage(`Successfully uploaded ${roots.length} roots.`);
      } else if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const roots: ArabicRoot[] = results.data.map((row: any) => ({
                id: row.id,
                root_arabic: row.root_arabic,
                root_transliterated: row.root_transliterated,
                root_letters: row.root_letters ? JSON.parse(row.root_letters.replace(/'/g, '"')) : [],
                core_meaning: row.core_meaning,
                common_words: row.common_words ? JSON.parse(row.common_words.replace(/'/g, '"')) : [],
                difficulty: parseInt(row.difficulty) || 1,
                frequency_rank: parseInt(row.frequency_rank) || 999,
              })).filter(r => r.root_arabic);
              
              if (roots.length === 0) throw new Error('No valid roots found in CSV');
              await uploadRoots(roots);
              setSuccess(true);
              setMessage(`Successfully uploaded ${roots.length} roots.`);
            } catch (err: any) {
              setMessage(`Error parsing CSV data: ${err.message}`);
            }
          },
          error: (error) => {
            setMessage(`CSV Parse Error: ${error.message}`);
          }
        });
      } else {
        setMessage('Unsupported file format. Please upload .json or .csv');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-6xl font-black uppercase tracking-tighter">Upload Data</h1>
        <p className="text-xl font-bold text-gray-400 uppercase tracking-widest mt-2">Expand your dictionary</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-4">
          <CardHeader className="border-b-4">
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <UploadIcon className="w-6 h-6" /> Import Roots
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="border-4 border-dashed border-black p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="flex gap-4 mb-4">
                <FileJson className="w-12 h-12 text-black" />
                <FileText className="w-12 h-12 text-black" />
              </div>
              <p className="text-2xl font-black uppercase text-center mb-2">
                {loading ? 'Processing...' : 'Click or Drag File'}
              </p>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Supports JSON and CSV
              </p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-6 p-4 border-4 font-bold uppercase flex items-center gap-3 ${
                  success ? 'bg-black text-white border-black' : 'bg-red-100 text-red-900 border-red-900'
                }`}
              >
                {success && <CheckCircle className="w-6 h-6" />}
                {message}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
