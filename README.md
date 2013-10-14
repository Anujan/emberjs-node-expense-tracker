## Expense Tracker
This is an expense tracking web app I created to help me get familiar with NodeJS. It's built with NodeJS, EmberJS and MongoDB. 

## Usage

### Local
* Clone the repo
* run the following commands 
        
        npm install
        node app.js


* The app should be running at [localhost:3000](http://localhost:3000)

###Heroku
* Clone the repo
* run the following commands

    
        heroku create
        git push heroku master
        heroku config:set NODE_ENV=production
        heroku addons:add mongolab #You can use mongohq if you like

* Type `heroku open` and the app should be there


##[License](https://github.com/Anujan/emberjs-node-expense-tracker/LICENSE.md)
The MIT License (MIT)

Copyright (c) 2013 Anujan Panchadcharam

        