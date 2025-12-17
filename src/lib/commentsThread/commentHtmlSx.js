const commentHtmlSx = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: 14,
  lineHeight: 1.45,
  color: 'text.primary',

  // Reset + czytelność
  '& p': {
    margin: 0,
    padding: 0,
  },

  // odstępy między paragrafami
  '& p + p': {
    marginTop: 0.5,
  },

  // listy
  '& ul, & ol': {
    margin: '4px 0',
    paddingLeft: 2.5,
  },

  '& li': {
    margin: '2px 0',
  },

  // formatowanie inline
  '& strong': { fontWeight: 600 },
  '& em': { fontStyle: 'italic' },
  '& u': { textDecoration: 'underline' },

  // linki
  '& a': {
    color: 'primary.main',
    textDecoration: 'underline',
    wordBreak: 'break-word',
  },

  // obrazy
  '& img': {
    maxWidth: '100%',
    borderRadius: 1,
    marginTop: 0.5,
  },

  // cytaty / code
  '& blockquote': {
    margin: '4px 0',
    paddingLeft: 1,
    borderLeft: '3px solid',
    borderColor: 'divider',
    color: 'text.secondary',
  },

  '& pre, & code': {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: '0.9em',
    backgroundColor: 'grey.100',
    padding: '2px 4px',
    borderRadius: 0.5,
  },

  '& table': {
    marginTop: 1,
    marginBottom: 1,
  },
};

export default commentHtmlSx;
