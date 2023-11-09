import React, { ReactNode } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

// Define your initial state and reducer function
const initialState = {
    sidebarShow: true,
};

const changeState = (state = initialState, { type, ...rest }: any) => {
    switch (type) {
        case 'set':
            return { ...state, ...rest };
        default:
            return state;
    }
};

const store = createStore(changeState);

export const StoreContext = React.createContext(store);

interface StoreProviderProps {
    children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
