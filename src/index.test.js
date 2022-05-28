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

})
