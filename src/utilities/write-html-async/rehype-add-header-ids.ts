import { Element, Node } from 'hast'
import { hasProperty } from 'hast-util-has-property'
import { headingRank } from 'hast-util-heading-rank'
import { toMdast } from 'hast-util-to-mdast'
import { Heading } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { visit } from 'unist-util-visit'

import { createSlugFactory } from '../create-slug-factory.js'
import { Config } from '../types'

export function rehypeAddHeaderIds(
  options: {
    dataType: string
    id: string
  } & Pick<Config, 'createTocText' | 'filterToc'>
) {
  const { createTocText, dataType, filterToc, id } = options
  return (tree: Node) => {
    const createSlug = createSlugFactory()
    visit(tree, 'element', function (node: Element) {
      const level = headingRank(node)
      if (
        level === null ||
        hasProperty(node, 'id') === true ||
        typeof node.properties === 'undefined'
      ) {
        return
      }
      const mdast = toMdast(node) as Heading
      const text = toMarkdown({
        children: mdast.children,
        type: 'paragraph'
      }).trim()
      if (filterToc(text, { dataType, id, level }) === false) {
        return
      }
      const slug = createSlug(createTocText(text, { dataType, id, level }))
      node.properties.id = slug
    })
  }
}
