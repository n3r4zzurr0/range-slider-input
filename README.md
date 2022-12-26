[circleci-image]: https://circleci.com/gh/n3r4zzurr0/range-slider-input.svg?style=shield
[circleci-url]: https://circleci.com/gh/n3r4zzurr0/range-slider-input
[npm-image]: https://img.shields.io/npm/v/range-slider-input.svg
[npm-url]: https://npmjs.org/package/range-slider-input
[size-image]: https://img.shields.io/bundlephobia/minzip/range-slider-input@latest
[size-url]: https://bundlephobia.com/result?p=range-slider-input@latest
[vulnerabilities-image]: https://snyk.io/test/npm/range-slider-input/badge.svg
[vulnerabilities-url]: https://snyk.io/test/npm/range-slider-input
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
[license-image]: https://img.shields.io/github/license/n3r4zzurr0/range-slider-input.svg
[license-url]: https://github.com/n3r4zzurr0/range-slider-input/blob/main/LICENSE

# range-slider-input
[![circleci][circleci-image]][circleci-url] [![npm][npm-image]][npm-url] [![minzipped size][size-image]][size-url] [![known vulnerabilities][vulnerabilities-image]][vulnerabilities-url] [![javascript style guide][standard-image]][standard-url] [![license][license-image]][license-url]

A lightweight (~2kB) library to create range sliders that can capture a value or a range of values with one or two drag handles.

