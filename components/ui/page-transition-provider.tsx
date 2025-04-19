// components/ui/page-transition-provider.tsx
"use client";

import { ReactNode, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Apply animations on path change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Apply fade-in animation
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    
    const timer = setTimeout(() => {
      container.style.transition = 'opacity 300ms, transform 300ms';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 50); // Small delay to ensure the initial state is applied
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  return (
    <div ref={containerRef} className="page-transition">
      {children}
    </div>
  );
}