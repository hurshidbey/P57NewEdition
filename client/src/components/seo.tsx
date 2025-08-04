import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSEO = {
  title: 'P57 - Sun\'iy Intellekt O\'rganish Platformasi',
  description: 'ChatGPT va AI dan professional foydalanishni o\'rganing. 57 ta protokol, 50+ premium prompt. Bir martalik to\'lov - umrbod foydalanish.',
  keywords: 'AI, ChatGPT, sun\'iy intellekt, prompt, o\'zbek tilida, AI o\'rganish, prompt engineering',
  image: 'https://app.p57.uz/og-image.png',
  url: 'https://app.p57.uz',
  type: 'website'
};

export function SEO({ 
  title = defaultSEO.title, 
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = defaultSEO.type
}: SEOProps) {
  const fullTitle = title === defaultSEO.title ? title : `${title} | P57`;

  return (
    <Helmet>
      <html lang="uz" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="uz_UZ" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}