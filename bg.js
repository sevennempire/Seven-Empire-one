function bgAnim(id){var cv=document.getElementById(id||"bg"),x=cv.getContext("2d"),D=Math.min(window.devicePixelRatio||1,2),W,H,S,CW,cs=[],px=0,pr=100,fx=[],rm=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
function mk(){var o=pr,c=o+(Math.random()-.48)*5+(100-o)*.01,h=Math.max(o,c)+Math.random()*2.5,l=Math.min(o,c)-Math.random()*2.5;pr=c;return{o:o,h:h,l:l,c:c}}
function mm(d){return{buy:Math.random()<.5,rr:Math.random()<.5?4:5,win:Math.random()<.55,done:d}}
function rs(){W=cv.width=innerWidth*D;H=cv.height=innerHeight*D;CW=(innerWidth<600?9:12)*D;S=CW*1.45;var n=Math.ceil(W/S)+3;while(cs.length<n)cs.push(mk());while(cs.length>n)cs.shift()}
rs();addEventListener("resize",rs);cs.forEach(function(c){if(Math.random()<.12)c.m=mm(1)});
function draw(){x.clearRect(0,0,W,H);var mn=1e9,mx=-1e9;cs.forEach(function(c){mn=Math.min(mn,c.l);mx=Math.max(mx,c.h)});
var T=H*.2,B=H*.8,Y=function(v){return B-(v-mn)/(mx-mn||1)*(B-T)};
x.lineWidth=D;x.strokeStyle="rgba(255,255,255,.05)";for(var i=1;i<8;i++){x.beginPath();x.moveTo(0,H*i/8);x.lineTo(W,H*i/8);x.stroke()}
cs.forEach(function(c,i){var X=i*S-px,up=c.c>=c.o;x.globalAlpha=.6;x.fillStyle=x.strokeStyle=up?"#22c55e":"#ef4444";x.lineWidth=D*1.2;x.beginPath();x.moveTo(X+CW/2,Y(c.h));x.lineTo(X+CW/2,Y(c.l));x.stroke();var a=Y(Math.max(c.o,c.c));x.fillRect(X,a,CW,Math.max(Y(Math.min(c.o,c.c))-a,2*D));x.globalAlpha=1});
x.beginPath();x.strokeStyle="#60a5fa";x.lineWidth=2*D;x.shadowColor="#3b82f6";x.shadowBlur=12*D;
cs.forEach(function(c,i){var s=0,k=0;for(var j=Math.max(0,i-8);j<=i;j++){s+=cs[j].c;k++}var X=i*S-px+CW/2,y=Y(s/k);i?x.lineTo(X,y):x.moveTo(X,y)});x.stroke();x.shadowBlur=0;
x.font="600 "+11*D+"px system-ui,sans-serif";
cs.forEach(function(c,i){var m=c.m;if(!m)return;var X=i*S-px+CW/2,y=m.buy?Y(c.l)+14*D:Y(c.h)-14*D;x.fillStyle=m.buy?"#22c55e":"#ef4444";x.beginPath();
if(m.buy){x.moveTo(X,y-7*D);x.lineTo(X-6*D,y+5*D);x.lineTo(X+6*D,y+5*D)}else{x.moveTo(X,y+7*D);x.lineTo(X-6*D,y-5*D);x.lineTo(X+6*D,y-5*D)}x.fill();
x.fillText((m.buy?"BUY":"SELL")+" 1:"+m.rr,X+10*D,y+4*D);
if(!m.done&&X<W*.4){m.done=1;fx.push({x:X,y:y,t:m.win?"+"+m.rr*100+" USC":"−100 USC",g:m.win,a:1})}});
fx=fx.filter(function(f){return f.a>0});x.font="700 "+15*D+"px system-ui,sans-serif";
fx.forEach(function(f){x.globalAlpha=f.a;x.fillStyle=f.g?"#4ade80":"#f87171";x.fillText(f.t,f.x,f.y);f.y-=.6*D;f.a-=.008});x.globalAlpha=1}
function tick(){px+=.7*D;if(px>=S){px-=S;cs.shift();var c=mk();if(Math.random()<.2)c.m=mm(0);cs.push(c)}}
function loop(){if(!document.hidden){tick();draw()}requestAnimationFrame(loop)}
draw();if(!rm)loop()}
