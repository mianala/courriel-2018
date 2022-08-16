process.env.NODE_ENV = 'production';

const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');

const session = require('express-session')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const files = require('./routes/files');
const users = require('./routes/users');
const emails = require('./routes/flow-emails');
const entities = require('./routes/entities');
const flows = require('./routes/flows');
const reports = require('./routes/reports');
const threads = require('./routes/threads');
const projects = require('./routes/projects');
const prints = require('./routes/prints');
const appRoute = require('./routes/app');
const db = require('./models/db');
const env = require('./env/env')

const app = express();

global.mainPool = 'mamamoo'

//socket setup
let http = require('http').Server(app);
let io = require('socket.io')(http);

io.on('connection', function (socket) {
  // console.log('a socket connected')
  db.message.subscribe(message => {
    // console.log(message)
     socket.emit(message.event, message.content)
  })

});

if (env.two_ports) {
  let http2 = require('http').Server(app);

  http2.listen(env.port2, '0.0.0.0', () => {
    console.log('socket2 listening on ' + env.port2)
  })

  let io2 = require('socket.io')(http2);
  io2.on('connection', function (socket) {
    console.log('a socket2 connected')
    db.message.subscribe(message => {
      console.log(message)
      socket.emit(message.event, message.content)
    })
  });
}

http.listen(4200, '0.0.0.0', () => {
  console.log('socket listening on 4200')
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors({
  credentials: true,
  origin: [env.webIp, env.webIp2, env.domain]
}))

app.use(session({
  secret: 'ssshhhhh',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 36000000
  }
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../ngcourriel/dist')));

app.use('/', index);

db.createPool(global.mainPool)


app.use('/api/projects', projects);
app.use('/api/users', users);
app.use('/api/flows', flows);
app.use('/api/threads', threads);
// app.use('/api/reports', reports);
// app.use('/api/emails', emails);
app.use('/api/entities', entities);
app.use('/api/files', files);
app.use('/api/prints', prints);
// app.use('/app', appRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  console.log('404')
  err.status = 404;
  // next(err);
  // res.send('Asseyez-vous calmement et mangez une pomme')
  res.sendFile(path.join(__dirname, '../ngcourriel/dist/index.html'));
});

//todo test if behaviour subject emits accross all the app

//todo: setup the websocket

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
