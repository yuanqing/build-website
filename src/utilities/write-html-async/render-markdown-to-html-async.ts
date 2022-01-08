import { Element } from 'hast'
import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import remarkExternalLinks from 'remark-external-links'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import { unified } from 'unified'

import { constants } from '../constants.js'
import { Config } from '../types.js'
import { rehypeAddHeaderIds } from './rehype-add-header-ids.js'

export async function renderMarkdownToHtmlAsync(
  content: string,
  options: {
    dataType: string
    id: string
  } & Pick<Config, 'createTocText' | 'filterToc' | 'rehypePrettyCodeTheme'>
): Promise<string> {
  const { createTocText, dataType, filterToc, id, rehypePrettyCodeTheme } =
    options
  const processor = unified()
  processor.use(remarkParse)
  processor.use(remarkGfm)
  processor.use(remarkExternalLinks, { rel: false, target: '_blank' })
  processor.use(remarkToRehype, {
    allowDangerousHtml: true
  })
  processor.use(rehypeAddHeaderIds, { createTocText, dataType, filterToc, id })
  processor.use(rehypeAutolinkHeadings, {
    behavior: 'append',
    content: {
      type: 'text',
      value: '#'
    },
    properties: {
      ariaHidden: true,
      class: constants.headerLinkClass,
      tabIndex: -1
    },
    test: function (element: Element): boolean {
      const level = headingRank(element)
      if (level === null) {
        return false
      }
      const text = toString(element)
      return filterToc(text, { dataType, id, level }) === true
    }
  })
  if (rehypePrettyCodeTheme !== null) {
    processor.use(rehypePrettyCode, {
      onVisitHighlightedLine(node) {
        node.properties.className.push('line--highlighted')
      },
      onVisitLine(node) {
        if (node.children.length === 0) {
          node.children = [{ type: 'text', value: ' ' }]
        }
      },
      theme: rehypePrettyCodeTheme
    })
  }
  processor.use(rehypeStringify, {
    allowDangerousHtml: true
  })
  const result = await processor.process(content)
  return result.toString()
}
