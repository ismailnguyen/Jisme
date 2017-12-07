var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var sha256 = require("sha256");
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// DATABASE CONFIGURATION BELOW

// Create a database variable outside of the database connection callback to reuse the connection pool in app.
var db;

// Database URL
var db_uri = process.env.MONGODB_URI;

// Database collections
var USERS_COLLECTION = "users";
var ACCOUNTS_COLLECTION = "accounts";

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(db_uri, function (err, database)
{
  if (err)
  {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function ()
  {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// API ROUTES BELOW

var USERS_API_URL = '/api/users';
var ACCOUNTS_API_URL = '/api/accounts';

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code)
{
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

function getCredentialsFromAuth(auth)
{
  const b64auth = (auth.headers.authorization || '').split(' ')[1] || '';
  const [email, user_token] = new Buffer(b64auth, 'base64').toString().split(':');

  var credentials = 
  {
    email: email,
    user_token: user_token
  }

  return credentials;
}

/*  "/users"
 *    GET: retrieves user using his email and password
 *    POST: creates a new user
 */

app.post(USERS_API_URL + "/login", function(req, res)
{
  var user = req.body;

  if (user.email == '' || user.password == '')
  {
    handleError(res, "Invalid user input", "Must provide an email and password.", 400);
    return;
  }

  var encryptedPassword = sha256(user.password);

  db.collection(USERS_COLLECTION)
  .findOne({email: user.email, password: encryptedPassword}, function(err, data)
  {
    if (err)
    {
      handleError(res, err.message, "Failed to find user");
      return;
    }

    if (!data)
    {
      handleError(res, "No user found", "Failed to find user", 404);
      return;
    }

    res.status(200).json(data);
  });
});

app.post(USERS_API_URL + "/register", function(req, res)
{
  var user = req.body;
  user.create_date = new Date();

  if (user.email == '' || user.password == '')
  {
    handleError(res, "Invalid user input", "Must provide an email and password.", 400);
    return;
  }

  // Encrypt user password with SHA256 algorithm
  user.password = sha256(user.password);

  db.collection(USERS_COLLECTION)
  .findOne({email: user.email, password: user.password}, function(err, data)
  {
    if (err)
    {
      handleError(res, err.message, "User already exists");
      return;
    }

    if (data)
    {
      handleError(res, "User found", "User already exists", 403);
      return;
    }

    // Generate unique token for user
    user.token = sha256(user.email + user.password);

    db.collection(USERS_COLLECTION).insertOne(user, function(err, data) 
    {
      if (err)
      {
        handleError(res, err.message, "Failed to create new user.");
        return;
      } 

      res.status(201).json(data.ops[0]);
    });
  });
});

/*  "/accounts/:user_token"
 *    GET: find accounts by user token
 *    POST: add new account for user
 *    PUT: update account by user token
 *    DELETE: deletes account by user token
 */

app.get(ACCOUNTS_API_URL, function(req, res)
{
  var credentials = getCredentialsFromAuth(req);

  db.collection(USERS_COLLECTION)
  .findOne({email: credentials.email, token: credentials.user_token}, function(err, data)
  {
    if (err || !data)
    {
      handleError(res, err.message, "No data found");
      return;
    }

    db.collection(ACCOUNTS_COLLECTION).find({user_id: credentials.user_token}).toArray(function(err, data)
    {
      if (err)
      {
        handleError(res, err.message, "Failed to get accounts.");
        return;
      }
  
      res.status(200).json(data);
    });
  });
});

app.post(ACCOUNTS_API_URL, function(req, res)
{
  var credentials = getCredentialsFromAuth(req);

  db.collection(USERS_COLLECTION)
  .findOne({email: credentials.email, token: credentials.user_token}, function(err, data)
  {
    if (err || !data)
    {
      handleError(res, err.message, "Wrong user");
      return;
    }

    var account = req.body;
    account.user_id = credentials.user_token;
    account.created_date = new Date();
  
    db.collection(ACCOUNTS_COLLECTION).insertOne(account, function(err, data)
    {
      if (err)
      {
        handleError(res, err.message, "Failed to add new account.");
        return;
      }
  
      res.status(201).json(data.ops[0]);
    });
  });
});

app.put(ACCOUNTS_API_URL + "/:account_id", function(req, res)
{
  var credentials = getCredentialsFromAuth(req);
  
  db.collection(USERS_COLLECTION)
  .findOne({email: credentials.email, token: credentials.user_token}, function(err, data)
  {
    if (err || !data)
    {
      handleError(res, err.message, "No data found");
      return;
    }

    var account_id = req.params.account_id;
    
    var account =
    {
      platform: req.body.platform,
      login: req.body.login,
      password: req.body.password,
      tags: req.body.tags,
      user_id: credentials.user_token,
      created_date: req.body.created_date
    };

    db.collection(ACCOUNTS_COLLECTION).updateOne({_id: new ObjectID(account_id), user_id: credentials.user_token}, account, function(err, data)
    {
      if (err)
      {
        handleError(res, err.message, "Failed to update account");
        return;
      }
    
      res.status(200).end();
    });
  });
});

app.delete(ACCOUNTS_API_URL + "/:account_id", function(req, res)
{
  var credentials = getCredentialsFromAuth(req);
  
  db.collection(USERS_COLLECTION)
  .findOne({email: credentials.email, token: credentials.user_token}, function(err, data)
  {
    if (err || !data)
    {
      handleError(res, err.message, "No data found");
      return;
    }

    var account_id = req.params.account_id;
    
    db.collection(ACCOUNTS_COLLECTION).deleteOne({_id: new ObjectID(account_id), user_id: credentials.user_token}, function(err, result)
    {
      if (err)
      {
        handleError(res, err.message, "Failed to delete account");
        return;
      }
      
      res.status(204).end();
    });
  });
});