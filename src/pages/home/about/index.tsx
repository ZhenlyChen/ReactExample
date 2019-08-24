import React from 'react'
import './index.less'
import useReactRouter from 'use-react-router'
import {Button} from 'antd'
import { useStore } from '../../../Store';

const About: React.FC = () => {
  const { location, history } = useReactRouter()
  const store = useStore()
  return (
    <div className="App">
      <p>{store.user.name}</p>
      <p>{location.pathname}</p>
      <Button type="primary" onClick={()=>{
        history.push('/')
      }} >Hello</Button>
    </div>
  )
}

export default About
