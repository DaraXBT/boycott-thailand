import React, { useState, useEffect } from 'react';
import { Send, ArrowLeft, CheckCircle2, ShieldAlert, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brand } from '../types';
import { Card, Label, Textarea, Button, Select, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const ReportPage: React.FC = () => {
  const { t, getCategoryLabel } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingBrand, setLoadingBrand] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
        if (!id) return;
        setLoadingBrand(true);
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                 setBrand({
                    id: data.id,
                    name: data.name,
                    category: data.category,
                    purpose: data.purpose,
                    purposeKm: data.purpose_km,
                    location: data.location,
                    locationKm: data.location_km,
                    website: data.website,
                    description: data.description,
                    descriptionKm: data.description_km,
                    imageUrl: data.image_url || 'https://via.placeholder.com/150'
                 });
            } else if (error) {
                console.error("Error fetching brand:", error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBrand(false);
        }
    };
    fetchBrand();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!brand) return;
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const reportData = {
        brand_id: brand.id,
        brand_name: brand.name,
        brand_image: brand.imageUrl,
        reason: formData.get('reason') as string,
        details: formData.get('details') as string,
        email: formData.get('email') as string || user?.email,
        status: 'pending',
    };

    try {
        const { error } = await supabase.from('reports').insert([reportData]);
        if (error) throw error;
        setSubmitted(true);
    } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit report');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loadingBrand) {
      return (
          <div className="flex justify-center items-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
      );
  }

  if (!brand) {
      return (
          <div className="text-center py-20">
              <p className="text-slate-500">Brand not found.</p>
              <Button onClick={() => navigate('/')} variant="outline" className="mt-4">Return Home</Button>
          </div>
      )
  }

  const categoryLabel = getCategoryLabel(brand.category);

  if (!user) {
    return (
       <div className="max-w-md mx-auto py-16 px-4 animate-in fade-in zoom-in duration-300">
        <Card className="p-10 text-center space-y-6 rounded-3xl border-slate-100 shadow-xl">
           <div className="mx-auto w-20 h-20 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{t('loginRequired')}</h2>
            <p className="text-slate-500">{t('loginRequiredReportDesc')}</p>
          </div>
          <div className="space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full h-12 rounded-xl text-base">
                {t('navLoginSignup')}
              </Button>
              <Button onClick={() => navigate(-1)} variant="ghost" className="w-full text-slate-500 hover:text-slate-900">
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
        <Card className="p-12 text-center space-y-8 rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="mx-auto w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('reportReceived')}</h2>
            <p className="text-slate-500 leading-relaxed">
              {t('reportThanks')}
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium">
            {t('returnListings')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-8 pl-1"
      >
        <div className="p-1.5 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
        </div>
        {t('backToListings')}
      </button>
      
      <div className="space-y-6 mb-8">
         <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                {t('reportIssueTitle')}
            </h2>
            <p className="text-slate-500 text-lg">Help us maintain accurate information.</p>
         </div>

         <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex items-center gap-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 border border-slate-200 shadow-sm shrink-0 z-10">
                 <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-contain" />
             </div>
             <div className="z-10">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('target')}</p>
                 <h3 className="text-2xl font-bold text-slate-900">{brand.name}</h3>
                 <p className="text-slate-500 text-sm mt-0.5">{categoryLabel}</p>
             </div>
         </div>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="brandNameInput" className="text-slate-700">{t('brandName')}</Label>
                <Input 
                    id="brandNameInput" 
                    value={brand.name} 
                    disabled 
                    className="bg-slate-50 text-slate-600 border-slate-200 font-semibold h-12" 
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason" className="text-slate-700">{t('whatIsIssue')} <span className="text-red-500">*</span></Label>
                <Select name="reason" id="reason" required defaultValue="" className="rounded-xl border-slate-200 focus:ring-red-500 h-12 bg-white">
                    <option value="" disabled>{t('selectReason')}</option>
                    <option value="incorrect_info">{t('reason_incorrect')}</option>
                    <option value="not_thai">{t('reason_not_thai')}</option>
                    <option value="closed">{t('reason_closed')}</option>
                    <option value="duplicate">{t('reason_duplicate')}</option>
                    <option value="other">{t('reason_other')}</option>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="details" className="text-slate-700">{t('details')} <span className="text-red-500">*</span></Label>
                <Textarea 
                name="details"
                id="details" 
                required
                placeholder="Describe the inaccuracy or provide the correct information..." 
                className="min-h-[140px] rounded-xl border-slate-200 focus:ring-red-500 p-4 leading-relaxed resize-none focus:bg-white transition-colors"
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">{t('yourEmail')} <span className="text-slate-400 text-xs font-normal">(Optional)</span></Label>
                <Input name="email" id="email" type="email" placeholder="contact@email.com" className="rounded-xl border-slate-200 focus:ring-red-500 h-12 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="pt-2 flex flex-col md:flex-row gap-4">
            {errorMsg && (
                 <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                     <AlertCircle className="w-4 h-4" /> {errorMsg}
                 </div>
             )}
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
             <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-none h-12 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">{t('cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReportPage;