const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.validateID = (req, res, next, val = 0) => {
    const tourExists = tours.find((tour) => tour.id === +val);
    if (!tourExists) {
        return res.status(404).json({
            status: 'fail',
            message: 'No tour found with this ID..',
        });
    }
    next();
};

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
    const id = +req.params.id;
    const tourByID = tours.find((tour) => tour.id === id);
    res.status(200).json({
        status: 'sucess',
        data: {
            tour: tourByID,
        },
    });
};

exports.addTour = (req, res) => {
    const newId = tours.at(-1).id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
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
    const id = +req.params.id;
    const patch = req.body;
    const tour = tours.find((tour) => tour.id === id);
    Object.keys(patch).forEach((key) => {
        tour[key] = patch[key];
    });
    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

exports.deleteTour = (req, res) => {
    const id = +req.params.id;
    const index = tours.findIndex((tour) => tour.id === id);
    const deletedTour = tours.splice(index, 1);
    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
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
};
