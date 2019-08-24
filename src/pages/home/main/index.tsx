import React, { useEffect } from 'react'
import './index.less'
import { Button } from 'antd'
import { useLocalStore, useObserver } from 'mobx-react-lite'
import useReactRouter from 'use-react-router'
import { useStore } from '../../../Store'
import axios from 'axios'

const Main: React.FC = () => {
  const { history } = useReactRouter()

  const store = useStore()

  const localState = useLocalStore(() => ({
    count: 0,
    info: 'hell0,w0rld'
  }))

  const onClickAdd = () => {
    localState.count++
    store.user.name = '123'
  }

  const getData = async () => {
    try {
      const res = await axios.get('https://api.github.com/')
      console.log(res)
    } catch (error) {
      console.log(error.response.data.message)
      localState.info = error.response.data.message
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return useObserver(() =>
    <div className="App">
      <p>{store.user.name}</p>
      <p>{localState.info}</p>
      <p>{localState.count}</p>
      <Button onClick={onClickAdd}>Add</Button>
      <Button onClick={()=>{
        history.push('/about')
      }}>Go</Button>
    </div>
  )
}

export default Main
