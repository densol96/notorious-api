module.exports = (asyncFunc) => {
    return (req, res, next) => {
        asyncFunc(req, res, next).catch(next);
        // same as .catch(err => next(err));
    };
};
