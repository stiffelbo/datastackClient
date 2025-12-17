// src/lib/commentsThread/CommentsRoll.jsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  Divider,
  ToggleButton,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';

import { useComments } from './useComments';
import { useCommentsController } from './useCommentsController';
import CommentRow from './CommentRow';
import TinyEditor from './TinyEditor';

/**
 * Headless props (no useEntity dependency):
 *  - data: array of comments (id, parent_id, content_html, created_at, created_by, is_pinned, ...)
 *  - loading?: boolean
 *  - onCreate?: ({ contentHtml, parentId, mentions }) => Promise<void> | void
 *  - onUpdate?: (id, { contentHtml, parentId, mentions }) => Promise<void> | void
 *  - onDelete?: (id) => Promise<void> | void
 *  - onTogglePin?: (id, nextPinned: boolean) => Promise<void> | void
 *  - onRefresh?: () => Promise<void> | void
 *  - onImageUpload?: (file: File) => Promise<string>
 *  - currentUser?: any
 *  - mentionOptions?: [{ value, label, title?, id? }]
 *  - onMentions?: 
 *  - height?: number
 */
export default function CommentsRoll({
  data = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  onImageUpload,
  currentUser,
  mentionOptions = [],
  onMentions,
  height = 900,
}) {
  const { flatList, threads } = useComments(data);

  const [search, setSearch] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const normalize = (value) => {
    if (!value) return '';
    return value
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const filteredFlatList = useMemo(() => {
    let base = flatList;

    if (pinnedOnly) base = base.filter((c) => c.isPinned);

    if (search) {
      const needle = normalize(search);
      if (!needle) return base;

      return base.filter((c) => {
        const haystack =
          normalize(c.authorName) +
          ' ' +
          normalize(c.contentHtml) +
          ' ' +
          normalize(c.replyTo?.snippet || '');
        return haystack.includes(needle);
      });
    }

    return base;
  }, [flatList, search, pinnedOnly]);

  const controller = useCommentsController({
    onCreate,
    onUpdate,
    onDelete,
    onRefresh,
    onImageUpload,
    onMentions
  });

  const isFilterActive = !!search;

  const renderFilterBar = () => {
    if (!flatList || flatList.length === 0) return null;

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          variant="outlined"
          placeholder="Szukaj w komentarzach…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch('')}
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <ToggleButton
          value="pinned"
          selected={pinnedOnly}
          size="small"
          color="warning"
          onChange={() => setPinnedOnly((prev) => !prev)}
          sx={{ whiteSpace: 'nowrap', px: 1.5 }}
        >
          <PushPinIcon fontSize="small" sx={{ mr: 0.5 }} />
          Pinned
        </ToggleButton>
      </Stack>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
      {renderFilterBar()}

      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          maxHeight: height,
          mt: 0.5,
          border: controller.dragging ? '1px dashed #1976d2' : undefined,
        }}
        onDragOver={(e) => controller.handleDragOver?.(e)}
        onDragLeave={() => controller.handleDragLeave?.()}
        onDrop={(e) => controller.handleDropImage?.(e)}
      >
        {loading && (
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ładowanie komentarzy…
            </Typography>
          </Box>
        )}

        {!loading && filteredFlatList.length === 0 && (
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {isFilterActive
                ? 'Brak komentarzy spełniających kryteria wyszukiwania.'
                : 'Brak komentarzy.'}
            </Typography>
          </Box>
        )}

        {filteredFlatList.map((c) => {
          const thread = threads[c.rootId] || { root: c, replies: [] };
          const threadSize = (thread.replies?.length || 0) + 1;
          const isThreadOpen = controller.openThreadRootId === c.rootId;

          return (
            <React.Fragment key={c.id}>
              <CommentRow
                comment={c}
                currentUser={currentUser}
                threadSize={threadSize}
                isThreadOpen={isThreadOpen}
                onReply={controller.openReply}
                onEdit={controller.openEdit}
                onDelete={controller.handleDelete}
                onTogglePin={controller.handleTogglePin}
                onToggleThread={controller.handleToggleThread}
              />

              {isThreadOpen && c.id === c.rootId && thread.replies.length > 0 && (
                <Box
                  sx={{
                    ml: 3,
                    mb: 1,
                    pl: 1,
                    borderLeft: '2px solid',
                    borderColor: '#53bd11ff',
                  }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                    <ForumOutlinedIcon sx={{ fontSize: 16 }} color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Wątek ({thread.replies.length} odpowiedzi)
                    </Typography>
                  </Stack>

                  {thread.replies.map((r, idx) => (
                    <Box key={r.id} sx={{ pb: 0.75 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {r.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.createdAtLabel}
                        </Typography>
                      </Stack>

                      <Box
                        sx={{ fontSize: 13, '& p': { m: 0, mb: 0.25 } }}
                        dangerouslySetInnerHTML={{ __html: r.contentHtml }}
                      />

                      {idx < thread.replies.length - 1 && (
                        <Divider sx={{ mt: 0.75, mb: 0.5 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      <Box
        sx={{
          flex: '0 0 auto',
          mt: 1,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          pb: 1,
        }}
      >
        {controller.replyTo && (
          <Paper
            variant="outlined"
            sx={{
              mb: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: '#86b6ff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="caption">
                Odpowiedź na: <strong>{controller.replyTo.authorName}</strong>
              </Typography>
              <IconButton
                size="small"
                onClick={controller.cancelCompose}
                title="Anuluj odpowiedź"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <div dangerouslySetInnerHTML={{ __html: controller.replyTo.contentHtml }} />
          </Paper>
        )}

        {!controller.editorOpen && !controller.editing && !controller.replyTo && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton
              color="primary"
              onClick={controller.openCreate}
              title="Dodaj komentarz"
            >
              <ForumOutlinedIcon />
            </IconButton>
          </Box>
        )}

        {(controller.editorOpen || controller.editing || controller.replyTo) && (
          <TinyEditor
            mode={controller.editing ? 'edit' : controller.replyTo ? 'reply' : 'create'}
            initialContent={controller.editing?.contentHtml || ''}
            mentionOptions={mentionOptions}
            onSave={controller.handleSave}
            onCancel={controller.cancelCompose}
            onImageUpload={onImageUpload}
          />
        )}
      </Box>
    </Box>
  );
}
