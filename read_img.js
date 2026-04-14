const Tesseract = require('tesseract.js');

Tesseract.recognize(
  'Photo from Alexandver_Canon.png',
  'spa',
  { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  console.log('---TEXT EXTRACTED---');
  console.log(text);
});
