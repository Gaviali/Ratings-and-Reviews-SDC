const cluster = require('cluster');
const { cpus } = require('os');

require('dotenv').config();
const path = require('path');
const morgan = require('morgan');

if (cluster.isPrimary) {
  console.log(`primary ${process.pid} running`);
  console.log('max workers: ', cpus().length)
  // two workers seems optimal
  for (let i = 0; i < 2; i++) {
    console.log('worker: ' + i)
    cluster.fork();
  };

  cluster.on('exit', worker => {
    console.log(`worker ${worker.process.pid} died`);
    console.log('forking another worker')
    cluster.fork();
  });
} else {
  const router = require('./router.js');

  const express = require('express');
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // app.use(morgan('dev'));
  app.use('/', router);
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get("/loaderio-a3944bed63050bb1a9a17f22a732a7b7", (req, res) => res.send("loaderio-a3944bed63050bb1a9a17f22a732a7b7"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}
