/* global MutationObserver WebKitMutationObserver */

const awaitSelector = (selector, rootNode, fallbackDelay) => new Promise((resolve, reject) => {
  try {
    const root = rootNode || document
    const ObserverClass = MutationObserver || WebKitMutationObserver || null
    const mutationObserverSupported = typeof ObserverClass === 'function'

    let observer

    const stopWatching = () => {
      if (observer) {
        if (mutationObserverSupported) {
          observer.disconnect()
        } else {
          clearInterval(observer)
        }

        observer = null
      }
    }

    const findAndResolveElements = () => {
      const allElements = root.querySelectorAll(selector)

      if (allElements.length === 0) return

      let newElements = 0

      if (!mutationObserverSupported) {
        const attributeForBypassing = 'data-mutationobserved'

        allElements.forEach((el, i) => {
          if (typeof el[attributeForBypassing] === 'undefined') {
            allElements[i][attributeForBypassing] = ''
            newElements += 1
          }
        })
      }

      if (mutationObserverSupported || newElements > 0) {
        stopWatching()
        resolve(allElements)
      }
    }

    if (mutationObserverSupported) {
      observer = new ObserverClass(mutationRecords => {
        const nodesWereAdded = mutationRecords.reduce(
          (found, record) => found || (record.addedNodes && record.addedNodes.length > 0),
          false
        )

        if (nodesWereAdded) {
          findAndResolveElements()
        }
      })

      observer.observe(root, {
        childList: true,
        subtree: true,
      })
    } else {
      observer = setInterval(findAndResolveElements, fallbackDelay || 250)
    }

    (global || window).addEventListener('load', findAndResolveElements)
  } catch (exception) {
    reject(exception)
  }
})
