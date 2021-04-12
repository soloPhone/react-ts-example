import React, { useState } from 'react'

function Counter(props) {
  const [count, setCount] = useState(0)
  console.log(props)
  return (
    <div>
      counter
      <p>{count}</p>
      <button type="button" onClick={() => setCount((pre) => pre + 1)}>
        Add
      </button>
      <button type="button" onClick={() => setCount(0)}>
        reset
      </button>
    </div>
  )
}

export default Counter
