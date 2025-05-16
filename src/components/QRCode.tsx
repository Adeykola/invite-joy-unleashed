
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  level = "L",
  includeMargin = false,
  className,
}) => {
  return (
    <QRCodeCanvas
      value={value}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      level={level}
      includeMargin={includeMargin}
      className={className}
    />
  );
};

export default QRCode;
