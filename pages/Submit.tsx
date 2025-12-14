

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Globe, Image as ImageIcon, MapPin, Tag, Building2, Info, Lock, Languages, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { Card, Input, Label, Textarea, Button, Select } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const SubmitPage: React.FC = () => {
  const { t, getCategoryLabel } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    
    // Extract form data
    const formData = new FormData(e.currentTarget);
    
    const submissionData = {
      name: formData.get('brandName') as string,
      category: formData.get('category') as Category,
      purpose: formData.get('purpose') as string,
      location: formData.get('location') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string,
      image_url: (formData.get('logoUrl') as string) || '',
      evidence_url: (formData.get('evidenceUrl') as string) || '',
      status: 'pending',
      submitted_by: user?.email || 'Anonymous',
      purpose_km: (formData.get('purposeKm') as string) || (formData.get('purpose') as string),
      location_km: (formData.get('locationKm') as string) || (formData.get('location') as string),
      description_km: (formData.get('descriptionKm') as string) || (formData.get('description') as string),
    };

    try {
      const { error } = await supabase
        .from('brands')
        .insert([submissionData]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting brand:', error);
      setErrorMsg(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
       <div className="max-w-md mx-auto py-16 px-4">
        <Card className="p-10 text-center space-y-6 rounded-3xl border-slate-100 shadow-xl">
           <div className="mx-auto w-20 h-20 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{t('loginRequired')}</h2>
            <p className="text-slate-500">{t('loginRequiredDesc')}</p>
          </div>
          <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-xl text-base">
            {t('navLoginSignup')}
          </Button>
        </Card>
       </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in zoom-in duration-300">
        <Card className="p-12 text-center space-y-8 rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="mx-auto w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('submissionReceived')}</h2>
            <p className="text-slate-500 leading-relaxed">
              {t('submissionThanks')}
            </p>
          </div>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium">
            {t('submitAnother')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 mb-2">
            <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('submitBrand')}</h2>
        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
          {t('submitDesc')}
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <div className="h-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Tag className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Brand Identity</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-slate-700">{t('brandName')} <span className="text-red-500">*</span></Label>
                  <Input name="brandName" id="brandName" placeholder="e.g. Café Amazon" required className="rounded-xl border-slate-200 focus:ring-slate-900 h-11" />
                </div>
                
                <div className="space-y-2">
                   <Label htmlFor="category" className="text-slate-700">{t('category')} <span className="text-red-500">*</span></Label>
                   <Select name="category" id="category" required defaultValue="" className="rounded-xl border-slate-200 focus:ring-slate-900 h-11">
                      <option value="" disabled>{t('selectCategory')}</option>
                      {Object.values(Category).filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                      ))}
                   </Select>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="website" className="text-slate-700">{t('officialWebsite')}</Label>
                    <div className="relative">
                        <Input name="website" id="website" type="text" placeholder="e.g. example.com" className="rounded-xl border-slate-200 focus:ring-slate-900 pl-10 h-11" />
                        <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-slate-700">{t('logoUrl')} <span className="text-slate-400 text-xs font-normal">(Optional)</span></Label>
                    <div className="relative">
                        <Input name="logoUrl" id="logoUrl" type="url" placeholder="https://..." className="rounded-xl border-slate-200 focus:ring-slate-900 pl-10 h-11" />
                        <ImageIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                 </div>
             </div>
             
             <div className="space-y-2">
                <Label htmlFor="evidenceUrl" className="text-slate-700">{t('evidenceUrl')} <span className="text-slate-400 text-xs font-normal">({t('optional')})</span></Label>
                <div className="relative">
                    <Input name="evidenceUrl" id="evidenceUrl" type="url" placeholder="https://..." className="rounded-xl border-slate-200 focus:ring-slate-900 pl-10 h-11" />
                    <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Info className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t('englishDetails')}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="purpose" className="text-slate-700">{t('purpose')} <span className="text-red-500">*</span></Label>
                    <Input name="purpose" id="purpose" placeholder="e.g. Coffee Chain" required className="rounded-xl border-slate-200 focus:ring-slate-900 h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-700">{t('presence')} <span className="text-red-500">*</span></Label>
                    <div className="relative">
                        <Input name="location" id="location" placeholder="e.g. Nationwide" required className="rounded-xl border-slate-200 focus:ring-slate-900 pl-10 h-11" />
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">{t('additionalDetails')} <span className="text-slate-400 text-xs font-normal">(Optional)</span></Label>
                <Textarea 
                  name="description"
                  id="description" 
                  placeholder="Provide any additional context or proof of Thai ownership..." 
                  className="min-h-[120px] rounded-xl border-slate-200 focus:ring-slate-900 p-4 leading-relaxed"
                />
             </div>
          </div>

          <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Languages className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest">{t('khmerDetails')}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="purposeKm" className="text-slate-700">{t('purpose')} <span className="text-slate-400 text-xs font-normal">({t('optional')})</span></Label>
                    <Input name="purposeKm" id="purposeKm" placeholder="ឧ. ហាងកាហ្វេ" className="rounded-xl border-slate-200 focus:ring-slate-900 h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="locationKm" className="text-slate-700">{t('presence')} <span className="text-slate-400 text-xs font-normal">({t('optional')})</span></Label>
                    <div className="relative">
                        <Input name="locationKm" id="locationKm" placeholder="ឧ. ទូទាំងប្រទេស" className="rounded-xl border-slate-200 focus:ring-slate-900 pl-10 h-11" />
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="descriptionKm" className="text-slate-700">{t('additionalDetails')} <span className="text-slate-400 text-xs font-normal">({t('optional')})</span></Label>
                <Textarea 
                  name="descriptionKm"
                  id="descriptionKm" 
                  placeholder="ផ្តល់ព័ត៌មានបន្ថែមជាភាសាខ្មែរ..." 
                  className="min-h-[120px] rounded-xl border-slate-200 focus:ring-slate-900 p-4 leading-relaxed"
                />
             </div>
          </div>

          <div className="pt-4">
             {errorMsg && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> {errorMsg}
                 </div>
             )}
             <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-base font-semibold shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all active:scale-[0.98]" 
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
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
               <AlertCircle className="w-3 h-3" /> All submissions are reviewed by admins.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitPage;