import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import qs from 'qs'

type ParamsType = qs.ParsedQs | URLSearchParams
export interface CustomOptions {
  /** 是否启用全局请求loading，默认启用 */
  loadingEnabled?: boolean
  /** 是否可以主动abort，默认启用 */
  abortEnabled?: boolean
  /** 是否启用接口错误message提示，默认启用 */
  errorTipsEnabled?: boolean
}

export interface TraceData {
  config: AxiosRequestConfig
  sb: symbol
  customOptions?: CustomOptions
  [key: string]: any
}

export interface AxiosCustomOptions {
  /** 发送请求前调用，函数的求值会用来作为默认params */
  callParams?: () => ParamsType
  /** 替换默认response中间件，自定义then数据流 */
  resInterceptorOnFulfilled?: <T = any>(value: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>
  /** */
  transformError?: (err: any) => any | Promise<any>
  beforeRequest?: (traceData: TraceData) => void
  afterRequest?: (traceData: TraceData, result: { success: boolean; data: any }) => void
}

/** abort */
export function useAbort() {
  function addAbort(traceData: TraceData) {
    const { config, sb, customOptions: { abortEnabled = true } = {} } = traceData
    if (!sb || !abortEnabled) return
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    useAbort._abortMap.set(sb, source)
  }
  function removeAbort(traceData: TraceData) {
    const { sb } = traceData
    if (!sb) return
    if (!useAbort._abortMap.has(sb)) return
    useAbort._abortMap.delete(sb)
  }
  return [addAbort, removeAbort]
}
useAbort._abortMap = new Map()
function abort(s: symbol) {
  if (useAbort._abortMap.has(s)) {
    useAbort._abortMap.get(s)?.cancel()
    useAbort._abortMap.delete(s)
  }
}
useAbort.abortRequest = (s?: symbol) => {
  if (s) {
    abort(s)
  } else {
    useAbort._abortMap.forEach((_, symbol) => abort(symbol))
  }
}

/** loading */
export function useLoading(showLoading: (bool: boolean) => void, hideLoading: (bool: boolean) => void, delay?: number) {
  let realDealy = Number.parseInt(`${delay}`, 10)
  realDealy = realDealy > 0 ? (realDealy <= 300 ? realDealy : 300) : 0
  function toggleLoading(active: boolean) {
    function Loading() {
      const { size } = useLoading._loadingMap
      const loading = useLoading._loading
      if (active) {
        const bool = size !== 0 && !loading
        if (bool) {
          useLoading._loading = true
        }
        showLoading.call(null, bool)
      } else {
        const bool = size === 0 && loading
        if (bool) {
          useLoading._loading = false
        }
        hideLoading.call(null, bool)
      }
    }
    if (delay === 0) {
      return Loading()
    }
    return setTimeout(() => Loading(), realDealy)
  }
  function addLoading(traceData: TraceData) {
    const { symbol, customOptions: { loadingEnabled = true } = {} } = traceData
    if (!symbol || !loadingEnabled) return
    useLoading._loadingMap.set(symbol, 1)
    toggleLoading(true)
  }
  function removeLoading(traceData: TraceData) {
    const { symbol } = traceData
    if (!symbol) return
    if (!useLoading._loadingMap.has(symbol)) return
    useLoading._loadingMap.delete(symbol)
    toggleLoading(false)
  }
  return [addLoading, removeLoading]
}
useLoading._loadingMap = new Map()
useLoading._loading = false

/** errorTips */
export function useErrorTips(showErrorTips: (err: any) => void) {
  function callErrorTips(traceData: TraceData, err: any) {
    const { customOptions: { errorTipsEnabled = true } = {} } = traceData
    if (!errorTipsEnabled) return
    if (showErrorTips) {
      showErrorTips(err)
    }
  }
  return [callErrorTips]
}

export class AxiosRequest {
  readonly axiosInstance: AxiosInstance

  private readonly axiosOptions: AxiosCustomOptions

