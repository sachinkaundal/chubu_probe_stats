import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageHeader, useNotification } from 'scorer-ui-kit';
import { fetchCsvUpdateTime } from '../../services/api';

const PageTitle = styled.div`
  height: 17px;
  flex-grow: 0;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  text-align: left;
  color: #788b91;
`;
const PageHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  @media only screen and (max-width: 1440px) {
    width: 925px;
  }
`;
const PageHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: 5%;
  // & div > div > div {
  //   margin-top: -12px;
  //   margin-left: 1px;
  // }
  & div > div > h1 {
    margin-top: -2px;
  }
`;
const IntroductionText = styled.span`
  width: 610px;
  @media (max-width: 1366px) {
    width: 560px;
  }
  height: 60px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  font-weight: normal;
  color: #7b8288;
  line-height: 1.43;
  letter-spacing: normal;
  margin-top: 10px;
`;
const StatsRow = styled.div<{ lang?: string; loading?: boolean }>`
  width: ${({ lang, loading }) =>
    lang === 'ja'
      ? loading
        ? '195px'
        : '185px'
      : loading
      ? '200px'
      : '182px'};
  height: 81px;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-radius: 3px;
  border: solid 1px #eaeaea;
  margin-top: -6px;
`;
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const FetchTimeText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #5a6269;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  margin-left: -1px;
`;
const TimeTextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
`;
const TimeText = styled.div`
  font-size: 14px;
  font-weight: normal;
  color: rgba(120, 138, 144, 0.72);
  font-family: ${({ theme }) => theme.fontFamily.data};
  margin-top: 0;
  margin-right: 2px;
`;

interface SettingHeaderDataProps {
  lastUpdateChanged?: boolean;
}
const SettingHeaderData: FC<SettingHeaderDataProps> = ({
  lastUpdateChanged,
}) => {
  const { t } = useTranslation(['CommonDict']);
  const { sendNotification } = useNotification();
  const lastTime = localStorage.getItem('chubuLastUpdateTime') || '';
  const [lastUpdated, setLastUpdated] = useState<string>(lastTime);
  const formatEpochToDateTime = (epochTime: number) => {
    const date = new Date(Number(epochTime) * 1000);
    const formattedDate = date.toLocaleDateString('en-CA').replace(/-/g, '/');
    const formattedTime = date.toTimeString().slice(0, 8);
    return `${formattedDate} - ${formattedTime}`;
  };

  const updateDate = useCallback(async () => {
    try {
      const date = await fetchCsvUpdateTime();
      const formatDate = formatEpochToDateTime(date);
      setLastUpdated(formatDate);
      localStorage.setItem('chubuLastUpdateTime', formatDate);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Internal server error.';
      sendNotification({ type: 'error', message: errorMessage });
    }
  }, [
    fetchCsvUpdateTime,
    lastUpdated,
    sendNotification,
    setLastUpdated,
    lastUpdateChanged,
  ]);

  useEffect(() => {
    updateDate();
  }, [lastUpdateChanged]);
  return (
    <>
      <PageTitle>{t('Settings')}</PageTitle>
      <PageHeaderContainer>
        <PageHeaderWrapper>
          <PageHeader
            iconColor="dimmed"
            title={t('Chubu Probe Integrator')}
            icon="ViewSettings"
            updateDocTitle={false}
            areaHref="/settings/server-management"
          />
          <IntroductionText>
            {t(
              'Analyzes vehicle data from CSV files to create traffic statistics, including vehicle count and average speed, offering insights for efficient traffic analysis and management.'
            )}
          </IntroductionText>
        </PageHeaderWrapper>
        <StatsRow>
          <TextWrapper>
            <FetchTimeText>{t('Last Update')}</FetchTimeText>
            <TimeTextWrapper>
              <TimeText>{lastUpdated === '' ? '-' : lastUpdated}</TimeText>
            </TimeTextWrapper>
          </TextWrapper>
        </StatsRow>
      </PageHeaderContainer>
    </>
  );
};

export default SettingHeaderData;
