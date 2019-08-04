# 使用 React Hooks 与 TypeScript 构建项目

今天本来想给 Violet 加上移动端的界面，使用 `material-ui` 作为组件库。但是如果在原来的基础上添加又异常蛋疼，因为这个组件库的示例是基于最新的 React Hooks 使用的，而我的项目中全都是 Class 的用法。Hooks 的思想可以极大提高组件的可复用性，据说 Vue 3.0 也是推荐这种用法，早就想使用 Hooks 重构一遍但无奈又没有时间，今天正好搞一下。

在现在这个时间点，对于单页面 Web 应用的框架我是更喜欢使用 React 的，就是因为他对于 TypeScript 的支持比较完善。老实说，用了 TypeScript 之后就再也不想碰 JavaScript 了，他的类型推断和代码跟踪结合 VSCode 使得我几乎可以完全脱离文档使用，带有类型的代码就是最好的文档。

## 创建项目

之前项目开始的时候，`create-react-app` 还没有对 TypeScript 进行支持，对于 TypeScript 的支持是基于 `ts-loader` 的，现在官方的 `create-react-app` 已经支持了基于 `babel` 的 TypeScript ,现在就正好来试试。

首先是创建应用

```bash
npx create-react-app violet-web --typescript
```

创建后把 `Webpack` 配置暴露出来便于我们自定义

```bash
npm run eject
```

## 依赖库

接下来就是配置一系列的依赖了，React 具有十分丰富的生态，我们可以使用自己喜欢的库构建我们的项目。

### TypeScript

首先是 TypeScript ，对于有一定规模的项目，当然是先定义我们的代码风格，在项目根目标下加入一个`tslint.json`，然后根据个人喜好定义代码风格标准：

```json
{
    "extends": ["tslint:recommended", "tslint-react", "tslint-config-prettier"],
    "linterOptions": {
      "exclude": [
        "node_modules"
      ]
    },
    "rules": {
      "semicolon": [true, "never"],
      "ordered-imports": false,
      "object-literal-sort-keys": false,
      "no-console": false,
      "member-access": false,
      "jsx-no-lambda": false,
      "object-literal-shorthand": false
    }
  }
```

### Less

一开始创建的项目默认是支持`sass`的，而`less`的支持需要我们自己添加进去：

```bash
npm i less less-loader -s
```

仿照`sass`在`config/webpack.config.js`中加入

```js
// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
```

同样仿照`sass`添加 Rule:

```js
// Less 解析配置
{
    test: lessRegex,
    exclude: lessModuleRegex,
    use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isEnvProduction && shouldUseSourceMap,
        }, 'less-loader'),
    sideEffects: true,
}, {
    test: lessModuleRegex,
    use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isEnvProduction && shouldUseSourceMap,
            modules: true,
            getLocalIdent: getCSSModuleLocalIdent,
        }, 'less-loader')
},
```

### React-route

当然少不了路由的依赖

```bash
npm i react-router react-router-dom -s
```

## 多入口配置

Violet 的前端是有多个入口的，将 主页 / 登陆 / 管理 三个部分根据业务场景分离开来，可以减少某些常见业务场景下需要加载的资源（比如最主要和最常见的授权登陆）

要实现多入口，就需要修改 Webpack 的打包配置。

首先是入口文件，将原来的单个入口修改成多个入口，这里声明了`index`和`account`两个入口文件的位置

```js
entry: {
    index: [
        isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appIndexJs,
    ].filter(Boolean),
    account: [
        isEnvDevelopment &&
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appAccountJs
    ].filter(Boolean)
},
```

声明多个入口后，就需要多个出口(生成文件)，这里通过使用`HtmlWebpackPlugin`这个插件生成。

```js
plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
        Object.assign(
            {
                inject: true,
                chunks: ['index'],
                template: paths.appHtml
            },
            // ...
        )
    ),
    new HtmlWebpackPlugin(
        Object.assign(
            {
                inject: true,
                chunks: ['account'],
                template: paths.appHtml,
                filename: 'account.html'
            },
            // ...
        )
    ),
	// ...
]
```

还有需要修改生成的`js`文件命名规则，不然会发生冲突而在调试的时候无法显示某一入口。即在`filename`的地方加上`[name]`来区分不同的生成`js`

```js
 output: {
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'static/js/[name].bundle.js',
 	  //...
 }
```

在调试的时候，还需要对路径进行改写，通过修改 `webpackDevServer.config.js` 这个文件实现。

```js
historyApiFallback: {
    // Paths with dots should still use the history fallback.
    // See https://github.com/facebookincubator/create-react-app/issues/387.
    disableDotRule: true,
        // 多入口重定向
        rewrites: [
            { from: /^\/account/, to: '/account.html' },
        ]
},
```

这样，就实现了主页`/`的入口以及登陆页`/account`的入口了。

## Hooks 入门

现在，我们先来看看 Hooks 是何方神圣，为什么 React 推出这种新的模式，为什么 Vue 3 也抛弃 Class 的提案，而转来模仿 Hooks

官网的介绍是，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性

### 动机

推出 Hooks 的动机就是为了解决在 React 开发中存在的痛点：

