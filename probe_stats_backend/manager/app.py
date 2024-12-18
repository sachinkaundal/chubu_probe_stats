import os
from flask import Flask, request, jsonify
from job_manager.file_processor import FileProcessor
from job_manager.job_status_manager import JobStatusManager
from database.database import Database
from utils.utils import Utils 
from werkzeug.utils import secure_filename
from flask_cors import CORS
from utils.config import TMP_DIR


app = Flask(__name__)
CORS(app)
# Initialize the job status manager and request handler
job_status_manager = JobStatusManager()
request_handler = FileProcessor()
database = Database()
# database.create_table()



@app.route('/api/upload', methods=['POST'])
def handle_chubu_probe():
    """
    Handle file uploads, saving them temporarily in `/tmp`, and processing CSV or ZIP files.
    """
    try:
        # Retrieve the uploaded file
        uploaded_file = request.files.get('file')
        if not uploaded_file or not uploaded_file.filename:
            return {"statusCode": 404, "message": "No file selected. Please upload a valid ZIP or CSV file."}

        # Secure the filename
        filename = secure_filename(uploaded_file.filename)

        # Validate the file type
        if not Utils.validate_csv_or_zip(filename):
            return {"statusCode": 400, "error": f"Invalid file type: {filename}. Only CSV and ZIP files are allowed."}

        # Save the file to the Linux temporary directory
        temp_dir = TMP_DIR
        os.makedirs(temp_dir, exist_ok=True)
        saved_file_path = os.path.join(temp_dir, filename)
        uploaded_file.save(saved_file_path)
        print(saved_file_path)
        try:
            # Process the file
            result = request_handler.process_file(saved_file_path)
        finally:
            # Ensure the temporary file is deleted after processing
            if os.path.exists(saved_file_path):
                os.remove(saved_file_path)
        print(result['statusCode'])
        return jsonify({"statusCode": result['statusCode'], "message" : result['message']}), result['statusCode']  

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"statusCode": 500, "message": "An unexpected error occurred. Please try again."}), 500
      


@app.route('/api/upload/<job_id>', methods=['GET'])
def check_status(job_id):
    """
        Endpoint to check the status of a processing job.

        Args:   job_id (str): The ID of the job to check.

        Returns: JSON response with the status or result of the job.
    """
    try:
        job_info = job_status_manager.get_status(job_id)

        if not job_info:
            return jsonify({"statusCode": 404,"job_id" : job_id, "message": "Job ID not found."}), 404 

        if job_info.get('status') == 'Pending':
            return jsonify({"statusCode": 200, "job_id": job_id, "statusCode" : 'Pending'}), 200 

        if job_info.get('status') == 'Completed':
            return  jsonify({
                "statusCode": 200, 
                "job_id": job_id,
                "data_processed": job_info.get('data_processed'),
                "count": len(job_info.get('data_processed', [])),
            }), 200

        return jsonify({"statusCode": 500, "job_id": job_id, "error" : 'Internal Server Error Occurred.'}), 500 

    except ValueError as ve:
        app.logger.error(f"ValueError while checking job status: {ve}")
        return jsonify({"statusCode": 400, "error" : str(ve)}), 400 

    except Exception as e:
        app.logger.error(f"Unexpected error while checking job status: {e}")
        return jsonify({"statusCode": 500, "error" : 'Internal Server Error Occurred.'}), 500
    

