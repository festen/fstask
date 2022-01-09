/* eslint-disable @typescript-eslint/promise-function-async */
import { ProcessOutput, ProcessPromise, $ } from 'zx'

export const wrapCommand = (preCommand: string, postCommand = '') => (pieces: TemplateStringsArray, ...args: any[]): ProcessPromise<ProcessOutput> => {
  const wrapper = pieces.concat() as string[] & {raw: string[]}
  wrapper.raw = []
  wrapper.raw = pieces.raw.concat()
  wrapper.raw[0] = preCommand + wrapper.raw[0] + postCommand
  wrapper[0] = preCommand + wrapper[0] + postCommand
  return $(wrapper as unknown as TemplateStringsArray, ...args)
}
