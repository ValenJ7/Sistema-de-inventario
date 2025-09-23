export const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
  ),
  Cart: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" />
      <path d="M3 3h2l2.2 12.3a2 2 0 0 0 2 1.7h8.3a2 2 0 0 0 2-1.6L21 8H6" strokeWidth="2"/>
    </svg>
  ),
  Minus: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <polyline points="3 6 5 6 21 6" strokeWidth="2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeWidth="2" />
      <path d="M10 11v6M14 11v6" strokeWidth="2" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Card: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Save: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" {...props}>
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3.3 7.3L12 12l8.7-4.7" />
      <path d="M12 22V12" />
    </svg>
  ),
};
