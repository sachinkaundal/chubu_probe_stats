import { defaultTheme } from 'scorer-ui-kit';

interface ITheme {
  [key: string]: any;
}

const customTheme: ITheme = defaultTheme;

customTheme.custom.lines.weird = {
  label: {
    fill: '#fff',
  },
  contrastLine: {
    stroke: 'hsla(54deg, 93%, 35%, 100%)',
  },
  highlightLine: {
    stroke: 'hsla(54deg, 100%, 90%, 90%)',
  },
  grabHandle: {
    fill: 'hsla(54deg, 93%, 70%, 100%)',
    stroke: 'hsla(54deg, 93%, 70%, 100%)',
  },
  point: {
    fill: 'hsla(54deg, 93%, 70%, 100%)',
  },
  grabHandleContrast: {
    stroke: 'hsla(54deg, 93%, 70%, 100%)',
  },
  grabHandleText: {
    fill: 'hsla(205deg, 80%, 25%, 100%);',
  },
  handleBase: {
    fill: 'hsla(235deg, 100%, 80%, 100%);',
  },
  handleRingLayer: {
    stroke: 'hsla(54deg, 93%, 90%, 90%)',
  },
  handleReactiveFill: {
    fill: 'hsla(54deg, 93%, 45%, 100%)',
  },
  handleReactiveRing: {
    stroke: 'hsla(54deg, 93%, 36%, 27%)',
  },
  handleContrastLayer: {
    stroke: 'hsla(54deg, 93%, 36%, 15%)',
  },
  stopStart: {
    stopColor: 'hsla(205deg, 100%, 15%, 35%)',
  },
  stopEnd: {
    stopColor: 'hsla(205deg, 100%, 15%, 0%)',
  },
};

export { customTheme };
