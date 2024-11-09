import Router from '@koa/router'
import { Context } from 'koa'

const router = new Router()

interface LoginRequest {
	username: string
	password: string
}

router.post('/login', (ctx) => {
	const { username, password } = ctx.request.body as LoginRequest

	console.log('[Login] ', username, password)

	const user = ctx.prisma.user.findFirst({
		where: {
			username,
			password,
		},
	})

	if (!user) {
		ctx.response.body = {
			code: 400,
			message: '用户名或密码错误',
		}

		return
	}

	ctx.response.body = {
		code: 200,
		message: '登录成功',
		data: {
			token: 'token',
		},
	}
})

export default router
