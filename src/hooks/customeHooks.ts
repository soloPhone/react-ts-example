import { useEffect, useCallback, useRef } from 'react'

export const useFetch = (data, dispatch) => {
  useEffect(() => {
    if (data.page > 0) {
      dispatch({ type: 'FETCHING_IMAGES', fetching: true })
      fetch(`https://picsum.photos/v2/list?page=${data.page}&limit=10`)
        .then((res) => res.json())
        // eslint-disable-next-line promise/always-return
        .then((images) => {
          dispatch({ type: 'STACK_IMAGES', images })
          dispatch({ type: 'FETCHING_IMAGES', fetching: false })
        })
        .catch((error) => {
          // handle error
          dispatch({ type: 'FETCHING_IMAGES', fetching: false })
          return error
        })
    }
  }, [dispatch, data.page])
}

export const useInfiniteScroll = (scrollRef, dispatch) => {
  const scrollObserver = useCallback(
    (node) => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            dispatch({ type: 'ADD_PAGE' })
          }
        })
      })
      intersectionObserver.observe(node)
      return () => intersectionObserver.disconnect()
    },
    [dispatch],
  )
  useEffect(() => {
    if (scrollRef.current) {
      scrollObserver(scrollRef.current)
    }
  }, [scrollRef, scrollObserver])
}

export const useLazyLoad = (imageSelector, items) => {
  const imgObserver = useCallback((node) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          const currentImg = entry.target as HTMLImageElement
          const newImgSrc = currentImg.dataset.src
          if (newImgSrc) {
            currentImg.src = newImgSrc
          } else {
            console.error('Image source is invalid')
          }
          intersectionObserver.observe(node)
        }
      })
    })
    intersectionObserver.observe(node)
  }, [])

  const imgRef = useRef<NodeListOf<HTMLImageElement> | null>(null)

  useEffect(() => {
    imgRef.current = document.querySelectorAll<HTMLImageElement>(imageSelector)
    if (imgRef.current) {
      imgRef.current.forEach((img) => imgObserver(img))
    }
  }, [imageSelector, imgObserver, items])
}
