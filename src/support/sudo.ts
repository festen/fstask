import { ProcessOutput, ProcessPromise, chalk } from 'zx'
import { executeRaw } from './raw-command'

const displayMessage = (numSudoCommands: number): void => {
  if (numSudoCommands === 0) return
  console.log()
  console.log(chalk.blue('Some scripts need sudo access, your password will be requested upfront.'))
  console.log(chalk.blue(`You are now prompted to answer your sudo password${numSudoCommands > 1 ? ` up to ${numSudoCommands} times` : ''}.`))
  if (numSudoCommands > 1) {
    console.log(chalk.blue('This is dependent on which shell sudo is asked for, which might not all be the same.'))
  }
}

const wrapShell = (shells: Array<string | boolean>, command: string): string[] =>
  shells
    .filter(shell => shell !== false)
    .map(shell => shell === true ? command : `${shell as string} "${command}"`)

export async function withContext<T> (
  sudo: Array<boolean | string>,
  fn: () => Promise<T>,
): Promise<T> {
  const children: Array<ProcessPromise<ProcessOutput>> = []
  const askPasswords = wrapShell(sudo, 'sudo -v')
  const loopPasswords = wrapShell(sudo, 'while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null')
  displayMessage(askPasswords.length)
  await Promise.all(askPasswords.map(executeRaw))
  children.push(...loopPasswords.map(executeRaw))
  console.log()

  try {
    return await fn()
  } finally {
    await Promise.allSettled(children.map(async (child) => await child?.kill(9)))
  }
}
