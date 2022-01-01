import fs from 'fs-extra'

export async function readVersionAsync(): Promise<null | string> {
  if ((await fs.pathExists('lerna.json')) === true) {
    return (await fs.readJson('lerna.json')).version
  }
  if ((await fs.pathExists('package.json')) === true) {
    return (await fs.readJson('package.json')).version
  }
  return null
}
