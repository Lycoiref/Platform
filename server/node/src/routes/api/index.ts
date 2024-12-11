import Router from '@koa/router'
import auth from './auth'
import file from './file'

const router = new Router()

interface LoginRequest {
  username: string
  password: string
}

router.use('/auth', auth.routes())

router.use('/file', file.routes(), file.allowedMethods())

export default router
