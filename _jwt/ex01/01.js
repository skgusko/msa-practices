const jwt = require('jsonwebtoken');
require("dotenv").config();

//
// sign & verify
//

const options1 = {
    algorithm: 'HS256'
};

const token1 = jwt.sign(
    { id: 1, name: 'kickscar', profileImage: 'profile.jpg' },  // 페이로드 (Payload)
    process.env.ACCESS_TOKEN_SECRET,  // 서명용 비밀키 (Secret Key)
    options1  // 추가 옵션 (예: 만료 시간, 알고리즘 등)
  );
console.log(token1);

const verifyed1 = jwt.verify(token1, process.env.ACCESS_TOKEN_SECRET);
console.log(verifyed1);

const options2 = {
    algorithm: 'HS256',
    expiresIn: '24h' // 24hours  
};

const token2 = jwt.sign({ id: 1, name: 'kickscar', profileImage: 'profile.jpg' }, process.env.ACCESS_TOKEN_SECRET, options2);
console.log(token2);

const verifyed2 = jwt.verify(token2, process.env.ACCESS_TOKEN_SECRET);
console.log(verifyed2);
