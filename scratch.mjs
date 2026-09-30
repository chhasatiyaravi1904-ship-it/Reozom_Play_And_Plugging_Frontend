import axios from 'axios';
axios.post('http://localhost:8000/api/admin/listing-processes', {
  name: 'test',
  type: 'custom',
  status: 'draft',
}, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}).then(res => console.log('DATA:', res.data)).catch(err => console.log('ERROR:', err.response?.data || err.message));
