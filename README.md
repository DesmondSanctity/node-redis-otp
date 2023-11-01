# node-redis-otp
A Node.js application that utilizes Redis caching capabilities for managing OTPs

# Working with the Project

Download this project from the above link and check out a new branch from the main branch. Create an env file in the project as `.env` and put the below code inside it.

.env
```bash
JWT_SECRET=
ATLAS_URI=
```

Run the application using the command below:
```bash
npm install && npm start
```

> **Note:** The **JWT_SECRET** and **ATLAS_URI** are important to work with this project. You can generate a JWT token using any algorithm or command of choice. The ATLAS URI should be gotten from your MongoDB setup. Now, create all these variables in the project and make sure you set the values for all the variables. Otherwise, the project will not work.
