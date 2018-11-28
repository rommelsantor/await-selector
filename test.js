'use strict'

import awaitSelector, { watchAwaitSelector } from '.'

test('Injected DOM nodes are detected correctly', async () => {
  // Jest doesn't support MutationObserver,so we'll disable and use our fallback functionality
  Object.defineProperty(window, 'MutationObserver', { value: null })
  Object.defineProperty(window, 'WebKitMutationObserver', { value: null })

  document.body.innerHTML = `
    <div id="root">
      Nothing to see here.
    </div>
  `

  const root = document.querySelector('#root')

  const elementsAlreadyInDom = await awaitSelector('#root')
  console.log('Detected nodes in the DOM at startup:', elementsAlreadyInDom)
  expect(Array.isArray(elementsAlreadyInDom)).toBe(true)

  expect(document.querySelector('.watched-element')).toBe(null)
  expect(document.querySelector('.injected-element')).toBe(null)

  setTimeout(async () => {
    const div = document.createElement('div')
    div.className = 'injected-element'
    div.innerHTML = 'first injected element'
    div.which = 'first'
    root.appendChild(div)

    expect(document.querySelector('.injected-element')).not.toBe(null)

    console.log('Appended first div into #root:', document.body.innerHTML)

    // a second injection with the same selector should NOT be detected again
    const secondInjectedElements = await awaitSelector('.injected-element', '#root')
    console.log('Detected second injection into the DOM:', secondInjectedElements)
    expect(Array.isArray(secondInjectedElements)).toBe(true)
    expect(secondInjectedElements.length).toBe(1)
  }, 100)

  setTimeout(() => {
    const div = document.createElement('div')
    div.className = 'injected-element'
    div.innerHTML = 'second injected element'
    div.which = 'second'
    root.appendChild(div)

    console.log('Appended second div into #root:', document.body.innerHTML)
  }, 100)

  setTimeout(() => {
    const div = document.createElement('div')
    div.className = 'watched-element'
    div.innerHTML = 'watched element'
    div.which = 'watched'
    root.appendChild(div)

    console.log('Appended watched div into #root:', document.body.innerHTML)
  }, 100)

  // a new node in the DOM is detected only once
  const firstInjectedElements = await awaitSelector('.injected-element', '#root')
  console.log('Detected first injection into the DOM:', firstInjectedElements)
  expect(Array.isArray(firstInjectedElements)).toBe(true)
  expect(firstInjectedElements.length).toBe(1)

  // using "watch" mode, any time a new matching node appears, the callback will fire
  watchAwaitSelector(
    newElements => {
      console.log('Watcher got new elements:', newElements)
      return false // return false to stop watching
    },
    '.watched-element',
    '#root'
  )
})
