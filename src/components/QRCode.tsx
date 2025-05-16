
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  className?: string;
}

// A simple QR code placeholder component
// In a real application, you would use a proper QR code library
const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  level = "L",
  includeMargin = false,
  className,
}) => {
  // Generate a base64 mock QR code image
  // This is just for demonstration purposes
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={className}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size} 
        height={size} 
        style={{
          backgroundColor: bgColor,
          display: 'block',
          maxWidth: '100%'
        }}
      />
    </div>
  );
};

export default QRCode;
