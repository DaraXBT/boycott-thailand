import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Input, Label, Button } from '../components/ui';

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { login, signInWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/signup') {
        setActiveTab('signup');
    }
  }, [location.pathname]);

  const toggleTab = (tab: 'login' | 'signup') => {
      setActiveTab(tab);
      setError('');
      if (tab === 'signup') {
          navigate('/signup', { replace: true });
      } else {
          navigate('/login', { replace: true });
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'signup') {
      setError(t('emailSignupDisabled'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('authFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // No navigation needed as OAuth redirects
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('authFailed'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in duration-300">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-foreground mb-3">
          {activeTab === 'login' ? t('welcomeBack') : t('joinMovement')}
        </h2>
        <p className="text-muted-foreground text-lg">
          {activeTab === 'login' ? t('signInDesc') : t('createAccountDesc')}
        </p>
      </div>

      <Card className="border-border shadow-xl bg-card rounded-3xl overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
           <button
             onClick={() => toggleTab('login')}
             className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all ${
               activeTab === 'login' 
                 ? 'text-primary border-b-2 border-primary bg-background' 
                 : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
             }`}
           >
             {t('navLogin')}
           </button>
           <button
             onClick={() => toggleTab('signup')}
             className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all ${
               activeTab === 'signup' 
                 ? 'text-primary border-b-2 border-primary bg-background' 
                 : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
             }`}
           >
             {t('createAccountBtn')}
           </button>
        </div>

        <div className="p-8 space-y-6">
          
          {/* Social Login (Available on both tabs) */}
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground font-medium flex items-center justify-center gap-3 transition-all hover:shadow-md"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
             {googleLoading ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
                 <GoogleIcon className="w-5 h-5" />
             )}
             {t('continueWithGoogle')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-semibold tracking-wider">
                {t('orSeparator')} email
              </span>
            </div>
          </div>

          {/* Signup Unavailable Alert */}
          {activeTab === 'signup' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                        {t('emailSignupDisabled')}
                    </p>
                    <p className="text-amber-700 dark:text-amber-400">
                        {t('useGoogle')}
                    </p>
                </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Name Field (Signup Only) */}
            {activeTab === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <div className="relative group">
                    <Input 
                      id="name" 
                      type="text" 
                      required 
                      placeholder="John Doe"
                      className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      disabled={true} // Disabled as per requirement to force Google Auth
                    />
                    <User className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <div className="relative group">
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={activeTab === 'signup'}
                />
                <Mail className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative group">
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  disabled={activeTab === 'signup'}
                />
                <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={loading || googleLoading || activeTab === 'signup'}
            >
              {loading ? t('pleaseWait') : (activeTab === 'login' ? t('signInBtn') : t('createAccountBtn'))}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'login' ? (
                <>
                  {t('noAccount')} 
                  <button 
                    onClick={() => toggleTab('signup')}
                    className="ml-1 font-bold text-primary hover:text-primary/80 hover:underline transition-all"
                  >
                    {t('signUpLink')}
                  </button>
                </>
              ) : (
                <>
                  {t('hasAccount')}
                  <button 
                    onClick={() => toggleTab('login')}
                    className="ml-1 font-bold text-primary hover:text-primary/80 hover:underline transition-all"
                  >
                    {t('signInLink')}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;