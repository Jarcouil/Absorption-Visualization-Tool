import sys
import mysql.connector

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
            host="localhost",
            user="root",
            password="root",
            database="chromatogram"
        )
    except mysql.connector.Error as e:
        print(e)

# Return SQL string for inserting data
def return_sql_string(table_name):
    sql_string = "INSERT INTO `" + table_name + "` ("
    for i in range(ammount_of_columns):
        sql_string += "`" + str(i+min_wavelength) + "`, "
    sql_string = sql_string[:-2]
    sql_string += ") VALUES ("
    for i in range(ammount_of_columns):
        sql_string += "%s, "
    sql_string = sql_string[:-2] + ")"

    return sql_string

# calculate the absorption
def get_absorption(long_int):
    return str(c0 + c1 * long_int)

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


def get_int_from_byte(byte):
    return int.from_bytes(byte, byteorder='little')

# insert row to database
def insert_row_to_db(values):
    sql_string = return_sql_string(table_name)
    mycursor.execute(sql_string, values)
    mydb.commit()

# Iterate over file and insert absoprtions to the database
def insert_chromatogram_to_db(source_file):
    with open(source_file, "rb") as file:
        byte = file.read(get_header_size(source_file))
        current_wavelength = min_wavelength
        values = ()

        while byte:
            byte = file.read(3)
            if len(byte) != 3: # end of the file
                break

            values += (get_absorption(get_int_from_byte(byte)),)
            if current_wavelength % (max_wavelength) == 0: # when row is read 
                insert_row_to_db(values) # insert row to database
                current_wavelength = min_wavelength # reset values
                values = ()
            else:
                current_wavelength += 1
    file.close()

mydb = connect_to_db()
mycursor = mydb.cursor()
table_name = sys.argv[2]
min_wavelength = int(sys.argv[3])
max_wavelength = int(sys.argv[4])
ammount_of_columns = max_wavelength - min_wavelength + 1

insert_chromatogram_to_db(sys.argv[1])
