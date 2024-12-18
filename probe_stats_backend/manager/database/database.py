from utils.utils import Utils
from database.database_handler import DatabaseConnectionPool
from mysql.connector import Error
from utils.loggings import Logger 
from utils.config import PROBE_TARGET_ROAD_TABLE, PROBE_AVERAGE_TRAVEL_SPEED_TABLE, PROBE_LAST_UPDATE_TABLE
from datetime import datetime, timezone


class Database:

    def execute_query(self, query, params=None, fetch_results=False):
        """Execute a given SQL query and optionally fetch results."""
        try:
            # Use 'with' for the database connection to ensure it closes automatically
            with DatabaseConnectionPool().get_connection() as db:
                with db.cursor(buffered=True) as cursor:
                    cursor.execute(query, params)
                    db.commit()  # Commit the transaction
                    
                    # Check if we need to fetch results
                    if fetch_results or query.strip().upper().startswith("SELECT") or query.strip().upper() == "SHOW TABLES;":
                        return cursor.fetchall()  # Fetch and return all results for SELECT queries
                    
                    return cursor.rowcount  # Return row count for non-SELECT queries
        except Exception as e:
            Logger().get_logger().error(f"Error executing query: {e}")  # Log the error
            raise  # Re-raise the exception for higher-level handling

            
    def fetch_records_from_table(self, table_name):
        """
        Fetches all records from the specified table.
        """
        valid_tables = {PROBE_AVERAGE_TRAVEL_SPEED_TABLE, PROBE_LAST_UPDATE_TABLE, PROBE_TARGET_ROAD_TABLE}
        if table_name not in valid_tables:
            raise ValueError(f"Invalid table name: {table_name}. Valid tables are: {', '.join(valid_tables)}")

        query = f"SELECT * FROM {table_name};"
        try:
            result = self.execute_query(query)
            return result
        except Exception as e:
            raise RuntimeError(f"{e}")

    def create_probe_average_travel_speed_table(self):
        """Create the Probe_Average_Travel_Speed table in the database."""
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {PROBE_AVERAGE_TRAVEL_SPEED_TABLE} (
            mesh_code VARCHAR(32),
            inflow_node VARCHAR(32),
            outflow_node VARCHAR(32),
            yearmonth CHAR(6),
            holiday_bit INT(10),
            day_bit INT(10),
            link_length INT(5),
            travel_time_00 FLOAT(8),
            travel_time_01 FLOAT(8),
            travel_time_02 FLOAT(8),
            travel_time_03 FLOAT(8),
            travel_time_04 FLOAT(8),
            travel_time_05 FLOAT(8),
            travel_time_06 FLOAT(8),
            travel_time_07 FLOAT(8),
            travel_time_08 FLOAT(8),
            travel_time_09 FLOAT(8),
            travel_time_10 FLOAT(8),
            travel_time_11 FLOAT(8),
            travel_time_12 FLOAT(8),
            travel_time_13 FLOAT(8),
            travel_time_14 FLOAT(8),
            travel_time_15 FLOAT(8),
            travel_time_16 FLOAT(8),
            travel_time_17 FLOAT(8),
            travel_time_18 FLOAT(8),
            travel_time_19 FLOAT(8),
            travel_time_20 FLOAT(8),
            travel_time_21 FLOAT(8),
            travel_time_22 FLOAT(8),
            travel_time_23 FLOAT(8),
            travel_speed_00 FLOAT(5),
            travel_speed_01 FLOAT(5),
            travel_speed_02 FLOAT(5),
            travel_speed_03 FLOAT(5),
            travel_speed_04 FLOAT(5),
            travel_speed_05 FLOAT(5),
            travel_speed_06 FLOAT(5),
            travel_speed_07 FLOAT(5),
            travel_speed_08 FLOAT(5),
            travel_speed_09 FLOAT(5),
            travel_speed_10 FLOAT(5),
            travel_speed_11 FLOAT(5),
            travel_speed_12 FLOAT(5),
            travel_speed_13 FLOAT(5),
            travel_speed_14 FLOAT(5),
            travel_speed_15 FLOAT(5),
            travel_speed_16 FLOAT(5),
            travel_speed_17 FLOAT(5),
            travel_speed_18 FLOAT(5),
            travel_speed_19 FLOAT(5),
            travel_speed_20 FLOAT(5),
            travel_speed_21 FLOAT(5),
            travel_speed_22 FLOAT(5),
            travel_speed_23 FLOAT(5),
            travel_num_00 INT(8),
            travel_num_01 INT(8),
            travel_num_02 INT(8),
            travel_num_03 INT(8),
            travel_num_04 INT(8),
            travel_num_05 INT(8),
            travel_num_06 INT(8),
            travel_num_07 INT(8),
            travel_num_08 INT(8),
            travel_num_09 INT(8),
            travel_num_10 INT(8),
            travel_num_11 INT(8),
            travel_num_12 INT(8),
            travel_num_13 INT(8),
            travel_num_14 INT(8),
            travel_num_15 INT(8),
            travel_num_16 INT(8),
            travel_num_17 INT(8),
            travel_num_18 INT(8),
            travel_num_19 INT(8),
            travel_num_20 INT(8),
            travel_num_21 INT(8),
            travel_num_22 INT(8),
            travel_num_23 INT(8),
            INDEX idx_mesh_code (mesh_code),
            INDEX idx_inflow_node (inflow_node),
            INDEX idx_outflow_node (outflow_node),
            INDEX idx_yearmonth (yearmonth)
        );
        """
        self.execute_query(create_table_query)

    def create_probe_target_road_table(self):
        """Create the Probe_Target_Road table in the database."""
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {PROBE_TARGET_ROAD_TABLE} (
            mesh_code VARCHAR(32),
            inflow_node VARCHAR(32),
            outflow_node VARCHAR(32),
            memo VARCHAR(128),
            INDEX idx_mesh_code (mesh_code),
            INDEX idx_inflow_node (inflow_node),
            INDEX idx_outflow_node (outflow_node)
        );
        """
        self.execute_query(create_table_query)


    def create_probe_last_update_table(self):
        """Create the Probe_Last_Update table in the database."""
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {PROBE_LAST_UPDATE_TABLE} (
            last_update DATETIME
        );
        """
        self.execute_query(create_table_query)

    def create_table(self):
        """Create all required tables in the database if they do not already exist."""
        existing_tables = self.list_tables()

        # Define the required tables
        required_tables = {
            PROBE_AVERAGE_TRAVEL_SPEED_TABLE: self.create_probe_average_travel_speed_table,
            PROBE_TARGET_ROAD_TABLE: self.create_probe_target_road_table,
            PROBE_LAST_UPDATE_TABLE: self.create_probe_last_update_table,
        }

        # Check and create missing tables
        for table_name, create_function in required_tables.items():
            if table_name not in existing_tables:
                create_function()
            else:
                print(f"Table already exists: {table_name}")

    def list_tables(self):
        """List all tables in the database."""
        query = "SHOW TABLES;"
        tables = self.execute_query(query)
        print("Tables in the database:")
        existing_tables = set()
        if tables is not None:
            for table in tables:
                table_name = table[0]  # Each table name is in the first column
                print(table_name)
                existing_tables.add(table_name)
        return existing_tables

    def add_target_road(self, mesh_code, inflow_node, outflow_node, memo):
        """Add a new record to the target road table if the combination is unique."""
        
        # Check for existing record with the same combination
        check_query = f"""
            SELECT COUNT(*) FROM {PROBE_TARGET_ROAD_TABLE} 
            WHERE mesh_code = %s AND inflow_node = %s AND outflow_node = %s;
        """
        existing_count = self.execute_query(check_query, (mesh_code, inflow_node, outflow_node))
        
        if existing_count[0][0] > 0:
            raise ValueError("A record with the same mesh_code, inflow_node, and outflow_node already exists.")
        
        # Proceed to insert if no existing record
        insert_query = f"""
            INSERT INTO {PROBE_TARGET_ROAD_TABLE} (mesh_code, inflow_node, outflow_node, memo)
            VALUES (%s, %s, %s, %s);
        """
        self.execute_query(insert_query, (mesh_code, inflow_node, outflow_node, memo))


    def update_target_road(self, mesh_code, inflow_node, outflow_node, road_name):
        """Update an existing record in the target road table."""
        update_query = f"""
            UPDATE {PROBE_TARGET_ROAD_TABLE}
            SET memo = %s
            WHERE mesh_code = %s AND inflow_node = %s AND outflow_node = %s;
        """
        self.execute_query(update_query, (road_name, mesh_code, inflow_node, outflow_node))

    def fetch_target_road(self, mesh_code, inflow_node, outflow_node):
        """Fetch a record from the target road table."""
        select_query = f"""
            SELECT * FROM {PROBE_TARGET_ROAD_TABLE} 
            WHERE mesh_code = %s AND inflow_node = %s AND outflow_node = %s;
        """
        return self.execute_query(select_query, (mesh_code, inflow_node, outflow_node))

    def fetch_roads(self):
        """Fetch a record from the target road table."""
        select_query = f"SELECT * FROM {PROBE_TARGET_ROAD_TABLE};"

        try:
            db_data = self.execute_query(select_query)
            
            # Check if any records were found
            if db_data:
                keys = ['mesh_code', 'inflow_node', 'outflow_node', 'memo']
                roads_list = [dict(zip(keys, record)) for record in db_data]
                response = {
                    "statusCode": 200,
                    "data": roads_list
                }
                return response
            
            # No records found
            return {
                "statusCode": 404,
                "message": "No records found."
            }
        
        except Exception as e:
            # Handle any exceptions that occur during the query execution
            return {
                "statusCode": 500,
                "message": "Failed to fetch the records. Please try again later."
            }


    def get_csv_last_modified_time(self):
        """Fetch time when the CSV is updated/modified."""

        select_query = f"SELECT last_update FROM {PROBE_LAST_UPDATE_TABLE};"
        try:
            db_data = self.execute_query(select_query)
            if len(db_data) > 0:
                last_update_time = db_data[0][0]  # Extract the datetime object

                # Check if last_update_time is timezone-aware; if not, assume it's in UTC
                if last_update_time.tzinfo is None:
                    last_update_time = last_update_time.replace(tzinfo=timezone.utc)

                # Convert to local time
                local_time = last_update_time.astimezone()  # Converts to local timezone
                formatted_local_time = local_time.strftime('%Y-%m-%d %H:%M:%S')

                # Convert UTC time to epoch timestamp
                epoch_time = int(last_update_time.timestamp())
                return {
                    "statusCode": 200,
                    "lastUpdate": formatted_local_time,
                    "epochTime": epoch_time,
                }
            else:
                return {
                    "statusCode": 404,
                    "message": "No records found in the table. It may be empty or no updates have been recorded yet."
                    }
        
        except Exception as e:
            # Handle any exceptions that occur during the query execution
            return {
                "statusCode": 500,
                "message": "An error occurred while fetching the last update time. Please try again later."
            }

    def delete_target_road(self, mesh_code, inflow_node, outflow_node):
        """Delete a specific record from the target road table."""
        delete_query = f"""
            DELETE FROM {PROBE_TARGET_ROAD_TABLE}
            WHERE mesh_code = %s AND inflow_node = %s AND outflow_node = %s;
        """
        self.execute_query(delete_query, (mesh_code, inflow_node, outflow_node))

    def fetch_probe_road_records(self):
        """Fetch all records from the Probe_Target_Road table."""
        try:
            return self.fetch_records_from_table(PROBE_TARGET_ROAD_TABLE)
        except Exception as e:
            raise RuntimeError(f"Error fetching Probe_Target_Road records: {e}")

        
    def add_new_record_probe_average_travel_speed(self, record, mesh_code, inflow_node, outflow_node, year_month_only, holiday_bitmask, current_day_value):
        """Insert a new record into Probe_Average_Travel_Speed."""
        try:
            placeholders = (
                mesh_code,
                inflow_node,
                outflow_node,
                year_month_only,
                current_day_value,
                record[5] if record[5] != '' else None,
                holiday_bitmask,  
                *(Utils.safe_float(value) for value in record[20:44]),
                *(Utils.safe_float(value) for value in record[44:68]),
                *(Utils.safe_int(value) for value in record[68:92]),
            )

            print(len(placeholders))
            print("------------------------------")

            sql_query = f"""
                INSERT INTO {PROBE_AVERAGE_TRAVEL_SPEED_TABLE} (
                    mesh_code, inflow_node, outflow_node, yearmonth, day_bit, link_length, holiday_bit,
                    travel_time_00, travel_time_01, travel_time_02, travel_time_03, travel_time_04,
                    travel_time_05, travel_time_06, travel_time_07, travel_time_08, travel_time_09,
                    travel_time_10, travel_time_11, travel_time_12, travel_time_13, travel_time_14,
                    travel_time_15, travel_time_16, travel_time_17, travel_time_18, travel_time_19,
                    travel_time_20, travel_time_21, travel_time_22, travel_time_23,
                    travel_speed_00, travel_speed_01, travel_speed_02, travel_speed_03,
                    travel_speed_04, travel_speed_05, travel_speed_06, travel_speed_07,
                    travel_speed_08, travel_speed_09, travel_speed_10, travel_speed_11,
                    travel_speed_12, travel_speed_13, travel_speed_14, travel_speed_15,
                    travel_speed_16, travel_speed_17, travel_speed_18, travel_speed_19,
                    travel_speed_20, travel_speed_21, travel_speed_22, travel_speed_23,
                    travel_num_00, travel_num_01, travel_num_02, travel_num_03,
                    travel_num_04, travel_num_05, travel_num_06, travel_num_07,
                    travel_num_08, travel_num_09, travel_num_10, travel_num_11,
                    travel_num_12, travel_num_13, travel_num_14, travel_num_15,
                    travel_num_16, travel_num_17, travel_num_18, travel_num_19,
                    travel_num_20, travel_num_21, travel_num_22, travel_num_23
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s
                );
            """ 
            self.execute_query(sql_query, placeholders)
        except Exception as e:
            raise RuntimeError(f"Error inserting new record: {e}")



    def update_record_probe_average_travel_speed(self, mesh_code, inflow_node, outflow_node, year_month_only, holiday_bitmask, updated_day,link_length, average_travel_time,average_travel_speed, average_vehicle_numbers):
        # Prepare the placeholders for the SQL query
        print(f'updated_day: {updated_day}')
        placeholders = (
            link_length if link_length != '' else None,  # link_length
            holiday_bitmask,  # holiday_bit
            updated_day,
            *average_travel_time,  # travel times
            *average_travel_speed,  # travel speeds
            *average_vehicle_numbers,  # vehicle numbers
            mesh_code,  # Unique identifier part 1
            inflow_node,  # Unique identifier part 2
            outflow_node,  # Unique identifier part 3
            year_month_only  # Unique identifier part 4
        )
        

        sql_query = f"""
            UPDATE {PROBE_AVERAGE_TRAVEL_SPEED_TABLE}
            SET 
                link_length = %s,
                holiday_bit = %s,
                day_bit = %s,
                travel_time_00 = %s, travel_time_01 = %s, travel_time_02 = %s, travel_time_03 = %s,
                travel_time_04 = %s, travel_time_05 = %s, travel_time_06 = %s, travel_time_07 = %s,
                travel_time_08 = %s, travel_time_09 = %s, travel_time_10 = %s, travel_time_11 = %s,
                travel_time_12 = %s, travel_time_13 = %s, travel_time_14 = %s, travel_time_15 = %s,
                travel_time_16 = %s, travel_time_17 = %s, travel_time_18 = %s, travel_time_19 = %s,
                travel_time_20 = %s, travel_time_21 = %s, travel_time_22 = %s, travel_time_23 = %s,
                travel_speed_00 = %s, travel_speed_01 = %s, travel_speed_02 = %s, travel_speed_03 = %s,
                travel_speed_04 = %s, travel_speed_05 = %s, travel_speed_06 = %s, travel_speed_07 = %s,
                travel_speed_08 = %s, travel_speed_09 = %s, travel_speed_10 = %s, travel_speed_11 = %s,
                travel_speed_12 = %s, travel_speed_13 = %s, travel_speed_14 = %s, travel_speed_15 = %s,
                travel_speed_16 = %s, travel_speed_17 = %s, travel_speed_18 = %s, travel_speed_19 = %s,
                travel_speed_20 = %s, travel_speed_21 = %s, travel_speed_22 = %s, travel_speed_23 = %s,
                travel_num_00 = %s, travel_num_01 = %s, travel_num_02 = %s, travel_num_03 = %s,
                travel_num_04 = %s, travel_num_05 = %s, travel_num_06 = %s, travel_num_07 = %s,
                travel_num_08 = %s, travel_num_09 = %s, travel_num_10 = %s, travel_num_11 = %s,
                travel_num_12 = %s, travel_num_13 = %s, travel_num_14 = %s, travel_num_15 = %s,
                travel_num_16 = %s, travel_num_17 = %s, travel_num_18 = %s, travel_num_19 = %s,
                travel_num_20 = %s, travel_num_21 = %s, travel_num_22 = %s, travel_num_23 = %s                
            WHERE mesh_code = %s AND inflow_node = %s AND outflow_node = %s AND yearmonth = %s
        """
        try:
            result = self.execute_query(sql_query, placeholders)
            return result
        except Exception as e:
            print(f"Error updating data in table Probe_Average_Travel_Speed: {e}")
            return None

    def update_probe_last_update(self, current_date_time):
        try:
            # Delete previous entry
            self.execute_query(f"DELETE FROM {PROBE_LAST_UPDATE_TABLE};")
            
            # Insert the new datetime
            insert_query = f"INSERT INTO {PROBE_LAST_UPDATE_TABLE} (last_update) VALUES ('{current_date_time}');"
            self.execute_query(insert_query)
            
            return "Updated datetime"
        except Exception as e:
            print(f"Error updating data in table Probe_Last_Update: {e}")
            return None

