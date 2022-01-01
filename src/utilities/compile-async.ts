import fs from 'fs-extra'
import esbuild from 'esbuild'
import path from 'path'

import { Config } from './types.js'

export async function compileAsync(
  options: { directory: string; fileName: string; minify: boolean } & Pick<
    Config,
    'baseUrl' | 'buildDirectory'
  >
): Promise<null | string> {
  const { baseUrl, buildDirectory, directory, fileName, minify } = options
  const entryPoint = path.join(directory, fileName)
  if ((await fs.pathExists(entryPoint)) === false) {
    return null
  }
  await esbuild.build({
    bundle: true,
    entryPoints: [entryPoint],
    minify,
    outfile: path.join(buildDirectory, baseUrl, fileName)
  })
  return path.join(baseUrl, fileName)
}
