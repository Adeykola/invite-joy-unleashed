
import React, { useState } from 'react';

interface EventBannerProps {
  title: string;
  meta?: Record<string, any> | null;
  fallbackColor?: string;
}

export const EventBanner = ({ title, meta, fallbackColor = '#4f46e5' }: EventBannerProps) => {
  const [imageError, setImageError] = useState({
    logo: false,
    banner: false
  });
  
  const getBannerStyle = () => {
    if (!meta) return { backgroundColor: fallbackColor };
    
    const { primaryColor, customBannerUrl } = meta as {
      primaryColor?: string;
      customBannerUrl?: string;
    };
    
    // Only use banner image if URL exists and no image error has occurred
    if (customBannerUrl && !imageError.banner) {
      return {
        backgroundColor: primaryColor || fallbackColor,
        backgroundImage: `url(${customBannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Fallback to solid color
    return { backgroundColor: primaryColor || fallbackColor };
  };

  // Improved error handling function with more specific error tracking and recovery
  const handleImageError = (type: 'logo' | 'banner') => (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`${type} image failed to load:`, e.currentTarget.src);
    setImageError(prev => ({ ...prev, [type]: true }));
    
    // Set the image display to none if it fails to load
    e.currentTarget.style.display = 'none';
  };

  // Check if we have a valid logo URL and no previous error
  const shouldShowLogo = meta && (meta as any).customLogoUrl && !imageError.logo;

  return (
    <div
      className="rounded-lg h-48 md:h-64 w-full flex items-center justify-center text-white relative overflow-hidden shadow-md"
      style={getBannerStyle()}
      onError={() => setImageError(prev => ({ ...prev, banner: true }))}
    >
      {shouldShowLogo ? (
        <img 
          src={(meta as any).customLogoUrl} 
          alt={`${title} logo`}
          className="max-h-24 max-w-xs z-10 drop-shadow-lg"
          onError={handleImageError('logo')}
          loading="eager"
        />
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold px-6 text-center drop-shadow-md">
          {title}
        </h1>
      )}
    </div>
  );
};
