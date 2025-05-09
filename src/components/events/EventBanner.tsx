
import React from 'react';

interface EventBannerProps {
  title: string;
  meta?: Record<string, any> | null;
  fallbackColor?: string;
}

export const EventBanner = ({ title, meta, fallbackColor = '#4f46e5' }: EventBannerProps) => {
  const getBannerStyle = () => {
    if (!meta) return { backgroundColor: fallbackColor };
    
    const { primaryColor, customBannerUrl } = meta as {
      primaryColor?: string;
      customBannerUrl?: string;
    };
    
    // Handle image loading errors by setting a background color
    return {
      backgroundColor: primaryColor || fallbackColor,
      backgroundImage: customBannerUrl ? `url(${customBannerUrl})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load:", e);
    e.currentTarget.style.display = 'none';
  };

  return (
    <div
      className="rounded-lg h-48 md:h-64 w-full flex items-center justify-center text-white relative overflow-hidden"
      style={getBannerStyle()}
    >
      {meta && (meta as any).customLogoUrl ? (
        <img 
          src={(meta as any).customLogoUrl} 
          alt={`${title} logo`}
          className="max-h-24 max-w-xs z-10"
          onError={handleImageError}
        />
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold px-6 text-center">
          {title}
        </h1>
      )}
    </div>
  );
};
