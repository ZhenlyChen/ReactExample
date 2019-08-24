import React from 'react'

export const storeContext = React.createContext<TStore | null>(null)

export type TUser = {
    name: string
    phone: string
}

export function createStore() {
    return {
        user: {} as TUser
    }
}

export type TStore = ReturnType<typeof createStore>

export const useStore = () => {
    const store = React.useContext(storeContext)
    if (!store) {
        throw new Error('You have forgot to use StoreProvider, shame on you.')
    }
    return store
}
