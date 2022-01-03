import stripIndent from 'strip-indent'

import { createSlugFactory } from '../create-slug-factory.js'
import { Config } from '../types.js'

const markdownHeaderRegex = /^(#{1,6}) ([^\n]+)$/gm

type TocItem = { level: number; text: string; slug: string }

export function parseToc(
  content: string,
  options: {
    dataType: string
    id: string
  } & Pick<Config, 'createTocText' | 'filterToc'>
): string {
  const { createTocText, dataType, filterToc, id } = options
  const createSlug = createSlugFactory()
  const result: Array<TocItem> = []
  const iterator = content.matchAll(markdownHeaderRegex)
  for (const matches of iterator) {
    const level = matches[1].length
    if (filterToc(matches[2], { dataType, id, level }) === false) {
      continue
    }
    const text = createTocText(matches[2], { dataType, id, level })
    if (text === null) {
      continue
    }
    const slug = createSlug(text)
    result.push({
      level,
      slug,
      text
    })
  }
  return createMarkdown(result)
}

function createMarkdown(toc: Array<TocItem>): string {
  const result: Array<string> = []
  for (const { level, slug, text } of toc) {
    result.push(`${'  '.repeat(level - 1)}- [${text}](#${slug})`)
  }
  return stripIndent(result.join('\n'))
}
