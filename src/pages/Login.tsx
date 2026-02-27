import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { motion } from 'motion/react';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, isMock } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await signIn(email);
      if (isMock) {
        navigate('/dashboard');
      } else {
        setMessage('Check your email for the login link!');
      }
    } catch (error: any) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-4">
          <CardHeader className="border-b-4">
            <CardTitle className="text-4xl font-black uppercase text-center">
              Enter Jadhr
            </CardTitle>
            <p className="text-center text-sm font-bold uppercase text-gray-500 mt-2">
              Master Arabic Roots
            </p>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 h-12 text-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-black uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? 'Sending...' : (isMock ? 'Enter (Mock Mode)' : 'Send Magic Link')}
              </Button>
              {message && (
                <p className="text-center text-sm font-bold bg-black text-white p-2">
                  {message}
                </p>
              )}
              {isMock && (
                <p className="text-xs text-center font-mono text-gray-500 mt-4">
                  Supabase not configured. Running in local mock mode.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
