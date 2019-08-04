import React from 'react'
import './index.less'
import useReactRouter from 'use-react-router'
import {Button} from 'antd'

const About: React.FC = () => {
  const { location } = useReactRouter();
  return (
    <div className="App">
      <p>{location.pathname}</p>
      <Button type="primary" >Hello</Button>
    </div>
  )
}

export default About
