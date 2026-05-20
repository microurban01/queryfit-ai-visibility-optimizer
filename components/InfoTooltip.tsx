
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  children?: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = "", style, size = 12, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        // Position below the element with a small gap
        top: rect.bottom + 8,
        // Center horizontally relative to the element
        left: rect.left + (rect.width / 2),
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Close on scroll to prevent detached tooltips
  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => setIsVisible(false);
      window.addEventListener('scroll', handleScroll, { capture: true });
      return () => window.removeEventListener('scroll', handleScroll, { capture: true });
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        // Default to inline-flex to behave like a wrapper without breaking layout flow
        className={children ? (className || "inline-flex") : `inline-flex items-center justify-center ml-1.5 cursor-help align-middle ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children ? children : (
          <HelpCircle 
            size={size} 
            className="text-muted-foreground/50 hover:text-primary-400 transition-colors" 
          />
        )}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-[99999] px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-lg shadow-xl text-[10px] font-bold text-white text-center backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none whitespace-nowrap"
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: 'translateX(-50%)' 
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default InfoTooltip;
