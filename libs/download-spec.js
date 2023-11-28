const { readFileSync, writeFileSync, createWriteStream } = require('fs');
const { resolve } = require('path');
const http = require('http');

const specUrl = 'http://localhost:27884/swagger/v1/swagger.json';
const specFile = resolve(__dirname, 'openapi.json');

download(specUrl, specFile)
  .then(data => {
    const formattedSpec = JSON.stringify(data, null, 2);
    writeFileSync(specFile, formattedSpec);
    console.log('DOWNLOAD COMPLETED :)');
    console.log('FROM:', specUrl);
    console.log('TO:', specFile);
  })
  .catch(err => console.error('DOWNLOAD ERROR', specFile, err));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    http.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          try {
            const spec = readFileSync(dest);
            const data = JSON.parse(spec);
            resolve(data);
          } catch (err) {
            reject(err);
          }
        });
      });
      file.on('error', err => {
        reject(err);
        file.close(() => reject(err));
      });
    });
  });
}
