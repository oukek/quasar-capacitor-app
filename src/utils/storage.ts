class VStorage {
  private suffix: string[] = []

  constructor(suffix: string) {
    this.suffix.push(suffix)
  }

  public genKey(key: string) {
    return [...this.suffix, key].join(':')
  }

  public customSave(key: string, value: any) {
    try {
      let saveValue
      try {
        saveValue = JSON.stringify(value)
      }
      catch (e) {
        console.log(e)
        saveValue = value
      }
      window.localStorage.setItem(key, saveValue)
    }
    catch (e) {
      console.log(e)
      console.log('存储数据失败', key, value)
    }
  }

  public customLoad<T = any | null>(key: string, defaultValue?: T): T {
    let value: any = window.localStorage.getItem(key)
    if (value === null) {
      return defaultValue as T
    }
    try {
      value = JSON.parse(value)
    }
    catch (e) {
      console.log(e)
      value = defaultValue
    }
    return value
  }

  public save(key: string, value: any, exp?: number) {
    key = this.genKey(key)
    const data = {
      v: value,
      e: exp || -1,
      t: new Date().getTime() / 1000,
    }
    localStorage.setItem(key, JSON.stringify(data))
  }

  public load<T = any | null>(key: string, defaultValue?: T): T {
    key = this.genKey(key)
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue as T
    }
    try {
      const data = JSON.parse(item || '{}')
      if (!data.e || !data.t) {
        localStorage.removeItem(key)
        return defaultValue as T
      }
      if (data.e === -1) {
        return data.v
      }
      if (data.t + data.e <= new Date().getTime() / 1000) {
        localStorage.removeItem(key)
        return defaultValue as T
      }
      return data.v
    }
    catch (e) {
      console.log(e)
      localStorage.removeItem(key)
      return defaultValue as T
    }
  }

  public clear(key: string) {
    key = this.genKey(key)
    localStorage.removeItem(key)
  }

  public clearAll() {
    localStorage.clear()
  }
}

export const storage = new VStorage('study-game')
