const pubSubCache: Record<string, any> = {
  $$vuuid: {
    $$vuuid: 1,
  },
  id_0: {
    // 全局列表
    $$vuuid: 1,
  },
}
const messageCache: Record<string, any> = {
  $$vuuid: 1,
}

function register(instance?: any) {
  try {
    instance.$$vuuid = instance.$$vuuid || pubSubCache.$$vuuid++
    pubSubCache[`id_${instance.$$vuuid}`] = {
      $$vuuid: 1,
    }
  }
  catch (e) {
    console.log(`can't register by ${instance}`, e)
  }
}

function unregister(instance?: any) {
  try {
    delete pubSubCache[`id_${instance.$$vuuid}`]
  }
  catch (e) {
    console.log(`can't unregister by ${instance}`, e)
  }
}

function on(type: string, handler: any, instance?: any) {
  if (typeof instance?.$$vuuid === 'undefined') {
    // 直接挂在全局
    instance = {
      $$vuuid: 0,
    }
  }
  const handleList = pubSubCache[`id_${instance.$$vuuid}`]
  if (!handleList) {
    throw new Error('未注册instance')
  }
  const cache = handleList[type] || (handleList[type] = {})
  handler.$$vuuid = handler.$$vuuid || handleList.$$vuuid++
  cache[handler.$$vuuid] = handler
  checkMessage(type)
}

function checkMessage(type: string) {
  if (messageCache[type]) {
    emit(type, ...messageCache[type])
    delete messageCache[type]
  }
}

function once(type: string, handler: any, instance?: any) {
  handler.$$once = true
  on(type, handler, instance)
}

function emit(type: string, ...params: any) {
  for (const k of Object.keys(pubSubCache)) {
    const handlelist = pubSubCache[k]
    const cache = handlelist[type]
    if (!cache) {
      continue
    }
    for (const key of Object.keys(cache)) {
      const fn = cache[key]
      if (fn.$$once) {
        off(type, fn, {
          $$vuuid: k.replace('id_', ''),
        })
      }
      fn(...params)
    }
  }
}

function emitToInstance(type: string, instance: any, ...params: any) {
  const handleList = pubSubCache[`id_${instance?.$$vuuid}`]
  if (!handleList) {
    return
  }
  const cache = handleList[type]
  if (!cache) {
    return
  }
  for (const key of Object.keys(cache)) {
    const fn = cache[key]
    if (fn.$$once) {
      off(type, fn, instance)
    }
    fn(...params)
  }
}

function stickyEmit(type: string, ...params: any) {
  let hasEmit = false
  for (const k of Object.keys(pubSubCache)) {
    const handlelist = pubSubCache[k]
    const cache = handlelist[type]
    if (!cache) {
      continue
    }
    for (const key of Object.keys(cache)) {
      const fn = cache[key]
      if (fn.$$once) {
        off(type, fn, {
          $$vuuid: k.replace('id_', ''),
        })
      }
      hasEmit = true
      fn(...params)
    }
  }
  if (!hasEmit) {
    messageCache[type] = params
    return
  }
  delete messageCache[type]
}

function off(type: string, handler: any, instance?: any) {
  try {
    instance.$$vuuid = instance.$$vuuid as unknown as any
  }
  catch (e) {
    console.log(`can't off by ${instance}`, e)
    // 直接挂在全局
    instance = {
      $$vuuid: 0,
    }
  }
  if (!handler || !handler.$$vuuid) {
    // 全部删除
    for (const k of Object.keys(pubSubCache)) {
      const handlelist = pubSubCache[k]
      delete handlelist[type]
    }
    return
  }
  const handleList = pubSubCache[`id_${instance.$$vuuid}`]
  const cache = handleList[type] || (handleList[type] = {})
  if (!cache) {
    return
  }
  if (handler.$$vuuid in cache) {
    delete cache[handler.$$vuuid]
  }
  if (Object.keys(cache).length <= 0) {
    delete handleList[type]
  }
}

export const eventBus = {
  register,
  unregister,
  on,
  once,
  emit,
  emitToInstance,
  stickyEmit,
  off,
}
