const HTTP = require("http"),
  QUERY_STRING = require("querystring"),
  FS = require("fs"),
  PATH = require("path"),
  URL = require("url");

const DIRECTORY ='./documents';
const INVALID_FILE_REGEX = /^[.\/\\]|\.\./;

const SERVER = HTTP.createServer((req, res) => {
  if(req.method === 'POST') {
    handlePost(req, res);
    return;
  }

  let query = URL.parse(req.url, true).query;
  if(query.file) {
    writeFile(req, res, query);
    return;
  }

  writeIndex(req, res);
});

function writeIndex(req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  FS.readdir(DIRECTORY, (err, files) => {
    if(err) {
      res.end(err);
      return;
    }

    let fileListHTML = "";

    for(let file of files) {
      fileListHTML += `<li><a href="?file=${file}">${file}</a></li>`
    }

    res.write(`
      <ul>
        ${fileListHTML}
      </ul>
      <form method="post">
        <input type="text" name="file"/>
        <textarea name="text"></textarea>
        <input type="submit">
      </form>
    `);
  });
}

function writeFile(req, res, query) {
 if(INVALID_FILE_REGEX.test(query.file)) {
  writeText(res, 400, 'Invalid filename');
  return;
 }

 let fileName = PATH.join(DIRECTORY, query.file);
 FS.readFile(fileName, (err, buffer) => {
  if(err) {
    writeText(res, 400, err)
    return
  }

  writeText(res, 200, buffer.toString());
 })
}

function handlePost(req, res) {
  let body = '';
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", () => {
    let form = QUERY_STRING.parse(body);

    if(!form.file || INVALID_FILE_REGEX.test(form.file)){
      writeText(res, 400, 'Invalid path')
      return;
    }

    try {
      FS.writeFileSync(PATH.join(DIRECTORY, form.file), form.text);
      writeIndex(req, res);
    } catch (ex) {
      writeText(res, 400, 'Could not save file')
      console.error(ex);
    }
  })
}

function writeText(res, status, text) {
  res.writeHead(status, {"Content-Type": "text/html"});
  res.end(text)
} 

SERVER.listen(3000);
console.log(`Server is on http://localhost:3000`);