  constructor(requestConfig?: AxiosRequestConfig, options?: AxiosCustomOptions) {
    this.axiosInstance = axios.create(requestConfig)
    this.axiosOptions = options || {}

    // 添加公共参数处理中间件
    this.axiosInstance.interceptors.request.use((config) => {
      const { callParams } = this.axiosOptions
      const { url, params } = AxiosRequest.getAssignParamsConfig(config, callParams)
      return Object.assign(config, { url, params })
    })

    this.axiosInstance.interceptors.response.use((response) => {
      const { resInterceptorOnFulfilled } = this.axiosOptions
      if (typeof resInterceptorOnFulfilled === 'function') {
        return resInterceptorOnFulfilled(response)
      }
      return response
    })
  }

  private static getAssignParamsConfig(
    config: AxiosRequestConfig,
    ...args: Array<(() => ParamsType) | ParamsType | undefined>
  ) {
    const [url, queryStr = ''] = (config.url || '').split('?')
    const assignParams = args.map((fn) => (typeof fn === 'function' ? fn.call(null) : {}))
    const params = Object.assign({}, ...assignParams, qs.parse(queryStr), config.params)
    return {
      url,
      params,
    }
  }

  async request<R = AxiosResponse<any>>(config: AxiosRequestConfig, customOptions?: CustomOptions): Promise<R> {
    const sb = Symbol(config.url)
    const traceData: TraceData = { config, sb, customOptions }
    const { beforeRequest, afterRequest, transformError } = this.axiosOptions
    if (beforeRequest) {
      beforeRequest.call(null, traceData)
    }
    const result: { success: boolean; data: any } = {
      success: true,
      data: null,
    }
    return this.axiosInstance
      .request(config)
      .catch((error) => Promise.reject((transformError && transformError.call(null, error)) || error))
      .then((res) => {
        result.success = true
        result.data = res
        return res
      })
      .catch((error) => {
        result.success = false
        result.data = error
        return error
      })
      .finally(() => {
        if (afterRequest) {
          afterRequest.call(null, traceData, result)
        }
      })
  }
}

export interface CreateApiOptions {
  // axios实例配置
  axiosConfig?: AxiosRequestConfig
  /**
   * resInterceptorOnFulfilled 默认then按response.status === 200 && response.data?.retCode === 0处理
   */
  axiosCustomOptions?: AxiosCustomOptions
}

export class CustomError<T = any> {
  retCode?: number | string

  retMsg?: string

  _reason?: T

  constructor(error: T) {
    // if (!(this instanceof CustomError)) return new CustomError(error);
    if (error instanceof CustomError) return error
    let { retCode, retMsg } = (error as any)?.data || error || {}
    retCode = Number.isNaN(Number(retCode)) ? retCode : Number(retCode)
    if (!retMsg || typeof retMsg !== 'string') {
      retMsg = '系统繁忙，请稍后再试'
    }
    this.retCode = retCode
    this.retMsg = retMsg
    this._reason = error
  }

  toJSON() {
    return {
      retCode: this.retCode,
      retMsg: this.retMsg,
    }
  }
}

export default function createApi<T, R = any>(config: T, options?: CreateApiOptions) {
  const { axiosConfig, axiosCustomOptions } = options || {}
  const http = new AxiosRequest(
    {
      timeout: 60000,
      ...axiosConfig,
    },
    {
      resInterceptorOnFulfilled(response: AxiosResponse<any>) {
        if (response.status === 200 && +response.data?.retCode === 0) {
          return response.data
        }
        return Promise.reject(response.data)
      },
      callParams() {
        return {}
      },
      beforeRequest(traceData) {
        // console.log('use default beforeRequest')
      },
      transformError(err) {
        return new CustomError(err?.isAxiosError ? err?.response : err)
      },
      afterRequest(traceData, result) {
        // console.log('use default afterRequest')
      },
      ...axiosCustomOptions,
    },
  )

  type ConfigType = AxiosRequestConfig & { customOptions?: CustomOptions }
  const api = <{ [key in keyof T]: (config?: ConfigType) => Promise<R> }>{}
  Object.entries(config).forEach(([methodName, methodConfig]) => {
    api[methodName as keyof T] = ({ customOptions: requestOptions, ...requestConfig }: ConfigType = {}) => {
      return http.request(
        {
          ...methodConfig,
          ...requestConfig,
        },
        requestOptions,
      )
    }
  })

  return {
    ...api,
    _http: http,
  }
}
