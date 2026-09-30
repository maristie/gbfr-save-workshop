import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const port = Number(process.env.PORT || 8000)
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  } catch {
    response.writeHead(400).end('Bad request')
    return
  }
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const filePath = resolve(root, relativePath)
  if (filePath !== root && !filePath.startsWith(root + sep)) {
    response.writeHead(403).end('Forbidden')
    return
  }

  try {
    const contents = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    if (request.method === 'HEAD') response.end()
    else response.end(contents)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Relink Save Workshop: http://127.0.0.1:${port}`)
  console.log('Local file server only; the save editor itself runs entirely in your browser.')
})
