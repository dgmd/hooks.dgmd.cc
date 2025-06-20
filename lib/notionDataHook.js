import { useState, useRef, useCallback, useEffect } from 'react';

const E="cbi",A="cc",_="cm",t="dbi",T="ub",a="ubi",R="um",r="create",O="db-id",u="delete",D="delete-id",N="page",s="result",b="result-type",n="update",p="update-blocks",Y="update-page-id",L="update-metas",B="BLOCKS",G="id",X="relation",Ae="DATABASE_ID",_e="DATABASE_TITLE",Re="METADATA",Se="PAGE_ID",ce="PRIMARY_DATABASE",de="PROPERTIES",oe="RELATION_DATABASES",ue="INCLUDE_RELATION_DATABASES",De="RELATION_PAGE_ID",me="TYPE",Ne="VALUE",se="CURSOR_DATA",be="CURSOR_NEXT",ne="CURSOR_HAS_MORE",pe="PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP",Le="i",Ue="c",Ce="s",ye="QUERY_RESPONSE_KEY_RESULT",Qe="QUERY_RESPONSE_KEY_SUCCESS";

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
    symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  {
    return value;
  }
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return baseToString(value);
}

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

//KEYS FOR OUR DATA OBJECTS
const IDGMD_LIVE_DATA = 'IDGMD_LIVE_DATA';
const IDGMD_DATA = 'IDGMD_DATA';
const IDGMD_VALID_DATA = 'IDGMD_VALID_DATA';
const IDGMD_PRIMARY_DBID = 'IDGMD_PRIMARY_DBID';
const IDGMD_RELATION_DBIDS = 'IDGMD_RELATION_DBIDS';

const isNotionDataLoaded = (jsonObject) => {
  return !isNil( jsonObject );
};

const isNotionDataValid = (jsonObject) => {
  if (isNotionDataLoaded(jsonObject)) {
    return jsonObject[IDGMD_VALID_DATA];
  }
  return false;
};

const isNotionDataLive = (jsonObject) => {
  return jsonObject[IDGMD_LIVE_DATA];
};
  
const getNotionDataPrimaryDbId = (jsonObject) => {
  if (isNotionDataValid(jsonObject)) {
    return jsonObject[IDGMD_PRIMARY_DBID];
  }
  return null;
};
  
const getNotionDataRelationDbIds = (jsonObject) => {
  if (isNotionDataValid(jsonObject)) {
    return jsonObject[IDGMD_RELATION_DBIDS];
  }
  return [];
};
  
const getNotionDataDb = (jsonObject, dbId) => {
  if (isNotionDataValid(jsonObject)) {
    const job = getData( jsonObject);
    if (!isNil(job)) {
      const primary = job[ce];
      if (primary[Ae] === dbId) {
        return primary;
      }
      for (var i=0; i<job[oe].length; i++) {
        const db = job[oe][i];
        if (db[Ae] === dbId) {
          return db;
        }
      }
    }
  }
  return null;
};

const getData = (jsonObject) => {
  if (isNotionDataValid(jsonObject)) {
    return jsonObject[IDGMD_DATA];
  }  return null;
};
  

const getDbIdByName = (jsonObject, name) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const primary = jsonObject[ce];
      if (primary[_e] === name) {
        return primary[Ae];
      }
      const rels = jsonObject[oe];
      for (var i=0; i<rels.length; i++) {
        const db = rels[i];
        if (db[_e] === name) {
          return db[Ae];
        }
      }
      return null;
    }
    catch( err ) {
      return null;
    }
  }
  return null;
};

const getNotionDataPage = (jsonObject, dbId, pageId) => {
  const dbIds = isNil(dbId) ? getNotionDataAllDbIds( jsonObject ) : [dbId];
  for (const xdbId of dbIds) {
    const dbBlocks = getNotionDataPages( jsonObject, xdbId );
    const pageIdx = dbBlocks.findIndex( block => {
      const blockIdMeta = block[Re];
      const blockIdObj = blockIdMeta[G];
      const blockId = blockIdObj[Ne];
      return blockId === pageId;
    } );
    if (pageIdx >= 0) {
      return dbBlocks[pageIdx];
    }
  }  return null;
};

const getNotionDataPages = (jsonObject, dbId) => {
  if (isNotionDataValid(jsonObject)) {
    try {
      const db = getNotionDataDb( jsonObject, dbId );
      const dbBlocks = db[B];
      return dbBlocks;
    }
    catch( err ) {
      console.log( err );
    }
  }
  return [];
};

const getNotionDataAllDbIds = (notionData) => {
  return [ 
    getNotionDataPrimaryDbId(notionData), 
    ...getNotionDataRelationDbIds(notionData)
  ];
};

const spliceNotionPage = (notionData, pgId) => {
  const x = structuredClone( notionData );

  const allDbIds = getNotionDataAllDbIds( x );

  for (const dbId of allDbIds) {
    const db = getNotionDataDb( x, dbId);
    const dbPgs = db[B];
    const idx = dbPgs.findIndex( x => 
      x[Re][G][Ne] === pgId );
    if (idx >= 0) {
      dbPgs.splice( idx, 1 );
    }
    for (const pg of dbPgs) {
      const pgProps = pg[de];
      for (const [key, value] of Object.entries(pgProps)) {
        if (value[me] === X) {
          const relValue = value[Ne];
          const relIdx = relValue.findIndex( x => 
            x[De] === pgId );
          if (relIdx >= 0) {
            relValue.splice( relIdx, 1 );
          }
        }
      }
    }
  }
  return x;
};

const getNotionDataNextCursorObject = (jsonObject) => {
  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const db = getNotionDataDb( jsonObject, primaryDbId );
  if (isNil(db)) {
    return null;
  }
  return db[se];
};

const hasNotionDataNextCursor = (jsonObject) => {
  const nextCursorData = getNotionDataNextCursorObject(jsonObject);
  if (isNil(nextCursorData)) {
    return false;
  }
  if (!(ne in nextCursorData)) {
    return false;
  }
  if (!nextCursorData[ne]) {
    return false;
  }
  if (isNil(nextCursorData[be])) {
    return false;
  }
  return true;
};
  

const getNotionDataNextCursor = (jsonObject) => {
  if (hasNotionDataNextCursor(jsonObject)) {
    const obj = getNotionDataNextCursorObject(jsonObject);
    if (!isNil(obj)) {
      return obj[be];
    }
  }
  return null;
};

// Define date formats (comments for reference)
const DATE_PRETTY_SHORT_DATE = 'LLL d, yyyy'; // Will use toLocaleDateString options
const DATE_PRETTY_SHORT_NUMERIC_DATE = 'L/d/yy'; // Will use toLocaleDateString options

