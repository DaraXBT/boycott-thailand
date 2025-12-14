
import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Globe, Image as ImageIcon, MapPin, Tag, Building2, Info, Lock, Languages, FileText } from 'lucide-react';
import { Category } from '../types';
import { Card, Input, Label, Textarea, Button, Select } from './ui';
import { getCategoryTranslationKey } from '../translations';
import { useAuth } from '../contexts/AuthContext';

interface SubmitBrandFormProps {
  t: (key: any) => string;
  onRedirectLogin: () => void;
}

const SubmitBrandForm: React.FC<SubmitBrandFormProps> = ({ t, onRedirectLogin }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Extract form data
    const formData = new FormData(e.currentTarget);
    const newSubmission = {
      id: Date.now().toString(),
      name: formData.get('brandName') as string,
      category: formData.get('category') as Category,
      purpose: formData.get('purpose') as string,
      location: formData.get('location') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string,
      imageUrl: (formData.get('logoUrl') as string) || 'https://via.placeholder.com/150',
      evidenceUrl: (formData.get('evidenceUrl') as string) || '',
      status: 'pending',
      submissionDate: new Date().toISOString(),
      submittedBy: user?.email || 'Anonymous',
      // Store Khmer specific fields
      purposeKm: (formData.get('purposeKm') as string) || (formData.get('purpose') as string),
      locationKm: (formData.get('locationKm') as string) || (formData.get('location') as string),
      descriptionKm: (formData.get('descriptionKm') as string) || (formData.get('description') as string),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('boycott_submissions') || '[]');
    existing.unshift(newSubmission);
    localStorage.setItem('boycott_submissions', JSON.stringify(existing));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (!user) {
    return (
       <div className="max-w-md mx-auto py-16 px-4">
        <Card className="p-10 text-center space-y-6 rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl">
           <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{t('loginRequired')}</h2>
            <p className="text-muted-foreground">{t('loginRequiredDesc')}</p>
          </div>
          <Button onClick={onRedirectLogin} className="w-full h-12 rounded-xl text-base">
            {t('navLoginSignup')}
          </Button>
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
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('submissionReceived')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('submissionThanks')}
            </p>
          </div>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full h-12 rounded-xl font-medium">
            {t('submitAnother')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-slate-100/10 mb-2">
            <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{t('submitBrand')}</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          {t('submitDesc')}
        </p>
      </div>

      <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card">
        <div className="h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-700 dark:via-slate-500 dark:to-slate-700" />
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Tag className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Brand Identity</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brandName">{t('brandName')} <span className="text-red-500">*</span></Label>
                  <Input name="brandName" id="brandName" placeholder="e.g. Café Amazon" required className="rounded-xl h-11" />
                </div>
                
                <div className="space-y-2">
                   <Label htmlFor="category">{t('category')} <span className="text-red-500">*</span></Label>
                   <Select name="category" id="category" required defaultValue="" className="rounded-xl h-11">
                      <option value="" disabled>{t('selectCategory')}</option>
                      {Object.values(Category).filter(c => c !== 'All').map((cat) => (
                        // @ts-ignore
                        <option key={cat} value={cat}>{t(getCategoryTranslationKey(cat))}</option>
                      ))}
                   </Select>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="website">{t('officialWebsite')}</Label>
                    <div className="relative">
                        <Input name="website" id="website" type="text" placeholder="e.g. example.com" className="rounded-xl pl-10 h-11" />
                        <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="logoUrl">{t('logoUrl')} <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                    <div className="relative">
                        <Input name="logoUrl" id="logoUrl" type="url" placeholder="https://..." className="rounded-xl pl-10 h-11" />
                        <ImageIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                 </div>
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="evidenceUrl">{t('evidenceUrl')} <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <div className="relative">
                    <Input name="evidenceUrl" id="evidenceUrl" type="url" placeholder="https://..." className="rounded-xl pl-10 h-11" />
                    <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                </div>
             </div>
          </div>

          {/* Section 2: English Details */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Info className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">{t('englishDetails')}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="purpose">{t('purpose')} <span className="text-red-500">*</span></Label>
                    <Input name="purpose" id="purpose" placeholder="e.g. Coffee Chain" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">{t('presence')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Input name="location" id="location" placeholder="e.g. Nationwide" required className="rounded-xl pl-10 h-11" />
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="description">{t('additionalDetails')} <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                <Textarea 
                  name="description"
                  id="description" 
                  placeholder="Provide any additional context or proof of Thai ownership..." 
                  className="min-h-[120px] rounded-xl p-4 leading-relaxed"
                />
             </div>
          </div>

          {/* Section 3: Khmer Details (Optional) */}
          <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-border">
             <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">{t('khmerDetails')}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="purposeKm">{t('purpose')} <span className="text-muted-foreground text-xs font-normal">({t('optional')})</span></Label>
                    <Input name="purposeKm" id="purposeKm" placeholder="ឧ. ហាងកាហ្វេ" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="locationKm">{t('presence')} <span className="text-muted-foreground text-xs font-normal">({t('optional')})</span></Label>
                    <div className="relative">
                        <Input name="locationKm" id="locationKm" placeholder="ឧ. ទូទាំងប្រទេស" className="rounded-xl pl-10 h-11" />
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="descriptionKm">{t('additionalDetails')} <span className="text-muted-foreground text-xs font-normal">({t('optional')})</span></Label>
                <Textarea 
                  name="descriptionKm"
                  id="descriptionKm" 
                  placeholder="ផ្តល់ព័ត៌មានបន្ថែមជាភាសាខ្មែរ..." 
                  className="min-h-[120px] rounded-xl p-4 leading-relaxed"
                />
             </div>
          </div>

          {/* Action */}
          <div className="pt-4">
             <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-base font-semibold shadow-xl shadow-slate-900/10 dark:shadow-none hover:shadow-slate-900/20 transition-all active:scale-[0.98]" 
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 animate-pulse">{t('processing')}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> {t('submitButton')}
                </span>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
               <AlertCircle className="w-3 h-3" /> All submissions are reviewed by admins.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitBrandForm;