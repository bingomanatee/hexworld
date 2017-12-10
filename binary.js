// Code goes here
if (require) {
  var _ = require('lodash');
}

function testBorderMatch(value, values) {
  var last = _.last(values);
  var first = _.first(values);
  // eliminate bounds
  if (first > value) {
    return [null, 0];
  } else if (_.last(values) < value) {
    return [values.length - 1, null];
  } else if (values[last] === value) {
    return [last];
  } else if (values[first] === value) {
    return [first];
  }
  return false;
}

function binarySearch(value, values) {
  values = _(values)
    .filter(_.isNumber)
    .sortBy()
    .uniq()
    .value(); // normally an external expectation but...

  if (borderMatch = testBorderMatch(value, values)) {
    return {
      values: values,
      indexes: borderMatch
    }
  }

  var absDiff = _.memoize(function (index) {
    return Math.abs(values[index] - value)
  });

// eliminate perfect match
  var indexCandidates = [0, values.length - 1];

  while (indexCandidates[1] > (indexCandidates[0]+ 1)) {
    var mid = _.ceil((indexCandidates[0] + indexCandidates[1]) / 2);
    // as mid is the only new candidate check for perfect match
    if (values[mid] === value) {
      return {
        values: values,
        indexes: [mid]
      };
    }
    // otherwise add it to the candidates and reduce to the two best ones
    indexCandidates = _(indexCandidates)
      .push(mid)
      .uniq()
      .sortBy(absDiff)
      .slice(0, 2)
      .sortBy()
      .value();
    // find the two indexes closest to the value
  }
// extract the indexes from the collection
  return {
    values: values,
    indexes: indexCandidates
  };
}

function oneNumber(id) {
  return parseFloat(document.getElementById(id).value)
}

function manyNumber(id) {
  return _.map(document.getElementById(id).value.split(','),
    function (t) {
      return parseFloat(t);
    });
}

function DoBinarySearch() {
  var target = oneNumber('target');
  var values = manyNumber('values');
  var result = binarySearch(target, values);
  var indexes = result.indexes;
  document.getElementById('values').value = result.values.join(', ');
  if (indexes.length === 1) {
    document.getElementById('result').innerHTML = 'index: ' + indexes[0]
      + ', value: ' + values[indexes[0]];
  } else if (indexes[0] === null) {
    document.getElementById('result').innerHTML = "value before candidate range"
  }else if (indexes[1] === null) {
    document.getElementById('result').innerHTML = "value after candidate range"
  } else {
    document.getElementById('result').innerHTML = "value between " + indexes.join(' and ');
  }
}

if (module) {
  module.exports = binarySearch;
}
