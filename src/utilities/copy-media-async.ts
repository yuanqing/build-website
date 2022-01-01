import fs from 'fs-extra'
import path from 'path'

import { Config } from './types.js'

export async function copyMediaAsync(
  options: Pick<Config, 'baseUrl' | 'buildDirectory' | 'mediaDirectory'>
): Promise<void> {
  const { baseUrl, buildDirectory, mediaDirectory } = options
  const outputDirectory = path.join(
    process.cwd(),
    buildDirectory,
    baseUrl,
    mediaDirectory
  )
  await fs.copy(path.join(process.cwd(), mediaDirectory), outputDirectory)
}
