import { Element } from 'hast'
import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlightJs from 'rehype-highlight'
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
    createTocText: Config['createTocText']
    dataType: string
    filterToc: Config['filterToc']
    id: string
  }
): Promise<string> {
  const { createTocText, dataType, filterToc, id } = options
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
  processor.use(rehypeHighlightJs, {
    subset: false
  })
  processor.use(rehypeStringify, {
    allowDangerousHtml: true
  })
  const result = await processor.process(content)
  return result.toString()
}
