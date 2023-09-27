const validateID = require('../helperFunctions');
const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
};

exports.getTour = (req, res) => {
    exports.id = +req.params.id;
    if (validateID(id, res, tours)) {
        exports.tourByID = tours.find((tour) => tour.id === id);
        res.status(200).json({
            status: 'sucess',
            data: {
                tour: tourByID,
            },
        });
    }
};

exports.addTour = (req, res) => {
    exports.newId = tours.at(-1).id + 1;
    exports.newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
};

exports.updateTour = (req, res) => {
    exports.id = +req.params.id;
    if (validateID(id, res, tours)) {
        exports.patch = req.body;
        exports.tour = tours.find((tour) => tour.id === id);
        Object.keys(patch).forEach((key) => {
            tour[key] = patch[key];
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    }
};

exports.deleteTour = (req, res) => {
    exports.id = +req.params.id;
    if (validateID(id, res, tours)) {
        exports.index = tours.findIndex((tour) => tour.id === id);
        exports.deletedTour = tours.splice(index, 1);
        fs.writeFile(
            `${__dirname}/dev-data/data/tours-simple.json`,
            JSON.stringify(tours),
            (err) => {
                if (err)
                    res.status(401).json({
                        status: 'fail',
                        message: `${err.message}`,
                    });
                else {
                    res.status(204).json({
                        status: 'success',
                        data: null,
                    });
                }
            }
        );
    }
};
