import fs from 'fs-extra'
import { globby } from 'globby'
import grayMatter from 'gray-matter'
import path from 'path'

import { constants } from '../constants.js'
import { Config } from '../types.js'
import { parseToc } from './parse-toc.js'

const interpolatedValueRegex = /\[ *([^\]]+) *\]/g

export async function readDataAsync(
  dataConfig: Config['data'],
  options: Pick<
    Config,
    'baseUrl' | 'createTocText' | 'dataDirectory' | 'filterToc'
  >
): Promise<Record<string, Array<Record<string, any>>>> {
  const { baseUrl, createTocText, dataDirectory, filterToc } = options
  const result: Record<string, Array<Record<string, any>>> = {}
  for (const dataType in dataConfig) {
    const dataTypeConfig = dataConfig[dataType]
    const { globPattern, extractValues } = parseInPattern(
      typeof dataTypeConfig === 'string' ? dataTypeConfig : dataTypeConfig.in
    )
    const createUrl =
      typeof dataTypeConfig === 'string'
        ? null
        : parseOutPattern(dataTypeConfig.out, { baseUrl })
    const filePaths = await globby(globPattern, { cwd: dataDirectory })
    result[dataType] = []
    for (const filePath of filePaths) {
      const absoluteFilePath = path.resolve(
        process.cwd(),
        dataDirectory,
        filePath
      )
      const fileContents = await fs.readFile(absoluteFilePath, 'utf8')
      const extractedValues = extractValues(filePath)
      const extension = path.extname(filePath)
      if (extension === '.json') {
        const data: Record<string, any> = {
          order: -1,
          ...extractedValues,
          ...JSON.parse(fileContents)
        }
        if (typeof data.id === 'undefined') {
          data.id = path.basename(filePath, extension)
        }
        const url = createUrl === null ? null : createUrl(data)
        result[dataType].push({ ...data, url })
        continue
      }
      const parsed = grayMatter(fileContents)
      const data: Record<string, any> = {
        order: -1,
        ...extractedValues,
        ...parsed.data
      }
      if (typeof data.id === 'undefined') {
        data.id = path.basename(filePath, extension)
      }
      const url = createUrl === null ? null : createUrl(data)
      result[dataType].push({
        ...data,
        content: parsed.content,
        toc: parseToc(parsed.content, {
          createTocText,
          dataType,
          filterToc,
          id: data.id
        }),
        url
      })
    }
    result[dataType].sort(function (
      x: Record<string, any>,
      y: Record<string, any>
    ): number {
      if (x.order === -1) {
        return 1
      }
      if (y.order === -1) {
        return -1
      }
      return x.order - y.order
    })
  }
  return result
}

function parseInPattern(inPattern: string): {
  globPattern: string
  extractValues: (string: string) => Record<string, string>
} {
  const extractValuesKeys: Array<string> = []
  const extractValuesRegexString = inPattern.replace(
    interpolatedValueRegex,
    function (match: string, key: string, index: number) {
      extractValuesKeys.push(key)
      const nextIndex = index + match.length
      return nextIndex < inPattern.length
        ? `([^${inPattern[nextIndex]}]+)`
        : `(.+)`
    }
  )
  const extractValuesRegex = new RegExp(`^${extractValuesRegexString}$`)
  return {
    extractValues: function (string: string): Record<string, string> {
      const matches = string.match(extractValuesRegex)
      if (matches === null) {
        return {}
      }
      const result: Record<string, string> = {}
      let index = 0
      for (const match of matches.slice(1)) {
        result[extractValuesKeys[index]] = match
        index += 1
      }
      return result
    },
    globPattern: inPattern.replace(interpolatedValueRegex, '*')
  }
}

function parseOutPattern(
  outPattern: string | [string, string],
  options: { baseUrl: string }
): (object: Record<string, any>) => string {
  const indexUrl = path.join(
    options.baseUrl,
    typeof outPattern === 'string' ? outPattern : outPattern[1]
  )
  const url = path.join(
    options.baseUrl,
    typeof outPattern === 'string' ? outPattern : outPattern[0]
  )
  return function (object: Record<string, any>) {
    return (object.id === constants.dataIndexId ? indexUrl : url)
      .replace(interpolatedValueRegex, function (_, key: string): string {
        if (typeof object[key] === 'undefined') {
          throw new Error('`object[key]` is `undefined`')
        }
        return object[key]
      })
      .replace(/\/index\.html$/, '/')
  }
}
