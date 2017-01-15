var snapshot = {
	orientation: false,
	motion: false
}

window.addEventListener('deviceorientation', function(event){
	//console.log(event);
	snapshot.orientation = event;
}, true);

window.addEventListener('devicemotion', function(event){
	//console.log(event);
	snapshot.motion = event;
}, true);

var savedTouches = [false, false];

window.addEventListener('touchstart', function(event){
	//console.log(event);
	savedTouches[0] = event;
});

window.addEventListener('touchend', function(event){
	//console.log(event);
	savedTouches[1] = event;
	if(savedTouches[0] && savedTouches[1]){
		throwBall(snapshot, savedTouches);
	}
	else{
		console.error('Could not compute physics with only one touch event!');
	}
});

var cups = getCupTriangle({x: 150, y: 125}, 20);
drawCupTriangle(cups);

function getBallVelocity(touches){
	var scaleX = 4250;
	var scaleY = 4250;
	var metersPerPixel = (0.1524 / 400); // 6 inches in meters (height of Nexus 6P)
	var dX = touches[1].changedTouches[0].pageX - touches[0].changedTouches[0].pageX;
	var dY = -1 * (touches[1].changedTouches[0].pageY - touches[0].changedTouches[0].pageY);
	var dT = touches[1].timeStamp - touches[0].timeStamp;
	var vX = metersPerPixel * (dX / dT);
	var vY = metersPerPixel * (dY / dT);
	var rads = Math.atan(dY / dX);
	return {
		x: vX * scaleX,
		y: vY * scaleY,
		radians: rads
	}
}

function getBallPosition(snap, vel){
	var height = 1.0;
	var iX = 0;
	var iY = 0;
	var aZ = snap.motion.accelerationIncludingGravity.z;
	var t = Math.sqrt(Math.abs(height/aZ));
	var radsY = (snap.orientation.beta / 360) * 2 * Math.PI;
	var angledVY = vel.y * Math.cos(radsY);
	var radsX = vel.radians;
	var angledVX = Math.abs(vel.x) * Math.sin(radsX);
	var dY = iY + (Math.abs(angledVY * t));
	var dX = iX + (angledVX * t);
	getPlot(snap, vel);
	return {
		x: dX,
		y: dY,
		t: t
	};
}

var throwCounter = 0;

function throwBall(snap, touches){
	var vel = getBallVelocity(touches);
	var pos = getBallPosition(snap, vel);
	//console.log(vel);
	//console.log(pos);
	var canvasX = 200;
	var canvasY = 200;
	var fX = 150 + (pos.x * canvasX);
	var fY = (pos.y * canvasY);
	for(var j = 0; j < cups.length; j++){
		var cup = cups[j];
		if(ballIsInCup({x: fX, y: fY}, cup)){
			cup.filled = true;
			Canvas.drawCircle({
				x: cup.x,
				y: 300 - cup.y,
				r: cup.r
			}, {
				fill: 'blue'
			});
			var cupsHit = 0;
			for(var q = 0; q < cups.length; q++){
				if(cups[q].filled){
					cupsHit++;
				}
			}
			document.getElementById('cups').innerText = cupsHit;
		}
		else{
			if(throwCounter > 3){
				render();
			}
		}
	}
	Canvas.drawLine(Line(150, 300, fX, 300 - fY, 'blue'));
	throwCounter++;
	document.getElementById('throws').innerText = throwCounter;
}

function ballIsInCup(ball, cup){
	var dX = cup.x - ball.x;
	var dY = cup.y - ball.y;
	var dist = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
	if(dist < cup.r){
		return true;
	}
	else{
		return false;
	}
}

function getCupTriangle(head, radius){
	head.r = radius;
	return [head, {
		x: head.x + radius,
		y: head.y + (2 * radius),
		r: radius
	}, {
		x: head.x - radius,
		y: head.y + (2 * radius),
		r: radius
	}, {
		x: head.x,
		y: head.y + (4 * radius),
		r: radius
	}, {
		x: head.x - (2 * radius),
		y: head.y + (4 * radius),
		r: radius
	}, {
		x: head.x + (2 * radius),
		y: head.y + (4 * radius),
		r: radius
	}, {
		x: head.x + radius,
		y: head.y + (6 * radius),
		r: radius
	}, {
		x: head.x - radius,
		y: head.y + (6 * radius),
		r: radius
	}, {
		x: head.x + (3 * radius),
		y: head.y + (6 * radius),
		r: radius
	}, {
		x: head.x - (3 * radius),
		y: head.y + (6 * radius),
		r: radius
	}];
}

function drawCupTriangle(cups){
	for(var i = 0; i < cups.length; i++){
		Canvas.drawCircle({
			x: cups[i].x,
			y: 300 - cups[i].y,
			r: cups[i].r
		}, {
			stroke: 'red'
		});
	}
}

function render(){
	clearCanvas();
	for(var k = 0; k < cups.length; k++){
		var landed = cups[k].filled || false;
		Canvas.drawCircle({
			x: cups[k].x,
			y: 300 - cups[k].y,
			r: cups[k].r
		}, {
			stroke: 'red',
			fill: landed ? 'blue' : 'white'
		});
	}
}

function getPlot(snap, vel){
	var x_axis = [];
	var y_axis = [];
	var height = 1.0;
	var iX = 0;
	var iY = 0;
	var aZ = snap.motion.accelerationIncludingGravity.z;
	var t = Math.sqrt(Math.abs(height/aZ));
	var radsY = (snap.orientation.beta / 360) * 2 * Math.PI;
	var angledVY = vel.y * Math.cos(radsY);
	var radsX = vel.radians;
	var angledVX = Math.abs(vel.x) * Math.sin(radsX);
	var maxT = t;
	var interval = maxT / 10;
	for(var it = 0; it < maxT; it+=interval){
		var dY = iY + (Math.abs(angledVY * it));
		var dX = iX + (angledVX * it);
		var dZ = height - (aZ * Math.pow(it, 2));
		x_axis.push(it);
		y_axis.push(dZ);
	}
	var data2 = [
	  {
	    x: x_axis,
	    y: y_axis,
	    type: 'line'
	  }
	];
	Plotly.newPlot('plot', data2);
}

var data2 = [
	  {
	    x: [0, 1, 2],
	    y: [0, 1, 2],
	    type: 'line'
	  }
	];
Plotly.newPlot('plot', data2);