/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL?: string;
  readonly VITE_LAUNCH_DATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
