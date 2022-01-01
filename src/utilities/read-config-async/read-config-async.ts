import fs from 'fs-extra'
import path from 'path'

import { constants } from '../constants.js'
import { Config } from '../types.js'
import { defaultConfig } from './default-config.js'

export async function readConfigAsync(): Promise<Config> {
  const configFilePath = path.join(process.cwd(), constants.configFileName)
  if ((await fs.pathExists(configFilePath)) === false) {
    throw new Error('Need a `build-website.config.js` file')
  }
  const { default: config } = await import(configFilePath)
  return {
    ...defaultConfig,
    ...config
  }
}
