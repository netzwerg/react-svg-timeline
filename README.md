# react-svg-timeline [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-svg-timeline.svg?style=flat)](https://www.npmjs.com/package/react-svg-timeline)

A React event timeline component based on SVG.

- Event Points & Periods
- Event Tooltips
- Event Lanes
- Semantic Zoom (10 Years, 1 Year, 1 Week, 1 Day, etc)
- Custom "rubber band" Zoom
- Panning

## Demo

Out of the box – **plain & simple**:

![](screenshot-timeline-component.png)

Explore our [interactive demo](https://netzwerg.github.io/react-svg-timeline-demo/) for more details on **customizations**.
The demo code can be found in the [react-svg-timeline-demo](https://github.com/netzwerg/react-svg-timeline-demo) repository.

Alternatively, you are free to use just the zooming & panning **interaction logic**, e.g. as a layer of the awesome [Nivo](https://nivo.rocks) line chart:

![](screenshot-nivo-layer.png)

## Installation

`yarn add react-svg-timeline`

or

`npm install react-svg-timeline`

Note that `react` and `react-dom` (version >=16.3) must already be installed.

## Usage

This is the simplest possible way to get started:

```tsx
import * as React from 'react'
import { Timeline } from 'react-svg-timeline'

export const App = () => {
  const laneId = 'demo-lane'
  const lanes = [
    {
      laneId,
      label: 'Demo Lane',
    },
  ]
  const events = [
    {
      eventId: 'event-1',
      tooltip: 'Event 1',
      laneId,
      startTimeMillis: 1167606000000,
      endTimeMillis: 1230698892000,
    },
    {
      eventId: 'event-2',
      tooltip: 'Event 2',
      laneId: laneId,
      startTimeMillis: 1399845600000,
    },
  ]
  const dateFormat = (ms: number) => new Date(ms).toLocaleString()
  return <Timeline width={600} height={300} events={events} lanes={lanes} dateFormat={dateFormat} />
}
```

Please check the [react-svg-timeline-demo](https://github.com/netzwerg/react-svg-timeline-demo) repository for a full-fledged feature demonstration.

## Library Development

### Testing a release candidate

While making changes to this library in the context of a consuming project, [yalc](https://github.com/wclr/yalc) can be very handy:

In `react-svg-timeline`:

```
yalc publish
```

In your project consuming the library:

```
yalc add react-svg-timeline
```

### Publishing a release

```
yarn publish
git push --tags
```

## Acknowledgements

Thank you:

- [TSDX](https://github.com/palmerhq/tsdx) for making TS library development easier
- [GitHub Corners](https://github.com/tholman/github-corners) for the callout on the example site

## License

Licensed under [MIT License](LICENSE).

&copy; Rahel Lüthy 2021
