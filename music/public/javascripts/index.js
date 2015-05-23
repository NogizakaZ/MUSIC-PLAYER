function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#list li");
var btn = document.getElementById("next");
var btn2 = document.getElementById("play");
var btn3 = document.getElementById("pre");
var flag=0;
for(var i=0;i<lis.length;i++){
	lis[i].onclick = function(){

		for(var j =0;j<lis.length;j++){
			lis[j].className="";
		}
		this.className="selected";
		//load("/media/"+this.title);
	}
}
btn2.onclick = function(){

	if(btn2.innerHTML=="play"){
		btn2.innerHTML="stop";
		
		for(var j=0;j<lis.length;j++){

			if(lis[j].className=="selected"){
				load("/media/"+lis[j].title);
			}

		}
	}else{
		source.stop();

	}

	 
}

btn3.onclick = function(){
	var k=0;
	for(var j=0;j<lis.length;j++){

		if(lis[j].className=="selected"){
			k=j
			lis[j].className="";
		}


	}
	if(k-1==0){
		lis[0].className="selected";
		load("/media/"+lis[0].title);
	}if(k-1<0){
		lis[lis.length-1].className="selected";
		load("/media/"+lis[lis.length-1].title);
	}
	else{
		lis[k-1].className='selected';
		load("/media/"+lis[k-1].title);
	}
}

btn.onclick = function(){


	var q=0;
	for(var j=0;j<lis.length;j++){

		if(lis[j].className=="selected"){
			q=j
			lis[j].className="";
		}


	}
	if(q+1==lis.length){
		lis[0].className="selected";
		load("/media/"+lis[0].title);
	}else{
		lis[q+1].className='selected';
		load("/media/"+lis[q+1].title);
	}



}
var size =512;
var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext||window.webkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
analyser.fftsize = size*2;
analyser.connect(gainNode);

var source=null;
var count = 0;


var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height=height;
	canvas.width=width;

	doc=[];
	for(var i =0;i<(width/13+2);i++){
		doc.push({
			cap: 0
		});
	}


}

resize();
window.onresize=resize;

function draw(arr){
	var line = ctx.createLinearGradient(0,0,0,height);

	line.addColorStop(0,"#00EEEE");
	line.addColorStop(0.5,"#97FFFF");
	line.addColorStop(1,"#FF6A6A");

	ctx.clearRect(0,0,width,height);
	//var w = width/128;
	for(var i =0;i<(width/13+2);i++){
		var o = doc[i];
		var h =arr[i]/320 * height;
		ctx.fillStyle=line;
		ctx.fillRect(15*i,height-h,13,h);
		ctx.fillStyle="#000";
		ctx.fillRect(15*i,height-(o.cap+1.5),13,2);
		o.cap-=1.8;
		if(o.cap<0){
			o.cap=0;
		}
		if(h>0 && o.cap<=h){
			o.cap=h+1;
		}
		if(o.cap==height){
			o.cap=height;
		}
	}

}
function load(url){
	var n = ++count;
	source && source[source.stop ? "stop" : "noteOff"](0);
	xhr.abort();
	xhr.open("GET",url);
	xhr.responseType="arraybuffer";
	xhr.onload = function(){
		if(n!=count)return;
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n!=count)return;
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer=buffer;
			bufferSource.connect(analyser);
			bufferSource[bufferSource.start?"start":"noteOn"](0);
			source=bufferSource;

		},function(err){
			console.log(err);
		})
	}

	xhr.send();

}


function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);
	requestAnimationFrame = window.requestAnimationFrame||
	window.webkitAnimationFrame||
	window.mozAnimationFrame;
	function v(){
		analyser.getByteFrequencyData(arr);
		draw(arr);
		requestAnimationFrame(v);
	}
	requestAnimationFrame(v);


}
visualizer();
function changeVolume(per){
	gainNode.gain.value=per*per;

}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();