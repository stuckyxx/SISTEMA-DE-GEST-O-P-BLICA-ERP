
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

async function run() {
    try {
        const filePath = 'ATA DE REGISTRO DE PREÇOS  MATERIAL  LIMPEZA.pdf';

        // Read buffer
        const buffer = await fs.readFile(filePath);
        const uint8Array = new Uint8Array(buffer);

        // Suppress font warnings by providing standardFontDataUrl relative to node_modules
        // Assuming standard_fonts is in node_modules/pdfjs-dist/standard_fonts/
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/'
        });
        const pdf = await loadingTask.promise;

        let output = `PDF Loaded. Pages: ${pdf.numPages}\n`;

        // Read first 10 pages
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            output += `\n\n--- Page ${i} ---\n`;
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Joined with |
            output += "RAW ITEMS:\n";
            output += textContent.items.map(item => item.str).join('|') + "\n";

            // Joined with space
            output += "\nJOINED WITH SPACE:\n";
            output += textContent.items.map(item => item.str).join(' ') + "\n";
        }

        await fs.writeFile('output_debug.txt', output, 'utf-8');
        console.log("Output written to output_debug.txt");

    } catch (err) {
        console.error("Error:", err);
    }
}

run();
