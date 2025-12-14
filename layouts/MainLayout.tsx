import React, { useState } from 'react';
import { Ban, Menu, X, LogIn, User, ShieldCheck, LogOut, HeartHandshake } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Marquee from '../components/Marquee';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { KhmerFlag, EnglishFlag } from '../components/Icons';
import { ThemeToggle } from '../components/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t, lang, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen w-full bg-background relative font-sans text-foreground selection:bg-red-100 selection:text-red-900 overflow-x-hidden transition-colors duration-300">
      {/* Noise Texture (Darker Dots) Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-100"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
          {/* Navigation / Header */}
          <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
              <div 
                className="flex items-center gap-3 cursor-pointer group select-none" 
                onClick={() => handleNavigation('/')}
              >
                 <div className="relative w-11 h-11 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform duration-300 group-hover:shadow-red-600/30">
                    <Ban className="w-6 h-6" strokeWidth={3} />
                 </div>
                 <div className="flex flex-col justify-center h-11">
                    {lang === 'km' ? (
                        <span className="font-bold text-xl tracking-tight leading-none text-foreground" style={{ fontFamily: '"Kantumruy Pro", sans-serif' }}>
                            ពហិការ<span className="text-red-600">ចោរសៀម</span>
                        </span>
                    ) : (
                        <span className="font-extrabold text-2xl tracking-tighter leading-none text-foreground">
                            BOYCOTT<span className="text-red-600">TH</span>
                        </span>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
                    <button 
                      onClick={() => handleNavigation('/')}
                      className={`px-4 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                    >
                      {t('navListings')}
                    </button>
                    <button 
                      onClick={() => handleNavigation('/submit')}
                      className={`px-4 py-2 rounded-lg transition-colors ${isActive('/submit') ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                    >
                      {t('navSubmit')}
                    </button>
                </nav>

                <div className="h-6 w-px bg-border hidden md:block"></div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Language Switcher - Always Visible */}
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                    aria-label="Switch Language"
                >
                    {lang === 'km' ? <KhmerFlag /> : <EnglishFlag />}
                    <span className="text-sm font-medium text-foreground">
                        {lang === 'km' ? 'ខ្មែរ' : 'EN'}
                    </span>
                </button>

                {/* Desktop Auth Section */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="h-6 w-px bg-border mx-2"></div>
                    
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-2 text-foreground bg-secondary/50 rounded-lg border border-border">
                                <User className="w-4 h-4" />
                                <span className="max-w-[100px] truncate">{user.name}</span>
                            </div>
                            
                            {user.role === 'admin' && (
                                <button
                                    onClick={() => handleNavigation('/admin')}
                                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${isActive('/admin') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-muted-foreground hover:bg-secondary/50'}`}
                                >
                                    <ShieldCheck className="w-4 h-4" /> Admin
                                </button>
                            )}

                            <button 
                                onClick={handleLogout}
                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button 
                          onClick={() => handleNavigation('/login')}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isActive('/login') ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                          <LogIn className="w-4 h-4" /> {t('navLogin')}
                        </button>
                    )}
                </div>

                 {/* Mobile Hamburger */}
                 <button 
                    className="md:hidden p-2 text-muted-foreground hover:bg-secondary rounded-lg ml-1"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                 >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                 </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-background border-b border-border shadow-xl py-4 px-4 flex flex-col gap-2 md:hidden animate-in slide-in-from-top-2 z-50">
                 {user && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg mb-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{user.name}</span>
                        <span className="ml-auto text-xs uppercase bg-background border border-border px-2 py-0.5 rounded text-muted-foreground">{user.role}</span>
                    </div>
                 )}
                 
                 <button 
                    onClick={() => handleNavigation('/')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
                  >
                    {t('navListings')}
                  </button>
                  <button 
                    onClick={() => handleNavigation('/submit')}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/submit') ? 'bg-secondary text-foreground font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
                  >
                    {t('navSubmit')}
                  </button>
                  
                  {user?.role === 'admin' && (
                     <button 
                        onClick={() => handleNavigation('/admin')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-muted-foreground hover:bg-secondary/50'}`}
                    >
                        Admin Dashboard
                    </button>
                  )}

                  <div className="h-px bg-border my-1" />

                  {user ? (
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                  ) : (
                    <button 
                        onClick={() => handleNavigation('/login')}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground flex items-center gap-2 justify-center"
                    >
                        <LogIn className="w-4 h-4" /> {t('navLoginSignup')}
                    </button>
                  )}
              </div>
            )}
          </header>
          
          {/* Marquee Section */}
          <Marquee text={t('marqueeText')} />
          
          {/* Mobile Menu Backdrop */}
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden top-20"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <main className="container mx-auto px-4 py-10 md:py-16 flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-background/80 backdrop-blur-sm border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground">
                  {t('footerTitle')}
                </h3>
                <p className="text-muted-foreground font-medium">
                  {t('footerDesc')}
                </p>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
};

export default MainLayout;