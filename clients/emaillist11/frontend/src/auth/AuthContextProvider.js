import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext('');

export const AuthContextProvider = ({ children }) => {
    // 새 access token 발급받음: 반드시 동기 통신
    syncFetchToken();

    // token이 바낀 경우 전체를 선택적 Re-Rendering
    const [rerender, reRender] = useState(false);

    return (
        <AuthContext.Provider value={{  // 발급받은 새 access token을 Context에 저장
            tokenHolder: TOKEN_HOLDER,
            storeToken: (token, render=false) => {
                TOKEN_HOLDER.accessToken = token;
                render && reRender((rr) => !rr);
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Auth Context Hook
export const useAuthContext = () => {
    return useContext(AuthContext);
}

// Fetch Hook
export const useAuthFetch = (url, options, authorized=true) => {
    const navigate = useNavigate();

    return async (...params) => {
        try {
            options = options || {};

            options.method = (options.method || 'get').toLowerCase();

            options.headers = Object.assign(
                {},
                options.headers,
                authorized ? {'Authorization': `Bearer ${TOKEN_HOLDER.accessToken}`} : null,
                options.headers?.['Content-Type'] ? null : {'Content-Type': 'application/json'}
            );
            
            let paramsObject = null;

            params.forEach(param => {
                if(typeof param === 'object') {
                    paramsObject = Object.assign(paramsObject || {}, param);
                } else if(typeof param === 'string') {
                    url += `/${param}`;
                } else if(typeof param === 'number') {
                    url += `/${param}`;
                }
            });

            // console.log(paramsObject);

            paramsObject && (() => {
                if(options.method === "get") { // get
                    url = `${url}?${new URLSearchParams(paramsObject).toString()}`;
                } else { // post, delete, put
                    options.body = JSON.stringify(paramsObject);
                }
            })();

            // console.log(url, options);

            let response = null;
            let json = null;

            response = await fetch(url, options);

            if(response.status === 401 && authorized) { // Unauthorized (Invalid or Expired Token)!
                response = await fetch(REFRESH_TOKEN_ENDPOINT, {method: 'get', headers: {'Accept': 'application/json', credentials: 'include'}}); 
                json = await response.json();

                TOKEN_HOLDER.accessToken = json.data;

                options.headers = Object.assign(
                    {},
                    options.headers,
                    {'Authorization': `Bearer ${ACCESSTOKEN}`});

                response = await fetch(url, options);
            }

            if(!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`)
            }

            json = await response.json();

            if(json.result !== 'success') {
                throw new Error(`${json.result} ${json.message}`);
            }

            return json;

        } catch(err) {
            // 통신 에러가 나면 error 컴포넌트로 돌리고
            // 개발 중에는 화면에 내용 확인!
            // console.* 함수들은 development mode 일때는 작동하지만 production 모드일 때는 작동 안함(src/index.js 확인)
            console.error(err);
            navigate("/err");
        };
    }
}

// Fetch new access token issued with refresh token based (synchronous fetch) 
var TOKEN_HOLDER = {accessToken: undefined};

const syncFetchToken = () => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {
        if (xhr.status !== 200) {
            console.error(`${xhr.responseURL} ${xhr.status} (${xhr.statusText})`);
            return;
        }

        const json = JSON.parse(xhr.responseText);
        if (!json.data) {
            // cookie에 refresh token이 없거나(after logout 또는 first start), 또는 기간이 만료, 또는 유효하지 않은 refresh token를 cookie로 보냈음.
            console.log('Access token could not be issued with refresh token: EMPTY(logout or first start), EXPIRED or INVALID refresh token');
            return;
        }

        // 정상적으로 발급받은 access token을 메모리(전역변수)에 저장.
        TOKEN_HOLDER.accessToken = json.data;
        console.log(`access token issued: ${TOKEN_HOLDER.accessToken}`);
    });

    xhr.open('get', REFRESH_TOKEN_ENDPOINT, false);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
};