#### 在组件之间复用状态逻辑很难

当我们需要将可复用性的行为附加在组件中的时候，通常需要由一大堆抽象层组成“嵌套地狱”，比如在之前 Violet 的开发中，如果一个[组件](https://github.com/XMatrixStudio/Violet.Client.Web/blob/10e8f8ad0d3f7e8c6f2df1c15f0894e611587674/src/Pages/Account/Account/Components/Login/LoginForm.tsx#L98)需要注入表单和路由的状态和逻辑，需要使用两层的高阶组件来包住原来的组件，如果你的组件层次比较深，最终形成的组件可能是一层由一层的高阶组件。而**Hook 使你在无需修改组件结构的情况下复用状态逻辑**

```typescript
export default Form.create()(withRouter(NormalLoginForm))
```

这也是我需要使用 Hooks 的最主要的原因。基于 Hooks 可以实现状态逻辑的复用，也就是说移动端和PC端的状态逻辑可以进行复用，将代码统一起来，极大提升了项目的可维护性。

#### 复杂的组件难以理解

在传统的 Class 组件中，存在大量的状态。在网上随便一搜，都能搜到很多 ”图解 ES6 中的 React 生命周期“、”我对 React 生命周期的理解“、”详解 Vue 生命周期“ 等等的文章。在一些复杂的组件中，每个状态之间都有可能包含着大量的状态逻辑处理和副作用，在每个生命周期中，我们通常需要在同一个周期中处理一些没有关联的操作，比如在 Violet 中[新建应用](https://github.com/XMatrixStudio/Violet.Client.Web/blob/10e8f8ad0d3f7e8c6f2df1c15f0894e611587674/src/Pages/User/Home/Components/Apps/Form/NewAppForm.tsx#L30)的时候，需要在组件挂载的时候获取路由参数、设置标题、获取组织信息等等的操作。

```typescript
  componentWillMount() {
    this.ByName = this.props.match.params.by
    this.props.UIStore!.setTitle('新建应用', '创建新的应用')
    this.props.UIStore!.setBack(() => {
      this.goBack(this.ByName, false)
    })
    if (this.ByName !== 'me') {
      this.loadOrgInfo(this.ByName)
    }
  }
```

有时候，我们还需要在取消挂载的时候处理一下数据，这样就使得组件变得更加混乱和复杂了，同时难以进行进一步的拆分，并且很难对其进行复用。而 **Hook 可以将组件中相互关联的部分拆分成更小的函数**，不需要根据生命周期划分，因为在函数形式下是没有生命周期的，使得组件更加可预测，同时易于复用。

### 使用

**Hook 是什么？** Hook 是一个特殊的函数，它可以让你“钩入” React 的特性。下面我们就来看几个常用的 Hooks

#### `useState`

使用`userState`这一个 Hook， 我们可以赋予一个函数内部的状态，也就可以对状态逻辑做更好的复用。

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

`useState` 会返回一对值：**当前**状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。

`setCount`还能根**据先前的值计算**出新的值，只需要传入一个函数即可。

```jsx
<button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
```

如果初始状态需要计算，我们可以使用**惰性初始化**，即使用`useState`时传入一个参数进行初始化。

```jsx
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

#### `userEffect`

`useEffect` 是一个 Effect Hook，给函数组件增加了操作**副作用**的能力。也可以看做 class 组件中 `componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个生命周期函数的组合。

```jsx
import React, { useState, useEffect } from 'react';

function FriendStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

当你调用 `useEffect` 时，就是在告诉 React 在完成对 DOM 的更改后运行你的“副作用”函数。

相对于生命周期函数， 副作用发生在“渲染之后”，因此我们不用再去考虑“Mount”还是“Update”。

副作用函数还可以通过返回一个函数来指定如何“**清除**”副作用。例如，在下面的组件中使用副作用函数来订阅好友的在线状态，并通过取消订阅来进行清除操作。

```jsx
  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
```

有了`useEffect`,我们就可以对于 class 中生命周期函数的各种操作实现**关注点分离**，我们可以直接使用多个 `useEffect`操作，每个操作里面只对一个关注点进行操作。

```jsx
function FriendStatusWithCounter(props) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  const [isOnline, setIsOnline] = useState(null);
  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
  // ...
}
```

如果我们不想每次更新都执行副作用，也可以对其进行**性能优化**，只需要将需要监控的变量作为第二个参数传入`useEffect`即可。如果传入一个空数组(不会变化)，就可以实现`componentDidMount`的功能，只在组件挂载的时候被执行。

```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]); // 仅在 count 更改时更新
```

需要注意的是，`useEffect`的执行是异步的并且在渲染之后才会被触发，如果需要在渲染之前同步出发的话可以使用``useLayoutEffect``

#### 自定义 Hook

通过自定义 Hook, 我们可以将组件逻辑提取出来复用。

**自定义 Hook 是一个函数，其名称以 “use” 开头，函数内部可以调用其他的 Hook。**

```jsx
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```

从本质上来看，这就是一个普通的函数，他可以将状态逻辑封装起来，这样就可以实现逻辑的复用。

```jsx
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```

#### 其他 Hook

更多的用法可以参考 [官方文档](https://zh-hans.reactjs.org/docs/hooks-reference.html)

- 使用`useContext`可以获取到上下文环境状态

- 使用`useReducer`可以对复杂结构的状态进行管理

- 使用`useCallback`可以监听某个状态的变化并执行回调
- 使用`useMemo`可以监听状态并返回一个计算值，类似于 Vue 中的 `computed`
- 使用`useRef` 可以用户获取并保存一个子组件的`ref`，每次都会返回同一个对象
- 使用`useImperativeHandle`可以自定义暴露到父组件的`ref`

### 规则

对于 Hook 的使用，需要遵循两条规则

- **只在最顶层使用 Hook**。不要在循环、条件或者嵌套函数中使用。根据 Hook 的实现原理，当一个函数中存在多个 Hook 的时候，多个状态的对应关系是根据调用的顺序匹配的，如果顺序不对就不能将状态对应起来。
- **只在 React 函数中调用 Hook**。不要在普通的函数中调用 Hook。

### 原理

要想灵活地运用一种技术，那肯定要了解其底层的原理。其实 Hook 的实现也不复杂，主要的问题是如何将 Hook 的调用和各个组件联系起来的。在 React 中，每个组件内部都有一个 **记忆单元格** 的列表，用于存储组件的状态，当使用一次`useState`之后，状态的指针就会被指向下一个，状态时通过调用顺序对应起来的，这就是为什么我们需要遵循 Hook 规则的原因。

## 使用 TypeScript

对于使用 Hooks 的大多数情况，都可以直接推断类型

```typescript
const [age, setAge] = useState(20);
```

也可以显式指定类型

```typescript
// 初始化值为 null 或者 undefined时，需要显示指定 name 的类型
const [name, setName] = useState<string>();

