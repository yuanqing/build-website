import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'

import { constants } from './constants.js'
import { Config } from './types.js'

export async function compileCssAsync(
  options: { cssDirectory: string; minify: boolean } & Pick<
    Config,
    'baseUrl' | 'buildDirectory'
  >
): Promise<null | string> {
  const { baseUrl, buildDirectory, cssDirectory, minify } = options
  const entryPoint = path.join(cssDirectory, constants.cssFileName)
  if ((await fs.pathExists(entryPoint)) === false) {
    return null
  }
  await esbuild.build({
    bundle: true,
    entryPoints: [entryPoint],
    minify,
    outfile: path.join(buildDirectory, baseUrl, constants.cssFileName)
  })
  return path.join(baseUrl, constants.cssFileName)
}
