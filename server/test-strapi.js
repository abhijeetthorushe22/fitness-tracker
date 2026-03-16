const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:1337/api/food-logs');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    if(e.response) console.log(e.response.data);
    else console.log(e.message);
  }
}
test();
