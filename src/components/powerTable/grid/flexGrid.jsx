import React, { useEffect, useState } from 'react';
import './flexGrid.css';

/**
 * Row + Col responsive flex grid
 *
 * Row props:
 *  - gap (number, px) default 16
 *  - align, justify, style, className
 *
 * Col props:
 *  - xs, md, xl (1..12) — liczba kolumn (domyślnie xs=12)
 *  - pad (bool) — czy dodawać wewnętrzny padding (true domyślnie)
 *  - style, className
 *
 * Breakpointy: md >= 900, xl >= 1200 (możesz zmienić)
 */

const DEFAULT_GAP = 16;
const BP_MD = 900;
const BP_XL = 1200;

export const Row = ({ children, gap = DEFAULT_GAP, align = 'flex-start', justify = 'flex-start', style = {}, className = '', ...rest }) => {
  const half = Math.round((gap || DEFAULT_GAP) / 2);
  const mergedStyle = {
    marginLeft: `-${half}px`,
    marginRight: `-${half}px`,
    alignItems: align,
    justifyContent: justify,
    gap: 0, // nie używamy natywnego gap (zostawiamy na padding kolumn)
    ...style,
  };

  return (
    <div className={`ft-row ${className || ''}`} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
};

export const Col = ({ children, xs = 12, md = null, xl = null, pad = true, gap = DEFAULT_GAP, style = {}, className = '', ...rest }) => {
  // track window width to decide breakpoint (simple)
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : BP_MD);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // decide active columns for current breakpoint
  let cols = xs ?? 12;
  if (xl && w >= BP_XL) cols = xl;
  else if (md && w >= BP_MD) cols = md;

  // clamp between 1 and 12
  cols = Math.max(1, Math.min(12, Number(cols) || 12));
  const percent = (cols / 12) * 100;

  const half = Math.round((gap || DEFAULT_GAP) / 2);
  const padding = pad ? `${half}px` : undefined;

  const colStyle = {
    paddingLeft: padding,
    paddingRight: padding,
    flex: `0 0 ${percent}%`,
    maxWidth: `${percent}%`,
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <div className={`ft-col ${className || ''}`} style={colStyle} {...rest}>
      {children}
    </div>
  );
};

export default { Row, Col };
