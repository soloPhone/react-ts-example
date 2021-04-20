import { useEffect } from 'react'
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import { KeepaliveRouterSwitch, KeepaliveRoute, addKeeperListener } from 'react-keepalive-router'
import Home from './pages/Home'
import Counter from './pages/Counter'
import Gallery from './pages/Gallery'
import './global.scss'

function App() {
  // const [status, setStatus] = useState('12')
  // console.log(3453454)
  // const getData = async () => {
  //   setStatus('222')
  //   console.log(status)
  //   const data = await fetch('https://api.github.com/')
  //   console.log(data)
  // }
  // useEffect(() => {
  //   getData()
  // })

  useEffect(() => {
    // 添加缓存监听器
    addKeeperListener((history, cacheKey) => {
      if (history) {
        console.log(`当前激活的缓存组件：${cacheKey}`)
      }
    })
  }, [])

  return (
    <BrowserRouter>
      <div style={{ width: '100%', display: 'flex' }}>
        <Link to="/">Home</Link>
        <Link to="/counter">Counter</Link>
        <Link to="/gallery">Gallery</Link>
      </div>
      <Switch>
        <Route path="/counter" component={Counter} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/" component={Home} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
