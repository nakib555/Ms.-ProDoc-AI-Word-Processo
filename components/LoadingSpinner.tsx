
import React from 'react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number | string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "w-8 h-8", size, ...props }) => {
  return (
    <div className={className} {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
        <circle 
          cx="24" 
          cy="24" 
          r="16" 
          fill="none" 
          stroke="#4f46e5"
          strokeWidth="4.5" 
          strokeLinecap="round" 
          strokeDasharray="80 100" 
          strokeDashoffset="0"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 24 24" 
            to="360 24 24" 
            dur="2.5s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="stroke-dashoffset" 
            values="0; -180" 
            dur="2.5s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="stroke" 
            dur="10s" 
            repeatCount="indefinite" 
            values="#f87171; #fb923c; #facc15; #4ade80; #22d3ee; #3b82f6; #818cf8; #e879f9; #f472b6; #f87171" 
          />
        </circle>
      </svg>
    </div>
  );
};
