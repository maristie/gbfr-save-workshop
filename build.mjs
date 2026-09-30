import { cp, mkdir, rm } from 'node:fs/promises'

const outputDirectory = new URL('./dist/', import.meta.url)
const sourceDirectory = new URL('./src/', import.meta.url)

await rm(outputDirectory, { recursive: true, force: true })
await mkdir(outputDirectory, { recursive: true })
await cp(new URL('./index.html', import.meta.url), new URL('./index.html', outputDirectory))
await cp(sourceDirectory, new URL('./src/', outputDirectory), { recursive: true })

console.log('Static site built in dist/.')
