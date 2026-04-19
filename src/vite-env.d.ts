/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_PUSHER_KEY?: string;
  readonly VITE_PUSHER_CLUSTER?: string;
  readonly VITE_GIPHY_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
