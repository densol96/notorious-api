const app = require('./app');

// Configure the server to listen on local host on PORT 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server up on 127.0.0.1:${port}`);
});
