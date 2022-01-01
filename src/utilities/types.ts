export type Config = {
  baseUrl: string
  buildDirectory: string
  cssDirectory: string
  data: Record<
    string,
    {
      in: string
      out: string | [string, string]
    }
  >
  dataDirectory: string
  globalsDirectory: string
  jsDirectory: string
  mediaDirectory: string
  templatesDirectory: string
  filterToc: (
    text: string,
    options: {
      dataType: string
      id: string
      level: number
    }
  ) => boolean
  createTocText: (
    text: string,
    options: {
      dataType: string
      id: string
      level: number
    }
  ) => string
}
