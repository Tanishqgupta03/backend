import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
//user k jo server h uski cookies access and use kr payein

const app = express()
app.use(cors()) //isse humesha kaam bn jata h but production level code 

// app.use(cors({
//     origin: 
// }))

//ab backend m data ata h koi json bhejega koi form data koi urls 

// to json accept karane k liye 

app.use(express.json({limit: "16kb"}))

//ab url se bhi accept krna h but urls m ek issue h jese google pr search kra kuch vo kabhi words k beech + kabhi %20 kabhi kuch 

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))//kayi baar hum files images store karana chahate tb ye.

app.use(cookieParser())


//routes
import  userRouter from './routes/user.routes.js'

//routes declaration

  //agr hum issi file m routes bhi likhte then hume app.get() krke krn apadta 

  // lekin ab hum dusri file se route export kr rahe hein isilye hume app.use()

app.use("/api/v1/users", userRouter)

// to ab smjho kesa url banega ye /api/v1/users ek prefix ki tarah react krega 
//api/v1 means version is the standard practice
//now http//----/api/v1/users/register

export { app }