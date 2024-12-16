import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonWithLoading,
  Content,
  Icon,
  Input,
  useNotification,
} from 'scorer-ui-kit';
import styled from 'styled-components';
import { addMemoRecord } from '../../services/api';
import { useHistory } from 'react-router';
import SettingHeaderData from './settingHeaderData';
import { Link } from 'react-router-dom';

const MainContainer = styled(Content)`
  width: 100%;
  padding: 51px 30px 48px 87px;
`;
const ContainerWrapper = styled.div`
  max-width: 852px !important;
  @media screen and (min-width: 1440px) {
    max-width: 1061px !important;
  }
`;

const LabelText = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #8b9196;
  margin: 0;
  padding: 0;
`;
const Rectangle = styled.div`
  height: 78px;
  margin: 7px 42px 35px 0;
  padding: 17px 0 12px 20px;
  border-radius: 3px;
  border: solid 1px #eee;
  @media only screen and (max-width: 1440px) {
    width: 925px;
  }
`;
const RectangleContentWrapper = styled.div`
  display: flex;
`;
const IconWrapper = styled.div`
  margin: 7px 10px 0 -2px;
`;
const TextBoxWrapper = styled.div`
  text-align: left;
`;
const ContentTitle1 = styled.div`
  margin: -2px 0 0 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  font-weight: 500;
  color: #5a6269;
`;
const ContentTitle2 = styled.div`
  margin: 1px 0 0 13px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  line-height: 1.79;
  color: #8b9196;
`;
const TitleWrapper = styled.div<{ marginBottom: string; marginTop: string }>`
  display: flex;
  align-items: center;
  margin-bottom: ${({ marginBottom }) => marginBottom};
  margin-top: ${({ marginTop }) => marginTop};
`;
const TitleText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #5a6269;
  padding-right: 18px;
`;
const RowContainer = styled.div<{ alignment?: string; gap?: string }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: ${({ alignment }) => (alignment ? alignment : 'center')};
  justify-content: start;
  gap: ${({ gap }) => (gap ? gap : '0 55px')};
  width: 100%;
  @media screen and (max-width: 1367px) {
    column-gap: 25px;
  }
`;
const Field = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  width: 100%;
  max-width: 415px;
  margin-bottom: 21px;
  margin-top: 2px;
`;
const DisplayInput = styled(Input)`
  ::placeholder {
    font-style: normal;
  }
`;
const Astrisk = styled.span`
  color: rgb(238, 75, 43);
`;
const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 2px;
  justify-self: right;
`;
const CancelButton = styled.div<{ lang?: string }>`
  & > button {
    height: 40px;
    width: ${({ lang }) => (lang === 'ja' ? '110px' : 'auto')};
    border-radius: 3px;
    background-color: #f2f2f2;
    margin-right: -10px;
    font-size: 16px;
    padding: ${({ lang }) => (lang === 'ja' ? '0 6px' : '0 10px 0 10px')};
  }
