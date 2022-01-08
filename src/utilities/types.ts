export type Config = {
  baseUrl: string
  buildDirectory: string
  createTocText: (
    text: string,
    options: {
      dataType: string
      id: string
      level: number
    }
  ) => string
  cssDirectory: null | string
  data: Record<
    string,
    {
      in: string
      out: string | [string, string]
    }
  >
  dataDirectory: string
  filterToc: (
    text: string,
    options: {
      dataType: string
      id: string
      level: number
    }
  ) => boolean
  globalsDirectory: null | string
  jsDirectory: null | string
  mediaDirectory: null | string
  rehypePrettyCodeTheme: null | string | Record<string, string>
  templatesDirectory: string
}
