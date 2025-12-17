// src/hooks/useEntityTypes.ts

export type EntityQuery = Record<string, unknown>;

export type UseEntityProcessRows<Row> = (rows: any[]) => Row[];

/**
 * Parametry przekazywane do useEntity.
 * Row – typ pojedynczego rekordu (np. komentarza), domyślnie any.
 */
export interface UseEntityParams<Row = any> {
  endpoint: string;               // np. 'clients_comments'
  entityName?: string;
  query?: EntityQuery;
  readOnly?: boolean;
  processRows?: UseEntityProcessRows<Row>;
}

/**
 * Bardzo uproszczony typ schematu – na razie nie rozdrabniamy się,
 * bo najważniejsze są rows + metody CRUD.
 * Z czasem możesz to doprecyzować.
 */
export interface UseEntitySchema {
  addForm: any;
  editForm: any;
  bulkEditForm: any;
  columns: any[];
  endpoints?: Record<string, string | null>;
  relations?: Record<string, unknown>;
  options?: Record<string, unknown>;
  importSchema?: any[];
  heightSpan?: number;
  mapper?: {
    itemField?: string;
  };
}

/**
 * To, co zwraca useEntity.
 * Row – typ pojedynczego rekordu, Schema – typ schematu.
 */
export interface UseEntityResult<Row = any, Schema = UseEntitySchema> {
  loading: boolean;
  error: unknown;
  clearError: () => void;

  rows: Row[];
  schema: Schema;

  // CRUD
  create: ((data: any) => Promise<any>) | null;
  updateField:
    | ((args: { id: any; field: string; value: any }) => Promise<any>)
    | null;
  update: ((id: any, changes: any) => Promise<boolean>) | null;
  updateMany: ((ids: any[], changes: any) => Promise<number>) | null;
  remove: ((id: any) => Promise<boolean>) | null;
  removeMany: ((ids: any[]) => Promise<number>) | null;

  // import/upload
  upload:
    | ((
        dataRows: any[],
      ) => Promise<{
        inserted: number;
        skipped: number;
        ids: any[];
        errors: string[];
      }>)
    | null;

  // pojedynczy rekord
  getOne: ((id: any) => Promise<any>) | null;

  // operacje ogólne
  refresh: () => Promise<void>;
  fetchSchema: () => Promise<any>;
  fetchRows: () => Promise<Row[]>;
  heightSpan: number;
}

/**
 * Typ funkcji useEntity – możesz go używać w innych modułach, żeby
 * „nadać typy” JS-owemu hookowi.
 */
export type UseEntityFn<Row = any, Schema = UseEntitySchema> = (
  params: UseEntityParams<Row>,
) => UseEntityResult<Row, Schema>;
