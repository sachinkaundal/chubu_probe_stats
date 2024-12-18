import threading

class JobStatusManager:
    def __init__(self):
        self.jobs_status = {}
        self.lock = threading.Lock()

    def update_status(self, job_id, status, processed_csv=None):
        """
        Update the status and processed data for a given job ID.
        :param job_id: The ID of the job.
        :param status: The status of the job ('error', 'Pending', 'Completed').
        :param processed_csv: Path of a processed CSV file to add to the 'data_processed' list (optional).
        """
        with self.lock:
            if job_id not in self.jobs_status:
                
                self.jobs_status[job_id] = {'status': 'Pending', 'data_processed': []}

            self.jobs_status[job_id]['status'] = status
            if processed_csv and status == 'Completed':
                print(f'called2  {job_id}')
                self.jobs_status[job_id]['data_processed'].append(processed_csv)
