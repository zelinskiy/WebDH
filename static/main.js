function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function modexp(a, b, n) {
  a = a % n;
  var result = 1;
  var x = a;
  while(b > 0){
    var leastSignificantBit = b % 2;
    b = Math.floor(b / 2);
    if (leastSignificantBit == 1) {
      result = result * x;
      result = result % n;
    }
    x = x * x;
    x = x % n;
  }
  return result;
}

function generatePG(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../generatePG/', false);
    xhr.send();
    askPG();
}

function askPG(){
    var xhr = new XMLHttpRequest();      
    xhr.open('GET', '../askPG/', false);
    xhr.send();
    pg = xhr.responseText.slice(1, -1).split(',')
    document.getElementById("p'").innerHTML = pg[0];
    document.getElementById("g'").innerHTML = pg[1];
}

function loadPG(){
    document.getElementById("p").value =
	document.getElementById("p'").innerHTML;
    document.getElementById("g").value =
	document.getElementById("g'").innerHTML;
}

function sayPG(){
    var p = document.getElementById("p").value;
    var g = document.getElementById("g").value;
    var xhr = new XMLHttpRequest();      
    xhr.open('GET', '../sayPG/' + p + "/" + g, false);
    xhr.send();
}

function generateA(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../generateA', false);
    xhr.send();
    askA();
}

function askA(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../askA', false);
    xhr.send();
    document.getElementById("a").innerHTML = xhr.responseText;
}

function sayB(){
    var b = document.getElementById("b").value;
    var xhr = new XMLHttpRequest();      
    xhr.open('GET', '../sayB/' + b, false);
    xhr.send();
}

function b(){
    var p = document.getElementById("p").value;
    var g = document.getElementById("g").value;
    var b = rand(100, 10000);
    document.getElementById("b0").innerHTML = b;
    var B = modexp(g, b, p);
    document.getElementById("b").value = B;
}

function askK(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../askK', false);
    xhr.send();
    document.getElementById("k'").innerHTML = xhr.responseText;
}

function k(){
    var p = parseInt(document.getElementById("p").value);
    var a = parseInt(document.getElementById("a").innerHTML);
    var b0 = parseInt(document.getElementById("b0").innerHTML);
    document.getElementById("k").innerHTML = modexp(a,b0,p);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(){
    var log = document.getElementById("status")
    var server = "<span style='color:green'>Server</span>"
    var client = "<span style='color:red'>Client</span>"
       
    log.innerHTML += "<br/>" + server + " generates P and G"
    await highlight("cell2");
    generatePG();

    log.innerHTML += "<br/>" + client + " asks "
	+ server + " for P and G"
    await highlight("cell2");
    askPG();

    log.innerHTML += "<br/>" + client + " loads " + server
	+ "'s P and G as it's own"
    await highlight("cell1");
    loadPG();

    log.innerHTML += "<br/>" + client + " generates B"
    await highlight("cell3");
    b();

    log.innerHTML += "<br/>" + client + " says it's B to " + server
    await highlight("cell3");
    sayB();

    log.innerHTML += "<br/>" + server + " generates a and A"
    await highlight("cell4");
    generateA();

    log.innerHTML += "<br/>" + client + " asks " + server + " for A"
    await highlight("cell4");
    askA();

    log.innerHTML += "<br/>" + client + " calculates K"
    await highlight("cell5");
    k();

    log.innerHTML += "<br/>" + server + " calculates K"
    await highlight("cell6");
    askK();
}

async function highlight(e){
    var c = document.getElementById(e);
    var color = c.style.backgroundColor;
    c.style.backgroundColor = 'yellow';
    await sleep(1000);
    c.style.backgroundColor = color;
    await sleep(500);
}
