var project = getParameterByName('project') || '/';
var socket = io(); //io(project); // :)

var linkShorteningKey = 'AIzaSyDd9WdbjcXKlIb1yhT6v2xz77ZZ4jdkCs4';
var googl = 'https://www.googleapis.com/urlshortener/v1/url?key=' + linkShorteningKey;
var myUrl = window.location.href;
console.log(myUrl);

/*
$.post(googl, {longUrl : myUrl}).done(
    function(data) {
	alert( "Data Loaded: " + data );
    }
);
*/

var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
} 

var fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];
var fibonacciVotes = [];
var average = 0;
var votes = 0;
if (!isMobile) {
    setupMain();
} else {
    setupMobile();
}

function reset() {
    votes = 0;
    average = 0;
    for (var i = 0; i < fibonacci.length; i++) {
	fibonacciVotes[i] = 0;
    }
    $('#main').text(0);
}

function setupMain() {
    $.ajax({
        url: googl,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: '{ longUrl: "' + myUrl +'"}',
        success: function(response) {
	    $('body').prepend('<div id="googl">' + response['id'] + '</div>');
        }
    });
    
    $('body').append('<div id="main">' + average + '</div>');
    $('body').append('<div id="reset-button"><button class="reset">Reset</button></div>');
    $("button.reset").each(function(index) {
	$(this).click(function() {
	    socket.emit('reset', 0);
	});
    });


}

function setupMobile() {
    for(var i = 0; i < fibonacci.length; i++) {
	var fibby = fibonacci[i];
	$('body').append('<div class="vote-button"><button class="vote">' + fibby + '</button></div>');
    }
    $("button.vote").each(function(index) {
	$(this).click(function() {
	    console.log('clicking ' + $(this).text());
	    //socket.emit('vote', $(this).text());
	    socket.emit('vote', index);
	});
    });
}

socket.on('vote', function(msg){
    // maybe keep state in server file to share among windows

    // update average etc.
    //average = ((average * votes) + msg) / (votes + 1);
    //votes++;
    console.log(msg);
    fibonacciVotes[msg] = fibonacciVotes[msg] + 1;

    var maxIndex = 0;
    var maxVotes = 0;
    for (var i = 0; i < fibonacciVotes.length; i++) {
	if (fibonacciVotes[i] > maxVotes) {
	    maxVotes = fibonacciVotes[i];
	    maxIndex = i;
	}
    }
    // choose nearest fib
    /*
    var nearestFibIndex = 0;
    var minDiff = 1000;
    for (var i = 0; i < fibonacci.length; i++) {
	var fibby = fibonacci[i];
	var diff = Math.abs(fibby - average);
	if (diff < fibby) {
	    minDiff = diff;
	    nearestFibIndex = i;
	}
    }
    */
    
    $('#main').text(fibonacci[maxIndex]);
});

socket.on('reset', function(msg){
    reset();
});

function getParameterByName(name) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

reset();

/*var socket = io();
$('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
});
socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
});*/
