/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_OAUTH: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENV: 'development' | 'production' | 'staging';
  // Agrega aquí otras variables de entorno que uses en tu proyecto
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaración de módulos para archivos que no tienen tipos
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}
