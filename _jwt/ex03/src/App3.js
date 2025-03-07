import React, {createContext, useContext} from 'react';

const MyContext = createContext();

function MyComponent() {
    return (
        <>
            <h1>MyComponent</h1>
            <MyComponent01 />
            <MyComponent02 />
        </>
    )
}

function MyComponent01() {
    return (
        <h3>MyComponent01</h3>
    )
}

function MyComponent02() {
    const {data} = useContext(MyContext);

    return (
        <>
            <h3>MyComponent01</h3>
            <dl>
                <dt>data</dt>
                <dd>{data}</dd>
            </dl>
        </>
    )
}

function App3(props) {
    return (
        <MyContext.Provider value={{data: "hello world"}}>
            <MyComponent />
        </MyContext.Provider>
    );
}

export default App3;