import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

//cors middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
})) 

//Express can parse a JSON request body before your route handler tries to access req.body.
app.use(express.json({limit : "16kb"}))

//Express can parse a URL request body. "extended" keyword allows use to pass object inside another object(nested).
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//Used to keep some file/folders/assets/img/pdfs. This "public" is a folder in our project directory.
app.use(express.static("public"))

//allows only browser to rea the cookies.
app.use(cookieParser())



export { app }