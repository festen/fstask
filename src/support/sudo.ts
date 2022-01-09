/* eslint-disable @typescript-eslint/promise-function-async */
import { $, ProcessOutput, ProcessPromise } from 'zx'
import { wrapCommand } from './wrap-command'

const $loop = wrapCommand('while true; do ', '; sleep 6000; done')

const defaultSudoCommand = 'sudo -v'

export async function withContext<T> (
  sudo: Array<boolean | string>,
  fn: () => Promise<T>,
): Promise<T> {
  const children: Array<ProcessPromise<ProcessOutput>> = []
  const sudoCommands = sudo
    .filter((s) => s !== false)
    .map((s) => (s === true ? defaultSudoCommand : s)) as string[]
  if (sudoCommands.length > 0) {
    console.log(
      'Some scripts eed sudo access, your password will be requested upfront.',
    )
    console.log('You might be prompted to answer your sudo password twice.')
    console.log(
      'This is because homebrew requires a bash shell, which might not be your current shell.',
    )
    await Promise.all(sudoCommands.map((cmd) => $`${cmd}`))
    children.push(...sudoCommands.map((cmd) => $loop`${cmd}`))
  }
  try {
    return await fn()
  } finally {
    await Promise.allSettled(children.map((child) => child?.kill(9)))
  }
}
