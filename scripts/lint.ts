/**
 * This script runs oxlint and oxfmt in a CI environment, without the need to install the entire
 * project. It reads the required version from pnpm-lock.yaml and executes the linters accordingly.
 * It's "stupid by design" so it could work in minimal Node.js environments.
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const lockfileContent = readFileSync('pnpm-lock.yaml', 'utf8')
const lines = lockfileContent.split(/\n/)

function getDependencyVersion(dependencyName: string): string {
  const versionRegex = new RegExp(`^\\s+${dependencyName}@([^\\s]+):`)

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(versionRegex)

    if (match) {
      return match[1]
    }
  }

  throw new Error(`Could not resolve ${dependencyName} version from pnpm-lock.yaml.`)
}

const oxlintVersion = getDependencyVersion('oxlint')
const oxfmtVersion = getDependencyVersion('oxfmt')

function runCommand(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: 'inherit' })

  if (result.status) {
    process.exit(result.status)
  }
}

runCommand('pnpx', [`oxlint@${oxlintVersion}`])
runCommand('pnpx', [`oxfmt@${oxfmtVersion}`, '--check'])
