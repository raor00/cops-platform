const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walkDir(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirPath = 'apps/cotizaciones';
const files = walkDir(dirPath);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
            // Find any character that is non-ASCII and NOT a standard Spanish accented character or common symbol
            const badMatch = line.match(/[^\x00-\x7FáéíóúÁÉÍÓÚñÑüÜ¿¡•·°–— \u00A0©]/g);
            if (badMatch) {
                console.log(`[WEIRD_CHAR] File: ${file}:${idx + 1} -> Chars: ${badMatch.join(' ')} -> Line: ${line.trim()}`);
            }
        });
    } catch (e) {
        console.error(`Could not read ${file}: ${e.message}`);
    }
});
