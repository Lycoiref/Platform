import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'admin',
      email: 'test@qq.com',
    },
  })
}
main()
