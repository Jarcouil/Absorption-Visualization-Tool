const { spawn } = require('child_process');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Json2csvParser = require("json2csv").Parser;

const router = require('express').Router({ mergeParams: true });
const fileController = require('./../controllers/fileController');

const { verifyFile } = require("../middleware")
const { verifyMeasurement } = require("../middleware");

router.post(
    '/upload-file', 
    [verifyFile.checkParameters],
    postNewFile
);
router.get(
    '/download-file/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    downloadDadFile
);
router.get(
    '/file-name/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getFileName
);
router.get(
    '/csv/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getCSV
);

/**
 * Get the name of the uploaded .dad file of the given measurement.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id 
 */
function getFileName(req, res, next) {
    const file_location = './uploads/' + getMeasurementName(req.params.id, res.measurement.name);
    const file = getFile(file_location);
    if (file == null) {
        return res.status(404).json({ message: 'Kon het bestand niet vinden' });
    }
    return res.status(200).json({ fileName: file });

    
}

/**
 * Get a .CSV file of the requested data of given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id
 * @param {*} req.query.minWavelength minWavelength
 * @param {*} req.query.maxWavelength maxWavelength
 * @param {*} req.query.minTimestamp minTimestamp
 * @param {*} req.query.maxTimestamp maxTimestamp
 */
function getCSV(req, res, next) {
    const table_name = getMeasurementName(req.params.id, res.measurement.name);
    fileController.getCustomData(table_name, req.query.minWavelength, req.query.maxWavelength, req.query.minTimestamp, req.query.maxTimestamp).then(
        (data) => {
            const jsonData = JSON.parse(JSON.stringify(data));
            const json2csvParser = new Json2csvParser({ header: true });
            const csv = json2csvParser.parse(jsonData);
            return res.send(csv)
        },
        (error) => { return res.status(500).json({ message: error }); }
    )

}

/**
 * Download .dad file of the given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id
 */
function downloadDadFile(req, res, next) {
    const file_location = './uploads/' + getMeasurementName(req.params.id, res.measurement.name);
    return res.download(file_location + '/' + getFile(file_location));
}

/**
 * Post and process a new file
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.files.file file
 * @param {*} req.body.name name
 * @param {*} req.body.minWaveLength minWaveLength
 * @param {*} req.body.maxWaveLength maxWaveLength
 * @param {*} req.body.description description
 */
function postNewFile(req, res, next) {
    const file = req.files.file;

    fileController.createNewTable(req.body.name, +req.body.minWaveLength, +req.body.maxWaveLength).then(
        (result) => {
            fileController.addToMeasurements(req.body.name, req.body.description, req.userId).then(
                (insertId) => {
                    const new_table_name = getMeasurementName(insertId[0], req.body.name);
                    const file_location = './uploads/' + new_table_name
                    makeDirectory(file_location);
                    file.mv(file_location + '/' + file.name);

                    fileController.renameMeasurementTable(req.body.name, new_table_name).then(
                        (result) => {
                            const wavelengths = req.body.maxWaveLength - req.body.minWaveLength + 1
                            runPythonScript(file_location + '/' + file.name, res, file, new_table_name, wavelengths, insertId[0].toString())
                        },
                        (error) => { return res.status(500).send(error) }
                    )
                },
                (error) => { return res.status(500).send(error) }
            )
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Create a new directory to store the uploaded file
 * @param {string} directoryPath 
 */
function makeDirectory(directoryPath) {
    fs.mkdir(path.join(directoryPath), (err) => {
        if (err) { return console.error(err); }
    });
}

/**
 * Get the file of given directory path
 * @param {*} directoryPath 
 * @returns File
 */
function getFile(directoryPath) {
    try {
        const files = fs.readdirSync(directoryPath)
        if (files.length > 0) {
            return files[0]
        } else {
            return null
        }
    } catch (err) {
        console.log("err", err);
        return null
    }
}

/**
 * Get the name of a measurement
 * @param {id} id 
 * @param {name} name 
 * @returns {string} measurement name
 */
function getMeasurementName(id, name) {
    return id.toString() + '_' + name
}

/**
 * Run python script which extracts the data of the .dad file
 * @param {string} sourceFile 
 * @param {*} res 
 * @param {*} file 
 * @param {string} tablename 
 * @param {number} wavelengths 
 * @param {number} insertId 
 */
function runPythonScript(sourceFile, res, file, tablename, wavelengths, insertId) {
    const python = spawn('python', ['filereader.py', sourceFile, tablename, wavelengths]);

    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        if (code === 0) {
            res.send({
                id: insertId,
                status: true,
                message: 'Meting is succesvol opgeslagen!',
                data: {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        } else {
            return res.status(500).json("Er heeft zich een probleem voorgedaan met het verwerken van het bestand.")
        }
    });
}

module.exports = router;
