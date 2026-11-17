(function(){
if(!window.ME)return;
var CK=["Há um setup válido no gráfico?","Stop Loss definido?","Risco dentro do plano?","Dentro dos limites de hoje?","Estou calmo, sem vingança?"],MS=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],DN=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
P2=function(n){return("0"+n).slice(-2)},cy=+today.slice(0,4),cm=+today.slice(5,7)-1,fi="",fr="",editId=null,RP="";
cfg.check=cfg.check||CK.slice();cfg.mSem=cfg.mSem||0;cfg.mMes=cfg.mMes||0;
function S(){save("tp_cfg",cfg)}
function kv(a,b,c){return'<div class="kv"><span>'+a+'</span><b class="'+(c||"")+'">'+b+'</b></div>'}
function sum(a){return a.reduce(function(x,t){return x+t.pl},0)}
function byDay(){var o={};trades.forEach(function(t){if(!t.data)return;var d=o[t.data]=o[t.data]||{pl:0,n:0,l:0};d.pl+=t.pl;d.n++;if(t.res==="Loss")d.l++});return o}
function nav(t){document.querySelector('nav button[data-t="'+t+'"]').click()}
// avatar + FAB
var ini=ME.nome.trim().split(/\s+/).map(function(x){return x[0]}).slice(0,2).join("").toUpperCase();
$("acc").textContent=ini;$("acc").onclick=function(){nav("conta")};
$("f_rr").insertAdjacentHTML("afterend",'<div id="rrq" class="chips"></div>');
function rq(){$("rrq").innerHTML=[cfg.rrA,cfg.rrB].map(function(v){return'<button type="button" class="chip" data-v="'+v+'">1:'+v+'</button>'}).join("");document.querySelectorAll("#rrq .chip").forEach(function(b){b.onclick=function(){$("f_rr").value=b.dataset.v;suggest()}})}
var _fd=formDefaults;formDefaults=function(){_fd();rq()};rq();
$("fab").classList.remove("hid");document.querySelectorAll("nav button").forEach(function(b){b.addEventListener("click",function(){$("fab").classList.toggle("hid",b.dataset.t!=="painel")})});$("fab").onclick=function(){nav("diario");setTimeout(function(){$("f_res").scrollIntoView({behavior:"smooth",block:"center"})},50)};
// checklist
var cd=document.createElement("div");cd.className="card";cd.id="chk";$("diario").insertBefore(cd,$("diario").firstChild);
function drawChk(){cd.innerHTML='<h2>Checklist antes de entrar</h2>'+cfg.check.map(function(c){return'<label class="ck"><input type="checkbox"> '+esc(c)+'</label>'}).join("")}
var oa=$("add").onclick;
$("add").onclick=function(){var d=$("f_data").value,td=trades.filter(function(t){return t.data===d}),tl=td.filter(function(t){return t.res==="Loss"}).length,m=[];
if(document.querySelector("#chk input:not(:checked)"))m.push("A checklist não está completa.");
if(td.length>=cfg.maxT||tl>=cfg.maxL||sum(td)<=-cfg.limD)m.push("Já atingiste o limite desse dia.");
if(!editId&&m.length&&!confirm("⚠️ "+m.join(" ")+"\nRegistar mesmo assim?"))return;
var n=trades.length;oa.call(this);
if(trades.length>n){if(editId){trades=trades.filter(function(t){return t.id!==editId});editId=null;S2()}$("add").textContent="Registar trade";drawChk();render()}};
function S2(){save("tp_trades",trades)}
// histórico com filtros e editar
$("list").insertAdjacentHTML("beforebegin",'<div class="row2" style="margin-bottom:8px"><select id="fi"></select><select id="fr"><option value="">Todos os resultados</option><option>Win</option><option>Loss</option><option>BE</option></select></div>');
$("fi").onchange=function(){fi=this.value;drawList()};$("fr").onchange=function(){fr=this.value;drawList()};
function ed(id){var t=trades.filter(function(x){return x.id===id})[0];if(!t)return;nav("diario");
["data","inst","dir","risco","res","pl","setup","nota"].forEach(function(k){$("f_"+k).value=t[k]==null?"":t[k]});
$("f_rr").value=t.rr;editId=id;$("add").textContent="Guardar alterações";$("f_inst").scrollIntoView({behavior:"smooth",block:"center"})}
function drawList(){var is=[],i;trades.forEach(function(t){if(is.indexOf(t.inst)<0)is.push(t.inst)});
$("fi").innerHTML='<option value="">Todos os instrumentos</option>'+is.map(function(x){return'<option>'+esc(x)+'</option>'}).join("");$("fi").value=fi;
var L=trades.filter(function(t){return(!fi||t.inst===fi)&&(!fr||t.res===fr)}).sort(function(a,b){return(b.data||"").localeCompare(a.data||"")||b.id-a.id});
$("list").innerHTML=L.length?L.map(function(t){return'<div class="tr"><div><b>'+esc(t.inst)+'</b> <span class="tag">'+t.dir+'</span> <span class="tag '+(t.res==="Win"?"w":t.res==="Loss"?"l":"")+'">'+t.res+'</span><br><small>'+(t.data||"").split("-").reverse().join("/")+' · 1:'+t.rr+' · risco '+fmt(t.risco,0)+(t.setup?' · '+esc(t.setup):'')+'</small></div><div style="text-align:right"><b class="'+(t.pl>=0?"gn":"rd")+'">'+fmt(t.pl)+'</b><br><button class="ghost" data-e="'+t.id+'" style="color:var(--ac)">editar</button><button class="ghost" data-d="'+t.id+'">apagar</button></div></div>'}).join(""):'<div class="empty">Sem trades.</div>';
document.querySelectorAll("[data-e]").forEach(function(b){b.onclick=function(){ed(+b.dataset.e)}});
document.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){del(+b.dataset.d)}})}
// análise
function drawAn(){var D=byDay(),ts=trades.slice().sort(function(a,b){return(a.data||"").localeCompare(b.data||"")||a.id-b.id}),
gw=sum(ts.filter(function(t){return t.pl>0})),gl=-sum(ts.filter(function(t){return t.pl<0})),pf=gl?(gw/gl).toFixed(2):(gw?"∞":"–"),run=cfg.cap,pk=run,mdd=0,ls=0,ml=0,wd={},ins={};
ts.forEach(function(t){run+=t.pl;pk=Math.max(pk,run);mdd=Math.max(mdd,pk-run);if(t.res==="Loss"){ls++;ml=Math.max(ml,ls)}else ls=0;var k=t.data?new Date(t.data+"T12:00:00").getDay():-1;if(k>=0)wd[k]=(wd[k]||0)+t.pl;ins[t.inst]=(ins[t.inst]||0)+t.pl});
var wk=Object.keys(wd).sort(function(a,b){return wd[b]-wd[a]}),ik=Object.keys(ins).sort(function(a,b){return ins[b]-ins[a]}),ds=Object.keys(D).sort().reverse(),st=0,i;
for(i=0;i<ds.length;i++){var d=D[ds[i]];if(d.n<=cfg.maxT&&d.l<=cfg.maxL&&d.pl>=-cfg.limD)st++;else break}
var t0=new Date(today+"T12:00:00"),ws=new Date(t0);ws.setDate(t0.getDate()-((t0.getDay()+6)%7));var wsk=ws.getFullYear()+"-"+P2(ws.getMonth()+1)+"-"+P2(ws.getDate()),
tw=ts.filter(function(t){return t.data>=wsk&&t.data<=today}),pw=sum(tw),pm=sum(ts.filter(function(t){return(t.data||"").slice(0,7)===today.slice(0,7)}));
function goal(n,v,m){return'<div class="kv"><span>'+n+'</span><b class="'+(v>=0?"gn":"rd")+'">'+fmt(v)+(m?' / '+fmt(m,0):'')+'</b></div>'+(m?'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,v/m*100))+'%"></i></div>':'<p class="sub" style="margin:0">Define a meta em Ajustes.</p>')}
var mk=cy+"-"+P2(cm+1),mt=sum(ts.filter(function(t){return(t.data||"").slice(0,7)===mk})),first=new Date(cy,cm,1),dim=new Date(cy,cm+1,0).getDate(),h='';
for(i=0;i<(first.getDay()+6)%7;i++)h+='<i></i>';
for(i=1;i<=dim;i++){var r=D[mk+"-"+P2(i)];h+='<div class="cd '+(r?(r.pl>0?"w":r.pl<0?"l":"b"):"")+'">'+i+(r?'<small>'+Math.round(r.pl)+'</small>':'')+'</div>'}
RP="📈 Seven Trading · semana desde "+wsk.split("-").reverse().join("/")+"\nTrades: "+tw.length+" (Win "+tw.filter(function(t){return t.res==="Win"}).length+")\nP/L semana: "+fmt(pw)+"\nP/L mês: "+fmt(pm)+"\nSequência de disciplina: "+st+" dias";
$("analise").innerHTML='<div class="card"><h2>Metas</h2>'+goal("Semana",pw,cfg.mSem)+goal("Mês",pm,cfg.mMes)+'</div>'+
'<div class="card"><h2>🔥 Disciplina</h2><div class="st"><b>'+st+' dia'+(st===1?"":"s")+'</b><span>seguidos dentro dos limites do plano</span></div></div>'+
'<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn sec" id="cp" style="width:44px;padding:8px">‹</button><h2 style="margin:0;text-align:center">'+MS[cm]+' '+cy+'<br><small class="'+(mt>=0?"gn":"rd")+'">'+fmt(mt)+'</small></h2><button class="btn sec" id="cn" style="width:44px;padding:8px">›</button></div><div class="cal" style="margin-top:10px">'+["S","T","Q","Q","S","S","D"].map(function(x){return'<b>'+x+'</b>'}).join("")+h+'</div></div>'+
'<div class="card"><h2>Estatísticas avançadas</h2>'+kv("Fator de lucro",pf)+kv("Drawdown máximo",fmt(mdd),"rd")+kv("Maior sequência de perdas",ml)+(wk.length?kv("Melhor dia da semana",DN[wk[0]]+" ("+fmt(wd[wk[0]],0)+")","gn")+kv("Pior dia da semana",DN[wk[wk.length-1]]+" ("+fmt(wd[wk[wk.length-1]],0)+")","rd"):"")+
(ik.length?'<h2 style="margin:12px 0 4px;font-size:.9rem">Por instrumento</h2>'+ik.map(function(k){return kv(esc(k),fmt(ins[k],0),ins[k]>=0?"gn":"rd")}).join(""):"")+'</div>'+
'<div class="card"><h2>Relatório da semana</h2><pre class="sub" style="white-space:pre-wrap;margin:0 0 10px">'+esc(RP)+'</pre><button class="btn" id="rp">Partilhar / copiar</button></div>';
$("cp").onclick=function(){cm--;if(cm<0){cm=11;cy--}drawAn()};$("cn").onclick=function(){cm++;if(cm>11){cm=0;cy++}drawAn()};
$("rp").onclick=function(){try{if(navigator.share)navigator.share({text:RP});else{navigator.clipboard.writeText(RP);alert("Relatório copiado.")}}catch(e){}}}
var _r=render;render=function(){_r();drawList();drawAn()};
// ferramentas
var IN={XAUUSD:"Stop (em $ de preço)",EURUSD:"Stop (pips)",GBPUSD:"Stop (pips)",AUDUSD:"Stop (pips)",USDJPY:"Stop (pips)"};
$("ferr").innerHTML='<div class="card"><h2>🧮 Calculadora de lote</h2><div class="grid"><div><label>Instrumento</label><select id="c_i">'+Object.keys(IN).map(function(k){return'<option>'+k+'</option>'}).join("")+'</select></div><div><label>Risco ('+esc(cfg.moeda)+')</label><input type="number" id="c_r" step="any"></div><div><label id="c_sl"></label><input type="number" id="c_s" step="any"></div><div><label>RR (1:X)</label><input type="number" id="c_rr" step="any" value="'+cfg.rrA+'"></div><div><label>Valor por pip/ponto por 1 lote (USD, opcional)</label><input type="number" id="c_v" step="any" placeholder="auto"></div><div id="c_pxw"><label>Preço atual (USDJPY)</label><input type="number" id="c_p" step="any" placeholder="150"></div></div><div id="c_out" style="margin-top:10px"></div><p class="sub" style="margin:8px 0 0">Estimativa para contrato padrão (1 lote = 100.000 unidades; ouro 100 oz). Contas cent ou outros tipos têm contrato diferente: confirma o valor do pip na tua plataforma e mete-o no campo opcional.</p></div>'+
'<div class="card"><h2>🕐 Sessões de mercado</h2><div id="ses"></div></div>'+
'<div class="card"><h2>💱 Conversor USC / USD / MZN</h2><div class="grid" style="grid-template-columns:1fr 1fr 1fr"><div><label>Valor</label><input type="number" id="v_a" step="any" value="1000"></div><div><label>Em</label><select id="v_u"><option>USC</option><option>USD</option><option>MZN</option></select></div><div><label>MZN por 1 USD</label><input type="number" id="v_t" step="any"></div></div><div id="v_o" style="margin-top:10px"></div></div>';
$("c_r").value=cfg.risco;
function calc(){var i=$("c_i").value,r=parseFloat($("c_r").value)||0,sl=parseFloat($("c_s").value)||0,rr=parseFloat($("c_rr").value)||0,px=parseFloat($("c_p").value)||150,dv=cfg.moeda==="USC"?100:1,pv=parseFloat($("c_v").value)||(i==="XAUUSD"?100:i==="USDJPY"?1000/px:10);
$("c_sl").textContent=IN[i];$("c_pxw").style.display=i==="USDJPY"?"":"none";
var lot=sl>0?Math.floor(r/dv/(sl*pv)*100)/100:0,real=lot*sl*pv*dv;
$("c_out").innerHTML=!sl?'<div class="empty">Indica o stop.</div>':lot<0.01?'<div class="empty">Stop demasiado largo: o lote mínimo (0.01) arrisca mais do que o definido.</div>':
'<div class="kv"><span>Lote</span><b>'+lot.toFixed(2)+'</b></div><div class="kv"><span>Risco real</span><b>'+fmt(real)+'</b></div><div class="kv"><span>Alvo 1:'+rr+' a '+(sl*rr).toFixed(i==="XAUUSD"?2:1)+'</span><b class="gn">+'+fmt(real*rr)+'</b></div>'}
["c_i","c_r","c_s","c_rr","c_p","c_v"].forEach(function(x){$(x).oninput=$(x).onchange=calc});calc();
var SS=[["Sydney",22,7],["Tóquio",0,9],["Londres",8,17],["Nova Iorque",13,22]];
function ses(){var n=new Date(),h=n.getUTCHours()+n.getUTCMinutes()/60,f=function(x){return P2((x+2)%24)+":00"};
$("ses").innerHTML=SS.map(function(s){var o=s[1]<s[2]?(h>=s[1]&&h<s[2]):(h>=s[1]||h<s[2]);return'<div class="kv"><span><i class="dot '+(o?"on":"")+'"></i>'+s[0]+'</span><span class="mut">'+f(s[1])+'–'+f(s[2])+'</span></div>'}).join("")+'<p class="sub" style="margin:8px 0 0">Horas de Maputo (UTC+2), aproximadas (mudam 1h com o horário de verão). Agora: '+n.toLocaleTimeString("pt-PT",{timeZone:"Africa/Maputo",hour:"2-digit",minute:"2-digit"})+'</p>'}
ses();setInterval(ses,30000);
$("v_t").value=localStorage.getItem("st_mzn")||64;
function conv(){var a=parseFloat($("v_a").value)||0,t=parseFloat($("v_t").value)||64,u=$("v_u").value,d=u==="USC"?a/100:u==="USD"?a:a/t,f=function(x){return x.toLocaleString("pt-PT",{maximumFractionDigits:2})};localStorage.setItem("st_mzn",t);
$("v_o").innerHTML=kv("USC",f(d*100))+kv("USD",f(d))+kv("MZN",f(d*t))+'<p class="sub" style="margin:6px 0 0">Define tu a taxa do dia (não há ligação a câmbios em tempo real).</p>'}
["v_a","v_u","v_t"].forEach(function(x){$(x).oninput=$(x).onchange=conv});conv();
// ajustes: metas, checklist, PIN, tema
$("editar").insertAdjacentHTML("beforeend",'<div class="card"><h2>Metas, checklist e segurança</h2><div class="grid" style="grid-template-columns:1fr 1fr"><div><label>Meta semanal</label><input type="number" id="a_ms" step="any"></div><div><label>Meta mensal</label><input type="number" id="a_mm" step="any"></div></div><label style="margin-top:10px">Checklist antes de entrar (um ponto por linha)</label><textarea id="a_ck"></textarea><label style="margin-top:10px">PIN de acesso (4 a 6 números)</label><div class="row2" style="grid-template-columns:1fr auto auto"><input id="a_pin" type="password" inputmode="numeric" maxlength="6"><button class="btn" id="a_ps" style="width:auto">Definir</button><button class="btn sec" id="a_pr" style="width:auto">Remover</button></div><p class="sub" id="a_pm" style="margin:6px 0 0"></p><button class="btn sec" id="a_th" style="margin-top:12px"></button></div>');
$("a_ms").value=cfg.mSem||"";$("a_mm").value=cfg.mMes||"";$("a_ck").value=cfg.check.join("\n");
$("a_ms").oninput=function(){cfg.mSem=+this.value||0;S();drawAn()};$("a_mm").oninput=function(){cfg.mMes=+this.value||0;S();drawAn()};
$("a_ck").oninput=function(){cfg.check=this.value.split("\n").filter(function(l){return l.trim()});S();drawChk()};
function th(){$("a_th").textContent=document.documentElement.dataset.theme==="light"?"🌙 Mudar para escuro":"☀️ Mudar para claro"}th();
$("a_th").onclick=function(){var n=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=n;localStorage.setItem("st_theme",n);th()};
function sha(t){var s="st"+PFX+t;return window.crypto&&crypto.subtle?crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return P2(x.toString(16))}).join("")}):Promise.resolve("p"+s)}
function pm(t){$("a_pm").textContent=t}
$("a_ps").onclick=function(){var v=$("a_pin").value;if(!/^\d{4,6}$/.test(v))return pm("O PIN deve ter 4 a 6 números.");sha(v).then(function(h){localStorage.setItem(PFX+"pin",h);$("a_pin").value="";pm("PIN definido.")})};
$("a_pr").onclick=function(){localStorage.removeItem(PFX+"pin");pm("PIN removido.")};
if(localStorage.getItem(PFX+"pin")&&!sessionStorage.getItem("st_un"))$("lock").classList.remove("hid");
$("k_go").onclick=function(){sha($("k_in").value).then(function(h){if(h===localStorage.getItem(PFX+"pin")){sessionStorage.setItem("st_un","1");$("lock").classList.add("hid");$("k_in").value=""}else $("k_m").textContent="PIN errado."})};
$("k_out").onclick=function(){localStorage.removeItem("st_ses");sessionStorage.removeItem("st_un");location.reload()};
drawChk();drawList();drawAn();
})();
