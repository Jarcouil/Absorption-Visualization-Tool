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

wavelengthOffset = 200

def connectToDB():
    try:    
        return mysql.connector.connect(
                host="localhost",
                user="root",
                password="root",
                database="chromatogram"
        )
    except mysql.connector.Error as e:
        print(e)

def returnSQLString(columns, tablename, wavelength):
    sql = "INSERT INTO `" + tablename + "` (" 
    for i in range(columns):
        sql += "`" + str(i+wavelength) + "`, "
    sql = sql[:-2] 
    sql += ") VALUES ("

    return sql

def getAbsorbtion(longInt):
    return c0 + c1 * longInt

def printRow(row):
    print(  str(row[0]) + " -> "
        + str(row[1]) + ", "  
        + str(row[2]) + ", " 
        + str(row[3]) + ", " 
        + str(row[4]) + ", " 
        + str(row[5])+ " -> " 
        + str(row[6]))

def getListOfFile(filename):
    with open(filename, "rb") as file:
        byte = file.read(1)
        letters = []

        while byte:
            byte = file.read(1)
            letters.append(str(byte)[2:-1])

    file.close()
    return(letters) 

def getHeaderSize(filename):
    listOfFile = getListOfFile(filename)

    for i in range(len(listOfFile)):
        if listOfFile[i] == 'B' and listOfFile[i+1] == 'o' and listOfFile[i+2] == 'u' and listOfFile[i+3] == 'n' and listOfFile[i+4] == 'd' and listOfFile[i+5] == 'a' and listOfFile[i+6] == 'r' and listOfFile[i+7] == 'y':
            return i + 16

    return 0

def getIntFromBytes(byte):
    return int.from_bytes(byte, byteorder='little')

def insertChromatogramToDatabase(sourceFile):
    with open(sourceFile, "rb") as file:
        mydb = connectToDB()
        mycursor = mydb.cursor()
        byte = file.read(getHeaderSize(sourceFile)) # read header of dad file
        tablename = sourceFile.split(".")[-2].split("/")[-1]

        wavelength = wavelengthOffset
        sql = returnSQLString(601, tablename, wavelength)
        values = ()

        while byte:
            byte = file.read(3)
            if len(byte) != 3:
                break

            absorption = getAbsorbtion(getIntFromBytes(byte))
            sql += "%s, "            
            values += (str(absorption),)

            if wavelength%800 == 0:
                sql= sql[:-2] + ")"
                mycursor.execute(sql, values)
                mydb.commit()
                wavelength = wavelengthOffset
                sql = returnSQLString(601, tablename, wavelength)
                values = ()

            else:
                wavelength += 1


def writeChromatogramToCSV(sourceFile, destinationFile):
    absorptionList = []
    with open(destinationFile, 'w', newline='') as writeFile:
        writer = csv.writer(writeFile, delimiter = ';')
        writer.writerow(range(200,801))

        with open(sourceFile, "rb") as file:
            byte = file.read(getHeaderSize(sourceFile)) # read header of dad file
            absorptions  = []
            wavelength = wavelengthOffset
           
            while byte:
                byte = file.read(3)
                
                if len(byte) != 3:
                    break
                
                absorption = getAbsorbtion(int.from_bytes(byte, byteorder='little'))
                absorptions.append(absorption)

                # reset wavelength after 601 wavelengths
                if wavelength%800 == 0:    
                    wavelength = wavelengthOffset
                    absorptionList.append([absorptions])
                    writer.writerow(absorptions)
                    absorptions = []
                else:
                    wavelength += 1

    file.close()
    writeFile.close()


def writeResultsOfWavenlength(sourceFile, destinationFile, wavelengthLimit):
    with open(destinationFile, 'w', newline='') as writeFile:
        writer = csv.writer(writeFile, delimiter = ';')
        writer.writerow(["Wavelength", "Absorption"]) 

        with open(sourceFile, "rb") as file:
            byte = file.read(getHeaderSize(sourceFile)) # read header of dad file
            bytesRead = 0
            wavelength = wavelengthOffset

            while byte:
                bytesRead +=3
                byte = file.read(3)

                if len(byte) != 3:
                    break
                
                absorption = getAbsorbtion(int.from_bytes(byte, byteorder='little'))

                if wavelength == wavelengthLimit: 
                    row = [wavelength, absorption]
                    writer.writerow(row)

                # reset wavelength after 601 wavelengths
                if wavelength%800 == 0:
                    wavelength = wavelengthOffset

                else:
                    wavelength += 1

    file.close()
    writeFile.close()

# writeChromatogramToCSV("00000001big.dad", "chromatogram big2.csv")
# writeChromatogramToCSV("00000001small.dad", "chromatogram small.csv")
# writeResultsOfWavenlength("00000001small.dad", "289nm alle tijdstippen small.csv", 289)
# writeResultsOfWavenlength("00000001small.dad", "303nm alle tijdstippen small.csv", 303)
# writeResultsOfWavenlength("00000001big.dad", "239nm alle tijdstippen big.csv", 303)

# writeChromatogramToCSV(sys.argv[1], sys.argv[2])
insertChromatogramToDatabase(sys.argv[1])
