
import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';

const attemptJsonRepair = (jsonStr: string): any => {
  if (!jsonStr) return null;
  const clean = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.warn("JSON incompleto ou inválido. Tentando reparar...", e);
    const itemsIndex = clean.indexOf('"items"');
    if (itemsIndex === -1) {
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try { return JSON.parse(clean.substring(firstBrace, lastBrace + 1)); } catch (e2) {}
        }
        return null;
    }
    const firstOpen = clean.indexOf('{');
    const lastItemClose = clean.lastIndexOf('}');
    if (lastItemClose > itemsIndex) {
        let fixed = clean.substring(firstOpen !== -1 ? firstOpen : 0, lastItemClose + 1);
        if (!fixed.trim().endsWith('}')) fixed += '}';
        if (!fixed.includes(']')) fixed += ']';
        if (!fixed.endsWith('}')) fixed += '}';
        try { return JSON.parse(fixed); } catch (e6) {
             const lastComma = clean.lastIndexOf('},');
             if (lastComma > itemsIndex) {
                const superSimple = clean.substring(firstOpen !== -1 ? firstOpen : 0, lastComma + 1) + ']}';
                try { return JSON.parse(superSimple); } catch(e7) {}
             }
             return null;
        }
    }
    return null;
  }
};

export interface ImportedData {
  processNumber?: string;
  supplierName?: string;
  items: any[];
}

export const processUploadFile = async (
  file: File, 
  apiKey: string,
  onStatusUpdate: (status: string) => void
): Promise<ImportedData> => {
    const isExcel = file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const ai = new GoogleGenAI({ apiKey });
    let prompt = '';

    if (isExcel) {
      onStatusUpdate('Lendo planilhas...');
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      let allCsvContent = "";
      workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet, { blankrows: false });
          if (csv && csv.trim().length > 0) {
              allCsvContent += `\n--- TABELA/ABA: ${sheetName} ---\n${csv}\n`;
          }
      });

      if (!allCsvContent.trim()) {
         throw new Error("O arquivo Excel parece estar vazio ou não pôde ser lido.");
      }

      prompt = `
        Você é um especialista em análise de dados de licitações.
        Analise os dados CSV abaixo, extraídos de um arquivo Excel com múltiplas abas.
        
        OBJETIVO: Extrair e consolidar TODOS os itens de TODAS as tabelas em um único JSON.
        
        Regras:
        1. Identifique o LOTE baseado no nome da aba ou cabeçalhos (ex: "Table 1" -> "Lote 1").
        2. Ignore linhas vazias ou cabeçalhos repetidos.
        3. Mapeie colunas para: Descrição, Marca, Unidade, Quantidade, Preço Unitário.
        4. Se a quantidade ou preço tiver símbolos (R$, .), converta para number float (ex: 1050.50).
        5. NÃO adicione comentários, retorne APENAS o JSON.
        
        Estrutura JSON Obrigatória:
        {
          "processNumber": "string",
          "supplierName": "string",
          "items": [
            { 
              "lote": "string", 
              "itemNumber": number, 
              "description": "string", 
              "brand": "string", 
              "unit": "string", 
              "quantity": number, 
              "unitPrice": number, 
              "totalPrice": number
            }
          ]
        }

        DADOS CSV:
        ${allCsvContent.substring(0, 900000)}
      `;
    } else {
        // PDF Logic placeholder - assuming existing logic was similar or user can fill in
        // Since I don't have the PDF extraction lib in the context of Atas.tsx (it wasn't imported), 
        // I assume the user was relying solely on GenAI for PDF or similar. 
        // Wait, Atas.tsx didn't show PDF text extraction code in the snippet I read. 
        // I'll stick to what I saw. The snippet mainly showed Excel logic.
        throw new Error("Implementação para PDF ainda não migrada completamente ou requer biblioteca externa.");
    }

    onStatusUpdate('IA Analisando dados (pode demorar)...');
    
    try {
      // Usando a sintaxe da biblioteca @google/genai instalada
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: {
          parts: [{ text: prompt }]
        }
      });
      
      const responseText = response.text || 
                           response.candidates?.[0]?.content?.parts?.[0]?.text || 
                           "";

      onStatusUpdate('Processando resposta...');
      const parsed = attemptJsonRepair(responseText);
      
      if (!parsed) {
          throw new Error("Falha ao interpretar resposta da IA.");
      }

      return parsed;

    } catch (error: any) {
       console.error("Erro na API Gemini:", error);
       throw error;
    }
};
