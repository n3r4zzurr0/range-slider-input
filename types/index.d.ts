type Orientation = 'vertical' | 'horizontal';
type Step = number | 'any';

export default function rangeSlider(element: Element, config?: RangeSliderConfig): RangeSlider;

export class RangeSlider {
    min(): number;
    min(min: number): void;

    max(): number;
    max(max: number): void;

    step(): Step;
    step(step: Step): void;

    value(): [number, number];
    value(value: [number, number]): void;

    orientation(): Orientation;
    orientation(orientation: Orientation): void;

    /** @param [disabled=true] */
    disabled(disabled?: boolean): void;

    /** @param [disabled=true] */
    rangeSlideDisabled(disabled?: boolean): void;

    /** @param [disabled=[true, true]] */
    thumbsDisabled(disabled?: [boolean, boolean]): void;

    currentValueIndex(): -1 | 0 | 1;

    removeGlobalEventListeners(): void;
}

export interface RangeSliderConfig {
    /** @default 0 */
    min?: number,
    /** @default 100 */
    max?: number,
    /** @default 1 */
    step?: Step,
    /** @default [25,75] */
    value?: [number, number],
    onInput?: (value: [number, number], userInteraction: boolean) => void,
    onThumbDragStart?: () => void,
    onThumbDragEnd?: () => void,
    onRangeDragStart?: () => void,
    onRangeDragEnd?: () => void,
    /** @default false */
    disabled?: boolean,
    /** @default false */
    rangeSlideDisabled?: boolean,
    /** @default [false, false] */
    thumbsDisabled?: [boolean, boolean],
    /** @default 'horizontal' */
    orientation?: Orientation,
}
