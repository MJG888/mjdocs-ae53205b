import { supabase } from "@/integrations/supabase/client";

export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function getSignedUrl(documentId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-signed-url", {
    body: { documentId },
  });
  if (error || data?.error) {
    throw new Error(data?.error || error?.message || "Failed to get file link");
  }
  return data.signedUrl as string;
}

const DOWNLOADS_KEY = "mjdocs_downloads";

export function recordLocalDownload(documentId: string) {
  try {
    const stored = localStorage.getItem(DOWNLOADS_KEY);
    const history: { documentId: string; downloadedAt: string }[] = stored ? JSON.parse(stored) : [];
    const idx = history.findIndex((r) => r.documentId === documentId);
    const downloadedAt = new Date().toISOString();
    if (idx >= 0) history[idx].downloadedAt = downloadedAt;
    else history.unshift({ documentId, downloadedAt });
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(history));
  } catch {
    /* storage unavailable */
  }
}

const RECENTLY_VIEWED_KEY = "mjdocs_recently_viewed";

export function recordRecentlyViewed(documentId: string) {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: string[] = stored ? JSON.parse(stored) : [];
    const next = [documentId, ...list.filter((id) => id !== documentId)].slice(0, 8);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export function getRecentlyViewed(): string[] {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

/** Builds a readable fallback description so every document page has real content. */
export function buildDescription(doc: {
  title: string;
  description: string | null;
  long_description: string | null;
  subject_code: string | null;
  category: string | null;
  semester: string | null;
  doc_type: string;
  exam_type: string | null;
  exam_year: number | null;
  topics: string[] | null;
}): string {
  if (doc.long_description?.trim()) return doc.long_description;

  const isPaper = doc.doc_type === "question_paper";
  const subject = doc.category || doc.title;
  const code = doc.subject_code ? ` (${doc.subject_code})` : "";
  const sem = doc.semester ? ` for ${doc.semester}` : "";
  const topics = doc.topics?.length ? doc.topics.join(", ") : null;

  const paragraphs = [
    `${doc.title} is a ${isPaper ? "previous year question paper" : "complete set of study notes"} for ${subject}${code}${sem}, prepared and reviewed for students who want a reliable, exam-focused reference. ${doc.description?.trim() || ""}`.trim(),
    isPaper
      ? `This paper${doc.exam_year ? ` from ${doc.exam_year}` : ""}${doc.exam_type ? ` (${doc.exam_type})` : ""} shows the exact question pattern, weightage, and difficulty level you can expect in the actual examination. Working through it helps you understand how theory questions, numerical problems, and short-answer sections are distributed, so you can plan your time in the exam hall instead of discovering the structure on the day itself.`
      : `The notes are organised module by module so you can move through the syllabus in the same order it is taught. Each section starts with the core definitions and builds towards solved examples, which makes the material useful both for first-time learning and for a quick revision pass the night before an exam.`,
    topics
      ? `Key topics covered include ${topics}. Each of these is explained with the level of detail expected in university answer sheets, with emphasis on the points examiners typically look for.`
      : `The material covers the standard university syllabus for this subject, with emphasis on the topics that appear most frequently in examinations.`,
    `To get the most out of this ${isPaper ? "paper" : "document"}, read it alongside your classroom notes and your prescribed textbook. Attempt the questions on your own first, then verify your approach, and keep a separate sheet of formulas and definitions that you revise every few days. Students who combine notes with previous year papers consistently score better, because they practise recall rather than passive reading.`,
    `You can preview the file directly on this page before downloading, so you know exactly what you are getting. The download is free, requires no signup for browsing, and the file is served from secure storage. If you find a broken or incorrect file, use the report button on this page and we will fix it quickly.`,
  ];

  return paragraphs.join("\n\n");
}