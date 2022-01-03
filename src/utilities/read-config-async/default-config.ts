export const defaultConfig = {
  baseUrl: '/',
  buildDirectory: 'build',
  createTocText: function (text: string): string {
    return text
  },
  cssDirectory: null,
  dataDirectory: 'data',
  filterToc: function () {
    return true
  },
  globalsDirectory: 'globals',
  jsDirectory: null,
  mediaDirectory: 'media',
  templatesDirectory: 'templates'
}
