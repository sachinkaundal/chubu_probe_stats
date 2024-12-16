import axios from 'axios';
const PROTOCOL = process.env.REACT_APP_PROTOCOL;
const BASE_URL = `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_PORT}`;
console.log(
  process.env,
  `${PROTOCOL}://${BASE_URL}/api/target_road_table`,
  'process'
);

const authorizationToken: string =
  localStorage.getItem('user_login_info') || 'invalidToken';
interface RoadRecordRequest {
  mesh_code: string;
  inflow_node: string;
  outflow_node: string;
  memo: string;
}

interface FetchRecordsApiResponse {
  statusCode: number;
  data: RoadRecordRequest[];
  message?: string;
  error?: string;
}

interface AddMemoRecordApiResponse {
  statusCode: number;
  status?: string;
  data?: RoadRecordRequest;
  error?: string;
  message?: string;
}

interface UpdateMemoRecordApiResponse {
  statusCode: number;
  data?: RoadRecordRequest;
  error?: string;
  message?: string;
}

interface DeleteMemoRecordApiResponse {
  statusCode: number;
  message?: string;
  error?: string;
}

interface UploadFileApiResponse {
  statusCode: number;
  job_id?: string;
  message?: string;
  error?: string;
}

interface JobStatusApiResponse {
  statusCode: number;
  job_id: string;
  status?: string;
  result?: {
    processed_files: string[];
    records_processed: number;
    new_records: number;
    updated_records: number;
  };
  message?: string;
  error_details?: string;
  error?: string;
}

interface UploadHolidayFileResponse {
  statusCode: number;
  message?: string;
  error?: string;
}

