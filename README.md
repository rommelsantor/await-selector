# awaitSelector()
Do away with polling; let the DOM tell you when dynamically added elements are available!

If you have ever had to deal with the dirty job of writing ugly code to wait for an element to appear in the DOM, you know how much it can hurt your soul.

The two typical solutions from days of yore are either to keep polling the DOM to see if the required elements have been dynamically inserted yet or, even worse, just set a really long delay on a `setTimeout()` call and hope it's long enough that the content is available at the end of it.

This is especially problematic when you're dealing with third-party scripts that your local code relies on.

Fortunately, there's a modern solution that won't keep you up at night: `MutationObserver`. This class is available in all modern browsers (IE11, even). It allows you to ask to be notified if there are any changes in the DOM.

It was perfect for this `awaitSelector()` function I wrote to allow you to very simply specify the selector(s) you're looking for and use a Promise to handle *all* matching elements when *any* newly inserted matching elements appear.

Below is a snippet of an example, which you can see in an interactive example on [this CodePen https://codepen.io/rommelsantor/pen/ZyWPWa?editors=0011].

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

As a fallback, if you're concerned about older browsers, the function will automatically use the aforementioned polling to look for new elements that match your selector(s). You can specify the polling delay, but it defaults to 250ms.
