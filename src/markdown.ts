export const parseMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for fenced code block start/end ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines
          .map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
          .join('\n');
        result.push(
          `<div class="xp-code-box"><pre style="margin: 0; font-family: inherit; font-size: inherit; color: inherit; line-height: 1.45; white-space: pre;"><code>${codeText}</code></pre></div>`
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Direct HTML elements - pass through without wrapping in <p>
    if (trimmed.startsWith('<div') || trimmed.startsWith('</div') || trimmed.startsWith('<table') || trimmed.startsWith('</table')) {
      result.push(rawLine);
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      result.push(
        `<h3 style="font-size: 13.5px; color: #002e80; margin: 12px 0 5px 0; font-weight: bold; border-bottom: 1px solid #d3e5fa; padding-bottom: 2px; font-family: 'Tahoma', sans-serif;">${formatInline(trimmed.substring(4))}</h3>`
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      result.push(
        `<h2 style="font-size: 15px; color: #002e80; margin: 14px 0 6px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${formatInline(trimmed.substring(3))}</h2>`
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      result.push(
        `<h1 style="font-size: 17px; color: #002e80; margin: 16px 0 8px 0; font-weight: bold; font-family: 'Tahoma', sans-serif;">${formatInline(trimmed.substring(2))}</h1>`
      );
      continue;
    }

    // Bullet lists
    const bulletMatch = trimmed.match(/^[\*\-]\s+(.*)/);
    if (bulletMatch) {
      result.push(
        `<li style="margin-left: 16px; margin-bottom: 4px; list-style-type: disc; line-height: 1.45; color: #1e293b;">${formatInline(bulletMatch[1])}</li>`
      );
      continue;
    }

    // Numbered lists
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      result.push(
        `<li style="margin-left: 16px; margin-bottom: 4px; list-style-type: decimal; line-height: 1.45; color: #1e293b;">${formatInline(numberMatch[2])}</li>`
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      result.push(
        `<blockquote style="margin: 6px 0; padding: 5px 10px; background-color: #f0f7ff; border-left: 3px solid #3b82f6; font-style: italic; color: #334155; border-radius: 0 4px 4px 0;">${formatInline(trimmed.substring(2))}</blockquote>`
      );
      continue;
    }

    // Empty lines
    if (trimmed === '') {
      result.push('<div style="height: 5px;"></div>');
      continue;
    }

    // Regular paragraph
    result.push(
      `<p style="margin-bottom: 6px; line-height: 1.45; color: #1e293b;">${formatInline(rawLine)}</p>`
    );
  }

  // Close unclosed code block if any
  if (inCodeBlock && codeBlockLines.length > 0) {
    const codeText = codeBlockLines
      .map(l => l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      .join('\n');
    result.push(
      `<div class="xp-code-box"><pre style="margin: 0; font-family: inherit; font-size: inherit; color: inherit; line-height: 1.45; white-space: pre;"><code>${codeText}</code></pre></div>`
    );
  }

  return result.join('\n');
};

const formatInline = (text: string): string => {
  let formatted = text;

  // Bold **text**
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold; color: #002e80;">$1</strong>');
  
  // Italics *text* (when not part of a list or bold)
  formatted = formatted.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');

  // Inline code `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 3px; padding: 1px 4px; font-family: monospace; font-size: 0.92em; color: #b91c1c; font-weight: bold;">$1</code>');

  return formatted;
};