`;
const CreateRecordButton = styled(ButtonWithLoading)<{ loading?: boolean }>`
  height: 40px;
  border-radius: 3px;
  font-size: 16px;
  background-image: linear-gradient(107deg, #71c3ed, #5baced);
  > div > div:first-child {
    padding: ${({ loading }) => (loading ? '0 8px' : '0px')};
  }
`;
const LinkContainer = styled(Link)`
  text-decoration: none;
`;
// interface IError {
//   statusCode: number,
//   messsage: string
// }

const CreateMemo = () => {
  const { t } = useTranslation(['CommonDict']);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [createMemoData, setCreateMemoData] = useState({
    mesh_code: '',
    inflow_node: '',
    outflow_node: '',
    memo: '',
  });
  const { sendNotification } = useNotification();
  const handleFormDataInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (name !== 'memo' && !/^\d*$/.test(value)) {
      return;
    }
    setCreateMemoData({ ...createMemoData, [name]: value.trimStart() });
  };
  const handleCreateMemo = useCallback(async () => {
    const isInvalidCode = /^0+$/;
    const { mesh_code, inflow_node, outflow_node } = createMemoData;
    if (!mesh_code.trim()) {
      sendNotification({
        type: 'info',
        message: t('Please enter the Mesh Code.'),
      });
      return;
    }
    if (isInvalidCode.test(mesh_code)) {
      sendNotification({
        type: 'info',
        message: t('Please enter a valid Mesh Code'),
      });
      return;
    }

    if (!inflow_node.trim()) {
      sendNotification({
        type: 'info',
        message: t('Please enter the Inflow Node.'),
      });
      return;
    }
    if (isInvalidCode.test(inflow_node)) {
      sendNotification({
        type: 'info',
        message: t('Please enter a valid Inflow Node'),
      });
      return;
    }

    if (!outflow_node.trim()) {
      sendNotification({
        type: 'info',
        message: t('Please enter the Outflow Node.'),
      });
      return;
    }
    if (isInvalidCode.test(outflow_node)) {
      sendNotification({
        type: 'info',
        message: t('Please enter a valid Outflow Node'),
      });
      return;
    }

    setLoading(true);
    try {
      const trimmedData = {
        ...createMemoData,
        memo: createMemoData.memo.trim(),
      };
      await addMemoRecord(trimmedData);
      setCreateMemoData({
        mesh_code: '',
        inflow_node: '',
        outflow_node: '',
        memo: '',
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      sendNotification({
        type: 'success',
        message: 'Target road record has been created successfully.',
      });

      setTimeout(() => {
        history.push('/settings/chubu-probe-integrator?tab=group2');
      }, 3000);
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Internal server error.';

      sendNotification({ type: 'error', message: errorMessage });
    }
  }, [createMemoData, sendNotification, history, addMemoRecord, setLoading]);

  return (
    <MainContainer>
      <ContainerWrapper>
        <SettingHeaderData />
        <Rectangle>
          <RectangleContentWrapper>
            <IconWrapper>
              <Icon icon="Target road settings" size={29} color="dimmed" />
            </IconWrapper>
            <TextBoxWrapper>
              <ContentTitle1>{t('Target road settings')}</ContentTitle1>
              <ContentTitle2>
                {t(
                  'Add record with mesh code and details about inflow and outflow node.'
                )}
              </ContentTitle2>
            </TextBoxWrapper>
          </RectangleContentWrapper>
        </Rectangle>
        <>
          <TitleWrapper marginBottom="29px" marginTop="23px">
            <TitleText>{t('Create Record')}</TitleText>
          </TitleWrapper>
          <RowContainer>
            <Field>
              <LabelText>
                {t('Mesh Code')} <Astrisk>*</Astrisk>
              </LabelText>
              <DisplayInput
                name="mesh_code"
                id="mesh_code"
                required={true}
                placeholder={t('Enter valid code')}
                maxLength={6}
                value={createMemoData.mesh_code}
                onChange={handleFormDataInputChange}
              />
            </Field>
            <Field>
              <LabelText>
                {t('Inflow Node')} <Astrisk>*</Astrisk>
              </LabelText>
              <DisplayInput
                name="inflow_node"
                id="inflow_node"
                placeholder={t('Enter valid node')}
                maxLength={6}
                required
                value={createMemoData.inflow_node}
                onChange={handleFormDataInputChange}
              />
            </Field>
            <Field>
              <LabelText>
                {t('Outflow Node')} <Astrisk>*</Astrisk>
              </LabelText>
              <DisplayInput
                name="outflow_node"
                id="outflow_node"
                placeholder={t('Enter valid node')}
                maxLength={6}
                required={true}
                value={createMemoData.outflow_node}
                onChange={handleFormDataInputChange}
              />
            </Field>
            <Field>
              <LabelText>{t('Memo Name')}</LabelText>
              <DisplayInput
                name="memo"
                id="memo"
                placeholder={t('Enter memo name')}
                maxLength={30}
                value={createMemoData.memo}
                onChange={handleFormDataInputChange}
              />
            </Field>
          </RowContainer>
          <ButtonContainer>
            <LinkContainer to="/settings/chubu-probe-integrator?tab=group2">
              <CancelButton>
                <Button
                  design="secondary"
                  size="normal"
                  // onClick={handleAddEditModal}
                >
                  {t('Cancel')}
                </Button>
              </CancelButton>
            </LinkContainer>
            <CreateRecordButton
              loading={loading}
              disabled={loading}
              size="small"
              onClick={handleCreateMemo}
            >
              {t('Create Record')}
            </CreateRecordButton>
          </ButtonContainer>
        </>
      </ContainerWrapper>
    </MainContainer>
  );
};

export default CreateMemo;
