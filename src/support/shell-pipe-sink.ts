import { Writable } from 'stream'
import { ProcessOutput } from 'zx'

export class ShellPipeSink extends Writable {
  chunk: string = ''

  constructor (private readonly sink: (text: string) => void) {
    super()
  }

  async _write (
    chunk: Buffer | ProcessOutput,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): Promise<void> {
    this.chunk += chunk.toString()
    let maxLines = 100
    while (this.chunk.includes('\n') || maxLines-- < 0) {
      const [toWrite, ...rest] = this.chunk.split(/\n/)
      this.chunk = rest.join('\n')
      if (toWrite.trim().length > 0) this.sink(toWrite)
    }
    callback()
  }
}
