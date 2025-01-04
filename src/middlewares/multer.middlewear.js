import multer from "multer"

const storage = multer.diskStorage({
    destination: function(req,file,cb){// req to normal req but file jo h multer se milegi ye express m nhi hoti 
        //tabhi multr use hota h.
        //cb is call back
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb){
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //cb(null, file.fieldname + '-' + uniqueSuffix)

        cb(null, file.originalname)
        // but ye original filename rakhna is not good 
        //user k paas 5 shubhi naam ki files hon tb over write ho jayengi.
        //ye file vese to bht kum time k liye rahengi ki file ayi then cloud pr upload fir storage se delete
        // but tb bhi best option upr commented vala h.
    }
})

export const upload = multer({
    storage,
})