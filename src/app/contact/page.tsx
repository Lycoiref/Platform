'use client'
import { UserIcon } from '@/components/static'
import { student } from '@/store/basicInfoStore'
import { observer } from 'mobx-react'
import { useRouter } from 'next/navigation'
const navItems = [
  {
    path: '/',
    route: '首页',
  },
  {
    path: '/about',
    route: '关于',
  },
  {
    path: '/assistant',
    route: '帮助',
  },
  {
    path: '/contact',
    route: '联系我们',
  },
]
const Contact = observer(() => {
  const router = useRouter()
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex h-[8%] w-full justify-between px-10 text-sm shadow-[0px_1px_4px_rgba(0,0,0,0.1)]">
        <div className="flex gap-6">
          <div className="flex items-center">
            <UserIcon></UserIcon>
          </div>
          <div className="flex items-center font-semibold">{student.name}</div>
        </div>
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            return (
              <div
                className="cursor-pointer hover:text-blue-800"
                style={{
                  fontWeight: '/contact' == `${item.path}` ? 600 : 500,
                  color: '/contact' == `${item.path}` ? '#193CB8' : '',
                }}
                onClick={() => {
                  router.push(item.path)
                }}
              >
                {item.route}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
export default Contact
