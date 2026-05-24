const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const PDFDocument = require('pdfkit');

async function test() {
  const doc = new PDFDocument();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfData = Buffer.concat(buffers);
    const form = new FormData();
    form.append('category', 'Software Engineering');
    form.append('role', 'Backend Developer');
    form.append('description', 'Test desc');
    form.append('resume', pdfData, {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });
    
    try {
      const res = await axios.post('http://localhost:3000/api/resume/analyze', form, {
        headers: form.getHeaders(),
      });
      console.log('Success:', res.data);
    } catch (err) {
      console.error('Error:', err.response ? err.response.data : err.message);
    }
  });
  doc.text('This is a test resume with lots of text to test PDF parsing.');
  doc.end();
}
test();
