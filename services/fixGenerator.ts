
import { PageContent, FixPack, FixVariant, FixLocation, FixContentKind } from '../types/contentFixTypes';
import { PageContentService } from './pageContentService';

export class FixGenerator {
  
  static generate(
    page: PageContent, 
    auditItemId: string, 
    auditCategory: string, // "Relevance", "Structure", "Technical"
    auditLabel: string,
    keyword: string
  ): FixPack {
    const variants: FixVariant[] = [];
    const baseId = `${auditItemId}-${Date.now()}`;

    // --- RELEVANCE FIXES ---
    if (auditLabel.includes('Page Title') && auditCategory === 'Relevance') {
      variants.push(...this.genTitleFixes(page, keyword, baseId));
    } else if (auditLabel.includes('H1') && auditCategory === 'Relevance') {
      variants.push(...this.genH1Fixes(page, keyword, baseId));
    } else if (auditLabel.includes('Page contains keyword') || auditLabel.includes('Body')) {
      variants.push(...this.genBodyFixes(page, keyword, baseId));
    }
    
    // --- STRUCTURE FIXES ---
    else if (auditLabel.includes('Meta Description')) {
      variants.push(...this.genMetaFixes(page, keyword, baseId));
    } else if (auditLabel.includes('Header hierarchy')) {
      variants.push(...this.genHeaderFixes(page, keyword, baseId));
    }

    // --- TECHNICAL FIXES ---
    else if (auditLabel.includes('Canonical')) {
      variants.push(...this.genCanonicalFixes(page, baseId));
    } else if (auditLabel.includes('Schema')) {
      variants.push(...this.genSchemaFixes(page, baseId));
    } else if (auditLabel.includes('Img Alt')) {
      variants.push(...this.genAltFixes(page, keyword, baseId));
    }

    // Fallback if no specific logic matched
    if (variants.length === 0) {
      variants.push(...this.genGenericFixes(page, keyword, baseId));
    }

    return {
      auditItemId,
      url: page.url,
      language: page.language,
      keyword,
      createdAt: new Date().toISOString(),
      variants: variants.slice(0, 5), // Ensure exactly 5
      cacheKey: `${page.url}-${keyword}-${auditItemId}`
    };
  }

  // --- GENERATORS ---

  private static genTitleFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    const oldTitle = page.title || "Page Title";
    // Templates that naturally include the keyword
    const templates = [
      (k: string) => `${k}: The Complete Guide (2024)`,
      (k: string) => `Best ${k} for Professionals - ${this.extractBrand(page)}`,
      (k: string) => `${k} Review: Features, Pricing & Pros`,
      (k: string) => `Why ${this.extractBrand(page)} is the Top ${k}`,
      (k: string) => `${k} | ${this.extractBrand(page)} Official Site`
    ];

