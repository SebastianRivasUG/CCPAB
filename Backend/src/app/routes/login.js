const connect = require('../../config/database');
const argon2 = require('argon2'); //Encriptador - análogo a SHA-256

module.exports = (app) => {

    //GET DE DEPURACION
    app.get('/users', (req, resp) => {
        let command = "SELECT mail, password FROM users";
        connect.query(command, (err, data) => {
            if (err) {
                resp.json({ errorCode: 1, errorMessage: "FAIL GET METHOD", err });
            } else {
                resp.json({ errorCode: 0, errorMessage: "USERS:", data: data });
            }
        });
    });

    //POST DE NUEVO USUARIO
    app.post('/users', async (req,resp) => { 
        try{
            const hashPassword = await argon2.hash(req.body.password);
            let command = `INSERT INTO users (mail, password) VALUES ('${req.body.mail}','${hashPassword}')`;

            connect.query(command, (err, data)=>{
                if(err){
                    resp.json({errorCode:1, errorMessage:"FAIL POST METHOD", err});
                }else {
                    resp.json({errorCode:0, errorMessage:"INSERTED:"});
                }
            });

        } catch( error ){
            resp.json({errorCode:1, errorMessage:"ERROR HASH PASSWORD", error});
        }
    });

    //POST DE VERIFICACION USUARIO
    //usamos post para verificar un usuario por el hecho que es más seguro, pues si usaramos get,
    //los datos se envían en la URL lo cual lo hace inseguro, por eso mejor un post asi 
    //los datos van en el body de la solicitud, lo cual no es visible como una URL
    app.post('/users/login', (req, resp)=>{
        try{
            let command = `SELECT password FROM users WHERE mail='${req.body.mail}'`;

            connect.query(command, async (err, data)=>{
                if(err){
                    resp.json({errorCode:1, errorMessage:"FAIL POST METHOD", err});
                }else if( data.length == 0){
                    resp.json({errorCode:1, errorMessage:"NO USER FOUND", err});
                }else {
                    const success = await argon2.verify(data[0].password, req.body.password);
                    if(success){
                        resp.json({errorCode:0, errorMessage:"SUCCESS IN LOGIN"});
                    } else {
                        resp.json({errorCode:0, errorMessage:"INCORRECT PASSWORD"});
                    }
                }
            });

        } catch( error ){
            resp.json({errorCode:1, errorMessage:"ERROR VERIFYING PASSWORD", error});
        }
    });

    //ACTUALIZACION DE CREDENCIALES
    //app.put('/users', (req,resp)=>{

    //})

    //DELETE DE USUARIO
    app.delete('/users/:mail', (req,resp)=>{
        const { password } = req.body;
        let getPass = `SELECT password FROM users WHERE mail = ?`;

        connect.query(getPass, [req.params.mail], async (err, data)=>{

            if(err){
                resp.json({errorCode:1, errorMessage:"FAIL DELETE METHOD", err});
            }else if( data.length == 0){
                resp.json({errorCode:1, errorMessage:"NO USER FOUND", err});
            }else {
                try{
                    const success = await argon2.verify(data[0].password, req.body.password);
                    if(success){
                        let command = `DELETE FROM users WHERE mail = ?`;
                        connect.query(command, [req.params.mail], (err, data) => {
                            if (err) {
                                resp.json({ errorCode: 1, errorMessage: "FAIL DELETE METHOD", err });
                            } else if (data.affectedRows === 0) {
                                resp.json({ errorCode: 1, errorMessage: "No user found with that email" });
                            } else {
                                resp.json({ errorCode: 0, errorMessage: "User deleted", rowsDeleted: data.affectedRows });
                            }
                        });
                    } else {
                        resp.json({errorCode:0, errorMessage:"INCORRECT PASSWORD"});
                    }
                } catch(error){
                    resp.json({errorCode:1, errorMessage:"ERROR VERIFYING PASSWORD", error});
                }
            }
        })
    });
}