import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // jb bhi searching field kisi pr enable krni ho then index true krdo vese to bina iske bhi ho jata h.
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true // jb bhi searching field kisi pr enable krni ho then index true krdo vese to bina iske bhi ho jata h.
    },
    avatar: {
        type: String, // will be using cludinary url
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
},{
    timestamps: true
})

// ab ye model export se phele password encrypt kra dete hein.

//userSchema.pre("save", ()=>{}) ye ase nhi chalega as arrow function m hamare pass this k reference nhi hota.
//middlewear h ye
userSchema.pre("save", async function (next) {
    if(!this.isModified("passwprd")) return next();

    this.password != bcrypt.hash(this.password, 10)
    next()
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({//already db m save h aur this k andr access h 
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,{expiresIn : process.env.ACCESS_TOKEN_EXPIRY},)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({//already db m save h aur this k andr access h 
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,{expiresIn : process.env.REFRESH_TOKEN_EXPIRY},)
}

export const User = mongoose.model("User", userSchema)


//refresh tokens we store in the db and access token we do not store