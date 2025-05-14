
import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  color = '#000000', 
  bgColor = '#ffffff',
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      // Clear existing QR code
      while (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
      
      // Generate new QR code
      const qrCode = new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        dotsOptions: {
          color: color,
          type: 'rounded'
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          type: 'dot'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        }
      });
      
      qrCode.append(ref.current);
    }
  }, [value, size, color, bgColor]);
  
  return <div ref={ref} className={className} />;
};

export default QRCode;
