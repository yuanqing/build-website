import esbuild from 'esbuild'
import fs from 'fs-extra'
import path from 'path'

import { constants } from './constants.js'
import { Config } from './types.js'

export async function compileJsAsync(
  options: { jsDirectory: string; minify: boolean } & Pick<
    Config,
    'baseUrl' | 'buildDirectory'
  >
): Promise<null | string> {
  const { baseUrl, buildDirectory, jsDirectory, minify } = options
  let entryPoint = path.join(jsDirectory, constants.jsFileName)
  if ((await fs.pathExists(entryPoint)) === false) {
    entryPoint = path.join(jsDirectory, constants.jsTypeScriptFileName)
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
