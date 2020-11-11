import React, { useEffect, useState } from 'react'
import Layout from 'Components/Layout'
import './index.less'

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

  return (
    <div>
      <h3>ee1</h3>
      <Layout />
      <Layout />
    </div>
  )
}

export default App
