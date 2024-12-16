// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';

// import Common_en from './locales/en/Common.json';
// import Common_ja from './locales/ja/Common.json';

// import Cameras_en from './locales/en/Cameras.json';
// import Cameras_ja from './locales/ja/Cameras.json';

// import CameraConfiguration_en from './locales/en/CameraConfiguration.json';
// import CameraConfiguration_ja from './locales/ja/CameraConfiguration.json';
// import Export_en from './locales/en/Export.json';
// import Export_ja from './locales/ja/Export.json';
// import GeneralSettings_en from './locales/en/GeneralSettings.json';
// import GeneralSettings_ja from './locales/ja/GeneralSettings.json';

// import AnalysisGrouping_en from './locales/en/AnalysisGrouping.json';
// import AnalysisGrouping_ja from './locales/ja/AnalysisGrouping.json';
// import CameraDetails_en from './locales/en/CameraDetails.json';
// import CameraDetails_ja from './locales/ja/CameraDetails.json';

// import AddEditCamera_en from './locales/en/AddEditCamera.json';
// import AddEditCamera_ja from './locales/ja/AddEditCamera.json';

// import Login_en from './locales/en/Login.json';
// import Login_ja from './locales/ja/Login.json';

// import AllAlert_en from './locales/en/AllAlerts.json';
// import Common from './locales/Common.json';
// import Application from './locales/Application.json';

// const resources = {
//   en: {
//     Cameras: Cameras_en,
//     Common: Common_en,
//     CameraConfiguration:CameraConfiguration_en,
//     Export: Export_en,
//     GeneralSettings: GeneralSettings_en,
//     AnalysisGrouping: AnalysisGrouping_en,
//     CameraDetails: CameraDetails_en,
//     AddEditCamera: AddEditCamera_en,
//     Login: Login_en,
//     AllAlert : AllAlert_en
//   },
//   ja: {
//     Cameras: Cameras_ja,
//     Common: Common_ja,
//     CameraConfiguration:CameraConfiguration_ja,
//     Export: Export_ja,
//     GeneralSettings: GeneralSettings_ja,
//     AnalysisGrouping: AnalysisGrouping_ja,
//     CameraDetails: CameraDetails_ja,
//     AddEditCamera: AddEditCamera_ja,
//     Login: Login_ja
//   }
// };

// i18n.use(LanguageDetector)
//   .use(initReactI18next)
//   .init({
//     resources,
//     fallbackLng: 'ja',
//     lng: localStorage.getItem('language') || navigator.language,
//     interpolation: {
//       escapeValue: false, // react already safes from xss
//     },
//     defaultNS: 'Common',
//     ns: ['Common', 'Cameras', 'GeneralSettings', 'Export', 'CameraDetails', 'CameraConfiguration','AddEditCamera', 'AnalysisGrouping', 'Login']
//   });

// export default i18n;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Common from './locales/Common.json';
import Application from './locales/Application.json';

import LanguageDetector from 'i18next-browser-languagedetector';

type MergedJa = {
  [key: string]: string;
};

const mergedJa: MergedJa = {
  ...Common,
  ...Application
};

for (const key in mergedJa) {
  if (mergedJa[key]) {
    if (mergedJa[key].indexOf('分析') > -1) {
      mergedJa[key].replace('分析', '解析');
      console.error('Error in a Translation file: ', key);
    }
    if(mergedJa[key].indexOf(')') > -1){
      mergedJa[key].replace(')', '）');
      console.error('Found wrong round closing bracket: ', key);
    }
    if(mergedJa[key].indexOf('(') > -1){
      mergedJa[key].replace('(', '（');
      console.error('Found wrong round opening bracket: ', key);
    }
    if(mergedJa[key].indexOf(']') > -1){
      mergedJa[key].replace(']', '］');
      console.error('Found wrong square closing bracket: ', key);
    }
    if(mergedJa[key].indexOf('[') > -1){
      mergedJa[key].replace('[', '［');
      console.error('Found wrong square opening bracket: ', key);
    }
  }
}

export interface IJsonData {
  [key: string]: string
}

const mergedEn:IJsonData = {};
Object.keys(mergedJa).map((key: string) =>{
  mergedEn[key]=key;
  return 0;
});

const resources = {
  en: {
    CommonDict: mergedEn
  },
  ja: {
    CommonDict: mergedJa
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) 
  .init({
    resources,
    fallbackLng: 'ja',
    keySeparator: false, 
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;