import React, { useMemo } from 'react';
import { Avatar as MuiAvatar, Tooltip } from '@mui/material';

// Deterministyczny kolor z tekstu (bez zewn. zależności)
function hashStringToHue(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  // hue 0..359
  return Math.abs(hash) % 360;
}

function buildBgColorFromText(text) {
  const hue = hashStringToHue(text || 'U');
  // HSL daje dość stabilne i przyjemne kolory
  return `hsl(${hue} 55% 45%)`;
}

function buildTextColorFromBg(bg) {
  // prosta heurystyka: przy HSL(?,55%,45%) biały działa dobrze
  return '#fff';
}

export default function Avatar({
  data,
  options,
}) {
  const avatarUrl = data?.avatarUrl || '';
  const avatarText = (data?.avatarText || '').trim();

  const calculateColor = options?.calculateColor ?? true;
  const size = options?.size ?? 28;
  const tooltip = options?.tooltip ?? '';
  const onClick = options?.onClick;

  const { bgColor, textColor } = useMemo(() => {
    if (!calculateColor || avatarUrl) return { bgColor: undefined, textColor: undefined };
    const bg = buildBgColorFromText(avatarText || 'U');
    return { bgColor: bg, textColor: buildTextColorFromBg(bg) };
  }, [calculateColor, avatarUrl, avatarText]);

  const node = (
    <MuiAvatar
      src={avatarUrl || undefined}
      alt={avatarText || 'U'}
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.floor(size * 0.42)),
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: avatarUrl ? undefined : bgColor,
        color: avatarUrl ? undefined : textColor,
        userSelect: 'none',
      }}
    >
      {!avatarUrl ? (avatarText || 'U') : null}
    </MuiAvatar>
  );

  if (!tooltip) return node;

  return (
    <Tooltip title={tooltip}>
      {/* Tooltip potrzebuje elementu, który przyjmuje ref – Avatar z MUI jest OK */}
      {node}
    </Tooltip>
  );
}
