import fs from 'fs-extra'
import htmlMinifier from 'html-minifier'
import lodashTemplate from 'lodash.template'
import path from 'path'

import { constants } from '../constants.js'
import { Config } from '../types.js'
import { renderMarkdownToHtmlAsync } from './render-markdown-to-html-async.js'

const interpolateRegex = /<%=([\s\S]+?)%>/g

export async function writeHtmlAsync(
  options: {
    baseUrl: string
    buildDirectory: string
    cssUrl: null | string
    data: Record<string, Array<Record<string, any>>>
    globals: Record<string, Record<string, any>>
    jsUrl: null | string
    media: Record<string, string>
    minify: boolean
    partials: Record<string, string>
    templates: Record<string, string>
    version: null | string
  } & Pick<Config, 'createTocText' | 'filterToc' | 'rehypePrettyCodeTheme'>
): Promise<void> {
  const {
    baseUrl,
    buildDirectory,
    createTocText,
    cssUrl,
    data,
    filterToc,
    globals,
    jsUrl,
    media,
    minify,
    partials,
    rehypePrettyCodeTheme,
    templates,
    version
  } = options
  for (const dataType in data) {
    let index = 0
    for (const { content, id, toc, ...rest } of data[dataType]) {
      const template = resolveTemplate(templates, { dataType, id })
      const interpolatedData = {
        ...globals,
        baseUrl,
        cssUrl,
        data,
        getNext: function () {
          const nextIndex = index + 1
          if (nextIndex === data[dataType].length) {
            return null
          }
          return data[dataType][nextIndex]
        },
        getPrevious: function () {
          const previousIndex = index - 1
          if (previousIndex < 0) {
            return null
          }
          return data[dataType][previousIndex]
        },
        id,
        jsUrl,
        media,
        order: -1,
        query: function (dataType: string, id?: string) {
          const items = data[dataType]
          if (typeof id === 'undefined') {
            return items
          }
          return items.find(function (item: Record<string, any>) {
            return item.id === id
          })
        },
        version,
        ...rest
      }
      const renderMarkdownToHtmlOptions = {
        createTocText,
        dataType,
        filterToc,
        id,
        rehypePrettyCodeTheme
      }
      const renderedContent = await renderMarkdownToHtmlAsync(
        lodashTemplate(content, { interpolate: interpolateRegex })(
          interpolatedData
        ),
        renderMarkdownToHtmlOptions
      )
      const renderedToc = await renderMarkdownToHtmlAsync(
        toc,
        renderMarkdownToHtmlOptions
      )
      const rendered = lodashTemplate(template)({
        ...interpolatedData,
        content: renderedContent,
        partial: function (partialName: string) {
          return lodashTemplate(partials[partialName])({
            ...interpolatedData,
            content: renderedContent,
            toc: renderedToc
          })
        },
        toc: renderedToc
      })
      const outputFilePath =
        path.extname(rest.url) === '.html'
          ? path.join(buildDirectory, rest.url)
          : path.join(buildDirectory, rest.url, 'index.html')
      await fs.outputFile(
        outputFilePath,
        minify === true
          ? htmlMinifier.minify(rendered, {
              collapseWhitespace: true,
              minifyCSS: true,
              minifyJS: true,
              removeComments: true,
              removeTagWhitespace: true
            })
          : rendered
      )
      index += 1
    }
  }
}

function resolveTemplate(
  templates: Record<string, string>,
  options: { dataType: string; id: string }
): string {
  const { dataType, id } = options
  const key = `${dataType}-${id}`
  if (typeof templates[key] !== 'undefined') {
    return templates[key]
  }
  if (typeof templates[dataType] !== 'undefined') {
    return templates[dataType]
  }
  return templates[constants.defaultTemplateId]
}
