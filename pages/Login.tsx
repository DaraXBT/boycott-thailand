import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Input, Label, Button } from '../components/ui';

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        const { session } = await signup(formData.email, formData.password, formData.name);
        // If session is null, email confirmation is likely required
        if (!session) {
          setError(t('checkEmail'));
          setIsLogin(true); // Switch back to login mode so they can login after confirming
        } else {
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

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          {isLogin ? t('welcomeBack') : t('joinMovement')}
        </h2>
        <p className="text-slate-500">
          {isLogin ? t('signInDesc') : t('createAccountDesc')}
        </p>
      </div>

      <Card className="p-8 border-slate-200 shadow-xl bg-white rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  required 
                  placeholder="John Doe"
                  className="pl-10 h-12 rounded-xl"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <User className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <div className="relative">
              <Input 
                id="email" 
                type="email" 
                required 
                placeholder="name@example.com"
                className="pl-10 h-12 rounded-xl"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <Mail className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="pl-10 h-12 rounded-xl"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-semibold"
            disabled={loading}
          >
            {loading ? t('pleaseWait') : (isLogin ? t('signInBtn') : t('createAccountBtn'))}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
          >
            {isLogin ? t('noAccount') : t('hasAccount')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;