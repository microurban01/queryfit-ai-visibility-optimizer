
import { PageContent } from '../types/contentFixTypes';

export class PageContentService {
  
  static parse(url: string, html: string): PageContent {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Language Detection
    const htmlLang = doc.documentElement.lang;
    // Heuristic fallback if lang attribute is missing
    const bodyText = doc.body.innerText.slice(0, 1000);
    const language = htmlLang || (/[àâäéèêëîïôœùûüÿçÀÂÄÉÈÊËÎÏÔŒÙÛÜŸÇ]/.test(bodyText) ? 'fr' : 'en');

    // Metadata
    const title = doc.title;
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || undefined;
    const h1 = doc.querySelector('h1')?.innerText?.trim();

    // Headings
    const headings: { level: number; text: string }[] = [];
    doc.querySelectorAll('h1, h2, h3').forEach(el => {
      headings.push({
        level: parseInt(el.tagName.substring(1)),
        text: (el as HTMLElement).innerText.trim()
      });
    });

    // Content Sections (Heuristic: H2/H3 starts a section)
    const sections: { id: string; heading?: string; paragraphs: string[] }[] = [];
    let currentSection: { id: string; heading?: string; paragraphs: string[] } = { 
      id: 'intro', 
      heading: 'Introduction', 
      paragraphs: [] 
    };

    // Iterate through body children to approximate sections
    // Simplified: Getting significant paragraphs
    doc.body.querySelectorAll('p').forEach((p, idx) => {
      const text = p.innerText.trim();
      if (text.length > 40) { // Filter out tiny snippets
        currentSection.paragraphs.push(text);
      }
      // Every 3 paragraphs, or if we hit a header (logic simplified for DOM iteration limits)
      if (currentSection.paragraphs.length >= 3) {
        sections.push({ ...currentSection });
        currentSection = { id: `sect-${idx}`, heading: undefined, paragraphs: [] };
      }
    });
    if (currentSection.paragraphs.length > 0) sections.push(currentSection);

    // Images
    const images: { src: string; alt?: string; contextText?: string }[] = [];
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        images.push({
          src,
          alt: img.getAttribute('alt') || undefined,
          contextText: img.closest('figure')?.innerText || img.parentElement?.innerText?.slice(0, 100)
        });
      }
    });

    // Word Count & Plain Text
    const plainText = doc.body.innerText;
    const wordCount = plainText.split(/\s+/).length;

    return {
      url,
      html,
      language,
      title,
      metaDescription: metaDesc,
      h1,
      headings,
      sections,
      images,
      plainText,
      wordCount
    };
  }

  static calculateDensity(text: string, keyword: string): number {
    if (!text || !keyword) return 0;
    const wordCount = text.split(/\s+/).length;
    if (wordCount === 0) return 0;
    
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = (text.match(regex) || []).length;
    
    return matches / wordCount;
  }

  static async fetchOrFallback(url: string): Promise<string> {
    try {
      // In a real browser app without backend, this usually fails CORS unless resource allows it.
      // We attempt it, but expect to catch error.
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3s timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      
      if (!response.ok) throw new Error('Fetch failed');
      return await response.text();
    } catch (e) {
      // Return specific string to signal fallback UI
      return "FETCH_BLOCKED_CORS";
    }
  }
}
