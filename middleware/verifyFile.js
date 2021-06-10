const path = require('path')

const checkParameters = (req, res, next) => {
    if (!req.files?.file) {
        return res.status(400).json({ message: "Bestand is verplicht!" });
    }
    if (path.extname(req.files.file.name) !== '.dad') {
        return res.status(400).json({ message: "Bestand moet het .dad extensie hebben!" });
    }
    if (!req.body.name) {
        return res.status(400).json({ message: "Naam is verplicht!" });
    }
    if (!req.body.minWaveLength) {
        return res.status(400).json({ message: "Minimale golflengte is verplicht!" });
    }
    if (!req.body.maxWaveLength) {
        return res.status(400).json({ message: "Maximale golflengte is verplicht!" });
    }
    if (!req.body.description) {
        return res.status(400).json({ message: "Beschrijving is verplicht!" });
    }
    if (+req.body.minWaveLength > +req.body.maxWaveLength) {
        return res.status(400).json({ message: "Minimale golflengte moet minder zijn dan de maximale golflengte!" });
    }

    next();
}

const verifyFile = {
    checkParameters: checkParameters,
};

module.exports = verifyFile;