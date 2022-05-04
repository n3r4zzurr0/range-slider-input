module.exports = (element, options = {}) => {
  // Actual value
  const value = { min: 0, max: 0 }
  // Thumb indexes for min and max values
  const index = { min: 0, max: 1 }
  // Thumb width for calculation of exact positions and sizes of <thumb>s and <range>
  const thumbWidth = { min: 0, max: 0 }
  // Slider value depending on the user interaction
  let sliderValue = { min: 0, max: 0 }
  // Slidable range limits (active when a <thumb> is disabled)
  const rangeLimits = { min: 0, max: 0 }

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

  // Options
  const _min = 'min'
  const _max = 'max'
  const _step = 'step'
  const _value = 'value'
  const _onInput = 'onInput'
  const _disabled = 'disabled'
  const _orientation = 'orientation'
  const _thumbsDisabled = 'thumbsDisabled'
  const _rangeSlideDisabled = 'rangeSlideDisabled'

  // Data Attributes
  const _dataLower = 'data-lower'
  const _dataUpper = 'data-upper'
  const _dataFocused = 'data-focused'
  const _dataDisabled = 'data-disabled'

  const _document = document
  const _parseFloat = parseFloat
  const _mathAbsolute = Math.abs
  const _setAttribute = 'setAttribute'
  const _removeAttribute = 'removeAttribute'
  const _addEventListener = 'addEventListener'
  const _getComputedStyle = window.getComputedStyle
  const _getElementsByTagName = 'getElementsByTagName'

  const _listenerOptions = { passive: false, capture: true }

  const fallbackToDefault = (property, defaultValue) => {
    options[property] = Object.prototype.hasOwnProperty.call(options, property) ? options[property] : defaultValue
  }

  const isNumber = n => {
    return +n + '' === n + ''
  }

  // Set min and max values to 1 if any of the min or max values are "invalid"
  // Setting both values 1 will disable the slider
  const safeMinMaxValues = () => {
    let error = false
    if (!isNumber(options[_min]) || !isNumber(options[_max])) { error = true }
    options[_min] = error ? 1 : +options[_min]
    options[_max] = error ? 1 : +options[_max]
  }

  // Reframe the thumbsDisabled value if "invalid"
  const safeThumbsDisabledValues = () => {
    if (options[_thumbsDisabled] instanceof Array) {
      if (options[_thumbsDisabled].length === 1) { options[_thumbsDisabled].push(false) }
      if (options[_thumbsDisabled].length !== 1 && options[_thumbsDisabled].length !== 2) { options[_thumbsDisabled] = [false, false] }
    } else { options[_thumbsDisabled] = [options[_thumbsDisabled], options[_thumbsDisabled]] }

    // Boolean Values
    options[_thumbsDisabled][0] = !!options[_thumbsDisabled][0]
    options[_thumbsDisabled][1] = !!options[_thumbsDisabled][1]
  }

  const setValue = (val, forceSet = false, callback = true) => {
    const currentValue = {
      min: input[index[_min]][_value],
      max: input[index[_max]][_value]
    }

    val = val || currentValue

    sliderValue = val
    input[index[_min]][_value] = val[_min]
    input[index[_max]][_value] = (thumbDrag || forceSet) ? val[_max] : (val[_min] + rangeWidth)
    value[_min] = +input[index[_min]][_value]
    value[_max] = +input[index[_max]][_value]

    if (forceSet) {
      // Check if the values are correctly set
      if (value[_min] > value[_max]) {
        switchIndex()
        value[_min] = +input[index[_min]][_value]
        value[_max] = +input[index[_max]][_value]
      }
      sliderValue = value
    }

    let valueSet = false

    if (currentValue[_min] !== input[index[_min]][_value] || forceSet) { valueSet = true }

    if (currentValue[_max] !== input[index[_max]][_value] || forceSet) { valueSet = true }

    // Update the <thumb>s and <range> positions and widths everytime a value is set
    if (valueSet) {
      if (callback && options[_onInput]) { options[_onInput]([value[_min], value[_max]]) }
      updateThumbs()
      updateRange()
    }
  }

  // Switch <thumb> indexes whenever lower and upper <thumb>s switch positions
  const switchIndex = () => {
    index[_min] = +!index[_min]
    index[_max] = +!index[_max]
    thumb[index[_min]][_removeAttribute](_dataUpper)
    thumb[index[_max]][_removeAttribute](_dataLower)
    thumb[index[_min]][_setAttribute](_dataLower, '')
    thumb[index[_max]][_setAttribute](_dataUpper, '')
    if (thumbDrag) { thumbDrag = thumbDrag === _min ? _max : _min }
  }

  const updateInputState = () => {
    let indexSwitched = false

    if (thumbIndex === index[_min]) {
      if (input[thumbIndex][_value] > value[_max]) {
        switchIndex()
        indexSwitched = true
      }
    }

    if (thumbIndex === index[_max]) {
      if (input[thumbIndex][_value] < value[_min]) {
        switchIndex()
        indexSwitched = true
      }
    }

    if (indexSwitched) { setValue('', true) }
  }

  const updateThumbs = () => {
    thumb[index[_min]].style.left = `calc(${((value[_min] - options[_min]) / maxWidth) * 100}% + ${(0.5 - ((value[_min] - options[_min]) / maxWidth)) * thumbWidth[_min]}px)`
    thumb[index[_max]].style.left = `calc(${((value[_max] - options[_min]) / maxWidth) * 100}% + ${(0.5 - ((value[_max] - options[_min]) / maxWidth)) * thumbWidth[_max]}px)`
  }

  const updateRange = () => {
    const deltaLeft = ((0.5 - ((value[_min] - options[_min]) / maxWidth)) * thumbWidth[_min]) / element.clientWidth
    const deltaWidth = ((0.5 - ((value[_max] - options[_min]) / maxWidth)) * thumbWidth[_max]) / element.clientWidth
    range.style.left = `${(((value[_min] - options[_min]) / maxWidth) + deltaLeft) * 100}%`
    range.style.width = `${(((value[_max] - options[_min]) / maxWidth) - ((value[_min] - options[_min]) / maxWidth) - deltaLeft + deltaWidth) * 100}%`
  }

  const updateRangeLimits = () => {
    rangeLimits[_min] = options[_thumbsDisabled][0] ? value[_min] : options[_min]
    rangeLimits[_max] = options[_thumbsDisabled][1] ? value[_max] : options[_max]
  }

  // <thumb> width value is to be synced with CSS for correct calculation of <range> width and position
  const syncThumbWidth = () => {
    thumbWidth[_min] = _parseFloat(_getComputedStyle(thumb[index[_min]]).width)
    thumbWidth[_max] = _parseFloat(_getComputedStyle(thumb[index[_max]]).width)
  }

  const currentPosition = (e, node) => {
    return ((node.offsetLeft + (e[`client${options[_orientation] === 'vertical' ? 'Y' : 'X'}`] - node.getBoundingClientRect()[options[_orientation] === 'vertical' ? 'top' : 'left']) - (thumbDrag ? ((0.5 - (value[thumbDrag] - options[_min]) / maxWidth) * thumbWidth[thumbDrag]) : 0)) / element.clientWidth) * maxWidth + options[_min]
  }

  const eventElementTagName = e => {
    return e.target.tagName.toLowerCase()
  }

  const elementFocused = e => {
    let setFocus = false

    if (!options[_disabled] && ((eventElementTagName(e) !== 'thumb' && eventElementTagName(e) !== 'range') || (options[_rangeSlideDisabled] && eventElementTagName(e) !== 'thumb'))) { setFocus = true }

    if (setFocus) {
      if (options[_thumbsDisabled][0] && options[_thumbsDisabled][1]) { setFocus = false }
    }

    if (setFocus) {
      let currPos = currentPosition(e, range)
      if (currPos < 0) { currPos = 0 }
      const deltaMin = _mathAbsolute(value[_min] - currPos)
      const deltaMax = _mathAbsolute(value[_max] - currPos)

      if (options[_thumbsDisabled][0]) {
        if (currPos >= value[_min]) {
          setValue({ min: value[_min], max: currPos }, true)
          initiateThumbDrag(e, index[_max], thumb[index[_max]])
        }
      } else if (options[_thumbsDisabled][1]) {
        if (currPos <= value[_max]) {
          setValue({ min: currPos, max: value[_max] }, true)
          initiateThumbDrag(e, index[_min], thumb[index[_min]])
        }
      } else {
        let nearestThumbIndex = 1
        if (deltaMin === deltaMax) { setValue({ min: value[_min], max: currPos }, true) } else {
          setValue({ min: deltaMin < deltaMax ? currPos : value[_min], max: deltaMax < deltaMin ? currPos : value[_max] }, true)
          nearestThumbIndex = deltaMin < deltaMax ? index[_min] : index[_max]
        }
        initiateThumbDrag(e, nearestThumbIndex, thumb[nearestThumbIndex])
      }
    }
  }

  const initiateThumbDrag = (e, i, node) => {
    if (!options[_disabled] && !options[_thumbsDisabled][i === 1 ? index[_max] : index[_min]]) {
      syncThumbWidth()
      startPos = currentPosition(e, node)
      thumbDrag = index[_min] === i ? _min : _max
      thumbIndex = i
      isDragging = true
      thumb[i][_setAttribute](_dataFocused, '')
    }
  }

  const initiateRangeDrag = e => {
    if (!options[_disabled] && !options[_rangeSlideDisabled]) {
      syncThumbWidth()
      rangeWidth = value[_max] - value[_min]
      startPos = currentPosition(e, range)
      thumbDrag = false
      isDragging = true
      range[_setAttribute](_dataFocused, '')
    }
  }

  const valuesUpdated = lastPos => {
    startPos = lastPos
    updateInputState()
  }

  const drag = e => {
    if (isDragging) {
      const lastPos = currentPosition(e, range)
      const delta = lastPos - startPos

      let min = value[_min]
      let max = value[_max]
      const lower = thumbDrag ? rangeLimits[_min] : options[_min]
      const upper = thumbDrag ? rangeLimits[_max] : options[_max]

      if (!thumbDrag || thumbDrag === _min) { min = thumbDrag ? lastPos : (sliderValue[_min] + delta) }
      if (!thumbDrag || thumbDrag === _max) { max = thumbDrag ? lastPos : (sliderValue[_max] + delta) }

      if (min >= lower && min <= upper && max >= lower && max <= upper) {
        setValue({ min, max })
        valuesUpdated(lastPos)
        maxSet = false
        minSet = false
      } else {
        // When min thumb reaches upper limit
        if (min > upper && thumbDrag && !minSet) {
          setValue({ min: upper, max: upper })
          valuesUpdated(lastPos)
          minSet = true
        }
        // When max thumb reaches lower limit
        if (max < lower && thumbDrag && !maxSet) {
          setValue({ min: lower, max: lower })
          valuesUpdated(lastPos)
          maxSet = true
        }
        // When range / min thumb reaches lower limit
        if (min < lower && !minSet) {
          if (!thumbDrag) { setValue({ min: lower, max: value[_max] - value[_min] + lower }) } else { setValue({ min: lower, max: value[_max] }) }
          valuesUpdated(lastPos)
          minSet = true
        }
        // When range / max thumb reaches upper limit
        if (max > upper && !maxSet) {
          if (!thumbDrag) { setValue({ min: value[_min] - value[_max] + upper, max: upper }) } else { setValue({ min: value[_min], max: upper }) }
          valuesUpdated(lastPos)
          maxSet = true
        }
      }
      if (!thumbDrag) { updateRangeLimits() }
    }
  }

  const updateLimits = (limit, m = false) => {
    if (m || m === 0) {
      options[limit] = m
      safeMinMaxValues()
      input[0][_setAttribute](_min, options[_min])
      input[0][_setAttribute](_max, options[_max])
      input[1][_setAttribute](_min, options[_min])
      input[1][_setAttribute](_max, options[_max])
      maxWidth = options[_max] - options[_min]
      syncThumbWidth()
      setValue('', true)
      updateRangeLimits()
    } else { return options[limit] }
  }

  // Set options to default values if not set
  fallbackToDefault(_rangeSlideDisabled, false)
  fallbackToDefault(_thumbsDisabled, [false, false])
  fallbackToDefault(_orientation, 'horizontal')
  fallbackToDefault(_disabled, false)
  fallbackToDefault(_onInput, false)
  fallbackToDefault(_value, [0.25, 0.75])
  fallbackToDefault(_step, 'any')
  fallbackToDefault(_min, 0)
  fallbackToDefault(_max, 1)

  safeMinMaxValues()
  safeThumbsDisabledValues()

  // Fill wrapper element
  element.innerHTML = `<input type="range" min="${options[_min]}" max="${options[_max]}" step="${options[_step]}" value="${options[_value][0]}"><input type="range" min="${options[_min]}" max="${options[_max]}" step="${options[_step]}" value="${options[_value][1]}"><thumb ${_dataLower}></thumb><thumb ${_dataUpper}></thumb><range></range>`
  element.classList.add('range-slider')
  if (options[_disabled]) { element[_setAttribute](_dataDisabled, '') }

  const range = element[_getElementsByTagName]('range')[0]
  const input = element[_getElementsByTagName]('input')
  const thumb = element[_getElementsByTagName]('thumb')

  // Set initial values
  maxWidth = options[_max] - options[_min]
  syncThumbWidth()
  setValue('', true, false)
  updateRangeLimits()

  // Add listeners to element
  element[_addEventListener]('pointerdown', e => { elementFocused(e) }, _listenerOptions)

  // Add listeners to <thumb>s and set [data-disabled] on disabled <thumb>s
  Array.from(thumb).forEach((t, i) => {
    t[_addEventListener]('pointerdown', e => { initiateThumbDrag(e, i, t) }, _listenerOptions)
    if (options[_thumbsDisabled][i === 1 ? index[_max] : index[_min]]) { t[_setAttribute](_dataDisabled, '') }
  })

  // Add listeners to <range>
  range[_addEventListener]('pointerdown', e => { initiateRangeDrag(e) }, _listenerOptions)

  // Add global listeners
  _document[_addEventListener]('pointermove', e => { drag(e) }, _listenerOptions)
  _document[_addEventListener]('pointerup', () => {
    if (isDragging) {
      thumb[0][_removeAttribute](_dataFocused)
      thumb[1][_removeAttribute](_dataFocused)
      range[_removeAttribute](_dataFocused)
      isDragging = false
    }
  }, _listenerOptions)
  window[_addEventListener]('resize', () => {
    syncThumbWidth()
    updateThumbs()
    updateRange()
  })

  return {
    min: (m = false) => {
      return updateLimits(_min, m)
    },
    max: (m = false) => {
      return updateLimits(_max, m)
    },
    step: (s = false) => {
      if (s) {
        input[0][_step] = s
        input[1][_step] = s
        syncThumbWidth()
        setValue('', true)
      } else { return input[0][_step] }
    },
    value: (v = false) => {
      if (v) {
        syncThumbWidth()
        setValue({ min: v[0], max: v[1] }, true)
      } else { return [value[_min], value[_max]] }
    },
    disabled: (d = true) => {
      options[_disabled] = !!d
      if (options[_disabled]) { element[_setAttribute](_dataDisabled, '') } else { element[_removeAttribute](_dataDisabled) }
    },
    orientation: (o = false) => {
      if (o) { options[_orientation] = o } else { return options[_orientation] }
    },
    thumbsDisabled: (t = [true, true]) => {
      options[_thumbsDisabled] = t
      safeThumbsDisabledValues()
      updateRangeLimits()
      options[_thumbsDisabled].forEach((d, i) => {
        if (d) { thumb[i === 1 ? index.max : index.min][_setAttribute](_dataDisabled, '') } else { thumb[i === 1 ? index.max : index.min][_removeAttribute](_dataDisabled) }
      })
    },
    rangeSlideDisabled: (d = true) => {
      options[_rangeSlideDisabled] = !!d
    }
  }
}
