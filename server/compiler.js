const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('./config');

/**
 * Recursively resolves all <!-- @include "path/to/file.html" --> directives
 */
function resolveIncludes(filePath, visited = new Set()) {
  if (visited.has(filePath)) {
    console.warn(`[Compiler] Circular include detected: ${filePath}`);
    return '';
  }
  visited.add(filePath);

  if (!fs.existsSync(filePath)) {
    console.error(`[Compiler] File not found: ${filePath}`);
    return `<!-- Missing include: ${filePath} -->`;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Match both <!-- @include "..." --> and <!-- @include '...' -->
  const includeRegex = /<!--\s*@include\s+["']([^"']+)["']\s*-->/g;

  content = content.replace(includeRegex, (match, relPath) => {
    const targetPath = path.isAbsolute(relPath) ? relPath : path.join(ROOT_DIR, relPath);
    return resolveIncludes(targetPath, new Set(visited));
  });

  return content;
}

/**
 * Compiles dashboard_template.html into complete HTML string
 */
function compileDashboardHtml() {
  const templatePath = path.join(ROOT_DIR, 'dashboard_template.html');
  if (!fs.existsSync(templatePath)) {
    const fallbackPath = path.join(ROOT_DIR, 'dashboard.html');
    return fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath, 'utf8') : '<h1>Dashboard not found</h1>';
  }

  const compiledHtml = resolveIncludes(templatePath);

  // Write compiled output to dashboard.html for static hosting/file access
  try {
    fs.writeFileSync(path.join(ROOT_DIR, 'dashboard.html'), compiledHtml, 'utf8');
  } catch (err) {
    console.error('[Compiler] Failed to write dashboard.html:', err);
  }

  return compiledHtml;
}

module.exports = {
  resolveIncludes,
  compileDashboardHtml
};
