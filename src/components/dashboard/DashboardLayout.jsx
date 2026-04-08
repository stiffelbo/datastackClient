import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

/**
 * DashboardLayout
 *
 * Props:
 * - left: ReactNode – widok listy
 * - right: ReactNode – widok szczegółów
 * - showRight: bool – czy w trybie "dashboard" pokazać prawy panel
 * - initialLeftRatio: number (0–1)
 * - minLeftRatio: number (0–1)
 * - maxLeftRatio: number (0–1)
 * - onResizeEnd?: (leftRatio: number) => void
 * - mode: 'dashboard' | 'listonly' | 'singlepage'
 */
const DashboardLayout = ({
  left,
  right,
  showRight,
  initialLeftRatio = 0.4,
  minLeftRatio = 0.2,
  maxLeftRatio = 0.8,
  onResizeEnd,
  mode = 'dashboard',
}) => {
  const containerRef = useRef(null);
  const [leftRatio, setLeftRatio] = useState(initialLeftRatio);
  const [isDragging, setIsDragging] = useState(false);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const isDashboard = mode === 'dashboard';
  const isListOnly = mode === 'listonly';
  const isSinglePage = mode === 'singlepage';

  const showLeftPanel = isDashboard || isListOnly;
  const showRightPanel = isDashboard ? !!showRight : isSinglePage;

  const handleMouseDown = (e) => {
    if (!isDashboard || !showRightPanel) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current || !isDashboard || !showRightPanel) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;

      setLeftRatio(clamp(ratio, minLeftRatio, maxLeftRatio));
    },
    [isDragging, isDashboard, showRightPanel, minLeftRatio, maxLeftRatio]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (onResizeEnd && isDashboard && showRightPanel) {
      onResizeEnd(leftRatio);
    }
  }, [isDragging, onResizeEnd, leftRatio, isDashboard, showRightPanel]);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const effectiveLeftRatio =
    isDashboard
      ? (showRightPanel ? leftRatio : 1)
      : isListOnly
        ? 1
        : 0;

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
      {showLeftPanel && (
        <Box
          sx={{
            flex: '0 0 auto',
            width: `${effectiveLeftRatio * 100}%`,
            maxWidth: `${effectiveLeftRatio * 100}%`,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
            transition: isDragging
              ? 'none'
              : 'max-width 0.2s ease-in-out, width 0.2s ease-in-out',
          }}
        >
          {left}
        </Box>
      )}

      {isDashboard && showRightPanel && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            flex: '0 0 auto',
            width: '4px',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            backgroundColor: isDragging ? 'rgba(0,0,0,0.12)' : 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.08)',
            },
          }}
        />
      )}

      {showRightPanel && (
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
            borderLeft: isDashboard ? '1px solid #ddd' : 'none',
          }}
        >
          {right}
        </Box>
      )}
    </Box>
  );
};

export default DashboardLayout;