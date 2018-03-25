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

//INITIALIZE GLOBAL VARIABLES
var database = firebase.database();
var userRef = database.ref();
var newDataPoint = "";
var user = "";
var password = "";
var keyword ="";
var searchResults;
var ingredientArray = [];
var topics =[];
var searchHistory= [];
var userUID;
var userSep = [];


//   Get elements from document using its ID
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
    console.log("User logged in");
    promise.catch(e => console.log(e.message));
});

// Add signup event
btnSignUp.addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    // Create user
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    console.log("User Signed Up");
    promise.catch(e => console.log(e.message));
});

//add Logout event
btnLogout.addEventListener('click', e => {
    console.log("User Logged Out");
    firebase.auth().signOut();
    userSep = [];
    searchHistory = [];
});


// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {

    console.log(firebaseUser);
    //console.log(firebaseUser.ka);
    console.log(firebaseUser.uid);
    //console.log(firebaseUser.uid);
    userUID = firebaseUser.uid;

    if (firebaseUser) {
        //console.log(firebaseUser);
        btnLogout.classList.remove('hide');
        user = $("#txtEmail").val();
        password = $("#txtPassword").val();
        search = $(".input").val();
        //userSep is the username portion of the email
        userSep = user.split("@");
        //userUID = firebaseUser.ka.uid;

        console.log(searchHistory);


        database.ref('/users/' + userSep[0]).once('value').then(function(snap) {console.log(snap);
            //console.log(snap.val().userData.history);
            console.log(snap.val().history);
            searchHistory = snap.val().history;
        
        })

        database.ref('/users/' + userSep[0]).once('value').then(function(snap) {
            let userObj = snap.val();
            userObj.history = searchHistory;
            database.ref('/users/' + snap.key).update(userObj)

        })

}

    else {
        console.log('not logged in')
        btnLogout.classList.add('hide');
    }

});

//THIS IS FOR THE DROPDOWN MENU (remember we have to call the api's 2x)
//This is probably where we need to fix the buttons to call these apis!!!!
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

    //this is the input from the search bar
    q = $(".input").val();

    searchHistory.push(keyword);
    
    var userData = {history: searchHistory};
    
    var newUserKey = firebase.database().ref().child().push();
    var newHistory = {};
    newHistory['/users/' + userSep[0] + '/' + newUserKey ] = userData
    console.log(userSep[0]);
    console.log("^^^this is line 149");

    //updates newHistory.... Might need to get fixed for the refresh???
    firebase.database().ref().update(newHistory);
    console.log(newHistory);

    //AJAX call for Youtube
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

// YUMMLY ----------------------------------------------------------------------

//variables for Yummly 
var recipeInput = keyword;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
var baseURL = "http://api.yummly.com/v1/api/recipes?_app_id=87b4ae84&_app_key=1c317fe13d2c932506f2c1aab86f67b6&q=";
var queryURL =  corsProxy + baseURL + thisDataButton;
var corsProxy = "https://cors-anywhere.herokuapp.com/";
console.log(queryURL);

//AJAX CALL FOR YUMMLY
$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response){
  console.log(response);

  //setting and appending new div
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
//for loop to go through recipeingredients and append to div
for (i = 0; i < ingredientArray.length; i++){
    var recipeIngredients = JSON.stringify(response.matches[0].ingredients[i]);
    //replaces brackets and quotes with spaces
    recipeIngredients = recipeIngredients.replace('[',' ');
    recipeIngredients = recipeIngredients.replace(']',' ');
    recipeIngredients = recipeIngredients.replace(/["]+/g,' ');
    newDiv.append(recipeIngredients + "<br>");
    
}

console.log(recipeIngredients);
$("#displayRecipe").append(newDiv); 

});
//make buttons ?????? do we need this here..... 
makeButtons();
};



//the main functionality is to display on the webpage? i assume..... 
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
    console.log(searchHistory);
    console.log(userData);
    console.log(userData.history);

//every refresh duplicates data !!!
//how will we fix this.... is it in this function or the previous one....

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

makeButtons();
};


//THIS MAKES THE BUTTONS ON THE DROPDOWN MENU! Maybe this is where we need to all the api functions???
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
//I think we were trying to do something like that here and that's why we have two functions that are the same.....
    $(document).on("click", ".dropdown-item", doAjaxButton);

//previous video button!!!
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

//next video button!!!
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

//ta-da we have magic thanks to these button functions
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

//passing two arguments of the previous and next page tokens
function showButtons(prevPageToken, nextPageToken) {
    if (!prevPageToken) {
        var buttonOutput = '<div class="button-container">' +
        '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Page</button></div>';
    }

    else {
        var buttonOutput = '<div class="button-container">' +'<button id="prev-button" class="paging-button" data-token="'+prevPageToken+'" data-query="'+q+'" onclick="showPrevPage();">Prev Video</button>' + '<button id="next-button" class="paging-button" data-token="'+nextPageToken+'" data-query="'+q+'" onclick="showNextPage();">Next Video</button></div>'
    }

    return buttonOutput;
}

//every time the enter key is pressed, it will grab whatever is in the textbox and it ends with an doAjaxCall
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



//$(document).on("click", ".image-button", doAjaxCall);
//^^^this is commented out because it doesnt really refer to anything like what is .image-button? its nothing..... and the code didnt break when it was commented out