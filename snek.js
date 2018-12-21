$(function() {
	var div,
		snake = [],
		dir = 1,		//moving direction. 1:right, 2:dowm, 3:left, 4:up
		food = [],
		score = 0,
		hiscore = 0,
		level = 1,
		speed = 1,
		game = null,
		alive = false,
		paused = null,
		snek = [],
		snak = [],
		que = $(".display"), //one queue for intro and death animations
		WIDTH = 9,		//screen WIDTH in <div> pixels
		HEIGHT = 19,	//screen HEIGHT in <div> pixels
		SP = 50,		//speed coefficient
		SC = 25;		//score coefficient
	
	/*intro animation snake bitmap*/
	snek[0] = [2,3,6,18];
	snek[1] = [17,18];
	snek[2] = [16,17,18];
	snek[3] = [3,15,16,17];
	snek[4] = [2,4,15,16];
	snek[5] = [3,8,15,16];
	snek[6] = [7,9,12,13,15,16,17];
	snek[7] = [8,11,12,13,14,16,17,18];
	snek[8] = [2,11,13,14,15,16,17,18];
	snek[9] = [1,3,6,12,13,15,16,17];
	snak[0] = [2,4,18];
	snak[1] = [3,8,16,17,18];
	snak[2] = [7,9,15,16,17];
	snak[3] = [8,14,15,16];
	snak[4] = [2,14,15,16];
	snak[5] = [1,3,6,15,16,17];
	snak[6] = [2,12,13,14,16,17,18];
	snak[7] = [11,12,13,14,15,16,17,18];
	snak[8] = [11,13,15,16,17];
	snak[9] = [3,12,13];

	//save & get hi-scores from local storage
	if(!localStorage.getItem('hiscore')) {
		localStorage.setItem('hiscore', hiscore);
	} else {
		if (localStorage.getItem('hiscore') > hiscore) hiscore = localStorage.getItem('hiscore');
	}
/*
	if (Storage.length !== 0) {
		if (localStorage.hiscore > hiscore) hiscore = localStorage.hiscore;
	} else {
		localStorage.setItem("hiscore", hiscore);
	}
*/
	//draw pixels on display
	for (y = 0; y <= HEIGHT; y++) {
		for (x = 0; x <= WIDTH; x++) {
			div = $("<div></div>");
			div.attr("id", "pixel");
			div.attr("x", x);
			div.attr("y", y);
			$('.display').append(div);
		}
	}
	welcome(); //intro animation autostart
			
	/* buttons actions. can't move in opposite direction
	 * and cross the border while moving along this border,
	 * and change direction before snake use it
	 * (to prevent change to 180deg by fast change in 90deg twice)
	 */
	$("#left").mousedown(function() {
		if ( alive &&
			 dir === 0 &&
			 d != 1 &&
			 dir != 1 &&
			 snake[snake.length - 1].x !== 0 &&
			 paused !== true
			) {
				dir = 3;
			}
	});

	$("#right").mousedown(function() {
		if ( alive &&
			 dir === 0 &&
			 d != 3 &&
			 dir != 3 &&
			 snake[snake.length - 1].x != WIDTH &&
			 paused !== true
			) {
				dir = 1;
			}
	});

	$("#up").mousedown(function() {
		if ( alive &&
			 dir === 0 &&
			 d != 2 &&
			 dir != 2 &&
			 snake[snake.length - 1].y !== 0 &&
			 paused !== true
			) {
				dir = 4;
			} //else if (level < 9) {level ++; speed++; scores();} 
			  //increase speed & level before game
	});

	$("#down").mousedown(function() {
		if ( alive &&
			 dir === 0 &&
			 d != 4 &&
			 dir != 4 &&
			 snake[snake.length - 1].y != HEIGHT &&
			 paused !== true
			) {
				dir = 2;
			} //else if (level > 1) {level --; speed--; scores();}
			  //decrease speed & level before game
	
	});

	$(".pause").mousedown(function() {
		if (!alive) return;
		else if (paused !== true) pause();
		else if (paused === true) resume();
	});
	$(".start").mousedown(function() {
		//check make aviable change levels before game start
		if (alive) {level = 1; speed = 1;}
		start();
	});

	/* use keyboard WASD and arrows to move,
	 * ENTER for start and SPACEBAR for pause
	 */
	$("body").keydown(function(event) {
		switch (event.which) {
			case 39:
			case 68:
				$("#right").trigger("mousedown").attr("pressed", "true");
				break;
			case 37:
			case 65:
				$("#left").trigger("mousedown").attr("pressed", "true");
				break;
			case 38:
			case 87:
				$("#up").trigger("mousedown").attr("pressed", "true");
				break;
			case 40:
			case 83:
				$("#down").trigger("mousedown").attr("pressed", "true");
				break;
			case 13:
				$(".start").trigger("mousedown").attr("pressed", "true");
				break;
			case 32:
				$(".pause").mousedown().attr("pressed", "true");
				break;

		}
	});

	$("body").keyup(function(event) {	//release keys on screen
		switch (event.which) {
			case 39:
			case 68:
				$("#right").attr("pressed", "");
				break;
			case 37:
			case 65:
				$("#left").attr("pressed", "");
				break;
			case 38:
			case 87:
				$("#up").attr("pressed", "");
				break;
			case 40:
			case 83:
				$("#down").attr("pressed", "");
				break;
			case 13:
				$(".start").attr("pressed", "");
				break;
			case 32:
				$(".pause").attr("pressed", "");
				break;

		}
	});

	function scores() {	//refresh scores
		$("#score").html(("000000" + score).slice(-6));
		$("#hi-score").html(("000000" + hiscore).slice(-6));
		$("#level").html(("0" + level).slice(-2));
		$("#speed").html(("0" + speed).slice(-2));
	}
	function pixel(x, y, s) {	//switch pixels on & off
		$("[x = '" + x + "'][y = '" + y + "']").attr("status", s);        
	}
	function clrscr(q) {	//clear screen & clear animation queue
		if (q == "dequeue") {
			que.clearQueue();
			que.stop();
		}
		$("[status]").attr("status", "");
		$("[blink]").attr("blink", "");
	}
	function pause() {	//stop game without changing parameters
		clearTimeout(game);
		paused = true;
		$('#pause').css("color", "#313729");
	}
	function resume() {	//start game with existing parameters
		game = setTimeout(play, 600 - (speed * SP));
		$('#pause').css("color", "#7E916C");
		paused = false;
	}
	function start() {	//start game with default parameters
		clearTimeout(game);
		clrscr("dequeue");
		newSnake();
		food = newFood();
		score = 0;
		dir = 1;
		alive = true;
		resume();
	}
	function gameOver(x,y) {
		alive = false;
		clearTimeout(game);
		explode(x, y);
		welcome();
	}
	function levelUp() {	//level++ when snake gets +3 in length
			if (snake.length % 3 === 0) {
				level++;
				speed++;
			}
			score += (SC * level);
			if (score > hiscore) hiscore = score;	//refresh hiscore
			localStorage.setItem("hiscore", hiscore);
	}
	function rnd(min, max) {	//holy random
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function newFood() {	//create food
		var f = [rnd(0, WIDTH), rnd(0, HEIGHT)];
		return f;
	}
	function newSnake() {	//create default snake
		snake = [{x: 1, y: 9}, {x: 2, y: 9}, {x: 3, y: 9}];
	}

	/* sometimes this functions weren't loaded in time,
	 * so declare them out of explode()
	 */

	function medium(x, y, s) {
		for (i = -1; i < 2; i++) {
			for (j = -1; j < 2; j++) {
				pixel((x+i), (y+j), s);
			}
		}
	}

	function big(x, y, s) {
		for (i = -2; i < 3; i++) {
			if (Math.abs(i % 2) === 0) {
				for (j = -2; j < 3; j++) {
					if (Math.abs(j % 2) === 0) {
						pixel((x+i), (y+j), s);
					}
				}
			}
		}
	}
	function explode(x, y) {	//death animation
		for (i=0; i<3; i++) {
			que.queue(function () {
				pixel(x, y, "on");
				que.dequeue();
			});
			que.delay(100).queue(function () {
				medium(x, y, "on");
				que.dequeue();
			});
			que.delay(100).queue(function () {
				big(x, y, "on");
				que.dequeue();
			});
			que.delay(100).queue(function () {
				pixel(x, y, "");
				que.dequeue();
			});
			que.queue(function () {
				medium(x, y, "");
				que.dequeue();
			});
			que.queue(function () {
				big(x, y, "");
				que.dequeue();
			});
		}
		que.queue(function () {
			clrscr();
			que.dequeue();
		});
	}

	function welcome() {	//intro animation with loop
		level = 1;
		speed = 1;
		scores();
		for (i=0; i <= 4; i++) spiral(i, WIDTH-i, i, HEIGHT-i);
		setTimeout(function(){
			que.queue(function() {
				clrscr();
				que.dequeue();
			});
			slither();
		}, 1000);

		function spiral(x1, x2, y1, y2) {
			que.queue(function () {
				if (alive) return;
				$("#pixel[y = '" + y1 + "']").each(function(index) {
						que.delay(10).queue(function() {
							if (index >= x1 && index <= x2) {
								$("#pixel[y = '" + y1 + "']")
									.eq(index)
									.attr('status', 'on');
							}
							que.dequeue();
						});
				});
				que.dequeue();
			});

		   que.queue(function () {
				if (alive) return;
				$("#pixel[x = '" + x2 + "']").each(function(index) {
						que.delay(10).queue(function() {
							if (index >= y1 && index <= y2) {
								$("#pixel[x = '" + x2 + "']")
									.eq(index)
									.attr('status', 'on');
							}
							que.dequeue();
						});
				});
				que.dequeue();
			});

			que.queue(function () {
				if (alive) return;
				$("#pixel[y = '" + y2 + "']").each(function(index) {
						que.delay(10).queue(function() {
							if (index >= x1 && index <= x2) {
								$("#pixel[y = '" + y2 + "']")
									.eq(WIDTH-index)
									.attr('status', 'on');
							}
							que.dequeue();
						});
				});
				que.dequeue();
			});

		   que.queue(function () {
				if (alive) return;
				$("#pixel[x = '" + x1 + "']").each(function(index) {
						que.delay(10).queue(function() {
							if (index >= y1 && index <= y2) {
								$("#pixel[x = '" + x1 + "']")
									.eq(HEIGHT-index)
									.attr('status', 'on');
							}
							que.dequeue();
						});
				});
				que.dequeue();
			});
		}
		
		function slither() {
			que.queue(function() {
				if (alive) return;
				jQuery.each(snak, function(indexX, valueX) {
					jQuery.each(snak[indexX], function(indexY, valueY) {
						pixel(indexX, valueY, "on");
					});
				});
				que.dequeue();
			});
			que.delay(400).queue(function() {
				if (alive) return;
				jQuery.each(snak, function(indexX, valueX) {
					jQuery.each(snak[indexX], function(indexY, valueY) {
						pixel(indexX, valueY, "");
					});
				});
				que.dequeue();
			});
			que.queue(function() {
				if (alive) return;
				jQuery.each(snek, function(indexX, valueX) {
					jQuery.each(snek[indexX], function(indexY, valueY) {
						pixel(indexX, valueY, "on");
					});
				});
				que.dequeue();
			});
			que.delay(400).queue(function() {
				if (alive) return;
				jQuery.each(snek, function(indexX, valueX) {
					jQuery.each(snek[indexX], function(indexY, valueY) {
						pixel(indexX, valueY, "");
					});
				});
				que.dequeue();
			});
			que.queue(function() {
				if (alive) return;
				slither();
				que.dequeue();
			});
		}
	}
	function play() {	//finally, the game
		snake.forEach(function(k, i) {
			//check if food appears in snake, make new food
			if (food[0] == k.x && food[1] == k.y) food = newFood();
		});
		pixel(food[0], food[1], "on");	// draw food
		scores();

		var tail = snake[0],
			coor = {x: tail.x, y: tail.y},
			last = snake.length - 1;
			prel = snake.length - 2;
			head = snake[last];

		if (dir !== 0) d = dir;
		//make new coordinates for head
		if (d == 1) {coor.x = head.x + 1; coor.y = head.y; dir = 0;}
		if (d == 2) {coor.y = head.y + 1; coor.x = head.x; dir = 0;}
		if (d == 3) {coor.x = head.x - 1; coor.y = head.y; dir = 0;}
		if (d == 4) {coor.y = head.y - 1; coor.x = head.x; dir = 0;}

		//remove tail
		snake.shift();
		pixel(tail.x, tail.y, "");

		//checking for snake bite itself
		snake.forEach(function(k, i) {
			if ( k.x == coor.x &&
				 k.y == coor.y
				) {
				gameOver(k.x, k.y);
				}
		});

		//move tail to the next coordinates
		snake.push(coor);

		//make head blink
		$("[x = '" + snake[prel].x + "'][y = '" + snake[prel].y + "']")
			.attr("blink", "");
		$("[x = '" + coor.x + "'][y = '" + coor.y + "']")
			.attr("blink", "on");

		//border cross gameover
		if (coor.x > WIDTH) {
			gameOver((snake[last].x - 1), snake[last].y);
		}
		if (coor.x < 0) {
			gameOver((snake[last].x + 1), snake[last].y);
		}
		if (coor.y > HEIGHT) {
			gameOver(snake[last].x, (snake[last].y - 1));
		}
		if (coor.y < 0) {
			gameOver(snake[last].x, (snake[last].y + 1));
		}

		//grow if eating food, make new food
		if (coor.x == food[0] && coor.y == food[1]) {
			food = newFood();
			snake.unshift({x: snake[last].x, y: snake[last].y});
			levelUp();
		}
		
		snake.forEach(function(e, j) {
			pixel(e.x, e.y, "on");
		});
		if (alive) resume();	//play until alive
	}
});