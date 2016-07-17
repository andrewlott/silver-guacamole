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

function toggleMobile() {
    isMobile = !isMobile;
    if (isMobile) {
	setupMobile();
    } else {
	unsetupMobile();
    }
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
    recalculateWinner();
}

function setupMain() {
    $.ajax({
        url: googl,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: '{ longUrl: "' + myUrl +'"}',
        success: function(response) {
	    $('body').prepend('<div id="googl"><a href="'+ response['id'] +'">' + response['id'] + '</a> | ' + 
			      '<a href="' + response['id'] + '.qr' + '">QR</a></div>');
        }
    });
    
    $('body').append('<div id="main">' + average + '</div>');
    $('body').append('<div id="bar"></div>');
    $('body').append('<div id="reset-button"><button class="reset">Reset</button></div>');
    $('body').append('<div id="mobiletoggle"><a href="javascript:void(0)" onClick="toggleMobile();">Toggle vote</a></div>');
    //$('body').append('<div id="source"><a href="https://github.com/andrewlott/silver-guacamole">source</a></div>');
    setupBar();
    $('body').append('<div id="members"></div>');
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

function unsetupMobile() {
    $('button.vote, button.voted').each(function(index) {
	$(this).remove();
    });
}

function setupBar() {
    $('svg').remove();
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $(window).width() / 2 - margin.left - margin.right,
    height = $(window).height() / 4 - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);
    
    var y = d3.scale.linear()
	.range([height, 0]);
    
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");
    
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(10, "%");
    
    var svg = d3.select("#bar").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var data = [];
    var counts = [];
    var total = fibonacciVotes.reduce(function (a,b) {return a + b;}, 0);
    for (var i = 0; i < fibonacci.length; i++) {
	data[i] = {letter: fibonacci[i], frequency : fibonacciVotes[i] / total || 0};
	counts[i] = {letter: fibonacci[i], count : fibonacciVotes[i]};
    }
	
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
    
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);
    
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end");
    

    svg.selectAll(".bar")
	.data(data)
	.enter().append("rect")
	.transition().duration(500)
	.attr("class", "bar")
	.attr("x", function(d) { return x(d.letter); })
	.attr("width", x.rangeBand())
	.attr("y", function(d) { return y(d.frequency); })
	.attr("height", function(d) { return height - y(d.frequency); });


    svg.selectAll(".bar")
	.data(data)
	.enter().append("text")
	.text(function (d) { return '' + d.frequency * total; })
	.attr('x', function(d) { return x(d.letter) + (x.rangeBand() / 2.5); })
	.attr('y', function(d) { return y(d.frequency / 2); })
	.attr('fill', 'white')
	.attr('opacity', function(d) { return d.frequency > 0 ? 1.0 : 0.0 })
	.attr('font-family', 'Helvetica')
	.attr('text-align', 'left');
}

function type(d) {
  d.frequency = +d.frequency;
  return d;
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
    setupBar();
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

socket.on('members', function(msg){
    console.log(msg);
    $('div#members').text('👤 ' + msg);
});

socket.on('reset', function(msg){
    reset();
});

reset();
