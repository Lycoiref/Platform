import Router from '@koa/router'
import auth from './auth'
import { Context } from 'koa'

const router = new Router()

interface LoginRequest {
	username: string
	password: string
}

router.use('/auth', auth.routes())

export default router
