/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string;
declare const BASE_KV_SERVICE_URL: string;

// shadcn/ui uses deep lucide-react subpath imports that lack individual .d.ts files
declare module "lucide-react/dist/esm/icons/*" {
  import { ComponentType } from "react";
  const Component: ComponentType<Record<string, unknown>>;
  export default Component;
}
