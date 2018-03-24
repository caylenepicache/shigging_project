 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyC_HsCc08nxb6JP0CyGZq3CxIJrhKsbplU",
    authDomain: "project-monarch-e3503.firebaseapp.com",
    databaseURL: "https://project-monarch-e3503.firebaseio.com",
    projectId: "project-monarch-e3503",
    storageBucket: "project-monarch-e3503.appspot.com",
    messagingSenderId: "181317180117"
  };
  firebase.initializeApp(config);

var database = firebase.database();
var userRef = database.ref();
var newDataPoint = "";
var user = "";
var password = "";
var keyword ="";
var searchResults;
var ingredientArray = [];
var topics =[];
var searchHistory=[];
var userSep = [];

//   Get elements

const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

// Add login event
btnLogin.addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    // Sign in
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
});

// Add signup event
btnSignUp,addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    // Sign in
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
});

btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
    userSep = [];

});


// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);
        btnLogout.classList.remove('hide');
        user = $("#txtEmail").val();
        password = $("#txtPassword").val();
        userSep = user.split("@");
        firebase.database().ref().child("users/" + userSep[0]);
        firebase.database().ref('users/' + userSep[0]).push({
            password: password
        });

    }

    else {
        console.log('not logged in')
        btnLogout.classList.add('hide');
    }
});


function doAjaxButton() {

    console.log("im here");

    // Sends data to database
    var thisDataButton = $(this).attr("data-name");
    console.log(thisDataButton);

    // Handles call to Youtube API
    $("#videos-view").empty();
    $("#displayRecipe").empty();
    $("#buttons").empty();
    $(".dropdown-content").empty();

    var params = $.param({
        part: 'snippet, id',
        maxResults: '1',
        q: thisDataButton,
        type: 'video',    
        key: 'AIzaSyBbcLfQsPms45781ZJd_5pwv-V3sj6G9C0'
    });
    var url = "https://www.googleapis.com/youtube/v3/search?" + params;
    console.log(url);

    q = $(".input").val();

    searchHistory.push(keyword);
    
    var userData = {history: searchHistory};
    var newHistory = {};
    newHistory['/users/' + userSep[0]] = userData
    console.log(userSep[0]);
    firebase.database().ref().update(newHistory);

    $.ajax({
      url: url,
      method: "GET"
    }).then(function(data) {

    var nextPageToken = data.nextPageToken;
    var prevPageToken = data.prevPageToken;
    console.log(data)

    console.log("Response length: " + data.items.length)
    
    $.each(data.items, function(i, item){ 

        var result = showVideos(item);

        $("#videos-view").append(result)
    });

    var buttons = showButtons(prevPageToken, nextPageToken);

    $("#buttons").append(buttons);

});
// Handles ajax call to recipe API
$("#displayRecipe").empty();

var recipeInput = keyword;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
var baseURL = "http://api.yummly.com/v1/api/recipes?_app_id=87b4ae84&_app_key=1c317fe13d2c932506f2c1aab86f67b6&q=";
var queryURL =  corsProxy + baseURL + thisDataButton;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
console.log(queryURL);

$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response){
  console.log(response);

  var newDiv = $("<div>");
  newDiv.addClass("addedDiv");
  $("#displayRecipe").append(newDiv);
  

var recipeTitle = response.matches[0].recipeName;
console.log(recipeTitle);
newDiv.append("<h1>" + recipeTitle + "</h1>");

var ingredientArray = response.matches[0].ingredients;
console.log(ingredientArray);

var ingredientTitleString = "Ingredients";
newDiv.append("<h3>" + ingredientTitleString + "</h3>");

for (i = 0; i < ingredientArray.length; i++){
    var recipeIngredients = JSON.stringify(response.matches[0].ingredients[i]);
    recipeIngredients = recipeIngredients.replace('[',' ');
    recipeIngredients = recipeIngredients.replace(']',' ');
    recipeIngredients = recipeIngredients.replace(/["]+/g,' ');
    newDiv.append(recipeIngredients + "<br>");
    
}

console.log(recipeIngredients);
$("#displayRecipe").append(newDiv); 

});

makeButtons();
};




function doAjaxCall() {

    // Sends data to database
    

    // Handles call to Youtube API
    $("#videos-view").empty();
    $("#displayRecipe").empty();
    $("#buttons").empty();

    var params = $.param({
        part: 'snippet, id',
        maxResults: '1',
        q: keyword,
        type: 'video',    
        key: 'AIzaSyBbcLfQsPms45781ZJd_5pwv-V3sj6G9C0'
    });
    var url = "https://www.googleapis.com/youtube/v3/search?" + params;
    console.log(url);

    q = $(".input").val();

    searchHistory.push(keyword);
    
    var userData = {history: searchHistory};
    var newHistory = {};
    newHistory['/users/' + userSep[0]] = userData
    console.log(userSep[0]);
    firebase.database().ref().update(newHistory);

    $.ajax({
      url: url,
      method: "GET"
    }).then(function(data) {

    var nextPageToken = data.nextPageToken;
    var prevPageToken = data.prevPageToken;
    console.log(data)

    console.log("Response length: " + data.items.length)
    
    $.each(data.items, function(i, item){ 

        var result = showVideos(item);

        $("#videos-view").append(result)
    });

    var buttons = showButtons(prevPageToken, nextPageToken);

    $("#buttons").append(buttons);

});
// Handles ajax call to recipe API
$("#displayRecipe").empty();

var recipeInput = keyword;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
var baseURL = "http://api.yummly.com/v1/api/recipes?_app_id=87b4ae84&_app_key=1c317fe13d2c932506f2c1aab86f67b6&q=";
var queryURL =  corsProxy + baseURL + recipeInput;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
console.log(queryURL);

$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response){
  console.log(response);

  var newDiv = $("<div>");
  newDiv.addClass("addedDiv");
  $("#displayRecipe").append(newDiv);
  

var recipeTitle = response.matches[0].recipeName;
console.log(recipeTitle);
newDiv.append("<h1>" + recipeTitle + "</h1>");

var ingredientArray = response.matches[0].ingredients;
console.log(ingredientArray);

var ingredientTitleString = "Ingredients";
newDiv.append("<h3>" + ingredientTitleString + "</h3>");

for (i = 0; i < ingredientArray.length; i++){
    var recipeIngredients = JSON.stringify(response.matches[0].ingredients[i]);
    recipeIngredients = recipeIngredients.replace('[',' ');
    recipeIngredients = recipeIngredients.replace(']',' ');
    recipeIngredients = recipeIngredients.replace(/["]+/g,' ');
    newDiv.append(recipeIngredients + "<br>");
    
}

console.log(recipeIngredients);
$("#displayRecipe").append(newDiv); 

});

makeButtons();
};

