import { camelCase } from 'camel-case'
import fs from 'fs-extra'
import { globby } from 'globby'
import path from 'path'

export async function readGlobalsAsync(
  directory: string
): Promise<Record<string, Record<string, any>>> {
  const result: Record<string, Record<string, any>> = {}
  const filePaths = await globby('*.json', {
    absolute: true,
    cwd: directory
  })
  for (const filePath of filePaths) {
    const id = path.basename(filePath, path.extname(filePath))
    const json = await fs.readJson(filePath)
    result[id] = json
    result[camelCase(id)] = json
  }
  return result
}
