
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { getFlagEmoji } from '../utils/marketUtils';

interface CustomSelectProps {
  label: string;
  value: string;
  options: { code: string; name: string }[];
  onChange: (code: string) => void;
  showFlag?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  variant?: 'default' | 'compact';
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  options, 
  onChange, 
  showFlag, 
  searchable,
  searchPlaceholder = "Search...",
  placeholder = "Select an option...",
  variant = 'default',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.code === value);
  const isCompact = variant === 'compact';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable 
    ? options.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.code.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className={`font-black text-muted-foreground uppercase tracking-widest px-1 ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-muted/30 border text-foreground flex items-center justify-between hover:border-primary-500 transition-all shadow-inner ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-border'
        } ${
          isCompact ? 'rounded-xl px-3 py-2 text-xs font-medium' : 'rounded-2xl px-5 py-4 text-sm font-bold'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {showFlag && selectedOption && <span>{getFlagEmoji(selectedOption.code)}</span>}
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption?.name || placeholder}
          </span>
        </div>
        <ChevronDown size={isCompact ? 14 : 16} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-[200] mt-2 w-full bg-card border border-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/5 ${isCompact ? 'rounded-xl' : 'rounded-2xl'}`}>
          {searchable && (
            <div className="p-2 border-b border-border bg-muted/30">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-bold text-foreground focus:outline-none focus:border-primary-500/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map(option => (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  onChange(option.code);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full text-left flex items-center justify-between transition-all ${
                  isCompact ? 'px-3 py-2 text-[10px]' : 'px-5 py-3 text-xs'
                } font-bold ${
                  value === option.code 
                    ? 'bg-primary-500/10 text-primary-500' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  {showFlag && <span>{getFlagEmoji(option.code)}</span>}
                  <span>{option.name}</span>
                </div>
                {value === option.code && <Check size={12} className="text-primary-500" strokeWidth={3} />}
              </button>
            )) : (
              <div className="px-5 py-6 text-[10px] text-muted-foreground font-black uppercase text-center tracking-widest italic">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
