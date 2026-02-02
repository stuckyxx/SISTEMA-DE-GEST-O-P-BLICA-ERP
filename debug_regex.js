
import fs from 'fs';

const content = fs.readFileSync('output_debug.txt', 'utf-8');

// The Regex from pdfParser.ts
const itemRegex = /(\d+)\s+(.+?)\s+([A-ZÀ-Ú0-9\.\-\s]+?)\s+(Cx|Und|Pct|Pacote|Fardo|Galão|Kg|Par|Litro|Metro|M\.|Unid|Frasco|Peça|Lata|Embalagem|Vidro|Bisnaga)\s+(\d+)\s+R\$\s*([\d\.,]+)\s+R\$\s*([\d\.,]+)/gi;

let match;
let count = 0;
while ((match = itemRegex.exec(content)) !== null) {
    count++;
    console.log(`Match ${count}:`);
    console.log(`  Item: ${match[1]}`);
    console.log(`  Desc: ${match[2].trim().substring(0, 20)}...`);
    console.log(`  Brand: ${match[3]}`);
    console.log(`  Unit: ${match[4]}`);
    console.log(`  Qty: ${match[5]}`);
    console.log(`  Price: ${match[6]}`);
    console.log(`  Total: ${match[7]}`);
}

console.log(`\nTotal Matches: ${count}`);
