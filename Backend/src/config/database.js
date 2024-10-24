const mysql = require('mysql2');
const conn = mysql.createConnection(
    {
        host:  "root-user.mysql.database.azure.com",
        user: "main",
        password: "Abc123456",
        database: "proyecto_sebastian",
    }
)

conn.connect( (err) => {
    if(err){
        console.log("Error in Database",err)
    } else {
        console.log("Connected to Database")
    }
});

module.exports = conn;