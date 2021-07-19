# react-svg-timeline [![Build Status](https://travis-ci.com/netzwerg/react-svg-timeline.svg?branch=master)](https://travis-ci.com/netzwerg/react-svg-timeline) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react-svg-timeline.svg?style=flat)](https://www.npmjs.com/package/react-svg-timeline) [![Netlify Status](https://api.netlify.com/api/v1/badges/8d78caa2-c055-46a0-9d36-e447dafb1bde/deploy-status)](https://app.netlify.com/sites/react-svg-timeline/deploys)

A React event timeline component based on SVG.

- Event Points & Periods
- Event Tooltips
- Event Lanes
- Semantic Zoom (10 Years, 1 Year, 1 Week, 1 Day, etc)
- Custom "rubber band" Zoom
- Panning

✨ [Interactive Demo](https://react-svg-timeline.netlify.com/) ✨

## Installation

`yarn add react-svg-timeline`

or

`npm install react-svg-timeline`

Note that the following peer dependencies must already be installed:

- `react` and `react-dom` in version >=16.3
- `@material-ui/core` in version >=4.3

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
      laneId: laneId,
      startTimeMillis: 1399845600000,
    },
    {
      eventId: 'event-2',
      laneId,
      startTimeMillis: 1167606000000,
      endTimeMillis: 1230698892000,
    },
  ]
  const dateFormat = (ms: number) => new Date(ms).toLocaleString()
  return <Timeline width={600} height={300} events={events} lanes={lanes} dateFormat={dateFormat} />
}
```

Please check the [example](example) folder for a full-fledged feature demonstration.

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