    return templates.map((tmpl, idx) => ({
      id: `${baseId}-${idx}`,
      auditItemId: baseId,
      location: "title",
      kind: "text",
      title: `Option ${idx + 1}: ${['Guide', 'Professional', 'Review', 'Brand-First', 'Standard'][idx]}`,
      whereToPaste: "HTML <title> tag",
      language: page.language,
      keyword: kw,
      estimatedKeywordDensity: this.calcTitleDensity(tmpl(kw), kw),
      content: tmpl(kw)
    }));
  }

  private static genH1Fixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    const templates = [
      (k: string) => `The Ultimate ${k} Solution`,
      (k: string) => `Mastering ${k} in 2024`,
      (k: string) => `${k} Made Simple`,
      (k: string) => `Advanced ${k} Platform`,
      (k: string) => `${k} for Growing Teams`
    ];
    return templates.map((tmpl, idx) => ({
      id: `${baseId}-${idx}`,
      auditItemId: baseId,
      location: "h1",
      kind: "text",
      title: `Option ${idx + 1}: ${['Power', 'Modern', 'Simple', 'Tech', 'Benefit'][idx]}`,
      whereToPaste: "Main <h1> Heading",
      language: page.language,
      keyword: kw,
      estimatedKeywordDensity: 0.2, // H1 is short, usually high density relative to itself
      content: tmpl(kw)
    }));
  }

  private static genMetaFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    const brand = this.extractBrand(page);
    return Array.from({length: 5}).map((_, idx) => {
      const content = `Looking for the best ${kw}? ${brand} helps you scale faster with AI-driven insights. Try our top-rated ${kw} platform today.`;
      return {
        id: `${baseId}-${idx}`,
        auditItemId: baseId,
        location: "meta_description",
        kind: "text",
        title: `Option ${idx + 1}: ${['Action-Oriented', 'Question-Based', 'Feature-Led', 'Trust-Signal', 'Direct'][idx]}`,
        whereToPaste: '<meta name="description">',
        language: page.language,
        keyword: kw,
        estimatedKeywordDensity: 0.05,
        content: idx % 2 === 0 ? content : `${brand} offers a leading ${kw} that integrates seamlessly with your workflow. Get started with the #1 ${kw} now.`
      };
    });
  }

  private static genBodyFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    // Try to find a good section to rewrite
    const targetSection = page.sections.find(s => s.paragraphs.length > 0) || { paragraphs: ["Your content goes here."] };
    const originalText = targetSection.paragraphs.join("\n\n");
    
    // Simulate rewriting by injecting keyword naturally
    return Array.from({length: 5}).map((_, idx) => {
      const injected = this.injectKeywordNaturally(originalText, kw, idx);
      return {
        id: `${baseId}-${idx}`,
        auditItemId: baseId,
        location: "body_section",
        kind: "text",
        title: `Option ${idx + 1}: ${['Natural Flow', 'Benefit Focus', 'Authority Tone', 'Simplified', 'Expanded'][idx]}`,
        whereToPaste: "Body (First Section)",
        language: page.language,
        keyword: kw,
        estimatedKeywordDensity: PageContentService.calculateDensity(injected, kw),
        content: injected
      };
    });
  }

  private static genCanonicalFixes(page: PageContent, baseId: string): FixVariant[] {
    return [{
      id: `${baseId}-0`,
      auditItemId: baseId,
      location: "canonical_tag",
      kind: "html_snippet",
      title: "Self-Referencing Canonical",
      whereToPaste: "<head> section",
      language: "code",
      keyword: "",
      estimatedKeywordDensity: 0,
      content: `<link rel="canonical" href="${page.url}" />`
    }, {
      id: `${baseId}-1`,
      auditItemId: baseId,
      location: "canonical_tag",
      kind: "html_snippet",
      title: "Root Domain Canonical (if params exist)",
      whereToPaste: "<head> section",
      language: "code",
      keyword: "",
      estimatedKeywordDensity: 0,
      content: `<link rel="canonical" href="${page.url.split('?')[0]}" />`
    }];
  }

  private static genSchemaFixes(page: PageContent, baseId: string): FixVariant[] {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": page.title || "Product Name",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };
    return [{
      id: `${baseId}-0`,
      auditItemId: baseId,
      location: "schema_jsonld",
      kind: "jsonld",
      title: "SoftwareApplication Schema",
      whereToPaste: "<head> or <body>",
      language: "json",
      keyword: "",
      estimatedKeywordDensity: 0,
      content: `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`
    }];
  }

  private static genAltFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    // Generate alts for first 5 images or placeholders
    const images = page.images.slice(0, 5);
    if (images.length === 0) images.push({ src: 'placeholder.jpg' });

    return images.map((img, idx) => ({
      id: `${baseId}-${idx}`,
      auditItemId: baseId,
      location: "image_alt",
      kind: "alt_texts",
      title: `Image ${idx + 1} Alt Text`,
      whereToPaste: `<img> tag for ${img.src.split('/').pop()}`,
      language: page.language,
      keyword: kw,
      estimatedKeywordDensity: 0,
      content: `alt="${kw} dashboard view showing analytics"` // Simulated context
    }));
  }

  private static genHeaderFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    return [{
      id: `${baseId}-0`,
      auditItemId: baseId,
      location: "body_section",
      kind: "outline",
      title: "Corrected Semantic Hierarchy",
      whereToPaste: "Content Structure",
      language: page.language,
      keyword: kw,
      estimatedKeywordDensity: 0,
      content: `H1: ${kw} Overview\n  H2: Features\n    H3: Analytics\n    H3: Reporting\n  H2: Pricing`
    }];
  }

  private static genGenericFixes(page: PageContent, kw: string, baseId: string): FixVariant[] {
    return [{
      id: `${baseId}-0`,
      auditItemId: baseId,
      location: "body_section",
      kind: "text",
      title: "General Optimization",
      whereToPaste: "Page Content",
      language: page.language,
      keyword: kw,
      estimatedKeywordDensity: 0.01,
      content: `Ensure your content addresses "${kw}" clearly in the first 100 words.`
    }];
  }

  // --- HELPERS ---

  private static extractBrand(page: PageContent): string {
    if (page.title?.includes('|')) return page.title.split('|')[1].trim();
    if (page.title?.includes('-')) return page.title.split('-')[1].trim();
    return "BrandName";
  }

  private static calcTitleDensity(text: string, kw: string): number {
    return text.toLowerCase().includes(kw.toLowerCase()) ? 1 : 0;
  }

  private static injectKeywordNaturally(text: string, kw: string, mode: number): string {
    // Very simple simulation: prepend or append or replace based on mode
    const sentences = text.split('. ');
    if (sentences.length < 2) return `${kw} is essential. ${text}`;
    
    // Ensure we don't stuff. Check current density.
    const current = PageContentService.calculateDensity(text, kw);
    if (current > 0.02) return text; // Don't add more

    if (mode === 0) return `${kw} helps you succeed. ${text}`;
    if (mode === 1) return `${text} This is why ${kw} matters.`;
    
    // Inject in middle
    const mid = Math.floor(sentences.length / 2);
    sentences.splice(mid, 0, `When considering ${kw}, efficiency is key`);
    return sentences.join('. ');
  }
}
