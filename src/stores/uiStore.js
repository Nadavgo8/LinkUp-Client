import { makeAutoObservable } from 'mobx'

class UiStore {
  errors = [] 

  constructor() {
    makeAutoObservable(this) 
  }
  
  pushError(message) {
    const id = crypto.randomUUID()
    this.errors.push({ id, message })
    setTimeout(() => this.dismiss(id), 5000)
  }
  dismiss(id) { this.errors = this.errors.filter(e => e.id !== id) }
}
export const ui = new UiStore()
