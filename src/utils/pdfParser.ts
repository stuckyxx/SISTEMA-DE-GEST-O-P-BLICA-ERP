import * as pdfjsLib from 'pdfjs-dist';
import { Ata, AtaItem } from '../types';

// Set worker source using Vite's ?url import to ensure it works locally and in build
// @ts-ignore - Vite handles this import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ParsedAtaData {
  ata: Partial<Ata>;
  items: AtaItem[];
  warnings: string[];
}

export const extractTextFromPDF = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const fullText: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText.push(pageText);
  }

  return fullText;
};

export const parseAtaPDF = async (file: File): Promise<ParsedAtaData> => {
  const pagesText = await extractTextFromPDF(file);
  const fullText = pagesText.join('\n'); // Join pages with newline for regex across pages if needed, or process page by page.

  // Actually, joining with a specific delimiter or just analyzing the array is safer.
  // Let's combine all text into one big string but try to preserve some structure (newlines).
  // The 'extractTextFromPDF' above joins items with space, which loses line breaks.
  // A better extraction strategy for table parsing: maintain item order.

  // Re-implement extraction to be more respectful of structure
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let layoutText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Simple join for now, regex will need to be robust
    const pageStr = textContent.items.map((item: any) => item.str).join(' ');
    layoutText += pageStr + "\n";
  }

  const result: ParsedAtaData = {
    ata: {},
    items: [],
    warnings: []
  };

  // 1. Extract Header Info
  // Processo nº: 068/2023
  const processoMatch = layoutText.match(/Processo\s*nº[:\.]?\s*([\d\/]+)/i);
  if (processoMatch) result.ata.processNumber = processoMatch[1].trim();

  // Modalidade: Pregão Eletrônico n° 010/2023
  const modalidadeMatch = layoutText.match(/Modalidade[:\.]?\s*([^\n]+?)(?=\s*Registro|$)/i);
  if (modalidadeMatch) {
    // Clean up bits if regex overshot
    let mod = modalidadeMatch[1].trim();
    // Sometimes "Registro de Preços" follows immediately
    if (mod.includes("Registro")) mod = mod.split("Registro")[0].trim();
    result.ata.modality = mod;
  }

  // Ano (Extract from Processo or Modalidade usually, or just assume current/date)
  if (result.ata.processNumber) {
    const parts = result.ata.processNumber.split('/');
    if (parts.length > 1) result.ata.year = parts[1];
  }

  // Objeto
  // "Objeto: REGISTRO DE PREÇOS PARA..." until "ATA DE REGISTRO" or "VALIDADE"
  const objetoMatch = layoutText.match(/Objeto[:\.]?\s*([\s\S]+?)(?=(ATA DE REGISTRO|VALIDADE))/i);
  if (objetoMatch) {
    result.ata.object = objetoMatch[1].trim().replace(/\s+/g, ' '); // Collapse detailed whitespace
  }

  // 2. Extract Supplier Info
  // "EMPRESA: A DE A RIBEIRO..."
  const supplierMatch = layoutText.match(/EMPRESA[:\.]?\s*([^\n]+)/i);
  // Need to match against existing suppliers or just flag it? 
  // For now, we won't auto-create suppliers, but we can return the name to warn user.
  // Implementation note: The form expects a supplierId. We can't easily find it without the list.
  // We'll leave supplierId empty but enable a warning message.
  if (supplierMatch) {
    result.warnings.push(`Fornecedor identificado no PDF: "${supplierMatch[1].trim()}". Verifique se já está cadastrado.`);
  }

  // 3. Extract Items by Lote
  // Strategy: Split text by "LOTE X" headers to isolate sections.
  // This prevents "LOTE X" from being misinterpreted as an item and allows correct lote assignment.

  // Regex to find Lote headers: LOTE <Number> OR Lote <Roman>
  // We capture the number/id.
  const loteSplitRegex = /(?:LOTE|Lote)\s+([0-9IVX]+)/gi;

  // We need to keep the delimiters to know which lote is which.
  // split with capture group includes the captures.
  // But reliable splitting with complex regex can be tricky. 
  // Let's use 'exec' to find indices and slice.

  const loteBlocks: { lote: string, text: string }[] = [];
  let lastIndex = 0;
  let currentLote = '1'; // Default if no lote found

  let matchLote;
  // Reset regex
  loteSplitRegex.lastIndex = 0;

  // Find all Lote occurrences
  const matches: { lote: string, index: number, length: number }[] = [];
  while ((matchLote = loteSplitRegex.exec(layoutText)) !== null) {
    matches.push({
      lote: matchLote[1],
      index: matchLote.index,
      length: matchLote[0].length
    });
  }

  if (matches.length === 0) {
    // No explicit Lote headers found, assume entire text is Lote 1
    loteBlocks.push({ lote: '1', text: layoutText });
  } else {
    // Process matches
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const nextM = matches[i + 1];
      const startParams = m.index + m.length;
      const endParams = nextM ? nextM.index : layoutText.length;

      const blockText = layoutText.substring(startParams, endParams);
      loteBlocks.push({ lote: m.lote, text: blockText });
    }
    // Note: text before the first "LOTE" header is ignored for item extraction 
    // (likely preamble), unless we want to valid items there too (defaulting to 1).
    // Usually preamble has no items.
  }

  // Regex for Items (Refined)
  // Added (?:^|\s) to Item Number to prevent matching "500" inside "2.500".
  // This ensures the Item Number is a distinct word.
  // We match [^\n]+? for description to be more permissive within the line, but strict on structure.
  const itemRegex = /(?:^|\s)(\d+)\s+([a-zA-ZÀ-Ú].+?)\s+([A-ZÀ-Ú0-9\.\-\s]+?)\s+(Cx|cx|Und|und|Pct|pct|Pacote|pacote|Fardo|fardo|Galão|galão|Kg|kg|Par|par|Litro|litro|Metro|metro|M\.|m\.|Unid|unid|Frasco|frasco|Peça|peça|Lata|lata|Embalagem|embalagem|Vidro|vidro|Bisnaga|bisnaga)\s+(\d+)\s+R\$\s*([\d\.,]+)\s+R\$\s*([\d\.,]+)/g;

  for (const block of loteBlocks) {
    // Scan items in this block
    let match;
    // Reset regex for each block string
    itemRegex.lastIndex = 0;

    while ((match = itemRegex.exec(block.text)) !== null) {
      const itemNumber = parseInt(match[1]);
      const fullDesc = match[2].trim();
      let brand = match[3].trim();
      const unit = match[4].trim();
      const quantity = parseInt(match[5]);
      const unitPrice = parseFloat(match[6].replace(/\./g, '').replace(',', '.'));
      const totalPrice = parseFloat(match[7].replace(/\./g, '').replace(',', '.'));

      let description = fullDesc;

      // Basic validation
      if (itemNumber > 0 && quantity > 0 && unitPrice > 0) {
        result.items.push({
          id: crypto.randomUUID(),
          itemNumber,
          lote: block.lote,
          description,
          brand,
          unit,
          quantity,
          unitPrice,
          totalPrice
        });
      }
    }
  }

  // Fallback/Correction: If regex failed significantly (few items found vs expected), 
  // we might need a better parser or notify user.
  if (result.items.length < 5) {
    result.warnings.push("Poucos itens foram identificados automaticamente. A estrutura do PDF pode ser diferente do esperado.");
  }

  return result;
};
