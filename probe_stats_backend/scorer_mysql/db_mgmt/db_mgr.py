#!/usr/bin/python3

import csv
import os
import socket
import requests
import json
import mysql.connector as con
import time
import argparse
import logging
import sys
import docker
import yaml
import platform
import pandas as pd

PROG = 'db_mgr'

# Initialize logging
logger = logging.getLogger(PROG)
f = logging.Formatter('$name $message', style='$')
h = logging.StreamHandler(sys.stdout)
h.setFormatter(f)
logger.addHandler(h)

hostname=None
class DBManager:
    

    def __init__(self, instance_name_, db_name_, user_=None, passwd_=None, network_=None, version_=None, data_=None):
        self.db_name = db_name_
        self.user = user_
        self.passwd = passwd_
        self.collate = 'utf8mb4_unicode_ci'
        self.network_type = network_
        self.db_data = data_
        self.instance_name = instance_name_
        self.version = version_
        print('hostname',hostname)

    def get_rdb_svc_ip(self):
        # RDB Container's IP for the connection.
        if self.network_type == "allow_inside_device":
            port = "3306"
            client = docker.DockerClient()
            container = client.containers.get(f"{self.instance_name}_scorer_container_network.ctr")
            ip_add = container.attrs['NetworkSettings']['Networks']['sdk_bridge_network']['IPAddress']
        elif self.network_type == "allow_all":
            #ip_add = "127.0.0.1"
            fqdn = socket.getfqdn()
            ip_add = f"{fqdn}.local"
            ip_add = f"0.0.0.0"
            stack_data = requests.get(f"http://{hostname}:21001/api/v1/sdk/rdb/{self.instance_name}/all").json()
            print(stack_data)
            if stack_data:
                port = stack_data["data"]["services"]["rdb1"]["port"]
        else:
            logger.info("Unknown network type")
            sys.exit()
        return ip_add, port
        # print("hostname, port",hostname, port)
        # return hostname, port

    def architecture(self):
        arch = platform.machine()
        if arch == "armv7l":
            self.version = "mariadb-10.3.27-armv7l-debain10"
        else:
            self.version = "5.7.42-0ubuntu0.18.04.1"

    def read_table_schemas(self):
        with open(self.schema_file, 'r') as file:
            table_schemas = json.load(file)
        return table_schemas

    def create_instance(self):
        # Check if Instance already present.
        # Get host IP
        fqdn = socket.getfqdn()
        logger.debug(f"fqdn: {fqdn}")
        # hostname = f"{fqdn}.local"
        # hostname = "0.0.0.0"
        # logger.debug(f"hostname: {hostname}")

        get_req_url = "http://" + hostname + ":" + str(21001) + "/api/v1/sdk/rdb/" + self.instance_name
        logger.debug(f"Check if DB Instance is already present.")
        try:
            response = requests.get(get_req_url)
            if 'error' in response.json():
                logger.info(f"Stack not found: {self.instance_name}")
            elif response.json()['status_code'] == '10000':
                logger.info(f"Database {self.instance_name} already exists.")
                return 500 
        except requests.exceptions.HTTPError as errh:
            logger.exception("Http Error:", errh)
        except requests.exceptions.ConnectionError as errc:
            logger.exception("Error Connecting:", errc)
        except requests.exceptions.Timeout as errt:
            logger.exception("Timeout Error:", errt)
        except Exception as exc:
            logger.exception("Exception:", exc)


        # Create or update stack
        put_req_url = "http://" + hostname + ":" + str(21001) + "/api/v1/sdk/rdb/" + self.instance_name + "/all"
        logger.debug(f"{put_req_url}")
        h = {"content-type": "application/json"}

        # Create payload.
        json_data_ = {
            "enabled": True,
            "namespace": "sdk",
            "services":
                {
                    "adminer1":
                        {
                            "enabled": True,
                            "port": "",
                            "type": "adminer"
                        },
                    "rdb1":
                        {
                            "enable_adminer": True,
                            "enabled": True,
                            "host_cache_size": "1024",
                            "instance_id": self.instance_name,
                            "log_retention": "90",
                            "metadata_locks_cache_size": "1024",
                            "network_access": self.network_type,
                            "nickname": self.instance_name,
                            "metabase_rdb": False,
                            "innodb_buffer_pool_size": "1073741824",
                            "root_password": f"{self.passwd}",
                            "root_username": f"{self.user}",
                            "static_ip": "",
                            "type": "mysql",
                            "version": self.version
                        }
                },
            "state": "created",
            "type": "rdb-mysql"
        }
        logger.debug(f"{json_data_}")

        try:
            response = requests.put(put_req_url, json.dumps(json_data_), headers=h)
            logger.debug(response.json())

            if response.json()['status_code'] == '10000':
                logger.info(f"Database {self.instance_name} created successfully.")

        except requests.exceptions.HTTPError as errh:
            logger.exception("Http Error:", errh)
        except requests.exceptions.ConnectionError as errc:
            logger.exception("Error Connecting:", errc)
        except requests.exceptions.Timeout as errt:
            logger.exception("Timeout Error:", errt)
        except Exception as exc:
            logger.exception("Exception:", exc)

    def initialize(self):
        # Create DB inside instance.
        hostname, port = self.get_rdb_svc_ip()
        # logger.info(f"Initializing {self.db_name}!")
        mydb = con.connect(host=hostname, port=port, user=f'{self.user}', passwd=f'{self.passwd}')
        db_status = False
        while not db_status:
            if mydb.is_connected():  
                mycursor = mydb.cursor()
                db_status = True 
                mycursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.db_name} COLLATE {self.collate}")
                logger.info(f"{self.db_name} setup complete!")
            else:
                time.sleep(5) 

    def insert_tables(self):
        hostname, port = self.get_rdb_svc_ip()
        print(f"hostname: {hostname}")
        print(f"port: {port}")
    
        data_dir = "db_data"
        print('data_dir:', data_dir)
    
        list_all_files = os.listdir(data_dir)
        print(list_all_files)
    
        for json_file in list_all_files:
            print(json_file)
            if json_file.endswith(".json"):
                print(f"{json_file}")
                file_path = os.path.join(data_dir, json_file)
                logger.info(f"Processing file: {file_path}")
    
                with open(file_path, 'r') as f:
                    table_schemas = json.load(f)
    
                try:
                    print(hostname, port, self.user, self.passwd, self.db_name)
                    mydb = con.connect(
                        host=hostname,
                        port=port,
                        user=self.user,
                        passwd=self.passwd,
                        database=self.db_name
                    ) 
                    print('1')
                    cursor = mydb.cursor()
                    cursor.execute("SELECT DATABASE();")
                    record = cursor.fetchone()[0]
                    print(f"Connected to database: {record}")
    
                    # Iterate over each table schema
                    for table_name, schema in table_schemas.items():
                        # Create the table
                        cursor.execute(schema)
                        mydb.commit()
                        print(f"Table '{table_name}' created successfully.")
                except con.Error as e:
                    logger.error(f"Error: {e}")
    
                finally:
                    if mydb.is_connected():
                        cursor.close()
                        mydb.close()
                        print("MySQL connection is closed.")



