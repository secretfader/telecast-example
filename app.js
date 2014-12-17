var path     = require('path')
,   fs       = require('fs')
,   express  = require('express')
,   telecast = require('telecast')
,   multer   = require('multer')
,   BusBoy   = require('busboy')
,   app      = express();

/**
 * Configure Telecast
 */
telecast.configure({
  local: {
    root: path.join(__dirname, 'uploads')
  }
});

/**
 * Configure Express
 */
app.use(require('morgan')('combined'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Routes
 */
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/upload', multer(), function (req, res) {
  var upload   = telecast.put(req.files.upload.originalname)
  ,   incoming = fs.createReadStream(req.files.upload.path);

  upload.once('success', function () {
    fs.unlink(req.files.upload.path, function (err) {
      /**
       * Do something with the error.
       *
       * The buffered file is now deleted from disk.
       */
    });
  });

  incoming.pipe(upload);

  res.json(req.files);
});

app.post('/upload/stream', function (req, res) {
  var incoming = new BusBoy({ headers: req.headers })
  ,   files    = [];

  incoming.on('file', function (fieldname, file, filename, enc, mime) {
    files.push(filename);

    var upload = telecast.put(filename);

    upload.once('success', function (stored) {
      // Do something with the uploaded file.
    });

    file.pipe(upload);
  });

  incoming.on('finish', function () {
    res.json(files);
  });

  req.pipe(incoming);
});

/**
 * Serve requests on localhost:ENV[PORT] || 9292
 */
app.listen(process.env.PORT || 9292);
