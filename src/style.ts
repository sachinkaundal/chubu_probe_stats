import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
* , body{
  box-sizing: border-box;
}
body, html {
  min-width: 100%;
  min-height: 100vh;
  margin: 0;
}
html {
  background-repeat: no-repeat, repeat;
  background-image: linear-gradient(to bottom, hsl(210, 20%, 98%), hsl(285, 20%, 96%));
  /* background-image: radial-gradient(circle at 55% 1%, #303335, #212427 117%), url(./noise.png); */
}
body {
  font-family: Monorale, Hiragino Sans, "ヒラギノ角ゴシック", Hiragino Kaku Gothic ProN, "ヒラギノ角ゴ ProN W3", Roboto, YuGothic, "游ゴシック", Meiryo, "メイリオ", sans-serif;
  color: hsl(0, 0%, 50%);
  line-height: 1.5;
  select {
    font-style: normal !important;
  }
  @media only screen and (max-width: 1359px) {
    > div:nth-of-type(2) > div > div:nth-child(3) {
      opacity: 0;
      pointer-events: none;
    }
  }
}
#root {
  height: 100%;
  display:flex;
}
`;

export const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 0px;
  row-gap: 20px;
  height: auto;
  align-items: center;
`;

export default GlobalStyle;
