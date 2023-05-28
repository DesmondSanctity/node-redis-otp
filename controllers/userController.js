import UserModel from '../model/User.model.js'
import { client } from '../server.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';

/** POST: http://localhost:8080/api/user/verify 
 * @param : {
  "username" : "example123",
  "email" : "example@gmail.com",
  "otp" : "1234",
}
*/
export async function verifyUser(req, res, next) {
    try {

        const { username, email, otp } = req.body; console.log(req.body)

        // check the user existance
        let exist = await UserModel.findOne({ username: username });
        if (!exist) return res.status(404).send({ error: "Can't find User!" });

        // Retrieve the stored OTP from Redis, using the user's email as the key
        const storedOTP = await client.get(email);

        if (storedOTP === otp) {
            // If the OTPs match, delete the stored OTP from Redis
            client.del(email);

            // Update the user's isVerified property in the database
            await UserModel.findOneAndUpdate({ username }, { isVerified: true });

            // Send a success response
            res.status(200).send('OTP verified successfully');
        } else {
            // If the OTPs do not match, send an error response
            res.status(400).send('Invalid OTP');
        }
        next();

    } catch (error) {
        return res.status(500).send({ error });
    }
}


/** POST: http://localhost:8080/api/user/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william"
}
*/
export async function register(req, res) {

    try {
        const { username, password, email, firstName, lastName } = req.body;

        // Generate a random OTP using the otp-generator package
        const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        console.log(otp)
        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username: username }, function (err, user) {
                if (err) reject(new Error(err))
                if (user) reject({ error: "Please use unique username" });

                resolve();
            })
        });

        // check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email: email }, function (err, email) {
                if (err) reject(new Error(err))
                if (email) reject({ error: "Please use unique Email" });

                resolve();
            })
        });

        await Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {

                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                email,
                                firstName,
                                lastName
                            });
                            console.log(user)
                            // Store the OTP in Redis, with the user's email as the key
                            client.set(email, otp);

                            const { password, ...responseUser } = user._doc;
                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully", OTP: otp, User: responseUser }))
                                .catch(error => res.status(500).send({ error }))

                        }).catch(error => {
                            return res.status(500).send({
                                error: "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({ error })
            })


    } catch (error) {
        return res.status(500).send(error);
    }

}


/** POST: http://localhost:8080/api/user/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {

    const { username, password } = req.body;

    try {

        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if (!passwordCheck) return res.status(400).send({ error: "Don't have Password" });

                        // create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, process.env.JWT_SECRET, { expiresIn: "24h" });

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user.username,
                            token
                        });

                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Password does not Match" })
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "Username not Found" });
            })

    } catch (error) {
        return res.status(500).send({ error });
    }
}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {

    const { username } = req.params;

    try {

        if (!username) return res.status(501).send({ error: "Invalid Username" });

        UserModel.findOne({ username }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(501).send({ error: "Couldn't Find the User" });

            /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);
        })

    } catch (error) {
        return res.status(404).send({ error: "Cannot Find User Data" });
    }

}


/** PUT: http://localhost:8080/api/user/update 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
    try {

        // const id = req.query.id;
        const { userId } = req.body;

        if (userId) {
            const body = req.body;

            // update the data
            UserModel.updateOne({ _id: userId }, body, function (err, data) {
                if (err) throw err;

                return res.status(201).send({ msg: "Record Updated...!" });
            })

        } else {
            return res.status(401).send({ error: "User Not Found...!" });
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}

/** DELETE: http://localhost:8080/api/user/delete 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function deleteUser(req, res) {
    try {

        // const id = req.query.id;
        const { userId } = req.params;

        if (userId) {

            // update the data
            UserModel.deleteOne({ _id: userId }, function (err, data) {
                if (err) throw err;

                return res.status(201).send({ msg: "Record Deleted...!" });
            })

        } else {
            return res.status(401).send({ error: "User Not Found...!" });
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}