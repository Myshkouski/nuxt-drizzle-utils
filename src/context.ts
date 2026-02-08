import type { ConsolaInstance } from 'consola'
import { findPath, resolveFiles, resolvePath, type Resolver } from '@nuxt/kit'
import { createJiti } from 'jiti'
import type { Config as DrizzleConfig } from 'drizzle-kit'
import { mapAsync } from './helpers/async'
import { accent } from './helpers/logger'
import { colorize } from 'consola/utils'
import type { ConnectorName } from 'db0'
import type { Jiti } from 'jiti/lib/types'

export interface ModuleContext {
  resolve(forceUpdate?: boolean): Promise<DatasourceInfo[]> | DatasourceInfo[]
}

export interface LoggerOptions {
  logger?: ConsolaInstance
}

export type StubModuleContextOptions = LoggerOptions & {}

class StubModuleContext implements ModuleContext {
  readonly #options: StubModuleContextOptions

  constructor(options: StubModuleContextOptions) {
    this.#options = options
  }

  resolve() {
    this.#options.logger?.info('Resolving datasources within stub module context')
    return []
  }
}

export function createStubModuleContext(options?: StubModuleContextOptions) {
  return new StubModuleContext(options || {})
}

class ModuleContextImpl implements ModuleContext {
  #datasources: DatasourceInfo[] | null = null
  readonly #options: ModuleContextOptions
  readonly #jiti: Jiti

  constructor(options: ModuleContextOptions) {
    this.#options = options
    this.#jiti = createJiti(options.resolver.resolve())
  }

  async resolve(forceUpdate?: boolean) {
    const { logger, baseDir, configPattern, resolver, datasource: db, connectorsDir, helpersDir } = this.#options

    if (!!forceUpdate || null == this.#datasources) {
      logger?.info('Searching drizzle datasources in', colorize('blue', baseDir))

      const drizzleConfigsResolvedPaths = await resolveFiles(baseDir, configPattern)

      const availableDrizzleDatasources = await mapAsync(drizzleConfigsResolvedPaths, async (path) => {
        const config = await this.#jiti.import<DrizzleConfig>(path, { default: true })
        const [_, name] = path.match(/(.+\/(.+))\/.+$/)!.slice(1, 3) as [string, string]

        return await transformDrizzleConfig(config, {
          cwd: this.#options.cwd,
          path,
          name,
          connectorsDir,
          helpersDir,
          resolver,
        })
      })

      const configuredDrizzleDatasourceNames = db ?? {}

      const configuredDrizzleDatasources = availableDrizzleDatasources.filter((datasource) => {
        const datasourceConfig = configuredDrizzleDatasourceNames[datasource.name]
        if (datasourceConfig) {
          return datasourceConfig.connector == datasource.driver || datasourceConfig.connector == datasource.dialect
        }
      })

      logger?.info(
        accent`Using ${configuredDrizzleDatasources.length} of ${availableDrizzleDatasources.length} resolved datasources` + (configuredDrizzleDatasources.length > 0 ? ':' : ''),
        configuredDrizzleDatasources.map((datasource) => {
          const printName = [datasource.name, datasource.dialect, datasource.driver].filter(v => !!v).join('-')
          return colorize('greenBright', printName)
        }).join(', '),
      )

      this.#datasources = configuredDrizzleDatasources
    }

    return this.#datasources
  }
}

export type TransformDrizzleConfigOptions = {
  name: string
  path: string
  cwd: string
  connectorsDir: string
  helpersDir: string
  resolver: Resolver
}

async function transformDrizzleConfig(
  drizzleConfig: DrizzleConfig,
  { name, path, resolver, cwd, connectorsDir, helpersDir }: TransformDrizzleConfigOptions,
): Promise<DatasourceInfo> {
  const driver = 'driver' in drizzleConfig
    ? drizzleConfig.driver
    : undefined
  const dialect = drizzleConfig.dialect
  return {
    name,
    dialect,
    driver,
    imports: {
      config: path,
      schema: await mapAsync(drizzleConfig.schema ? [drizzleConfig.schema].flat() : [], async (schemaFilename) => {
        return await resolvePath(schemaFilename, { cwd })
      }),
      migrations: drizzleConfig.out
        ? await resolvePath(drizzleConfig.out, {
            type: 'dir',
            cwd,
          })
        : undefined,
      connector: await findPath('./connector', { cwd }) || resolver.resolve(connectorsDir, driver || dialect),
      helpers: resolver.resolve(helpersDir),
    },
  }
}

export interface ModuleContextOptions extends LoggerOptions {
  /**
   * Current working directory
   */
  cwd: string
  /**
   * Base directory to search drizzle config files
   */
  baseDir: string
  /**
   * Pattern for drizzle config files
   */
  configPattern: string | string[]
  /**
   * Module directory with connectors
   */
  connectorsDir: string
  /**
   * Module directory with helpers
   */
  helpersDir: string
  /**
   * Nuxt Kit resolver
   */
  resolver: Resolver
  /**
   * Connector options
   */
  datasource: Record<string, { connector?: ConnectorName } | undefined>
}

export function createModuleContext(options: ModuleContextOptions): ModuleContext {
  return new ModuleContextImpl(options)
}

export interface DatasourceInfo {
  name: string
  dialect: string
  driver: string | undefined
  imports: {
    config: string
    schema: string[]
    connector: string
    helpers: string
    migrations: string | undefined
  }
}
