import { css } from 'lit';

// ==============================================================================
// Design Tokens & Shared CSS Custom Properties
// See: docs/rfcs/005-widgets-and-component-library.md
//      docs/rfcs/017-typography-and-font-selection.md
// ==============================================================================

export const themeStyles = css`
  :root {
    /* Brand Accents */
    --yt-color-primary: #ff5c35;      /* Yoto orange */
    --yt-color-primary-hover: #e04b25;
    --yt-color-primary-light: #fff2ed;
    --yt-color-surface: #ffffff;
    --yt-color-surface-subtle: #f8f9fa;
    --yt-color-surface-dark: #12161a; /* Dark canvas for pixel icon contrast */
    --yt-color-border: #e2e8f0;
    --yt-color-border-focus: #ff5c35;
    --yt-color-text: #1a202c;
    --yt-color-text-muted: #718096;
    --yt-color-text-inverse: #ffffff;

    /* Semantic Status Colors */
    --yt-color-success: #10b981;
    --yt-color-success-subtle: #ecfdf5;
    --yt-color-warning: #f59e0b;
    --yt-color-warning-subtle: #fffbeb;
    --yt-color-danger: #ef4444;
    --yt-color-danger-hover: #dc2626;
    --yt-color-danger-subtle: #fef2f2;
    --yt-color-neutral: #64748b;
    --yt-color-neutral-subtle: #f1f5f9;

    /* Typography */
    --yt-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --yt-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    --yt-font-size-xs: 0.75rem;
    --yt-font-size-sm: 0.875rem;
    --yt-font-size-md: 1rem;
    --yt-font-size-lg: 1.125rem;
    --yt-font-size-xl: 1.25rem;
    --yt-font-size-2xl: 1.5rem;

    /* Radii */
    --yt-radius-sm: 6px;
    --yt-radius-md: 10px;
    --yt-radius-lg: 16px;
    --yt-radius-full: 9999px;

    /* Shadows */
    --yt-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --yt-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --yt-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --yt-shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.15);

    /* Transitions */
    --yt-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --yt-transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
