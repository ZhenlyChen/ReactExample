import React from 'react'
import logo from '../../assets/logo.svg'
import './App.less'

// router
import { BrowserRouter, Route } from 'react-router-dom';
import Main from './main';
import About from './about';


const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <BrowserRouter>
          <div>
            <Route exact={true} path="/" component={Main} />
            <Route path="/about" component={About} />
          </div>
        </BrowserRouter>
      </header>
    </div>
  )
}

export default App
