import type { ModuleContext } from '../context'
import type { ServerAssetDir } from 'nitropack/types'
import type { ConnectorName } from 'db0'
import type { NuxtOptions } from '@nuxt/schema'

const SERVER_ASSETS_BASE = 'drizzle:migrations' as const

/**
 * @see [function serverAssets(nitro: Nitro)](https://github.com/nitrojs/nitro/blob/ef01b092b5fa09d28acb5bd0668ae80505f7c6b4/src/build/virtual/server-assets.ts#L18)
 */
export async function updateServerAssets(context: ModuleContext, nuxtOptions: NuxtOptions) {
  const datasources = await context.resolve()

  const drizzleMigrationAssets = datasources.map(({ name, imports }) => {
    const dir = imports.migrations
    if (dir) {
      return { name, dir }
    }
  }).filter(value => !!value).map(({ name, dir }) => {
    return {
      baseName: `${SERVER_ASSETS_BASE}:${name}`,
      dir,
      /**
       * @todo Doesn't work in dev mode - 'fs' driver does not support 'pattern'
       * Disabled - include all files to use with meta/_journal.json
       */
      // pattern: '*.sql',
    } satisfies ServerAssetDir
  })

  nuxtOptions.nitro.serverAssets = [nuxtOptions.nitro.serverAssets].flat().filter((serverAsset) => {
    return serverAsset?.baseName?.startsWith(SERVER_ASSETS_BASE)
  }).concat(drizzleMigrationAssets)
}

export function getDatasourceOptions(nuxtOptions: NuxtOptions, options: DatasourceOptions) {
  return nuxtOptions.nitro.experimental?.database
    ? nuxtOptions.nitro.dev
      ? nuxtOptions.nitro.devDatabase
      : nuxtOptions.nitro.database
    : options
}

export type DatasourceOptions = {
  [name: string & {}]: {
    connector: ConnectorName
  }
}
