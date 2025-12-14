
import React, { useState } from 'react';
import { Send, ArrowLeft, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { Brand, BrandReport } from '../types';
import { Card, Label, Textarea, Button, Select, Input } from './ui';
import { getCategoryTranslationKey } from '../translations';
import { useAuth } from '../contexts/AuthContext';

interface ReportBrandFormProps {
  brand: Brand;
  onBack: () => void;
  onRedirectLogin: () => void;
  t: (key: any) => string;
}

const ReportBrandForm: React.FC<ReportBrandFormProps> = ({ brand, onBack, onRedirectLogin, t }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const newReport: BrandReport = {
        id: Date.now().toString(),
        brandId: brand.id,
        brandName: brand.name,
        brandImage: brand.imageUrl,
        reason: formData.get('reason') as string,
        details: formData.get('details') as string,
        email: formData.get('email') as string || undefined,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };

    // Save to localStorage
    const existingReports = JSON.parse(localStorage.getItem('boycott_reports') || '[]');
    existingReports.unshift(newReport);
    localStorage.setItem('boycott_reports', JSON.stringify(existingReports));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  // @ts-ignore
  const categoryLabel = t(getCategoryTranslationKey(brand.category));

  if (!user) {
    return (
       <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in zoom-in duration-300">
        <Card className="p-10 text-center space-y-6 rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl">
           <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{t('loginRequired')}</h2>
            <p className="text-muted-foreground">{t('loginRequiredReportDesc')}</p>
          </div>
          <div className="space-y-3">
              <Button onClick={onRedirectLogin} className="w-full h-12 rounded-xl text-base">
                {t('navLoginSignup')}
              </Button>
              <Button onClick={onBack} variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                {t('cancel')}
              </Button>
          </div>
        </Card>
       </div>
    );
  }

  if (submitted) {
    return (
       <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in zoom-in duration-300">
        <Card className="p-12 text-center space-y-8 rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="mx-auto w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('reportReceived')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('reportThanks')}
            </p>
          </div>
          <Button onClick={onBack} variant="outline" className="w-full h-12 rounded-xl font-medium">
            {t('returnListings')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 pl-1"
      >
        <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
        </div>
        {t('backToListings')}
      </button>
      
      {/* Header & Context */}
      <div className="space-y-6 mb-8">
         <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                {t('reportIssueTitle')}
            </h2>
            <p className="text-muted-foreground text-lg">Help us maintain accurate information.</p>
         </div>

         {/* Context Card */}
         <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-border flex items-center gap-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 border border-border shadow-sm shrink-0 z-10">
                 <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-contain" />
             </div>
             <div className="z-10">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('target')}</p>
                 <h3 className="text-2xl font-bold text-foreground">{brand.name}</h3>
                 <p className="text-muted-foreground text-sm mt-0.5">{categoryLabel}</p>
             </div>
         </div>
      </div>

      <Card className="rounded-3xl border-border shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-card">
        <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          <div className="space-y-5">
            {/* Pre-filled Brand Name Field */}
            <div className="space-y-2">
                <Label htmlFor="brandNameInput">{t('brandName')}</Label>
                <Input 
                    id="brandNameInput" 
                    value={brand.name} 
                    disabled 
                    className="bg-slate-50 dark:bg-slate-800 text-muted-foreground border-border font-semibold h-12" 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">{t('whatIsIssue')} <span className="text-red-500">*</span></Label>
                <Select name="reason" id="reason" required defaultValue="" className="rounded-xl h-12">
                    <option value="" disabled>{t('selectReason')}</option>
                    <option value="incorrect_info">{t('reason_incorrect')}</option>
                    <option value="not_thai">{t('reason_not_thai')}</option>
                    <option value="closed">{t('reason_closed')}</option>
                    <option value="duplicate">{t('reason_duplicate')}</option>
                    <option value="other">{t('reason_other')}</option>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="details">{t('details')} <span className="text-red-500">*</span></Label>
                <Textarea 
                name="details"
                id="details" 
                required
                placeholder="Describe the inaccuracy or provide the correct information..." 
                className="min-h-[140px] rounded-xl p-4 leading-relaxed resize-none transition-colors"
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="email">{t('yourEmail')} <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Input name="email" id="email" type="email" placeholder="contact@email.com" className="rounded-xl h-12 transition-colors" />
            </div>
          </div>

          <div className="pt-2 flex flex-col md:flex-row gap-4">
             <Button 
                type="submit" 
                variant="destructive"
                className="flex-1 h-12 rounded-xl text-base font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all" 
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2 animate-pulse">Sending...</span>
              ) : (
                 <span className="flex items-center gap-2 justify-center"><Send className="w-4 h-4" /> {t('submitReport')}</span>
              )}
            </Button>
             <Button type="button" variant="ghost" onClick={onBack} className="flex-none h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800">{t('cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReportBrandForm;