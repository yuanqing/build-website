import fs from 'fs-extra'

import { compileAsync } from './utilities/compile-async.js'
import { constants } from './utilities/constants.js'
import { copyMediaAsync } from './utilities/copy-media-async.js'
import { readConfigAsync } from './utilities/read-config-async/read-config-async.js'
import { readDataAsync } from './utilities/read-data-async/read-data-async.js'
import { readGlobalsAsync } from './utilities/read-globals-async.js'
import { readMediaAsync } from './utilities/read-media-async.js'
import { readTemplatesAsync } from './utilities/read-templates-async.js'
import { readVersionAsync } from './utilities/read-version-async.js'
import { writeHtmlAsync } from './utilities/write-html-async/write-html-async.js'

export async function buildAsync(minify: boolean): Promise<void> {
  const config = await readConfigAsync()
  await fs.remove(config.buildDirectory)
  const data = await readDataAsync(config.data, {
    baseUrl: config.baseUrl,
    createTocText: config.createTocText,
    dataDirectory: config.dataDirectory,
    filterToc: config.filterToc
  })
  const globals = await readGlobalsAsync(config.globalsDirectory)
  const media = await readMediaAsync({
    baseUrl: config.baseUrl,
    mediaDirectory: config.mediaDirectory
  })
  const { templates, partials } = await readTemplatesAsync(
    config.templatesDirectory
  )
  await copyMediaAsync({
    baseUrl: config.baseUrl,
    buildDirectory: config.buildDirectory,
    mediaDirectory: config.mediaDirectory
  })
  const cssUrl = await compileAsync({
    baseUrl: config.baseUrl,
    buildDirectory: config.buildDirectory,
    directory: config.cssDirectory,
    fileName: constants.cssFileName,
    minify
  })
  const jsUrl = await compileAsync({
    baseUrl: config.baseUrl,
    buildDirectory: config.buildDirectory,
    directory: config.jsDirectory,
    fileName: constants.jsFileName,
    minify
  })
  const version = await readVersionAsync()
  await writeHtmlAsync({
    baseUrl: config.baseUrl,
    buildDirectory: config.buildDirectory,
    createTocText: config.createTocText,
    cssUrl,
    data,
    filterToc: config.filterToc,
    globals,
    jsUrl,
    media,
    minify,
    partials,
    templates,
    version
  })
}
