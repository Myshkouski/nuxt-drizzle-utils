# @nuxt-drizzle/utils

Utilities for configuring Drizzle ORM in Nuxt applications.

## Installation

```bash
npm install @nuxt-drizzle/utils
```

## Usage

This package provides a `defineConfig` function that helps configure Drizzle Kit paths correctly for Nuxt plugins and modules.

```typescript
import { defineConfig } from '@nuxt-drizzle/utils'

export default defineConfig({
  schema: './schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // ... other Drizzle config options
}, __dirname)
```

The `defineConfig` function transforms relative paths in `schema` and `out` to be compatible with Drizzle Kit when used in Nuxt contexts.
