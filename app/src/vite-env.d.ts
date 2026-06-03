/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUBMIT_API_KEY?: string;
  readonly VITE_SHEETS_SUBMIT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
