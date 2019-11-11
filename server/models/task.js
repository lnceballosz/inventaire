const CONFIG = require('config');
const __ = CONFIG.universalPath;
const _ = __.require('builders', 'utils');
const error_ = __.require('lib', 'error/error');
const assert_ = __.require('utils', 'assert_types');
const validations = require('./validations/task');

module.exports = {
  create(newTask){
    assert_.object(newTask);
    const { type, suspectUri, suggestionUri, lexicalScore, externalSourcesOccurrences } = newTask;

    validations.pass('type', type);
    validations.pass('suspectUri', suspectUri);
    validations.pass('lexicalScore', lexicalScore);
    validations.pass('externalSourcesOccurrences', externalSourcesOccurrences);

    return {
      type,
      suspectUri,
      suggestionUri,
      lexicalScore: _.round(lexicalScore, 2),
      externalSourcesOccurrences,
      created: Date.now()
    };
  },

  update(task, attribute, value){
    assert_.types([ 'object', 'string', 'string|number' ], arguments);

    validations.pass('attribute', attribute);
    validations.pass(attribute, value);

    const now = Date.now();

    task[attribute] = value;
    task.updated = now;
    return task;
  }
};
