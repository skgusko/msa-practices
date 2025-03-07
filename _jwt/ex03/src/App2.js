import React from 'react';

function MyComponent({data}) {
    return (
        <>
            <h1>MyComponent</h1>
            <MyComponent01 />
            <MyComponent02 data={data}/>
        </>
    )
}

function MyComponent01() {
    return (
        <h3>MyComponent01</h3>
    )
}

function MyComponent02({data}) {
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

function App2(props) {
    return (
        <MyComponent data={"hello world"} />
    );
}

export default App2;