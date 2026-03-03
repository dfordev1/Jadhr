import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { BookOpen, Upload, LogOut, BarChart2, BrainCircuit, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2" onClick={closeMenu}>
              <span className="text-2xl font-black tracking-tighter uppercase">Jadhr</span>
              <span className="text-2xl font-bold text-gray-400 hidden sm:inline">|</span>
              <span className="text-xl font-arabic hidden sm:inline" dir="rtl">جذر</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <>
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
              </>
            )}
            {user ? (
              <Button variant="ghost" onClick={signOut} className="font-bold uppercase flex items-center gap-2 ml-4">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button className="font-bold uppercase">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t-2 border-black bg-white overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className="text-black hover:bg-black hover:text-white block px-3 py-4 text-base font-bold uppercase transition-colors flex items-center gap-3 border-b-2 border-gray-100">
                    <BarChart2 className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link to="/dictionary" onClick={closeMenu} className="text-black hover:bg-black hover:text-white block px-3 py-4 text-base font-bold uppercase transition-colors flex items-center gap-3 border-b-2 border-gray-100">
                    <BookOpen className="w-5 h-5" /> Dictionary
                  </Link>
                  <Link to="/quiz" onClick={closeMenu} className="text-black hover:bg-black hover:text-white block px-3 py-4 text-base font-bold uppercase transition-colors flex items-center gap-3 border-b-2 border-gray-100">
                    <BrainCircuit className="w-5 h-5" /> Quiz
                  </Link>
                  <Link to="/upload" onClick={closeMenu} className="text-black hover:bg-black hover:text-white block px-3 py-4 text-base font-bold uppercase transition-colors flex items-center gap-3 border-b-2 border-gray-100">
                    <Upload className="w-5 h-5" /> Upload
                  </Link>
                  <Button variant="ghost" onClick={() => { signOut(); closeMenu(); }} className="w-full justify-start font-bold uppercase flex items-center gap-3 px-3 py-6 mt-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-5 h-5" /> Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={closeMenu} className="block mt-4">
                  <Button className="w-full font-bold uppercase h-12">Login</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
