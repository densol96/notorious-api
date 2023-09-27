module.exports = function (id, response, tours) {
    if (isNaN(id) || id > tours.length - 1) {
        response.status(404).json({
            status: "fail",
            message: "No tour found with this ID..",
        });
        return false;
    }
    return true;
};
