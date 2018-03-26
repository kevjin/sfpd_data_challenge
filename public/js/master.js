//google maps object
let map;

//socketIO for communication between client and server
const socket = io();

//create google maps display
function initMap() {
  let zipCode1 = {lat: 37.735886, lng: -122.460763} //N E coordinates
  let zipCode2 = {lat: 37.790161, lng: -122.392090}
  let sanFrancisco = {lat: 37.7749, lng: -122.4194} //city center coordinates our map will default at
  map = new google.maps.Map(document.getElementById('zipcodes_map'), {
    zoom: 12,
    center: {lat: sanFrancisco.lat, lng: sanFrancisco.lng},
    mapTypeId: 'roadmap'
  });

  //add markers for both of the weird zip codes
  let marker = new google.maps.Marker({
    position: zipCode1,
    map: map
  });

  marker = new google.maps.Marker({
    position: zipCode2,
    map: map
  });

}

//when button click to run machine learning, this function is called
function azureDataRequested() {
    let formData = getFormData();
    socket.emit("azureDataRequested", formData);
}

//when server has finished with machine learning, return results back
socket.on("azureFinished", predictionData=> {
  if(predictionData) {
      let data = JSON.parse(predictionData);
      let answerText = document.getElementById('predicted_emergency_answer');
      answerText.textContent = data['Results']['output1'][0]['Scored Labels'];
  }
  else {
    console.log("nothing was returned back.. async error?");
  }
})

//get the input data for ML prediction
function getFormData() {
  let formAddress = document.getElementById('formAddress').value;
  let formHour = document.getElementById('formHour').value;
  let formMinute = document.getElementById('formMinute').value;
  let radios = document.getElementsByName('AMorPM');
  if(radios[1].checked) {
    formHour = formHour+12;
  }

  return {
    address: formAddress,
    hour: formHour,
    minute: formMinute,
  }
}
