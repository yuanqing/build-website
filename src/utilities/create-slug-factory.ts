import GithubSlugger from 'github-slugger'
import { paramCase } from 'param-case'

const charactersRegex = /(?:&nbsp;)|(?:\xa0)|\.|\//g
const backquoteRegex = /`+([^`]+)`+/g

export function createSlugFactory() {
  const slugger = new GithubSlugger()
  return function (text: string): string {
    const result = text
      .replace(charactersRegex, ' ')
      .replace(backquoteRegex, function (_: string, string: string): string {
        return `\`${paramCase(string)}\``
      })
    return slugger.slug(result)
  }
}
