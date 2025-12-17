// src/lib/commentsThread/types.ts

/** Id komentarza w warstwie frontu (string, nawet jeśli w bazie jest INT). */
export type CommentId = string;

/** Referencja do encji, do której przyczepione są komentarze (task, client, issue itd.). */
export type EntityRef = {
  refType: string; // np. "client", "issue", "task"
  refId: string;   // np. "123"
};

/** Użytkownik mentionowany w komentarzu. */
export interface Mention {
  userId: number;
  label: string;
}

/** Plik powiązany z komentarzem (repozytorium plików). */
export type CommentFile = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;           // URL (lub ścieżka) do pobrania / podglądu
  statusId?: string | null;
  typeId?: string | null;
};

/** Uproszczony użytkownik zalogowany. */
export type CurrentUser = {
  id: string;
  name: string;
  email?: string;
  role?: string; // np. "admin", "user"
};

/** Jeden komentarz w drzewie. */
export type Comment = {
  id: CommentId;
  entity: EntityRef;

  parentId?: CommentId | null;
  children?: Comment[];           // zagnieżdżone odpowiedzi (opcjonalnie)

  authorId: string;
  authorName: string;

  label?: string;                 // np. nazwa/tytuł komentarza (Twoje "name")
  contentHtml: string;            // HTML wygenerowany przez Quilla

  mentions: Mention[];

  isPinned: boolean;
  pinnedAt?: string | null;

  isFile: boolean;                // czy to komentarz „plikowy”
  files: CommentFile[];           // lista plików powiązanych z komentarzem

  typeId?: string | null;
  typeName?: string | null;
  statusId?: string | null;
  statusName?: string | null;

  isPrivate?: boolean;
  isAdminOnly?: boolean;

  createdAt: string;
  updatedAt?: string | null;
};

/** Dane do utworzenia nowego komentarza. */
export type NewCommentInput = {
  entity: EntityRef;
  parentId?: CommentId | null;

  label?: string;
  contentHtml: string;

  isPrivate?: boolean;
  isAdminOnly?: boolean;

  typeId?: string | null;
  statusId?: string | null;

  mentions?: Mention[];
  fileIds?: string[]; // ID plików, które już istnieją w repozytorium
  isFile?: boolean;
};

/** Dane do aktualizacji istniejącego komentarza. */
export type UpdateCommentInput = Partial<
  Omit<NewCommentInput, 'entity' | 'parentId'>
> & {
  // entity/parentId nie są aktualizowane przez ten input
};

/** Funkcje decydujące, kto może co zrobić z komentarzem. */
export type AccessControl = {
  canEdit?(comment: Comment, user: CurrentUser): boolean;
  canDelete?(comment: Comment, user: CurrentUser): boolean;
  canPin?(comment: Comment, user: CurrentUser): boolean;
};

/** Adapter dla komentarzy – most między libką a Twoim backendem/useEntity. */
export type CommentsAdapter = {
  loading: boolean;
  error: unknown;

  comments: Comment[];
  refresh(): Promise<void>;

  createComment(input: NewCommentInput): Promise<Comment>;
  updateComment(id: CommentId, patch: UpdateCommentInput): Promise<Comment>;
  deleteComment(id: CommentId): Promise<void>;
  pinComment(id: CommentId, pinned: boolean): Promise<Comment>;
};

/** Adapter dla mentions – źródło podpowiedzi @użytkowników. */
export type MentionsAdapter = {
  loading: boolean;
  error: unknown;

  /** Szukanie użytkowników po fragmencie nazwy / loginu. */
  search(term: string): Promise<Mention[]>;

  /** Dociągnięcie pełnych danych dla listy ID (np. przy edycji istniejącego komentarza). */
  getByIds(ids: string[]): Promise<Mention[]>;
};

export interface MentionOption {
  value: number;        // user id
  label: string;        // np. "Jan Kowalski"
  title?: string | null;
  disabled?: boolean;
}


