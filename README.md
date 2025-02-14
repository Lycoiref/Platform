# HelloWorld Platform

这是一个 **platform** 模板，适用于各种团体管理（如社团，班级，家庭等等）

## Before Started

快速开始

```bash
# 克隆项目
$ git clone git@github.com:Lycoiref/Platform.git

# 进入项目进行相关操作
$ cd Platform
```

在启动此项目之前，需要在根目录下新建 `.env` 文件并在其中配置服务端启动地址（若无需部署到云端请按如下配置，若需要则按需改动）

NEXT_PUBLIC_BASE_URL = "http://localhost:6677"

另外还需在 `/server/node` 新建 `.env` 文件配置 `postgres` 数据库所在位置与 `JWT` 密钥
如：

DATABASE_URL = "postgresql://role:password@ip/name?schema=public"

SECRET_KEY = 'Your_Key'

## Getting Started

第一步，启动服务端

在 `/server/node` 下运行

```bash
$ pnpm install # 安装依赖

$ npm start # 启动服务端
```

在项目根目录下安装依赖 & 启动调试

```bash
$ pnpm install
$ pnpm dev
# or
$ yarn
$ yarn dev
```

即可在本地地址 http://localhost:3000 查看项目啦 : )

## Technology Stack

### 本项目采用前后端分离的开发模式，具体技术栈如下所示

- Frontend : Next.js
- Backend : Koa & Golang & Rust
- Database : Postgres

### ui

- semi-design
