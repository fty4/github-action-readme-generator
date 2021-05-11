import * as nconf from 'nconf'

import {actionYaml} from '../action-loader'
import {wrapText} from '../helpers'
import {readmePath} from '../inputs'
import {LogTask} from '../logtask'
import {updateReadme} from '../readme-writer'

export function updateUsage(token: string): void {
  const log = new LogTask(token)
  const actionName = `${nconf.get('owner') as string}/${nconf.get('repo')}`
  log.info(`Action name: ${actionName}`)
  let versionString: string
  if ((nconf.get('versioning:enabled') as string) === 'true') {
    const oRide = nconf.get('versioning:override') as string
    versionString = oRide && oRide.length > 0 ? oRide : process.env.npm_package_version

    if (versionString && !versionString.startsWith(nconf.get('versioning:prefix') as string)) {
      versionString = `${nconf.get('versioning:prefix') as string}${versionString}`
    }
  } else {
    versionString = nconf.get('versioning:branch') as string
  }
  log.info(`Version string: ${versionString}`)

  const actionReference = `${actionName}@${versionString}`

  if (!actionReference) {
    throw new Error('Parameter actionReference must not be empty')
  }

  // Build the new README
  const content: string[] = []
  // Build the new usage section
  content.push('```yaml', `- uses: ${actionReference}`, '  with:')

  const inputs = actionYaml.inputs
  let firstInput = true
  for (const key of Object.keys(inputs)) {
    // eslint-disable-next-line security/detect-object-injection
    const input = inputs[key]

    // Line break between inputs
    if (!firstInput) {
      content.push('')
    }

    // Constrain the width of the description, and append it
    wrapText(input.description, content, '    # ')

    if (input.default !== undefined) {
      // Append blank line if description had paragraphs
      if (input.description.trimRight().match(/\n[ ]*\r?\n/)) {
        content.push(`    #`)
      }

      // Default
      content.push(`    # Default: ${input.default}`)
    }

    // Input name
    content.push(`    ${key}: ''`)

    firstInput = false
  }

  content.push('```\n')

  updateReadme(content, token, readmePath)
}
