import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import Axios from 'axios'
import dayjs from 'dayjs'
import { jwtDecode } from 'jwt-decode'
import { eventBus } from 'src/utils/eventBus'
import { storage } from 'src/utils/storage'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

// 超时时间
const timeout = 100000
let host = ''
host = import.meta.env.VITE_APP_API_HOST
if (import.meta.env.VITE_APP_RUN_ENV === 'dev') {
  host = 'https://xlyn-api.ynxsl.top'
}

const config = {
  host,
  defaultHeaders,
  timeout,
}

const network = Axios.create({
  baseURL: config.host,
  headers: config.defaultHeaders,
  timeout: config.timeout,
})

network.interceptors.request.use(
  (res) => {
    return res
  },
  (error) => {
    throw error
  },
)

network.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    return response
  },
  (error) => {
    console.log(error)
    throw error?.response?.data
  },
)

const preDeal = async <T = any>(fn: Promise<AxiosResponse<{ code: number, data: T }>>) => {
  return fn
    .then((res) => {
      if (res.data.code) {
        eventBus.emit('showI18nToast', `apiCode.${res.data.code}`)
      }
      if (res.data.code === 403) {
        // 登录失效
        eventBus.emit('loginInvalid')
      }
      if (res.data.code !== 0) {
        throw res.data
      }
      return res.data.data
    })
    .catch((e) => {
      if (!e?.code) {
        eventBus.emit('showI18nToast', `apiCode.500`)
      }
      throw e
    })
}

const request = async <T = any>(method: Method, url: string, opts?: AxiosRequestConfig) => {
  const options = Object.assign({ params: {}, headers: {}, data: {} }, opts)
  console.log('发起请求：', method, url)
  console.log('请求参数：', options)
  const fn: Promise<AxiosResponse<{ code: number, data: T }>> = network({
    url,
    method,
    params: options.params,
    data: options.data,
    headers: options.headers,
    ...opts,
  })
  return preDeal<T>(fn)
}

const get = async <T = any>(url: string, opts?: AxiosRequestConfig) => {
  return request<T>('get', url, Object.assign({ params: {}, headers: {} }, opts))
}

const post = async <T = any>(url: string, opts?: AxiosRequestConfig) => {
  return request<T>('post', url, Object.assign({ data: {}, headers: {} }, opts))
}

const deleteRequest = async <T = any>(url: string, opts?: AxiosRequestConfig) => {
  return request<T>('delete', url, Object.assign({ data: {}, headers: {} }, opts))
}

const checkJwt = async () => {
  const jwt = await storage.load('jwt')
  if (jwt) {
    try {
      const data = jwtDecode<any>(jwt)
      const leftTime = data.exp - dayjs.tz().unix()
      if (data && leftTime > 0) {
        return true
      }
    }
    catch (e) {
      console.log(e)
    }
  }
  return false
}

const setJwt = (jwt: string) => {
  try {
    const data = jwtDecode<any>(jwt)
    const leftTime = data.exp - dayjs.tz().unix()
    if (data && leftTime > 0) {
      storage.save('jwt', jwt, leftTime)
      return true
    }
  }
  catch (e) {
    console.log(e)
  }
  return false
}

const authRequest = async <T>(method: Method, url: string, opts?: AxiosRequestConfig) => {
  const options = Object.assign({ params: {}, headers: {}, data: {} }, opts)
  const cacheJwt = await storage.load('jwt')
  if (cacheJwt) {
    options.headers.Authorization = `Bear ${cacheJwt}`
  }
  return request<T>(method, url, options)
}

const authGet = async <T>(url: string, opts?: AxiosRequestConfig) => {
  return authRequest<T>('get', url, opts)
}

const authPost = async <T>(url: string, opts?: AxiosRequestConfig) => {
  return authRequest<T>('post', url, opts)
}

const authDelete = async <T>(url: string, opts?: AxiosRequestConfig) => {
  return authRequest<T>('delete', url, opts)
}

export default {
  host: config.host,
  setJwt,
  checkJwt,
  request,
  post,
  get,
  deleteRequest,
  authRequest,
  authGet,
  authPost,
  authDelete,
}
