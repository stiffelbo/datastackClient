// dashboard/DashboardLayout.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

/**
 * DashboardLayout
 *
 * Props:
 * - left: ReactNode – widok listy (PowerTable / cokolwiek)
 * - right: ReactNode – strona rekordu
 * - showRight: bool – czy pokazać panel po prawej
 * - initialLeftRatio: number (0–1) – startowa szerokość lewej kolumny przy showRight=true (domyślnie 0.4)
 * - minLeftRatio: number (0–1) – minimalna szerokość lewej (domyślnie 0.2)
 * - maxLeftRatio: number (0–1) – maksymalna szerokość lewej (domyślnie 0.8)
 * - onResizeEnd?: (leftRatio: number) => void – wywołane po zakończeniu przeciągania
 */
const DashboardLayout = ({
  left,
  right,
  showRight,
  initialLeftRatio = 0.4,
  minLeftRatio = 0.2,
  maxLeftRatio = 0.8,
  onResizeEnd,
}) => {
  const containerRef = useRef(null);
  const [leftRatio, setLeftRatio] = useState(initialLeftRatio);
  const [isDragging, setIsDragging] = useState(false);

  // helper do clamp
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current || !showRight) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;

      setLeftRatio((prev) => {
        const next = clamp(ratio, minLeftRatio, maxLeftRatio);
        return next;
      });
    },
    [isDragging, showRight, minLeftRatio, maxLeftRatio]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (onResizeEnd && showRight) {
      onResizeEnd(leftRatio);
    }
  }, [isDragging, onResizeEnd, leftRatio, showRight]);

  // globalne nasłuchiwanie myszki przy drag
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // przy braku prawego panelu lewy ma zawsze 100%
  const effectiveLeftRatio = showRight ? leftRatio : 1;

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        userSelect: isDragging ? 'none' : 'auto',
        cursor: isDragging ? 'col-resize' : 'default',
      }}
    >
      {/* LEFT PANEL */}
      <Box
        sx={{
          flex: '0 0 auto',
          width: `${effectiveLeftRatio * 100}%`,
          maxWidth: `${effectiveLeftRatio * 100}%`,
          minWidth: 0,
          overflow: 'hidden',
          transition: isDragging ? 'none' : 'max-width 0.2s ease-in-out, width 0.2s ease-in-out',
        }}
      >
        {left}
      </Box>

      {/* RESIZER */}
      {showRight && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            flex: '0 0 auto',
            width: '4px',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.08)',
            },
            backgroundColor: isDragging ? 'rgba(0,0,0,0.12)' : 'transparent',
          }}
        />
      )}

      {/* RIGHT PANEL */}
      {showRight && (
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            borderLeft: '1px solid #ddd',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {right}
        </Box>
      )}
    </Box>
  );
};

export default DashboardLayout;
