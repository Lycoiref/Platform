import type { Context, Next } from 'koa'
import { verifyToken } from '../utils/jwt'
import type { JwtPayload } from 'jsonwebtoken'

export default () => {
  return async (ctx: Context, next: Next) => {
    const token = ctx.headers['authorization']?.split(' ')[1]
    if (!token) {
      ctx.status = 401
      ctx.body = { message: 'Authentication token is missing' }
      return
    }

    const decode = verifyToken(token as string)
    if (decode === '') {
      ctx.status = 401
      ctx.body = { message: 'Invalid token' }
      return
    } else {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: (decode as JwtPayload).id,
        },
      })
      ctx.state.user = {
        id: user?.id,
        name: user?.username,
      }
    }
    await next() // 继续处理下一个中间件或路由
  }
}
