import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://deepatstudio.com",
  integrations: [react()],
  trailingSlash: "always"
});
