import React, {
  FC,
  useState,
  useCallback,
  useEffect,
  ReactElement,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import {
  Content,
  Tabs,
  TabList,
  TypeTable,
  MultilineContent,
  TabWithIcon,
  TabContent,
  Spinner,
  Icon,
  useNotification,
  ButtonWithIcon,
  Button,
  useModal,
} from 'scorer-ui-kit';
import {
  ITableColumnConfig,
  ITypeTableData,
  IRowData,
} from 'scorer-ui-kit/dist/Tables';
import { Link, useHistory, useLocation } from 'react-router-dom';
import {
  deleteMemoRecord,
  fetchMemoRecords,
  uploadFile,
  uploadHolidayFile,
} from '../../services/api';
import AreaUploadManager from '../../Components/AreaUploadManager';
import SettingHeaderData from './settingHeaderData';

const MainContainer = styled(Content)`
  width: 100%;
  padding: 51px 30px 48px 87px;
`;
const ContainerWrapper = styled.div`
  max-width: 925px !important;
  @media screen and (min-width: 1440px) {
    max-width: 1061px !important;
  }
`;
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 80px 0;
  row-gap: 20px;
  height: auto;
  align-items: center;
`;
const LabelText = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #8b9196;
  margin: 0;
  padding: 0;
`;
const TabLineDiv = styled.div`
  margin: 26px 0 12px -100px;
  box-shadow: 0 -3px 5px 0 rgba(0, 0, 0, 0.1);
  background-color: #e4e4e4;
  height: 1px;
  width: 1635px;
  border-radius: 3px;
  @media only screen and (max-width: 1440px) {
    width: 1025px;
  }
`;
const TabWrapper = styled.div<{ tab?: string }>`
  text-align: center;
  /* Styles for Group Tab 1 */
  &.groupTab-1 div > div:nth-child(1) {
    margin-left: 2px !important;
    margin-top: 4px;
  }
  &.groupTab-1 div:nth-child(1) {
    margin-left: 2px !important;
  }
  &.groupTab-1 div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
    margin-left: 2px !important;
    margin-bottom: 0 !important;
    margin-top: -2px;
  }

  /* Styles for Group Tab 2 */
  &.groupTab-2 div > div:nth-child(1) {
    margin-left: -3px !important;
  }
  &.groupTab-2 div:nth-child(1) {
    margin-left: 18px !important;
  }
  &.groupTab-2 div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
    margin-bottom: 0;
    margin-top: -2px;
    margin-left: 1px !important;
  }

  /* Styles for Group Tab 3 */
  &.groupTab-3 div > div:nth-child(1) {
    margin-left: -5px;
  }
  &.groupTab-3 div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
    margin-left: 2px !important;
    margin-top: -2px;
    margin-bottom: 0;
  }

  /* Styles for Group Tab 4 */
  &.groupTab-4 div > div:nth-child(1) {
    margin-left: 2px !important;
    margin-top: 1px;
  }
  &.groupTab-4 div:nth-child(1) {
    margin-left: 7px !important;
  }
  &.groupTab-4 div > div > div:nth-child(1) {
    margin-bottom: 0;
    margin-left: 3px !important;
    margin-top: -2px;
  }

  /* Styles for Group Tab 5 */
  &.groupTab-5 div > div:nth-child(1) {
    margin-left: -2px !important;
    margin-top: 4px !important;
  }
  &.groupTab-5 div:nth-child(1) {
    margin-left: -2px !important;
  }
  &.groupTab-5 div:nth-child(1) > div:nth-child(2) > div:nth-child(1) {
    margin-bottom: 0;
    margin-left: 1px !important;
    margin-top: -1px !important;
  }
`;
const Divider = styled.div`
  height: 1px;
  border-radius: 3px;
  background-color: #efefef;
  margin-left: -100px;
  width: 1635px;
  @media only screen and (max-width: 1440px) {
    width: 1025px;
  }
`;
const GroupTabContent = styled(TabContent)`
  padding-top: 22px;
  @media only screen and (max-width: 1440px) {
    width: 925px;
  }
  & > div > div > div:nth-of-type(1) {
    height: 65px !important;
  }
  & > div > div > div:not(:nth-of-type(1)) {
    height: 60px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(3) > div > div:nth-child(2) {
    margin-left: -4px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(4) > div > div:nth-child(2) {
    margin-left: -27px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(5) > div > div:nth-child(2) {
    margin-left: -33px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(6) > div > div:nth-child(2) {
    margin-left: -7px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(7) > div > div:nth-child(2) {
    margin-left: -7px;
  }
  & > div > div > div:nth-child(1) > div:nth-child(8) > div > div:nth-child(2) {
    margin-left: 5px;
  }
`;
const Rectangle = styled.div`
  height: 78px;
  width: 100%;
  margin: 7px 0px 35px 0;
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
const ContentTitle3 = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  line-height: 1.79;
  color: #8b9196;
  margin-bottom: 20px;
`;
const InputField = styled.div`
  width: 100%;
  > div > div > div:nth-child(4) {
    max-width: 100%;
  }
`;

const TableContainer = styled.div`
  > div:nth-child(3)
    > div:first-child
    > div:first-child
    > div
    > div
    > div:nth-child(2) {
    z-index: 1;
  }
`;
const InnerTableContainer = styled.div`
  min-height: 120px;
`;
const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  > a {
    text-decoration: none;
  }
`;
const SearchFieldContainer = styled.div`
  height: 68px;
  align-self: stretch;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0;
  > div {
    > div:not(:first-child) {
      button {
        div:first-child {
          div {
            margin-top: -1px;
            margin-left: -1px;
          }
        }
        span {
          margin-top: 0px;
          letter-spacing: -0.1px;
          font-family: monorale;
        }
        div:last-child {
          margin-left: -3px;
          margin-top: -5px;
        }
      }
    }
    > div:nth-child(3) {
      button {
        padding-right: 11px;
        box-shadow: 0 2px 1px 0 rgba(0, 102, 255, 0.04);
        border: solid 1px rgba(0, 29, 95, 0.16);
        > div > div {
          svg {
            g {
              // stroke: #8b8d98 !important;
              stroke-width: 1.5;
            }
          }
        }
        span {
          letter-spacing: 0px;
        }
        div:last-child {
          margin-left: -4px;
        }
      }
    }
    > div:last-child {
      button {
        span {
          margin-right: 11px;
        }
      }
    }
  }
`;
const ColumnText = styled.p<{
  padding?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  letter?: string;
  line?: string;
  margin?: string;
  family?: string;
}>`
  height: auto;
  padding: ${({ padding }) => (padding ? padding : '0px')};
  font-family: ${({ family }) => (family ? family : 'Lato')};
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '14px')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => (color ? color : '#898e96')};
  margin: ${({ margin }) => (margin ? margin : '0px')};
  font-weight: ${({ fontWeight }) => (fontWeight ? fontWeight : '500')};
  letter-spacing: ${({ letter }) => letter};
  line-height: ${({ line }) => line};
