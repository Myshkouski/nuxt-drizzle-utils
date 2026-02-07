import { defineConfig } from "../src/config"

export default defineConfig({
  dialect: 'postgresql',
  driver: 'pglite',
  schema: './schema.ts',
  out: './migrations',
}, __dirname)
