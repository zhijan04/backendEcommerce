const dotenv = require('dotenv')
dotenv.config({
    path: "./src/.env"
})

const config ={
    PORT: process.env.PORT || 3000,
    DBNAME: process.env.DBNAME,
    DBURL: process.env.DBURL,
    SECRETKEY: process.env.SECRETKEY
}

module.exports = config