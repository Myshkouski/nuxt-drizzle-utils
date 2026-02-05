import { defineConfig } from 'tsdown'

export default defineConfig({
  format: ["esm", "cjs"], // Specify both ESM and CJS formats
  unbundle: true,
  sourcemap: true,
})
