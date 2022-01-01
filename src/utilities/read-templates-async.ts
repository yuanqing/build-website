import fs from 'fs-extra'
import { globby } from 'globby'
import path from 'path'

import { constants } from './constants.js'

export async function readTemplatesAsync(templatesDirectory: string): Promise<{
  templates: Record<string, string>
  partials: Record<string, string>
}> {
  return {
    partials: await readFilesAsync(
      path.join(templatesDirectory, constants.templatePartialsDirectoryName)
    ),
    templates: await readFilesAsync(templatesDirectory)
  }
}

async function readFilesAsync(
  directory: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const filePaths = await globby('*.html', {
    absolute: true,
    cwd: directory
  })
  for (const filePath of filePaths) {
    const id = path.basename(filePath, path.extname(filePath))
    result[id] = await fs.readFile(filePath, 'utf8')
  }
  return result
}
