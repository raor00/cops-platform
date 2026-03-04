const fs = require('fs');
const path = require('path');

function stripBOM(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        // Check for EF BB BF (UTF-8 BOM)
        if (content.length >= 3 && content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
            const stripped = content.slice(3);
            fs.writeFileSync(filePath, stripped);
            console.log(`Stripped BOM from ${filePath}`);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
        return false;
    }
}

function walkDir(dir) {
    let count = 0;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git') && !file.includes('dist')) {
                count += walkDir(file);
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.md')) {
                if (stripBOM(file)) {
                    count++;
                }
            }
        }
    });
    return count;
}

const dirPath = 'c:/Users/CANVAS HALLANDALE 3/Downloads/Proyectos/cops-platform/cops-platform';
const strippedCount = walkDir(dirPath);
console.log(`Total files stripped of BOM: ${strippedCount}`);
