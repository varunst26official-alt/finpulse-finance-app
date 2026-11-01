import React from 'react';

interface FormattedMessageContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

/**
 * Parses inline markdown:
 * - **bold text** -> <strong>
 * - *italic text* -> <em>
 * - `code` -> <code>
 * - Strips any stray or malformed asterisks
 */
function renderInline(text: string, isUser: boolean): React.ReactNode {
  // Regex to match **bold**, *italic*, `code`
  // We use non-greedy matches
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).replace(/\*\*/g, '');
      if (plain) tokens.push(plain);
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2).replace(/\*\*/g, '');
      tokens.push(
        <strong
          key={match.index}
          className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}
        >
          {boldText}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      tokens.push(
        <em
          key={match.index}
          className={`italic ${isUser ? 'text-white/90' : 'text-slate-700'}`}
        >
          {italicText}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      tokens.push(
        <code
          key={match.index}
          className={`px-1 py-0.5 rounded text-[11px] font-mono ${
            isUser ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
          }`}
        >
          {codeText}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Trailing text after last match
  if (lastIndex < text.length) {
    const trailing = text.slice(lastIndex).replace(/\*\*/g, '');
    if (trailing) tokens.push(trailing);
  }

  return tokens.length > 0 ? tokens : text.replace(/\*\*/g, '');
}

export const FormattedMessageContent: React.FC<FormattedMessageContentProps> = ({
  content,
  isUser = false,
  className = '',
}) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 text-xs leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Checklist items: - [ ] or - [x]
        if (/^-\s*\[([ xX])\]\s*/.test(trimmed)) {
          const isChecked = /^-\s*\[[xX]\]/.test(trimmed);
          const textAfter = trimmed.replace(/^-\s*\[([ xX])\]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 pl-0.5">
              <span
                className={`inline-block mt-0.5 h-3.5 w-3.5 rounded border text-[10px] flex items-center justify-center ${
                  isChecked
                    ? 'bg-emerald-500 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={isChecked ? 'line-through text-slate-400' : ''}>
                {renderInline(textAfter, isUser)}
              </span>
            </div>
          );
        }

        // Bullet points starting with "- ", "* ", or "• "
        if (/^[-*•]\s+/.test(trimmed)) {
          const textAfter = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
              <span className={`font-bold shrink-0 ${isUser ? 'text-amber-200' : 'text-[#9e783e]'}`}>
                •
              </span>
              <div className="flex-1">{renderInline(textAfter, isUser)}</div>
            </div>
          );
        }

        // Headings: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h5
              key={idx}
              className={`font-heading font-bold text-xs pt-1 pb-0.5 ${
                isUser ? 'text-white' : 'text-slate-900'
              }`}
            >
              {renderInline(trimmed.slice(4), isUser)}
            </h5>
          );
        }

        // Normal paragraph
        return (
          <p key={idx} className="mb-1 last:mb-0">
            {renderInline(line, isUser)}
          </p>
        );
      })}
    </div>
  );
};
