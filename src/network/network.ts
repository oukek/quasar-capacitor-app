import type { AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import Axios from 'axios'
import dayjs from 'dayjs'
import { jwtDecode } from 'jwt-decode'
import { eventBus } from 'src/utils/eventBus'
import { storage } from 'src/utils/storage'

// 自定义请求配置类型
type CustomRequestConfig = AxiosRequestConfig & {
  skipCodeCheck?: boolean
}

// 标准响应类型
type StandardResponse<T> = {
  code: number
  state: boolean
  msg: string
  data: T
}

// 根据 skipCodeCheck 返回不同的响应类型
type ResponseType<T, Skip extends boolean | undefined> = Skip extends true
  ? T
  : StandardResponse<T>

const defaultHeaders = {
  'Content-Type': 'application/json',
}

// 超时时间
const timeout = 100000
const host = import.meta.env.VITE_APP_API_HOST

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

const preDeal = async <T = any, Skip extends boolean | undefined = false>(
  fn: Promise<AxiosResponse<ResponseType<T, Skip>>>,
  opts?: { skipCodeCheck?: Skip },
) => {
  return fn
    .then((res) => {
      console.log('res', res)
      if (opts?.skipCodeCheck) {
        return res.data as T
      }

      const standardRes = res.data as StandardResponse<T>
      if (!standardRes.state) {
        // 请求失败，抛出错误信息
        // eventBus.emit('showToast', standardRes.msg)
        throw standardRes
      }

      // 如果有错误码，显示对应的错误信息
      // if (standardRes.code !== 0) {
      //   eventBus.emit('showI18nToast', `apiCode.${standardRes.code}`)
      // }
      if (standardRes.code === 403) {
        // 登录失效
        eventBus.emit('loginInvalid')
      }

      return standardRes.data
    })
    .catch((e) => {
      console.log('e', e)
      // showToast(e)
      // if (!e?.code && !e?.msg) {
      //   eventBus.emit('showI18nToast', `apiCode.500`)
      // }
      throw e
    })
}

const request = async <T = any>(method: Method, url: string, opts?: CustomRequestConfig) => {
  const { skipCodeCheck, ...axiosOpts } = opts || {}
  const options = Object.assign({ params: {}, headers: {}, data: {} }, axiosOpts)
  console.log('发起请求：', method, url)
  console.log('请求参数：', options)
  const fn = network({
    url,
    method,
    params: options.params,
    data: options.data,
    headers: options.headers,
    ...axiosOpts,
  })
  return preDeal<T, typeof skipCodeCheck>(fn, skipCodeCheck ? { skipCodeCheck } : undefined)
}

const get = async <T = any>(url: string, opts?: CustomRequestConfig) => {
  return request<T>('get', url, Object.assign({ params: {}, headers: {} }, opts))
}

const post = async <T = any>(url: string, opts?: CustomRequestConfig) => {
  return request<T>('post', url, Object.assign({ data: {}, headers: {} }, opts))
}

const deleteRequest = async <T = any>(url: string, opts?: CustomRequestConfig) => {
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
    const leftTime = data.exp ? data.exp - dayjs.tz().unix() : -1
    if (data && (leftTime > 0 || leftTime === -1)) {
      storage.save('jwt', jwt, leftTime)
      return true
    }
  }
  catch (e) {
    console.log(e)
  }
  return false
}

const authRequest = async <T>(method: Method, url: string, opts?: CustomRequestConfig) => {
  const options = Object.assign({ params: {}, headers: {}, data: {} }, opts)
  const cacheJwt = await storage.load('jwt')
  if (cacheJwt) {
    options.headers.Authorization = `Bearer ${cacheJwt}`
  }
  return request<T>(method, url, options)
}

const authGet = async <T>(url: string, opts?: CustomRequestConfig) => {
  return authRequest<T>('get', url, opts)
}

const authPost = async <T>(url: string, opts?: CustomRequestConfig) => {
  return authRequest<T>('post', url, opts)
}

const authDelete = async <T>(url: string, opts?: CustomRequestConfig) => {
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
