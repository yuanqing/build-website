import { camelCase } from 'camel-case'
import { globby } from 'globby'
import path from 'path'

import { Config } from './types.js'

export async function readMediaAsync(
  options: Pick<Config, 'baseUrl' | 'mediaDirectory'>
): Promise<Record<string, string>> {
  const { baseUrl, mediaDirectory } = options
  const result: Record<string, string> = {}
  const filePaths = await globby('*', {
    cwd: mediaDirectory
  })
  for (const filePath of filePaths) {
    const id = path.basename(filePath, path.extname(filePath))
    const url = path.join(baseUrl, mediaDirectory, filePath)
    result[id] = url
    result[camelCase(id)] = url
  }
  return result
}
