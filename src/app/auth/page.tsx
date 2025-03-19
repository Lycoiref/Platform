'use client'
import Image from 'next/image'
import ReactTypingEffect from 'react-typing-effect'
import { useRouter } from 'next/navigation'
import { InputHTMLAttributes, useState } from 'react'
import { Toast } from '@douyinfe/semi-ui'
import { student } from '@/store/basicInfoStore'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const LineInput = ({
  placeholder,
  type = 'text',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className="focus:border-b-3 w-3/5 border-b-2 border-black pb-1 pl-1"
      placeholder={placeholder}
      {...props}
    />
  )
}

type AuthType = 'login' | 'register'

type AuthFormProps = {
  type: AuthType
  toggleType: (targetType?: AuthType) => void
}

const AuthForm = (props: AuthFormProps) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { type, toggleType } = props

  const handleLogin = async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: username,
        password,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      // 设置token
      const token = data.token
      localStorage.setItem('token', token)
      // 跳转到首页
      student.setName(data.user.username)
      student.setId(data.user.id)
      router.push('/')
    } else {
      Toast.error('登录失败' + data.error)
    }
  }

  const handleRegister = async () => {
    console.log('register', username, email, password, confirmPassword)

    if (password !== confirmPassword) {
      Toast.error('密码不一致')

      return
    }
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    })

    const data = await res.json()
    if (res.ok && res.status === 201) {
      Toast.success('注册成功')

      toggleType('login')
    } else {
      Toast.error('注册失败' + data.error)
    }
  }

  return (
    <div className="right flex h-full flex-grow flex-col items-center justify-center gap-4 px-8">
      <div className="mb-8 ml-10 self-start text-2xl font-black">
        <div className="line">{type === 'login' ? '登录到' : '注册到'}</div>
        <div className="line">
          <ReactTypingEffect
            className="ml-6"
            text={['Hello', 'HelloWorld!']}
            speed={20}
            eraseSpeed={20}
            typingDelay={200}
            eraseDelay={1000}
          />
        </div>
      </div>
      {type === 'login' ? (
        <>
          <LineInput
            placeholder="用户名/邮箱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <LineInput
            placeholder="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      ) : (
        <>
          <LineInput
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <LineInput
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <LineInput
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LineInput
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </>
      )}
      {type === 'login' ? (
        <div className="mr-10 flex gap-2 self-end text-sm">
          {/* TODO: 换成Link到忘记密码页面 */}
          <div>忘记密码？</div>
          <div className="cursor-pointer" onClick={() => toggleType()}>
            注册账号
          </div>
        </div>
      ) : (
        <div className="mr-10 flex gap-2 self-end text-sm">
          <div className="cursor-pointer" onClick={() => toggleType()}>
            已有账号？登录账号
          </div>
        </div>
      )}
      {type === 'login' ? (
        <button
          onClick={handleLogin}
          className="w-3/5 rounded bg-black p-2 text-white transition-all hover:shadow-2xl"
        >
          登录
        </button>
      ) : (
        <button
          onClick={handleRegister}
          className="w-3/5 rounded bg-black p-2 text-white transition-all hover:shadow-2xl"
        >
          注册
        </button>
      )}
    </div>
  )
}

const Auth = () => {
  const [authType, setAuthType] = useState<AuthType>('login')

  const toggleType = (targetType?: AuthType) => {
    if (targetType) {
      setAuthType(targetType)

      return
    }
    setAuthType(authType === 'login' ? 'register' : 'login')
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Image
        width={400}
        height={400}
        className="fixed bottom-0 left-0"
        src="/Kotone_Fujita.webp"
        alt="琴音"
      />
      <div className="login-box z-10 flex h-[450px] w-[750px] items-center overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:scale-[102%] hover:shadow-2xl">
        <div className="left h-full overflow-hidden rounded-2xl shadow-2xl">
          <Image
            width={300}
            height={400}
            src="/美游.jpg"
            alt="美游"
            style={{
              height: '100%',
            }}
          />
        </div>
        <AuthForm type={authType} toggleType={toggleType} />
      </div>
    </div>
  )
}

export default Auth
