module.exports = (element, options = {}) => {
  const isNumber = n => {
    // check for NaN explicitly
    // because with NaN, the second exp. evaluates to true
    return !isNaN(n) && +n + '' === n + ''
  }

  const setMinMaxProps = (min = 0, max = 0) => {
    return { min, max }
  }

  const iterateMinMaxProps = fn => {
    [MIN, MAX].forEach(fn)
  }

  const getSetProps = (condition, expression, fn) => {
    if (condition) { return expression } else { fn() }
  }

  const setNodeAttribute = (node, attribute, value = '') => {
    node.setAttribute(attribute, value)
  }

  const removeNodeAttribute = (node, attribute) => {
    node.removeAttribute(attribute)
  }

  const addNodeEventListener = (node, event, fn, isPointerEvent = true) => {
    // with options for pointer events
    node.addEventListener(event, fn, isPointerEvent ? { passive: false, capture: true } : {})
  }

  const fallbackToDefault = (property, defaultValue) => {
    options[property] = {}.hasOwnProperty.call(options, property) ? options[property] : defaultValue
  }

  const ifVerticalElse = (vertical, horizontal) => {
    return options.orientation === VERTICAL ? vertical : horizontal
  }

  const currentIndex = i => {
    return i === 1 ? index.max : index.min
  }

  // Set min and max values to 1 (arbitrarily) if any of the min or max values are "invalid"
  // Setting both values 1 will disable the slider
  // Called when,
  // -> the element is initially set
  // -> min or max properties are modified
  const safeMinMaxValues = () => {
    let error = false
    if (!isNumber(options.min) || !isNumber(options.max)) { error = true }
    options.min = error ? 1 : +options.min
    options.max = error ? 1 : +options.max
  }

  // Reframe the thumbsDisabled value if "invalid"
  // Called when,
  // -> the element is initially set
  // -> thumbsDisabled property is modified
  const safeThumbsDisabledValues = () => {
    if (options.thumbsDisabled instanceof Array) {
      if (options.thumbsDisabled.length === 1) { options.thumbsDisabled.push(false) }
      if (options.thumbsDisabled.length !== 1 && options.thumbsDisabled.length !== 2) { options.thumbsDisabled = [false, false] }
    } else { options.thumbsDisabled = [options.thumbsDisabled, options.thumbsDisabled] }

    // Boolean Values
    options.thumbsDisabled[0] = !!options.thumbsDisabled[0]
    options.thumbsDisabled[1] = !!options.thumbsDisabled[1]
  }

  // Called when,
  // -> the element is initially set
  // -> min, max, step or value properties are modified
  // -> thumbs are dragged
  // -> element is clicked upon
  // -> an arrow key is pressed
  const setValue = (newValue, forceSet = false, callback = true) => {
    // Current value as set in the input elements
    // which could change while changing min, max and step values
    const currentValue = setMinMaxProps(input[index.min].value, input[index.max].value)

    // var value is synced with the values set in the input elements if no newValue is passed
    newValue = newValue || currentValue

    input[index.min].value = newValue.min
    input[index.max].value = (thumbDrag || forceSet) ? newValue.max : (newValue.min + rangeWidth)
    syncValues()

    // Check if the thumbs cross each other
    if (value.min > value.max) {
      // Switch thumb indexes
      index.min = +!index.min
      index.max = +!index.max

      // Switch thumb attributes
      removeNodeAttribute(thumb[index.min], DATA_UPPER)
      removeNodeAttribute(thumb[index.max], DATA_LOWER)
      setNodeAttribute(thumb[index.min], DATA_LOWER)
      setNodeAttribute(thumb[index.max], DATA_UPPER)

      // Switch thumb drag labels
      if (thumbDrag) { thumbDrag = thumbDrag === MIN ? MAX : MIN }

      syncValues()
    }

    sliderValue = forceSet ? value : newValue

    let valueSet = false

    if (currentValue.min !== input[index.min].value || forceSet) { valueSet = true }

    if (currentValue.max !== input[index.max].value || forceSet) { valueSet = true }

    // Update the positions, dimensions and aria attributes everytime a value is set
    // and call the onInput function from options (if set)
    if (valueSet) {
      if (callback && options.onInput) { options.onInput([value.min, value.max]) }
      syncThumbDimensions()
      updateThumbs()
      updateRange()
      updateAriaValueAttributes()
    }
  }

  // Sync var value with the input elements
  const syncValues = () => {
    iterateMinMaxProps(_ => {
      value[_] = +input[index[_]].value
    })
  }

  // Called when,
  // -> setValue is called and a value is set
  // -> window is resized
  const updateThumbs = () => {
    iterateMinMaxProps(_ => {
      thumb[index[_]].style[ifVerticalElse('top', 'left')] = `calc(${((value[_] - options.min) / maxRangeWidth) * 100}% + ${(0.5 - ((value[_] - options.min) / maxRangeWidth)) * ifVerticalElse(thumbHeight, thumbWidth)[_]}px)`
    })
  }

  // Called when,
  // -> setValue is called and a value is set
  // -> window is resized
  const updateRange = () => {
    const deltaOffset = ((0.5 - ((value.min - options.min) / maxRangeWidth)) * ifVerticalElse(thumbHeight, thumbWidth).min) / element[`client${ifVerticalElse('Height', 'Width')}`]
    const deltaDimension = ((0.5 - ((value.max - options.min) / maxRangeWidth)) * ifVerticalElse(thumbHeight, thumbWidth).max) / element[`client${ifVerticalElse('Height', 'Width')}`]
    range.style[ifVerticalElse('top', 'left')] = `${(((value.min - options.min) / maxRangeWidth) + deltaOffset) * 100}%`
    range.style[ifVerticalElse('height', 'width')] = `${(((value.max - options.min) / maxRangeWidth) - ((value.min - options.min) / maxRangeWidth) - deltaOffset + deltaDimension) * 100}%`
  }

  // Called when,
  // -> the element is initially set
  // -> min, max or value properties are modified
  // -> range is dragged
  // -> thumbs are disabled / enabled
  const updateRangeLimits = () => {
    iterateMinMaxProps((_, i) => {
      rangeLimits[_] = options.thumbsDisabled[i] ? value[_] : options[_]
    })
  }

  // Called when,
  // -> thumbs are initially set
  // -> thumbs are disabled / enabled
  const updateTabIndexes = () => {
    iterateMinMaxProps((_, i) => {
      if (!options.disabled && !options.thumbsDisabled[i]) { setNodeAttribute(thumb[currentIndex(i)], TABINDEX, 0) } else { removeNodeAttribute(thumb[currentIndex(i)], TABINDEX) }
    })
  }

  // Called when,
  // -> setValue is called and a value is set
  const updateAriaValueAttributes = () => {
    iterateMinMaxProps(_ => {
      setNodeAttribute(thumb[index[_]], 'aria-valuemin', options.min)
      setNodeAttribute(thumb[index[_]], 'aria-valuemax', options.max)
      setNodeAttribute(thumb[index[_]], 'aria-valuenow', value[_])
      setNodeAttribute(thumb[index[_]], 'aria-valuetext', value[_])
    })
  }

  // Called when,
  // -> disabled property is modified
  const updateDisabledState = () => {
    if (options.disabled) { setNodeAttribute(element, DATA_DISABLED) } else { removeNodeAttribute(element, DATA_DISABLED) }
  }

  // Called when,
  // -> thumbsDisabled property is modified
  const updateThumbsDisabledState = () => {
    options.thumbsDisabled.forEach((d, i) => {
      const currIndex = currentIndex(i)
      if (d) {
        setNodeAttribute(thumb[currIndex], DATA_DISABLED)
        setNodeAttribute(thumb[currIndex], 'aria-disabled', true)
      } else {
        removeNodeAttribute(thumb[currIndex], DATA_DISABLED)
        setNodeAttribute(thumb[currIndex], 'aria-disabled', false)
      }
    })
  }

  // Called when,
  // -> min or max values are modified
  const updateLimits = (limit, m = false) => {
    options[limit] = m
    safeMinMaxValues()
    iterateMinMaxProps(_ => {
      input[0][_] = options[_]
      input[1][_] = options[_]
    })
    maxRangeWidth = options.max - options.min
    setValue('', true)
    updateRangeLimits()
  }

  // Called when,
  // -> the element is initially set
  // -> orientation property is modified
  const updateOrientation = () => {
    if (options.orientation === VERTICAL) { setNodeAttribute(element, DATA_VERTICAL) } else { removeNodeAttribute(element, DATA_VERTICAL) }
    range.style[ifVerticalElse('left', 'top')] = ''
    range.style[ifVerticalElse('width', 'height')] = ''
    thumb[0].style[ifVerticalElse('left', 'top')] = ''
    thumb[1].style[ifVerticalElse('left', 'top')] = ''
  }

  // thumb width & height values are to be synced with the CSS values for correct calculation of
  // thumb position and range width & position
  // Called when,
  // -> setValue is called and a value is set (called before updateThumbs() and updateRange())
  // -> thumb / range drag is initiated
  // -> window is resized
  const syncThumbDimensions = () => {
    iterateMinMaxProps(_ => {
      thumbWidth[_] = float(style(thumb[index[_]]).width)
      thumbHeight[_] = float(style(thumb[index[_]]).height)
    })
  }

  // thumb position calculation depending upon the pointer position
  const currentPosition = (e, node) => {
    const currPos = ((node[`offset${ifVerticalElse('Top', 'Left')}`] + (e[`client${ifVerticalElse('Y', 'X')}`] - node.getBoundingClientRect()[ifVerticalElse('top', 'left')]) - (thumbDrag ? ((0.5 - (value[thumbDrag] - options.min) / maxRangeWidth) * ifVerticalElse(thumbHeight, thumbWidth)[thumbDrag]) : 0)) / element[`client${ifVerticalElse('Height', 'Width')}`]) * maxRangeWidth + options.min
    if (currPos < options.min) { return options.min }
    if (currPos > options.max) { return options.max }
    return currPos
  }

  const doesntHaveClassName = (e, className) => {
    return !e.target.classList.contains(className)
  }

  const elementFocused = e => {
    let setFocus = false

    if (!options.disabled && ((doesntHaveClassName(e, 'range-slider__thumb') && doesntHaveClassName(e, 'range-slider__range')) || (options.rangeSlideDisabled && doesntHaveClassName(e, 'range-slider__thumb')))) { setFocus = true }

    // No action if both thumbs are disabled
    if (setFocus && options.thumbsDisabled[0] && options.thumbsDisabled[1]) { setFocus = false }

    if (setFocus) {
      const currPos = currentPosition(e, range)
      const deltaMin = abs(value.min - currPos)
      const deltaMax = abs(value.max - currPos)

      if (options.thumbsDisabled[0]) {
        if (currPos >= value.min) {
          setValue(setMinMaxProps(value.min, currPos), true)
          initiateThumbDrag(e, index.max, thumb[index.max])
        }
      } else if (options.thumbsDisabled[1]) {
        if (currPos <= value.max) {
          setValue(setMinMaxProps(currPos, value.max), true)
          initiateThumbDrag(e, index.min, thumb[index.min])
        }
      } else {
        let nearestThumbIndex = index.max
        if (deltaMin === deltaMax) { setValue(setMinMaxProps(value.min, currPos), true) } else {
          setValue(setMinMaxProps(deltaMin < deltaMax ? currPos : value.min, deltaMax < deltaMin ? currPos : value.max), true)
          nearestThumbIndex = deltaMin < deltaMax ? index.min : index.max
        }
        initiateThumbDrag(e, nearestThumbIndex, thumb[nearestThumbIndex])
      }
    }
  }

  const initiateDrag = (e, node) => {
    syncThumbDimensions()
    setNodeAttribute(node, DATA_ACTIVE)
    startPos = currentPosition(e, node)
    isDragging = true
  }

  const initiateThumbDrag = (e, i, node) => {
    if (!options.disabled && !options.thumbsDisabled[currentIndex(i)]) {
      initiateDrag(e, node)
      thumbDrag = index.min === i ? MIN : MAX
      if (options.onThumbDragStart) { options.onThumbDragStart() }
    }
  }

  const initiateRangeDrag = e => {
    if (!options.disabled && !options.rangeSlideDisabled) {
      initiateDrag(e, range)
      rangeWidth = value.max - value.min
      thumbDrag = false
      if (options.onRangeDragStart) { options.onRangeDragStart() }
    }
  }

  const drag = e => {
    if (isDragging) {
      const lastPos = currentPosition(e, range)
      const delta = lastPos - startPos

      let min = value.min
      let max = value.max
      const lower = thumbDrag ? rangeLimits.min : options.min
      const upper = thumbDrag ? rangeLimits.max : options.max

      if (!thumbDrag || thumbDrag === MIN) { min = thumbDrag ? lastPos : (sliderValue.min + delta) }
      if (!thumbDrag || thumbDrag === MAX) { max = thumbDrag ? lastPos : (sliderValue.max + delta) }

      if (min >= lower && min <= upper && max >= lower && max <= upper) {
        setValue({ min, max })
        startPos = lastPos
      } else {
        // When min thumb reaches upper limit
        if (min > upper && thumbDrag) {
          setValue(setMinMaxProps(upper, upper))
          startPos = lastPos
        }
        // When max thumb reaches lower limit
        if (max < lower && thumbDrag) {
          setValue(setMinMaxProps(lower, lower))
          startPos = lastPos
        }
        // When range / min thumb reaches lower limit
        if (min < lower) {
          if (!thumbDrag) { setValue(setMinMaxProps(lower, value.max - value.min + lower)) } else { setValue(setMinMaxProps(lower, value.max)) }
          startPos = lastPos
        }
        // When range / max thumb reaches upper limit
        if (max > upper) {
          if (!thumbDrag) { setValue(setMinMaxProps(value.min - value.max + upper, upper)) } else { setValue(setMinMaxProps(value.min, upper)) }
          startPos = lastPos
        }
      }
      if (!thumbDrag) { updateRangeLimits() }
    }
  }

  const actualStepValue = () => {
    const step = float(input[0].step)
    return input[0].step === ANY ? ANY : ((step === 0 || isNaN(step)) ? 1 : step)
  }

  // Step value (up or down) using arrow keys
  const stepValue = (i, key) => {
    const direction = (key === 37 || key === 40 ? -1 : 1) * ifVerticalElse(-1, 1)

    if (!options.disabled && !options.thumbsDisabled[currentIndex(i)]) {
      let step = actualStepValue()
      step = step === ANY ? 1 : step

      let min = value.min + step * (index.min === i ? direction : 0)
      let max = value.max + step * (index.max === i ? direction : 0)

      // When min thumb reaches upper limit
      if (min > rangeLimits.max) { min = rangeLimits.max }

      // When max thumb reaches lower limit
      if (max < rangeLimits.min) { max = rangeLimits.min }

      setValue({ min, max }, true)
    }
  }

  // Aliases
  const abs = Math.abs
  const float = parseFloat
  const style = window.getComputedStyle

  // Values
  const MIN = 'min'
  const MAX = 'max'
  const ANY = 'any'
  const VERTICAL = 'vertical'
  const TABINDEX = 'tabindex'

  // Data Attributes
  const DATA_LOWER = 'data-lower'
  const DATA_UPPER = 'data-upper'
  const DATA_ACTIVE = 'data-active'
  const DATA_VERTICAL = 'data-vertical'
  const DATA_DISABLED = 'data-disabled'

  // Actual value
  const value = setMinMaxProps()

  // Thumb indexes for min and max values
  // (swapped when the thumbs cross each other)
  const index = setMinMaxProps(0, 1)

  // Thumb width & height for calculation of exact positions and sizes of horizontal thumbs and range
  const thumbWidth = setMinMaxProps()
  const thumbHeight = setMinMaxProps()

  // Slidable range limits (when a thumb is dragged)
  const rangeLimits = setMinMaxProps()

  // Slider value depending on the user interaction
  let sliderValue = setMinMaxProps()

  // For dragging thumbs and range
  let maxRangeWidth = 0
  let rangeWidth = 0
  let isDragging = false
  let thumbDrag = false
  let startPos = 0

  // Set options to default values if not set
  fallbackToDefault('rangeSlideDisabled', false)
  fallbackToDefault('thumbsDisabled', [false, false])
  fallbackToDefault('orientation', 'horizontal')
  fallbackToDefault('disabled', false)
  fallbackToDefault('onThumbDragStart', false)
  fallbackToDefault('onRangeDragStart', false)
  fallbackToDefault('onThumbDragEnd', false)
  fallbackToDefault('onRangeDragEnd', false)
  fallbackToDefault('onInput', false)
  fallbackToDefault('value', [25, 75])
  fallbackToDefault('step', 1)
  fallbackToDefault('min', 0)
  fallbackToDefault('max', 100)

  safeMinMaxValues()
  safeThumbsDisabledValues()

  // Fill wrapper element
  element.innerHTML = `<input type="range" min="${options.min}" max="${options.max}" step="${options.step}" value="${options.value[0]}" disabled><input type="range" min="${options.min}" max="${options.max}" step="${options.step}" value="${options.value[1]}" disabled><div role="slider" class="range-slider__thumb" ${DATA_LOWER}></div><div role="slider" class="range-slider__thumb" ${DATA_UPPER}></div><div class="range-slider__range"></div>`
  element.classList.add('range-slider')

  const range = element.querySelector('.range-slider__range')
  const input = element.querySelectorAll('input')
  const thumb = element.querySelectorAll('.range-slider__thumb')

  // Set initial values
  maxRangeWidth = options.max - options.min
  setValue('', true, false)
  updateRangeLimits()
  updateDisabledState()
  updateThumbsDisabledState()
  updateTabIndexes()
  updateOrientation()

  // Add listeners to element
  addNodeEventListener(element, 'pointerdown', e => { elementFocused(e) })

  // Add listeners to thumbs and set [data-disabled] on disabled thumbs
  Array.from(thumb).forEach((t, i) => {
    addNodeEventListener(t, 'pointerdown', e => { initiateThumbDrag(e, i, t) })
    addNodeEventListener(t, 'keydown', e => {
      if (e.which >= 37 && e.which <= 40) {
        e.preventDefault()
        stepValue(i, e.which)
      }
    })
  })

  // Add listeners to range
  addNodeEventListener(range, 'pointerdown', e => { initiateRangeDrag(e) })

  // Add global listeners
  addNodeEventListener(document, 'pointermove', e => { drag(e) })
  addNodeEventListener(document, 'pointerup', () => {
    if (isDragging) {
      removeNodeAttribute(thumb[0], DATA_ACTIVE)
      removeNodeAttribute(thumb[1], DATA_ACTIVE)
      removeNodeAttribute(range, DATA_ACTIVE)
      isDragging = false
      if (thumbDrag) {
        if (options.onThumbDragEnd) { options.onThumbDragEnd() }
      } else {
        if (options.onRangeDragEnd) { options.onRangeDragEnd() }
      }
    }
  })
  addNodeEventListener(window, 'resize', () => {
    syncThumbDimensions()
    updateThumbs()
    updateRange()
  })

  return {
    min: (m = false) => {
      return getSetProps(!m && m !== 0, options.min, () => {
        updateLimits(MIN, m)
      })
    },
    max: (m = false) => {
      return getSetProps(!m && m !== 0, options.max, () => {
        updateLimits(MAX, m)
      })
    },
    step: (s = false) => {
      return getSetProps(!s, actualStepValue(), () => {
        input[0].step = s
        input[1].step = s
        setValue('', true)
      })
    },
    value: (v = false) => {
      return getSetProps(!v, [value.min, value.max], () => {
        setValue(setMinMaxProps(v[0], v[1]), true)
        updateRangeLimits()
      })
    },
    orientation: (o = false) => {
      return getSetProps(!o, options.orientation, () => {
        options.orientation = o
        updateOrientation()
        setValue('', true)
      })
    },
    disabled: (d = true) => {
      options.disabled = !!d
      updateDisabledState()
    },
    thumbsDisabled: (t = [true, true]) => {
      options.thumbsDisabled = t
      safeThumbsDisabledValues()
      updateRangeLimits()
      updateTabIndexes()
      updateThumbsDisabledState()
    },
    rangeSlideDisabled: (d = true) => {
      options.rangeSlideDisabled = !!d
    },
    currentValueIndex: () => {
      return thumbDrag ? (thumbDrag === MIN ? 0 : 1) : -1
    }
  }
}
