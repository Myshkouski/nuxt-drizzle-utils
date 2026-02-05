import { defineCommand, runMain } from "citty";
import { createModuleContext } from './context'
import { createResolver, loadNuxtConfig } from '@nuxt/kit'
import * as path from "node:path";
import type { NuxtOptions } from "@nuxt/schema";

interface GenerateOrMigrateOptions {
  cmd: string
  dir: string
  name: string
  xargs: boolean
}

async function generateOrMigrate(options: GenerateOrMigrateOptions) {
  const cwd = process.cwd()
  const resolver = createResolver(import.meta.url)
  const nuxtConfigFile = path.join(path.resolve(cwd, options.dir), 'nuxt.config.ts')

  let nuxtConfig: NuxtOptions

  try {
    nuxtConfig = await loadNuxtConfig({
      cwd,
      configFile: nuxtConfigFile,
      configFileRequired: true,
    })
  } catch (cause) {
    throw new Error('Unable to load Nuxt config', { cause })
  }

  const context = createModuleContext({
    cwd,
    baseDir: cwd,
    configPattern: nuxtConfig.drizzle?.configPattern ?? [],
    resolver,
    // logger: createConsola(),
    datasource: nuxtConfig.drizzle?.datasource ?? {}
  })

  const dbs = await context.resolve()
  // console.debug(dbs)
  const db = dbs.find(db => options.name == db.name)!

  if (true == options.xargs) {
    console.log('drizzle-kit', options.cmd, '--config', db.imports.config)
    return
  }

  throw new Error("Not implemented, use --xargs to print resolved arguments for drizzle-kit.")
}

const generateOrMigrateArgs = {
  name: {
    description: "datasource name",
    required: true,
  },
  dir: {
    type: "positional",
    description: "Nuxt location",
    default: '.'
  },
  xargs: {
    type: 'boolean',
    alias: 'x',
    default: false,
  }
} as const

const generate = defineCommand({
  meta: {
    name: 'generate',
  },
  args: generateOrMigrateArgs,
  async run({ args, cmd }) {
    return await generateOrMigrate({
      cmd: (await cmd.meta)!.name!,
      dir: args.dir,
      name: args.name,
      xargs: args.xargs
    })
  },
})

const migrate = defineCommand({
  meta: {
    name: 'migrate'
  },
  args: generateOrMigrateArgs,
  async run({ args, cmd }) {
    return await generateOrMigrate({
      cmd: (await cmd.meta)!.name!,
      dir: args.dir,
      name: args.name,
      xargs: args.xargs
    })
  },
})

const main = defineCommand({
  subCommands: {
    generate,
    migrate,
  }
})

runMain(main)
