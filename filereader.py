import csv
import sys
import os
import time
from getpass import getpass
import mysql.connector

# DAD FILE
# Ieder absorptie-meetpunt = 3 bytes (b1,b2,b3)
# Absorptie = b1 + 256*b2 + 256*256*b3
# Header = 49658 bytes (BOUNDARY + 16 bytes)
#
# 601 golflengtes
# 601 golflengtes * 3 = 1803 bytes per golflengte blok.
#
# small DAD size = 140154 bytes
# small Data size = 140154 - 49658 = 90496
#
# big DAD size = 3702784 bytes
# big Data size = 3702784 - 49906 = 3652878
#
# headerSize = 49536 #49536 00000001big.dad
# headerSize = 49658 #49536 00000001.dad

c0 = -0.640000000000001
c1 = 0.000000250000000000135
c2 = 6.400E-05
c3 = 0.016

wavelength_offset = 200


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


def return_sql_string(columns, table_name, wavelength):
    sql = "INSERT INTO `" + table_name + "` ("
    for i in range(columns):
        sql += "`" + str(i+wavelength) + "`, "
    sql = sql[:-2]
    sql += ") VALUES ("

    return sql


def get_absorption(long_int):
    return c0 + c1 * long_int


def get_listed_file(file_name):
    with open(file_name, "rb") as file:
        byte = file.read(1)
        letters = []

        while byte:
            byte = file.read(1)
            letters.append(str(byte)[2:-1])

    file.close()
    return(letters)


def get_header_size(file_name):
    listed_file = get_listed_file(file_name)

    for i in range(len(listed_file)):
        if listed_file[i] == 'B' and listed_file[i+1] == 'o' and listed_file[i+2] == 'u' and listed_file[i+3] == 'n' and listed_file[i+4] == 'd' and listed_file[i+5] == 'a' and listed_file[i+6] == 'r' and listed_file[i+7] == 'y':
            return i + 16

    return 0


def get_int_from_byte(byte):
    return int.from_bytes(byte, byteorder='little')


def insert_chromatogram_to_db(source_file, table_name, wavelengths):
    with open(source_file, "rb") as file:
        mydb = connect_to_db()
        mycursor = mydb.cursor()
        byte = file.read(get_header_size(source_file)
                         )  # read header of dad file

        wavelength = wavelength_offset
        sql = return_sql_string(wavelengths, table_name, wavelength)
        values = ()

        while byte:
            byte = file.read(3)
            if len(byte) != 3:
                break

            absorption = get_absorption(get_int_from_byte(byte))
            sql += "%s, "
            values += (str(absorption),)

            if wavelength % 800 == 0:
                sql = sql[:-2] + ")"
                mycursor.execute(sql, values)
                mydb.commit()
                wavelength = wavelength_offset
                sql = return_sql_string(wavelengths, table_name, wavelength)
                values = ()

            else:
                wavelength += 1


def write_chromatogram_to_csv(source_file, destination_file):
    absorption_list = []
    with open(destination_file, 'w', newline='') as writeFile:
        writer = csv.writer(writeFile, delimiter=';')
        writer.writerow(range(200, 801))

        with open(source_file, "rb") as file:
            byte = file.read(get_header_size(source_file)
                             )  # read header of dad file
            absorptions = []
            wavelength = wavelength_offset

            while byte:
                byte = file.read(3)

                if len(byte) != 3:
                    break

                absorption = get_absorption(
                    int.from_bytes(byte, byteorder='little'))
                absorptions.append(absorption)

                # reset wavelength after 601 wavelengths
                if wavelength % 800 == 0:
                    wavelength = wavelength_offset
                    absorption_list.append([absorptions])
                    writer.writerow(absorptions)
                    absorptions = []
                else:
                    wavelength += 1

    file.close()
    writeFile.close()


def wirte_absorption_of_wavelength(source_file, destination_file, wavelength_limit):
    with open(destination_file, 'w', newline='') as writeFile:
        writer = csv.writer(writeFile, delimiter=';')
        writer.writerow(["Wavelength", "Absorption"])

        with open(source_file, "rb") as file:
            byte = file.read(get_header_size(source_file))  # read header of dad file
            wavelength = wavelength_offset

            while byte:
                byte = file.read(3)

                if len(byte) != 3:
                    break

                absorption = get_absorption(int.from_bytes(byte, byteorder='little'))

                if wavelength == wavelength_limit:
                    row = [wavelength, absorption]
                    writer.writerow(row)

                # reset wavelength after 601 wavelengths
                if wavelength % 800 == 0:
                    wavelength = wavelength_offset

                else:
                    wavelength += 1

    file.close()
    writeFile.close()

insert_chromatogram_to_db(sys.argv[1], sys.argv[2], int(sys.argv[3]))
