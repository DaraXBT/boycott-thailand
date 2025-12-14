

import React, { useState } from 'react';
import { ExternalLink, MapPin, Tag, Flag, Ban, Image as ImageIcon, FileText } from 'lucide-react';
import { Brand } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BrandCardProps {
  brand: Brand;
  onReport: (brand: Brand) => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onReport }) => {
  const { t, lang, getCategoryLabel } = useLanguage();
  const [imgError, setImgError] = useState(false);
  
  const categoryLabel = getCategoryLabel(brand.category);
  
  // Use localized string if available and language is Khmer, otherwise fallback to default/English
  const purpose = (lang === 'km' && brand.purposeKm) ? brand.purposeKm : brand.purpose;
  const location = (lang === 'km' && brand.locationKm) ? brand.locationKm : brand.location;
  const description = (lang === 'km' && brand.descriptionKm) ? brand.descriptionKm : brand.description;

  return (
    <div className="group h-full flex flex-row md:flex-col bg-white rounded-xl md:rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 hover:-translate-y-1 transition-all duration-300">
      
      {/* Logo Section */}
      <div className="relative w-32 sm:w-40 md:w-full md:h-40 bg-white p-3 md:p-4 flex items-center justify-center border-r md:border-r-0 md:border-b border-slate-50 overflow-hidden shrink-0">
         <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-50" />
         
         {imgError ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                <ImageIcon className="w-10 h-10 md:w-10 md:h-10" />
                <span className="text-[10px] md:text-[10px] font-medium uppercase tracking-wider hidden md:block">No Image</span>
            </div>
         ) : (
             <img 
                src={brand.imageUrl} 
                alt={brand.name} 
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                loading="lazy"
                onError={() => setImgError(true)}
             />
         )}
         
         <div className="absolute top-2 left-2 md:top-3 md:right-3 md:left-auto z-20 select-none scale-[0.7] md:scale-[0.85] origin-top-left md:origin-top-right">
            <div className="relative inline-flex group/badge">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-0 group-hover/badge:opacity-20 animate-ping duration-1000"></span>
                <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full shadow-[0_4px_12px_-3px_rgba(220,38,38,0.4)] ring-1 ring-white/20 hover:bg-red-700 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                    <Ban className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span className="text-[10px] font-extrabold tracking-widest uppercase font-sans">
                        {t('boycott')}
                    </span>
                </div>
            </div>
         </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow min-w-0">
          <div className="p-3 md:p-4 flex flex-col flex-grow gap-1.5 md:gap-2">
              <div className="flex flex-col gap-1.5 md:gap-1">
                 <div className="flex items-center">
                    <span className="px-2 py-0.5 md:px-2 md:py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-slate-200 truncate max-w-full">
                        {categoryLabel}
                    </span>
                 </div>
                 
                 <h3 className="text-base md:text-base font-bold text-slate-900 leading-tight group-hover:text-red-600 transition-colors font-sans line-clamp-2">
                    {brand.name}
                 </h3>
                 <p className="text-[10px] md:text-xs font-medium text-slate-500 flex items-center gap-1 md:gap-1.5">
                    <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{purpose}</span>
                 </p>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 md:line-clamp-3 font-sans mt-0.5 md:mt-1">
                 {description}
              </p>
          </div>

          <div className="px-3 py-2 md:px-4 md:py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto gap-2 md:gap-2">
              <div className="flex items-start gap-1.5 md:gap-1.5 text-slate-500 text-[10px] md:text-xs font-medium flex-1 overflow-hidden">
                 <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-400 mt-0.5 shrink-0" />
                 <span className="leading-snug truncate">{location}</span>
              </div>

              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                 {brand.website && (
                    <a 
                      href={`https://${brand.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 md:p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:shadow-sm transition-all duration-200 group/btn"
                      aria-label={t('website')}
                    >
                        <ExternalLink className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                    </a>
                 )}
                 {brand.evidenceUrl && (
                     <a
                       href={brand.evidenceUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-1.5 md:p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group/btn"
                       aria-label={t('viewEvidence')}
                       title={t('viewEvidence')}
                     >
                         <FileText className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                     </a>
                 )}
                 <button
                    onClick={() => onReport(brand)}
                    className="p-1.5 md:p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:shadow-sm transition-all duration-200 group/btn"
                    aria-label={t('reportIssue')}
                 >
                    <Flag className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                 </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BrandCard;