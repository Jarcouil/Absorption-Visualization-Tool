const { spawn } = require('child_process');
const _ = require('lodash');
const router = require('express').Router({ mergeParams: true });
const file_controller = require('./../controllers/file_controller');
const measurement_controller = require("../controllers/measurement_controller");
const fs = require('fs');
const path = require('path');
const Json2csvParser = require("json2csv").Parser;
const { verifyFile } = require("../middleware")

router.post(
    '/upload-file', 
    [verifyFile.checkParameters],
    postNewFile
);
router.get('/download-file/:id', downloadDadFile);
router.get('/file-name/:id', getFileName);
router.get('/csv/:id', getCSV);

function getFileName(req, res, next) {
    measurement_controller.get_table_name_of_id(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Meting niet gevonden" });
            }
            const file_location = './uploads/' + req.params.id.toString() + '_' + result[0].name;
            const file = getFile(file_location);
            if (file == null) {
                return res.status(404).json({ message: 'Kon het bestand niet vinden' });

            }
            return res.status(200).json({ fileName: file });
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getCSV(req, res, next) {
    measurement_controller.get_table_name_of_id(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Meting niet gevonden" });
            }
            const table_name = req.params.id.toString() + '_' + result[0].name
            file_controller.get_csv_data(table_name, req.query.minWavelength, req.query.maxWavelength, req.query.minTimestamp, req.query.maxTimestamp).then(
                (result) => {
                    const jsonData = JSON.parse(JSON.stringify(result));
                    const json2csvParser = new Json2csvParser({ header: true });
                    const csv = json2csvParser.parse(jsonData);
                    return res.send(csv)
                },
                (error) => { return res.status(500).json({ message: error }); }
            )
        },
        (error) => { return res.status(500).send(error) }
    )
}

function downloadDadFile(req, res, next) {
    measurement_controller.get_table_name_of_id(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Meting niet gevonden" });
            }
            const file_location = './uploads/' + req.params.id.toString() + '_' + result[0].name;
            return res.download(file_location + '/' + getFile(file_location));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function postNewFile(req, res, next) {
    const file = req.files.file;

    file_controller.add_new_file(req.body.name, +req.body.minWaveLength, +req.body.maxWaveLength).then(
        (result) => {
            file_controller.add_file_to_table(req.body.name, req.body.description, req.userId).then(
                (result2) => {
                    const new_table_name = result2.insertId.toString() + '_' + req.body.name;
                    const file_location = './uploads/' + new_table_name
                    makeDirectory(file_location);
                    file.mv(file_location + '/' + file.name);

                    file_controller.rename_measurement_table(req.body.name, new_table_name).then(
                        (result) => {
                            const wavelengths = req.body.maxWaveLength - req.body.minWaveLength + 1
                            runPythonScript(file_location + '/' + file.name, res, file, new_table_name, wavelengths, result2.insertId.toString())
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

function makeDirectory(directoryPath) {
    fs.mkdir(path.join(directoryPath), (err) => {
        if (err) { return console.error(err); }
    });
}

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
