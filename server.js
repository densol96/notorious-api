const app = require('./app');
const dotenv = require('dotenv');
// This only needs to happen once and then process.env will be available in other files of the app as well.
dotenv.config({ path: `${__dirname}/config.env` });
// Configure the server to listen on local host on PORT 3000
console.log(process.env);
const port = +process.env.PORT;
app.listen(port, () => {
    console.log(`Server up on 127.0.0.1:${port}`);
});
