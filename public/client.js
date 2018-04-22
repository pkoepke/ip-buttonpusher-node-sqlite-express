// client side JS.

// List of functions to run as soon as the page loads.
window.addEventListener('load', runshowLastTenAddressesOnLoad, false);
window.addEventListener('load', displayNumberOfEntries, false);
window.addEventListener('load', updateNumberOfIpsOnTimer, false);

function runshowLastTenAddressesOnLoad() {
  showLastTenAddresses(writeResponseToPage);
}

function updateNumberOfIpsOnTimer() {
  const updateInterval = 60000;
  setInterval( displayNumberOfEntries, updateInterval);
}

function hideShowSpinner(action) {
  let spinnerDiv = document.getElementById('loadingSpinnerDiv');
  if (action == 'show') {
    spinnerDiv.style.display = 'block';
    return 'Spinner shown.';
  } else if (action == 'hide') {
    spinnerDiv.style.display = 'none';
    return 'Spinner hidden';
  } else if (spinnerDiv.style.display == 'none') {
    spinnerDiv.style.display = 'block';
    return 'Spinner shown.';
  } else {
    spinnerDiv.style.display = 'none';
    return 'Spinner hidden';
  }
}

// Button handlers

function storeIp(callback) {
  if (typeof callback === 'undefined') { callback = function() {}; }
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() { // anonymous callback that runs when the request's state changes
    if (httpRequest.readyState == 4 && httpRequest.status == 200) { // if the state is '4' aka DONE and the status aka HTTP response code is 200 aka OK, run the handler code. Otherwise do nothing, so no else.
      callback(httpRequest.responseText); // run the callback function, and pass it the response text as a DOMstring.
      showLastTenAddresses(writeResponseToPage); // show last 10 addresses just for fun.
      displayNumberOfEntries(); // update the number of entries.
    }
  }
  httpRequest.open('GET', './storeip', true); // initialize the request. (method, URL, asnc true/false) - last one should be true for async.
  httpRequest.send(null); // same as .send() but it's an old compatibility convention to explicitly declar null here.
  hideShowSpinner('show');
}

function showLastTenAddresses(callback) {
  if (typeof callback === 'undefined') { callback = function() {}; }
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() { // anonymous callback that runs when the request's state changes
    if (httpRequest.readyState == 4 && httpRequest.status == 200) { // if the state is '4' aka DONE and the status aka HTTP response code is 200 aka OK, run the handler code. Otherwise do nothing, so no else.
      callback(httpRequest.responseText); // run the callback function, and pass it the response text as a DOMstring.
    }
  }
  httpRequest.open('GET', './showlasttenaddresses', true); // initialize the request. (method, URL, asnc true/false) - last one should be true for async.
  httpRequest.send(null); // same as .send() but it's an old compatibility convention to explicitly declar null here.
  hideShowSpinner('show');
}

function showAllAddresses(callback) {
  if (typeof callback === 'undefined') { callback = function() {}; }
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() { // anonymous callback that runs when the request's state changes
    if (httpRequest.readyState == 4 && httpRequest.status == 200) { // if the state is '4' aka DONE and the status aka HTTP response code is 200 aka OK, run the handler code. Otherwise do nothing, so no else.
      callback(httpRequest.responseText); // run the callback function, and pass it the response text as a DOMstring.
    }
  }
  httpRequest.open('GET', './showalladdresses', true); // initialize the request. (method, URL, asnc true/false) - last one should be true for async.
  httpRequest.send(null); // same as .send() but it's an old compatibility convention to explicitly declar null here.
  hideShowSpinner('show');  
}

function writeResponseToPage(responseString) {
  hideShowSpinner('hide'); // assume that the response was received, so hide the spinner.
  let outputDiv = document.getElementById('outputDiv');
  
  let responseObject = JSON.parse(responseString); // response is assumed to be a JSON string. Will need to parse it to an object to use it appropriately.
  outputDiv.innerHTML = '<p class="url">' + responseObject.url + '</p>' ;
  
  if (responseObject.ipsArray) {
    let newHtmlString = '<div class="entriesDiv">';
    responseObject.ipsArray.forEach( function (entry) {
      newHtmlString += '<p><span class="ipAddress">' + entry[0] + '</span><span class="timestamp">' +  entry[1] + '</span></p>';
    });
    newHtmlString += '</div>';
    outputDiv.innerHTML += newHtmlString;
  }
  // Following lines for testing only - will just print the JSON strong to the page for now.
  //outputDiv.innerHTML = responseString;
}

