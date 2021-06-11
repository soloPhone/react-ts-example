import createApi, { useAbort } from './request'
import requestConfig from './requestConfig'

// eslint-disable-next-line react-hooks/rules-of-hooks
const [addAbort, removeAbort] = useAbort()

export const api = createApi(requestConfig, {
  axiosConfig: {
    baseURL: '/test',
  },
  axiosCustomOptions: {
    beforeRequest(traceData) {
      addAbort(traceData)
    },
    afterRequest(traceData) {
      removeAbort(traceData)
    },
  },
})