`;
const CreateButtonContainer = styled.div<{ lang?: string }>`
  width: ${({ lang }) => (lang === 'ja' ? 'auto' : '')};
  margin-top: -8px;
  & > button {
    width: 100%;

    ${({ lang }) =>
      lang !== 'ja' &&
      css`
        padding: 0 0 0 8px;
        & > div > :first-child {
          padding-left: 6px;
        }
      `}
  }
`;
const CreateButtonWithIcon = styled(ButtonWithIcon)`
  margin-top: -16px;
`;
const ResultInfoContainer = styled.div`
  height: 40px;
  align-self: stretch;
  flex-grow: 0;
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  padding: 0;
  margin-top: 2px;
`;
const ResultCountLabel = styled.label`
  font-family: ${({ theme }) => theme.fontFamily.data};
  position: relative;
  display: flex;
  flex-flow: row wrap;
  max-width: 80%;
  font-size: 12px;
  color: #898f95;
  line-height: 1.67;
  white-space: none;
`;
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 80%;
`;
const FilterListIcon = styled.div`
  margin-top: 2px;
`;
const FilterText = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 11px;
  margin-right: 5px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(210, 5%, 56%);
`;
const ClearItem = styled(FilterListIcon)`
  cursor: pointer;
`;
const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  width: 100%;
  gap: 12px;
`;
const IconCursor = styled.div`
  cursor: pointer;
`;
const Container = styled.div`
  position: relative !important;
  display: flex;
  align-items: center;
`;
const SearchIconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  padding-left: 12px;
  fill: hsl(0, 0%, 0%, 0.32);
  stroke: hsl(0, 0%, 0%, 0.32);
  z-index: 1;
