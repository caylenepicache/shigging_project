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

// Global variables used in website
var database = firebase.database();
var userRef = database.ref();
var user = "";
var password = "";
var keyword ="";
var searchResults;
var ingredientArray = [];
var topics =[];
var searchHistory= [];
var userSep = [];


//Gets elements from the different input fields and buttons
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

$("#btnLogout").hide();
// Add login event
btnLogin.addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();


    // Sign in
    const promise = auth.signInWithEmailAndPassword(email, pass);
    console.log("User logged in");
    $("#btnLogin").hide();
    $("#btnSignUp").hide();
    $("#btnLogout").show();



    promise.catch(e => console.log(e.message));
});

// Add signup event
btnSignUp.addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    // Create
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    console.log("User Signed Up");
    promise.catch(e => console.log(e.message));
});

// When the user logs out, they are no longer writing to the firebase database and the local variables of userSep (username separated at the @ symbol) and searchHistory array are cleared
btnLogout.addEventListener('click', e => {
    console.log("User Logged Out");
    $("#btnLogin").show();
    $("#btnSignUp").show();
    $("#btnLogout").hide();
    firebase.auth().signOut();
    $(".dropdown-content").empty();
    userSep = [];
    searchHistory = [];

});

// Event handler where if the user refreshes the page, the user is automatically signed out of their profile. This is done to combat database duplicating issues.
$(window).bind('beforeunload',function(){
    console.log("Automatic sign out")
    firebase.auth().signOut();
 });


// Add a realtime listener 
firebase.auth().onAuthStateChanged(firebaseUser => {

    // If a user exists in the firebase database
    if (firebaseUser) {
        // When user authenticates with a user, it will display the "logout" button
        btnLogout.classList.remove('hide');
        // Pulls string from the input field
        user = $("#txtEmail").val();
        //userSep is the username portion of the email
        userSep = user.split("@");

        console.log(searchHistory);
        
        var ref = database.ref('/users/' + userSep[0]);
        ref.once("value")
        .then(function(snapshot) {
            // If a user authenticates with an existing user, the site will then pull the users previous search history and generate drop down menu buttons
            if(snapshot.exists() === true) {
                console.log("Thinks user exists")
                let userObj = snapshot.val();
                searchHistory = snapshot.val().history;
                console.log(searchHistory)
                userObj.history = searchHistory;
                // Creates search history drop down buttons when user authenticates and user exists
                for (var i = 0; i < searchHistory.length; i++) {
                    var a = $('<a>' + searchHistory[i] + '</a>');
                    console.log(searchHistory[i]);
                    a.addClass("dropdown-item");
                    a.attr("data-name", searchHistory[i]);
                    console.log(searchHistory[i]);
                    a.text(searchHistory[i]);
                    $(".dropdown-content").append(a);
                }
                database.ref('/users/' + snapshot.key).update(userObj)


            }
            // If a user authenticates with a user that does not exist prior, then the site simply pulls a snapshot of the database data and sends back the same data to the database for data persistence
            else {
                console.log("Thinks user does not exist")
                let userObj = snapshot.val();
                // Simply updates database with data that was already found there.
                database.ref('/users/' + snapshot.key).update(userObj)

            }
        });

}

    else {
        console.log('not logged in')
    }

});

