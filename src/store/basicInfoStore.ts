import { makeAutoObservable } from 'mobx'
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

class Student {
  name: string = '游客'
  id: number = 88888888
  constructor() {
    makeAutoObservable(this)
  }
  setName(name: string) {
    this.name = name
  }
  setId(id: number) {
    this.id = id
  }
  async judgeToken(): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/api/certification`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.status === 401) {
        console.log('Invalid token.')
        return
      }

      const data = await response.json()

      if (data) {
        this.setId(data.id)
        this.setName(data.name)
        return
      }

      return
    } catch (err) {
      console.error('Token verification failed:', err)
      throw err
    }
  }
}

const student = new Student()
export { student }
