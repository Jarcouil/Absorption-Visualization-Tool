import sys
import mysql.connector
import os
from dotenv import load_dotenv

# DAD FILE
# Ieder absorptie-meetpunt = 3 bytes (b1,b2,b3)
# Absorptie = b1 + 256*b2 + 256*256*b3
# Header = 49658 bytes (BOUNDARY + 16 bytes)

c0 = -0.640000000000001
c1 = 0.000000250000000000135

# connect to the database
def connect_to_db():
    try:
        return mysql.connector.connect(
            host=os.environ.get('HOST'),
            user=os.environ.get('DBUSER'),
            password=os.environ.get('PASSWORD'),
            database=os.environ.get('DB')
        )
    except mysql.connector.Error as e:
        print(e)

# Return SQL string for inserting data
def return_sql_string(table_name):
    sql_string = "INSERT INTO `" + table_name + "` (`timestamp`, "
    for i in range(ammount_of_columns):
        sql_string += "`" + str(i+min_wavelength) + "`, "
    sql_string = sql_string[:-2]
    sql_string += ") VALUES ("
    for i in range(ammount_of_columns + 1):
        sql_string += "%s, "
    sql_string = sql_string[:-2] + ")"

    return sql_string

# calculate the absorption
def get_absorption(long_int):
    absorption = c0 + c1 * long_int
    if (absorption < 0):
        absorption = 0
    return str(absorption)

# get the content of the file in a list
def get_listed_file(file_name):
    with open(file_name, "rb") as file:
        byte = file.read(1)
        letters = []

        while byte:
            byte = file.read(1)
            letters.append(str(byte)[2:-1])

    file.close()
    return(letters)

# return the byte where header of the file ends
def get_header_size(file_name):
    listed_file = get_listed_file(file_name)

    for i in range(len(listed_file)):
        if listed_file[i] == 'B' and listed_file[i+1] == 'o' and listed_file[i+2] == 'u' and listed_file[i+3] == 'n' and listed_file[i+4] == 'd' and listed_file[i+5] == 'a' and listed_file[i+6] == 'r' and listed_file[i+7] == 'y':
            return i + 16
    return 0

# get int from byte
def get_int_from_byte(byte):
    return int.from_bytes(byte, byteorder='little')

# increase max allowed packet size
def set_max_packet_size():
    try:
        sql = 'SET GLOBAL max_allowed_packet=512*1024*1024'
        mycursor.execute(sql)
    except mysql.connector.Error as e:
        print(e)

# create new connection and insert rows one by one when packet size is too large
def insert_rows_single(sql_string, records):
    print('inserting rows in for loop')
    mydb2 = connect_to_db()
    mycursor2 = mydb2.cursor()
    try:
        for row in records:
            mycursor2.execute(sql_string, row)
            mydb2.commit()
    except mysql.connector.Error as e:
        print(e)

# insert multiple rows to database
def insert_rows_to_db(sql_string, records):
    set_max_packet_size()
    try:
        mycursor.executemany(sql_string, records)
        mydb.commit()
    except mysql.connector.Error as e:
        print(e)
        insert_rows_single(sql_string, records)
        
# return all absorption data of the file
def get_chromatogram_records(source_file):
    records = []
    with open(source_file, "rb") as file:
        byte = file.read(get_header_size(source_file)) # Read the header
        current_wavelength = min_wavelength
        timestamp = 0
        row = (timestamp,)

        while byte:
            byte = file.read(3)
            if len(byte) != 3:  # End of the file
                break

            row += (get_absorption(get_int_from_byte(byte)),)
            if current_wavelength % (max_wavelength) == 0:  # when row is read
                timestamp += 1
                records.append(row)
                current_wavelength = min_wavelength  # reset wavevelength to read next row
                row = (sampling_rate*timestamp,)
            else:
                current_wavelength += 1
    file.close()
    return records

node_env = sys.argv[6]
load_dotenv(node_env + '.env')

mydb = connect_to_db()
mycursor = mydb.cursor()

table_name = sys.argv[2]
min_wavelength = int(sys.argv[3])
max_wavelength = int(sys.argv[4])
sampling_rate = int(sys.argv[5]) / 1000
ammount_of_columns = max_wavelength - min_wavelength + 1

records = get_chromatogram_records(sys.argv[1])
sql = return_sql_string(table_name)
insert_rows_to_db(sql, records)
