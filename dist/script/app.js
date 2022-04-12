const inputBtn = document.querySelector("#input-btn");
const inputField = document.querySelector("#ip-adress");
const detailsElements = document.querySelectorAll("[data-id]");

const ipAdresPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/;
const apiKey = "at_Ou77WibxoWXFElRSqdbqvggeSTGWq";
const apiUrl = "https://geo.ipify.org/api/v1?";

// setting a media query object 
const queryMedia = window.matchMedia("(max-width: 44.9em)");

inputField.addEventListener("keydown", (e) => {
  const value = e.currentTarget.value;
  if (e.keyCode == 13) {
    e.preventDefault();
    checkIp(value) && processIpAddress(value);
  }
});

inputBtn.addEventListener("click", () => {
  const value = inputField.value;
  checkIp(value) && processIpAddress(value);
});

function checkIp(ipAddress) {
  inputField.value = "";
  if (ipAddress.match(ipAdresPattern)) return ipAddress;
  else alert("Invalid Ip Address. Please try again");
}

function queryHandler(location) {
    const offseYCordinate = latLngConverter(location);
  if (queryMedia.matches) {
      map.setView(offseYCordinate, 13);
    } else {
      map.setView(location, 13);
  }
}

function latLngConverter(location){
    let pixelCordinate = map.project(location, 13);
    pixelCordinate.y -= 100;
    const latLng = map.unproject(pixelCordinate, 13);
    return [latLng.lat, latLng.lng]
}

queryMedia.addEventListener('change', e => queryHandler(latLngPos));

processIpAddress();


let map;
let markerIcon;
let myMark;
let latLngPos;

function init(location, city) {
    map = L.map("map");
    queryHandler(location);
    markerIcon = L.icon({
    iconUrl: "dist/images/icon-location.png",
    shadowUrl: "dist/images/icon-location3.png",

    iconSize: [30, 45],
    shadowSize: [38, 75],
    iconAnchor: [20, 70],
    shadowAnchor: [17, 70],
    popupAnchor: [-5, -58],
  });
  myMark = L.marker(location, { icon: markerIcon }).addTo(map);

  map.zoomControl.setPosition("bottomright");
  myMark
    .bindPopup(
      `<p style="text-align: center;">Current Location</br><span><b>${city}</b></span></p>`
    )
    .openPopup();

  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      toolbarAnchor: [0, 0],
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        "pk.eyJ1IjoibG91bG91OTIwOSIsImEiOiJjbDFiZ2huY3IwODF1M2NsNXF5eDd4YXRsIn0.Z1hLqP6WuK-0A2I8ibmYnw",
    }
  ).addTo(map);
}

async function getAddressdata(ipAddress) {
  const requestUrl = ipAddress
    ? `${apiUrl}apiKey=${apiKey}&ipAddress=${ipAddress}`
    : `${apiUrl}apiKey=${apiKey}`;
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error("The request operation failed!");
  }
  return response.json();
}

async function processIpAddress(ipAddress) {
  let addressData;
  try {
    addressData = await getAddressdata(ipAddress);
  } catch (err) {
    return console.log("An error occured: " + err);
  }

  const latlng = [addressData.location.lat, addressData.location.lng];
  latLngPos = latlng;
  
  detailsElements.forEach((element) => {
    if (element.dataset.id === "timezone") {
      element.textContent = addressData.location[element.dataset.id];
    } else if (element.dataset.id === "location") {
      element.textContent = `${addressData.location.city}, ${addressData.location.region} ${addressData.location.postalCode}`;
    } else {
      element.textContent = addressData[element.dataset.id];
    }
  });

  if (!ipAddress) {
    return init(latlng, addressData.location.city);
  }

  const latLngOffsetY = latLngConverter(latlng);
  map.flyTo(latLngOffsetY);
  myMark.setLatLng(latlng);
  myMark.bindPopup(
      `<p style="text-align: center;">Current Location</br><span><b>${addressData.location.city}</b></span></p>`
  );
}