import { Component } from 'react'

class RenderWhenActive extends Component<any, any> {
  public shouldComponentUpdate(nextProps) {
    console.log('nextProps ==>', nextProps)
    return nextProps.active
  }

  public render() {
    console.log(this.props)
    return this.props.children
  }
}

export default RenderWhenActive