function displayNumberOfEntries() {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() { // anonymous callback that runs when the request's state changes
    if (httpRequest.readyState == 4 && httpRequest.status == 200) { // if the state is '4' aka DONE and the status aka HTTP response code is 200 aka OK, run the handler code. Otherwise do nothing, so no else.
      (function (responseText){
        let responseObject = JSON.parse(responseText); // response is assumed to be a JSON string. Will need to parse it to an object to use it appropriately.
        let button = document.getElementById('showAllAddressesButton');
        let buttonValue = button.value;
        buttonValue = buttonValue.split(' ');
        if (!buttonValue[5]) { // If there is no 5th element, i.e. there is no number in the string yet.
          buttonValue = buttonValue[0] + ' ' + buttonValue[1] + ' ' + responseObject.count + ' ' + buttonValue[2] + ' ' + buttonValue[3] + ' ' + buttonValue[4];
        } else {
          buttonValue = buttonValue[0] + ' ' + buttonValue[1] + ' ' + responseObject.count + ' ' + buttonValue[3] + ' ' + buttonValue[4] + ' ' + buttonValue[5];
        }
        button.value = buttonValue;
      }(httpRequest.responseText)); // run the callback function, and pass it the response text as a DOMstring.
    }
  }
  httpRequest.open('GET', './countEntries', true); // initialize the request. (method, URL, asnc true/false) - last one should be true for async.
  httpRequest.send(null); // same as .send() but it's an old compatibility convention to explicitly declar null here.
}

// Time conversion functions

function convertTimeZoneAllAtOnce() {
  let allTimestamps = document.getElementsByClassName('timestamp');
  allTimestamps = Array.from(allTimestamps); // Convert nodeList to an array because iOS Safari doesn't fully support for of - it only allows for of on arrays.
  for (let timestamp of allTimestamps) {
    timestamp.innerHTML = convertTimeFormat(timestamp.innerHTML);
  }
}

function convertTimeZoneOneByOne() {
  let allTimestamps = document.getElementsByClassName('timestamp');
  
  var i = 0, l = allTimestamps.length;
  (function iterator() {
    allTimestamps[i].innerHTML = convertTimeFormat(allTimestamps[i].innerHTML);
    if(++i<l) {
        setTimeout(iterator, 1);
    }
  })();
}

function convertTimeFormat(dateTimeToConvert) {
  if (dateTimeToConvert.substr(-1) == 'Z') { // If it's in UTC format, convert to the local time zone.
    dateTimeToConvert = new Date(dateTimeToConvert); // create new Date object based on dateTime
    dateTimeToConvert = dateTimeToConvert.getTime(); // turn Date object into milliseconds since 1970/01/01. Removes time zones entirely as miliseconds are universal. Tested same time in different time zones and the date > miliseconds > date conversion works correctly.
    dateTimeToConvert = new Date(dateTimeToConvert); // create a new Date object using miliseconds. Will be in client's time zone.
    let datetimeOptions = { day:'numeric', month:'numeric', year:'2-digit', hour:'numeric', minute:'numeric', second:'numeric',  timeZoneName:'short' } // Produces e.g. 4/28/17, 6:34:56 AM EDT
    dateTimeToConvert = dateTimeToConvert.toLocaleString('en-us', datetimeOptions);
  } else { // Else convert back to UTC format
    dateTimeToConvert = new Date(dateTimeToConvert); // create new Date object based on dateTime
    dateTimeToConvert = dateTimeToConvert.getTime(); // turn Date object into milliseconds since 1970/01/01. Removes time zones entirely as miliseconds are universal. Tested same time in different time zones and the date > miliseconds > date conversion works correctly.
    dateTimeToConvert = new Date(dateTimeToConvert).toISOString(); // create a new Date object using miliseconds. Will be in client's time zone.
  }
  return dateTimeToConvert;
}
