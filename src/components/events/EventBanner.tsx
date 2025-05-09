
import React from 'react';

interface EventBannerProps {
  title: string;
  meta?: Record<string, any> | null;
}

export const EventBanner = ({ title, meta }: EventBannerProps) => {
  const getBannerStyle = () => {
    if (!meta) return {};
    
    const { primaryColor, customBannerUrl } = meta as {
      primaryColor?: string;
      customBannerUrl?: string;
    };
    
    return {
      backgroundColor: primaryColor || '#4f46e5',
      backgroundImage: customBannerUrl ? `url(${customBannerUrl})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  return (
    <div
      className="rounded-lg h-48 md:h-64 w-full flex items-center justify-center text-white"
      style={getBannerStyle()}
    >
      {meta && (meta as any).customLogoUrl ? (
        <img 
          src={(meta as any).customLogoUrl} 
          alt={`${title} logo`}
          className="max-h-24 max-w-xs"
        />
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold px-6 text-center">
          {title}
        </h1>
      )}
    </div>
  );
};
