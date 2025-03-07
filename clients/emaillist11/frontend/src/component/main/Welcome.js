import React from 'react';
import {desc} from '../../assets/scss/Welcome.scss';

function Welcome() {
    return (
        <div id={'App'}>
            <h1>Welcome to Emaillist11</h1>
            <p className={desc}>
                로그인 안 한 경우에만 렌더링 되는 컴포넌트 예제
            </p>
        </div>
    );
}

export default Welcome;