if __name__=="__main__":

    # Setup commandline parameters
    ap = argparse.ArgumentParser(description=PROG + ' parameters:',
                                     formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--debug", action="store_true", dest="debug", default=False,
                        help="enable debug logs")
    ap.add_argument("--stack-name", dest="instance_name", default="CHUBU-PROB-STATS-mysql",
                        help="Instalce/stack which you want to start.")
    ap.add_argument("--db-name", dest="db_name", default="chubu_prob_stats",
                        help="DB name.")
    ap.add_argument("--user", dest="user", default="root",
                        help="RDB stack user.")
    ap.add_argument("--passwd", dest="passwd", default="chubu_prob_stats_mysqldb",
                        help="RDB stack password.")
    ap.add_argument("--nw-type", dest="network", default="allow_all",
                        help='''RDB stack network type.
                        - allow_all
                        - allow_inside_device
                        - deny_all''')
    ap.add_argument("--data", dest="db_data",default="db_data",
                        help="JSON file with DB data to be populate in tables.")
    ap.add_argument("--hostname", dest="hostname",default="localhost",help="JSON file with DB data to be populate in tables.")

    
    args = ap.parse_args()
    
    if args.debug:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    logger.info(f'Starting {PROG} -----------------')

    if args.network not in [ "allow_all", "allow_inside_device", "deny_all" ]:
        logger.info(f"Unknown network operation: {args.network}")
        sys.exit()

    hostname=args.hostname

    DB = DBManager(args.instance_name, args.db_name, args.user, args.passwd, args.network, args.db_data)
    DB.architecture()
    print("arch done")
    db_status = DB.create_instance()
    if db_status != 500:
        logger.debug("Waiting for Instance to be up and running.")
        time.sleep(180)
    print("create instance")
    DB.initialize()

    DB.insert_tables()

# End.
