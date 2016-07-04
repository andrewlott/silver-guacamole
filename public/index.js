var socket = io();
var linkShorteningKey = 'AIzaSyDd9WdbjcXKlIb1yhT6v2xz77ZZ4jdkCs4';
var googl = 'https://www.googleapis.com/urlshortener/v1/url?key=' + linkShorteningKey;
var myUrl = window.location.href;
var room = window.location.pathname;

var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
	    var msg = {'room' : room, 'reset' : 1};
	    socket.emit('reset', msg);
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
	    var msg = {'room' : room, 'vote' : index};
	    socket.emit('vote', msg);
	});
    });
}

socket.on('vote', function(msg){
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

reset();
