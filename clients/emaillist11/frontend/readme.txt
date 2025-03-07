Emaillist: Frontend

1.  설치
    1)  개발툴
        $ npm i -D webpack webpack-cli webpack-dev-server css-loader style-loader sass-loader sass babel-loader @babel/core @babel/preset-env @babel/preset-react case-sensitive-paths-webpack-plugin nodemon
    2)  라이브러리
        $ npm i react react-dom react-addons-update jwt-decode react-router react-router-dom react-modal form-serialize axios styled-components

2.  설정
    1)  webpack.config.js
    2)  babel.config.json
    3)  nodemon.json 

3.  스트립팅
    "scripts": {
        "start": "npx webpack serve --config config/webpack.config.js --progress --mode development",
        "build": "npm i && npx webpack --config config/webpack.config.js --mode production",
        "dev:build": "nodemon --config config/nodemon.json --exec \"npx webpack --config config/webpack.config.js --mode development\""
    }

4.  webpack 테스트 서버 실행
    $ npm start

5.  테스트 빌드: backend가 OAuth2 Client 역할을 하기 때문에 테스트 빌드 후 테스트 진행 가능
    $ npm dev:build

6.  베포빌드: backend maven exec plugin으로 실행
    $ npm run build

