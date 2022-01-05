import { $, nothrow, ProcessOutput, ProcessPromise } from 'zx'

export async function withContext<T> (
  sudo: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  let child: ProcessPromise<ProcessOutput> | undefined
  if (sudo) {
    await $`sudo -v`
    child = nothrow($`while true; do sudo -v; sleep 6000; done`)
  }
  try {
    return await fn()
  } finally {
    await child?.kill(9)
  }
}
