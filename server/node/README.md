本人平常喜欢用`nodejs`瞎 JB 写写东西，但是每次都要创建项目、安装依赖等等前戏工作，这让我很烦。于是乎写了个空的起手式，这样以后写东西直接 clone 下来就行了。

我觉得跟我一样的人应该很多，所以也把这个小东西分享给大家。

# ts-koa-starter

这是一个`koa`+`typescript`的起手式(简单的空环境)

如果你想再加个`typeorm`来玩玩数据库，请 clone 下来后切换到`bt-ts-koa-typeorm`分支

ps:`typeorm`是一个非常好的数据库 ORM，如果你没玩过，请务必尝试一下 💪💪💪

## 项目结构

```
.
├── src
│   ├── controller      //controller层
│   ├── service         //service层
│   ├── routes.ts       //路由
│   └── index.ts        //项目入口index.js
├── ecosystem.config.js //pm2配置
├── nodemon.json        //nodemon配置
├── package.json
└── tsconfig.json
```

## 使用

- git clone https://github.com/Vibing/ts-koa-starter.git
- yarn 或者 npm i
- yarn start 或 npm start
- 在浏览器中开打`localhost:3000`

### 打包

- yarn build 或 npm run build

### 生产环境启动

- 生产环境使用 pm2 启动 可以达到负载均衡 执行：yarn pro 或 npm run pro （生产环境端口默认：8080）

## 友情链接

- Koa2 [Koa (koajs) -- 基于 Node.js 平台的下一代 web 开发框架 \| Koajs 中文文档](https://koa.bootcss.com/)
- Typescript [TypeScript 中文网 · TypeScript——JavaScript 的超集](https://www.tslang.cn/)

## 数据库建模

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // 可以根据实际使用的数据库类型调整
  url      = env("DATABASE_URL")
}

model User {
  id         Int       @id @default(autoincrement())
  email      String    @unique
  username   String    @unique
  password   String
  firstName  String
  lastName   String
  role       Role      @default(USER)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  profile    Profile?
  memberships Membership[]
  sessions   Session[]
}

model Profile {
  id        Int     @id @default(autoincrement())
  bio       String?
  avatarUrl String?
  userId    Int     @unique
  user      User    @relation(fields: [userId], references: [id])
}

model Membership {
  id        Int       @id @default(autoincrement())
  role      String
  userId    Int
  clubId    Int
  user      User      @relation(fields: [userId], references: [id])
  club      Club      @relation(fields: [clubId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Club {
  id          Int          @id @default(autoincrement())
  name        String       @unique
  description String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  memberships Membership[]
}

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique
  users User[]
}

model Permission {
  id    Int    @id @default(autoincrement())
  name  String @unique
  roles Role[]
}

model RolePermission {
  id           Int  @id @default(autoincrement())
  roleId       Int
  permissionId Int
  role         Role @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model OAuthAccount {
  id            Int      @id @default(autoincrement())
  provider      String
  providerId    String
  accessToken   String
  refreshToken  String?
  expiresAt     DateTime?
  userId        Int
  user          User      @relation(fields: [userId], references: [id])
}

model Session {
  id           Int      @id @default(autoincrement())
  sessionToken String   @unique
  userId       Int
  user         User     @relation(fields: [userId], references: [id])
  expires      DateTime
}

model VerificationToken {
  id         Int      @id @default(autoincrement())
  identifier String
  token      String   @unique
  expires    DateTime
}
```

- User 模型：存储用户的基本信息、角色、与其他模型的关系（如 Profile, Membership, Session）。

- Profile 模型：存储用户的个人资料信息（如个人简介，头像链接）。

- Membership 模型：表示用户在某个社团中的角色与其加入的时间。

- Club 模型：存储社团的基本信息和成员关系。

- Role 模型：表示用户在系统中的角色（如管理员、普通用户等）。

- Permission 模型：系统中的权限定义，允许与角色相关联。

- RolePermission 模型：用来描述角色与权限之间的多对多关系。

- OAuthAccount 模型：存储 OAuth 相关信息，用于未来集成第三方登录。

- Session 模型：管理用户的会话，用于登录状态的维持。

- VerificationToken 模型：用于用户验证和其他需要一次性使用的 token 场景。
