import createDOMPurify from 'isomorphic-dompurify';

export const sanitize = {
  plain: (input: string): string => {
    if (!input) return '';
    return createDOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  },

  basic: (input: string): string => {
    if (!input) return '';
    return createDOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
      ALLOWED_ATTR: [],
    });
  },

  withLinks: (input: string): string => {
    if (!input) return '';
    return createDOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'a'],
      ALLOWED_ATTR: ['href'],
      ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/,
    });
  },

  description: (input: string): string => {
    if (!input) return '';
    return createDOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
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
