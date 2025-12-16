
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
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

const OTP_LENGTH = 6;

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { login, signup, verifyOtp, signInWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '', name: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (location.pathname === '/signup') {
        setActiveTab('signup');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (showOtpInput) {
        // Focus first OTP input when view appears
        setTimeout(() => {
            otpInputRefs.current[0]?.focus();
        }, 100);
    }
  }, [showOtpInput]);

  const toggleTab = (tab: 'login' | 'signup') => {
      setActiveTab(tab);
      setError('');
      setShowOtpInput(false);
      setFormData({ email: '', password: '', name: '', otp: '' });
      if (tab === 'signup') {
          navigate('/signup', { replace: true });
      } else {
          navigate('/login', { replace: true });
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        // SIGNUP FLOW
        if (!showOtpInput) {
            // Step 1: Request Signup (Send OTP)
            await signup(formData.email, formData.password, formData.name);
            setShowOtpInput(true);
        } else {
            // Step 2: Verify OTP
            await verifyOtp(formData.email, formData.otp);
            navigate('/');
        }
      }
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

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    // Allow only numeric input
    if (!/^\d*$/.test(value)) return;
    
    // Take the last character if multiple are entered (though maxLength is 1)
    const char = value.slice(-1);

    const newOtp = formData.otp.split('');
    // Ensure array is properly sized
    while (newOtp.length < OTP_LENGTH) newOtp.push('');
    
    newOtp[index] = char;
    const otpString = newOtp.join('').slice(0, OTP_LENGTH);
    setFormData({ ...formData, otp: otpString });

    // Auto-advance focus
    if (char && index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
        if (!formData.otp[index] && index > 0) {
            // If current is empty, move back and delete previous
            const newOtp = formData.otp.split('');
            newOtp[index - 1] = '';
            setFormData({ ...formData, otp: newOtp.join('') });
            otpInputRefs.current[index - 1]?.focus();
        } else if (formData.otp[index]) {
            // Just clear current
            const newOtp = formData.otp.split('');
            newOtp[index] = '';
            setFormData({ ...formData, otp: newOtp.join('') });
        }
    } else if (e.key === 'ArrowLeft' && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH).replace(/\D/g, '');
    if (pastedData) {
        setFormData({ ...formData, otp: pastedData });
        const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
        otpInputRefs.current[nextIndex]?.focus();
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
             disabled={showOtpInput}
             className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all ${
               activeTab === 'login' 
                 ? 'text-primary border-b-2 border-primary bg-background' 
                 : 'text-muted-foreground hover:text-foreground hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed'
             }`}
           >
             {t('navLogin')}
           </button>
           <button
             onClick={() => toggleTab('signup')}
             disabled={showOtpInput}
             className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all ${
               activeTab === 'signup' 
                 ? 'text-primary border-b-2 border-primary bg-background' 
                 : 'text-muted-foreground hover:text-foreground hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed'
             }`}
           >
             {t('createAccountBtn')}
           </button>
        </div>

        {/* Padding reduced on mobile (p-5) to accommodate wide OTP input, p-8 on larger screens */}
        <div className="p-5 sm:p-8 space-y-6">
          
          {/* Social Login (Available on both tabs, hidden during OTP verification) */}
          {!showOtpInput && (
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
          )}

          {/* Divider */}
          {!showOtpInput && (
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
          )}

          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            
            {/* Standard Signup Fields - Hidden when showing OTP input */}
            {!showOtpInput && (
                <>
                    {activeTab === 'signup' && (
                        <div className="space-y-2">
                        <Label htmlFor="name">{t('fullName')}</Label>
                        <div className="relative group">
                            <Input 
                            id="name" 
                            type="text" 
                            required 
                            placeholder="John Doe"
                            className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
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
                        className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
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
                        className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                        <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    </div>
                </>
            )}

            {/* OTP Input - Only visible after signup submission */}
            {showOtpInput && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 py-6">
                     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-blue-800 dark:text-blue-300 mb-0.5">
                                {t('otpSentDesc')}
                            </p>
                            <p className="text-blue-700 dark:text-blue-400">
                                {t('spamAlert')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Label className="text-center block text-muted-foreground font-medium">{t('otpLabel')}</Label>
                        
                        {/* 
                           Updated OTP Container:
                           - 3-3 Layout
                           - Spacer after index 2
                           - 'p-0' and 'text-center' to fix text clipping
                        */}
                        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[340px] mx-auto" onPaste={handleOtpPaste}>
                             {[...Array(OTP_LENGTH)].map((_, idx) => (
                                <React.Fragment key={idx}>
                                    <Input
                                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={formData.otp[idx] || ''}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        className="flex-1 min-w-0 aspect-square h-auto text-center text-xl sm:text-2xl font-bold p-0 rounded-lg sm:rounded-xl border-2 focus:border-primary focus:ring-0 transition-all caret-primary shadow-sm bg-background flex items-center justify-center"
                                        autoComplete="off"
                                    />
                                    {/* Spacer between 3rd and 4th input (3-3 split) */}
                                    {idx === 2 && <div className="w-3 sm:w-6 shrink-0" />}
                                </React.Fragment>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={loading || googleLoading}
            >
              {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> {t('pleaseWait')}</span>
              ) : (
                  showOtpInput ? t('verifyBtn') : (activeTab === 'login' ? t('signInBtn') : t('createAccountBtn'))
              )}
            </Button>
            
            {showOtpInput && (
                 <button
                    type="button"
                    onClick={() => { setShowOtpInput(false); setError(''); }}
                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-2 p-2"
                 >
                     <ArrowLeft className="w-4 h-4" /> {t('backToListings').replace('listings', 'Signup')}
                 </button>
            )}
          </form>

          {!showOtpInput && (
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
