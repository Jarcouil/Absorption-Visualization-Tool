const { spawn } = require('child_process');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Json2csvParser = require("json2csv").Parser;

const router = require('express').Router({ mergeParams: true });
const fileController = require('./../controllers/fileController');

const { verifyExport } = require("../middleware");
const { verifyFile } = require("../middleware");
const { verifyMeasurement } = require("../middleware");

router.post(
    '/upload-file',
    [verifyFile.checkParameters],
    postNewFile
);
router.post(
    '/meta',
    postMetaFile
)
router.get(
    '/download-file/:id/:fileName',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    downloadFile
);
router.get(
    '/file-names/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getFileNames
);
router.get(
    '/csv/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed, verifyExport.checkParameters],
    getCSV
);

/**
 * Get the name of the uploaded .dad file of the given measurement.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id 
 */
function getFileNames(req, res, next) {
    const fileLocation = `./uploads/${getMeasurementName(req.params.id, res.measurement.name)}`;
    const files = getFiles(fileLocation);
    if (files == null) {
        return res.status(404).json({ message: 'Kon geen bestanden vinden' });
    }
    let data = { fileNames: [] };
    files.forEach(file => data.fileNames.push(file));
    return res.status(200).json(data);
}

/**
 * Get a .CSV file of the requested data of given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id measurement id
 * @param {*} req.query.wavelengths Wavelengths
 * @param {*} req.query.timestamps Timestamps
 */
async function getCSV(req, res, next) {
    try {
        const tableName = getMeasurementName(req.params.id, res.measurement.name);
        const data = await fileController.getCustomData(tableName, res.timestamps, res.wavelengths);
        const jsonData = JSON.parse(JSON.stringify(data));
        var fields = [];
        res.wavelengths.forEach(wl => fields.push(wl.toString()))
        const json2csvParser = new Json2csvParser({ header: true, fields: fields });
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
 * @param {*} req.params.fileName file name
 */
 function downloadFile(req, res, next) {
    const fileLocation = `./uploads/${getMeasurementName(req.params.id, res.measurement.name)}`;
    if (!fileExists(`${fileLocation}/${req.params.fileName}`)){
        return res.status(404).json({ message: 'Kon het bestand niet vinden!' });
    }
    return res.download(`${fileLocation}/${req.params.fileName}`);
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
        const insertId = await fileController.addToMeasurements(req.body.name, req.body.description, req.userId, req.body.samplingRate); // add measurement to measurmeent table
        const tableName = getMeasurementName(insertId[0], req.body.name); // get unique measurement name
        const fileLocation = `./uploads/${tableName}`; // create foldername
        makeDirectory(fileLocation); // create folder
        file.mv(`${fileLocation}/${file.name}`); // move file to folder
        moveMetaFile(fileLocation);
        await fileController.createNewTable(tableName, +req.body.minWaveLength, +req.body.maxWaveLength); // create data table for measurmeent
        await runPythonScript(`${fileLocation}/${file.name}`, tableName, req.body.minWaveLength, req.body.maxWaveLength, req.body.samplingRate); // run file parser
        return res.send({ id: insertId, message: 'Meting is succesvol opgeslagen!' });
    } catch (error) { return res.status(500).json({message: "Er heeft zich een probleem voorgedaan met het verwerken van het bestand."}) }
}

async function postMetaFile(req, res, next) {
    try {
        const file = req.files.file; 
        const fileLocation = './uploads/temp'; // create foldername
        file.mv(`${fileLocation}/${file.name}`); // move file to folder
        const [samplingPeriod, minWaveLength, maxWaveLength] = await runMetaParser(`${fileLocation}/${file.name}`); // run file parser
        return res.send({ samplingPeriod: samplingPeriod, minWaveLength: minWaveLength, maxWaveLength: maxWaveLength, message: 'De waardes voor minimale en maximale golflengte en sampling period zijn succesvol ingevoerd!'});
        
    } catch (error) { 
        console.log(error)
        return res.status(500).json({message: "Er heeft zich een probleem voorgedaan met het verwerken van het bestand."}) }
}

/**
 * Move file to folder of specific measurement
 *
 * @param {string} newPath 
 */
function moveMetaFile(newPath) {
    fs.rename('./uploads/temp/Series.rpt', `${newPath}/Series.rpt`, (err) => {
        if (err) { return console.error(err); }
    });
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
 * Check if file exists of given directory path
 *
 * @param {string} directoryPath 
 * @returns boolean
 */
function fileExists(directoryPath) {
    try {
        if (fs.existsSync(directoryPath)) return true;
        return false;
    } catch (err) {
        console.log("err", err);
        return false;
    }
}

/**
 * Get the file of given directory path
 * @param {*} directoryPath 
 * @returns File
 */
 function getFiles(directoryPath) {
    try {
        const files = fs.readdirSync(directoryPath);
        if (files.length < 1) return null;
        return files;
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
 * Run parser for meta parser and return results
 * @param {file} sourceFile 
 *
 * @returns minWavelength, maxWavelength, samplingPeriod
 */
function runMetaParser(sourceFile) {
    return new Promise(function (resolve, reject) {
        const python = spawn('python', ['series_parser.py', sourceFile]);
        let result = '';
        python.stdout.on('data', function(data){
            result += data.toString().replace(/[|&;$%/\r?\n|\r/@"<>()+,]/g, "");
        });
        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) reject();
            let results = result.split(" ").map(item => +item)
            resolve(results);
        });
    });
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
function runPythonScript(sourceFile, tablename, minWaveLength, maxWaveLength, samplingRate) {
    return new Promise(function (resolve, reject) {
        const python = spawn('python', ['filereader.py', sourceFile, tablename, minWaveLength, maxWaveLength, samplingRate, process.env.NODE_ENV], {stdio: "inherit"});
        python.on('data', function(data){
            process.stdout.write("python script output", data);
        });  

        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) reject();
            resolve();
        });
    });
}

module.exports = router;
