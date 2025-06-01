
import React from 'react';
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = 'md',
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const content = (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {message && <span className="text-muted-foreground">{message}</span>}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {message && <span>{message}</span>}
      </div>
    );
  }

  return (
    <div className={`py-8 ${className}`}>
      {content}
    </div>
  );
};
