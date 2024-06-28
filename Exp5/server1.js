var http = require('http');
var querystring = require('querystring');

function onRequest(req, res) {
  if (req.method === 'POST') {
    var postData = '';
    req.on('data', function(data) {
      postData += data;
    });
    req.on('end', function() {
      var params = querystring.parse(postData);
      var username = params["username"];
      var id = params["id"];
      var branch = params["branch"];
      var mobileNo = params["phno"];
      var gender = params["gender"];
      var branchadd = params["branchadd"];

      // HTML response
      var htmlResponse = `
        <html>
        <head>
        <title>User Details</title>
        <style>
          table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 50%;
            margin: 20px auto;
          }
          td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
            background-color: black;
            color:white;
          }
          th {
            background-color: orange;
            color:white;
          }
        </style>
        </head>
        <body>
        <h2>User Details</h2>
        <table>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Username</td>
            <td>${username}</td>
          </tr>
          <tr>
            <td>ID</td>
            <td>${id}</td>
          </tr>
          <tr>
            <td>Branch</td>
            <td>${branch}</td>
          </tr>
          <tr>
            <td>Mobile No</td>
            <td>${mobileNo}</td>
          </tr>
          <tr>
            <td>Gender</td>
            <td>${gender}</td>
          </tr>
          <tr>
            <td>Branch Address</td>
            <td>${branchadd}</td>
          </tr>
        </table>
        </body>
        </html>
      `;
      
      // Write the HTML response
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(htmlResponse);
      res.end();
    });
  } else {
    // Method not allowed
    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('Method Not Allowed');
  }
}

http.createServer(onRequest).listen(9000);
console.log('Server is running...');
