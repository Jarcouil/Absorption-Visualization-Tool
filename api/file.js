const {spawn} = require('child_process');
const _ = require('lodash');
const router = require('express').Router({mergeParams: true});
const file_controller = require('./../controllers/file_controller');

router.post('/upload-file', postNewFile);


function postNewFile(req, res, next){
    
    let file = req.files.file;
    file.mv('./uploads/' + file.name)


    file_controller.add_new_file(file).then(
        (result) => {
            file_controller.add_file_to_table(file.name.split('.')[0]).then(
                (result) => {
                    runPythonScript('./uploads/' + file.name, res, file)            

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

function runPythonScript(sourceFile, res, file){
    const python = spawn('python', ['filereader.py', sourceFile]);

    absorptions = []
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        absorptions.push(data)
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
