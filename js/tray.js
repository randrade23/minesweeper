var width, height, mines;
var minecount = 0;
var tray = null;
var tray_uncovered = null; //0 if covered, 1 if uncovered, 2 if flag
var plays = 0; 
var uncovered_tiles = 0;
var game_over = false;
var outcome = false; //false if defeat, true if victory
var seconds = 0;
var current_difficulty = 0;
var timer = null;
var highScoresBeginner = [];
var highScoresInterm = [];
var highScoresExpert = [];
var alerted = false;

function init(w, h, m) { 
	width = w;
	height = h;
	mines = m;
	minecount = m;
	plays = uncovered_tiles = 0;
	seconds = 0;
	if (timer != null) clearInterval(timer);
	timer = setInterval(secondIncrement, 1000);
	game_over = false;
	outcome = false;
	alerted = false;
	makeTray();
	writeTray();
	var table = document.getElementsByTagName("table")[0];
	if (current_difficulty === 1) table.className = "game_beginner";
	else if (current_difficulty === 2) table.className = "game_intermediate";
	else if (current_difficulty === 3) table.className = "game_expert";
	if (current_difficulty != 0) table.className += " tray";
}

function secondIncrement() {
	seconds++;
    document.getElementById("secondcount").innerText = seconds;
    if (!game_over) checkWin();
    else { 
    	clearInterval(timer);
    	if (outcome && !alerted) {
			alert("Venceu o jogo! Demorou " + seconds + " segundos.");
			alerted = true;
		}
    }
}

function loginAsGuest() {
	var Regex = /^[a-zA-Z0-9]+$/;
	if (Regex.test(document.getElementById("user").value)) {
		document.getElementById("beforelogin").style.display = "none";
		document.getElementById("afterlogin").style.display = "block";
		document.getElementById("fixed-nav-bar").style.zIndex="1000";
		username = document.getElementById("user").value;
		setGameMode(1);
	}
	else {
		alert('O nome de utilizador tem de come\u00e7ar por uma letra e apenas pode conter letras ou n\u00fameros');
	}
}

function setGameMode(i) {
	current_difficulty = i;
	if (i === 1) {
		init(9,9,10);
	}
	else if (i === 2) {
		init(16,16,40);
	}
	else if (i === 3) {
		init(16,30,99);
	}
	document.getElementById("quadroHonra").style.display = "none";
	document.getElementById("mainwrap").style.display = "block";
}

function setHighscore(c) {
	var hsList = document.getElementById("highscore_list");
	hsList.innerText = '';
	var highScores = null;
	switch (c) {
		case 1:
			highScores = highScoresBeginner;
			break;
		case 2:
			highScores = highScoresInterm;
			break;
		case 3:
			highScores = highScoresExpert;
			break;
	}
	highScores.sort(function(a,b) { return a.score - b.score; });
	for (var i = 0; i < highScores.length; i++) {
		var li = document.createElement("li");
		li.innerText = highScores[i].username + " - " + highScores[i].score;
		hsList.appendChild(li);
	}
	document.getElementById("highScoreTitle").innerText = "Quadro de Honra - ";
	switch (c) {
		case 1:
			document.getElementById("highScoreTitle").innerText += "Beginner";
			break;
		case 2:
			document.getElementById("highScoreTitle").innerText += "Intermediate";
			break;
		case 3:
			document.getElementById("highScoreTitle").innerText += "Expert";
			break;
	}
	document.getElementById("quadroHonra").style.display="block";
	document.getElementById("mainwrap").style.display="none";
}

function restart() {
	setGameMode(current_difficulty);
}

