import { buildApp } from './app.js'

const PORT = Number(process.env.PORT) || 3333
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

async function main() {
  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`Server running at http://${HOST}:${PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

main()