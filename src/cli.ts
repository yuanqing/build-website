#!/usr/bin/env node

import sade from 'sade'

import { buildAsync } from './build-async.js'
import { watchAsync } from './watch-async.js'

async function main() {
  sade('build-website', true)
    .option('-m, --minify', 'Minify', false)
    .option('-w, --watch', 'Rebuild on changes', false)
    .action(async function (options: {
      minify: boolean
      watch: boolean
    }): Promise<void> {
      const { minify, watch } = options
      if (watch === true) {
        await watchAsync(minify)
        return
      }
      await buildAsync(minify)
    })
    .parse(process.argv)
}
main()
