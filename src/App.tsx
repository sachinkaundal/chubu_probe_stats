import React, { useCallback } from 'react';
import { MainMenu, TopBar } from 'scorer-ui-kit';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';
import logoMarkSvg from './svg/logo-mark.svg';
import menu from './pages/menu.json';
import chubuProbeIntegrator from './pages/ChubuProbeIntegrator/index';
import EditMemo from './pages/ChubuProbeIntegrator/editMemo';
import CreateMemo from './pages/ChubuProbeIntegrator/createMemo';
import i18n from './i18n';

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
`;

const App: any = () => {
  const onLanguageChange = useCallback(() => {
    const language = i18n.language === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, []);
  document.body.className = 'light-theme';
  return (
    <>
      <MainMenu
        content={menu}
        logoMark={logoMarkSvg}
        keepOpenText="Keep Open"
        autoHideText="Auto-Hide"
        defaultMenuOpen={false}
        canAlwaysPin
      />
      <MainContainer>
        <TopBar
          accountOptionText="Account Options"
          loggedInUser="Shivang"
          logoutText="Logout"
          currentUserText="CURRENT USER"
          hasLogout={false}
          hasLanguage
          onLanguageToggle={onLanguageChange}
          isLightMode
        />
        <Switch>
          <Route
            path="/settings/chubu-probe-integrator"
            exact
            component={chubuProbeIntegrator}
          />
          <Route
            path="/settings/chubu-probe-integrator/edit-memo/:mesh_code/:inflow_node/:outflow_node/:memo?"
            exact
            component={EditMemo}
          />
          <Route
            path="/settings/chubu-probe-integrator/create-memo"
            exact
            component={CreateMemo}
          />
        </Switch>
      </MainContainer>
    </>
  );
};

export default App;