`;
const MeshInOutName = styled.div`
  text-wrap: wrap;
  overflow-wrap: anywhere;
  max-width: 100px;
`;
const InputSearch = styled.input<{ width?: string; paddingTop?: string }>`
  font-family: ${({ theme }) => theme.fontFamily.data};
  outline: none;
  border: solid 1px hsl(0, 0%, 92%);
  padding-left: 33px;
  padding-top: ${({ paddingTop }) => (paddingTop ? paddingTop : '3px')};
  width: ${(props) => props.width};
  position: relative;
  height: 100%;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  ::placeholder {
    opacity: 0.65;
    font-size: 14px;
    font-style: italic;
    color: hsl(0, 0%, 32%);
  }
  &:focus {
    color: hsl(208, 8%, 39%);
  }
`;

export interface ITypeTableRowData {
  mesh_code: string;
  inflow_node: string;
  outflow_node: string;
  memo: string;
}
export interface Iprops extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  width?: string;
  iconSize?: number;
  icon?: string;
  paddingTop?: string;
}
export const SearchInput: React.FC<Iprops> = ({
  className,
  width,
  iconSize = 17,
  icon = 'Search',
  paddingTop,
  ...props
}) => {
  return (
    <Container className={className}>
      <SearchIconWrapper>
        <Icon icon={icon} size={iconSize} color="dimmed" />
      </SearchIconWrapper>
      <InputSearch {...props} width={width} paddingTop={paddingTop} />
    </Container>
  );
};
const FilterInput = styled(SearchInput)`
  width: 150%;
  & input {
    box-sizing: border-box;
    width: 181px;
    height: 32px;
    background-color: #f0f0f3;
    font-size: 12px;
    border-radius: 3px;
    box-shadow: 0 2px 1px 0 rgba(0, 102, 255, 0.04);
    border: solid 1px rgba(0, 29, 95, 0.16);
    flex-shrink: 0;
    ::placeholder {
      color: #80838d;
      font-style: normal;
    }
  }
`;

const CardModal = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: hsl(210, 6%, 47%);
  margin-bottom: 10px;
`;

const DeleteConfirmationContent = styled.div`
  margin: 4px 6px 40px 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.79;
  color: #7c7e7f;
`;
const LinkContainer = styled(Link)`
  text-decoration: none;
`;
const DeleteButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;
`;

const DeleteModelConfirm = styled(Button)`
  width: auto;
