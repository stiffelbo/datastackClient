// src/lib/commentsThread/CommentRow.jsx
import React from 'react';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Paper,
} from '@mui/material';

import ReplyIcon from '@mui/icons-material/Reply';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CommentQuote from './CommentQuote';
import commentHtmlSx from './commentHtmlSx';

export default function CommentRow({
  comment,
  currentUser,
  threadSize,
  onReply,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleThread,
  isThreadOpen,
}) {
  const isAuthor = currentUser && comment.authorId === String(currentUser.id);
  const isPinned = comment.isPinned;
  const hasReplies = threadSize > 1;

  const handleReply = () => onReply && onReply(comment);
  const handleEdit = () => onEdit && onEdit(comment);
  const handleDelete = () => onDelete && onDelete(comment);
  const handleTogglePin = () => onTogglePin && onTogglePin(comment, !isPinned);
  const handleToggleThread = () => onToggleThread && onToggleThread(comment);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        p: 1.25,
        borderRadius: 1.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* TOP BAR: info po lewej, akcje po prawej */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* LEWA STRONA – autor, czas, pin */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {comment.createdAtLabel}
          </Typography>
          {isPinned && (
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              icon={<PushPinIcon sx={{ fontSize: 14 }} />}
              label="PIN"
              sx={{ ml: 0.5, height: 20, '& .MuiChip-label': { px: 0.5 } }}
            />
          )}
        </Stack>

        {/* PRAWA STRONA – akcje */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Odpowiedź */}
          <Tooltip title="Odpowiedz">
            <Button
              size="small"
              variant="text"
              startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
              onClick={handleReply}
              sx={{ textTransform: 'none', minWidth: 0, fontSize: 12, px: 0.5 }}
            >
            </Button>
          </Tooltip>

          {/* Wątek – liczba odpowiedzi */}
          {hasReplies && (
            <Tooltip title={isThreadOpen ? 'Ukryj wątek' : 'Pokaż wątek'}>
              <Button
                size="small"
                variant="text"
                startIcon={<ForumOutlinedIcon sx={{ fontSize: 16 }} />}
                color={isThreadOpen ? 'warning' : 'primary'}
                endIcon={
                  isThreadOpen ? (
                    <ExpandLessIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 16 }} />
                  )
                }
                onClick={handleToggleThread}
                sx={{
                  textTransform: 'none',
                  minWidth: 0,
                  fontSize: 12,
                  px: 0.5,
                }}
              >
                {threadSize - 1}
              </Button>
            </Tooltip>
          )}

          {/* PIN / ODEPIN */}
          <Tooltip title={isPinned ? 'Odepnij' : 'Przypnij'}>
            <IconButton
              size="small"
              onClick={handleTogglePin}
              sx={{ p: 0.5 }}
            >
              {isPinned ? (
                <PushPinIcon sx={{ fontSize: 18 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Edycja – tylko autor */}
          {isAuthor && (
            <Tooltip title="Edytuj">
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{ p: 0.5 }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Usuń – tylko autor i tylko jeśli brak odpowiedzi */}
          {isAuthor && !hasReplies && (
            <Tooltip title="Usuń (brak odpowiedzi)">
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{ p: 0.5 }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* REPLY QUOTE (WhatsApp-style) */}
      {comment.replyTo && (
        <Box sx={{ mt: 0.5 }}>
          <CommentQuote replyTo={comment.replyTo} />
        </Box>
      )}

      {/* TREŚĆ KOMENTARZA */}
      <Box
        sx={commentHtmlSx}
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />
    </Paper>
  );
}
