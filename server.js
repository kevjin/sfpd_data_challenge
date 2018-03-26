require('dotenv').config();
const request = require("request");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

const {AZURE_ML_KEY, GOOGLE_MAPS_KEY} = process.env;


//get data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
let port = process.env.PORT || 8080;
let router = express.Router();

app.set('port', port);

app.use(express.static('public'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
  console.log("Home page accessed successfully.");
});

//TODO: check if really need. Lets websites access our server api
router.use(function(req, res,next) {
  console.log("something is happening");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', (req, res) => {
  res.json({ message: 'hooray! welcome to our api!'});
});

app.use('/api', router);

server.listen(app.get('port'), function() {
  console.log('Node app is listening to', app.get('port'));
});

io.sockets.on('connection', (socket)=> {
console.log('socket io is running');

	socket.on("azureDataRequested",(formData)=> {
		getLatAndLong(formData).then(formData => {getAzurePrediction(formData).then(predictionData => {
			socket.emit("azureFinished",predictionData);
		}, error => {
			console.log("Error: " + error);
		});
  },error=> console.log(error));
	});

});

function getLatAndLong(params) {
  let parsedAddress = params.address.replace(' ', '+');
  var options = { method: 'GET',
  url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+parsedAddress+'&key='+GOOGLE_MAPS_KEY,
 };
  return new Promise((resolve,reject) => {
    request(options, function (error, response, body) {
      if (error) {
        throw new Error(error);
        reject("Invalid Address");
      }
      // let latLong = JSON.parse(body).then(parsedData => {
        bodyObj = JSON.parse(body);
          let newParams = {
          hour: params.hour,
          minute: params.minute,
          latitude: bodyObj.results[0].geometry.location.lat,
          longitude: bodyObj.results[0].geometry.location.lng
        }
        resolve(newParams);
      // }, error=> console.log("failed to parse json"));

      });
  });
}

function getAzurePrediction(params) {
    
    //most of the query string params are useless and are not weighted in the model, which is why hardcoded in
    let queryObject = {
        "Inputs": {
                "input1":
                [
                    {
                            'call_number': "180243072",
                            'unit_id': "84",
                            'incident_number': "18010216",
                            'call_type': "Medical Incident",
                            'call_date': "2018-01-24T00:00:00Z",
                            'watch_date': "2018-01-24T00:00:00Z",
                            'received_timestamp': "2018-01-24 17:36:16.000000 UTC",
                            'entry_timestamp': "2018-01-24 17:38:21.000000 UTC",
                            'dispatch_timestamp': "2018-01-24 17:39:41.000000 UTC",
                            'response_timestamp': "2018-01-24 17:39:45.000000 UTC",
                            'on_scene_timestamp': "2018-01-24 17:53:42.000000 UTC",
                            'transport_timestamp': "2018-01-24 18:16:32.000000 UTC",
                            'hospital_timestamp': "2018-01-24 18:44:08.000000 UTC",
                            'call_final_disposition': "Code 2 Transport",
                            'available_timestamp': "2018-01-24 19:16:11.000000 UTC",
                            'address': "700 Block of 44TH AVE",
                            'city': "San Francisco",
                            'zipcode_of_incident': "94121",
                            'battalion': "B07",
                            'station_area': "34",
                            'box': "7273",
                            'original_priority': "2",
                            'priority': "2",
                            'final_priority': "2",
                            'als_unit': "true",
                            'call_type_group': "Non Life-threatening",
                            'number_of_alarms': "1",
                            'unit_type': "MEDIC",
                            'unit_sequence_in_call_dispatch': "1",
                            'fire_prevention_district': "7",
                            'supervisor_district': "1",
                            'neighborhood_district': "",
                            'location': "(37.77444199483868, -122.5046792231959)",
                            'row_id': "180243072-84",
                            'latitude': "37.77444199",
                            'longitude': "-122.5046792",
                            'adjusted_latitude': (params.latitude - 37),
                            'adjusted_longitude': (params.longitude + 122),
                            'Column 38': "",
                            'hour_of_day': params.hour,
                            'minute_of_day': params.minute
                    }
                ],
        },
    "GlobalParameters":  {
    }

} //end of query request

//turn into JSON for post request
let queryJSON = JSON.stringify(queryObject);

//post request
var options = { method: 'POST',
  url: 'https://ussouthcentral.services.azureml.net/workspaces/c2e03728259c4ee5b4adf87d9d061573/services/fdcbcec6b4ca478d88f94bb76158fba2/execute',
  qs: { 'api-version': '2.0', format: 'swagger' },
  headers: 
   { 'postman-token': 'b10bd80f-5736-7081-e011-8d917afff328',
     'cache-control': 'no-cache',
     authorization: 'Bearer '+AZURE_ML_KEY,
     'content-type': 'application/json' },
     body:  queryJSON
 };
	return new Promise((resolve,reject) => {
		request(options, function (error, response, body) {
		  if (error) {
		  	throw new Error(error);
		  	reject(error);
		  }

      //if no error, return the model results
		  resolve(body);
			});
	});
}
