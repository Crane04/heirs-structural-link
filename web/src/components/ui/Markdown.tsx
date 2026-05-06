import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Props = HTMLAttributes<HTMLDivElement> & {
  content: string;
};

function renderInline(text: string): Array<string | JSX.Element> {
  // Very small Markdown subset: **bold** and `code`
  const parts: Array<string | JSX.Element> = [];
  let i = 0;

  while (i < text.length) {
    // code
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        const code = text.slice(i + 1, end);
        parts.push(
          <code key={`c-${i}`} className="px-1 py-0.5 rounded bg-ink/5 border border-ink/10 text-[0.95em]">
            {code}
          </code>
        );
        i = end + 1;
        continue;
      }
    }

    // bold
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        const bold = text.slice(i + 2, end);
        parts.push(
          <strong key={`b-${i}`} className="font-semibold text-ink">
            {bold}
          </strong>
        );
        i = end + 2;
        continue;
      }
    }

    // plain chunk until next special
    const nextCode = text.indexOf('`', i);
    const nextBold = text.indexOf('**', i);
    const next = [nextCode, nextBold].filter((x) => x !== -1).reduce((a, b) => Math.min(a, b), Infinity);
    const end = next === Infinity ? text.length : next;
    parts.push(text.slice(i, end));
    i = end;
  }

  return parts;
}

export default function Markdown({ content, className, ...props }: Props) {
  const lines = (content || '').split('\n');
  const blocks: Array<JSX.Element> = [];
  let listItems: string[] = [];

  function flushList(key: number) {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 flex flex-col gap-1">
        {listItems.map((li, idx) => (
          <li key={idx} className="text-sm text-ink/75">
            {renderInline(li)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  }

  let key = 0;
  for (const raw of lines) {
    const line = raw.trimEnd();

    const isBullet = /^\s*[-*]\s+/.test(line);
    if (isBullet) {
      listItems.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }

    flushList(key++);

    if (!line.trim()) {
      blocks.push(<div key={`sp-${key++}`} className="h-2" />);
      continue;
    }

    const isH2 = /^##\s+/.test(line);
    const isH3 = /^###\s+/.test(line);
    if (isH2 || isH3) {
      const text = line.replace(/^###?\s+/, '');
      blocks.push(
        <div key={`h-${key++}`} className={cn(isH2 ? 'text-base font-bold' : 'text-sm font-bold', 'text-ink')}>
          {renderInline(text)}
        </div>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="text-sm text-ink/75 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  flushList(key++);

  return (
    <div {...props} className={cn('flex flex-col gap-2', className)}>
      {blocks}
    </div>
  );
}

