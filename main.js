var outOrient = document.getElementById('outOrientation');
var outMotion = document.getElementById('outMotion');
var outSnapshot = document.getElementById('outSnapshot');

var snapshot = {
	orientation: false,
	motion: false
}

window.addEventListener('deviceorientation', function(event){
	snapshot.orientation = event;
	//console.log(event);
	outOrient.innerHTML = 'ORIENTATION<br>';
	outOrient.innerHTML += 'absolute : ' + (event.absolute) + '<br>';
	outOrient.innerHTML += 'alpha : ' + (event.alpha) + '<br>';
	outOrient.innerHTML += 'beta : ' + (event.beta) + '<br>';
	outOrient.innerHTML += 'gamma : ' + (event.gamma) + '<br><br>';
}, true);

window.addEventListener('devicemotion', function(event){
	snapshot.motion = event;
	//console.log(event);
	var accel = event.accelerationIncludingGravity;
	outMotion.innerHTML = 'ROTATION<br>';
	outMotion.innerHTML += 'interval : ' + (event.interval) + '<br>';
	outMotion.innerHTML += 'alpha : ' + (event.rotationRate.alpha) + '<br>';
	outMotion.innerHTML += 'beta : ' + (event.rotationRate.beta) + '<br>';
	outMotion.innerHTML += 'gamma : ' + (event.rotationRate.gamma) + '<br><br>';
	outMotion.innerHTML += 'ACCELERATION<br>'
	outMotion.innerHTML += 'x : ' + (accel.x) + '<br>';
	outMotion.innerHTML += 'y : ' + (accel.y) + '<br>';
	outMotion.innerHTML += 'z : ' + (accel.z) + '<br><br>';
}, true);

var savedTouches = [false, false];

window.addEventListener('touchstart', function(event){
	console.log(event);
	savedTouches[0] = event;
});

window.addEventListener('touchend', function(event){
	console.log(event);
	savedTouches[1] = event;
	if(savedTouches[0] && savedTouches[1]){
		throwBall(snapshot, savedTouches);
	}
	else{
		console.log('zika', savedTouches);
	}
	/*//alert('touchend');
	outSnapshot.innerHTML = 'THROW<br>';
	outSnapshot.innerHTML += 'interval : ' + (snapshot.motion.interval) + '<br>';
	outSnapshot.innerHTML += 'beta angle : ' + (snapshot.orientation.beta) + '<br>';
	outSnapshot.innerHTML += 'x accel : ' + (snapshot.motion.accelerationIncludingGravity.x) + '<br>';
	var res = calculateDistanceTraveled(snapshot);
	outSnapshot.innerHTML += 'distance : ' + (res.distance) + '<br>';
	outSnapshot.innerHTML += 'speed : ' + (res.speed) + '<br>';
	outSnapshot.innerHTML += 'angle : ' + (res.angle) + '<br>';*/
});

function getBallVelocity(touches){
	var metersPerPixel = (0.1524) / 400; // 6 inches in meters (height of Nexus 6P)
	var dX = touches[1].changedTouches[0].pageX - touches[0].changedTouches[0].pageX;
	var dY = -1 * (touches[1].changedTouches[0].pageY - touches[0].changedTouches[0].pageY);
	var dT = touches[1].timeStamp - touches[0].timeStamp;
	console.log(touches[1].timeStamp, touches[0].timeStamp);
	var vX = metersPerPixel * (dX / dT);
	var vY = metersPerPixel * (dY / dT);
	var rads = Math.atan(dY / dX);
	return {
		x: vX,
		y: vY,
		radians: rads
	}
}

function throwBall(snap, touches){
	var vel = getBallVelocity(touches);
	var pos = getBallPosition(snap, vel);
	console.log(vel);
	console.log(pos);
}

function getBallPosition(snap, vel){
	var height = 1.0;
	var iX = 0;
	var iY = 0;
	var aZ = snap.motion.accelerationIncludingGravity.z;
	var t = Math.sqrt(Math.abs(height/aZ));
	var radsY = (snap.orientation.beta / 360) * 2 * Math.PI;
	var angledVY = vel.x * Math.cos(radsY);
	var radsX = vel.radians;
	var angledVX = vel.y * Math.sin(radsX);
	var dY = iY + (Math.abs(angledVY * t));
	var dX = iX + (angledVX * t);
	return {
		x: dX,
		y: dY,
		t: t
	};
}