import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 200, 
  color = '#3b82f6', // blue-500 for event QR codes!
  bgColor = '#ffffff' 
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
  
  return <div ref={ref} style={{ width: size, height: size }} />;
};

export default QRCode;
