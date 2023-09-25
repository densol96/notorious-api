const fs = require("fs");
const express = require("express");
const validateID = require("./helperFunctions");
const app = express();

// Middle-Ware
app.use(express.json());

// Parse the file and create the JS object
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// Handle GET all tours
app.get(`/api/v1/tours`, (request, response) => {
  response.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Handle GET a specific tour by ID
app.get(`/api/v1/tours/:id`, (request, response) => {
  const id = +request.params.id;
  if (validateID(id, response, tours)) {
    const tourByID = tours.find((tour) => tour.id === id);
    response.status(200).json({
      status: "sucess",
      data: {
        tour: tourByID,
      },
    });
  }
});

// Handle adding a new post
app.post(`/api/v1/tours`, (request, response) => {
  const newId = tours.at(-1).id + 1;
  console.log(newId);
  const newTour = Object.assign({ id: newId }, request.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
});

app.patch(`/api/v1/tours/:id`, (request, response) => {
  const id = +request.params.id;
  if (validateID(id, response, tours)) {
    const patch = request.body;
    const tour = tours.find((tour) => tour.id === id);
    Object.keys(patch).forEach((key) => {
      tour[key] = patch[key];
    });
    response.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  }
});

app.delete(`/api/v1/tours/:id`, (request, response) => {
  const id = +request.params.id;
  if (validateID(id, response, tours)) {
    const index = tours.findIndex((tour) => tour.id === id);
    const deletedTour = tours.splice(index, 1);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        if (err)
          response.status(401).send({
            status: "fail",
            message: `${err.message}`,
          });
        else {
          response.status(204).json({
            status: "success",
            data: null,
          });
        }
      }
    );
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`App runing on port ${port}`);
});
