/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const assert_ = __.require('utils', 'assert_types');
const execa = require('execa');
const { backupFolder } = require('./get_backup_folder_data')();
const { username, password, host, port } = CONFIG.db;

module.exports = function(dbName){
  const args = buildArgsArray(backupFolder, dbName);

  return execa('couchdb-backup', args)
  .then(function(res){
    _.log(res.stdout, `${dbName} stdout`);
    return _.warn(res.stderr, `${dbName} stderr`);
  });
};

// Depends on 'couchdb-backup' (from https://github.com/danielebailo/couchdb-dump)
// being accessible from the $PATH
var buildArgsArray = function(backupFolder, dbName){
  const outputFile = `${backupFolder}/${dbName}.json`;

  return [
    // Common parameters
    '-b', // backup mode
    '-H', host,
    '-P', port,
    '-u', username,
    '-p', password,
    // Database-specific
    '-d', dbName,
    '-f', outputFile
  ];
};