// Function to format dates using native JavaScript
const prettyPrintNotionDate = (dateString, format = DATE_PRETTY_SHORT_DATE, timeZone = null) => {
  try {
    const defaultZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateObj = new Date(dateString);

    if (!isNaN(dateObj.getTime())) {
      // Format based on the format parameter
      if (format === DATE_PRETTY_SHORT_NUMERIC_DATE) {
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      } else if (format === DATE_PRETTY_SHORT_DATE) {
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } else {
        // Fallback to default format
        return dateObj.toLocaleDateString('en-US', {
          timeZone: defaultZone,
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      }
    } else {
      console.log('invalid date', dateString);
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
  return '';
};

function formatDateForNotion(input, zone) {
  zone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Try to match mm-dd-yyyy or mm-dd-yyyy HH:mm
  let parts = input.match(/(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (parts) {
    const [, month, day, year, hours = '00', minutes = '00'] = parts;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Expected mm-dd-yyyy or mm-dd-yyyy HH:mm");
    }
    const utcDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return {
      isoUTC: utcDate.toISOString(),
      isoLocal: dateObj.toISOString()
    };
  }

  // Try to match yyyy-mm-dd or yyyy-mm-ddTHH:mm (from <input type="date"/> or <input type="datetime-local"/>)
  parts = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/);
  if (parts) {
    const [, year, month, day, hours = '00', minutes = '00'] = parts;
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date format. Expected yyyy-mm-dd or yyyy-mm-ddTHH:mm");
    }
    const utcDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return {
      isoUTC: utcDate.toISOString(),
      isoLocal: dateObj.toISOString()
    };
  }

  throw new Error("Invalid date format. Expected mm-dd-yyyy, mm-dd-yyyy HH:mm, yyyy-mm-dd, or yyyy-mm-ddTHH:mm");
}

// src/index.ts
function isNodeProcess() {
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return true;
  }
  if (typeof process !== "undefined") {
    const type = process.type;
    if (type === "renderer" || type === "worker") {
      return false;
    }
    return !!(process.versions && process.versions.node);
  }
  return false;
}

// This file is here because Edge Functions have no support for Node.js streams by default
// It's unlikely someone would try to read/use a Node.js stream in an Edge function but we still put
// a message in case this happens

const Readable = {
  toWeb() {
    throw new Error(
      'Vercel Blob: Sorry, we cannot get a Readable stream in this environment. If you see this message please open an issue here: https://github.com/vercel/storage/ with details on your environment.',
    );
  },
};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

var isBuffer$1;
var hasRequiredIsBuffer;

function requireIsBuffer () {
	if (hasRequiredIsBuffer) return isBuffer$1;
	hasRequiredIsBuffer = 1;
	isBuffer$1 = function isBuffer (obj) {
	  return obj != null && obj.constructor != null &&
	    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	};
	return isBuffer$1;
}

var isBufferExports = requireIsBuffer();
var isBuffer = /*@__PURE__*/getDefaultExportFromCjs(isBufferExports);

var retry$2 = {};

var retry_operation;
var hasRequiredRetry_operation;

function requireRetry_operation () {
	if (hasRequiredRetry_operation) return retry_operation;
	hasRequiredRetry_operation = 1;
	function RetryOperation(timeouts, options) {
	  // Compatibility for the old (timeouts, retryForever) signature
	  if (typeof options === 'boolean') {
	    options = { forever: options };
	  }

	  this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
	  this._timeouts = timeouts;
	  this._options = options || {};
	  this._maxRetryTime = options && options.maxRetryTime || Infinity;
	  this._fn = null;
	  this._errors = [];
	  this._attempts = 1;
	  this._operationTimeout = null;
	  this._operationTimeoutCb = null;
	  this._timeout = null;
	  this._operationStart = null;
	  this._timer = null;

	  if (this._options.forever) {
	    this._cachedTimeouts = this._timeouts.slice(0);
	  }
	}
	retry_operation = RetryOperation;

	RetryOperation.prototype.reset = function() {
	  this._attempts = 1;
	  this._timeouts = this._originalTimeouts.slice(0);
	};

	RetryOperation.prototype.stop = function() {
	  if (this._timeout) {
	    clearTimeout(this._timeout);
	  }
	  if (this._timer) {
	    clearTimeout(this._timer);
	  }

	  this._timeouts       = [];
	  this._cachedTimeouts = null;
	};

	RetryOperation.prototype.retry = function(err) {
	  if (this._timeout) {
	    clearTimeout(this._timeout);
	  }

	  if (!err) {
	    return false;
	  }
	  var currentTime = new Date().getTime();
	  if (err && currentTime - this._operationStart >= this._maxRetryTime) {
	    this._errors.push(err);
	    this._errors.unshift(new Error('RetryOperation timeout occurred'));
	    return false;
	  }

	  this._errors.push(err);

	  var timeout = this._timeouts.shift();
	  if (timeout === undefined) {
	    if (this._cachedTimeouts) {
	      // retry forever, only keep last error
	      this._errors.splice(0, this._errors.length - 1);
	      timeout = this._cachedTimeouts.slice(-1);
	    } else {
	      return false;
	    }
	  }

	  var self = this;
	  this._timer = setTimeout(function() {
	    self._attempts++;

	    if (self._operationTimeoutCb) {
	      self._timeout = setTimeout(function() {
	        self._operationTimeoutCb(self._attempts);
	      }, self._operationTimeout);

	      if (self._options.unref) {
	          self._timeout.unref();
	      }
	    }

	    self._fn(self._attempts);
	  }, timeout);

	  if (this._options.unref) {
	      this._timer.unref();
	  }

	  return true;
	};

	RetryOperation.prototype.attempt = function(fn, timeoutOps) {
	  this._fn = fn;

	  if (timeoutOps) {
	    if (timeoutOps.timeout) {
	      this._operationTimeout = timeoutOps.timeout;
	    }
	    if (timeoutOps.cb) {
	      this._operationTimeoutCb = timeoutOps.cb;
	    }
	  }

	  var self = this;
	  if (this._operationTimeoutCb) {
	    this._timeout = setTimeout(function() {
	      self._operationTimeoutCb();
	    }, self._operationTimeout);
	  }

	  this._operationStart = new Date().getTime();

	  this._fn(this._attempts);
	};

	RetryOperation.prototype.try = function(fn) {
	  console.log('Using RetryOperation.try() is deprecated');
	  this.attempt(fn);
	};

	RetryOperation.prototype.start = function(fn) {
	  console.log('Using RetryOperation.start() is deprecated');
	  this.attempt(fn);
	};

	RetryOperation.prototype.start = RetryOperation.prototype.try;

	RetryOperation.prototype.errors = function() {
	  return this._errors;
	};

	RetryOperation.prototype.attempts = function() {
	  return this._attempts;
	};

	RetryOperation.prototype.mainError = function() {
	  if (this._errors.length === 0) {
	    return null;
	  }

	  var counts = {};
	  var mainError = null;
	  var mainErrorCount = 0;

	  for (var i = 0; i < this._errors.length; i++) {
	    var error = this._errors[i];
	    var message = error.message;
	    var count = (counts[message] || 0) + 1;

	    counts[message] = count;

	    if (count >= mainErrorCount) {
	      mainError = error;
	      mainErrorCount = count;
	    }
	  }

	  return mainError;
	};
	return retry_operation;
}

var hasRequiredRetry$1;

function requireRetry$1 () {
	if (hasRequiredRetry$1) return retry$2;
	hasRequiredRetry$1 = 1;
	(function (exports) {
		var RetryOperation = requireRetry_operation();

		exports.operation = function(options) {
		  var timeouts = exports.timeouts(options);
		  return new RetryOperation(timeouts, {
		      forever: options && (options.forever || options.retries === Infinity),
		      unref: options && options.unref,
		      maxRetryTime: options && options.maxRetryTime
		  });
		};

		exports.timeouts = function(options) {
		  if (options instanceof Array) {
		    return [].concat(options);
		  }

		  var opts = {
		    retries: 10,
		    factor: 2,
		    minTimeout: 1 * 1000,
		    maxTimeout: Infinity,
		    randomize: false
		  };
		  for (var key in options) {
		    opts[key] = options[key];
		  }

		  if (opts.minTimeout > opts.maxTimeout) {
		    throw new Error('minTimeout is greater than maxTimeout');
		  }

		  var timeouts = [];
		  for (var i = 0; i < opts.retries; i++) {
		    timeouts.push(this.createTimeout(i, opts));
		  }

		  if (options && options.forever && !timeouts.length) {
		    timeouts.push(this.createTimeout(i, opts));
		  }

		  // sort the array numerically ascending
		  timeouts.sort(function(a,b) {
		    return a - b;
		  });

		  return timeouts;
		};

		exports.createTimeout = function(attempt, opts) {
		  var random = (opts.randomize)
		    ? (Math.random() + 1)
		    : 1;

		  var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
		  timeout = Math.min(timeout, opts.maxTimeout);

		  return timeout;
		};

		exports.wrap = function(obj, options, methods) {
		  if (options instanceof Array) {
		    methods = options;
		    options = null;
		  }

		  if (!methods) {
		    methods = [];
		    for (var key in obj) {
		      if (typeof obj[key] === 'function') {
		        methods.push(key);
		      }
		    }
		  }

		  for (var i = 0; i < methods.length; i++) {
		    var method   = methods[i];
		    var original = obj[method];

		    obj[method] = function retryWrapper(original) {
		      var op       = exports.operation(options);
		      var args     = Array.prototype.slice.call(arguments, 1);
		      var callback = args.pop();

		      args.push(function(err) {
		        if (op.retry(err)) {
		          return;
		        }
		        if (err) {
		          arguments[0] = op.mainError();
		        }
		        callback.apply(this, arguments);
		      });

		      op.attempt(function() {
		        original.apply(obj, args);
		      });
		    }.bind(obj, original);
		    obj[method].options = options;
		  }
		}; 
	} (retry$2));
	return retry$2;
}

var retry$1;
var hasRequiredRetry;

function requireRetry () {
	if (hasRequiredRetry) return retry$1;
	hasRequiredRetry = 1;
	retry$1 = requireRetry$1();
	return retry$1;
}

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	// Packages
	var retrier = requireRetry();

	function retry(fn, opts) {
	  function run(resolve, reject) {
	    var options = opts || {};
	    var op;

	    // Default `randomize` to true
	    if (!('randomize' in options)) {
	      options.randomize = true;
	    }

	    op = retrier.operation(options);

	    // We allow the user to abort retrying
	    // this makes sense in the cases where
	    // knowledge is obtained that retrying
	    // would be futile (e.g.: auth errors)

	    function bail(err) {
	      reject(err || new Error('Aborted'));
	    }

	    function onError(err, num) {
	      if (err.bail) {
	        bail(err);
	        return;
	      }

	      if (!op.retry(err)) {
	        reject(op.mainError());
	      } else if (options.onRetry) {
	        options.onRetry(err, num);
	      }
	    }

	    function runAttempt(num) {
	      var val;

	      try {
	        val = fn(bail, num);
	      } catch (err) {
	        onError(err, num);
	        return;
	      }

	      Promise.resolve(val)
	        .then(resolve)
	        .catch(function catchIt(err) {
	          onError(err, num);
	        });
	    }

	    op.attempt(runAttempt);
	  }

	  return new Promise(run);
	}

	lib = retry;
	return lib;
}

var libExports = requireLib();
var retry = /*@__PURE__*/getDefaultExportFromCjs(libExports);

// this file gets copied to the dist folder
// it makes undici work in the browser by reusing the global fetch
// it's the simplest way I've found to make http requests work in Node.js, Serverles Functions, Edge Functions, and the browser
// this should work as long as this module is used via Next.js/Webpack
// moving forward we will have to solve this problem in a more robust way
// reusing https://github.com/inrupt/universal-fetch
// or seeing how/if cross-fetch solves https://github.com/lquixada/cross-fetch/issues/69
const fetch = globalThis.fetch.bind(globalThis);

var throttleit;
var hasRequiredThrottleit;

function requireThrottleit () {
	if (hasRequiredThrottleit) return throttleit;
	hasRequiredThrottleit = 1;
	function throttle(function_, wait) {
		if (typeof function_ !== 'function') {
			throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof function_}\`.`);
		}

		// TODO: Add `wait` validation too in the next major version.

		let timeoutId;
		let lastCallTime = 0;

		return function throttled(...arguments_) { // eslint-disable-line func-names
			clearTimeout(timeoutId);

			const now = Date.now();
			const timeSinceLastCall = now - lastCallTime;
			const delayForNextCall = wait - timeSinceLastCall;

			if (delayForNextCall <= 0) {
				lastCallTime = now;
				function_.apply(this, arguments_);
			} else {
				timeoutId = setTimeout(() => {
					lastCallTime = Date.now();
					function_.apply(this, arguments_);
				}, delayForNextCall);
			}
		};
	}

	throttleit = throttle;
	return throttleit;
}

