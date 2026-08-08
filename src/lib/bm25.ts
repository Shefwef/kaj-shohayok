// BM25 (Best Match 25) full-text ranking — pure TypeScript, no dependencies
// Used for offline chatbot fallback when no Gemini API key is configured

const K1 = 1.5; // term frequency saturation
const B = 0.75; // document length normalization

export interface KnowledgeDoc {
  id: string;
  keywords: string; // what we search against (question phrasings + keywords)
  response: string; // what we return to the user
}

interface Index {
  docs: KnowledgeDoc[];
  tf: Map<string, Map<string, number>>; // docId → term → frequency
  df: Map<string, number>;              // term → # docs containing it
  avgLen: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function buildIndex(docs: KnowledgeDoc[]): Index {
  const tf = new Map<string, Map<string, number>>();
  const df = new Map<string, number>();
  let totalLen = 0;

  for (const doc of docs) {
    const terms = tokenize(doc.keywords);
    totalLen += terms.length;
    const freq = new Map<string, number>();
    const seen = new Set<string>();

    for (const term of terms) {
      freq.set(term, (freq.get(term) ?? 0) + 1);
      if (!seen.has(term)) {
        df.set(term, (df.get(term) ?? 0) + 1);
        seen.add(term);
      }
    }
    tf.set(doc.id, freq);
  }

  return { docs, tf, df, avgLen: totalLen / Math.max(docs.length, 1) };
}

function scoreDoc(index: Index, queryTerms: string[], docId: string): number {
  const N = index.docs.length;
  const docFreq = index.tf.get(docId);
  if (!docFreq) return 0;

  const docLen = Array.from(docFreq.values()).reduce((a, b) => a + b, 0);
  let total = 0;

  for (const term of queryTerms) {
    const freq = docFreq.get(term) ?? 0;
    const df = index.df.get(term) ?? 0;
    if (df === 0 || freq === 0) continue;

    const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
    const tf = (freq * (K1 + 1)) / (freq + K1 * (1 - B + B * (docLen / index.avgLen)));
    total += idf * tf;
  }

  return total;
}

export function bm25Search(index: Index, query: string, topK = 2): KnowledgeDoc[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return index.docs
    .map((doc) => ({ doc, score: scoreDoc(index, terms, doc.id) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.doc);
}
