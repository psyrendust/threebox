const path = require('path');
const liveServer = require('live-server');

const dir = process.cwd();

liveServer.start({
  port: 8081,
  root: path.join(dir, 'examples'),
  mount: [
    ['/dist', path.join(dir, 'dist')],
  ],
  open: true,
  file: 'index.html',
  logLevel: 0,
});