function makeTray() {
	/* initialize tray */
	tray = new Array(width);
	tray_uncovered = new Array(width);
	for (var i = 0; i < width; i++) {
		tray[i] = new Array(height);
		tray_uncovered[i] = new Array(height);
	}
	for (var i = 0; i < width; i++) {
		for (var j = 0; j < height; j++) {
			tray[i][j] = 0;
			tray_uncovered[i][j] = 0;
		}
	}
	/* end initialize tray */
	for (var k = 0; k < mines; k++) {
		/* generate x,y for mine */
		var x = Math.floor((Math.random() * width));
		var y = Math.floor((Math.random() * height));
		while (bomb(x,y)) { /* make sure that we aren't repeating x,y */
			x = Math.floor((Math.random() * width));
			y = Math.floor((Math.random() * height));
		}
		for (var pos_x = -1; pos_x <= 1; pos_x++) {
			for (var pos_y = -1; pos_y <= 1; pos_y++) {
				/* going around x,y pair for new mine */
				if (pos_x == 0 && pos_y == 0) {
					tray[x][y] = mines * -1; //negative number
				}
				else {
					if ((x+pos_x < width) && (y+pos_y < height) && (x+pos_x >= 0) && (y+pos_y >= 0) && !bomb(x+pos_x,y+pos_y)) { /*in bounds */
						tray[x+pos_x][y+pos_y] = tray[x+pos_x][y+pos_y] + 1; //incrementing neighbors
					}
				}
			}
		}
	}
}

function writeTray() {
	var classes = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
	var table = document.createElement('table');
	if (current_difficulty === 1) table.className = "game_beginner";
	else if (current_difficulty === 2) table.className = "game_intermediate";
	else if (current_difficulty === 3) table.className = "game_expert";
	if (current_difficulty != 0) table.className += " tray";
    for (var i = 0; i < tray.length; i++) {
        var row = document.createElement('tr');
        for (var j = 0; j < tray[i].length; j++) {
            var cell = document.createElement('td');
            if (bomb(i,j))  {
            	cell.className="mine";
            	cell.textContent="";
            	var mine = document.createElement('i');
            	mine.className="fa fa-bomb";
            	cell.appendChild(mine);
				cell.setAttribute("oncontextmenu", "return false;");
            }
            else  {
            	cell.textContent = tray[i][j];
            	cell.className=classes[tray[i][j]];
				cell.setAttribute("oncontextmenu", "return false;");
            }
            if (tray_uncovered[i][j] == 0) {
            	cell.className="hidden";
            	cell.textContent = "";
            	cell.setAttribute("onclick", "uncover(" + i + "," + j + ");");
            	cell.setAttribute("oncontextmenu", "flag(" + i + "," + j + "); return false;");
            }
            else if (tray_uncovered[i][j] == 2) {
            	cell.textContent = "";
            	cell.className="flag";
            	var flag = document.createElement('i');
            	flag.className="fa fa-flag";
            	cell.setAttribute("oncontextmenu", "flag(" + i + "," + j + "); return false;");
            	cell.appendChild(flag);
            }
	    	else if (tray_uncovered[i][j] == 3) {
				cell.textContent = "";
				cell.className = "question";
				var question = document.createElement('i');
				question.className = "fa fa-question";
				cell.setAttribute("onclick", "uncover(" + i + "," + j + ");");
				cell.setAttribute("oncontextmenu", "flag(" + i + "," + j + "); return false;");
				cell.appendChild(question);
	    	}
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    var current_table = document.getElementsByClassName("tray")[0]; //theres only one element with class tray
    current_table.parentNode.replaceChild(table, current_table); //replace tray with updated one
    document.getElementById("minecount").innerText = minecount;
    return table;
}


function uncover(x,y) { 
    if (!game_over && (tray_uncovered[x][y] == 0 || tray_uncovered[x][y] == 3)) {
		plays++;
		uncovered_tiles++;
		tray_uncovered[x][y] = 1;
		if (plays == 1 && bomb(x,y)) { //mine on first play
			decrementAround(x,y);
			// place it on another corner or find next available position
			for (var i = 0; i < width; i++) {
				for (var j = 0; j < height; j++) {
					if (!bomb(i,j)) {
						tray[i][j] = -1;
						incrementAround(i,j);
						break;
					}
				}
			}
			tray[x][y] = 0;
			setCount(x,y);
			writeTray();
			return; //mine on first play; don't end game
		}
		if (bomb(x,y)) {	
			game_over = true; outcome = false; //boom
			clearInterval(timer);
			writeTray();
			return;
		}
		if (tray[x][y] == 0) { //empty
			expandAround(x,y);
		}
	    checkWin();
		writeTray();
	}
} 

function checkWin() {
	if (game_over) {
		return;
	}
	var uncovered_tiles_not_mines = 0;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			if (tray_uncovered[x][y] == 1 && !bomb(x,y)) uncovered_tiles_not_mines++;
		}
	}
    if (uncovered_tiles_not_mines === (height*width) - mines) {
		game_over = true;
		outcome = true;
		switch (current_difficulty) {
			case 1:
				highScoresBeginner.push({username: username, score: seconds});
				break;
			case 2:
				highScoresInterm.push({username: username, score: seconds});
				break;
			case 3:
				highScoresExpert.push({username: username, score: seconds});
				break;
		}
		if (timer != null) clearInterval(timer);
		alert("Venceu o jogo! Demorou " + seconds + " segundos.");
	}
	return uncovered_tiles_not_mines;
}

