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
import Avatar from './Avatar';

export default function CommentRow({
  comment,        // <-- to jest VM
  onReply,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleThread,
  isThreadOpen,
}) {
  const handleReply = () => onReply && onReply(comment);
  const handleEdit = () => onEdit && onEdit(comment);
  const handleDelete = () => onDelete && onDelete(comment);
  const handleTogglePin = () => onTogglePin && onTogglePin(comment, !comment.isPinned);
  const handleToggleThread = () => onToggleThread && onToggleThread(comment);

  const hasReplies = !!comment?.hasReplies;
  const threadSize = Number(comment?.threadSize || 1);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        borderRadius: 1.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',          // ← kluczowe
        alignItems: 'stretch',
      }}
    >
      {/* LEFT COLUMN – AVATAR */}
      <Box
        sx={{
          width: 48,              // stała kolumna
          minWidth: 48,
          display: 'flex',
          justifyContent: 'center',
          pt: 1,                  // avatar lekko od góry (jak Jira)
        }}
      >
        <Avatar
          data={{
            avatarUrl: comment.avatarUrl,
            avatarText: comment.userInitials,
          }}
          options={{
            size: 32,
            calculateColor: true,
            tooltip: comment.authorName,
            // onClick: () => openUserProfile(comment.authorId)
          }}
        />
      </Box>

      {/* RIGHT COLUMN – CONTENT */}
      <Box
        sx={{
          flex: 1,
          p: 0.75,
          pl: 0,                  // bo avatar ma swój padding
          minWidth: 0,            // ważne dla ellipsis/overflow
        }}
      >
        {/* TOP BAR */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            marginBottom: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {comment.authorName}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {comment.createdAtLabel}
            </Typography>

            {comment.isPinned && (
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
        </Box>

        {/* REPLY QUOTE */}
        {comment.replyTo && (
          <Box sx={{ mt: 0.5 }}>
            <CommentQuote replyTo={comment.replyTo} />
          </Box>
        )}

        {/* CONTENT */}
        <Box
          sx={commentHtmlSx}
          dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
        />

        {/* ACTIONS */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            mt: 0.5,
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            {comment?.actions?.canReply && (
              <Tooltip title="Odpowiedz">
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                  onClick={handleReply}
                  sx={{ textTransform: 'none', minWidth: 0, fontSize: 12, px: 0.5 }}
                />
              </Tooltip>
            )}

            {comment.hasReplies && (
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
                  {Math.max(0, comment.threadSize - 1)}
                </Button>
              </Tooltip>
            )}

            {comment?.actions?.canPin && (
              <Tooltip title={comment.isPinned ? 'Odepnij' : 'Przypnij'}>
                <IconButton size="small" onClick={handleTogglePin} sx={{ p: 0.5 }}>
                  {comment.isPinned ? (
                    <PushPinIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {comment?.actions?.canEdit && (
              <Tooltip title="Edytuj">
                <IconButton size="small" onClick={handleEdit} sx={{ p: 0.5 }}>
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {comment?.actions?.canDelete && (
              <Tooltip title="Usuń">
                <IconButton size="small" onClick={handleDelete} sx={{ p: 0.5 }}>
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
