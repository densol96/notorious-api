const catchAsyncError = require('./../utils/catchAssyncErr.js');
const AppError = require('./../utils/appError.js');
const APIFeatures = require(`./../utils/APIfeatures`);

exports.deleteDocument = (Model) => {
    console.log('Hey i am here!');
    return catchAsyncError(async (req, res) => {
        const deletedDocument = await Model.findOneAndDelete({
            _id: req.params.id,
        });

        if (!deletedDocument) {
            throw new AppError(
                `No document with such ID of ${req.params.id} found for data model ${Model.modelName}`,
                404
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                deletedDocument,
            },
        });
    });
};

exports.updateDocument = (Model) => {
    return catchAsyncError(async (req, res) => {
        const updatedDocument = await Model.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedDocument) {
            throw new AppError(
                `No document with such ID of ${req.params.id} found for the model ${Model.modelName}!`,
                404
            );
        }
        res.status(200).json({
            status: 'success',
            data: {
                updatedDocument,
            },
        });
    });
};

exports.createDocument = (Model) => {
    return catchAsyncError(async (req, res) => {
        const newDocument = await Model.create(req.body);
        res.status(200).json({
            status: 'success',
            results: `Your ${Model.modelName} has been saved to DB!`,
            data: newDocument,
        });
    });
};

exports.getDocument = (Model, populateOptions) => {
    return catchAsyncError(async (req, res) => {
        let query = Model.findOne({ _id: req.params.id });
        if (populateOptions) {
            query = query.populate(populateOptions);
        }
        const document = await query;

        if (!document) {
            throw new AppError(
                `No document with such ID of ${req.params.id} found fot the model ${Model.modelName}!`,
                404
            );
        }
        res.status(200).json({
            status: 'success',
            data: document,
        });
    });
};

exports.getAllDocuments = (Model) => {
    return catchAsyncError(async (req, res) => {
        let filter = {};
        if (req.params.id) {
            filter = { tour: req.params.id };
        }

        const fullQuery = new APIFeatures(Model.find(filter), req.query);
        fullQuery.filter().sort().limitFields().paginate();
        const documents = await fullQuery.queryInBuild;

        res.status(200).json({
            status: 'success',
            results: documents.length,
            data: {
                documents,
            },
        });
    });
};