@app.route('/api/target_road_table/', methods=['POST'])
def add_target_road():
    """Endpoint to add a new record to the target road table."""
    try:
        data = request.json
        if not data:
            return jsonify({"statusCode": 400, "message": "Input data not found."}), 404

        mesh_code = data['mesh_code']
        inflow_node = data['inflow_node']
        outflow_node = data['outflow_node']
        memo = data['memo']
        if not Utils.valid_data(mesh_code):
            return jsonify({"statusCode": 400, "message": "Invalid mesh code. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if not Utils.valid_data(inflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid inflow node. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if not Utils.valid_data(outflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid outflow node. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if len(memo) > 128:
            return jsonify({"statusCode": 400, "message": "Your memo is too long. Please keep it under 128 characters."}), 400

            
        # Attempt to add the target road record
        database.add_target_road(mesh_code, inflow_node, outflow_node, memo)

        return jsonify({"statusCode": 201, "message": "Success", "data": data}), 201

    except ValueError as ve:
        # Handle duplicate entry error specifically
        app.logger.warning(f"Duplicate entry error: {ve}")
        return jsonify({"statusCode": 409, "message": str(ve)}), 409  # HTTP 409 Conflict

    except Exception as e:
        # Log and return a generic server error
        return jsonify({"statusCode": 500, "message": "Failed to create the record. Please try again later."}), 500
    


@app.route('/api/target_road_table/', methods=['PUT'])
def update_target_road():
    """Endpoint to update an existing record in the target road table by mesh_code."""
    try:
        data = request.json
        if not data:
            return jsonify({"statusCode": 400, "message": "Input data not found."}), 404
        
        mesh_code = data['mesh_code']
        inflow_node = data['inflow_node']
        outflow_node = data['outflow_node']
        memo = data['memo']
        
        if not Utils.valid_data(mesh_code):
            return jsonify({"statusCode": 400, "message": "Invalid mesh code. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if not Utils.valid_data(inflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid inflow node. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if not Utils.valid_data(outflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid outflow node. It must not be empty, should not contain spaces, and must be 6 characters or fewer."}), 400
        if len(memo) > 128:
            return jsonify({"statusCode": 400, "message": "Your memo is too long. Please keep it under 128 characters."}), 400

        record = database.fetch_target_road(mesh_code, inflow_node, outflow_node)

        if not record:
            return jsonify({"statusCode": 404, "message": "Record not found."}), 404

        database.update_target_road(mesh_code, inflow_node, outflow_node, memo)

        return jsonify({"statusCode": 200, "data": data}), 200

    except Exception as e:
        app.logger.error(f"Error while updating record: {e}")
        return jsonify({"statusCode": 500, "message": "Failed to update the road name. Please try again later."}), 500
    

@app.route('/api/target_road_table/<mesh_code>/<inflow_node>/<outflow_node>', methods=['DELETE'])
def delete_target_road(mesh_code, inflow_node, outflow_node):
    """Endpoint to delete a specific record uniquely identified by mesh_code, inflow_node, and outflow_node."""
    try:

        if not Utils.valid_data(mesh_code):
            return jsonify({"statusCode": 400, "message": "Invalid Mesh Code value provided."}), 400
        if not Utils.valid_data(inflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid Inflow value provided."}), 400
        if not Utils.valid_data(outflow_node):
            return jsonify({"statusCode": 400, "message": "Invalid Outflow value provided."}), 400

        record = database.fetch_target_road(mesh_code, inflow_node, outflow_node)

        if not record:
            return jsonify({"statusCode": 404, "message": "Record not found."}), 404

        database.delete_target_road(mesh_code, inflow_node, outflow_node)

        return jsonify({"statusCode": 200, "message": "Record deleted successfully."}), 200

    except Exception as e:
        app.logger.error(f"Error while deleting record: {e}")
        return jsonify({"statusCode": 500, "message": "Failed to delete the record. Please try again later."}), 500
    

@app.route('/api/target_road_table', methods=['GET'])
def get_roads_list():
    """Endpoint to fetch the records list."""
    try:
        # Call the fetch_roads method, which already handles success and error responses
        response = database.fetch_roads()
        return jsonify(response), response['statusCode']

    except Exception as e:
        app.logger.error(f"Unexpected error while fetching records: {e}")
        return jsonify({"statusCode": 500, "message": "Failed to fetch the records. Please try again later."}), 500
    


@app.route('/api/last-csv-update', methods=['GET'])
def get_last_updated_csv_time():
    """Endpoint to fetch the last modified time of the CSV file."""
    try:
        # Call the method to get the last modified time of the CSV file
        last_modified_time = database.get_csv_last_modified_time()
        return jsonify(last_modified_time), last_modified_time['statusCode'] 

    except Exception as e:
        app.logger.error(f"Unexpected error while fetching last updated time: {e}")
        return jsonify({"statusCode": 500, "message": "Failed to fetch the last updated time. Please try again later."}), 500


@app.route('/api/holiday-config/upload', methods=['PUT'])
def upload_holiday_csv_file():
    """
        Handle file upload for processing.

        Returns: JSON response indicating success or failure of the upload.
    """
    try:
        # Check if a file is present in the request
        if 'file' not in request.files:
            return jsonify({"statusCode": 400, "message": "Invalid or missing file. Upload a valid CSV file."}), 400
        file = request.files['file']
        response = request_handler.update_holiday_configuration(file)
        return jsonify(response)

    except Exception as e:
        app.logger.error(f"Unexpected error during file upload: {e}")
        return jsonify({"statusCode": 500, "error": "Internal Server Error Occurred."}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0',  port=5000)