var throttleitExports = /*@__PURE__*/ requireThrottleit();
var throttle2 = /*@__PURE__*/getDefaultExportFromCjs(throttleitExports);

// src/helpers.ts
var supportsNewBlobFromArrayBuffer = new Promise((resolve) => {
  try {
    const helloAsArrayBuffer = new Uint8Array([104, 101, 108, 108, 111]);
    const blob = new Blob([helloAsArrayBuffer]);
    blob.text().then((text) => {
      resolve(text === "hello");
    }).catch(() => {
      resolve(false);
    });
  } catch {
    resolve(false);
  }
});
async function toReadableStream(value) {
  if (value instanceof ReadableStream) {
    return value;
  }
  if (value instanceof Blob) {
    return value.stream();
  }
  if (isNodeJsReadableStream(value)) {
    return Readable.toWeb(value);
  }
  let streamValue;
  if (value instanceof ArrayBuffer) {
    streamValue = new Uint8Array(value);
  } else if (isNodeJsBuffer(value)) {
    streamValue = value;
  } else {
    streamValue = stringToUint8Array(value);
  }
  if (await supportsNewBlobFromArrayBuffer) {
    return new Blob([streamValue]).stream();
  }
  return new ReadableStream({
    start(controller) {
      controller.enqueue(streamValue);
      controller.close();
    }
  });
}
function isNodeJsReadableStream(value) {
  return typeof value === "object" && typeof value.pipe === "function" && value.readable && typeof value._read === "function" && // @ts-expect-error _readableState does exists on Readable
  typeof value._readableState === "object";
}
function stringToUint8Array(s) {
  const enc = new TextEncoder();
  return enc.encode(s);
}
function isNodeJsBuffer(value) {
  return isBuffer(value);
}

// src/bytes.ts
var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;
var map = {
  b: 1,
  // eslint-disable-next-line no-bitwise -- fine
  kb: 1 << 10,
  // eslint-disable-next-line no-bitwise -- fine
  mb: 1 << 20,
  // eslint-disable-next-line no-bitwise -- fine
  gb: 1 << 30,
  tb: Math.pow(1024, 4),
  pb: Math.pow(1024, 5)
};
function bytes(val) {
  if (typeof val === "number" && !isNaN(val)) {
    return val;
  }
  if (typeof val !== "string") {
    return null;
  }
  const results = parseRegExp.exec(val);
  let floatValue;
  let unit = "b";
  if (!results) {
    floatValue = parseInt(val, 10);
  } else {
    const [, res, , , unitMatch] = results;
    if (!res) {
      return null;
    }
    floatValue = parseFloat(res);
    if (unitMatch) {
      unit = unitMatch.toLowerCase();
    }
  }
  if (isNaN(floatValue)) {
    return null;
  }
  return Math.floor(map[unit] * floatValue);
}

// src/helpers.ts
var defaultVercelBlobApiUrl = "https://vercel.com/api/blob";
function getTokenFromOptionsOrEnv(options) {
  if (options == null ? void 0 : options.token) {
    return options.token;
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  throw new BlobError(
    "No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token` option to your calls."
  );
}
var BlobError = class extends Error {
  constructor(message) {
    super(`Vercel Blob: ${message}`);
  }
};
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
var disallowedPathnameCharacters = ["//"];
var supportsRequestStreams = (() => {
  if (isNodeProcess()) {
    return true;
  }
  const apiUrl = getApiUrl();
  if (apiUrl.startsWith("http://localhost")) {
    return false;
  }
  let duplexAccessed = false;
  const hasContentType = new Request(getApiUrl(), {
    body: new ReadableStream(),
    method: "POST",
    // @ts-expect-error -- TypeScript doesn't yet have duplex but it's in the spec: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1729
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
})();
function getApiUrl(pathname = "") {
  let baseUrl = null;
  try {
    baseUrl = process.env.VERCEL_BLOB_API_URL || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL;
  } catch {
  }
  return `${baseUrl || defaultVercelBlobApiUrl}${pathname}`;
}
var TEXT_ENCODER = typeof TextEncoder === "function" ? new TextEncoder() : null;
function computeBodyLength(body) {
  if (!body) {
    return 0;
  }
  if (typeof body === "string") {
    if (TEXT_ENCODER) {
      return TEXT_ENCODER.encode(body).byteLength;
    }
    return new Blob([body]).size;
  }
  if ("byteLength" in body && typeof body.byteLength === "number") {
    return body.byteLength;
  }
  if ("size" in body && typeof body.size === "number") {
    return body.size;
  }
  return 0;
}
var createChunkTransformStream = (chunkSize, onProgress) => {
  let buffer = new Uint8Array(0);
  return new TransformStream({
    transform(chunk, controller) {
      queueMicrotask(() => {
        const newBuffer = new Uint8Array(buffer.length + chunk.byteLength);
        newBuffer.set(buffer);
        newBuffer.set(new Uint8Array(chunk), buffer.length);
        buffer = newBuffer;
        while (buffer.length >= chunkSize) {
          const newChunk = buffer.slice(0, chunkSize);
          controller.enqueue(newChunk);
          onProgress == null ? void 0 : onProgress(newChunk.byteLength);
          buffer = buffer.slice(chunkSize);
        }
      });
    },
    flush(controller) {
      queueMicrotask(() => {
        if (buffer.length > 0) {
          controller.enqueue(buffer);
          onProgress == null ? void 0 : onProgress(buffer.byteLength);
        }
      });
    }
  });
};
function isReadableStream(value) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Not present in Node.js 16
    globalThis.ReadableStream && // TODO: Can be removed once Node.js 16 is no more required internally
    value instanceof ReadableStream
  );
}
function isStream(value) {
  if (isReadableStream(value)) {
    return true;
  }
  if (isNodeJsReadableStream(value)) {
    return true;
  }
  return false;
}

// src/is-network-error.ts
var objectToString = Object.prototype.toString;
var isError = (value) => objectToString.call(value) === "[object Error]";
var errorMessages = /* @__PURE__ */ new Set([
  "network error",
  // Chrome
  "Failed to fetch",
  // Chrome
  "NetworkError when attempting to fetch resource.",
  // Firefox
  "The Internet connection appears to be offline.",
  // Safari 16
  "Load failed",
  // Safari 17+
  "Network request failed",
  // `cross-fetch`
  "fetch failed",
  // Undici (Node.js)
  "terminated"
  // Undici (Node.js)
]);
function isNetworkError(error) {
  const isValid = error && isError(error) && error.name === "TypeError" && typeof error.message === "string";
  if (!isValid) {
    return false;
  }
  if (error.message === "Load failed") {
    return error.stack === void 0;
  }
  return errorMessages.has(error.message);
}

// src/debug.ts
var debugIsActive = false;
var _a, _b;
try {
  if (((_a = process.env.DEBUG) == null ? void 0 : _a.includes("blob")) || ((_b = process.env.NEXT_PUBLIC_DEBUG) == null ? void 0 : _b.includes("blob"))) {
    debugIsActive = true;
  }
} catch (error) {
}
function debug(message, ...args) {
  if (debugIsActive) {
    console.debug(`vercel-blob: ${message}`, ...args);
  }
}
var hasFetch = typeof fetch === "function";
var hasFetchWithUploadProgress = hasFetch && supportsRequestStreams;
var CHUNK_SIZE = 64 * 1024;
var blobFetch = async ({
  input,
  init,
  onUploadProgress
}) => {
  debug("using fetch");
  let body;
  if (init.body) {
    if (onUploadProgress) {
      const stream = await toReadableStream(init.body);
      let loaded = 0;
      const chunkTransformStream = createChunkTransformStream(
        CHUNK_SIZE,
        (newLoaded) => {
          loaded += newLoaded;
          onUploadProgress(loaded);
        }
      );
      body = stream.pipeThrough(chunkTransformStream);
    } else {
      body = init.body;
    }
  }
  const duplex = supportsRequestStreams && body && isStream(body) ? "half" : void 0;
  return fetch(
    input,
    // @ts-expect-error -- Blob and Nodejs Blob are triggering type errors, fine with it
    {
      ...init,
      ...init.body ? { body } : {},
      duplex
    }
  );
};

// src/xhr.ts
var hasXhr = typeof XMLHttpRequest !== "undefined";
var blobXhr = async ({
  input,
  init,
  onUploadProgress
}) => {
  debug("using xhr");
  let body = null;
  if (init.body) {
    if (isReadableStream(init.body)) {
      body = await new Response(init.body).blob();
    } else {
      body = init.body;
    }
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init.method || "GET", input.toString(), true);
    if (onUploadProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onUploadProgress(event.loaded);
        }
      });
    }
    xhr.onload = () => {
      var _a3;
      if ((_a3 = init.signal) == null ? void 0 : _a3.aborted) {
        reject(new DOMException("The user aborted the request.", "AbortError"));
        return;
      }
      const headers = new Headers();
      const rawHeaders = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
      rawHeaders.forEach((line) => {
        const parts = line.split(": ");
        const key = parts.shift();
        const value = parts.join(": ");
        if (key) headers.set(key.toLowerCase(), value);
      });
      const response = new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers
      });
      resolve(response);
    };
    xhr.onerror = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.ontimeout = () => {
      reject(new TypeError("Network request timed out"));
    };
    xhr.onabort = () => {
      reject(new DOMException("The user aborted a request.", "AbortError"));
    };
    if (init.headers) {
      const headers = new Headers(init.headers);
      headers.forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });
    }
    if (init.signal) {
      init.signal.addEventListener("abort", () => {
        xhr.abort();
      });
      if (init.signal.aborted) {
        xhr.abort();
        return;
      }
    }
    xhr.send(body);
  });
};