**[Examples](https://n3r4zzurr0.in/range-slider-input/) / [CodePen](https://codepen.io/n3r4zzurr0/pen/eYVJBMV)**

[![Demo](https://n3r4zzurr0.in/static/rsi-demo600.gif)](https://n3r4zzurr0.in/range-slider-input/)

:sparkles: **Features**
- High CSS customizability
- Touch and keyboard accessible
- Supports negative values
- Vertical orientation
- Small and fast
- Zero dependencies
- Supported by all major browsers
- Has a [React component wrapper](#component-wrappers)

<hr>

:warning: **It is recommended that you upgrade from v1.x to v2.x! [What's new and what's changed in v2.x?](https://github.com/n3r4zzurr0/range-slider-input/blob/main/CHANGELOG.md#v20x)**

<hr>
<br>


## Installation

**npm**

```
npm install range-slider-input
```

Import the `rangeSlider` constructor and the core CSS:

```js
import rangeSlider from 'range-slider-input';
import 'range-slider-input/dist/style.css';
```

**CDN**

```html
<script src="https://cdn.jsdelivr.net/npm/range-slider-input@2.4/dist/rangeslider.umd.min.js"></script>
```

or

```html
<script src="https://unpkg.com/range-slider-input@2"></script>
```

The core CSS comes bundled with the jsDelivr and unpkg imports.


## Usage
```js
import rangeSlider from 'range-slider-input';
import 'range-slider-input/dist/style.css';

const rangeSliderElement = rangeSlider(element);
```


## API

### `rangeSlider(element, options = {})`

Returns an object of functions that can be called to read or write the properties initially set by `options`.

### Parameters

#### `element`

[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

#### `options`

Object that specifies the characteristics of the range slider element with the following available properties:

<table>
<tr>
    <th>Property</th>
    <th>Type</th>
    <th>Default value</th>
    <th>Description</th>
</tr>
<tr>
    <td><code>min</code></td>
    <td>number</td>
    <td>0</td>
    <td>Number that specifies the lowest value in the range of permitted values.<br>Its value must be less than that of <code>max</code>.</td>
</tr>
<tr>
    <td><code>max</code></td>
    <td>number</td>
    <td>100</td>
    <td>Number that specifies the greatest value in the range of permitted values.<br>Its value must be greater than that of <code>min</code>.</td>
</tr>
<tr>
    <td><code>step</code></td>
    <td>number / string</td>
    <td>1</td>
    <td>Number that specifies the amount by which the slider value(s) will change upon user interaction.<br>Other than numbers, the value of <code>step</code> can be a string value of <code>any</code>.<br><br>From <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#step">MDN</a>,<blockquote> A string value of <code>any</code> means that no stepping is implied, and any value is allowed (barring other constraints, such as min and max).</blockquote></td>
</tr>
<tr>
    <td><code>value</code></td>
    <td>number[]</td>
    <td>[25, 75]</td>
    <td>Array of two numbers that specify the values of the lower and upper offsets of the range slider element respectively.</td>
</tr>
<tr>
    <td><code>onInput</code></td>
    <td>function</td>
    <td>NOOP</td>
    <td>Function to be called when there is a change in the value(s) of range sliders upon user interaction or upon calling <a href="#min-max-step-value-and-orientation"><code>min()</code></a>, <a href="#min-max-step-value-and-orientation"><code>max()</code></a>, <a href="#min-max-step-value-and-orientation"><code>step()</code></a>, <a href="#min-max-step-value-and-orientation"><code>value()</code></a> or <a href="#min-max-step-value-and-orientation"><code>orientation()</code></a>.<br><br><b>Usage:</b> <code>(value, userInteraction) => {}</code><br><br><code>value</code> holds the current lower and upper values in an array and <code>userInteraction</code> is a boolean value which is <code>true</code> if the value is changed upon user interaction.</td>
</tr>
<tr>
    <td><code>onThumbDragStart</code></td>
    <td>function</td>
    <td>NOOP</td>
    <td>Function to be called when the <code>pointerdown</code> event is triggered for any of the thumbs.</td>
</tr>
<tr>
    <td><code>onThumbDragEnd</code></td>
    <td>function</td>
    <td>NOOP</td>
    <td>Function to be called when the <code>pointerup</code> event is triggered for any of the thumbs.</td>
</tr>
<tr>
    <td><code>onRangeDragStart</code></td>
    <td>function</td>
    <td>NOOP</td>
    <td>Function to be called when the <code>pointerdown</code> event is triggered for the range.</td>
</tr>
<tr>
    <td><code>onRangeDragEnd</code></td>
    <td>function</td>
    <td>NOOP</td>
    <td>Function to be called when the <code>pointerup</code> event is triggered for the range.</td>
</tr>
<tr>
    <td><code>disabled</code></td>
    <td>boolean</td>
    <td>false</td>
    <td>Boolean that specifies if the range slider element is disabled or not.</td>
</tr>
<tr>
    <td><code>rangeSlideDisabled</code></td>
    <td>boolean</td>
    <td>false</td>
    <td>Boolean that specifies if the range is slidable or not.</td>
</tr>
<tr>
    <td><code>thumbsDisabled</code></td>
    <td>boolean[]</td>
    <td>[false, false]</td>
    <td>Array of two Booleans which specify if the lower and upper thumbs are disabled or not, respectively. If only one Boolean value is passed instead of an array, the value will apply to both thumbs.</td>
</tr>
<tr>
    <td><code>orientation</code></td>
    <td>string</td>
    <td>horizontal</td>
    <td>String that specifies the axis along which the user interaction is to be registered. By default, the range slider element registers the user interaction along the X-axis. It takes two different values: <code>horizontal</code> and <code>vertical</code>.</td>
</tr>
</table>

### Return value

Object of functions that can be called to read or write the properties initially set by the `options` parameter. Available functions:

#### `min()`, `max()`, `step()`, `value()` and `orientation()`

These are simple getter and setter functions. So, while calling these functions, if a parameter is supplied, the corresponding values will be set, and if a parameter is not supplied, the corresponding values will be returned.
E.g. Calling `step()` will return the `step` value, and calling `value([0, 0.5])` will set the lower and upper offsets to `0` and `0.5` respectively.

#### `disabled()`, `rangeSlideDisabled()`

The default parameter is set to `true`. So, if they are called without a parameter, they will set the corresponding values to `true`.
Thus, calling `disabled()` or `disabled(true)` will set `options.disabled = true` and calling `disabled(false)` will set `options.disabled = false`.

#### `thumbsDisabled()`

The default parameter is set to `[true, true]`. So, if it is called without a parameter, it will disable both thumbs. Example uses:

```js
//                          thumbs -> lower     upper
//                                    -----     -----
thumbsDisabled()                // disabled  disabled
thumbsDisabled(true)            // disabled  disabled
thumbsDisabled(false)           //  enabled   enabled
thumbsDisabled([])              //  enabled   enabled
thumbsDisabled([false])         //  enabled   enabled
thumbsDisabled([true])          // disabled   enabled
thumbsDisabled([true, false])   // disabled   enabled
thumbsDisabled([false, true])   //  enabled  disabled
thumbsDisabled([false, false])  //  enabled   enabled
thumbsDisabled([true, true])    // disabled  disabled
```

#### `currentValueIndex()`

Returns the index (`0` for the lower value and `1` for the upper value) of the value which is currently being modified.
Returns `-1` when the slider is idle.

#### `removeGlobalEventListeners()`

Removes the global event listeners. It should be called when removing the range slider element from the DOM dynamically.

## Elements

```html
<div class="range-slider"><!-- range slider element -->
    <input type="range" /><!-- hidden -->
    <input type="range" /><!-- hidden -->
    <div class="range-slider__thumb" data-lower></div>
    <div class="range-slider__thumb" data-upper></div>
    <div class="range-slider__range"></div>
</div>
```

`<div class="range-slider"></div>` is the wrapper element that was used to instantiate the range slider initially and is added with a CSS class named `range-slider`.

`<input type="range" />` elements are used to set values and are hidden.

`<div class="range-slider__thumb"></div>` elements are the slidable thumbs replacing the original thumbs from the `<input type="range" />` elements.

`<div class="range-slider__range"></div>` element fills up the space between the thumbs.


## Styling

**[View styled examples](https://n3r4zzurr0.in/range-slider-input/examples/#styled)**

```css
element-selector {
    /* CSS for the wrapper element */
}
element-selector[data-disabled] {
    /* CSS for disabled range slider element */
}
element-selector .range-slider__range {
    /* CSS for range */
}
element-selector .range-slider__range[data-active] {
    /* CSS for active (actively being dragged) range */
}
element-selector .range-slider__thumb {
    /* CSS for thumbs */
}
element-selector .range-slider__thumb[data-lower] {
    /* CSS for lower thumb */
}
element-selector .range-slider__thumb[data-upper] {
    /* CSS for upper thumb */
}
element-selector .range-slider__thumb[data-active] {
    /* CSS for active (actively being dragged) thumbs */
}
element-selector .range-slider__thumb[data-disabled] {
    /* CSS for disabled thumbs */
}
```

Refer to the `style.css` file to know more about styling the range slider element and its children.


## Component Wrappers

React: [react-range-slider-input](https://github.com/n3r4zzurr0/react-range-slider-input)


## License

MIT © [Utkarsh Verma](https://github.com/n3r4zzurr0)
