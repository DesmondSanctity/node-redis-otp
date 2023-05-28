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


}


/** POST: http://localhost:8080/api/user/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {

    
}
