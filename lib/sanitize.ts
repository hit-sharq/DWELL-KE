const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const ALLOWED_BASIC = new Set(['b', 'i', 'em', 'strong', 'br']);
const ALLOWED_LINKS = new Set(['b', 'i', 'em', 'strong', 'br', 'a']);
const ALLOWED_DESCRIPTION = new Set(['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p']);

function stripTags(
  input: string,
  allowed: Set<string>,
  allowedAttrs: Set<string> = new Set()
): string {
  if (!input) return '';
  return input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(
      /<(\w+)((?:\s+[^>]*?)?)>/g,
      (_match: string, tag: string, attrs: string) => {
        const lowerTag = tag.toLowerCase();
        if (!allowed.has(lowerTag)) return '';

        if (attrs && allowedAttrs.size > 0) {
          const filtered = attrs
            .split(/(?=\s)/)
            .filter((attr: string) => {
              const name = attr.trim().split(/\s*=/)[0].toLowerCase();
              return name.length === 0 || allowedAttrs.has(name);
            })
            .join('');
          return `<${tag}${filtered}>`;
        }
        return `<${tag}>`;
      }
    )
    .replace(/<\/?(\w+)>/g, '');
}

export const sanitize = {
  plain: (input: string): string => {
    if (!input) return '';
    return stripTags(input, new Set());
  },

  basic: (input: string): string => {
    if (!input) return '';
    return stripTags(input, ALLOWED_BASIC);
  },

  withLinks: (input: string): string => {
    if (!input) return '';
    return stripTags(input, ALLOWED_LINKS, new Set(['href']));
  },

  description: (input: string): string => {
    if (!input) return '';
    return stripTags(input, ALLOWED_DESCRIPTION);
  },
};

export const validateLength = {
  short: (value: string, max = 100): string | null => {
    if (value.length > max) return `Must be ${max} characters or less`;
    return null;
  },
  medium: (value: string, max = 500): string | null => {
    if (value.length > max) return `Must be ${max} characters or less`;
    return null;
  },
  long: (value: string, max = 2000): string | null => {
    if (value.length > max) return `Must be ${max} characters or less`;
    return null;
  },
};
