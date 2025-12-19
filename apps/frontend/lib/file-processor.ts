import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy initialize to ensure env vars are loaded
function getGenAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set"
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

export type FileType = "image" | "pdf" | "json" | "text" | "unknown";

export interface ExtractedContent {
  text: string;
  type: FileType;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
  };
}

/**
 * Detect file type from MIME type and extension
 */
export function detectFileType(file: File): FileType {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Image types
  if (
    mimeType.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff"].includes(extension)
  ) {
    return "image";
  }

  // PDF
  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  // JSON
  if (mimeType === "application/json" || extension === "json") {
    return "json";
  }

  // Text
  if (
    mimeType.startsWith("text/") ||
    ["txt", "md", "markdown"].includes(extension)
  ) {
    return "text";
  }

  return "unknown";
}

/**
 * Extract text from image using Google Gemini Vision API
 */
async function extractTextFromImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";

    // Use Gemini Vision API for OCR
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType,
      },
    };

    const prompt =
      "Extract all text from this image. Return only the raw text content, preserving line breaks and structure. Do not add any explanations or formatting.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("[FileProcessor] Image OCR failed:", error);
    throw new Error(
      `Failed to extract text from image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extract text from PDF
 * Note: This is a simplified implementation. For production, consider using pdf-parse or pdfjs-dist
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // For now, we'll use Gemini Vision API to process PDF pages
    // In production, you'd want to use a proper PDF parsing library like pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const pdfPart = {
      inlineData: {
        data: base64,
        mimeType: "application/pdf",
      },
    };

    const prompt =
      "Extract all text content from this PDF document. Return only the raw text content, preserving structure and line breaks. Do not add any explanations.";

    const result = await model.generateContent([prompt, pdfPart]);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("[FileProcessor] PDF parsing failed:", error);
    throw new Error(
      `Failed to extract text from PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extract text from JSON file
 */
async function extractTextFromJSON(file: File): Promise<string> {
  try {
    const text = await file.text();
    const json = JSON.parse(text);

    // Convert JSON to a readable text format
    // This is a simple approach - you might want to customize based on your needs
    return JSON.stringify(json, null, 2);
  } catch (error) {
    console.error("[FileProcessor] JSON parsing failed:", error);
    throw new Error(
      `Failed to parse JSON file: ${
        error instanceof Error ? error.message : "Invalid JSON"
      }`
    );
  }
}

/**
 * Extract text from plain text file
 */
async function extractTextFromText(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    console.error("[FileProcessor] Text extraction failed:", error);
    throw new Error(
      `Failed to read text file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Main function to extract content from a file
 */
export async function extractContentFromFile(
  file: File
): Promise<ExtractedContent> {
  const fileType = detectFileType(file);

  if (fileType === "unknown") {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  let text: string;
  const metadata: ExtractedContent["metadata"] = {};

  switch (fileType) {
    case "image":
      text = await extractTextFromImage(file);
      break;
    case "pdf":
      text = await extractTextFromPDF(file);
      // Note: PDF page count would require proper PDF parsing library
      break;
    case "json":
      text = await extractTextFromJSON(file);
      break;
    case "text":
      text = await extractTextFromText(file);
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  metadata.wordCount = text
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return {
    text,
    type: fileType,
    metadata,
  };
}

/**
 * Extract board ID from Miro URL
 */
export function extractMiroBoardId(miroUrl: string): string | null {
  try {
    // Miro URLs can be in formats like:
    // https://miro.com/app/board/xxxxxxxxxxxxx/
    // https://miro.com/app/board/xxxxxxxxxxxxx/?moveToWidget=...
    // https://miro.com/app/board/uXjVGYoUDTk=/
    // Board IDs can include base64-like characters: letters, numbers, -, _, =
    const match = miroUrl.match(/miro\.com\/app\/board\/([a-zA-Z0-9_=-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
