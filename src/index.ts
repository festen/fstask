import * as all from './public-api'
export * from './public-api'

all.registerTask({
  name: 'all',
  run: async ({ setOutput }) => {
    setOutput('test')
  },
})
