import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Fonts from './Fonts';
import Style from './style';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, ThemeVariables, ModalProvider, NotificationProvider, useThemeToggle } from 'scorer-ui-kit';
import reportWebVitals from './reportWebVitals';


const Contents = () => {
  const { onThemeToggle, isLightMode } = useThemeToggle();

  //@ts-ignore
  defaultTheme.custom.lines.weird = {
    label: {
      fill: '#fff'
    },
    contrastLine: {
      stroke:  'transparent;'
    },
    highlightLine: {
      stroke:  'transparent;'
    },
    grabHandle: {
      fill: 'transparent;',
      stroke: 'transparent;'
    },
    point:{
      fill: 'hsla(205deg, 45%, 90%, 100%)',
    },
    grabHandleText:{
      fill: 'transparent'
    },
    grabHandleContrast:{
      fill: 'transparent'
    },
    handleBase: {
      fill: 'transparent'
    },
    handleRingLayer: {
      stroke: 'hsla(205deg, 100%, 89%, 100%);'
    },
    handleReactiveFill:{
      stroke: 'transparent;'
    },
    handleReactiveRing:{
      stroke: 'transparent;'
    },
    handleContrastLayer:{
      stroke: 'transparent;'
    },
    stopStart:{
      stopColor:' hsla(0, 100%, 15%, 35%);'
    },
    stopEnd:{
      stopColor: 'hsla(0, 100%, 15%, 0%);'
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <ModalProvider>
        <NotificationProvider>
          <Router>
            <App {...{ isLightMode, onThemeToggle }} />
            <Fonts />
            <Style />
            <ThemeVariables />
          </Router>
        </NotificationProvider>
      </ModalProvider>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Contents />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
