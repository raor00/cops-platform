const fs = require('fs');

function fixSidebar() {
    const file = 'apps/tickets/components/layout/sidebar.tsx';
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Nav items classes
    content = content.replace(
        /"active bg-sky-500\/15 text-white border border-sky-500\/30 shadow-\[0_0_20px_rgba\(14,165,233,0\.12\)\]"/g,
        '"active bg-sky-50 text-sky-700 border border-sky-100"'
    );
    content = content.replace(
        /"text-white\/60 hover:bg-white\/10 hover:text-white"/g,
        '"text-slate-500 hover:bg-slate-50 hover:text-slate-900"'
    );

    // Section dividers
    content = content.replace(/bg-white\/10/g, 'bg-slate-200');
    content = content.replace(/text-white\/25/g, 'text-slate-400');

    // Background
    content = content.replace(
        /border-white\/8 bg-gradient-to-b from-\[#0d1117\]\/98 to-\[#111827\]\/99 backdrop-blur-2xl/g,
        'border-slate-200 bg-white'
    );

    // Logo area
    content = content.replace(/border-white\/10/g, 'border-slate-200');
    content = content.replace(/border-white\/15/g, 'border-slate-200');
    content = content.replace(/text-white/g, 'text-slate-800');

    // Avatar / Footer section
    content = content.replace(/ring-white\/20/g, 'ring-slate-200');
    content = content.replace(/text-white\/40/g, 'text-slate-500');
    content = content.replace(/text-white\/50/g, 'text-slate-600');
    content = content.replace(/text-white\/60/g, 'text-slate-600');

    // Buttons in footer
    content = content.replace(
        /"mt-1 w-full text-slate-600 hover:text-slate-800 hover:bg-slate-200/g,
        '"mt-1 w-full text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    );
    content = content.replace(
        /"mt-1 w-full text-slate-600 hover:text-red-400 hover:bg-red-500\/10/g,
        '"mt-1 w-full text-slate-500 hover:text-red-600 hover:bg-red-50'
    );

    // Collapse button
    content = content.replace(
        /border-white\/20 bg-\[#111827\] text-slate-600 hover:text-slate-800 hover:bg-slate-200/g,
        'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    );

    fs.writeFileSync(file, content);
    console.log('Fixed sidebar');
}

function fixHeader() {
    const file = 'apps/tickets/components/layout/header.tsx';
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    content = content.replace(/border-white\/10/g, 'border-slate-200');
    content = content.replace(/bg-\[#0e2f6f\]\/80 backdrop-blur-xl/g, 'bg-white backdrop-blur-md shadow-sm');
    content = content.replace(/text-white\/60 hover:text-white/g, 'text-slate-500 hover:text-slate-900');
    content = content.replace(/text-white\/40/g, 'text-slate-400');
    content = content.replace(/bg-white\/5 border-white\/10 focus:border-blue-500\/50/g, 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500');
    content = content.replace(/text-white\/80 hover:text-white/g, 'text-slate-700 hover:text-slate-900');
    content = content.replace(/text-white\/50/g, 'text-slate-500');

    // Fix 'text-white' to 'text-slate-900' but only for standalone text-white (we already replaced things like text-white/50)
    content = content.replace(/\btext-white\b/g, 'text-slate-900');

    fs.writeFileSync(file, content);
    console.log('Fixed header');
}

fixSidebar();
fixHeader();
