[travis-image]: https://img.shields.io/travis/n3r4zzurr0/range-slider-input/main.svg
[travis-url]: https://app.travis-ci.com/github/n3r4zzurr0/range-slider-input
[npm-image]: https://img.shields.io/npm/v/range-slider-input.svg
[npm-url]: https://npmjs.org/package/range-slider-input
[size-image]: https://img.shields.io/bundlephobia/minzip/range-slider-input@latest
[size-url]: https://bundlephobia.com/result?p=range-slider-input@latest
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

# range-slider-input [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![size][size-image]][size-url] [![javascript style guide][standard-image]][standard-url]

Customizable range slider input to capture a range of values with two drag handles.

## Install
```
npm install range-slider-input
```

## Usage
```js
import rangeSlider from 'range-slider-input';
import 'range-slider-input/style.css';

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

*   ####  `min`

    Default value: `0`

    Number that specifies the lowest value in the range of permitted values.
    Its value must be less than that of `max`.

*   ####  `max`

    Default value: `1`

    Number that specifies the greatest value in the range of permitted values.
    Its value must be greater than that of `min`.

*   ####  `step`

    Default value: `any`

    Number that specifies the amount by which the slider value(s) will change upon user interaction.
    Other than numbers, the value of `step` can be a string value of `any`, which is the default value in this package.
    
    From [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range#step),

    > A string value of `any` means that no stepping is implied, and any value is allowed (barring other constraints, such as min and max).

*   ####  `value`

    Default value: `[0.25, 0.75]`

    Array of two numbers that specify the values of the lower and upper offsets of the range slider element respectively.


*   ####  `onInput`

    Default value: `false`

    Function to be called when there is a change in the value(s) of range sliders upon user interaction or upon calling [`min()`](#min-max-step-value-and-orientation), [`max()`](#min-max-step-value-and-orientation), [`step()`](#min-max-step-value-and-orientation) or [`value()`](#min-max-step-value-and-orientation).
    

*   ####  `disabled`

    Default value: `false`

    Boolean that specifies if the range slider element is disabled or not.


*   ####  `rangeSlideDisabled`

    Default value: `false`

    Boolean that specifies if the range is slidable or not.

*   ####  `thumbsDisabled`

    Default value: `[false, false]`

    Array of two Booleans which specify if the lower and upper thumbs are disabled or not, respectively. If only one Boolean value is passed instead of an array, the value will apply to both thumbs.

*   ####  `orientation`

    Default value: `horizontal`

    String that specifies the axis along which the user interaction is to be registered.
    By default, the range slider element registers the user interaction along the X-axis.
    It takes two different values: `horizontal` and `vertical`.
    If the range slider element is styled to look vertical visually (e.g. `transform: rotate(90deg)`), setting `orientation` to `vertical` will make it register the user interaction along the Y-axis.

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
```

## Elements

```html
<div class="range-slider"><!-- range slider element -->
    <input type="range" /><!-- hidden -->
    <input type="range" /><!-- hidden -->
    <thumb data-lower></thumb>
    <thumb data-upper></thumb>
    <range></range>
</div>
```

`<div class="range-slider"></div>` is the wrapper element that was used to instantiate the range slider initially.

`<input type="range" />` elements are used to set values and are hidden.

`<thumb>` elements are the slidable thumbs replacing the original thumbs from the `<input type="range" />` elements.

`<range>` element fills up the space between the thumbs.


## Styling

```css
element-selector {
    /* CSS for the wrapper element */
}
element-selector[data-disabled] {
    /* CSS for disabled range slider element */
}
element-selector range {
    /* CSS for <range> */
}
element-selector range[data-focused] {
    /* CSS for focused <range> */
}
element-selector thumb[data-focused] {
    /* CSS for focused <thumb>s */
}
element-selector thumb[data-disabled] {
    /* CSS for disabled <thumb>s */
}
element-selector thumb[data-lower] {
    /* CSS for lower <thumb> */
}
element-selector thumb[data-upper] {
    /* CSS for upper <thumb> */
}
```

## License

MIT © [Utkarsh Verma](https://github.com/n3r4zzurr0)