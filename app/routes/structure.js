var express = require('express');
var router = express.Router();

var path = require('path');
var multer = require('multer');
var upload = multer({ dest: './public/uploads/' });

var authUtil = require('app/libs/auth/util');
var libStructure = require('app/libs/structure');
var pdbParser = require('app/libs/pdbParser');
var fs = require('fs.extra');

router.get('/structure', authUtil.isAuthenticated, function (req, res) {
  res.render('structure');
});

router.post('/structure', authUtil.isAuthenticated, upload.single('file'), function (req, res) {
  if (req.file === undefined) {
    res.render('structure', {error: 'Please choose a file'});
    return;
  }
  if (req.body.title === undefined || String(req.body.title).trim().length === 0) {
    res.render('structure', {error: 'Please input title'});
    return;
  }

  var filePath = path.join(process.cwd(), req.file.path);

  fs.move(filePath, filePath + '.pdb', function (err) {
    if (err) {
      res.render('structure', {error: 'Failed to move uploaded file'});
      return;
    }

    var structure;

    try {
      structure = pdbParser.parse(fs.readFileSync(filePath + '.pdb').toString());
    } catch (err) {
      console.log(err);
      res.render('structure', {error: 'Failed to load PDB file'});
      return;
    }

    if (structure === null) {
      res.render('structure', {error: 'Failed to parse PDB file'});
      return;
    }

    try {
      fs.writeFileSync(filePath + '.json', JSON.stringify(structure));
    } catch (err) {
      res.render('structure', {error: 'Failed to write parsed result :-('});
      return;
    }

    libStructure.addFile(req.user._id, String(req.body.title).trim(), req.file.filename).then(function () {
      res.redirect('/structure');
      return;
    });
  });
});

router.get('/structure/list', authUtil.isAuthenticated, function (req, res) {
  libStructure.listFiles().then(function (files) {
    res.json(files);
  });
});

router.post('/structure/:id/delete', authUtil.isAuthenticated, function (req, res) {
  libStructure.deleteFile(req.params.id).then(function (file) {
    var filePath = path.join(process.cwd(), './public/uploads/' + file.filename);
    fs.unlink(filePath + '.pdb', function () {
      fs.unlink(filePath + '.json', function () {
        res.json({ok: true});
      });
    });
  }, function () {
    res.json({ok: false});
  });
});

module.exports = router;
