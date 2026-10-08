import React from 'react';

export const Logo = ({ className = "h-8 text-foreground", showText = true }) => {
  if (showText) {
    return (
      <svg className={className} viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8 L12 40" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M12 24 L30 40" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" opacity=".28" />
        <path d="M12 24 L28 9" stroke="#4F8EFF" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M21 8 L28 9 L27 16" stroke="#4F8EFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="44" y="32" fontFamily="Geist, -apple-system, sans-serif" fontSize="26" fontWeight="700" letterSpacing="-1.2" fill="currentColor">kriya</text>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 6 L13 42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M13 24 L33 42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity=".28" />
      <path d="M13 24 L31 7" stroke="#4F8EFF" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 6 L31 7 L30 15" stroke="#4F8EFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
};
