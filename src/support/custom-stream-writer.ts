/// <reference path="../../node_modules/zx/globals.d.ts"/>

import { Writable } from 'stream'
import 'zx'

export class CustomStreamWriter extends Writable {
  chunk: string = ''

  constructor(private sink: (text: string) => void) {
    super()
  }

  async _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    this.chunk += chunk.toString()
    while (this.chunk.includes('\n')) {
      const [toWrite, ...rest] = this.chunk.split(/\n/)
      this.chunk = rest.join('\n')
      if (toWrite.trim().length > 0) {
        await sleep(10)
        this.sink(toWrite)
      }
    }
    callback()
  }
}