function makeButtons() {
    $(".dropdown-content").empty();

    var historyRef = firebase.database().ref();
    historyRef.on("child_added",function(snapshot){


    for (var i = 0; i < snapshot.val().history.length; i++) {
        var a = $('<a>' + snapshot.val().history[i] + '</a>');
            a.addClass("dropdown-item");
            a.attr("data-name", snapshot.val().userSep[0].history[i]);
            console.log(snapshot.val().userSep[0].history[i]);
            a.text(snapshot.val().userSep[0].history[i]);
            $(".dropdown-content").append(a);
    }
})
}

    $(document).on("click", ".dropdown-item", doAjaxButton);


function showPrevPage() {
    var token = $("#prev-button").data('token');
    var q = $('#prev-button').data('query');
    
    $("#videos-view").empty();
    $("#buttons").empty();

    var params = $.param({
        part: 'snippet, id',
        maxResults: '1',
        q: keyword,
        pageToken: token,
        type: 'video',    
        key: 'AIzaSyBbcLfQsPms45781ZJd_5pwv-V3sj6G9C0'
    });
    var url = "https://www.googleapis.com/youtube/v3/search?" + params;
    console.log(url);

    q = $(".input").val();

    $.ajax({
      url: url,
      method: "GET"
    }).then(function(data) {

    var nextPageToken = data.nextPageToken;
    var prevPageToken = data.prevPageToken;

    console.log("Response length: " + data.items.length)
    
        $.each(data.items, function(i, item){ 

            var result = showVideos(item);

            $("#videos-view").append(result)
        });

        var buttons = showButtons(prevPageToken, nextPageToken);

        $("#buttons").append(buttons);

    });
};

function showNextPage() {
    var token = $("#next-button").data('token');
    var q = $('#next-button').data('query');
    
    $("#videos-view").empty();
    $("#buttons").empty();

    var params = $.param({
        part: 'snippet, id',
        maxResults: '1',
        q: keyword,
        pageToken: token,
        type: 'video',    
        key: 'AIzaSyBbcLfQsPms45781ZJd_5pwv-V3sj6G9C0'
    });
    var url = "https://www.googleapis.com/youtube/v3/search?" + params;
    console.log(url);

    q = $(".input").val();

    $.ajax({
      url: url,
      method: "GET"
    }).then(function(data) {

    var nextPageToken = data.nextPageToken;
    var prevPageToken = data.prevPageToken;

    console.log("Response length: " + data.items.length)
    
    $.each(data.items, function(i, item){ 

        var result = showVideos(item);

        $("#videos-view").append(result)
    });

    var buttons = showButtons(prevPageToken, nextPageToken);

    $("#buttons").append(buttons);

});
};

function showVideos(item) {
    var videoId = item.id.videoId;
    var title = item.snippet.title;
    var description = item.snippet.description;
    var thumb = item.snippet.thumbnails.high.url;
    var channelTitle = item.snippet.channelTitle;
    var publishedAt = item.snippet.publishedAt;

    var result = '<li>' + 
    '<div>' + 
    '<a data-fancybox data-type="iframe" href="http://www.youtube.com/embed/'+videoId+'"><img src="'+thumb+'"></a>' +
    '</div>' +
    '<div>' +
    '<h3><a data-fancybox data-type="iframe" href="http://www.youtube.com/embed/'+videoId+'">'+title+'</a></h3>' +
    '<small>By <span class="cTitle">'+channelTitle+'</span> on '+publishedAt+'</small>' +
    '<p>'+description+'</p>' + 
    '</div>' +
    '</li>'
    '';

    return result;
}

function showButtons(prevPageToken, nextPageToken) {
    if (!prevPageToken) {
        var buttonOutput = '<div class="button-container">' +
        '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Page</button></div>';
    }

    else {
        var buttonOutput = '<div class="button-container">"' +'<button id="prev-button" class="paging-button" data-token="'+prevPageToken+'" data-query="'+q+'" onclick="showPrevPage();">Prev Page</button>' + '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Page</button></div>'
    }

    return buttonOutput;
}


$(".input").keypress(function(event) {
    if (event.which == 13) {
    event.preventDefault();
    // This line grabs the input from the textbox
    keyword = $("#keyword-input").val().trim();
    keyword = keyword + " recipe";
    topics.push(keyword)
    // Initalizes function to immediately display the added button
    doAjaxCall();

    }
  });

$(document).on("click", ".image-button", doAjaxCall);
