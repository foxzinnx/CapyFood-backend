import { buildApp } from './app.js'
import { env } from '@/shared/env/index.js'

async function main() {
  const app = await buildApp()

  const host = env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

  try {
    await app.listen({ port: env.PORT, host })
    console.log(`Server running at http://${host}:${env.PORT}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

main()