function flag(x,y) {
	if (!game_over) {
		if (tray_uncovered[x][y] == 2) {
		    tray_uncovered[x][y] = 3; //questionmark
		    minecount++;
		}
		else if (tray_uncovered[x][y] == 0) {
		    tray_uncovered[x][y] = 2;
		    minecount--;
		}
	    else if (tray_uncovered[x][y] == 3) {
			tray_uncovered[x][y] = 0;
	    }
	}
	writeTray();
}

function expandAround(x,y) {
	for (var pos_x = -1; pos_x <= 1; pos_x++) {
		for (var pos_y = -1; pos_y <= 1; pos_y++) {
		    if (validPosition(x+pos_x, y+pos_y) && (tray_uncovered[x+pos_x][y+pos_y] == 0 || tray_uncovered[x+pos_x][y+pos_y] == 3)) { 
				//only moving vertical or horizontal && in bounds && not a bomb && covered || question mark
				tray_uncovered[x+pos_x][y+pos_y]=1; //uncover!
				uncovered_tiles++;
				if (tray[x+pos_x][y+pos_y] == 0) expandAround(x+pos_x, y+pos_y); //going around to see if there's anything left
			}
		}
	}	
    checkWin();
}

function incrementAround(x,y) {
	if (validPosition(x-1, y)) {
		tray[x-1][y]++;
	}
	if (validPosition(x, y-1)) {
		tray[x][y-1]++;
	}
	if (validPosition(x+1, y)) {
		tray[x+1][y]++;
	}
	if (validPosition(x, y+1)) {
		tray[x][y+1]++;
	}
	if (validPosition(x-1, y+1)) {
		tray[x-1][y+1]++;
	}
	if (validPosition(x+1, y-1)) {
		tray[x+1][y-1]++;
	}
	if (validPosition(x+1, y+1)) {
		tray[x+1][y+1]++;
	}
	if (validPosition(x-1, y-1)) {
		tray[x-1][y-1]++;
	}
}

function decrementAround(x,y) {
	if (validPosition(x-1, y)) {
		tray[x-1][y]--;
	}
	if (validPosition(x, y-1)) {
		tray[x][y-1]--;
	}
	if (validPosition(x+1, y)) {
		tray[x+1][y]--;
	}
	if (validPosition(x, y+1)) {
		tray[x][y+1]--;
	}
	if (validPosition(x-1, y+1)) {
		tray[x-1][y+1]--;
	}
	if (validPosition(x+1, y-1)) {
		tray[x+1][y-1]--;
	}
	if (validPosition(x+1, y+1)) {
		tray[x+1][y+1]--;
	}
	if (validPosition(x-1, y-1)) {
		tray[x-1][y-1]--;
	}
}

function bomb(x,y) {
	return (tray[x][y] < 0);
}

function setCount(x,y) {
	for (var pos_x = -1; pos_x <= 1; pos_x++) {
		for (var pos_y = -1; pos_y <= 1; pos_y++) {
			if (inBounds(x+pos_x, y+pos_y)) {
				if (bomb(x+pos_x, y+pos_y)) tray[x][y]++;
			}
		}
	}
}


function validPosition(x,y) { //in bounds && not a bomb
	return (x>=0 && x<width && y>=0 && y<height && !bomb(x,y));
}

function isFlag(x,y) {
    return tray_uncovered[x][y]==2;
}

function inBounds (x,y) {
	return (x>=0 && x<width && y>=0 && y<height);
}
