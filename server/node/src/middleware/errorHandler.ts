import Koa from 'koa'

const errorHandler: Koa.Middleware = async (ctx, next) => {
  try {
    await next() // 执行下一个中间件
  } catch (error: unknown) {
    if (error instanceof Error) {
      // 错误处理逻辑
      ctx.status = 500
      ctx.body = {
        success: false,
        message: error.message || 'Internal Server Error',
      }

      // 如果有详细错误信息并且在开发环境中，包含更多信息
      if (process.env.NODE_ENV !== 'production' && error.stack) {
        ctx.body.stack = error.stack
      }

      // 在控制台输出错误信息（可选，适合开发环境）
      console.error('Error encountered:', error)

      // 触发 Koa 内部的错误事件，使日志记录中间件或工具能够监听
      ctx.app.emit('error', error, ctx)
    }
  }
}

export default errorHandler
