const { spawn } = require('child_process');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Json2csvParser = require("json2csv").Parser;

const router = require('express').Router({ mergeParams: true });
const fileController = require('./../controllers/fileController');

const { verifyFile } = require("../middleware");
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
    const fileLocation = `./uploads/${getMeasurementName(req.params.id, res.measurement.name)}`;
    const file = getFile(fileLocation);
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
async function getCSV(req, res, next) {
    try {
        const tableName = getMeasurementName(req.params.id, res.measurement.name);
        const data = await fileController.getCustomData(tableName, req.query.minWavelength, req.query.maxWavelength, req.query.minTimestamp, req.query.maxTimestamp);
        const jsonData = JSON.parse(JSON.stringify(data));
        const json2csvParser = new Json2csvParser({ header: true });
        const csv = json2csvParser.parse(jsonData);
        return res.send(csv);
    } catch (error) { return res.status(500).send(error); }
}

/**
 * Download .dad file of the given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id
 */
function downloadDadFile(req, res, next) {
    const fileLocation = `./uploads/${getMeasurementName(req.params.id, res.measurement.name)}`;
    return res.download(`${fileLocation}/${getFile(fileLocation)}`);
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
async function postNewFile(req, res, next) {
    try {
        const file = req.files.file; 
        const insertId = await fileController.addToMeasurements(req.body.name, req.body.description, req.userId); // add measurement to measurmeent table
        const tableName = getMeasurementName(insertId[0], req.body.name); // get unique measurement name
        const fileLocation = `./uploads/${tableName}`; // create foldername
        makeDirectory(fileLocation); // create folder
        file.mv(`${fileLocation}/${file.name}`); // move file to folder
        await fileController.createNewTable(tableName, +req.body.minWaveLength, +req.body.maxWaveLength); // create data table for measurmeent
        await runPythonScript(`${fileLocation}/${file.name}`, tableName, req.body.minWaveLength, req.body.maxWaveLength); // run file parser
        return res.send({ id: insertId, message: 'Meting is succesvol opgeslagen!' });
    } catch (error) { return res.status(500).json("Er heeft zich een probleem voorgedaan met het verwerken van het bestand."); }
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
        const files = fs.readdirSync(directoryPath);
        if (files.length < 1) return null;
        return files[0];
    } catch (err) {
        console.log("err", err);
        return null;
    }
}

/**
 * Get the name of a measurement
 * @param {id} id 
 * @param {name} name 
 * @returns {string} measurement name
 */
const getMeasurementName = (id, name) => `${id}_${name}`;

/**
 * Run python script which extracts the data of the .dad file
 * @param {string} sourceFile 
 * @param {*} res 
 * @param {*} file 
 * @param {string} tablename 
 * @param {number} wavelengths 
 * @param {number} insertId 
 */
function runPythonScript(sourceFile, tablename, minWaveLength, maxWaveLength) {
    return new Promise(function (resolve, reject) {
        const python = spawn('python', ['filereader.py', sourceFile, tablename, minWaveLength, maxWaveLength]);
        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) reject();
            resolve();
        });
    });
}

module.exports = router;
