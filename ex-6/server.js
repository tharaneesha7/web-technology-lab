const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/';
const dbName = 'hello';

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log("Successfully connected to MongoDB");
    const db = client.db(dbName);

    db.createCollection("user", function(err, res) {
      if (err) throw err;
      console.log("Collection 'user' created!");
    });

    function insertFormData(formData) {
      const collection = db.collection('user');
      collection.insertOne(formData, function(err, res) {
        if (err) throw err;
        console.log("Form data inserted into MongoDB:", formData);
      });
    }

    function updateFormData(id, field, value) {
      console.log("Updating form data for ID:", id);
      console.log("Update field:", field);
      console.log("New value:", value);

      const collection = db.collection('user');
      const query = { id: id };
      const update = { $set: {} };
      update.$set[field] = value;

      collection.updateOne(query, update, function(err, res) {
        if (err) {
          console.error("Error updating form data:", err);
        } else {
          console.log("Form data updated in MongoDB with ID:", id);
        }
      });
    }

    function deleteFormData(id) {
      const collection = db.collection('user');
      const query = { id: id }; 

      collection.deleteOne(query, function(err, res) {
        if (err) throw err;
        console.log("Form data deleted from MongoDB with ID:", id);
      });
    }

    async function displayFormData(response) {
      console.log("Fetching form data from MongoDB...");
      try {
          var collection = db.collection('user');
          var cursor = await collection.find({}).toArray();
          console.log(cursor);
  
          let htmlResponse = `
          <html>
              <head>
                  <title>Form Data</title>
                  <style>
                      .container {
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          height: 100vh;
                      }
                      table {
                          border-collapse: collapse;
                          width: 70%;
                          height:20%
                        }
                      th, td {
                          border: 1px solid #ddd;
                          padding: 8px;
                          text-align: left;
                      }
                      th {
                          background-color: #f2f2f2;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <table>
                          <tr>
                              <th>Username</th>
                              <th>ID</th>
                              <th>Branch</th>
                              <th>Mobile No</th>
                              <th>Gender</th>
                              <th>Branch Address</th>
                          </tr>`;
  
          cursor.forEach(entry => {
              htmlResponse += `
              <tr>
                  <td>${entry.username}</td>
                  <td>${entry.id}</td>
                  <td>${entry.branch}</td>
                  <td>${entry.mobileNo}</td>
                  <td>${entry.gender}</td>
                  <td>${entry.branchadd}</td>
              </tr>`;
          });
  
          htmlResponse += `
                      </table>
                  </div>
              </body>
          </html>`;
  
          response.writeHead(200, { 'Content-Type': 'text/html' });
          response.end(htmlResponse);
      } catch (error) {
          console.error("Error fetching form data:", error);
          response.writeHead(500, { 'Content-Type': 'text/plain' });
          response.end("Error fetching form data");
      }
  }
  
    startServer(insertFormData, updateFormData, deleteFormData, displayFormData);
  })
  .catch(err => console.error("Error connecting to MongoDB:", err));

function startServer(insertFormData, updateFormData, deleteFormData, displayFormData) {
  function onRequest(req, res) {
    var path = url.parse(req.url).pathname;
    console.log('Request for ' + path + ' received');

    if (req.method === 'POST') {
      var body = '';
      req.on('data', function(data) {
        body += data;
      });
      req.on('end', function() {
        var params = querystring.parse(body);

        var formData = {
          username: params["username"],
          id: params["id"] || params["deleteId"], 
          branch: params["branch"],
          mobileNo: params["phno"],
          gender: params["gender"],
          branchadd: params["branchadd"]
        };

        if (params["updateId"]) {
          updateFormData(params["updateId"], params["updateField"], params["updateValue"]);
        } else if (params["deleteId"]) {
          deleteFormData(params["deleteId"]);
        } else {
          insertFormData(formData);
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Data received successfully');
      });
    } else if (req.method === 'GET' && path === '/display') {
      displayFormData(res);
    } else {
      res.writeHead(405, {'Content-Type': 'text/plain'});
      res.end('Method Not Allowed');
    }
  }

  http.createServer(onRequest).listen(7050);
  console.log('Server is running...');
}