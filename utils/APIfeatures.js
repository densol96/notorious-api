class APIFeatures {
    // new APIFeature(Model.find(), req.queries)
    constructor(queryInBuild, queriesFromRequest) {
        this.queryInBuild = queryInBuild;
        this.queriesFromRequest = queriesFromRequest;
    }

    filter() {
        const requestQueries = { ...this.queriesFromRequest };
        const excludedFields = ['sort', 'fields', 'page', 'limit'];
        excludedFields.forEach((el) => delete requestQueries[el]);

        // Advanced filtering
        let requestQueriesToString = JSON.stringify(requestQueries);
        requestQueriesToString = requestQueriesToString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        this.queryInBuild = this.queryInBuild.find(
            JSON.parse(requestQueriesToString)
        );
        return this;
    }

    sort() {
        if (this.queriesFromRequest.sort) {
            this.queryInBuild = this.queryInBuild.sort(
                this.queriesFromRequest.sort
            );
            // query = query.sort({ [req.query.sort]: 'ascending' });
            // query = query.sort({ [req.query.sort]: 'descending' });
            /*
            Could also use price vs -price, in both our code and API request:
            query.sort('-price');
            */
        } else {
            this.queryInBuild = this.queryInBuild.sort(`-createdAt`);
        }
        return this;
    }

    limitFields() {
        if (this.queriesFromRequest.fields) {
            const fields = this.queriesFromRequest.fields.split(',').join(' ');
            this.queryInBuild = this.queryInBuild.select(fields); // "name price duration"
        } else {
            this.queryInBuild = this.queryInBuild.select('-__v'); // exclude __v
        }
        return this;
    }

    async paginate() {
        const page = this.queriesFromRequest.page
            ? +this.queriesFromRequest.page
            : 1;
        const limit = this.queriesFromRequest.limit
            ? +this.queriesFromRequest.limit
            : 100;
        const skip = (page - 1) * limit;
        this.queryInBuild = this.queryInBuild.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
