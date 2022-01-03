import { $, nothrow, ProcessOutput, ProcessPromise } from 'zx'

let child: ProcessPromise<ProcessOutput>

export async function sudoStart() {
  await $`sudo -v`
  child = nothrow($`while true; do sudo -v; sleep 3; done`)
}

export async function sudoStop() {
  await child?.kill(9)
}