// 初始化值为一个对象时
interface People {
    name: string;
    age: number;
    country?: string;
}
const [owner, setOwner] = useState<People>({name: 'rrd_fe', age: 5});

// 初始化值是一个数组时
const [members, setMembers] = useState<People[]>([]);
```

在官方的例子中，我们可以这样声明一个组件

```tsx
import React from 'react'
import './App.less'

const App: React.FC = () => {
  return (
    <div className="App">
      Hello
    </div>
  )
}

export default App
```

## 使用 React Router

既然要构建 Web 应用，那么 Router 是必不可少的。接下来使用 Hook 的方法使用 React Router

可以看看这篇[文章](https://blog.logrocket.com/how-react-hooks-can-replace-react-router/)，写的挺好的，这里以 hook 的形式写了一个`useRoute`来创建路由，只是我个人不是很喜欢将路由文件分离出来。

首先当然是安装依赖

```bash
 npm i react-router @/react-router-dom -S
 npm i @types/react-router @types/react-router-dom -D
```

首先构建一个普通的路由

```tsx
<BrowserRouter>
    <div>
        <Route exact={true} path="/" component={Main} />
        <Route path="/about" component={About} />
    </div>
</BrowserRouter>
```

然后路由中的信息可以通过参数注入

```tsx
import React from 'react'
import './index.less'
import { RouteComponentProps } from 'react-router'

interface IAboutProps extends RouteComponentProps<any> {}

const About: React.SFC<IAboutProps> = props => {
  return (
    <div className="App">
      {props.location.pathname}
    </div>
  )
}

export default About
```

在组件属于 Route 的 component 的情况下，这些参数会被自动注入，如果不在那么就没有办法获取到这些参数。在之前的项目中，是通过高阶组件`withRouter`实现参数的注入的。很高兴的是，有人实现了 Hook 形式的 `withRouter`. 我们只需要在 npm 上 install 这个`use-react-router`即可

```bash
npm i use-react-router -S
```

然后就可以很高兴地用起来了

```tsx
import React from 'react'
import './index.less'
import useReactRouter from 'use-react-router'

const About: React.FC = () => {
  const { location } = useReactRouter();
  return (
    <div className="App">
      {location.pathname}
    </div>
  )
}

export default About
```

可以看到 Hook 的存在极大简化了状态的复用，不用再写多余的高阶组件或者是参数接口。



## 使用 Ant Design

Ant Design 是一套比较完善的 UI 库，这里我们将他加入到我们的项目中。

首先安装 `antd`

```bash
npm i antd -S
```

然后安装按需引入插件`babel-plugin-import`

```bash
 npm i babel-plugin-import -D
```

本来应该在项目的根目录添加一个`.babelrc`的文件来配置`babel`，但是`create-react-app`默认把`babel`配置写在了`package.json`里面，因此我们也把配置写到里面。这样，就实现了按需引入组件的样式了。

```json
"babel": {
    "presets": [
        "react-app"
    ],
    "plugins": [
        [
            "import",
            {
                "libraryName": "antd",
                "libraryDirectory": "es",
                "style": "css"
            }
        ]
    ]
},
```



## 使用 Mobx

https://mobx-react.js.org/

虽然 Hook 加上 Context 已经可以很好地管理状态，但是 Mobx 可以帮助我们更方便地管理组件以及全局的状态。

