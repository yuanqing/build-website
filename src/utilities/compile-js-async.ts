import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'

import { constants } from './constants.js'
import { Config } from './types.js'

export async function compileJsAsync(
  options: { directory: string; minify: boolean } & Pick<
    Config,
    'baseUrl' | 'buildDirectory'
  >
): Promise<null | string> {
  const { baseUrl, buildDirectory, directory, minify } = options
  let entryPoint = path.join(directory, constants.jsFileName)
  if ((await fs.pathExists(entryPoint)) === false) {
    entryPoint = path.join(directory, constants.jsTypeScriptFileName)
    if ((await fs.pathExists(entryPoint)) === false) {
      return null
    }
  }
  await esbuild.build({
    bundle: true,
    entryPoints: [entryPoint],
    minify,
    outfile: path.join(buildDirectory, baseUrl, constants.jsFileName)
  })
  return path.join(baseUrl, constants.jsFileName)
}
