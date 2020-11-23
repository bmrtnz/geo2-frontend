const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const DEFAULT_OPTS = {
  zip: { zlib: { level: 9 }},
  tar: { gzip: true }
};

const root = path.resolve(__dirname, '..');
const version = require(path.resolve(root, 'package.json')).version;
let archiveFile = path.resolve(root, process.argv[2]);
const toArchive = path.resolve(root, process.argv[3]);

if (archiveFile.indexOf('{version}') !== -1) {
  archiveFile = archiveFile.replace('{version}', version);
}

// create a file to stream archive data to.
const output = fs.createWriteStream(archiveFile);

output.on('end', () => console.log('Archiving finished'));

let format = 'undefined';
if (archiveFile.lastIndexOf('.zip') === archiveFile.length - 4) {
  format = 'zip';
} else if (archiveFile.lastIndexOf('.tar.gz') === archiveFile.length - 7) {
  format = 'tar';
}

if (format === 'undefined') {
  throw new Error("Unable to define archive format");
}

const archive = archiver(format, DEFAULT_OPTS[format]);

archive.on('warning', err => {
  if (err.code === 'ENOENT') {
    // log warning
    console.log('Warning : ' + err.message);
  } else {
    // throw error
    throw err;
  }
});
archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);
archive.directory(toArchive, false);
archive.finalize();
