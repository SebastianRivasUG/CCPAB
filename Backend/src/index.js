const app = require('./config/server');
require('./app/routes/login')(app);

app.listen(9000, ()=> {console.log("Server running on port 9000")});


