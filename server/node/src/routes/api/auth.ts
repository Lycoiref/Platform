import Router from '@koa/router'
import { hashPassword, comparePassword } from '../../utils/bcrypt'
import { generateToken } from '../../utils/jwt'

import type { User } from '@prisma/client'

const router = new Router()

// 注册接口
router.post('/register', async (ctx) => {
	const { email, username, password, firstName, lastName } = ctx.request
		.body as User

	// 校验输入
	if (!email || !username || !password) {
		ctx.status = 400
		ctx.body = { error: 'Email, username, and password are required.' }
		return
	}

	// 检查用户是否已存在
	const existingUser = await ctx.prisma.user.findFirst({
		where: {
			OR: [{ email }, { username }],
		},
	})

	if (existingUser) {
		ctx.status = 409
		ctx.body = { error: 'Email or username already in use.' }
		return
	}

	// 哈希密码
	const hashedPassword = await hashPassword(password)

	// 创建用户
	const newUser = await ctx.prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
			firstName,
			lastName,
		},
	})

	// 生成 Token
	const token = generateToken({ id: newUser.id, email: newUser.email })

	ctx.status = 201
	ctx.body = {
		message: 'User registered successfully.',
		token,
		user: {
			id: newUser.id,
			email: newUser.email,
			username: newUser.username,
		},
	}
})

// 登录接口
router.post('/login', async (ctx) => {
	const { emailOrUsername, password } = ctx.request.body as {
		emailOrUsername: string
		password: string
	}

	// 校验输入
	if (!emailOrUsername || !password) {
		ctx.status = 400
		ctx.body = { error: 'Email/Username and password are required.' }
		return
	}

	// 查找用户
	const user = await ctx.prisma.user.findFirst({
		where: {
			OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
		},
	})

	if (!user) {
		ctx.status = 404
		ctx.body = { error: 'User not found.' }
		return
	}

	// 验证密码
	const isPasswordValid = await comparePassword(password, user.password)
	if (!isPasswordValid) {
		ctx.status = 401
		ctx.body = { error: 'Invalid password.' }
		return
	}

	// 生成 Token
	const token = generateToken({ id: user.id, email: user.email })

	// 返回用户信息和 Token
	ctx.status = 200
	ctx.body = {
		message: 'Login successful.',
		token,
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
		},
	}
})

export default router
