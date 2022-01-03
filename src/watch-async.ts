import chokidar from 'chokidar'
import { yellow } from 'kleur/colors'

import { buildAsync } from './build-async.js'
import { constants } from './utilities/constants.js'
import { log } from './utilities/log.js'
import { readConfigAsync } from './utilities/read-config-async/read-config-async.js'

export async function watchAsync(minify: boolean): Promise<void> {
  let watcher: chokidar.FSWatcher
  async function build() {
    log.info('Building...')
    const getBuildElapsedTime = trackElapsedTime()
    await buildAsync(minify)
    const buildElapsedTime = getBuildElapsedTime()
    log.clearPreviousLine()
    log.success(`Built in ${buildElapsedTime}`)
  }
  async function watch(): Promise<void> {
    await build()
    const config = await readConfigAsync()
    const filePaths: Array<string> = [
      config.dataDirectory,
      config.templatesDirectory,
      constants.configFileName,
      'lerna.json',
      'package.json',
      'tsconfig.json'
    ]
    if (config.cssDirectory !== null) {
      filePaths.push(config.cssDirectory)
    }
    if (config.globalsDirectory !== null) {
      filePaths.push(config.globalsDirectory)
    }
    if (config.jsDirectory !== null) {
      filePaths.push(config.jsDirectory)
    }
    if (config.mediaDirectory !== null) {
      filePaths.push(config.mediaDirectory)
    }
    watcher = chokidar.watch(filePaths)
    watcher.on('ready', function (): void {
      log.info('Watching...')
    })
    watcher.on('change', async function (file: string): Promise<void> {
      try {
        log.clearViewport()
        log.info(`Changed ${yellow(file)}...`)
        if (file === constants.configFileName) {
          log.info('Restarting watch...')
          await watcher.close()
          await watch()
          return
        }
        await build()
        log.info('Watching...')
      } catch (error: any) {
        log.error(error.message)
      }
    })
  }
  watch()
}

function trackElapsedTime(): () => string {
  const time = process.hrtime()
  return function (): string {
    const elapsedTime = process.hrtime(time)
    const duration = elapsedTime[0] + elapsedTime[1] / 1e9
    return yellow(`${duration.toFixed(3)}s`)
  }
}
