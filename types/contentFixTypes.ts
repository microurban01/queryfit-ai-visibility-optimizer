
export type FixContentKind = "text" | "html_snippet" | "jsonld" | "alt_texts" | "outline";

export type FixLocation =
  | "title"
  | "h1"
  | "meta_description"
  | "body_intro"
  | "body_section"
  | "faq_section"
  | "canonical_tag"
  | "schema_jsonld"
  | "image_alt";

export interface FixVariant {
  id: string;
  auditItemId: string;
  location: FixLocation;
  kind: FixContentKind;
  title: string;            // e.g. “Option 1: Benefit-led”
  whereToPaste: string;     // e.g. “Meta description”
  language: string;         // e.g. "en", "de"
  keyword: string;
  estimatedKeywordDensity: number; // 0–1
  content: string;          // the copy-paste content
  notes?: string;           // optional brief tip
}

export interface FixPack {
  auditItemId: string;
  url: string;
  language: string;
  keyword: string;
  createdAt: string;
  variants: FixVariant[]; // exactly 5
  cacheKey: string;       // url + keyword + auditItemId
}

export interface PageContent {
  url: string;
  html: string;
  language: string;  
  title?: string;
  metaDescription?: string;
  h1?: string;
  headings: { level: number; text: string }[];
  sections: { id: string; heading?: string; paragraphs: string[] }[];
  images: { src: string; alt?: string; contextText?: string }[];
  plainText: string;
  wordCount: number;
}
