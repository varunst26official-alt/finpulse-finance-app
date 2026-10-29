/**
 * Quantra On-Device PDF Text Extractor
 * Extracts plain text from client-side PDF files with zero server transmission.
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Configure PDF.js worker: local same-origin asset with CDN fallback
if (typeof window !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export interface PdfExtractionOptions {
  password?: string;
  onPasswordNeeded?: () => Promise<string | null>;
}

export async function extractTextFromPdfArrayBuffer(
  buffer: ArrayBuffer,
  passwordOrOptions?: string | PdfExtractionOptions
): Promise<string> {
  const initialPassword =
    typeof passwordOrOptions === 'string' ? passwordOrOptions : passwordOrOptions?.password;
  const onPasswordNeeded =
    typeof passwordOrOptions === 'object' ? passwordOrOptions.onPasswordNeeded : undefined;

  // Clean candidate passwords (raw, UPPERCASE for Indian PAN, lowercase)
  const getCandidatePasswords = (pwd?: string): string[] => {
    if (!pwd || !pwd.trim()) return [''];
    const trimmed = pwd.trim();
    return Array.from(new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()]));
  };

  const candidates = getCandidatePasswords(initialPassword);
  let lastError: any = null;

  for (const candidatePwd of candidates) {
    try {
      const docInit: any = {
        data: new Uint8Array(buffer),
        isEvalSupported: false,
        useWorkerFetch: false,
        disableFontFace: true,
      };
      if (candidatePwd) {
        docInit.password = candidatePwd;
      }

      const loadingTask = pdfjsLib.getDocument(docInit);

      // Handle onPassword callback in case PDF.js prompts during decryption
      loadingTask.onPassword = (callback: (p: string) => void, _reason: number) => {
        if (candidatePwd) {
          callback(candidatePwd);
        } else {
          callback('');
        }
      };

      const pdfDoc = await loadingTask.promise;
      const pagesText: string[] = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str || '');
        pagesText.push(strings.join('\n'));
      }

      return pagesText.join('\n---PAGE---\n');
    } catch (err: any) {
      lastError = err;
      const isPasswordError =
        err?.name === 'PasswordException' ||
        err?.code === 1 || // NEED_PASSWORD
        err?.code === 2 || // INCORRECT_PASSWORD
        (err?.message && /password/i.test(err.message));

      if (!isPasswordError) {
        // Not a password error - fatal PDF error
        throw err;
      }
      // If it's a password error, loop to try next candidate
    }
  }

  // If all provided candidates failed and we have an onPasswordNeeded callback, ask user interactively
  if (
    onPasswordNeeded &&
    (lastError?.name === 'PasswordException' || /password/i.test(lastError?.message || ''))
  ) {
    const promptedPwd = await onPasswordNeeded();
    if (promptedPwd) {
      return extractTextFromPdfArrayBuffer(buffer, promptedPwd);
    }
  }

  throw lastError;
}
