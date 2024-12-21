import Router from '@koa/router'
import auth from './auth'
import file from './file'
import authMiddleware from '../../middleware/authMiddleware'
import type { Context } from 'koa'

const router = new Router()

interface LoginRequest {
  username: string
  password: string
}

router.use('/auth', auth.routes())

router.use('/file', authMiddleware(), file.routes(), file.allowedMethods())

router.get('/certification', authMiddleware(), async (ctx: Context) => {
  ;(ctx.status = 200), (ctx.body = { message: 'Success access!' })
})

export default router
