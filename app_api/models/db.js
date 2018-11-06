const mongoose = require('mongoose');
let dbURI = 'mongodb://localhost:27017/Loc8r';

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGODB_URI;
}

mongoose.connect(dbURI, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`, " HELLO!");
});

mongoose.connection.on('error', error => {
  console.log('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

//helper function to shutdown mongoose connection
const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

// shutdown connection with event listeners
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

require('./locations.js');
require('./users.js');
