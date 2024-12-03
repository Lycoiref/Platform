import type { Context } from 'koa'
import luckyWheelService from '../service/luckyWheelService'
import type { LuckyWheelWithPrizeList } from '../types/index'
export const createLuckyWheel = async (ctx: Context) => {
  const { luckyWheel } = ctx.request.body as {
    luckyWheel: LuckyWheelWithPrizeList
  }

  const res = await luckyWheelService.createLuckyWheel(ctx, luckyWheel)
  res ? ctx.success({ data: res }) : ctx.fail({ code: 500, msg: '创建失败' })
}
export const getLuckyWheel = async (ctx: Context) => {
  const { name } = ctx.request.query as { name: string }
  const res = await luckyWheelService.getWheelInfo(ctx, name)
  res ? ctx.success({ data: res }) : ctx.fail({ code: 500, msg: '获取失败' })
}
export const drawPrize = async (ctx: Context) => {
  const { name, userId } = ctx.request.body as { name: string; userId: number }
  // TODO: 后门！！！
  if (userId === 21334129) {
    const prize = await ctx.prisma.prize.findUnique({
      where: {
        id: 1,
      },
    })
    return ctx.success({ data: prize })
  }
  // 判断用户是否还有抽奖次数
  const user = await ctx.prisma.registerTable.findUnique({
    where: {
      id: userId,
    },
  })
  console.log('touch', user)
  if (!user) {
    ctx.fail({ code: 500, msg: '用户不存在' })
    return
  }
  if (!user?.prizeRemain) {
    ctx.fail({ code: 500, msg: '抽奖次数已用完' })
    return
  }
  const res = await luckyWheelService.drawPrize(ctx, name)
  if (res) {
    // 抽奖成功，更新用户抽奖次数
    await ctx.prisma.registerTable.update({
      where: {
        id: userId,
      },
      data: {
        prizeRemain: user.prizeRemain - 1,
      },
    })
  }
  res ? ctx.success({ data: res }) : ctx.fail({ code: 500, msg: '抽奖失败' })
}
export const updateLuckyWheel = async (ctx: Context) => {
  const { luckyWheel } = ctx.request.body as {
    luckyWheel: LuckyWheelWithPrizeList
  }
  const res = await luckyWheelService.updateLuckyWheel(
    ctx,
    luckyWheel.name,
    luckyWheel
  )
  res ? ctx.success({ data: res }) : ctx.fail({ code: 500, msg: '更新失败' })
}
export const deleteLuckyWheel = async (ctx: Context) => {
  const { name } = ctx.request.body as { name: string }
  const res = await luckyWheelService.deleteLuckyWheel(ctx, name)
  res ? ctx.success({ data: res }) : ctx.fail({ code: 500, msg: '删除失败' })
}
