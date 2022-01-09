import { $, nothrow, ProcessOutput, ProcessPromise } from 'zx'

export async function withContext<T> (
  sudo: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  let child: ProcessPromise<ProcessOutput> | undefined
  if (sudo) {
    console.log('Some scripts eed sudo access, your password will be requested upfront.')
    console.log('You might be prompted to answer your sudo password twice.')
    console.log('This is because homebrew requires a bash shell, which might not be your current shell.')
    await $`sudo -v`
    await $`bash -c "sudo-v"`
    child = nothrow($`while true; do sudo -v; sleep 6000; done`)
  }
  try {
    return await fn()
  } finally {
    await child?.kill(9)
  }
}
