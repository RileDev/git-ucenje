export const parseMarkdownToHtml = (markdown: string): string => {
  const lines = markdown.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      return `<h3 style="font-size: 14px; color: #002e80; margin: 15px 0 8px 0; font-weight: bold; border-bottom: 1px solid #d3e5fa; padding-bottom: 3px; font-family: 'Tahoma', sans-serif;">${trimmed.substring(4)}</h3>`;
    }
    if (trimmed.startsWith('## ')) {
      return `<h2 style="font-size: 16px; color: #002e80; margin: 18px 0 10px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${trimmed.substring(3)}</h2>`;
    }
    if (trimmed.startsWith('# ')) {
      return `<h1 style="font-size: 18px; color: #002e80; margin: 20px 0 12px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${trimmed.substring(2)}</h1>`;
    }

    const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: disc; font-size: inherit; line-height: 1.5; color: #333;">${bulletMatch[1]}</li>`;
    }

    const numberMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (numberMatch) {
      return `<li style="margin-left: 20px; margin-bottom: 6px; list-style-type: decimal; font-size: inherit; line-height: 1.5; color: #333;">${numberMatch[1]}</li>`;
    }

    if (trimmed === '') {
      return '<div style="height: 8px;"></div>';
    }

    return `<p style="margin-bottom: 8px; line-height: 1.5; font-size: inherit; color: #333;">${line}</p>`;
  });

  let html = processedLines.join('\n');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold; color: #002e80;">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f0f3fd; border: 1px solid #d3e2f9; border-radius: 3px; padding: 1.5px 5px; font-family: monospace; font-size: 0.9em; color: #c7254e; font-weight: bold;">$1</code>');

  return html;
};
