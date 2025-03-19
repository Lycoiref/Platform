import { makeAutoObservable } from 'mobx'

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
}

const student = new Student()
export { student }