// This function differs from the "doAjaxCall" function in that it handles the specific ajax call for dropdown menu button options. The search query uses a pre-existing string value that is not found in the search field as in the ajax call to a brand new search
function doAjaxButton() {

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

    // Ajax call to YouTube API to generate appropriate "next video" and "previous video" buttons
    q = thisDataButton;

    $.ajax({
      url: url,
      method: "GET"
    }).then(function(data) {

    var nextPageToken = data.nextPageToken;
    var prevPageToken = data.prevPageToken;
   
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
$("#txtEmail").val("");
$("#txtPassword").val("");
$("#keyword-input").val("");
makeButtons();
};




function doAjaxCall() {

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
    console.log(searchHistory);
    console.log(userData);
    console.log(userData.history);

//every refresh duplicates data 

    var newHistory = {};
    newHistory['/users/' + userSep[0]] = userData;
    console.log(newHistory);
    console.log("^^^this is line 258");
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
  //console.log(response);

  var newDiv = $("<div>");
  newDiv.addClass("addedDiv");
  $("#displayRecipe").append(newDiv);
  

var recipeTitle = response.matches[0].recipeName;
//console.log(recipeTitle);
newDiv.append("<h1>" + recipeTitle + "</h1>");

var ingredientArray = response.matches[0].ingredients;
//console.log(ingredientArray);

var ingredientTitleString = "Ingredients";
newDiv.append("<h3>" + ingredientTitleString + "</h3>");

for (i = 0; i < ingredientArray.length; i++){
    var recipeIngredients = JSON.stringify(response.matches[0].ingredients[i]);
    recipeIngredients = recipeIngredients.replace('[',' ');
    recipeIngredients = recipeIngredients.replace(']',' ');
    recipeIngredients = recipeIngredients.replace(/["]+/g,' ');
    newDiv.append(recipeIngredients + "<br>");
    
}

//console.log(recipeIngredients);
$("#displayRecipe").append(newDiv); 

});
$("#txtEmail").val("");
$("#txtPassword").val("");
$("#keyword-input").val("");
makeButtons();
};

// Function creates dropdown menu buttons that when clicked return previous results from previous search history options
function makeButtons() {
    $(".dropdown-content").empty();

    var historyRef = firebase.database().ref();
    historyRef.on("child_added",function(snapshot){


    console.log(searchHistory);
    console.log(searchHistory.length);

    if (searchHistory === undefined){
        return;
    }

    for (var i = 0; i < searchHistory.length; i++) {
        var a = $('<a>' + searchHistory[i] + '</a>');
        console.log(searchHistory[i]);

        a.addClass("dropdown-item");
        a.attr("data-name", searchHistory[i]);
        console.log(searchHistory[i]);
        a.text(searchHistory[i]);
        $(".dropdown-content").append(a);
    }
})
}

// Function related to the YouTube API that makes an ajax call to the previous video result
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

// Function related to the YouTube API that makes an ajax call and shows the next page in youtube results
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

// Function that builds the html for the YouTube API response.
function showVideos(item) {
    var videoId = item.id.videoId;
    var title = item.snippet.title;
    var description = item.snippet.description;
    var thumb = item.snippet.thumbnails.high.url;
    var channelTitle = item.snippet.channelTitle;
    var publishedAt = item.snippet.publishedAt;

    var result = '<li>' + 
    '<div>' + 
    '<a data-fancybox data-type="iframe" href="https://www.youtube.com/embed/'+videoId+'"><img src="'+thumb+'"></a>' +
    '</div>' +
    '<div>' +
    '<h3><a data-fancybox data-type="iframe" href="https://www.youtube.com/embed/'+videoId+'">'+title+'</a></h3>' +
    '<small>By <span class="cTitle">'+channelTitle+'</span> on '+publishedAt+'</small>' +
    '<p>'+description+'</p>' + 
    '</div>' +
    '</li>'
    '';

    return result;
}

// Function that displays "Next Video" and "Previous Video" for user to sort through
function showButtons(prevPageToken, nextPageToken) {
    if (!prevPageToken) {
        var buttonOutput = '<div class="button-container">' +
        '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Video</button></div>';
    }

    else {
        var buttonOutput = '<div class="button-container">' +'<button id="prev-button" class="paging-button" data-token="'+prevPageToken+'" data-query="'+q+'" onclick="showPrevPage();">Prev Video</button>' + '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Video</button></div>'
    }

    return buttonOutput;
}

// On "enter" key, ajax call will be made based on user input
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

// Event handler for when the dynamically generated dropdown arrow menu options are clicked.
$(document).on("click", ".dropdown-item", doAjaxButton);
