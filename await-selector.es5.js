'use strict';

/* global MutationObserver WebKitMutationObserver */

//
// use this transpiled-backward ES5 version instead of await-selector.js only
// if you need to use awaitSelector() outside of a Babel-enabled context
//

var awaitSelector = function awaitSelector(selector, rootNode, fallbackDelay) {
  return new Promise(function (resolve, reject) {
    try {
      var root = rootNode || document;
      var ObserverClass = MutationObserver || WebKitMutationObserver || null;
      var mutationObserverSupported = typeof ObserverClass === 'function';

      var observer = void 0;

      var stopWatching = function stopWatching() {
        if (observer) {
          if (mutationObserverSupported) {
            observer.disconnect();
          } else {
            clearInterval(observer);
          }

          observer = null;
        }
      };

      var findAndResolveElements = function findAndResolveElements() {
        var allElements = root.querySelectorAll(selector);

        if (allElements.length === 0) return;

        var newElements = [];

        var attributeForBypassing = 'data-awaitselector-resolved';

        allElements.forEach(function (el, i) {
          if (typeof el[attributeForBypassing] === 'undefined') {
            allElements[i][attributeForBypassing] = '';
            newElements.push(allElements[i]);
          }
        });

        if (newElements.length > 0) {
          stopWatching();
          resolve(newElements);
        }
      };

      if (mutationObserverSupported) {
        observer = new ObserverClass(function (mutationRecords) {
          var nodesWereAdded = mutationRecords.reduce(function (found, record) {
            return found || record.addedNodes && record.addedNodes.length > 0;
          }, false);

          if (nodesWereAdded) {
            findAndResolveElements();
          }
        });

        observer.observe(root, {
          childList: true,
          subtree: true
        });
      } else {
        observer = setInterval(findAndResolveElements, fallbackDelay || 250);
      }

      findAndResolveElements();
    } catch (exception) {
      reject(exception);
    }
  });
};

var watchAwaitSelector = function watchAwaitSelector(callback, selector, rootNode, fallbackDelay) {
  (function awaiter() {
    var continueWatching = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    if (continueWatching === false) return;

    awaitSelector(selector, rootNode, fallbackDelay).then(callback).then(awaiter);
  })();
};
