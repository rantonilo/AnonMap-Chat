
import React from 'react';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  className?: string;
  disabled?: boolean;
}

const BrutalButton: React.FC<Props> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const bgColors = {
    primary: 'bg-brutal-yellow',
    secondary: 'bg-brutal-pink',
    accent: 'bg-brutal-green',
    danger: 'bg-red-500',
    outline: 'bg-white dark:bg-fb-surface'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        brutal-border brutal-shadow brutal-shadow-hover 
        px-6 py-4 font-black uppercase transition-all
        flex items-center justify-center gap-3
        text-black dark:text-white dark:[&:not(.bg-white):not(.dark\:bg-fb-surface)]:text-black
        leading-none
        ${bgColors[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'active:translate-x-1 active:translate-y-1 active:shadow-none'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default BrutalButton;
