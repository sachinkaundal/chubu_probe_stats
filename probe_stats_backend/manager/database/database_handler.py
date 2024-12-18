# import mysql.connector
# from mysql.connector import Error
# from utils.config import DB_USER, DB_HOST, DB_PASSWORD, DB_NAME  # Import credentials

# class DatabaseConnection:
#     """Centralized Database Connection Manager."""
#     _instance = None  # Singleton instance

#     def __new__(cls):
#         if cls._instance is None:
#             cls._instance = super(DatabaseConnection, cls).__new__(cls)
#             cls._instance.init()
#         return cls._instance

#     def init(self):
#         """Initialize database configuration."""
#         self.user = DB_USER
#         self.host = DB_HOST
#         self.password = DB_PASSWORD
#         self.database = DB_NAME
#         self.connection = None
#         self.create_connection()

#         if not self.database_exists():
#             raise ValueError(f"Database '{self.database}' does not exist.")

#     def create_connection(self):
#         """Create a connection to the MySQL database."""
#         try:
#             self.connection = mysql.connector.connect(
#                 user=self.user,
#                 host=self.host,
#                 passwd=self.password,
#                 database=self.database
#             )
#             if self.connection.is_connected():
#                 print("Successfully connected to the database.")
#         except Error as e:
#             print(f"Error connecting to MySQL: {e}")
#             self.connection = None

#     def get_connection(self):
#         """Get the existing connection."""
#         if not self.connection or not self.connection.is_connected():
#             print("Connection lost. Reconnecting...")
#             self.create_connection()
#         return self.connection

#     def close_connection(self):
#         """Close the database connection."""
#         if self.connection and self.connection.is_connected():
#             self.connection.close()
#             print("Database connection closed.")

#     def database_exists(self):
#         """Check if the specified database exists."""
#         try:
#             cursor = self.get_connection().cursor()
#             cursor.execute(f"SHOW DATABASES LIKE '{self.database}'")
#             result = cursor.fetchone()
#             if result:
#                 print(f"Database '{self.database}' exists.")
#                 return True
#             else:
#                 print(f"Database '{self.database}' does not exist.")
#                 return False
#         except Error as e:
#             print(f"Error checking database existence: {e}")
#             return False
#         finally:
#             if cursor:
#                 cursor.close()

import mysql.connector
from mysql.connector import Error, pooling
from utils.config import DB_USER, DB_HOST, DB_PASSWORD, DB_NAME  # Import credentials
import logging


class DatabaseConnectionPool:
    """Centralized Database Connection Pool Manager."""
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnectionPool, cls).__new__(cls)
            cls._instance.init()
        return cls._instance

    def init(self):
        """Initialize database pool configuration."""
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=10,  # Adjust the pool size based on concurrency requirements
                pool_reset_session=True,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                database=DB_NAME,
            )
            print("Connection pool created successfully.")
        except Error as e:
            logging.error(f"Error creating connection pool: {e}")
            raise

    def get_connection(self):
        """Get a connection from the pool."""
        try:
            return self.pool.get_connection()
        except Error as e:
            logging.error(f"Error getting connection from pool: {e}")
            raise
