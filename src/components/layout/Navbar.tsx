import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { BookOpen, Upload, LogOut, BarChart2, BrainCircuit } from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter uppercase">Jadhr</span>
              <span className="text-2xl font-bold text-gray-400">|</span>
              <span className="text-xl font-arabic" dir="rtl">جذر</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
                <Link to="/dashboard" className="text-black hover:bg-black hover:text-white px-3 py-2 text-sm font-bold uppercase transition-colors flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/dictionary" className="text-black hover:bg-black hover:text-white px-3 py-2 text-sm font-bold uppercase transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Dictionary
                </Link>
                <Link to="/quiz" className="text-black hover:bg-black hover:text-white px-3 py-2 text-sm font-bold uppercase transition-colors flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> Quiz
                </Link>
                <Link to="/upload" className="text-black hover:bg-black hover:text-white px-3 py-2 text-sm font-bold uppercase transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <Button variant="ghost" onClick={signOut} className="font-bold uppercase flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button className="font-bold uppercase">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
