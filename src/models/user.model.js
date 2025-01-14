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
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
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
    },
    process.env.REFRESH_TOKEN_SECRET,{expiresIn : process.env.REFRESH_TOKEN_EXPIRY},)
}

export const User = mongoose.model("User", userSchema)


//refresh tokens we store in the db and access token we do not store

/*userSchema.pre("save", async function (next)
is part of Mongoose middleware (also known as hooks). Here's a breakdown of its components:

1. userSchema.pre("save", ...):
pre() is a Mongoose middleware function that runs before a specified action (in this case, a save operation) is executed.
The "save" event is triggered when a document is being saved to the database (e.g., when you create or update a User document).
pre means this middleware will run before the document is saved.
This is often used for operations like data validation, password encryption, or modifying the document before it is stored.
2. async function (next):
The middleware function is asynchronous (because of async), meaning it can handle operations that take time, like hashing a password or querying another database.
next is a callback function that you call when your middleware is complete, signaling to Mongoose that the process can continue. If you don't call next(), the operation (in this case, save) will be halted.
Purpose:
In this specific case, the pre("save") middleware is used to hash the user's password before saving the document to the database.

What happens inside the function:
if (!this.isModified("password")) return next();:

This line checks if the password field has been modified. If the password hasn't been changed, there's no need to hash it again, so it moves to the next middleware or operation (by calling next()).
this.password = await bcrypt.hash(this.password, 10):

If the password has been modified, this line hashes the password using bcrypt (a password hashing algorithm).
bcrypt.hash(this.password, 10) hashes the password with a salt rounds factor of 10 (which means more computationally expensive, making it harder to brute-force).
this.password refers to the password field on the current user document. After hashing, it updates the password field with the hashed value.
next():

Once the password has been hashed, the middleware calls next(), signaling to Mongoose to proceed with saving the document to the database.
In summary, this line is setting up a pre-save middleware to ensure that the user's password is hashed before it is saved to the database, enhancing security by preventing the storage of plaintext passwords. */







/*In the method:

javascript
Copy code
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}
Breakdown of password and this.password:
password:

This is the input password provided by the user, typically during login or authentication.
It is passed as an argument to the isPasswordCorrect method when it is called.
Example:
javascript
Copy code
const isCorrect = user.isPasswordCorrect("userInputPassword");
Here, "userInputPassword" is the value of password.
this.password:

This refers to the hashed password stored in the database for the current user document (this refers to the document instance on which the method is called).
During authentication, the method compares the hashed password stored in the database (this.password) with the plaintext password provided by the user (password).
Purpose:
The method uses bcrypt's compare function to verify if the input password matches the stored hashed password.

bcrypt.compare():
Takes two arguments: the plaintext password and the hashed password.
Compares the plaintext password after hashing it internally with the stored hashed password.
Returns true if they match, or false if they do not.
Example Usage:
javascript
Copy code
const user = await User.findOne({ email: "example@example.com" });
if (user) {
    const isCorrect = await user.isPasswordCorrect("userInputPassword");
    if (isCorrect) {
        console.log("Password is correct!");
    } else {
        console.log("Password is incorrect!");
    }
}
Flow:
Input password: Comes from the user (e.g., during login).
Stored this.password: Is retrieved from the database for the current user document.
The method compares them using bcrypt.compare.
Returns true if they match, allowing authentication to proceed.





You said:
this.password = await bcrypt.hash(this.password, 10):

here what is this.password
ChatGPT said:
ChatGPT
In the line:

javascript
Copy code
this.password = await bcrypt.hash(this.password, 10);
What is this.password?
Before hashing:

this.password refers to the plaintext password of the current user document.
It is the value provided by the user during registration or when the password is updated.
Example: If a user registers with a password like mySecurePass123, this.password holds the value mySecurePass123 before hashing.
After hashing:

The bcrypt.hash(this.password, 10) function generates a hashed version of the password using the bcrypt algorithm with a salt rounds factor of 10.
Once the hashing process is complete, the hashed password (a long, randomized string) replaces the original plaintext password in this.password.
Why use this?
In Mongoose middleware or instance methods, this refers to the current document being processed.
For example:
javascript
Copy code
const newUser = new User({ username: "john", password: "mySecurePass123" });
await newUser.save();
In this case, during the pre('save') middleware, this.password refers to "mySecurePass123".
Purpose:
The purpose of this line is to securely hash the user's password before it is stored in the database. This ensures that even if the database is compromised, the actual passwords are not exposed.

Flow:
Plaintext Password: Initially, this.password contains the user's plaintext password.
Hashing: The bcrypt.hash() function hashes this password.
Replace with Hashed Password: The plaintext password in this.password is replaced with its hashed version.
Database Storage: When the document is saved, only the hashed password is stored in the database.
For example:

Input password: "mySecurePass123"
Hashed password: "$2b$10$eImiTXuWVxfM37uY4JANj.QwgwE1JoZP2izFqxXYujYX1".
The database stores the hashed version (this.password). */