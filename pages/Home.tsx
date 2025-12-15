import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, AlertCircle, Loader2, Sparkles, Zap, 
  LayoutGrid, Wheat, Factory, Building, Hammer, Truck, 
  ShoppingBag, Utensils, Coffee, Car, Landmark, Briefcase, 
  Smartphone, Tv, GraduationCap, Stethoscope, Shirt, 
  Bed, Ticket, Armchair 
} from 'lucide-react';
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

  // Icon Mapping
  const categoryIcons: Record<string, React.ElementType> = {
    [Category.AGRICULTURE]: Wheat,
    [Category.MANUFACTURING]: Factory,
    [Category.REAL_ESTATE]: Building,
    [Category.CONSTRUCTION]: Hammer,
    [Category.ENERGY]: Zap,
    [Category.LOGISTICS]: Truck,
    [Category.RETAIL]: ShoppingBag,
    [Category.FOOD_BEVERAGE]: Utensils,
    [Category.CAFES_RESTAURANTS]: Coffee,
    [Category.AUTOMOTIVE]: Car,
    [Category.FINANCE]: Landmark,
    [Category.PROFESSIONAL_SERVICES]: Briefcase,
    [Category.ELECTRONICS]: Smartphone,
    [Category.MEDIA]: Tv,
    [Category.EDUCATION]: GraduationCap,
    [Category.HEALTHCARE]: Stethoscope,
    [Category.COSMETICS]: Sparkles,
    [Category.FASHION]: Shirt,
    [Category.HOSPITALITY]: Bed,
    [Category.ENTERTAINMENT]: Ticket,
    [Category.HOUSEHOLD_OFFICE]: Armchair,
  };

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
      <section className="text-center mx-auto mb-12 pt-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[500px] md:h-[500px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto space-y-6 px-4 md:px-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm font-bold mb-2 shadow-sm hover:shadow-md transition-all cursor-default">
            <AlertCircle className="w-4 h-4" /> {t('heroTag')}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] font-sans">
            {t('heroTitle1')} <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-600 dark:from-red-500 dark:via-red-400 dark:to-orange-500">
                {t('heroTitle2')}
            </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            {t('heroDesc')}
            </p>
        </div>

        {/* Full Width Campaign Banner Image */}
        <div className="mt-12 w-screen relative left-1/2 -translate-x-1/2">
            <div className="relative w-full overflow-hidden shadow-2xl group border-y border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                <img 
                    src="https://scontent.fpnh9-1.fna.fbcdn.net/v/t39.30808-6/597807787_2932214270308514_6893733743699882729_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=127cfc&_nc_ohc=VsMk11hyAl0Q7kNvwExCAzy&_nc_oc=AdliFpo8q4PROQU3yZqywM4TzkZT5QrPw2UZwV9imM3cMut3ao_B9tKslu9i9mQPiik&_nc_zt=23&_nc_ht=scontent.fpnh9-1.fna&_nc_gid=Mjhbkt7qXp69V5uB25WSdg&oh=00_Afmvwp3guT3R7MxMZzHtNIbzRspg92Jgfz8LMPHqFey4ZQ&oe=6944C101" 
                    alt="Boycott Campaign Banner" 
                    className="w-full h-auto object-cover max-h-[600px] bg-slate-100 dark:bg-slate-900"
                    loading="eager"
                />
            </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="mb-16 space-y-6 md:space-y-10">
        <div className="relative max-w-2xl mx-auto group z-10 px-4 md:px-0">
          <div className="absolute inset-y-0 left-0 pl-9 md:pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          </div>
          <Input 
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-14 py-8 text-lg shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 rounded-3xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl focus-visible:ring-red-500 focus-visible:border-red-500 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Scrollable Category Container */}
        <div className="relative w-full md:max-w-7xl md:mx-auto">
            {/* 
              Mobile: Full width scrolling (no parent padding constraint). 
              Padding applied to the scroll container (px-4) so items aren't flush to screen edge initially.
            */}
            <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-4 md:px-0">
            <button
                onClick={() => handleCategoryClick('All')}
                className={`group shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-3 ${
                selectedCategory === 'All' 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 scale-105 ring-2 ring-slate-900 dark:ring-slate-100' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105'
                }`}
            >
                <LayoutGrid className="w-4 h-4" />
                <div className={`w-px h-3.5 ${selectedCategory === 'All' ? 'bg-white/30 dark:bg-black/30' : 'bg-slate-200 dark:bg-slate-700'}`} />
                {t('allListings')}
            </button>
            
            {categories.filter(cat => cat !== Category.ALL).map((cat) => {
                const Icon = categoryIcons[cat] || AlertCircle;
                const isSelected = selectedCategory === cat;
                
                return (
                    <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`group shrink-0 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-3 ${
                        isSelected 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 scale-105 ring-2 ring-red-600 ring-offset-2 ring-offset-background' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105'
                    }`}
                    >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {/* Vertical Separator Line */}
                    <div className={`w-px h-3.5 ${isSelected ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    {getCategoryLabel(cat)}
                    </button>
                );
            })}
            </div>
            
            {/* Visual gradient hints for scrolling on mobile */}
            <div className="absolute top-0 bottom-4 left-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden pointer-events-none" />
            <div className="absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden pointer-events-none" />
        </div>
      </section>

      {/* Results Info */}
      <div ref={resultsRef} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-4 scroll-mt-28 px-4 md:px-0">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {t('listingResults')}
              {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
          </h2>
          <div className="flex items-center gap-4">
            {usingFallback && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900">
                    Offline Mode
                </span>
            )}
            <span className="text-sm font-bold text-muted-foreground">
                {t('showingResults', { count: filteredBrands.length })}
            </span>
          </div>
      </div>

      {/* Compact Comic Style Marquee */}
      <div className="mb-6 w-screen relative left-1/2 -translate-x-1/2">
        <div className="bg-yellow-400 border-y-2 border-black py-1 overflow-hidden relative shadow-sm z-20">
            {/* Stripe Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }} />
            
            <div className="flex select-none relative z-10">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-marquee whitespace-nowrap shrink-0 flex items-center">
                      <span className="mx-4 text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                        {/* Thunder Icon - White Fill, Black Stroke */}
                        <Zap className="w-4 h-4 fill-white text-black rotate-12" strokeWidth={2} />
                        <span>{t('localBrandsTitle')}</span>
                        {/* Thunder Icon - White Fill, Black Stroke */}
                        <Zap className="w-4 h-4 fill-white text-black rotate-12" strokeWidth={2} />
                        <span className="font-bold text-black/80">{t('localBrandsDesc')}</span>
                        {/* Star Icon - White Fill, Black Stroke */}
                        <Sparkles className="w-4 h-4 text-black fill-white -rotate-12" strokeWidth={2} />
                      </span>
                  </div>
                ))}
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 px-4 md:px-0">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onReport={handleReport} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-[2rem] border border-border shadow-xl shadow-slate-100/50 dark:shadow-none mx-4 md:mx-0">
          <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{t('noResultsTitle')}</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{t('noResultsDesc')}</p>
          <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
              className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
              {t('clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;