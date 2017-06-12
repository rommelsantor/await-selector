const awaitSelector = (selector, rootNode, fallbackDelay) => new Promise((resolve, reject) => {
  try {
    const root = rootNode || document
    const observerClass = MutationObserver || WebKitMutationObserver || undefined
    const mutationObserverSupported = typeof observerClass === 'function'
    
    let observer
    
    const stopWatching = () => {
      if (observer) {
        mutationObserverSupported ? observer.disconnect() : clearInterval(observer)
        observer = null
      }
    }

    const findAndResolveElements = () => {
      const allElements = root.querySelectorAll(selector)
      
      if (allElements.length === 0) return
      
      let newElements = 0
      
      if (!mutationObserverSupported) {
        const attributeForBypassing = 'data-mutationobserved'

        allElements.forEach(el => {
          if (typeof el[attributeForBypassing] === 'undefined') {
            el[attributeForBypassing] = ''
            ++newElements
          }
        })
      }
      
      if (mutationObserverSupported || newElements > 0) {
        stopWatching()
        resolve(allElements)
      }
    }
    
    if (mutationObserverSupported) {
      observer = new observerClass(mutationRecords => {
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
    
    window.addEventListener('load', findAndResolveElements)
  } catch (exception) {
    reject(exception)
  }
})