// src/request.ts
var blobRequest = async ({
  input,
  init,
  onUploadProgress
}) => {
  if (onUploadProgress) {
    if (hasFetchWithUploadProgress) {
      return blobFetch({ input, init, onUploadProgress });
    }
    if (hasXhr) {
      return blobXhr({ input, init, onUploadProgress });
    }
  }
  if (hasFetch) {
    return blobFetch({ input, init });
  }
  if (hasXhr) {
    return blobXhr({ input, init });
  }
  throw new Error("No request implementation available");
};

// src/dom-exception.ts
var _a2;
var DOMException2 = (_a2 = globalThis.DOMException) != null ? _a2 : (() => {
  try {
    atob("~");
  } catch (err) {
    return Object.getPrototypeOf(err).constructor;
  }
})();

// src/api.ts
var MAXIMUM_PATHNAME_LENGTH = 950;
var BlobAccessError = class extends BlobError {
  constructor() {
    super("Access denied, please provide a valid token for this resource.");
  }
};
var BlobContentTypeNotAllowedError = class extends BlobError {
  constructor(message) {
    super(`Content type mismatch, ${message}.`);
  }
};
var BlobPathnameMismatchError = class extends BlobError {
  constructor(message) {
    super(
      `Pathname mismatch, ${message}. Check the pathname used in upload() or put() matches the one from the client token.`
    );
  }
};
var BlobClientTokenExpiredError = class extends BlobError {
  constructor() {
    super("Client token has expired.");
  }
};
var BlobFileTooLargeError = class extends BlobError {
  constructor(message) {
    super(`File is too large, ${message}.`);
  }
};
var BlobStoreNotFoundError = class extends BlobError {
  constructor() {
    super("This store does not exist.");
  }
};
var BlobStoreSuspendedError = class extends BlobError {
  constructor() {
    super("This store has been suspended.");
  }
};
var BlobUnknownError = class extends BlobError {
  constructor() {
    super("Unknown error, please visit https://vercel.com/help.");
  }
};
var BlobNotFoundError = class extends BlobError {
  constructor() {
    super("The requested blob does not exist");
  }
};
var BlobServiceNotAvailable = class extends BlobError {
  constructor() {
    super("The blob service is currently not available. Please try again.");
  }
};
var BlobServiceRateLimited = class extends BlobError {
  constructor(seconds) {
    super(
      `Too many requests please lower the number of concurrent requests ${seconds ? ` - try again in ${seconds} seconds` : ""}.`
    );
    this.retryAfter = seconds != null ? seconds : 0;
  }
};
var BlobRequestAbortedError = class extends BlobError {
  constructor() {
    super("The request was aborted.");
  }
};
var BLOB_API_VERSION = 11;
function getApiVersion() {
  let versionOverride = null;
  try {
    versionOverride = process.env.VERCEL_BLOB_API_VERSION_OVERRIDE || process.env.NEXT_PUBLIC_VERCEL_BLOB_API_VERSION_OVERRIDE;
  } catch {
  }
  return `${versionOverride != null ? versionOverride : BLOB_API_VERSION}`;
}
function getRetries() {
  try {
    const retries = process.env.VERCEL_BLOB_RETRIES || "10";
    return parseInt(retries, 10);
  } catch {
    return 10;
  }
}
function createBlobServiceRateLimited(response) {
  const retryAfter = response.headers.get("retry-after");
  return new BlobServiceRateLimited(
    retryAfter ? parseInt(retryAfter, 10) : void 0
  );
}
async function getBlobError(response) {
  var _a3, _b2, _c;
  let code;
  let message;
  try {
    const data = await response.json();
    code = (_b2 = (_a3 = data.error) == null ? void 0 : _a3.code) != null ? _b2 : "unknown_error";
    message = (_c = data.error) == null ? void 0 : _c.message;
  } catch {
    code = "unknown_error";
  }
  if ((message == null ? void 0 : message.includes("contentType")) && message.includes("is not allowed")) {
    code = "content_type_not_allowed";
  }
  if ((message == null ? void 0 : message.includes('"pathname"')) && message.includes("does not match the token payload")) {
    code = "client_token_pathname_mismatch";
  }
  if (message === "Token expired") {
    code = "client_token_expired";
  }
  if (message == null ? void 0 : message.includes("the file length cannot be greater than")) {
    code = "file_too_large";
  }
  let error;
  switch (code) {
    case "store_suspended":
      error = new BlobStoreSuspendedError();
      break;
    case "forbidden":
      error = new BlobAccessError();
      break;
    case "content_type_not_allowed":
      error = new BlobContentTypeNotAllowedError(message);
      break;
    case "client_token_pathname_mismatch":
      error = new BlobPathnameMismatchError(message);
      break;
    case "client_token_expired":
      error = new BlobClientTokenExpiredError();
      break;
    case "file_too_large":
      error = new BlobFileTooLargeError(message);
      break;
    case "not_found":
      error = new BlobNotFoundError();
      break;
    case "store_not_found":
      error = new BlobStoreNotFoundError();
      break;
    case "bad_request":
      error = new BlobError(message != null ? message : "Bad request");
      break;
    case "service_unavailable":
      error = new BlobServiceNotAvailable();
      break;
    case "rate_limited":
      error = createBlobServiceRateLimited(response);
      break;
    case "unknown_error":
    case "not_allowed":
    default:
      error = new BlobUnknownError();
      break;
  }
  return { code, error };
}
async function requestApi(pathname, init, commandOptions) {
  const apiVersion = getApiVersion();
  const token = getTokenFromOptionsOrEnv(commandOptions);
  const extraHeaders = getProxyThroughAlternativeApiHeaderFromEnv();
  const [, , , storeId = ""] = token.split("_");
  const requestId = `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
  let retryCount = 0;
  let bodyLength = 0;
  let totalLoaded = 0;
  const sendBodyLength = (commandOptions == null ? void 0 : commandOptions.onUploadProgress) || shouldUseXContentLength();
  if (init.body && // 1. For upload progress we always need to know the total size of the body
  // 2. In development we need the header for put() to work correctly when passing a stream
  sendBodyLength) {
    bodyLength = computeBodyLength(init.body);
  }
  if (commandOptions == null ? void 0 : commandOptions.onUploadProgress) {
    commandOptions.onUploadProgress({
      loaded: 0,
      total: bodyLength,
      percentage: 0
    });
  }
  const apiResponse = await retry(
    async (bail) => {
      let res;
      try {
        res = await blobRequest({
          input: getApiUrl(pathname),
          init: {
            ...init,
            headers: {
              "x-api-blob-request-id": requestId,
              "x-api-blob-request-attempt": String(retryCount),
              "x-api-version": apiVersion,
              ...sendBodyLength ? { "x-content-length": String(bodyLength) } : {},
              authorization: `Bearer ${token}`,
              ...extraHeaders,
              ...init.headers
            }
          },
          onUploadProgress: (commandOptions == null ? void 0 : commandOptions.onUploadProgress) ? (loaded) => {
            var _a3;
            const total = bodyLength !== 0 ? bodyLength : loaded;
            totalLoaded = loaded;
            const percentage = bodyLength > 0 ? Number((loaded / total * 100).toFixed(2)) : 0;
            if (percentage === 100 && bodyLength > 0) {
              return;
            }
            (_a3 = commandOptions.onUploadProgress) == null ? void 0 : _a3.call(commandOptions, {
              loaded,
              // When passing a stream to put(), we have no way to know the total size of the body.
              // Instead of defining total as total?: number we decided to set the total to the currently
              // loaded number. This is not inaccurate and way more practical for DX.
              // Passing down a stream to put() is very rare
              total,
              percentage
            });
          } : void 0
        });
      } catch (error2) {
        if (error2 instanceof DOMException2 && error2.name === "AbortError") {
          bail(new BlobRequestAbortedError());
          return;
        }
        if (isNetworkError(error2)) {
          throw error2;
        }
        if (error2 instanceof TypeError) {
          bail(error2);
          return;
        }
        throw error2;
      }
      if (res.ok) {
        return res;
      }
      const { code, error } = await getBlobError(res);
      if (code === "unknown_error" || code === "service_unavailable" || code === "internal_server_error") {
        throw error;
      }
      bail(error);
    },
    {
      retries: getRetries(),
      onRetry: (error) => {
        if (error instanceof Error) {
          debug(`retrying API request to ${pathname}`, error.message);
        }
        retryCount = retryCount + 1;
      }
    }
  );
  if (!apiResponse) {
    throw new BlobUnknownError();
  }
  if (commandOptions == null ? void 0 : commandOptions.onUploadProgress) {
    commandOptions.onUploadProgress({
      loaded: totalLoaded,
      total: totalLoaded,
      percentage: 100
    });
  }
  return await apiResponse.json();
}
function getProxyThroughAlternativeApiHeaderFromEnv() {
  const extraHeaders = {};
  try {
    if ("VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API" in process.env && process.env.VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API !== void 0) {
      extraHeaders["x-proxy-through-alternative-api"] = process.env.VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API;
    } else if ("NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API" in process.env && process.env.NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API !== void 0) {
      extraHeaders["x-proxy-through-alternative-api"] = process.env.NEXT_PUBLIC_VERCEL_BLOB_PROXY_THROUGH_ALTERNATIVE_API;
    }
  } catch {
  }
  return extraHeaders;
}
function shouldUseXContentLength() {
  try {
    return process.env.VERCEL_BLOB_USE_X_CONTENT_LENGTH === "1";
  } catch {
    return false;
  }
}

// src/put-helpers.ts
var putOptionHeaderMap = {
  cacheControlMaxAge: "x-cache-control-max-age",
  addRandomSuffix: "x-add-random-suffix",
  allowOverwrite: "x-allow-overwrite",
  contentType: "x-content-type"
};
function createPutHeaders(allowedOptions, options) {
  const headers = {};
  if (allowedOptions.includes("contentType") && options.contentType) {
    headers[putOptionHeaderMap.contentType] = options.contentType;
  }
  if (allowedOptions.includes("addRandomSuffix") && options.addRandomSuffix !== void 0) {
    headers[putOptionHeaderMap.addRandomSuffix] = options.addRandomSuffix ? "1" : "0";
  }
  if (allowedOptions.includes("allowOverwrite") && options.allowOverwrite !== void 0) {
    headers[putOptionHeaderMap.allowOverwrite] = options.allowOverwrite ? "1" : "0";
  }
  if (allowedOptions.includes("cacheControlMaxAge") && options.cacheControlMaxAge !== void 0) {
    headers[putOptionHeaderMap.cacheControlMaxAge] = options.cacheControlMaxAge.toString();
  }
  return headers;
}
async function createPutOptions({
  pathname,
  options,
  extraChecks,
  getToken
}) {
  if (!pathname) {
    throw new BlobError("pathname is required");
  }
  if (pathname.length > MAXIMUM_PATHNAME_LENGTH) {
    throw new BlobError(
      `pathname is too long, maximum length is ${MAXIMUM_PATHNAME_LENGTH}`
    );
  }
  for (const invalidCharacter of disallowedPathnameCharacters) {
    if (pathname.includes(invalidCharacter)) {
      throw new BlobError(
        `pathname cannot contain "${invalidCharacter}", please encode it if needed`
      );
    }
  }
  if (!options) {
    throw new BlobError("missing options, see usage");
  }
  if (options.access !== "public") {
    throw new BlobError('access must be "public"');
  }
  if (extraChecks) {
    extraChecks(options);
  }
  if (getToken) {
    options.token = await getToken(pathname, options);
  }
  return options;
}
async function completeMultipartUpload({
  uploadId,
  key,
  pathname,
  parts,
  headers,
  options
}) {
  const params = new URLSearchParams({ pathname });
  try {
    const response = await requestApi(
      `/mpu?${params.toString()}`,
      {
        method: "POST",
        headers: {
          ...headers,
          "content-type": "application/json",
          "x-mpu-action": "complete",
          "x-mpu-upload-id": uploadId,
          // key can be any utf8 character so we need to encode it as HTTP headers can only be us-ascii
          // https://www.rfc-editor.org/rfc/rfc7230#swection-3.2.4
          "x-mpu-key": encodeURIComponent(key)
        },
        body: JSON.stringify(parts),
        signal: options.abortSignal
      },
      options
    );
    debug("mpu: complete", response);
    return response;
  } catch (error) {
    if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
      throw new BlobServiceNotAvailable();
    } else {
      throw error;
    }
  }
}
async function createMultipartUpload(pathname, headers, options) {
  debug("mpu: create", "pathname:", pathname);
  const params = new URLSearchParams({ pathname });
  try {
    const response = await requestApi(
      `/mpu?${params.toString()}`,
      {
        method: "POST",
        headers: {
          ...headers,
          "x-mpu-action": "create"
        },
        signal: options.abortSignal
      },
      options
    );
    debug("mpu: create", response);
    return response;
  } catch (error) {
    if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
      throw new BlobServiceNotAvailable();
    }
    throw error;
  }
}
async function uploadPart({
  uploadId,
  key,
  pathname,
  headers,
  options,
  internalAbortController = new AbortController(),
  part
}) {
  var _a3, _b2, _c;
  const params = new URLSearchParams({ pathname });
  const responsePromise = requestApi(
    `/mpu?${params.toString()}`,
    {
      signal: internalAbortController.signal,
      method: "POST",
      headers: {
        ...headers,
        "x-mpu-action": "upload",
        "x-mpu-key": encodeURIComponent(key),
        "x-mpu-upload-id": uploadId,
        "x-mpu-part-number": part.partNumber.toString()
      },
      // weird things between undici types and native fetch types
      body: part.blob
    },
    options
  );
  function handleAbort() {
    internalAbortController.abort();
  }
  if ((_a3 = options.abortSignal) == null ? void 0 : _a3.aborted) {
    handleAbort();
  } else {
    (_b2 = options.abortSignal) == null ? void 0 : _b2.addEventListener("abort", handleAbort);
  }
  const response = await responsePromise;
  (_c = options.abortSignal) == null ? void 0 : _c.removeEventListener("abort", handleAbort);
  return response;
}
var maxConcurrentUploads = typeof window !== "undefined" ? 6 : 8;
var partSizeInBytes = 8 * 1024 * 1024;
var maxBytesInMemory = maxConcurrentUploads * partSizeInBytes * 2;
function uploadAllParts({
  uploadId,
  key,
  pathname,
  stream,
  headers,
  options,
  totalToLoad
}) {
  debug("mpu: upload init", "key:", key);
  const internalAbortController = new AbortController();
  return new Promise((resolve, reject) => {
    const partsToUpload = [];
    const completedParts = [];
    const reader = stream.getReader();
    let activeUploads = 0;
    let reading = false;
    let currentPartNumber = 1;
    let rejected = false;
    let currentBytesInMemory = 0;
    let doneReading = false;
    let bytesSent = 0;
    let arrayBuffers = [];
    let currentPartBytesRead = 0;
    let onUploadProgress;
    const totalLoadedPerPartNumber = {};
    if (options.onUploadProgress) {
      onUploadProgress = throttle2(() => {
        var _a3;
        const loaded = Object.values(totalLoadedPerPartNumber).reduce(
          (acc, cur) => {
            return acc + cur;
          },
          0
        );
        const total = totalToLoad || loaded;
        const percentage = totalToLoad > 0 ? Number(((loaded / totalToLoad || loaded) * 100).toFixed(2)) : 0;
        (_a3 = options.onUploadProgress) == null ? void 0 : _a3.call(options, { loaded, total, percentage });
      }, 150);
    }
    read().catch(cancel);
    async function read() {
      debug(
        "mpu: upload read start",
        "activeUploads:",
        activeUploads,
        "currentBytesInMemory:",
        `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`,
        "bytesSent:",
        bytes(bytesSent)
      );
      reading = true;
      while (currentBytesInMemory < maxBytesInMemory && !rejected) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            doneReading = true;
            debug("mpu: upload read consumed the whole stream");
            if (arrayBuffers.length > 0) {
              partsToUpload.push({
                partNumber: currentPartNumber++,
                blob: new Blob(arrayBuffers, {
                  type: "application/octet-stream"
                })
              });
              sendParts();
            }
            reading = false;
            return;
          }
          currentBytesInMemory += value.byteLength;
          let valueOffset = 0;
          while (valueOffset < value.byteLength) {
            const remainingPartSize = partSizeInBytes - currentPartBytesRead;
            const endOffset = Math.min(
              valueOffset + remainingPartSize,
              value.byteLength
            );
            const chunk = value.slice(valueOffset, endOffset);
            arrayBuffers.push(chunk);
            currentPartBytesRead += chunk.byteLength;
            valueOffset = endOffset;
            if (currentPartBytesRead === partSizeInBytes) {
              partsToUpload.push({
                partNumber: currentPartNumber++,
                blob: new Blob(arrayBuffers, {
                  type: "application/octet-stream"
                })
              });
              arrayBuffers = [];
              currentPartBytesRead = 0;
              sendParts();
            }
          }
        } catch (error) {
          cancel(error);
        }
      }
      debug(
        "mpu: upload read end",
        "activeUploads:",
        activeUploads,
        "currentBytesInMemory:",
        `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`,
        "bytesSent:",
        bytes(bytesSent)
      );
      reading = false;
    }
    async function sendPart(part) {
      activeUploads++;
      debug(
        "mpu: upload send part start",
        "partNumber:",
        part.partNumber,
        "size:",
        part.blob.size,
        "activeUploads:",
        activeUploads,
        "currentBytesInMemory:",
        `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`,
        "bytesSent:",
        bytes(bytesSent)
      );
      try {
        const uploadProgressForPart = options.onUploadProgress ? (event) => {
          totalLoadedPerPartNumber[part.partNumber] = event.loaded;
          if (onUploadProgress) {
            onUploadProgress();
          }
        } : void 0;
        const completedPart = await uploadPart({
          uploadId,
          key,
          pathname,
          headers,
          options: {
            ...options,
            onUploadProgress: uploadProgressForPart
          },
          internalAbortController,
          part
        });
        debug(
          "mpu: upload send part end",
          "partNumber:",
          part.partNumber,
          "activeUploads",
          activeUploads,
          "currentBytesInMemory:",
          `${bytes(currentBytesInMemory)}/${bytes(maxBytesInMemory)}`,
          "bytesSent:",
          bytes(bytesSent)
        );
        if (rejected) {
          return;
        }
        completedParts.push({
          partNumber: part.partNumber,
          etag: completedPart.etag
        });
        currentBytesInMemory -= part.blob.size;
        activeUploads--;
        bytesSent += part.blob.size;
        if (partsToUpload.length > 0) {
          sendParts();
        }
        if (doneReading) {
          if (activeUploads === 0) {
            reader.releaseLock();
            resolve(completedParts);
          }
          return;
        }
        if (!reading) {
          read().catch(cancel);
        }
      } catch (error) {
        cancel(error);
      }
    }
    function sendParts() {
      if (rejected) {
        return;
      }
      debug(
        "send parts",
        "activeUploads",
        activeUploads,
        "partsToUpload",
        partsToUpload.length
      );
      while (activeUploads < maxConcurrentUploads && partsToUpload.length > 0) {
        const partToSend = partsToUpload.shift();
        if (partToSend) {
          void sendPart(partToSend);
        }
      }
    }
    function cancel(error) {
      if (rejected) {
        return;
      }
      rejected = true;
      internalAbortController.abort();
      reader.releaseLock();
      if (error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "fetch failed")) {
        reject(new BlobServiceNotAvailable());
      } else {
        reject(error);
      }
    }
  });
}

// src/multipart/uncontrolled.ts
async function uncontrolledMultipartUpload(pathname, body, headers, options) {
  debug("mpu: init", "pathname:", pathname, "headers:", headers);
  const optionsWithoutOnUploadProgress = {
    ...options,
    onUploadProgress: void 0
  };
  const createMultipartUploadResponse = await createMultipartUpload(
    pathname,
    headers,
    optionsWithoutOnUploadProgress
  );
  const totalToLoad = computeBodyLength(body);
  const stream = await toReadableStream(body);
  const parts = await uploadAllParts({
    uploadId: createMultipartUploadResponse.uploadId,
    key: createMultipartUploadResponse.key,
    pathname,
    stream,
    headers,
    options,
    totalToLoad
  });
  const blob = await completeMultipartUpload({
    uploadId: createMultipartUploadResponse.uploadId,
    key: createMultipartUploadResponse.key,
    pathname,
    parts,
    headers,
    options: optionsWithoutOnUploadProgress
  });
  return blob;
}

// src/put.ts
function createPutMethod({
  allowedOptions,
  getToken,
  extraChecks
}) {
  return async function put(pathname, body, optionsInput) {
    if (!body) {
      throw new BlobError("body is required");
    }
    if (isPlainObject(body)) {
      throw new BlobError(
        "Body must be a string, buffer or stream. You sent a plain JavaScript object, double check what you're trying to upload."
      );
    }
    const options = await createPutOptions({
      pathname,
      options: optionsInput,
      extraChecks,
      getToken
    });
    const headers = createPutHeaders(allowedOptions, options);
    if (options.multipart === true) {
      return uncontrolledMultipartUpload(pathname, body, headers, options);
    }
    const onUploadProgress = options.onUploadProgress ? throttle2(options.onUploadProgress, 100) : void 0;
    const params = new URLSearchParams({ pathname });
    const response = await requestApi(
      `/?${params.toString()}`,
      {
        method: "PUT",
        body,
        headers,
        signal: options.abortSignal
      },
      {
        ...options,
        onUploadProgress
      }
    );
    return {
      url: response.url,
      downloadUrl: response.downloadUrl,
      pathname: response.pathname,
      contentType: response.contentType,
      contentDisposition: response.contentDisposition
    };
  };
}
/*!
 * bytes
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015 Jed Watson
 * MIT Licensed
 */

var upload = createPutMethod({
  allowedOptions: ["contentType"],
  extraChecks(options) {
    if (options.handleUploadUrl === void 0) {
      throw new BlobError(
        "client/`upload` requires the 'handleUploadUrl' parameter"
      );
    }
    if (
      // @ts-expect-error -- Runtime check for DX.
      options.addRandomSuffix !== void 0 || // @ts-expect-error -- Runtime check for DX.
      options.createPutExtraChecks !== void 0 || // @ts-expect-error -- Runtime check for DX.
      options.cacheControlMaxAge !== void 0
    ) {
      throw new BlobError(
        "client/`upload` doesn't allow `addRandomSuffix`, `cacheControlMaxAge` or `allowOverwrite`. Configure these options at the server side when generating client tokens."
      );
    }
  },
  async getToken(pathname, options) {
    var _a, _b;
    return retrieveClientToken({
      handleUploadUrl: options.handleUploadUrl,
      pathname,
      clientPayload: (_a = options.clientPayload) != null ? _a : null,
      multipart: (_b = options.multipart) != null ? _b : false,
      headers: options.headers
    });
  }
});
var EventTypes = {
  generateClientToken: "blob.generate-client-token"};
async function retrieveClientToken(options) {
  const { handleUploadUrl, pathname } = options;
  const url = isAbsoluteUrl(handleUploadUrl) ? handleUploadUrl : toAbsoluteUrl(handleUploadUrl);
  const event = {
    type: EventTypes.generateClientToken,
    payload: {
      pathname,
      callbackUrl: url,
      clientPayload: options.clientPayload,
      multipart: options.multipart
    }
  };
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(event),
    headers: {
      "content-type": "application/json",
      ...options.headers
    },
    signal: options.abortSignal
  });
  if (!res.ok) {
    throw new BlobError("Failed to  retrieve the client token");
  }
  try {
    const { clientToken } = await res.json();
    return clientToken;
  } catch (e) {
    throw new BlobError("Failed to retrieve the client token");
  }
}
function toAbsoluteUrl(url) {
  return new URL(url, location.href).href;
}
function isAbsoluteUrl(url) {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
}

const getNotionDataPageMetadata = page => {
  return page[Re];
};

//todo - return keys, or keys & values
const getNotionDataPageProperties = page => {
  return page[de];
};

const getNotionDataPageId = page => {
  return getNotionDataPageMetadata(page)[G][Ne];
};

//todo: getPropertyByPage & getPropertyByPageId & getPropertyKeysByPage & getPropertyKeysByPageId
const getNotionDataPagePropertyValue = (page, propertyKey) => {
  if (isNil(page)) {
    return null;
  }
  if (!(de in page)) {
    return null;
  }
  const properties = getNotionDataPageProperties(page);
  if (!(propertyKey in properties)) {
    return null;
  }
  const propertyObject = properties[propertyKey];
  if (!(Ne in propertyObject)) {
    return null;
  }
  return propertyObject[Ne];
};

const mergePageLists = (existingList, incomingList) => {
  if (isNil(existingList)) {
    return incomingList;
  }
  if (isNil(incomingList)) {
    return existingList;
  }
  const getId = obj => getNotionDataPageMetadata(obj)[G][Ne];

  const mergedList = [...existingList, ...incomingList.reduce((acc, obj) => {
    const existingIndex = existingList.findIndex(
      item => getId(item) === getId(obj) );
    if (existingIndex !== -1) {
      existingList[existingIndex] = obj; // Replace existing object
    }
    else {
      acc.push(obj); // Add new object
    }
    return acc;
  }, [])];

  return mergedList;
};

// Operation type constants
const LOAD = 'LOAD';
const CREATE = 'CREATE';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const NEXT_CURSOR = 'NEXT_CURSOR';

// Operation data field constants
const OPERATION_DATA = 'OPERATION_DATA';
const OPERATION_TYPE = 'OPERATION_TYPE'; 
const OPERATION_ID = 'OPERATION_ID';

const useNotionData = url => {
  const [notionData, setNotionData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [operationType, setOperationType] = useState(null);
  const [operationId, setOperationId] = useState(null);
  const operationIdCounterRef = useRef(0);
  const urlRef = useRef(null);
  const activeRequestRef = useRef(null);

  // Generate a unique operation ID
  const getNextOperationId = useCallback(() => {
    operationIdCounterRef.current += 1;
    return operationIdCounterRef.current;
  }, []);

  // Cancel any active request
  const cancelRequest = useCallback(() => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
      setUpdating(false);
      setProgress(null);
      setOperationType(null);
      setOperationId(null);
      return true;
    }
    return false;
  }, []);

  // Reset operation states
  const resetOperationState = useCallback(() => {
    setError(null);
    setProgress(null);
    setResult(null);
    // We don't reset operation context here because we want to keep tracking the operation
  }, []);

  // Helper function to add operation context and set result
  const enrichResult = useCallback((result, type, id) => {
    const enrichedResult = {
      ...result,
      [OPERATION_DATA]: {
        [OPERATION_TYPE]: type,
        [OPERATION_ID]: id
      }
    };
    
    // Set the result state
    setResult(enrichedResult);
    
    return enrichedResult;
  }, []);
  
  // Helper function to prepare operation and return operation ID
  const prepareOperation = useCallback((type) => {
    resetOperationState();
    const currentOpId = getNextOperationId();
    setOperationId(currentOpId);
    setOperationType(type);
    return currentOpId;
  }, [resetOperationState, getNextOperationId]);
  
  // Helper function to upload large files directly to Vercel Blob
  const uploadToBlob = useCallback(async (fileObj) => {
    try {
      const uploadURL = new URL('/api/blob-upload', urlRef.current.origin);
      const blob = await upload(
        fileObj.file.name || `blob_${fileObj.uid}.dat`, 
        fileObj.file, {
        access: 'public',
        handleUploadUrl: uploadURL.href
      });
      
      return {
        success: true,
        url: blob.url,
        fieldName: fileObj.uid,
        filename: fileObj.file.name || `blob_${fileObj.uid}.dat`,
        uploadType: 'vercel-blob',
        originalFile: fileObj
      };
    } 
    catch (error) {
      console.error('Blob upload failed:', error);
      throw error;
    }
  }, []);

  // Helper function to process files and upload all to blob storage
  const processFilesForUpload = useCallback(async (files) => {
    if (!files) return { blobUploads: [] };
    
    const fileArray = Array.isArray(files) ? files : [files];
    
    const blobUploads = [];
    for (const fileObj of fileArray) {
      if (fileObj.file instanceof File || fileObj.file instanceof Blob) {
        try {
          const blobResult = await uploadToBlob(fileObj);
          blobUploads.push(blobResult);
        }
        catch (error) {
          console.error('Blob upload failed:', error);
          throw error;
        }
      }
    }
    
    return { blobUploads };
  }, [
    uploadToBlob
  ]);
  
  // Helper function to create and configure XHR requests
  const createXhrRequest = useCallback((method, url, options = {}) => {
    const { onProgress, onLoad, onError, jsonData } = options;
    
    const xhr = new XMLHttpRequest();
    activeRequestRef.current = xhr;
    xhr.open(method, url, true);
    
    // Set up progress tracking
    if (onProgress) {
      if (method === 'GET') {
        xhr.onprogress = onProgress;
      }
      else {
        xhr.upload.onprogress = onProgress;
      }
    }
    
    // Set up load handler
    xhr.onload = () => {
      setProgress(100); // Always set progress to 100% when response is received
      
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onLoad) {
          try {
            const response = JSON.parse(xhr.responseText);
            onLoad(response);
          } 
          catch(err) {
            setError(err.message || 'Error processing response');
            if (onError) onError(err);
          }
        }
      } 
      else {
        const errorMsg = `HTTP error: ${xhr.status}`;
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
      }
      
      // Always clean up
      setUpdating(false);
      activeRequestRef.current = null;
    };
    
    // Set up error handler
    xhr.onerror = () => {
      const errorMsg = 'Network error';
      setError(errorMsg);
      setProgress(100); // Set progress to 100 even on error
      setUpdating(false);
      activeRequestRef.current = null;
      
      if (onError) onError(new Error(errorMsg));
    };
    
    // Send the request with JSON data
    if (jsonData) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(jsonData));
    } 
    else {
      xhr.send();
    }
    
    return xhr;
  }, []);

  // Function to load data using XHR
  const loadNotionData = useCallback((dataUrl) => {
    cancelRequest();
    setUpdating(true);
    setProgress(0);
    
    const currentOpId = prepareOperation(LOAD);
    
    return new Promise((resolve, reject) => {
      createXhrRequest('GET', dataUrl, {
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        },
        onLoad: (parsedData) => {
          const validStatus = parsedData[Qe];
          
          if (isNil(validStatus) || !validStatus) {
            const errorMsg = 'Invalid data';
            setError(errorMsg);
            setNotionData({
              [IDGMD_VALID_DATA]: false,
            });
            reject(new Error(errorMsg));
            return;
          }
          
          const processedData = processQueryData(parsedData);
          setNotionData(processedData);
          const enrichedData = enrichResult(processedData, LOAD, currentOpId);
          resolve(enrichedData);
        },
        onError: reject
      });
    });
  }, [
    cancelRequest,
    prepareOperation,
    enrichResult,
    createXhrRequest
  ]);

  // Initial data load
  useEffect(() => {
    if (!url) return;
    
    loadNotionData(url);
    urlRef.current = new URL(url);
  }, [url, loadNotionData]);

  // Handle create operation
  const handleCreate = useCallback(async (update, files = null) => {
    if (updating) {
      cancelRequest();
    }

    if (!(Ae in update)) {
      setError('Missing database ID');
      return [null, Promise.reject(new Error('Missing database ID'))];
    }
    
    const dbId = update[Ae];
    const db = getNotionDataDb(notionData, dbId);
    if (isNil(db)) {
      setError('Invalid database ID');
      return [null, Promise.reject(new Error('Invalid database ID'))];
    }
    
    const pgUpdateMeta = update[Re];
    const pgUpdateMetas = isObject(pgUpdateMeta) ? pgUpdateMeta : {};
    const pgUpdateProp = update[de];
    const pgUpdateProps = isObject(pgUpdateProp) ? pgUpdateProp : {};
    
    const currentOpId = prepareOperation(CREATE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      
      const createPromise = new Promise(async (resolve, reject) => {
        try {
          // Process files - all files go to blob storage
          const { blobUploads } = await processFilesForUpload(files);
          
          const createUrl = new URL('/api/update', urlRef.current.origin);
          
          // Prepare JSON data
          const jsonData = {
            [E]: dbId,
            [_]: structuredClone(pgUpdateMetas),
            [A]: structuredClone(pgUpdateProps)
          };
          
          // Add blob upload results
          if (blobUploads.length > 0) {
            jsonData.blobUploads = blobUploads;
          }
          
          createXhrRequest('POST', createUrl.href, {
            jsonData,
            onProgress: (event) => {
              if (event.lengthComputable) {
                const rawPercentComplete = Math.round((event.loaded / event.total) * 50);
                const cappedPercentComplete = Math.min(50, rawPercentComplete);
                setProgress(cappedPercentComplete);
              }
            },
            onLoad: (crudJson) => {
              if (s in crudJson) {
                const result = crudJson[s];
                const resultType = crudJson[b];
                const success = result[resultType];
                
                if (success && resultType === r) {
                  const pg = result[N];
                  const dbId = result[O];
                  
                  setNotionData(x => {
                    const clone = structuredClone(x);
                    const dbBlocks = getNotionDataPages(clone, dbId);
                    dbBlocks.unshift(pg);
                    return clone;
                  });
                  
                  resolve(enrichResult(result, CREATE, currentOpId));
                }
                else {
                  const errorMsg = 'Create operation failed';
                  setError(errorMsg);
                  reject(new Error(errorMsg));
                }
              }
            },
            onError: reject
          });
        }
        catch (error) {
          reject(error);
        }
      });
      
      return [currentOpId, createPromise];
    } 
    else {
      // For non-live data, handle locally
      setProgress(0);
      setUpdating(true);
      
      const uId = uniqueId('page_');
      pgUpdateMetas[G] = {
        [me]: G,
        [Ne]: uId
      };
      const page = {
        [de]: pgUpdateProps,
        [Re]: pgUpdateMetas
      };
      
      setNotionData(d => {
        const x = structuredClone(notionData);
        const xPgs = getNotionDataPages(x, dbId);
        xPgs.unshift(page);
        return x;
      });
      
      setProgress(100);
      setUpdating(false);
      
      const result = { page };
      return [currentOpId, Promise.resolve(enrichResult(result, CREATE, currentOpId))];
    }
  }, [
    notionData, 
    updating, 
    urlRef, 
    cancelRequest, 
    prepareOperation, 
    processFilesForUpload,
    createXhrRequest,
    enrichResult
  ]);

  // Handle update operation
  const handleUpdate = useCallback(async (update, files = null) => {
    if (updating) {
      cancelRequest();
    }
    
    // Validate required fields
    if (!(Ae in update)) {
      setError('Missing database ID');
      return [null, Promise.reject(new Error('Missing database ID'))];
    }
    
    const dbId = update[Ae];
    const db = getNotionDataDb(notionData, dbId);
    if (isNil(db)) {
      setError('Invalid database ID');
      return [null, Promise.reject(new Error('Invalid database ID'))];
    }
    
    if (!(Se in update)) {
      setError('Missing page ID');
      return [null, Promise.reject(new Error('Missing page ID'))];
    }
    
    const pgId = update[Se];
    const pgUpdateMeta = update[Re];
    const pgUpdateMetas = isObject(pgUpdateMeta) ? pgUpdateMeta : {};
    const pgUpdateProp = update[de];
    const pgUpdateProps = isObject(pgUpdateProp) ? pgUpdateProp : {};
    
    const currentOpId = prepareOperation(UPDATE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      
      const updatePromise = new Promise(async (resolve, reject) => {
        try {
          // Process files - all files go to blob storage
          const { blobUploads } = await processFilesForUpload(files);
          
          const updateUrl = new URL('/api/update', urlRef.current.origin);
          
          // Prepare JSON data
          const jsonData = {
            [a]: pgId,
            [T]: structuredClone(pgUpdateProps),
            [R]: structuredClone(pgUpdateMetas)
          };
          
          // Add blob upload results
          if (blobUploads.length > 0) {
            jsonData.blobUploads = blobUploads;
          }
          
          createXhrRequest('PUT', updateUrl.href, {
            jsonData,
            onProgress: (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setProgress(percentComplete);
              }
            },
            onLoad: (crudJson) => {
              if (s in crudJson) {
                const result = crudJson[s];
                const resultType = crudJson[b];
                const success = result[resultType];
                
                if (success && resultType === n) {
                  const pg = result[N];
                  const dbId = result[O];
                  const pgId = result[Y];
                  
                  setNotionData(x => {
                    const clone = structuredClone(x);
                    const dbBlocks = getNotionDataPages(clone, dbId);
                    const idx = dbBlocks.findIndex(x => 
                      x[Re][G][Ne] === pgId);
                    if (idx >= 0) {
                      dbBlocks.splice(idx, 1, pg);
                    }
                    return clone;
                  });
                  
                  const resultObj = {
                    metas: result[L].length,
                    blocks: result[p].length,
                    pageId: pgId,
                    dbId: dbId,
                  };
                  resolve(enrichResult(resultObj, UPDATE, currentOpId));
                } 
                else {
                  const errorMsg = 'Update operation failed';
                  setError(errorMsg);
                  reject(new Error(errorMsg));
                }
              }
            },
            onError: reject
          });
        } 
        catch (error) {
          reject(error);
        }
      });
      
      return [currentOpId, updatePromise];
    }
    else {
      // For non-live data, handle locally
      setProgress(0);
      
      //todo: Track how many we update successfully and report back
      const updatePage = d => {
        const x = structuredClone(d);
        const xpg = getNotionDataPage(x, dbId, pgId);

        const xpgMetas = xpg[Re];
        for (const [key, value] of Object.entries(pgUpdateMetas)) {
          if (key in xpgMetas) {
            xpgMetas[key] = value;
          }
        }

        const xpgProps = xpg[de];
        for (const [key, value] of Object.entries(pgUpdateProps)) {
          if (key in xpgProps) {
            xpgProps[key] = value;
          }
        }
        return x;
      };
      
      setNotionData(updatePage);
      setProgress(100);
      
      return [currentOpId, Promise.resolve(enrichResult({}, UPDATE, currentOpId))];
    }
  }, [
    notionData,
    updating,
    urlRef,
    cancelRequest,
    prepareOperation,
    processFilesForUpload,
    createXhrRequest,
    enrichResult
  ]);

  const handleDelete = useCallback((dbId, pgId) => {
    if (updating) {
      cancelRequest();
    }
    
    const pg = getNotionDataPage(notionData, dbId, pgId);
    if (isNil(pg)) {
      return {
        id: null,
        type: null,
        promise: Promise.resolve(false)
      };
    }
    
    const currentOpId = prepareOperation(DELETE);
    
    if (isNotionDataLive(notionData)) {
      setUpdating(true);
      setProgress(0);
      
      const deletePromise = new Promise((resolve, reject) => {
        const deleteUrl = new URL('/api/update', urlRef.current.origin);
        deleteUrl.searchParams.append(t, pgId);
        
        // Set a determinate progress even though we can't track actual progress for DELETE
        setTimeout(() => {
          if (activeRequestRef.current) {
            setProgress(50);
          }
        }, 300);
        
        createXhrRequest('DELETE', deleteUrl.href, {
          onLoad: (crudJson) => {
            if (s in crudJson) {
              const result = crudJson[s];
              const resultType = crudJson[b];
              const success = result[resultType];
              
              if (success && resultType === u) {
                const delId = result[D];
                setNotionData(x => spliceNotionPage(x, delId));
                
                const resultObj = {
                  deletedId: delId,
                  success: true
                };
                resolve(enrichResult(resultObj, DELETE, currentOpId));
              } 
              else {
                const errorMsg = 'Delete operation failed';
                setError(errorMsg);
                reject(new Error(errorMsg));
              }
            }
          },
          onError: reject
        });
      });
      
      return {
        id: currentOpId,
        type: DELETE,
        promise: deletePromise
      };
    }
    else {
      // For non-live mode
      setUpdating(true);
      setProgress(0);
      
      setNotionData(x => spliceNotionPage(x, pgId));
      
      setProgress(100);
      setUpdating(false);
      
      const resultObj = { 
        deletedId: pgId,
        success: true 
      };
      const enrichedResult = enrichResult(resultObj, DELETE, currentOpId);
      
      return {
        id: currentOpId,
        type: DELETE,
        promise: Promise.resolve(enrichedResult)
      };
    }
  }, [
    notionData, 
    updating, 
    urlRef, 
    cancelRequest, 
    prepareOperation, 
    createXhrRequest, 
    enrichResult
  ]);

  // Handle next cursor
  const handleNextCursor = useCallback(() => {
    const nextCursor = getNotionDataNextCursor(notionData);
    if (updating || isNil(nextCursor)) {
      return [null, Promise.resolve(false)];
    }
    
    const currentOpId = prepareOperation(NEXT_CURSOR);
    setUpdating(true);
    setProgress(0);
    
    const cursorPromise = new Promise((resolve, reject) => {
      const cursorUrl = new URL(urlRef.current);
      const params = new URLSearchParams(cursorUrl.search);
      params.set(Ue, Ce);
      params.set(Le, nextCursor);
      cursorUrl.search = params.toString();
      
      createXhrRequest('GET', cursorUrl.href, {
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        },
        onLoad: (cursorJson) => {
          const validStatus = cursorJson[Qe];
          
          if (isNil(validStatus) || !validStatus) {
            setError('Invalid data');
            reject(new Error('Invalid data'));
          }
          else {
            setNotionData(x => {
              const x2 = structuredClone(x);
              const z = processQueryData(cursorJson);
              
              const primaryDbId = getNotionDataPrimaryDbId(x2);
              const exsPrimaryPgs = getNotionDataPages(x2, primaryDbId);
              const newPrimaryPgs = getNotionDataPages(z, primaryDbId);
              const mergedPrimaryPgs = mergePageLists(exsPrimaryPgs, newPrimaryPgs);
              z[IDGMD_DATA][ce][B] = mergedPrimaryPgs;
              
              const previewDbIds = getNotionDataRelationDbIds(x2);
              for (const previewDbId of previewDbIds) {
                const exsPreviewPgs = getNotionDataPages(x2, previewDbId);
                const newPreviewPgs = getNotionDataPages(z, previewDbId);
                const mergedPreviewPgs = mergePageLists(exsPreviewPgs, newPreviewPgs);
                z[IDGMD_DATA][oe].find(
                  db => db[Ae] === previewDbId
                )[B] = mergedPreviewPgs;
              }
              
              return z;
            });
            
            setResult({
              success: true,
              _operationContext: {
                type: NEXT_CURSOR,
                id: currentOpId
              }
            });
            resolve(true);
          }
        },
        onError: reject
      });
    });
    
    return [currentOpId, cursorPromise];
  }, [
    notionData,
    updating,
    urlRef,
    prepareOperation,
    createXhrRequest
  ]);

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleNextCursor,
    cancelRequest,
    notionData,
    updating,
    progress,
    error,
    result,
    operationType,
    operationId
  };
};

// Keep the processQueryData function unchanged
const processQueryData = ( ojsonObject ) => {
  const parsePrimaryDbId = (x) => {
    const job = x[IDGMD_DATA];
    return job[ce][Ae];
  };

  const parseRelationDbIds = (x) => {
    const job = x[IDGMD_DATA];
    const t = job[oe].map( db => db[Ae] );
    return t;
  };

  const jsonObject = structuredClone( ojsonObject ); 
  delete jsonObject[Qe];
  jsonObject[IDGMD_LIVE_DATA] = jsonObject[pe] ? false : true;
  delete jsonObject[pe];
  jsonObject[IDGMD_DATA] = jsonObject[ye];
  delete jsonObject[ye];
  jsonObject[IDGMD_VALID_DATA] = true;
  jsonObject[IDGMD_PRIMARY_DBID] = parsePrimaryDbId( jsonObject );
  const hasRels = jsonObject[ue] && Array.isArray(jsonObject[oe]) || false;
  jsonObject[IDGMD_RELATION_DBIDS] = hasRels ? parseRelationDbIds( jsonObject ) : [];
  return jsonObject;
};

export { DATE_PRETTY_SHORT_DATE, DATE_PRETTY_SHORT_NUMERIC_DATE, formatDateForNotion, getDbIdByName, getNotionDataDb, getNotionDataPage, getNotionDataPageId, getNotionDataPageMetadata, getNotionDataPageProperties, getNotionDataPagePropertyValue, getNotionDataPages, getNotionDataPrimaryDbId, getNotionDataRelationDbIds, hasNotionDataNextCursor, isNotionDataLive, isNotionDataLoaded, isNotionDataValid, prettyPrintNotionDate, useNotionData };
//# sourceMappingURL=notionDataHook.js.map
