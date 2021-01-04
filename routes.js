const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  res.setHeader("Content-Type", "text/html");
  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>Hello Node.js SERVER</title></head>");
    res.write("<body><h1>Send a message</h1>");
    res.write(
      '<form action="/message" method="POST" name="message"><input type="text"><button type="submit">Send</button></form>'
    );
    res.write("</body>");
    res.write("</html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split("=")[1];
      fs.writeFile("message.txt", message, (err) => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }
  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>Hello Node.js SERVER</title></head>");
  res.write("<body><h1>Hello Node.js SERVER</h1>");
  res.write("</body>");
  res.write("</html>");
  return res.end();
};

module.exports = {
  handler: requestHandler,
  text: 'some text'
};
