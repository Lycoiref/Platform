# API Documentation

## 概述

这是一个简单的用户认证接口文档，包含用户登录和注册接口，使用 Token 认证方式。

---

## 接口要求

### 1. 注册接口

- **URL**: `/api/register`
- **请求方式**: `POST`
- **描述**: 注册新用户，成功后返回用户信息和认证 Token。

#### 请求参数

| 参数名   | 类型   | 必填 | 描述             |
| -------- | ------ | ---- | ---------------- |
| username | string | 是   | 用户名，需唯一   |
| password | string | 是   | 用户密码         |
| email    | string | 是   | 用户邮箱，需唯一 |

#### 请求示例

POST /api/register Content-Type: application/json

```json
{
  "username": "exampleUser",
  "password": "examplePassword",
  "email": "example@example.com"
}
```

#### 返回参数

| 参数名   | 类型   | 描述                         |
| -------- | ------ | ---------------------------- |
| userId   | string | 用户 ID                      |
| username | string | 用户名                       |
| email    | string | 用户邮箱                     |
| token    | string | 认证 Token，有效期由系统设定 |

#### 返回示例

```json
{
  "userId": "12345",
  "username": "exampleUser",
  "email": "example@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

#### 错误返回

| 状态码 | 错误信息              | 描述               |
| ------ | --------------------- | ------------------ |
| 400    | "Missing parameters"  | 请求参数不完整     |
| 409    | "User already exists" | 用户名或邮箱已存在 |

---

### 2. 登录接口

- **URL**: `/api/login`
- **请求方式**: `POST`
- **描述**: 用户登录，成功后返回用户信息和认证 Token。

#### 请求参数

| 参数名   | 类型   | 必填 | 描述     |
| -------- | ------ | ---- | -------- |
| username | string | 是   | 用户名   |
| password | string | 是   | 用户密码 |

#### 请求示例

POST /api/login Content-Type: application/json

```json
{ "username": "exampleUser", "password": "examplePassword" }
```

#### 返回参数

| 参数名   | 类型   | 描述                         |
| -------- | ------ | ---------------------------- |
| userId   | string | 用户 ID                      |
| username | string | 用户名                       |
| email    | string | 用户邮箱                     |
| token    | string | 认证 Token，有效期由系统设定 |

#### 返回示例

```json
{
  "userId": "12345",
  "username": "exampleUser",
  "email": "example@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

#### 错误返回

| 状态码 | 错误信息              | 描述             |
| ------ | --------------------- | ---------------- |
| 400    | "Missing parameters"  | 请求参数不完整   |
| 401    | "Invalid credentials" | 用户名或密码错误 |

---

## 认证机制

- **Token 类型**: `JWT`
- **存放方式**: 客户端需将 Token 保存在`Authorization`请求头中，格式如下：

  - Authorization: Bearer <token>

- **Token 有效期**: 根据系统配置决定有效期，Token 过期需重新登录。

---

## 错误处理

所有错误返回均为标准 HTTP 状态码，错误信息以 JSON 格式返回。错误响应格式如下：

```json
{ "error": "Error message" }
```
