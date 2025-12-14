

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category, Brand } from '../types';
import { Input } from '../components/ui';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { BRANDS } from '../constants';
import BrandCard from '../components/BrandCard';

const HomePage: React.FC = () => {
  const { t, getCategoryLabel } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error || !data) {
          throw error;
        }

        if (data.length > 0) {
          const mappedBrands: Brand[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category as Category,
            purpose: item.purpose,
            purposeKm: item.purpose_km,
            location: item.location,
            locationKm: item.location_km,
            website: item.website,
            description: item.description,
            descriptionKm: item.description_km,
            imageUrl: item.image_url || 'https://via.placeholder.com/150',
            evidenceUrl: item.evidence_url
          }));
          setAllBrands(mappedBrands);
        } else {
            // DB is connected but empty
            setAllBrands([]);
        }
        setUsingFallback(false);
      } catch (err) {
        console.warn('Supabase fetch failed or not configured, using static data.');
        setAllBrands(BRANDS);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((brand) => {
      const matchesSearch = 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (brand.purpose && brand.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || brand.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allBrands]);

  const categories = Object.values(Category);

  const handleCategoryClick = (category: Category | 'All') => {
    setSelectedCategory(category);
    // Smooth scroll to results if searching
    if (filteredBrands.length > 0 && window.scrollY > 400) {
        setTimeout(() => {
            if (resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    }
  };

  const handleReport = (brand: Brand) => {
    navigate(`/report/${brand.id}`);
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-16 space-y-6 pt-8 relative">
        {/* Decorative elements - Corrected to use max-w-[90vw] to prevent overflow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[500px] md:h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-700 text-sm font-bold mb-6 shadow-sm hover:shadow-md transition-all cursor-default">
            <AlertCircle className="w-4 h-4" /> {t('heroTag')}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 font-sans">
            {t('heroTitle1')} <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-600">
                {t('heroTitle2')}
            </span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            {t('heroDesc')}
            </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="mb-16 space-y-10">
        <div className="relative max-w-2xl mx-auto group z-10">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>
          <Input 
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-14 py-8 text-lg shadow-xl shadow-slate-200/40 rounded-3xl border-slate-200 bg-white/80 backdrop-blur-xl focus-visible:ring-red-500 focus-visible:border-red-500 transition-all hover:shadow-2xl hover:shadow-slate-200/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-5xl mx-auto">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
              selectedCategory === 'All' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-105'
            }`}
          >
            {t('allListings')}
          </button>
          {categories.filter(cat => cat !== Category.ALL).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-105'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </section>

      {/* Results Info */}
      <div ref={resultsRef} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200/60 pb-4 scroll-mt-28">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              {t('listingResults')}
              {isLoading && <Loader2 className="w-6 h-6 animate-spin text-slate-400" />}
          </h2>
          <div className="flex items-center gap-4">
            {usingFallback && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    Offline Mode
                </span>
            )}
            <span className="text-sm font-bold text-slate-500">
                {t('showingResults', { count: filteredBrands.length })}
            </span>
          </div>
      </div>

      {/* Grid Layout */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onReport={handleReport} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('noResultsTitle')}</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">{t('noResultsDesc')}</p>
          <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
              {t('clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;