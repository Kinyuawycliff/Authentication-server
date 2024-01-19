import express  from "express";
import BodyParser from 'body-parser';
import session from "express-session";
import cookieParser from "cookie-parser";


import cors from 'cors';
import mysql from 'mysql';

const App =express();
const PORT = 7000;

//middleware
App.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));
App.use(BodyParser.json());
App.use(cookieParser());

App.use(session({
    secret:'secret',//A secret key used to encrypt the session cookie.
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }//Set the session cookie properties.
}))

//Database connection 
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root123",
    database:"authentication"
})

App.get('/',(req,res)=>{
    if(req.session.username){
        return res.json({valid: true, username:req.session.username})
    }else{
        return res.json({valid: false})
    }
})

App.post('/login',(req,res)=>{
    const query = "SELECT * FROM users WHERE email = ? AND password = ?;"
    /*
    const values = [
        req.body.email,
        req.body.password
    ]
    */
    
    db.query(query,[req.body.email, req.body.password],(err, data)=>{
        if(err)return res.json(err);
        if (data.length > 0) {
            req.session.username = data[0].username;
            console.log(req.session.username)
            return res.json({Login: true, username: req.session.username})
        } else {
            return res.json({Login:false})
        }
    })
})

App.post('/signup',(req,res)=>{
    const query = "INSERT INTO users (username,email,password) VALUES (?)";
    
    const values= [
        req.body.username,
        req.body.email,
        req.body.password
    ];

    db.query(query,[values],(err,data)=>{
        if(err)return res.json(err);
        return res.json(data)
    })
})

App.get('/logout',(req,res)=>{
    //clear cookies to logout the user
    res.clearCookie('connect.sid');
    return res.json({Status: "Success"})
}); 

App.listen(PORT,()=>{
    console.log(`Server listening at http://localhost:${PORT}`)
})