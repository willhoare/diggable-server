This is the repo for the backend portion of Diggable, a crowd-funding platform specifically targeted at Independent musicians. Diggable aims to help alleviate the financial stress of touring by allowing artists to set a financial goal and offer unique rewards to their fans to help them reach that goal.

This is the server side/backend repo only, and should be run in conjunction with the frontend repo which can be found at https://github.com/willhoare/diggable-frontend

This server was built using Node.js, Express and utilizing a payments API from Stripe.com. All dependencies will need to be installed by running 'npm i' in the terminal. 

I have included my API key for Stripe in the dotenv for marking and demo purposes, in future it will be removed.
 
Once all dependencies have been installed, run 'node index.js' or 'node --watch index.js' in the terminal in order to start the server. 
 
 Then run npm start on the front end to launch the application.
