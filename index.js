const LaunchDarkly = require('launchdarkly-node-server-sdk');
const express = require('express')
const app = express()
const port = 3000
const ldclient = LaunchDarkly.init('sdk-700ea264-7cf0-4996-b419-b86f54f3e230');
console.log('Initializing ldclient. Show feature:' +ldclient );
const user = {
    firstName: 'Bob',
    lastName: 'Loblaw',
    keys: ['friendly-greeting','friendly-info'],
    custom: {
      groups: 'beta_testers'
    }
  };

app.get('/', (req, res) => {
    ldclient.variation('friendly-greeting', user, false, function(err, showFeature) {
        if (showFeature) {
          // application code to show the feature
          console.log('Showing your feature to ' + user.keys[0] );
          res.send(`Hello ${user.firstName} ${user.lastName}!`)
        } else {
          // the code to run if the feature is off
          console.log('Not showing your feature to ' + user.keys[0]);
          res.send('Hello World!')
        }
      })
    ldclient.variation('friendly-info', user, false, function(err, showFeature) {
          if (showFeature) {
            // application code to show the feature
            console.log('Showing your feature to ' + user.keys[1] );
            res.send(`Today is Monday!`)
          } else {
            // the code to run if the feature is off
            console.log('Not showing your feature to ' + user.keys[1]);
            res.send('Nothing to show!')
          }
      })
      
})

const server=app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
  ldclient.once('ready', function() {
    ldclient.variation('friendly-greeting', user, false, function(err, showFeature) {
      if (showFeature) {
        // application code to show the feature
        console.log('Showing your feature to ' + user.keys[0] );
      } else {
        // the code to run if the feature is off
        console.log('Not showing your feature to ' + user.keys[0]);
      }
    });
  });
  
function exitHandler(options, exitCode) {
    server.close(() => {
        debug('HTTP server closed')
      })
      
    if (options.cleanup) {
        console.log('clean');
        console.log('Closing ldclient ');
        // Close the LaunchDarkly SDK to flush all buffered events and close all open connections.
        //
        // IMPORTANT: in a real application, this step is something you would only do when the application is
        // about to quit-- NOT after every call to variation(). The reason that this step is inside the variation
        // handler is flags cannot be evaluated after the SDK is closed.
        ldclient.close();        
    }

    if (exitCode || exitCode === 0) console.log(exitCode);

    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGTERM', () => exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
