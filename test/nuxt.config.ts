import { defineNuxtConfig, type NuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  drizzle: {
    datasource: {
      test: {
        connector: 'pglite'
      }
    }
  }
}) as NuxtConfig
