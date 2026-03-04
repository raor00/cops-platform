const fs = require('fs');
const path = require('path');

const replacements = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã\x81': 'Á',
    'Ã\x89': 'É',
    'Ã\x8D': 'Í',
    'Ã\x93': 'Ó',
    'Ã\x9A': 'Ú',
    'Ã\x91': 'Ñ',
    'Ã': 'í',  // \xAD might be swallowed by editor, we must be careful with generic Ã
    'ï¿½': 'ó' // often replace character, but maybe dangerous
};

// Safe specific replacements:
const safeReplacements = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã\xAD': 'í', // í
    'Ã\x81': 'Á',
    'Ã\x89': 'É',
    'Ã\x8D': 'Í',
    'Ã\x93': 'Ó',
    'Ã\x9A': 'Ú',
    'Ã\x91': 'Ñ'
};

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git') && !file.includes('dist') && !file.includes('build')) {
                results = results.concat(walkDir(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirPath = 'c:/Users/CANVAS HALLANDALE 3/Downloads/Proyectos/cops-platform/cops-platform';
const files = walkDir(dirPath);

let totalChanged = 0;
files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // Manual override for known word forms to be safe since single character 'Ã' might be risky
        const specificWords = [
            ['contraseÃ±a', 'contraseña'],
            ['electrÃ³nico', 'electrónico'],
            ['invÃ¡lido', 'inválido'],
            ['invÃ¡lida', 'inválida'],
            ['telÃ©fono', 'teléfono'],
            ['cÃ©dula', 'cédula'],
            ['direcciÃ³n', 'dirección'],
            ['descripciÃ³n', 'descripción'],
            ['tÃ©cnico', 'técnico'],
            ['soluciÃ³n', 'solución'],
            ['mÃ©todo', 'método'],
            ['INSPECCIÃ“N', 'INSPECCIÓN'],
            ['creaciÃ³n', 'creación'],
            ['actualizaciÃ³n', 'actualización'],
            ['nÃºmero', 'número'],
            ['mÃ¡s', 'más'],
            ['AÃ±adir', 'Añadir'],
            ['CÃ³digo', 'Código'],
            ['TÃ©rminos', 'Términos'],
            ['configuraciÃ³n', 'configuración'],
            ['Ã³', 'ó'],
            ['Ã¡', 'á'],
            ['Ã©', 'é'],
            ['Ãº', 'ú'],
            ['Ã±', 'ñ'],
            ['Ã\xAD', 'í'],
            ['Ã\x81', 'Á'],
            ['Ã\x89', 'É'],
            ['Ã\x8D', 'Í'],
            ['Ã\x93', 'Ó'],
            ['Ã\x9A', 'Ú'],
            ['Ã\x91', 'Ñ']
        ];

        specificWords.forEach(([bad, good]) => {
            if (content.includes(bad)) {
                content = content.split(bad).join(good);
                changed = true;
            }
        });

        // Special case for 'í' which often appears as just Ã followed by a unprintable
        // We will just do a sweeping replace for the common specific words and that's enough
        // Let's also check for ï¿½ missing letters

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Fixed encoding in ${file}`);
            totalChanged++;
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
});
console.log(`Total files fixed: ${totalChanged}`);
