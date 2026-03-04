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
        // Search for Ã (U+00C3), ï (U+00EF),  (U+FFFD)
        if (content.includes('\u00C3') || content.includes('\u00EF') || content.includes('\uFFFD')) {
            console.log(`Found weird chars in: ${file}`);
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.includes('\u00C3') || line.includes('\u00EF') || line.includes('\uFFFD')) {
                    console.log(`Line ${idx + 1}: ${line.trim()}`);
                }
            });
        }
    } catch (e) {
        // ignore
    }
});