`;

const ChubuProbeIntegrator: FC = () => {
  const { t } = useTranslation(['CommonDict']);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [targetFileLoadng, setTargetFileLoadng] = useState(false);
  const [holidayFileLoadng, setHolidayFileLoadng] = useState(false);
  const [targetFile, setTargetFile] = useState<File[]>([]);
  const [holidayFile, setHolidayFile] = useState<File[]>([]);
  const [rows, setRows] = useState<ITypeTableRowData[]>([]);
  const [rowDataList, setRowDataList] = useState<ITypeTableData>([]);
  const [selectedTab, setSelectedTab] = useState<string>('group1');
  const params = useLocation().search;
  const [historyParams] = useState<string>(params);
  const { replace } = useHistory();
  const [lastUpdateChanged, setLastUpdateChanged] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<string>('');
  const { setModalOpen, createModal } = useModal();
  const uploaderRef = useRef<{ clearFilesCallback: () => void }>(null);
  const uploadHolidayRef = useRef<{ clearFilesCallback: () => void }>(null);
  const { sendNotification } = useNotification();

  const tabList = useMemo(
    () => [
      {
        name: t('Upload probe stats data'),
        icon: 'Camera',
        id: 'all',
      },
      {
        name: t('Target road settings'),
        icon: 'Location',
        id: 'new',
      },
      {
        name: t('Holiday Configuration'),
        icon: 'Link',
        id: 'linked',
      },
    ],
    [t]
  );

  const tabConfigs = [
    {
      icon: 'Upload Data',
      title1: t('Upload probe stats data'),
      title2: t(
        'Upload a CSV or ZIP file with detailed vehicle traffic data, including vehicles count and average speed.'
      ),
    },
    {
      icon: 'Target road settings',
      title1: t('Target road settings'),
      title2: t(
        'Add, edit or delete Target records with mesh codes and details about inflow and outflow nodes.'
      ),
    },
    {
      icon: 'Holiday Configuration',
      title1: t('Holiday Configuration'),
      title2: t(
        'Upload the holiday calendar to exclude these dates from analysis.'
      ),
    },
  ];

  const columnConfig: ITableColumnConfig[] = useMemo(
    () => [
      {
        header: t('Mesh Code'),
        cellStyle: 'firstColumn',
        minWidth: 100,
      },
      {
        header: t('Inflow Node'),
        cellStyle: 'normalImportance',
        alignment: 'left',
        minWidth: 100,
      },
      {
        header: t('Outflow Node'),
        cellStyle: 'normalImportance',
        alignment: 'left',
        minWidth: 100,
      },
      {
        header: t('Memo Name'),
        cellStyle: 'normalImportance',
        alignment: 'left',
        minWidth: 100,
      },
      {
        header: t('Actions'),
        cellStyle: 'normalImportance',
        alignment: 'right',
        minWidth: 100,
      },
    ],
    [t]
  );
  const fetchHistoryParams = useCallback(() => {
    const urlString = new URLSearchParams(historyParams);
    const tabName = urlString.get('tab');
    if (tabName) {
      setSelectedTab(tabName);
    } else {
      setSelectedTab('group1');
      replace(window.location.pathname + '?tab=group1');
    }
  }, [historyParams, setSelectedTab, replace]);

  const handleClearTargetFile = useCallback(() => {
    if (uploaderRef.current) {
      uploaderRef.current.clearFilesCallback();
    }
    setTargetFile([]);
  }, [setTargetFile]);

  const handleTargetFileChange = useCallback(
    (goodFiles: FileList, rejectedFiles: FileList) => {
      if (goodFiles?.length) {
        setTargetFile(Array.from(goodFiles));
      } else {
        handleClearTargetFile();
      }
      if (rejectedFiles.length) {
        sendNotification({
          type: 'error',
          message: 'Please select a valid Target file!',
        });
      }
    },
    [handleClearTargetFile, sendNotification, setTargetFile]
  );

  const handleBeginUploadTarget = useCallback(async () => {
    try {
      if (targetFile.length > 0) {
        setTargetFileLoadng(true);
        await uploadFile(targetFile[0]);
        handleClearTargetFile();
        setLastUpdateChanged(!lastUpdateChanged);
        sendNotification({
          type: 'success',
          message: 'Target file has been uploaded successfully.',
        });
      } else {
        sendNotification({
          type: 'warning',
          message: 'Please select a Target file to upload!',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Internal server error.';
      sendNotification({ type: 'error', message: errorMessage });
    } finally {
      setTargetFileLoadng(false);
    }
  }, [
    targetFile,
    handleClearTargetFile,
    sendNotification,
    uploadFile,
    setTargetFileLoadng,
    lastUpdateChanged,
  ]);

  const handleClearHolidayFiles = useCallback(() => {
    if (uploadHolidayRef.current) {
      uploadHolidayRef.current.clearFilesCallback();
    }
    setHolidayFile([]);
  }, [uploadHolidayRef, setHolidayFile]);

  const handleHolidayFileChange = useCallback(
    (goodFiles: FileList, rejectedFiles: FileList) => {
      if (goodFiles?.length) {
        setHolidayFile(Array.from(goodFiles));
      } else {
        handleClearHolidayFiles();
      }
      if (rejectedFiles.length) {
        sendNotification({
          type: 'error',
          message: 'Please select a valid Holiday file!',
        });
      }
    },
    [handleClearHolidayFiles, sendNotification, setHolidayFile]
  );

  const handleBeginUploadHoliday = useCallback(async () => {
    try {
      if (holidayFile.length > 0) {
        setHolidayFileLoadng(true);
        await uploadHolidayFile(holidayFile[0]);
        handleClearHolidayFiles();
        sendNotification({
          type: 'success',
          message: 'Holiday file has been uploaded successfully.',
        });
      } else {
        sendNotification({
          type: 'warning',
          message: 'Please select a Target file to upload!',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Internal server error.';
      sendNotification({ type: 'error', message: errorMessage });
    } finally {
      setHolidayFileLoadng(false);
    }
  }, [
    holidayFile,
    handleClearHolidayFiles,
    sendNotification,
    uploadHolidayFile,
    setHolidayFileLoadng,
  ]);

  const tabOnClick = useCallback(
    (tabName: string) => {
      setSelectedTab(tabName);
      replace(window.location.pathname + '?tab=' + tabName);
    },
    [replace, setSelectedTab]
  );
  const deleteModal = (data: ITypeTableRowData) => {
    //modal for done click to open before final request send to backened
    const confirmModal: ReactElement = (
      <CardModal>
        <CardTitle>{t('Delete Memo?')}</CardTitle>
        <DeleteConfirmationContent>
          {t('Are you sure you want to delete Memo?')}
        </DeleteConfirmationContent>
        <DeleteButtonContainer>
          <Button
            design="secondary"
            size="normal"
            onClick={() => setModalOpen(false)}
          >
            {t('Cancel')}
          </Button>
          <DeleteModelConfirm
            design="primary"
            size="normal"
            onClick={() => {
              handleDelete(data);
              setModalOpen(false);
            }}
          >
            {t('Proceed')}
          </DeleteModelConfirm>
        </DeleteButtonContainer>
      </CardModal>
    );
    createModal({ isCloseEnable: false, customComponent: confirmModal });
  };

  const onSearchChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue.length === 0) setSearchResult(event.target.value.trim());
    else if (inputValue.trim()) setSearchResult(event.target.value);
  };
  const removeSearch = () => {
    setSearchResult('');
  };
  const filterMemoName = useCallback(
    (links) => {
      const filter: ITypeTableRowData[] = [];
      links.forEach((memoList: ITypeTableRowData) => {
        const { memo } = memoList;
        if (
          memo.toLowerCase().includes(searchResult.toLowerCase()) ||
          searchResult === ''
        ) {
          filter.push(memoList);
        }
      });
      return filter;
    },
    [searchResult]
  );
  const sortByMemoName = useCallback((data: ITypeTableRowData[]) => {
    return [...data].sort((a, b) =>
      a.memo.toLowerCase().localeCompare(b.memo.toLowerCase())
    );
  }, []);

  const generateMeshInOutNameColumn = useCallback(
    (data: string): ReactElement[] => {
      return [<MeshInOutName>{data}</MeshInOutName>];
    },
    []
  );

  const generateActions = useCallback(
    (data: ITypeTableRowData): ReactElement[] => {
      const { memo, mesh_code, inflow_node, outflow_node } = data;
      return [
        <IconsContainer>
          <LinkContainer
            to={`/settings/chubu-probe-integrator/edit-memo/${mesh_code}/${inflow_node}/${outflow_node}/${memo}`}
          >
            <IconCursor>
              <Icon icon="Edit" size={12} />
            </IconCursor>
          </LinkContainer>
          <IconCursor onClick={() => deleteModal(data)}>
            <Icon icon="Delete" size={14} />
          </IconCursor>
          <div></div>
        </IconsContainer>,
      ];
    },
    []
  );

  const generateRowData = useCallback((): ITypeTableData => {
    const filterData = filterMemoName(rows);
    const sortedData = sortByMemoName(filterData);
    const emptyRow: ITypeTableData = [{ columns: [] }];

    const data = sortedData.map((data, index) => {
      const row: IRowData = {
        id: index,
        columns: [
          {
            customComponent: (
              <MultilineContent
                contentArray={generateMeshInOutNameColumn(data.mesh_code)}
              />
            ),
          },
          {
            customComponent: (
              <MultilineContent
                contentArray={generateMeshInOutNameColumn(data.inflow_node)}
              />
            ),
          },
          {
            customComponent: (
              <MultilineContent
                contentArray={generateMeshInOutNameColumn(data.outflow_node)}
              />
            ),
          },
          {
            customComponent: (
              <MultilineContent
                contentArray={generateMeshInOutNameColumn(data.memo)}
              />
            ),
          },
          {
            customComponent: (
              <MultilineContent contentArray={generateActions(data)} />
            ),
          },
        ],
      };
      return row;
    });
    if (data.length === 0) {
      return emptyRow;
    }
    return data;
  }, [
    generateActions,
    generateMeshInOutNameColumn,
    filterMemoName,
    sortByMemoName,
    rows,
  ]);

  const handleDelete = useCallback(
    async (data: ITypeTableRowData) => {
      try {
        const { mesh_code, inflow_node, outflow_node } = data;
        await deleteMemoRecord(mesh_code, inflow_node, outflow_node);

        setRows((prevRows) =>
          prevRows.filter(
            (item) =>
              item.mesh_code !== mesh_code ||
              item.inflow_node !== inflow_node ||
              item.outflow_node !== outflow_node
          )
        );
        sendNotification({
          type: 'success',
          message: 'Target Record has been deleted successfully.',
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Internal server error';
        sendNotification({ type: 'error', message: errorMessage });
      }
    },
    [sendNotification, setRows, deleteMemoRecord]
  );

  useEffect(() => {
    fetchHistoryParams();
  }, [fetchHistoryParams]);

  useEffect(() => {
    setRowDataList(generateRowData());
  }, [rows, searchResult]);

  const getRecords = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await fetchMemoRecords();
      setRows(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Internal server error.';
      sendNotification({ type: 'error', message: errorMessage });
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  }, [
    fetchMemoRecords,
    setTableLoading,
    setRows,
    setLoading,
    sendNotification,
  ]);

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <MainContainer>
      <ContainerWrapper>
        <SettingHeaderData lastUpdateChanged={lastUpdateChanged} />
        {loading ? (
          <SpinnerContainer>
            <Spinner size="large" styling="primary" />
            <LabelText>{t('Loading')}</LabelText>
          </SpinnerContainer>
        ) : (
          tabList.length > 0 && (
            <Tabs>
              <TabLineDiv />
              <TabList defaultTabId={selectedTab}>
                {tabList.map((item, index) => {
                  const tabTitle = item.name;
                  const tabIcon = item.icon;
                  return (
                    <TabWrapper
                      key={'groupTab' + (index + 1)}
                      className={`groupTab-${index + 1}`}
                      onClick={() => tabOnClick('group' + (index + 1))}
                    >
                      <TabWithIcon
                        tabFor={'group' + (index + 1)}
                        icon={tabIcon}
                        title={tabTitle}
                      />
                    </TabWrapper>
                  );
                })}
              </TabList>
              <Divider />
              {tabConfigs.map((tabs, index) => (
                <GroupTabContent
                  key={'groupContent' + (index + 1)}
                  tabId={'group' + (index + 1)}
                >
                  <Rectangle>
                    <RectangleContentWrapper>
                      <IconWrapper>
                        <Icon icon={tabs.icon} size={29} color="dimmed" />
                      </IconWrapper>
                      <TextBoxWrapper>
                        <ContentTitle1>{tabs.title1}</ContentTitle1>
                        <ContentTitle2>{tabs.title2}</ContentTitle2>
                      </TextBoxWrapper>
                    </RectangleContentWrapper>
                  </Rectangle>
                </GroupTabContent>
              ))}
              {selectedTab === 'group1' && (
                <InputField
                  className={targetFile.length ? 'hasHolidayFile' : ''}
                >
                  <AreaUploadManager
                    ref={uploaderRef}
                    fileIcons={['Add']}
                    title={t('Upload File')}
                    description={t(
                      'To begin, drop your CSV or ZIP files here to continue or click Select File below.'
                    )}
                    selectFilesText={t('Select File')}
                    disabled={targetFileLoadng}
                    onChangeCallback={handleTargetFileChange}
                    clearFilesCallback={handleClearTargetFile}
                    beginUploadCallback={handleBeginUploadTarget}
                    clearFilesText={t('Clear Files')}
                    beginUploadText={t('Begin Upload')}
                    allowedFileTypes={['application/zip', 'text/csv']}
                  />
                </InputField>
              )}
              {selectedTab === 'group2' && (
                <TableContainer>
                  <FilterContainer>
                    <SearchFieldContainer>
                      <ColumnText
                        fontWeight="600"
                        padding="5px 0px"
                        fontSize="12px"
                        family="monorale"
                        line="1.6"
                      >
                        {t('Filter')}:
                      </ColumnText>
                      <FilterInput
                        iconSize={12}
                        paddingTop="0px"
                        type="text"
                        placeholder={t('Search by memo name')}
                        value={searchResult}
                        onChange={onSearchChangeInput}
                      />
                    </SearchFieldContainer>
                    <LinkContainer to="/settings/chubu-probe-integrator/create-memo">
                      <CreateButtonContainer>
                        <CreateButtonWithIcon
                          icon="Add"
                          size="small"
                          position="left"
                        >
                          {t('Create')}
                        </CreateButtonWithIcon>
                      </CreateButtonContainer>
                    </LinkContainer>
                  </FilterContainer>
                  <ResultInfoContainer>
                    <ResultCountLabel>
                      {t('Search Result')} ({rowDataList.length}):
                    </ResultCountLabel>
                    {searchResult !== '' && (
                      <SearchContainer>
                        <FilterListIcon>
                          <Icon icon="Search" color="dimmed" size={12} />
                        </FilterListIcon>
                        <FilterText>{searchResult}</FilterText>
                        <ClearItem onClick={removeSearch}>
                          <Icon icon="CloseCompact" color="dimmed" size={12} />
                        </ClearItem>
                      </SearchContainer>
                    )}
                  </ResultInfoContainer>
                  <InnerTableContainer>
                    <TypeTable
                      columnConfig={columnConfig}
                      rows={rowDataList}
                      emptyTableText={t('No Memo found')}
                      isLoading={tableLoading}
                      loadingText={t('Loading')}
                      hasHeaderGroups
                    />
                  </InnerTableContainer>
                </TableContainer>
              )}
              {selectedTab === 'group3' && (
                <>
                  <ContentTitle3>
                    {t(
                      'Please download the holiday definition file from the Cabinet Office website (www.cao.go.jp/chosei/shukujitsu/gaiyou.html) and upload it here.'
                    )}
                  </ContentTitle3>
                  <InputField
                    className={holidayFile.length ? 'hasHolidayFile' : ''}
                  >
                    <AreaUploadManager
                      ref={uploadHolidayRef}
                      fileIcons={['Add']}
                      title={t('Upload File')}
                      description={t(
                        'Drop your CSV file here to continue or click Select File below.'
                      )}
                      selectFilesText={t('Select File')}
                      allowedFileTypes={['text/csv']}
                      disabled={holidayFileLoadng}
                      onChangeCallback={handleHolidayFileChange}
                      clearFilesCallback={handleClearHolidayFiles}
                      beginUploadCallback={handleBeginUploadHoliday}
                      clearFilesText={t('Clear Files')}
                      beginUploadText={t('Begin Upload')}
                      isHolidayFile
                    />
                  </InputField>
                </>
              )}
            </Tabs>
          )
        )}
      </ContainerWrapper>
    </MainContainer>
  );
};

export default ChubuProbeIntegrator;
