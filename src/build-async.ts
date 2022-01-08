import { compileCssAsync } from './utilities/compile-css-async.js'
import { compileJsAsync } from './utilities/compile-js-async.js'
import { copyMediaAsync } from './utilities/copy-media-async.js'
import { readConfigAsync } from './utilities/read-config-async/read-config-async.js'
import { readDataAsync } from './utilities/read-data-async/read-data-async.js'
import { readGlobalsAsync } from './utilities/read-globals-async.js'
import { readTemplatesAsync } from './utilities/read-templates-async.js'
import { readVersionAsync } from './utilities/read-version-async.js'
import { writeHtmlAsync } from './utilities/write-html-async/write-html-async.js'

export async function buildAsync(minify: boolean): Promise<void> {
  const config = await readConfigAsync()
  const data = await readDataAsync({
    baseUrl: config.baseUrl,
    createTocText: config.createTocText,
    data: config.data,
    dataDirectory: config.dataDirectory,
    filterToc: config.filterToc
  })
  const globals =
    config.globalsDirectory === null
      ? {}
      : await readGlobalsAsync(config.globalsDirectory)
  const media =
    config.mediaDirectory === null
      ? {}
      : await copyMediaAsync({
          baseUrl: config.baseUrl,
          buildDirectory: config.buildDirectory,
          mediaDirectory: config.mediaDirectory
        })
  const { templates, partials } = await readTemplatesAsync(
    config.templatesDirectory
  )
  const cssUrl =
    config.cssDirectory === null
      ? null
      : await compileCssAsync({
          baseUrl: config.baseUrl,
          buildDirectory: config.buildDirectory,
          cssDirectory: config.cssDirectory,
          minify
        })
  const jsUrl =
    config.jsDirectory === null
      ? null
      : await compileJsAsync({
          baseUrl: config.baseUrl,
          buildDirectory: config.buildDirectory,
          jsDirectory: config.jsDirectory,
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
    rehypePrettyCodeTheme: config.rehypePrettyCodeTheme,
    templates,
    version
  })
}
