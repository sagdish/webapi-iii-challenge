const express = require('express');
const helmet = require('helmet');
const userRouter = require('./users/userRouter');

const server = express();


//custom middleware

// logger global middleware:
function logger(req, res, next) {
  time = new Date().toString();
  console.log(`${req.method} Request, url: ${req.path}, made on ${time}`);
  next();
};

server.use(helmet());
server.use(express.json());
server.use(logger);

server.use('/users', userRouter)

server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`)
});

module.exports = server;
