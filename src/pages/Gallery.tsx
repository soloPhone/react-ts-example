import { useReducer, useRef, useEffect } from 'react'
import { useFetch, useInfiniteScroll, useLazyLoad } from '../hooks/customeHooks'
import { api } from '../api'
import { useAbort } from '../api/request'

type State = {
  images: string[]
  fetching: boolean
  page: number
}

type ImgReducerAction =
  | { type: 'STACK_IMAGES'; images: string[]; fetching: boolean }
  | { type: 'FETCHING_IMAGES'; images: string[]; fetching: boolean }

type PageReducerAction = { type: 'ADD_PAGE'; page: number }

const imgReducer = (state: Omit<State, 'page'>, action: ImgReducerAction) => {
  switch (action.type) {
    case 'STACK_IMAGES':
      return { ...state, images: state.images.concat(action.images) }
    case 'FETCHING_IMAGES':
      return { ...state, fetching: action.fetching }
    default:
      return state
  }
}
const pageReducer = (state: Pick<State, 'page'>, action: PageReducerAction) => {
  switch (action.type) {
    case 'ADD_PAGE':
      return { ...state, page: state.page + 1 }
    default:
      return state
  }
}

function Gallery() {
  const [pager, pagerDispatch] = useReducer(pageReducer, { page: 0 })
  const [imgData, imgDispatch] = useReducer(imgReducer, { images: [], fetching: true })
  const bottomBoundaryRef = useRef(null)

  useFetch(pager, imgDispatch)
  useInfiniteScroll(bottomBoundaryRef, pagerDispatch)
  useLazyLoad('.card-img-top', imgData)

  useEffect(() => {
    setTimeout(() => api.getImageList(), 1000)
  }, [])

  const handleAbort = () => {
    console.log(1212)
    useAbort.abortRequest()
  }

  return (
    <div className="gallery">
      <nav className="navbar bg-light">
        <div className="container">
          <a href="/gallery">Gallery</a>
        </div>
      </nav>
      <button type="button" onClick={handleAbort}>
        abort
      </button>
      <div id="images" className="container">
        <div className="row">
          {imgData.images.map((image, index) => {
            const { author, download_url } = image as any
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="card">
                <div className="card-body ">
                  <img
                    alt={author}
                    className="card-img-top"
                    data-src={download_url}
                    src="https://picsum.photos/id/870/300/300?grayscale&blur=2"
                  />
                </div>
                <div className="card-footer">
                  <p className="card-text text-center text-capitalize text-primary">Shot by: {author}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div id="page-bottom-boundary" style={{ border: '1px solid red' }} ref={bottomBoundaryRef} />
    </div>
  )
}

export default Gallery
