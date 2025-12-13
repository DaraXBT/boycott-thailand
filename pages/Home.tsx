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
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('status', 'approved');

        if (error || !data || data.length === 0) {
          if (error) console.warn('Supabase fetch failed, falling back to static data:', error);
          setAllBrands(BRANDS);
        } else {
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
            imageUrl: item.image_url || 'https://via.placeholder.com/150'
          }));
          
          setAllBrands(mappedBrands);
        }
      } catch (err) {
        console.error('Error in fetchBrands:', err);
        setAllBrands(BRANDS);
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
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleReport = (brand: Brand) => {
    navigate(`/report/${brand.id}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto mb-16 space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-semibold mb-4 backdrop-blur-sm bg-opacity-80">
           <AlertCircle className="w-4 h-4" /> {t('heroTag')}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {t('heroTitle1')} <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
            {t('heroTitle2')}
          </span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {t('heroDesc')}
        </p>
      </section>

      {/* Search & Filter Section */}
      <section className="mb-12 space-y-8">
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>
          <Input 
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-12 py-7 text-lg shadow-sm rounded-2xl border-slate-200 bg-white/90 backdrop-blur-sm focus-visible:ring-red-500 focus-visible:border-red-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'All' 
                ? 'bg-slate-900 text-white shadow-lg ring-2 ring-slate-900 ring-offset-2' 
                : 'bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t('allListings')}
          </button>
          {categories.filter(cat => cat !== Category.ALL).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-600 ring-offset-2' 
                  : 'bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </section>

      {/* Results Info */}
      <div ref={resultsRef} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-200/60 pb-4 scroll-mt-24">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {t('listingResults')}
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
          </h2>
          <span className="text-sm font-medium text-slate-500">
              {t('showingResults', { count: filteredBrands.length })}
          </span>
      </div>

      {/* Grid Layout */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onReport={handleReport} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t('noResultsTitle')}</h3>
          <p className="text-slate-500 mb-6">{t('noResultsDesc')}</p>
          <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
              {t('clearFilters')}
          </button>
        </div>
      )}
    </>
  );
};

export default HomePage;