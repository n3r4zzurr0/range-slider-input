module.exports = (element, options = {}) => {
  // Actual value
  const value = { min: 0, max: 0 }
  // Thumb indexes for min and max values
  const index = { min: 0, max: 1 }
  // Thumb width for calculation of exact positions and sizes of <thumb>s and <range>
  const thumbWidth = { min: 0, max: 0 }
  // Slider value depending on the user interaction
  let sliderValue = { min: 0, max: 0 }

  // For dragging <thumb>s and <range>
  let maxWidth = 0
  let rangeWidth = 0
  let isDragging = false
  let thumbDrag = false
  let thumbIndex = 0
  let startPos = 0

  // To check if extreme values have been set
  let maxSet = false
  let minSet = false

  // For minification
  const _document = document
  const _parseFloat = parseFloat
  const _mathAbsolute = Math.abs
  const _getComputedStyle = window.getComputedStyle
  const _setAttribute = 'setAttribute'
  const _removeAttribute = 'removeAttribute'
  const _addEventListener = 'addEventListener'
  const _getElementsByTagName = 'getElementsByTagName'

  const listenerOptions = { passive: false, capture: true }

  const fallbackToDefault = (property, defaultValue) => {
    options[property] = Object.prototype.hasOwnProperty.call(options, property) ? options[property] : defaultValue
  }

  const isNumber = n => {
    return +n + '' === n + ''
  }

  const safeValues = () => {
    let error = false
    if (!isNumber(options.min) || !isNumber(options.max)) { error = true }
    options.min = error ? 1 : +options.min
    options.max = error ? 1 : +options.max
  }

  const setValue = (val, forceSet = false, callback = true) => {
    const currentValue = {
      min: input[index.min].value,
      max: input[index.max].value
    }

    val = val || currentValue

    sliderValue = val
    input[index.min].value = val.min
    input[index.max].value = (thumbDrag || forceSet) ? val.max : (val.min + rangeWidth)
    value.min = +input[index.min].value
    value.max = +input[index.max].value

    // Check if the values are correctly set
    if (forceSet) {
      if (value.min > value.max) {
        switchIndex()
        value.min = +input[index.min].value
        value.max = +input[index.max].value
      }
      sliderValue = value
    }

    let valueSet = false

    if (currentValue.min !== input[index.min].value || forceSet) { valueSet = true }

    if (currentValue.max !== input[index.max].value || forceSet) { valueSet = true }

    // Update the <thumb>s and <range> positions and widths everytime a value is set
    if (valueSet) {
      if (callback && options.oninput) { options.oninput([value.min, value.max]) }
      updateThumbs()
      updateRange()
    }
  }

  const switchIndex = () => {
    index.min = +!index.min
    index.max = +!index.max
    thumb[index.min][_removeAttribute]('data-max')
    thumb[index.max][_removeAttribute]('data-min')
    thumb[index.min][_setAttribute]('data-min', '')
    thumb[index.max][_setAttribute]('data-max', '')
    if (thumbDrag) { thumbDrag = thumbDrag === 'min' ? 'max' : 'min' }
  }

  const updateInputState = () => {
    let indexSwitched = false

    if (thumbIndex === index.min) {
      if (input[thumbIndex].value > value.max) {
        switchIndex()
        indexSwitched = true
      }
    }

    if (thumbIndex === index.max) {
      if (input[thumbIndex].value < value.min) {
        switchIndex()
        indexSwitched = true
      }
    }

    if (indexSwitched) { setValue('', true) }
  }

  const updateThumbs = () => {
    thumb[index.min].style.left = `calc(${((value.min - options.min) / maxWidth) * 100}% + ${(0.5 - ((value.min - options.min) / maxWidth)) * thumbWidth.min}px)`
    thumb[index.max].style.left = `calc(${((value.max - options.min) / maxWidth) * 100}% + ${(0.5 - ((value.max - options.min) / maxWidth)) * thumbWidth.max}px)`
  }

  const updateRange = () => {
    const deltaLeft = ((0.5 - ((value.min - options.min) / maxWidth)) * thumbWidth.min) / element.clientWidth
    const deltaWidth = ((0.5 - ((value.max - options.min) / maxWidth)) * thumbWidth.max) / element.clientWidth
    range.style.left = `${(((value.min - options.min) / maxWidth) + deltaLeft) * 100}%`
    range.style.width = `${(((value.max - options.min) / maxWidth) - ((value.min - options.min) / maxWidth) - deltaLeft + deltaWidth) * 100}%`
  }

  const syncThumbWidth = () => {
    thumbWidth.min = _parseFloat(_getComputedStyle(thumb[index.min]).width)
    thumbWidth.max = _parseFloat(_getComputedStyle(thumb[index.max]).width)
  }

  const currentPosition = (e, node) => {
    return ((node.offsetLeft + (e.clientX - node.getBoundingClientRect().left) - (thumbDrag ? ((0.5 - (value[thumbDrag] - options.min) / maxWidth) * thumbWidth[thumbDrag]) : 0)) / element.clientWidth) * maxWidth + options.min
  }

  const eventElementTagName = e => {
    return e.target.tagName.toLowerCase()
  }

  const elementFocused = e => {
    let setFocus = false

    if (eventElementTagName(e) !== 'thumb' && eventElementTagName(e) !== 'range') { setFocus = true }

    if (options.rangeSlideDisabled && eventElementTagName(e) !== 'thumb') { setFocus = true }

    if (setFocus) {
      let nearestThumbIndex = 1
      const currPos = currentPosition(e, range)
      const deltaMin = _mathAbsolute(value.min - currPos)
      const deltaMax = _mathAbsolute(value.max - currPos)
      if (deltaMin === deltaMax) { setValue({ min: value.min, max: currPos }, true) } else {
        setValue({ min: deltaMin < deltaMax ? currPos : value.min, max: deltaMax < deltaMin ? currPos : value.max }, true)
        nearestThumbIndex = deltaMin < deltaMax ? index.min : index.max
      }
      initiateThumbDrag(e, nearestThumbIndex, thumb[nearestThumbIndex])
    }
  }

  const initiateThumbDrag = (e, i, node) => {
    if (!options.disabled) {
      syncThumbWidth()
      startPos = currentPosition(e, node)
      thumbDrag = index.min === i ? 'min' : 'max'
      thumbIndex = i
      isDragging = true
      thumb[i][_setAttribute]('data-active', '')
    }
  }

  const initiateRangeDrag = e => {
    if (!options.disabled && !options.rangeSlideDisabled) {
      syncThumbWidth()
      rangeWidth = value.max - value.min
      startPos = currentPosition(e, range)
      thumbDrag = false
      isDragging = true
      range[_setAttribute]('data-active', '')
    }
  }

  const drag = e => {
    if (isDragging) {
      const lastPos = currentPosition(e, range)
      const delta = lastPos - startPos

      let min = value.min
      let max = value.max

      if (!thumbDrag || thumbDrag === 'min') { min = thumbDrag ? lastPos : (sliderValue.min + delta) }
      if (!thumbDrag || thumbDrag === 'max') { max = thumbDrag ? lastPos : (sliderValue.max + delta) }

      if (min >= options.min && max <= options.max) {
        setValue({ min, max })
        startPos = lastPos
        updateInputState()
        maxSet = false
        minSet = false
      } else {
        if (min < options.min && !minSet) {
          if (!thumbDrag) { setValue({ min: options.min, max: value.max - value.min + options.min }) } else { setValue({ min: options.min, max: value.max }) }
          startPos = lastPos
          updateInputState()
          minSet = true
        }
        if (max > options.max && !maxSet) {
          if (!thumbDrag) { setValue({ min: value.min - value.max + options.max, max: options.max }) } else { setValue({ min: value.min, max: options.max }) }
          startPos = lastPos
          updateInputState()
          maxSet = true
        }
      }
    }
  }

  const updateLimits = (limit, m = false) => {
    if (m || m === 0) {
      options[limit] = m
      safeValues()
      input[0][_setAttribute]('min', options.min)
      input[0][_setAttribute]('max', options.max)
      input[1][_setAttribute]('min', options.min)
      input[1][_setAttribute]('max', options.max)
      maxWidth = options.max - options.min
      syncThumbWidth()
      setValue('', true)
    } else { return options[limit] }
  }

  // Set options to default values if not set
  fallbackToDefault('rangeSlideDisabled', false)
  fallbackToDefault('disabled', false)
  fallbackToDefault('oninput', false)
  fallbackToDefault('value', [0.25, 0.75])
  fallbackToDefault('step', 'any')
  fallbackToDefault('min', 0)
  fallbackToDefault('max', 1)

  safeValues()

  // Fill wrapper element
  element.innerHTML = `<input type="range" min="${options.min}" max="${options.max}" step="${options.step}" value="${options.value[0]}"><input type="range" min="${options.min}" max="${options.max}" step="${options.step}" value="${options.value[1]}"><thumb data-min></thumb><thumb data-max></thumb><range></range>`
  element.classList.add('range-slider-input')
  if (options.disabled) { element[_setAttribute]('data-disabled', '') }

  const range = element[_getElementsByTagName]('range')[0]
  const input = element[_getElementsByTagName]('input')
  const thumb = element[_getElementsByTagName]('thumb')

  // Set initial values
  maxWidth = options.max - options.min
  syncThumbWidth()
  setValue('', true, false)

  // Add listeners to element
  element[_addEventListener]('pointerdown', e => { elementFocused(e) }, listenerOptions)

  // Add listeners to <thumb>s
  Array.from(thumb).forEach((t, i) => {
    t[_addEventListener]('pointerdown', e => { initiateThumbDrag(e, i, t) }, listenerOptions)
  })

  // Add listeners to <range>
  range[_addEventListener]('pointerdown', e => { initiateRangeDrag(e) }, listenerOptions)

  // Add global listeners
  _document[_addEventListener]('pointermove', e => { drag(e) }, listenerOptions)
  _document[_addEventListener]('pointerup', () => {
    thumb[0][_removeAttribute]('data-active')
    thumb[1][_removeAttribute]('data-active')
    range[_removeAttribute]('data-active')
    isDragging = false
  }, listenerOptions)
  window[_addEventListener]('resize', () => {
    syncThumbWidth()
    updateThumbs()
    updateRange()
  })

  return {
    min: (m = false) => {
      return updateLimits('min', m)
    },
    max: (m = false) => {
      return updateLimits('max', m)
    },
    step: (s = false) => {
      if (s) {
        input[0].step = s
        input[1].step = s
        syncThumbWidth()
        setValue('', true)
      } else { return input[0].step }
    },
    values: (v = false) => {
      if (v) {
        syncThumbWidth()
        setValue({ min: v[0], max: v[1] }, true)
      } else { return [value.min, value.max] }
    },
    disabled: (d = true) => {
      if (d) { element[_setAttribute]('data-disabled', '') } else { element[_removeAttribute]('data-disabled') }
      options.disabled = d
    },
    rangeSlideDisabled: (d = true) => {
      options.rangeSlideDisabled = d
    }
  }
}
