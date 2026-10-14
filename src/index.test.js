import { fireEvent, getByText } from '@testing-library/dom'
import '@testing-library/jest-dom/extend-expect'
import { JSDOM } from 'jsdom'
import rangeSlider from './index.js'

const { window } = new JSDOM('<!doctype html><html><body><div></div><div></div></body></html>')

global.document = window.document
global.window = window

const element = document.getElementsByTagName('div')

const sliderDefault = rangeSlider(element[0])

const sliderCustom = rangeSlider(element[1], {
  min: -30,
  max: 90,
  step: 1,
  value: [-15, 75],
  orientation: 'vertical'
})

describe('index.html', () => {

  it('renders range sliders', () => {
    for(let i = 0; i < 1; i ++)
      expect(element[i].children.length).toEqual(5)
    expect(document.querySelectorAll('.range-slider').length).toEqual(2)
    expect(document.querySelectorAll('.range-slider input[type=range]').length).toEqual(4)
    expect(document.querySelectorAll('.range-slider .range-slider__thumb').length).toEqual(4)
    expect(document.querySelectorAll('.range-slider .range-slider__range').length).toEqual(2)
  })

  test('returned functions return data as expected for a default slider', () => {
    expect(sliderDefault.min()).toEqual(0)
    expect(sliderDefault.max()).toEqual(100)
    expect(sliderDefault.step()).toEqual(1)
    expect(sliderDefault.value()).toEqual([25, 75])
    expect(sliderDefault.orientation()).toEqual('horizontal')
  })

  test('returned functions return data as expected for a custom slider', () => {
    expect(sliderCustom.min()).toEqual(-30)
    expect(sliderCustom.max()).toEqual(90)
    expect(sliderCustom.step()).toEqual(1)
    expect(sliderCustom.value()).toEqual([-15, 75])
    expect(sliderCustom.orientation()).toEqual('vertical')
  })

  test('min() sets data as expected', () => {
    
    // Invalid value
    sliderDefault.min('string')
    expect(sliderDefault.min()).toEqual(1)

    // Valid value
    sliderDefault.min(10)
    expect(sliderDefault.min()).toEqual(10)
  })

  test('max() sets data as expected', () => {
    
    // Invalid value
    sliderDefault.max('string')
    expect(sliderDefault.max()).toEqual(1)

    // Valid value
    sliderDefault.max(99)
    expect(sliderDefault.max()).toEqual(99)
  })

  test('step() sets data as expected', () => {
    
    // Invalid value
    // Any invalid value will return 1 (default value)
    // which is also the default in case of a <input type="range" />
    // MDN: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#step
    sliderDefault.step('string')
    expect(sliderDefault.step()).toEqual(1)

    // Valid value
    sliderDefault.step(2)
    expect(sliderDefault.step()).toEqual(2)
  })

  test('value() sets data as expected', () => {

    // Valid value
    sliderDefault.value([30, 60])
    expect(sliderDefault.value()).toEqual([30, 60])
    
    // Valid value (inverted)
    sliderDefault.value([50, 40])
    expect(sliderDefault.value()).toEqual([40, 50])

    // Invalid value
    // Both values will be set to (min + max) / 2
    sliderDefault.value(['string', 'string'])
    expect(sliderDefault.value()).toEqual([50, 50])
  })

  test('orientation() sets data as expected', () => {

    // Valid value
    sliderDefault.orientation('vertical')
    expect(sliderDefault.orientation()).toEqual('vertical')

    // Invalid value
    // Invalid values will be set but will be treated as 'horizontal'
    sliderDefault.orientation(true)
    expect(sliderDefault.orientation()).toEqual(true)
  })

  test('disabled() sets data as expected', () => {

    sliderDefault.disabled()
    expect(element[0].hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.disabled(false)
    expect(!element[0].hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.disabled(true)
    expect(element[0].hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.disabled(false)
    expect(!element[0].hasAttribute('data-disabled')).not.toBeNull()
  })

  test('thumbsDisabled() sets data as expected', () => {

    const lowerThumb = element[0].querySelector('[data-lower]')
    const upperThumb = element[0].querySelector('[data-upper]')

    sliderDefault.thumbsDisabled()
    expect(lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled(false)
    expect(!lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled(true)
    expect(lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([false])
    expect(!lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([true])
    expect(lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([])
    expect(!lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([true, false])
    expect(lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([false, true])
    expect(!lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([false, false])
    expect(!lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(!upperThumb.hasAttribute('data-disabled')).not.toBeNull()

    sliderDefault.thumbsDisabled([true, true])
    expect(lowerThumb.hasAttribute('data-disabled')).not.toBeNull()
    expect(upperThumb.hasAttribute('data-disabled')).not.toBeNull()
  })

  test('keyboard accessibility', () => {

    const lowerThumb = element[0].querySelector('[data-lower]')
    lowerThumb.focus()

    const keyDown = new window.KeyboardEvent('keydown', {'keyCode': 37})
    const keyUp = new window.KeyboardEvent('keyup', {'keyCode': 37})

    document.dispatchEvent(keyDown)
    expect(lowerThumb.hasAttribute('data-active')).not.toBeNull()

    document.dispatchEvent(keyUp)
    expect(!lowerThumb.hasAttribute('data-active')).not.toBeNull()
  })

  test('range is styled when the element has no dimensions (e.g. hidden)', () => {
    // JSDOM does no layout, so getBoundingClientRect() returns all zeroes,
    // just like it does for an element inside a parent with display: none
    const el = document.createElement('div')
    document.body.appendChild(el)
    rangeSlider(el, { value: [20, 60] })

    const range = el.querySelector('.range-slider__range')
    expect(range.style.left).toEqual('20%')
    expect(range.style.width).toEqual('40%')
  })

  test('element resize updates the range and observer is disconnected', () => {
    // Save the original so it can be restored even if an assertion fails
    const hadResizeObserver = 'ResizeObserver' in window
    const originalResizeObserver = window.ResizeObserver
    const instances = []
    window.ResizeObserver = class {
      constructor (callback) { this.callback = callback; this.observed = []; this.disconnected = false; instances.push(this) }
      observe (el) { this.observed.push(el) }
      disconnect () { this.disconnected = true }
    }

    try {
      const el = document.createElement('div')
      document.body.appendChild(el)
      const slider = rangeSlider(el, { value: [20, 60] })
      const range = el.querySelector('.range-slider__range')

      expect(instances.length).toEqual(1)
      expect(instances[0].observed).toEqual([el])

      // Simulate the element being shown with a width of 200px (thumbs are 0px wide in JSDOM)
      range.style.left = ''
      range.style.width = ''
      el.getBoundingClientRect = () => ({ top: 0, bottom: 8, left: 0, right: 200 })
      instances[0].callback([])
      expect(range.style.left).toEqual('20%')
      expect(range.style.width).toEqual('40%')

      slider.removeGlobalEventListeners()
      expect(instances[0].disconnected).toEqual(true)
    } finally {
      if (hadResizeObserver) {
        window.ResizeObserver = originalResizeObserver
      } else {
        delete window.ResizeObserver
      }
    }
  })

})