export const fetchMemoRecords = async (): Promise<RoadRecordRequest[]> => {
  try {
    const response = await axios.get<FetchRecordsApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/target_road_table`,
      {
        headers: {
          'x-access-token': authorizationToken,
        },
      }
    );

    const innerStatusCode = response.data?.statusCode;

    if (response.status === 200 && innerStatusCode === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Unknown error occurred.');
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Internal server error.';
    const status = error?.response?.status;

    console.error('Error fetching records:', {
      message: errorMessage,
      status: status || 'Unknown',
    });

    if (status === 404) {
      throw new Error(errorMessage || 'No road records found.');
    } else if (status === 500) {
      throw new Error(
        errorMessage || 'Failed to fetch the records. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const addMemoRecord = async (
  record: RoadRecordRequest
): Promise<RoadRecordRequest> => {
  try {
    const response = await axios.post<AddMemoRecordApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/target_road_table`,
      record,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': authorizationToken,
        },
      }
    );

    const innerStatusCode = response.data?.statusCode;

    if (response.status === 201 && innerStatusCode === 201) {
      return response.data.data!;
    } else {
      throw new Error(response.data?.message || 'Unknown error occurred.');
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Internal server error.';
    const status = error?.response?.status;

    console.error('Error adding record:', {
      message: errorMessage,
      status: status || 'Unknown',
    });

    if (status === 400) {
      throw new Error(errorMessage || 'Invalid or missing data.');
    } else if (status === 409) {
      throw new Error(
        errorMessage ||
          'A record with the same mesh_code, inflow_node, and outflow_node already exists.'
      );
    } else if (status === 500) {
      throw new Error(
        errorMessage || 'Failed to create the record. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const updateMemoRecord = async (
  record: RoadRecordRequest
): Promise<RoadRecordRequest> => {
  try {
    const response = await axios.put<UpdateMemoRecordApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/target_road_table`,
      record,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': authorizationToken,
        },
      }
    );
    const innerStatusCode = response.data?.statusCode;
    if (response.status === 200 && innerStatusCode === 200) {
      return response.data.data!;
    } else {
      throw new Error(
        response.data?.message ||
          'Unknown error occurred while updating the record.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while updating the record.';
    const status = error?.response?.status;

    console.error('Error updating record:', {
      message: errorMessage,
      status: status || 'Unknown',
    });

    if (status === 404) {
      throw new Error(errorMessage || 'Record not found.');
    } else if (status === 400) {
      throw new Error(errorMessage || 'Invalid data provided.');
    } else if (status === 500) {
      throw new Error(
        errorMessage || 'Failed to update the record. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const deleteMemoRecord = async (
  mesh_code: string,
  inflow_node: string,
  outflow_node: string
): Promise<string> => {
  try {
    const response = await axios.delete<DeleteMemoRecordApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/target_road_table/${mesh_code}/${inflow_node}/${outflow_node}`,
      {
        headers: {
          'x-access-token': authorizationToken,
        },
      }
    );

    const innerStatusCode = response.data?.statusCode;

    if (response.status === 200 && innerStatusCode === 200) {
      return response.data.message || 'Record deleted successfully.';
    } else {
      throw new Error(
        response.data?.message ||
          'Unknown error occurred while deleting the record.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while deleting the record.';
    const status = error?.response?.status;

    console.error('Error deleting record:', {
      message: errorMessage,
      status: status || 'Unknown',
    });

    if (status === 404) {
      throw new Error(errorMessage || 'Record not found.');
    } else if (status === 500) {
      throw new Error(
        errorMessage || 'Failed to delete the record. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<UploadFileApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': authorizationToken,
        },
      }
    );

    const { statusCode, message } = response.data;

    if (response.status === 200 && statusCode === 200) {
      return message || 'File uploaded successfully.';
    } else {
      throw new Error(
        message || 'Unknown error occurred while uploading the file.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while uploading the file.';
    const statusCode = error?.response?.status;

    console.error('Error uploading file:', {
      message: errorMessage,
      status: statusCode || 'Unknown',
    });

    if (statusCode === 400) {
      throw new Error(
        errorMessage ||
          'Invalid or missing file. Upload a valid ZIP or CSV file.'
      );
    } else if (statusCode === 500) {
      throw new Error(
        errorMessage || 'Failed to process the request. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const getJobStatus = async (
  job_id: string
): Promise<string | JobStatusApiResponse['result']> => {
  try {
    const response = await axios.get<JobStatusApiResponse>(
      `${PROTOCOL}://${BASE_URL}/api/upload/${job_id}`,
      {
        headers: {
          'x-access-token': authorizationToken,
        },
      }
    );

    const { statusCode, status, result, message, error_details } =
      response.data;

    if (response.status === 200 && statusCode === 200) {
      switch (status) {
        case 'Pending':
          return `Job ${job_id} is still pending.`;
        case 'Completed':
          return (
            result ||
            `Job ${job_id} completed successfully but no result data was found.`
          );
        case 'Failed':
          throw new Error(
            message ||
              `Job ${job_id} failed due to: ${
                error_details || 'unknown reasons.'
              }`
          );
        default:
          throw new Error(`Unexpected job status: ${status}.`);
      }
    } else {
      throw new Error(
        message || 'Unknown error occurred while fetching the job status.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while fetching the job status.';
    const statusCode = error?.response?.status;

    console.error('Error fetching job status:', {
      message: errorMessage,
      status: statusCode || 'Unknown',
    });

    if (statusCode === 404) {
      throw new Error(errorMessage || `Job ${job_id} not found.`);
    } else if (statusCode === 500) {
      throw new Error(
        errorMessage ||
          'Failed to fetch the job status. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const uploadHolidayFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.put<UploadHolidayFileResponse>(
      `${PROTOCOL}://${BASE_URL}/api/holiday-config/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': authorizationToken,
        },
      }
    );

    const { statusCode, message } = response.data;

    if (response.status === 200 && statusCode === 200) {
      return message || 'Holiday file uploaded successfully.';
    } else {
      throw new Error(
        message || 'Unknown error occurred while uploading the holiday file.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while uploading the holiday file.';
    const statusCode = error?.response?.status;

    console.error('Error uploading holiday file:', {
      message: errorMessage,
      status: statusCode || 'Unknown',
    });

    if (statusCode === 400) {
      throw new Error(
        errorMessage || 'Invalid or missing file. Upload a valid CSV file.'
      );
    } else if (statusCode === 500) {
      throw new Error(errorMessage || 'Internal server error.');
    } else {
      throw new Error(errorMessage);
    }
  }
};

export const fetchCsvUpdateTime = async (): Promise<string> => {
  try {
    const response = await axios.get<{
      lastUpdate: string;
      statusCode: number;
      message: string;
    }>(`${PROTOCOL}://${BASE_URL}/api/last-csv-update`, {
      headers: {
        'x-access-token': authorizationToken,
      },
    });

    const { statusCode, lastUpdate, message } = response.data;

    if (response.status === 200 && statusCode === 200) {
      return lastUpdate;
    } else {
      throw new Error(
        message || 'Unknown error occurred while fetching CSV update time.'
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      'An unexpected error occurred while fetching CSV update time.';
    const statusCode = error?.response?.status;

    console.error('Error fetching CSV update time:', {
      message: errorMessage,
      status: statusCode || 'Unknown',
    });

    if (statusCode === 404) {
      throw new Error(errorMessage || 'No road records found.');
    } else if (statusCode === 500) {
      throw new Error(
        errorMessage || 'Failed to fetch the records. Please try again later.'
      );
    } else {
      throw new Error(errorMessage);
    }
  }
};
