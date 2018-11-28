# awaitSelector()

Do away with polling; let the DOM tell you when dynamically added elements are available. If you have ever had to deal with the dirty job of writing ugly code to wait for an element to appear in the DOM, you know how much it can hurt your soul.

The two typical solutions from days of yore are either to keep polling the DOM to see if the required elements have been dynamically inserted yet or, even worse, just set a really long delay on a `setTimeout()` call and hope it's long enough that the content is available at the end of it.

Now you can use `await-selector` to take care of it in a much cleaner way.

See also my Medium article: [Promise-Based Detection of Element Injection &raquo;](https://hackernoon.com/promise-based-detection-of-element-injection-94bc12e33966)

## Install

`npm install await-selector`

## awaitSelector() Example

`awaitSelector()` will resolve the first time a selector appears in the DOM (or if it is already in the DOM when called).

```
import awaitSelector, { watchAwaitSelector } from 'await-selector'

// Promises

// a given element will only ever be detected a maximum of once
awaitSelector('.news-story', '#news-feed')
  .then(elements => { // elements is an array of native DOM elements
    // ... do something with the new element(s) ...
  })

// Async/Await

(async () => {
  const elements = await awaitSelector('.comment', '#comment-list')
  // ... do something with the new element(s) ...
})()
```

## watchAwaitSelector() Example

`watchAwaitSelector()` will fire a callback every time a selector appears in the DOM.

```
watchAwaitSelector(
  elements => {
    // ... do something with the new element(s) ...
  },
  '.post-body',
  '#posts'
)
```

## Usage

Function Parameters
* `selector` - the CSS selector used to select new matching elements
* (`rootNode`) - the element or selector that should be used as the subtree root to watch for DOM changes; default: `document`
* (`fallbackDelay`) - the delay (in millisecs) to wait between lookups if using the fallback polling method (if `MutationObserver` is not available); default: 250

`awaitSelector` Return Value
* `Promise` resolving an array containing elements not yet found matching your selector found in the DOM within the `rootNode`

`watchAwaitSelector`
* Your callback to `watchAwaitSelector` can return `false` to stop watching

## Demo

Below is a snippet of an example, which you can see in an interactive example on [this CodePen](https://codepen.io/rommelsantor/pen/ZyWPWa?editors=0011). It simply logs elements with the matching class name whenever they are inserted into the DOM.

```
const dumpElements = elements =>
  elements.forEach(el => console.log('Successfully detected element:', el.outerHTML))

const createAwaiter = () => {
  const subtreeRoot = document.querySelector('#the-parent')
  
  awaitSelector('.my-list-item', subtreeRoot)
    .then(dumpElements)
    .then(createAwaiter)
    .catch(error => console.log('Hmm. Something borke!', error.message))
}

createAwaiter()
```

You can use `watchAwaitSelector` instead of the code in the `createAwaiter()` code in the snippet above, which simply invokes itself:

```
const subtreeRoot = document.querySelector('#the-parent')
watchAwaitSelector(dumpElements, '.my-list-item', subtreeRoot)
```

As a fallback, if you're concerned about older browsers, the function will automatically use the aforementioned polling to look for new elements that match your selector(s). You can specify the polling delay, but it defaults to 250ms.
