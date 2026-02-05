export const MODULE_NAME = 'nuxt-drizzle' as const
export const VIRTUAL_MODULE_ID_PREFIX = `#${MODULE_NAME}/virtual` as const
export const VirtualModules = {
  DATASOURCE: `${VIRTUAL_MODULE_ID_PREFIX}/datasources` as const,
  MODULE_TYPES_DTS: `types/${MODULE_NAME}.d.ts` as const,
} as const
