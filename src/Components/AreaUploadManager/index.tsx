import React, {
  forwardRef,
  Fragment,
  ReactElement,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Button,
  ButtonWithLoading,
  DropArea,
  InputFileButton,
} from 'scorer-ui-kit';
import BigIconsSummary from './BigIconsSummary';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
`;

const StyledDropArea = styled(DropArea)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

const InputButtonWrapper = styled.div`
  z-index: 99;
  margin-top: 20px;
  display: flex;
  gap: 20px;
`;

const FilesUploadGroup = styled.div<{ height?: string; hasFiles: boolean }>`
  padding: ${({ hasFiles }) => (hasFiles ? '26px 0 20px 0' : '65px 0 42px 0')};
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  background-color: var(--grey-4);
  position: relative;
`;

const Title = styled.div`
  color: var(--grey-11);
  font-size: 20px;
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 2.14;
  text-align: center;
  color: var(--grey-10);
  margin-top: 10px;
  max-width: 386px;
`;

const SelectedFile = styled.div`
  font-size: 14px;
  text-align: center;
  line-height: 2.14;
  color: var(--grey-10);
  margin-top: 10px;
  max-width: 386px;
  span {
    font-size: 16px;
    font-weight: 600;
  }
`;
const LoadingButton = styled(ButtonWithLoading)<{ loading?: boolean }>`
  > div > div:first-child {
    padding: ${({ loading }) => (loading ? '0 8px' : '0px')};
  }
`;

const getUpdateFiles = (
  newFiles: FileList,
  files: FileList | null,
  allowedFileTypes?: string[]
): IUploadedFiles => {
  const newFilesTransfer = new DataTransfer();
  const rejectedFilesTransfer = new DataTransfer();

  if (newFiles.length > 0) {
    const file = newFiles[0];
    const isCorrectType =
      !allowedFileTypes ||
      allowedFileTypes.length === 0 ||
      allowedFileTypes.includes(file.type);

    if (isCorrectType) {
      newFilesTransfer.items.add(file);
    } else {
      rejectedFilesTransfer.items.add(file);
    }
  }

  if (files === null) {
    return {
      goodFiles: newFilesTransfer.files,
      rejectedFiles: rejectedFilesTransfer.files,
    };
  }

  const updatedFilesTransfer = new DataTransfer();
  const previousFile = files.length > 0 ? files[0] : null;

  if (newFilesTransfer.files.length > 0) {
    updatedFilesTransfer.items.add(newFilesTransfer.files[0]);
  } else if (previousFile) {
    updatedFilesTransfer.items.add(previousFile);
  }

  return {
    goodFiles: updatedFilesTransfer.files,
    rejectedFiles: rejectedFilesTransfer.files,
  };
};

interface IUploadedFiles {
  goodFiles: FileList;
  rejectedFiles: FileList;
}

interface IAreaUploaderManager {
  title?: string;
  description?: string;
  fileIcons?: string[];
  selectFilesText?: string;
  clearFilesText?: string;
  beginUploadText?: string;
  allowedFileTypes?: string[];
  customComponent?: ReactElement;
  isHolidayFile?: boolean;
  disabled?: boolean;
  onChangeCallback?: (goodFiles: FileList, rejectedFiles: FileList) => void;
  clearFilesCallback?: () => void;
  beginUploadCallback?: () => void;
}

const AreaUploadManager = forwardRef(
  (
    {
      title = 'Select Files',
      description,
      fileIcons,
      disabled = false,
      selectFilesText = 'Select Files',
      clearFilesText = 'Clear Files',
      beginUploadText = 'Begin Upload',
      allowedFileTypes,
      customComponent,
      onChangeCallback = () => {},
      clearFilesCallback = () => {},
      beginUploadCallback = () => {},
      isHolidayFile = false,
    }: IAreaUploaderManager,
    ref
  ) => {
    const [files, setFiles] = useState<FileList | null>(null);
    const { t } = useTranslation(['CommonDict']);
    const handleFiles = useCallback(
      (newFiles: FileList) => {
        if (newFiles === null) {
          return;
        }
        const { goodFiles, rejectedFiles } = getUpdateFiles(
          newFiles,
          files,
          allowedFileTypes
        );
        setFiles(goodFiles);
        onChangeCallback(goodFiles, rejectedFiles);
      },
      [files, allowedFileTypes, onChangeCallback]
    );

    clearFilesCallback = useCallback(() => {
      setFiles(null);
    }, [clearFilesCallback]);

    useImperativeHandle(ref, () => ({
      clearFilesCallback,
    }));

    return (
      <Container>
        <FilesUploadGroup hasFiles={files !== null}>
          <StyledDropArea dropCallback={handleFiles} />
          {customComponent ? (
            customComponent
          ) : (
            <Fragment>
              {fileIcons && <BigIconsSummary icons={fileIcons} />}
              <Title>{title}</Title>
              {files === null ? (
                <Description>{description}</Description>
              ) : (
                <SelectedFile>
                  {isHolidayFile ? t('Holiday') : t('Target')} {t('file')}{' '}
                  <span>{files[0]?.name}</span> {t('is ready to upload!')}
                </SelectedFile>
              )}
            </Fragment>
          )}

          <InputButtonWrapper>
            {files === null ? (
              <InputFileButton
                buttonSize="small"
                text={selectFilesText}
                inputCallback={handleFiles}
                multiple
                buttonDesign={files !== null ? 'secondary' : 'primary'}
                accept={allowedFileTypes?.join(', ')}
              />
            ) : (
              <Fragment>
                <LoadingButton
                  size="small"
                  onClick={beginUploadCallback}
                  design="primary"
                  disabled={disabled}
                  loading={disabled}
                >
                  {beginUploadText}
                </LoadingButton>
                <Button
                  size="normal"
                  onClick={clearFilesCallback}
                  design="secondary"
                  disabled={disabled}
                >
                  {clearFilesText}
                </Button>
              </Fragment>
            )}
          </InputButtonWrapper>
        </FilesUploadGroup>
      </Container>
    );
  }
);

export default AreaUploadManager;
