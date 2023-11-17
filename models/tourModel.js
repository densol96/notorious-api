const mongoose = require('mongoose');
const slugify = require('slugify');

// Create a schema
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, `A tour name must have 8-40 characters!`],
            minlength: [8, `A tour name must have 8-40 characters!`],
            // validate: {
            //     validator: validator.isAlpha,
            //     messsage: 'Name must only contain letters!',
            // },
        },
        slug: {
            type: String,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: 'String',
            required: [true, 'A tour must have a difficulty'],
            trim: true,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, `Rating cannot be lower than 1.0!`],
            max: [5, `Rating cannot be higher than 5.0!`],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this = document
                    // val = priceDiscount
                    return val < this.price;
                },
                // {VALUE} comes from mongoose
                message:
                    'Discount price ({VALUE}) should be below regular price!',
            },
        },
        summary: {
            type: String,
            trim: true, //trims the input string
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String], // An array of strings
        createdAt: {
            type: Date,
            default: Date.now,
            select: false, // will not display to the user
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // GeoJSON (must have at least type and coordinates)
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
                message: 'Type can only be a point!',
            },
            // Array of numbers
            // norm lat(h), long(v) BUT here long, lat for GeoJSON
            coordinates: [Number],

            // CAN ADD OTHER FIELDS TO GeoJSON
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                    message: 'Type can only be a point!',
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        // guides: Array,
        guides: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

// Documents created off Tour modell are going to tours collection
tourSchema.set('collection', 'tours');

// Create a'virtual' field that is not stored directly in DB but derives from the other property that is actually stored
tourSchema.virtual(`durationWeeks`).get(function () {
    // this in this context will refer to the same document therefore gotta use function expression
    return this.duration / 7;
});

//VIRTUAL POPULATE
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() .insertMany
tourSchema.pre(`save`, function (next) {
    // this = dicument that being saved
    // use slugify library to create a slug, f.e. "My name" ---> "my-name"
    this.slug = slugify(this.name, { lower: true });
    next();
});

// USED FOR EMBEDDING
// tourSchema.pre(`save`, async function (next) {
//     const guides = this.guides.map((id) => {
//         return User.findById(id);
//     });
//     this.guides = await Promise.all(guides);
//     next();
// });

// post middleware runs after
tourSchema.post(`save`, function (doc, next) {
    // can't use this here, but have access to doc object
    console.log(`Document has been created!`);
    console.log(doc);
    next();
});

// QUERY MIDDLEWARE - works pre-/post queries f.e. find, findOne etc.
tourSchema.pre(`find`, function (next) {
    // this refers to the current query
    this.queryStartTime = Date.now();
    next();
});

tourSchema.pre(`find`, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

tourSchema.post(`find`, function (docs, next) {
    const time = Date.now() - this.queryStartTime;
    console.log(`Query took ${time} ms.`);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre(`aggregate`, function (next) {
    // this = Aggregate Object
    // f.e. -->
    //Aggregate {
    // _pipeline: [
    //     { $unwind: '$startDates' },
    //     { $match: [Object] },
    //     { $group: [Object] },
    //     { $addFields: [Object] },
    //     { $project: [Object] },
    //     { $sort: [Object] },
    //     { $limit: 12 },
    // ],

    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

// Model to be used as blueprint for Tours coming to DB
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
