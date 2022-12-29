const { server } = require('./app');

const port = 3000
const hostname = "127.0.0.1"

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});