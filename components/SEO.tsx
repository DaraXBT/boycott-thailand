import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SEO = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    // Dynamic Title
    const title = lang === 'km' 
      ? 'បញ្ជីពហិការទំនិញថៃ - Boycott List Cambodia'
      : 'Boycott List Cambodia - Thai Brands & Franchises';
    
    document.title = title;

    // Dynamic Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descContent = lang === 'km'
      ? 'ស្វែងរកបញ្ជីឈ្មោះក្រុមហ៊ុនថៃ និងហ្វ្រេនឆាយដែលកំពុងរកស៊ីនៅកម្ពុជា។ ចូលរួមគាំទ្រផលិតផលខ្មែរ ដើម្បីសេដ្ឋកិច្ចជាតិ និងពង្រឹងស្មារតីជាតិនិយម។'
      : 'Discover the comprehensive directory of Thai brands and franchises operating in Cambodia. Join the movement to support local Khmer businesses and strengthen our economy.';
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descContent);
    } else {
      // Create if doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descContent;
      document.head.appendChild(meta);
    }

    // Dynamic OG Tags
    const updateMeta = (property: string, content: string) => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
            tag.setAttribute('content', content);
        } else {
            const meta = document.createElement('meta');
            meta.setAttribute('property', property);
            meta.content = content;
            document.head.appendChild(meta);
        }
    };

    const imageUrl = 'https://obpdgwpgftxbxokltzth.supabase.co/storage/v1/object/public/image/thief.png';
    const locale = lang === 'km' ? 'km_KH' : 'en_US';

    updateMeta('og:title', title);
    updateMeta('og:description', descContent);
    
    updateMeta('og:image', imageUrl);
    updateMeta('og:image:secure_url', imageUrl);
    updateMeta('og:image:type', 'image/png');
    updateMeta('og:image:alt', 'Boycott Thailand Thief Logo');
    
    updateMeta('og:locale', locale);
    updateMeta('og:site_name', 'Boycott List Cambodia');
    
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', descContent);
    updateMeta('twitter:image', imageUrl);

  }, [lang]);

  return null;
};

export default SEO;
