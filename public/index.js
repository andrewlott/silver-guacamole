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
var currentVoteIndex = -1;
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
    currentVoteIndex = -1;
    $('button.voted').each(function(index) {
	$(this).removeClass('voted');
	$(this).addClass('vote');
    });
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
	$('body').append('<div class="vote-button"><button id="vote' + i + '" class="vote">' + fibby + '</button></div>');
    }
    $("button.vote").each(function(index) {
	$(this).click(function() {
	    if (currentVoteIndex != -1) {
		var unvoteMsg = {'room' : room, 'unvote' : currentVoteIndex};
		socket.emit('unvote', unvoteMsg);

		$('#vote' + currentVoteIndex).removeClass('voted');
		$('#vote' + currentVoteIndex).addClass('vote');
	    }
	    
	    if (currentVoteIndex == index) {
		currentVoteIndex = -1;
	    } else {
		currentVoteIndex = index;
		$(this).removeClass('vote');
		$(this).addClass('voted');

		var msg = {'room' : room, 'vote' : index};
		socket.emit('vote', msg);
	    }
	});
    });
}

function recalculateWinner() {
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
}

// Socket.io functions

socket.on('connect', function() {
    console.log('connecting to ' + room);
    socket.emit('room', room);
});

socket.on('unvote', function(msg){
    fibonacciVotes[msg] = fibonacciVotes[msg] - 1;
    console.log('unvoting ' + msg);
    recalculateWinner();
});

socket.on('vote', function(msg){
    fibonacciVotes[msg] = fibonacciVotes[msg] + 1;
    console.log('voting ' + msg);
    recalculateWinner();
});

socket.on('reset', function(msg){
    reset();
});

reset();
