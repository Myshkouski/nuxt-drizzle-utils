import type { Config } from "drizzle-kit"
import { resolve as resolvePath, relative as relativePath } from "node:path"

export function defineConfig(config: Config, dirname: string) {
  const {
    schema,
    out,
    ...other
  } = config

  const cwd = process.cwd()

  return {
    schema: transformToPluginCompatiblePath(dirname, cwd, schema),
    out: transformToPluginCompatiblePath(dirname, cwd, out),
    ...other,
  }
}
function transformToPluginCompatiblePath(dirname: string, cwd: string, path: string | undefined): string | undefined
function transformToPluginCompatiblePath(dirname: string, cwd: string, path: string | string[] | undefined): string | string[] | undefined
function transformToPluginCompatiblePath(dirname: string, cwd: string, path: string | string[] | undefined) {
  if (!path) return;
  if (Array.isArray(path)) {
    return path.flatMap(path => transformToRelative(dirname, cwd, path))
  }
  return relativePath(cwd, resolvePath(dirname, path))
}

function transformToRelative(dirname: string, cwd: string, path: string) {
  path = resolvePath(dirname, path)
  return relativePath(cwd, path)
}
