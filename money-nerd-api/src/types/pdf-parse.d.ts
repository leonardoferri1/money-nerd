declare module 'pdf-parse' {
  interface PDFParseOptions {
    version?: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions,
  ): Promise<PDFParseResult>;

  export = pdfParse;
}
