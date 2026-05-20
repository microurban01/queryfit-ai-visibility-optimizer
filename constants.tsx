
import React from 'react';
import { Engine } from './types';
import { 
  MessageSquare, 
  Sparkles, 
  Search, 
  Monitor, 
  Bot 
} from 'lucide-react';

export const ENGINE_METADATA: Record<Engine, { name: string, color: string, icon: React.ReactNode }> = {
  [Engine.CHATGPT]: { name: 'ChatGPT', color: '#10a37f', icon: <MessageSquare size={16} /> },
  [Engine.CLAUDE]: { name: 'Claude', color: '#d97757', icon: <Sparkles size={16} /> },
  [Engine.GEMINI]: { name: 'Gemini', color: '#4285f4', icon: <Search size={16} /> },
  [Engine.PERPLEXITY]: { name: 'Perplexity', color: '#20b2aa', icon: <Bot size={16} /> },
  [Engine.COPILOT]: { name: 'Copilot', color: '#00a4ef', icon: <Monitor size={16} /> },
};

export const MOCK_WORKSPACE_ID = 'ws-9821';

export const INDUSTRIES = [
  { code: 'Advertising', name: 'Advertising & Marketing' },
  { code: 'Aerospace', name: 'Aerospace & Defense' },
  { code: 'Agriculture', name: 'Agriculture & Farming' },
  { code: 'AI', name: 'Artificial Intelligence' },
  { code: 'Automotive', name: 'Automotive' },
  { code: 'Biotech', name: 'Biotech & Life Sciences' },
  { code: 'Business', name: 'Business Services' },
  { code: 'Electronics', name: 'Consumer Electronics' },
  { code: 'Consumer', name: 'Consumer Goods' },
  { code: 'Cybersecurity', name: 'Cybersecurity' },
  { code: 'Ecommerce', name: 'E-commerce & Retail' },
  { code: 'Education', name: 'Education & Training' },
  { code: 'Energy', name: 'Energy & Utilities' },
  { code: 'Engineering', name: 'Engineering & Construction' },
  { code: 'Entertainment', name: 'Entertainment & Media' },
  { code: 'Fintech', name: 'Financial Services & Fintech' },
  { code: 'Food', name: 'Food & Beverage' },
  { code: 'Gaming', name: 'Gaming' },
  { code: 'Government', name: 'Government & Public Sector' },
  { code: 'Healthcare', name: 'Healthcare & Medical' },
  { code: 'Hospitality', name: 'Hospitality & Travel' },
  { code: 'Insurance', name: 'Insurance' },
  { code: 'Logistics', name: 'Logistics & Supply Chain' },
  { code: 'Manufacturing', name: 'Manufacturing' },
  { code: 'NonProfit', name: 'Non-Profit' },
  { code: 'Professional', name: 'Professional Services' },
  { code: 'RealEstate', name: 'Real Estate' },
  { code: 'SaaS', name: 'SaaS & Software' },
  { code: 'Telecommunications', name: 'Telecommunications' },
  { code: 'Transportation', name: 'Transportation' },
  { code: 'Other', name: 'Other / Custom' }
].sort((a, b) => a.name.localeCompare(b.name));
