export const defaultConfig = {
  baseUrl: '/',
  buildDirectory: 'build',
  createTocText: function (text: string): string {
    return text
  },
  cssDirectory: 'css',
  dataDirectory: 'data',
  filterToc: function () {
    return true
  },
  globalsDirectory: 'globals',
  jsDirectory: 'js',
  mediaDirectory: 'media',
  templatesDirectory: 'templates'
}
