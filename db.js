const {Client} = require('pg')
const dotenv = require('dotenv')
dotenv.config()


const con = new Client({
    password: process.env.password,
    user: process.env.user,
    port: process.env.port,
    database: process.env.db,
    host: process.env.host
})

con.connect().then(()=>{
    console.log('connected')
})

module.exports = con;