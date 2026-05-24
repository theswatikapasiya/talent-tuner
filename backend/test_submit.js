const axios = require('axios');
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign({id: 'mock-id', role: 'candidate'}, process.env.JWT_SECRET || 'secret123');
  try {
    const res = await axios.post('http://localhost:3000/api/tests/result', {
      domain: 'Software Engineering',
      testCategory: 'full',
      score: 10,
      timeTaken: 50,
      status: 'completed'
    }, { headers: { Authorization: `Bearer ${token}` }});
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
