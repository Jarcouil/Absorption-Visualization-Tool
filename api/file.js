const {spawn} = require('child_process');
const _ = require('lodash');
const router = require('express').Router({mergeParams: true});
const file_controller = require('./../controllers/file_controller');

router.post('/upload-file', postNewFile);


function postNewFile(req, res, next){
    let file = req.files.file;
    file.mv('./uploads/' + file.name)
    file_controller.add_new_file(req.body.name, +req.body.minWaveLength, +req.body.maxWaveLength).then(
        (result) => {
            file_controller.add_file_to_table(req.body.name, req.body.description).then(
                (result) => {
                    let wavelengths = req.body.maxWaveLength - req.body.minWaveLength + 1
                    runPythonScript('./uploads/' + file.name, res, file, req.body.name, wavelengths)
                },
                (error) => {
                    return res.status(500).send(error)
                }
            )
        },
        (error) => {
            return res.status(500).send(error)
        }
    )
}

function runPythonScript(sourceFile, res, file, tablename, wavelengths){
    const python = spawn('python', ['filereader.py', sourceFile, tablename, wavelengths]);

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
});

    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);

        res.send({
            status: true,
            message: 'File is uploaded',
            data: {
                name: file.name,
                mimetype: file.mimetype,
                size: file.size
            }
        });
    });
}

module.exports = router;
