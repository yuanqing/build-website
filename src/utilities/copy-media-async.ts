import { camelCase } from 'camel-case'
import fs from 'fs-extra'
import { globby } from 'globby'
import path from 'path'

import { Config } from './types.js'

export async function copyMediaAsync(
  options: { mediaDirectory: string } & Pick<
    Config,
    'baseUrl' | 'buildDirectory'
  >
): Promise<Record<string, string>> {
  const { baseUrl, buildDirectory, mediaDirectory } = options
  const result: Record<string, string> = {}
  const filePaths = await globby('*', {
    cwd: mediaDirectory
  })
  for (const filePath of filePaths) {
    const outputFilePath = path.join(
      buildDirectory,
      baseUrl,
      mediaDirectory,
      filePath
    )
    await fs.copy(path.join(mediaDirectory, filePath), outputFilePath)
    const id = path.basename(filePath, path.extname(filePath))
    const url = path.join(baseUrl, mediaDirectory, filePath)
    result[id] = url
    result[camelCase(id)] = url
  }
  return result
}
