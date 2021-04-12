import React, { useEffect, useState } from 'react'
import { HashRouter, Route, Link } from 'react-router-dom'
import { KeepaliveRouterSwitch, KeepaliveRoute, addKeeperListener } from 'react-keepalive-router'
import Home from './pages/Home'
import Counter from './pages/Counter'
import './index.less'
import './global.scss'

function App() {
  const [status, setStatus] = useState('12')
  const getData = async () => {
    setStatus('222')
    console.log(status)
    const data = await fetch('https://api.github.com/')
    console.log(data)
  }
  useEffect(() => {
    getData()
  })

  useEffect(() => {
    // 添加缓存监听器
    addKeeperListener((history, cacheKey) => {
      if (history) {
        console.log(`当前激活的缓存组件：${cacheKey}`)
      }
    })
  }, [])

  return (
    <div>
      <HashRouter>
        <div>
          <Link to="/">Home</Link>
          <Link to="/counter">Counter</Link>
        </div>
        <KeepaliveRouterSwitch>
          <KeepaliveRoute path="/counter" component={Counter} />
          <Route path="/" component={Home} />
        </KeepaliveRouterSwitch>
      </HashRouter>
    </div>
  )
}

export default App
