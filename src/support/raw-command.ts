import { ProcessOutput, ProcessPromise, $, nothrow } from 'zx'

// eslint-disable-next-line @typescript-eslint/promise-function-async
export function executeRaw (command: string): ProcessPromise<ProcessOutput> {
  const template: any = [command]
  template.raw = [command]
  return nothrow($(template as TemplateStringsArray))
}
