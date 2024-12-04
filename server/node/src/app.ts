import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import cors from '@koa/cors'
import path from 'path'
import serve from 'koa-static'
import routes from './routes'
import prisma from './prisma'
import errorHandler from './middleware/errorHandler'

import { koaSwagger } from 'koa2-swagger-ui'

// Initialize Koa app
const app = new Koa()
const router = new Router()

// Middleware
app.use(logger())
app.use(bodyParser())
app.use(cors())
// Prisma middleware
app.use(async (ctx, next) => {
  ctx.prisma = prisma
  await next()
})
// 打印用户访问的路由
app.use(async (ctx, next) => {
  console.log(`User accessed ${ctx.method} ${ctx.url}`)
  await next()
})

// Serve static files
app.use(serve(path.join(__dirname, 'public')))

// Basic route
router.get('/', async (ctx) => {
  ctx.body = 'Hello World!'
})

// Example of a protected route
router.get('/protected', async (ctx) => {
  // Example middleware for protected route
  if (!ctx.request.headers.authorization) {
    ctx.status = 401
    ctx.body = 'Unauthorized'
    return
  }
  ctx.body = 'Protected Content'
})

// Swagger UI (if you use Swagger for API documentation)
app.use(
  koaSwagger({
    routePrefix: '/swagger',
    swaggerOptions: {
      url: '/swagger.json',
    },
  })
)

// Register routes
app.use(router.routes())
app.use(routes.routes())
app.use(router.allowedMethods())

// Error handling
app.use(errorHandler)

// Error event listener
app.on('error', (err, ctx) => {
  console.error('Server error', err, ctx)
})

// Start the server
const PORT = process.env.PORT || 6677
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
