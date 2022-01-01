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
    watcher = chokidar.watch([
      config.cssDirectory,
      config.dataDirectory,
      config.globalsDirectory,
      config.jsDirectory,
      config.mediaDirectory,
      config.templatesDirectory,
      constants.configFileName,
      'package.json',
      'lerna.json',
      'tsconfig.json'
    ])
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
