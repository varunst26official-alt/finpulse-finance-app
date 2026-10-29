/**
 * Quantra On-Device PDF Text Extractor
 * Extracts plain text from client-side PDF files with zero server transmission.
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Configure worker to null or disable worker for direct main-thread decoding
if (typeof window !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '';
}

export async function extractTextFromPdfArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useWorkerFetch: false,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pagesText: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str || '');
    pagesText.push(strings.join('\n'));
  }

  return pagesText.join('\n---PAGE---\n');
}
