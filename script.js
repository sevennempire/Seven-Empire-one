var $=function(i){return document.getElementById(i)};
function load(k,d){try{var v=localStorage.getItem(PFX+k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(PFX+k,JSON.stringify(v))}catch(e){}if(window.cloudPush)cloudPush()}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fmt(n,d){return n.toLocaleString("pt-PT",{maximumFractionDigits:d==null?2:d})+" "+cfg.moeda}
var DEF={cap:2000,meta:100000,risco:100,ops:15,acerto:50,rrA:4,rrB:5,moeda:"USC",maxT:3,maxL:2,limD:200,limS:400,dd:15,minT:50,obj:"",regras:[],planEd:null,comp:null};
var cfg=Object.assign({},DEF,load("tp_cfg",{})),trades=load("tp_trades",[]),commit=load("tp_commit",false);cfg.regras=(cfg.regras||[]).slice();
var today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);

document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){
document.querySelectorAll("nav button").forEach(function(x){x.classList.toggle("on",x===b)});
["painel","diario","analise","ferr","plano","editar","conta"].forEach(function(s){$(s).classList.toggle("hid",s!==b.dataset.t)});window.scrollTo(0,0)}});

var CFG=[["cap","Saldo inicial"],["meta","Meta final"],["risco","Risco fixo por trade"],["ops","Operações por semana"],["acerto","Taxa de acerto hipotética (%)"],["rrA","Alvo RR A"],["rrB","Alvo RR B"],["maxT","Máx. trades por dia"],["maxL","Máx. perdas por dia"],["limD","Limite de perda diário"],["limS","Limite de perda semanal"],["dd","Drawdown (%) que obriga a reduzir risco"],["minT","Trades mínimos para rever o risco"]];
$("cfg").innerHTML='<div><label>Moeda / unidade da conta</label><input data-k="moeda" data-txt="1" value="'+esc(cfg.moeda)+'" maxlength="6"></div>'+CFG.map(function(c){return '<div><label>'+c[1]+'</label><input type="number" step="any" data-k="'+c[0]+'" value="'+cfg[c[0]]+'"></div>'}).join("")+'<div class="full"><button class="ghost" id="rst" style="color:var(--mu)">repor valores do plano</button></div>';
document.querySelectorAll("#cfg input").forEach(function(i){i.oninput=function(){if(i.dataset.txt){cfg.moeda=i.value.trim()||"USC";save("tp_cfg",cfg);render();formDefaults();return}var v=parseFloat(i.value);if(v>0){cfg[i.dataset.k]=v;save("tp_cfg",cfg);render();formDefaults()}}});
$("rst").onclick=function(){cfg=Object.assign({},DEF,{obj:cfg.obj,regras:cfg.regras,planEd:cfg.planEd,comp:cfg.comp,check:cfg.check,mSem:cfg.mSem,mMes:cfg.mMes});save("tp_cfg",cfg);document.querySelectorAll("#cfg input").forEach(function(i){i.value=cfg[i.dataset.k]});render();formDefaults()};

function nextRR(){var n=trades.length,per=Math.round(cfg.ops),wk=Math.floor(n/per),i=n%per;return (wk+i)%2===0?cfg.rrA:cfg.rrB}
function weekOf(n){return Math.floor(n/Math.round(cfg.ops))+1}
function suggest(){var r=$("f_res").value,k=parseFloat($("f_risco").value)||0,rr=parseFloat($("f_rr").value)||0;
$("f_pl").value=r==="Win"?k*rr:r==="Loss"?-k:0}
function formDefaults(){$("f_data").value=today;$("f_risco").value=cfg.risco;
$("f_rr").value=nextRR();suggest()}
["f_res","f_rr","f_risco"].forEach(function(i){$(i).onchange=$(i).oninput=suggest});

$("add").onclick=function(){
var pl=parseFloat($("f_pl").value);if(isNaN(pl)){alert("Indica o P/L.");return}
trades.push({id:Date.now(),sem:weekOf(trades.length),data:$("f_data").value,inst:$("f_inst").value.trim().toUpperCase(),dir:$("f_dir").value,
rr:parseFloat($("f_rr").value),risco:parseFloat($("f_risco").value)||0,res:$("f_res").value,pl:pl,setup:$("f_setup").value.trim(),nota:$("f_nota").value.trim()});
save("tp_trades",trades);$("f_setup").value="";$("f_nota").value="";formDefaults();render()};
function del(id){if(confirm("Apagar este trade?")){trades=trades.filter(function(t){return t.id!==id});
trades.forEach(function(t,i){t.sem=weekOf(i)});save("tp_trades",trades);formDefaults();render()}}

function head(){var c=cfg,pc=c.risco/c.cap*100;$("sub").textContent="XAUUSD + Forex · Day trading · "+fmt(c.cap,0)+" → "+fmt(c.meta,0);
var wn=$("warn");if(wn)wn.innerHTML='<b>Aviso de risco:</b> arriscar '+fmt(c.risco,0)+' numa conta de '+fmt(c.cap,0)+' é '+pc.toFixed(1)+'% por operação. Cinco perdas seguidas = '+fmt(c.risco*5,0)+' ('+(c.risco*5/c.cap*100).toFixed(0)+'% do capital). O plano não garante resultados.'}
function render(){head();renderPlan();
var c=cfg,p=c.acerto/100,n=Math.round(c.ops),nA=Math.ceil(n/2),nB=n-nA,avg=(nA*c.rrA+nB*c.rrB)/n;
var exp=n*p*c.risco*avg-n*(1-p)*c.risco,weeks=exp>0?Math.ceil((c.meta-c.cap)/exp):0;
var pl=trades.reduce(function(a,t){return a+t.pl},0),saldo=c.cap+pl,w=trades.filter(function(t){return t.res==="Win"}).length;
var prog=Math.max(0,Math.min(100,pl/(c.meta-c.cap)*100));
$("prog").innerHTML='<div class="grid"><div class="st"><span>Saldo real</span><b>'+fmt(saldo)+'</b></div><div class="st"><span>Lucro/prejuízo</span><b class="'+(pl>=0?"gn":"rd")+'">'+fmt(pl)+'</b></div><div class="st"><span>Trades</span><b>'+trades.length+'</b></div><div class="st"><span>Acerto real</span><b>'+(trades.length?Math.round(w/trades.length*100)+"%":"–")+'</b></div></div><div class="bar"><i style="width:'+prog+'%"></i></div><span class="sub">'+prog.toFixed(1)+'% do caminho até '+fmt(c.meta,0)+'</span>'+(trades.length>=c.minT?'':'<p class="sub" style="margin:6px 0 0">Revê os resultados após '+c.minT+'–'+c.minT*2+' operações ('+trades.length+' feitas).</p>');
$("proj").innerHTML=[["Risco inicial por trade",(c.risco/c.cap*100).toFixed(1)+"% do capital"],["Lucro bruto no alvo 1:"+c.rrA,fmt(c.risco*c.rrA,0)],["Lucro bruto no alvo 1:"+c.rrB,fmt(c.risco*c.rrB,0)],["Lucro esperado semanal ("+nA+"× 1:"+c.rrA+" e "+nB+"× 1:"+c.rrB+")",fmt(exp,0)],["Semanas teóricas até à meta",exp>0?weeks:"inatingível"],["Saldo teórico nessa semana",exp>0?fmt(c.cap+weeks*exp,0):"–"]].map(function(r){return '<div class="kv"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>'}).join("");
var ms=(c.cap===2000&&c.meta===100000)?[c.cap,10000,25000,50000,75000,c.meta]:[0,.1,.25,.5,.75,1].map(function(f,i){return i===0?c.cap:i===5?c.meta:Math.round((c.cap+(c.meta-c.cap)*f)/100)*100}),nm=["Início","Marco 1","Marco 2","Marco 3","Marco 4","Meta"],ac=["Confirmar conta, contrato, custos e volume mínimo","Rever resultados líquidos e drawdown","Reavaliar risco fixo e exposição percentual","Rever estratégia e consistência","Proteger capital; não aumentar risco por euforia","Avaliar levantamento, reserva e plano seguinte"];
$("marcos").innerHTML=ms.map(function(m,i){return '<tr><td>'+(saldo>=m&&i>0?'<span class="ok">✓</span> ':'')+nm[i]+'</td><td>'+fmt(m,0)+'</td><td style="white-space:normal">'+ac[i]+'</td></tr>'}).join("");
// limites
var td=trades.filter(function(t){return t.data===today}),tdPL=td.reduce(function(a,t){return a+t.pl},0),tdL=td.filter(function(t){return t.res==="Loss"}).length;
var wk=trades.length?trades[trades.length-1].sem:1,wkPL=trades.filter(function(t){return t.sem===wk}).reduce(function(a,t){return a+t.pl},0);
var last2=trades.slice(-2),cons=last2.length===2&&last2.every(function(t){return t.res==="Loss"})&&last2[1].data===today;
var al=[];if(td.length>=c.maxT)al.push("Já fizeste "+c.maxT+" trades hoje: limite diário atingido.");
if(tdL>=c.maxL||tdPL<=-c.limD)al.push("Limite diário de perda atingido ("+c.maxL+" perdas ou −"+fmt(c.limD,0)+"): pára hoje.");
if(cons&&!(tdL>=c.maxL))al.push("Duas perdas seguidas: encerra a sessão e revê as decisões.");
if(wkPL<=-c.limS)al.push("Limite semanal (−"+fmt(c.limS,0)+") atingido: pára e revê o diário antes de voltar.");
$("lim").innerHTML='<h2>Limites de hoje</h2><div class="grid"><div class="st"><span>Trades hoje (máx. '+c.maxT+')</span><b>'+td.length+'</b></div><div class="st"><span>Perdas hoje (máx. '+c.maxL+')</span><b>'+tdL+'</b></div><div class="st"><span>P/L hoje (pára em −'+c.limD+')</span><b class="'+(tdPL>=0?"gn":"rd")+'">'+fmt(tdPL,0)+'</b></div><div class="st"><span>P/L semana '+wk+' (pára em −'+c.limS+')</span><b class="'+(wkPL>=0?"gn":"rd")+'">'+fmt(wkPL,0)+'</b></div></div>'+(al.length?al.map(function(a){return '<p class="rd" style="margin:10px 0 0"><b>⚠ '+a+'</b></p>'}).join(""):'<p class="ok" style="margin:10px 0 0;font-size:.88rem">Dentro dos limites.</p>');
chart();stats();risk();
// lista
var rev=trades.slice().reverse();
$("list").innerHTML=rev.length?rev.map(function(t){var d=t.data?t.data.split("-").reverse().join("/"):"";
return '<div class="tr"><div><b>'+esc(t.inst)+'</b> <span class="tag">'+t.dir+'</span> <span class="tag">1:'+t.rr+'</span> <span class="tag '+(t.res==="Win"?"w":t.res==="Loss"?"l":"")+'">'+t.res+'</span><br><small>Semana '+t.sem+' · '+d+(t.setup?' · '+esc(t.setup):'')+'</small>'+(t.nota?'<br><small>'+esc(t.nota)+'</small>':'')+'</div><div style="text-align:right"><b class="'+(t.pl>=0?"gn":"rd")+'">'+fmt(t.pl)+'</b><br><button class="ghost" data-id="'+t.id+'">apagar</button></div></div>'}).join(""):'<div class="empty">Sem trades registados.</div>';
document.querySelectorAll(".ghost[data-id]").forEach(function(b){b.onclick=function(){del(parseInt(b.dataset.id))}})}

function mkSec(){var c=cfg;return [
["1. Objetivo",["Procurar atingir "+fmt(c.meta,0)+" a partir de "+fmt(c.cap,0)+" com day trading em XAUUSD e pares Forex.","Prazo indeterminado: depende do desempenho real, das condições de mercado, dos custos e da disciplina.","Risco planeado: "+fmt(c.risco,0)+" fixos por trade; média de até "+c.ops+" operações por semana; RR alternado 1:"+c.rrA+" e 1:"+c.rrB+", quando tecnicamente viável."]],
["2. Risco e retorno",["RR 1:"+c.rrA+": perda máxima "+fmt(c.risco,0)+", lucro bruto no alvo "+fmt(c.risco*c.rrA,0)+". RR 1:"+c.rrB+": perda "+fmt(c.risco,0)+", lucro bruto "+fmt(c.risco*c.rrB,0)+".","Só usar 1:"+c.rrA+" ou 1:"+c.rrB+" quando a estrutura, a volatilidade e as zonas do gráfico deixarem espaço real até ao Take Profit."]],
["3. Regras de entrada e execução",["Analisar H4/H1 para contexto e direção; M15 para zonas e M5 para confirmação, se fizer parte do método testado.","Negociar apenas setups previamente definidos e registados; nunca por tédio, FOMO ou para recuperar perdas.","Definir o Stop Loss antes de entrar e calcular o volume para não ultrapassar o risco escolhido.","Take Profit em 1:"+c.rrA+" ou 1:"+c.rrB+" só com espaço técnico; não afastar o alvo artificialmente.","Não alargar o Stop Loss, não fazer martingale, não aumentar posição numa operação perdedora.","Não abrir várias posições correlacionadas se a soma dos riscos ultrapassar o limite.","Gerir as posições conforme as regras do setup; não transformar day trading em posições mantidas por impulso."]],
["4. Limites de proteção",["Trades por dia: até "+c.maxT+" ("+c.ops+" por semana é média de planeamento, nunca obrigação).","Limite diário: parar após "+c.maxL+" perdas ou −"+fmt(c.limD,0)+", o que ocorrer primeiro.","Limite semanal: parar após −"+fmt(c.limS,0)+" e rever o diário antes de voltar.","Duas perdas seguidas: encerrar a sessão e rever decisões.","Notícias: evitar novas entradas antes e durante notícias de alto impacto.","Risco agregado: somar o risco de todas as posições abertas; evitar exposição duplicada em pares correlacionados.","Alternativa mais prudente: reduzir o risco para "+fmt(c.cap*.01,0)+"–"+fmt(c.cap*.02,0)+" por trade (1–2% do capital inicial), sobretudo perto dos "+fmt(c.cap,0)+"."]],
["5. Dimensionamento da posição",["Não existe lote universal: o valor por ponto/pip depende do instrumento, contrato, moeda e tipo de conta.","Definir entrada e Stop Loss; usar a calculadora de trading da Exness (instrumento, entrada, SL, moeda da conta).","Ajustar o volume até a perda estimada, com custos razoáveis, ficar dentro do risco permitido.","Se o volume mínimo gerar perda acima do limite, não executar a operação.","Confirmar se o símbolo tem sufixo próprio do tipo de conta."]],
["6. Notícias e calendário",["Acompanhar CPI, NFP, FOMC, PCE, decisões de taxas e discursos relevantes da Fed.","Não abrir posições nos 15 min anteriores a notícias de alto impacto; esperar 15–30 min após a divulgação, ou mais se o mercado continuar desordenado.","Não negociar notícias só para capturar movimentos rápidos."]],
["7. Diário e revisão",["Registar todas as operações: data, instrumento, BUY/SELL, setup, RR, risco, resultado, P/L e notas, incluindo custos.","Rever após 50–100 operações: taxa de acerto real, lucro médio, perda média, expectativa líquida, maior sequência de perdas, drawdown máximo e cumprimento das regras.","Não aumentar o risco com base numa sequência curta de vitórias."]],
["8. Continuar, pausar ou rever",["Continuar só se as regras forem cumpridas e os resultados líquidos avaliados com amostra suficiente.","Pausar ao atingir os limites diário ou semanal.","Suspender a estratégia se o acerto ou o RR realizado se afastarem materialmente das hipóteses.","Voltar à conta demo ou a risco menor após quebra de disciplina ou drawdown significativo.","Nunca depositar mais dinheiro só para compensar perdas ou cumprir um prazo."]]];}
var COMP="Comprometo-me a tratar o trading como uma atividade de risco, respeitar o Stop Loss, registar todas as operações, aceitar ficar fora do mercado quando não houver setup e não tentar recuperar perdas aumentando a exposição.",EDP=false;
function secs(){return cfg.planEd||mkSec().map(function(s){return{t:s[0],i:s[1]}})}
function sp(){save("tp_cfg",cfg)}
function renderPlan(){
if(EDP){var S=secs();
$("plan").innerHTML='<h2>Editar plano</h2><p class="sub">Muda títulos e textos. Uma linha = um ponto. Guarda sozinho.</p>'+S.map(function(s,i){return'<div class="card" style="margin-bottom:10px"><label>Título</label><input data-st="'+i+'" value="'+esc(s.t)+'"><label style="margin-top:8px">Pontos (um por linha)</label><textarea data-si="'+i+'" style="min-height:110px">'+esc(s.i.join("\n"))+'</textarea><button class="ghost" data-sd="'+i+'">apagar secção</button></div>'}).join("")+'<label>Declaração de compromisso</label><textarea id="ecomp">'+esc(cfg.comp||COMP)+'</textarea><div class="row2" style="margin-top:10px"><button class="btn sec" id="sadd">+ Nova secção</button><button class="btn" id="sdone">Concluir</button></div><button class="ghost" id="sreset" style="color:var(--mu);margin-top:8px">repor plano original</button>';
document.querySelectorAll("[data-st]").forEach(function(e){e.oninput=function(){cfg.planEd[+e.dataset.st].t=e.value;sp()}});
document.querySelectorAll("[data-si]").forEach(function(e){e.oninput=function(){cfg.planEd[+e.dataset.si].i=e.value.split("\n").filter(function(l){return l.trim()});sp()}});
document.querySelectorAll("[data-sd]").forEach(function(b){b.onclick=function(){if(confirm("Apagar esta secção?")){cfg.planEd.splice(+b.dataset.sd,1);sp();renderPlan()}}});
$("ecomp").oninput=function(){cfg.comp=this.value;sp()};
$("sadd").onclick=function(){cfg.planEd.push({t:"Nova secção",i:["Novo ponto"]});sp();renderPlan()};
$("sdone").onclick=function(){EDP=false;renderPlan();window.scrollTo(0,0)};
$("sreset").onclick=function(){if(confirm("Repor o plano original? Perdes as tuas edições.")){cfg.planEd=null;cfg.comp=null;sp();EDP=false;renderPlan()}};
return}
$("plan").innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0">O meu plano</h2><button class="btn sec" id="sedit" style="width:auto;padding:8px 14px">✏️ Editar</button></div>'+secs().map(function(s,i){return'<details'+(i===2?' open':'')+'><summary>'+esc(s.t)+'</summary><ul>'+s.i.map(function(x){return'<li>'+esc(x)+'</li>'}).join("")+'</ul></details>'}).join("")+myRules()+
'<details open><summary>Declaração de compromisso</summary><p style="font-size:.9rem">'+esc(cfg.comp||COMP)+'</p><label style="display:flex;gap:8px;align-items:center;color:var(--tx);font-size:.9rem"><input type="checkbox" id="cm" style="width:auto"'+(commit?" checked":"")+'> Li e assumo este compromisso</label></details><p class="sub" style="margin:10px 0 0">Trading plan educacional, não constitui garantia nem aconselhamento financeiro.</p>';
$("cm").onchange=function(){save("tp_commit",$("cm").checked)};
$("sedit").onclick=function(){cfg.planEd=secs();sp();EDP=true;renderPlan()}}
function myRules(){var c=cfg,h=(c.obj?'<p style="font-size:.9rem">'+esc(c.obj)+'</p>':'')+(c.regras.length?'<ul>'+c.regras.map(function(r){return'<li>'+esc(r)+'</li>'}).join("")+'</ul>':'');return'<details open><summary>Os meus objetivos e regras</summary>'+(h||'<p class="sub">Escreve o teu objetivo e as tuas regras no separador Personalizar.</p>')+'</details>'}
function risk(){var c=cfg,n=trades.length,bal=c.cap,pk=bal;trades.forEach(function(t){bal+=t.pl;pk=Math.max(pk,bal)});
var pl=bal-c.cap,ddp=pk>0?(pk-bal)/pk*100:0,ex=n?pl/n:0,w=trades.filter(function(t){return t.res==="Win"}).length,hit=n?w/n*100:0;
var wk=n?trades[n-1].sem:1,wkPL=trades.filter(function(t){return t.sem===wk}).reduce(function(a,t){return a+t.pl},0);
var l3=n>=3&&trades.slice(-3).every(function(t){return t.res==="Loss"}),rp=c.risco/Math.max(bal,1)*100,R=[],st,cls,msg;
if(ddp>=c.dd)R.push("Drawdown de "+ddp.toFixed(0)+"% desde o pico (limite: "+c.dd+"%)");
if(wkPL<=-c.limS)R.push("Limite semanal de −"+fmt(c.limS,0)+" atingido");
if(l3)R.push("3 perdas seguidas");
if(n>=30&&ex<0)R.push("Expectativa líquida negativa após "+n+" trades");
if(n>=20&&hit<c.acerto-15)R.push("Acerto real de "+hit.toFixed(0)+"%, muito abaixo dos "+c.acerto+"% assumidos");
if(R.length){st="Diminuir";cls="rd";msg="Reduz para cerca de "+fmt(c.risco/2,0)+" (metade) ou para 1–2% do saldo ("+fmt(bal*.01,0)+" a "+fmt(bal*.02,0)+"). Só voltas a subir depois de recuperares e cumprires as regras."}
else if(n>=c.minT&&ex>0&&hit>=c.acerto-5&&ddp<5){var nv=Math.min(c.risco*1.25,bal*.05);st="Aumentar";cls="gn";R.push(n+" trades, expectativa positiva ("+fmt(ex,1)+"/trade), acerto "+hit.toFixed(0)+"%, drawdown "+ddp.toFixed(1)+"%");msg="Podes subir para "+fmt(nv,0)+" (+25%, máx. 5% do saldo). Sobe um degrau de cada vez e reavalia após 20–30 trades."}
else{st="Manter";cls="";if(n<c.minT)R.push("Faltam "+(c.minT-n)+" trades para uma amostra mínima ("+c.minT+")");else{if(ex<=0)R.push("Expectativa ainda não é positiva");if(hit<c.acerto-5)R.push("Acerto real abaixo do assumido");if(ddp>=5)R.push("Drawdown de "+ddp.toFixed(1)+"% (precisa ficar abaixo de 5%)")}msg="Mantém "+fmt(c.risco,0)+" por trade e não aumentes por causa de uma sequência curta de vitórias."}
$("adj").innerHTML='<div class="grid"><div class="st"><span>Recomendação</span><b class="'+cls+'">'+st+'</b></div><div class="st"><span>Risco atual</span><b>'+fmt(c.risco,0)+'</b></div><div class="st"><span>% do saldo</span><b>'+rp.toFixed(1)+'%</b></div><div class="st"><span>Drawdown atual</span><b>'+ddp.toFixed(1)+'%</b></div></div><p style="margin:10px 0 4px"><b>'+msg+'</b></p><ul class="sub" style="margin:0;padding-left:18px">'+R.map(function(r){return'<li>'+r+'</li>'}).join("")+'</ul>'+
'<details><summary>Regras de ajuste</summary><ul><li><b>Diminuir:</b> drawdown ≥ '+c.dd+'% do pico; −'+c.limS+' na semana; 3 perdas seguidas; expectativa negativa após 30 trades; acerto 15 p.p. abaixo do assumido; ou quebra de disciplina.</li><li><b>Manter:</b> menos de '+c.minT+' trades, resultados dentro do esperado ou drawdown entre 5% e 15%.</li><li><b>Aumentar:</b> pelo menos '+c.minT+' trades, expectativa positiva, acerto no máximo 5 p.p. abaixo do assumido, drawdown abaixo de 5% e regras cumpridas. Sobe no máximo 25% de cada vez, até 5% do saldo.</li><li>Com risco fixo em USC, a percentagem desce à medida que o saldo cresce (100 USC = 5% a 2.000 e 1% a 10.000).</li></ul><p class="sub">Guia baseado no teu plano, não é aconselhamento financeiro.</p></details>'}
function chart(){var c=cfg,s=[c.cap],b=c.cap;trades.forEach(function(t){b+=t.pl;s.push(b)});
if(s.length<2){$("chart").innerHTML='<div class="empty">O gráfico aparece depois do primeiro trade.</div>';return}
var W=600,H=210,P=34,mn=Math.min.apply(null,s),mx=Math.max.apply(null,s);if(mx===mn){mx+=1;mn-=1}
var X=function(i){return P+i*(W-2*P)/(s.length-1)},Y=function(v){return H-P-(v-mn)*(H-2*P)/(mx-mn)};
var d=s.map(function(v,i){return(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)}).join("");
var ar=d+"L"+X(s.length-1).toFixed(1)+" "+(H-P)+"L"+X(0)+" "+(H-P)+"Z",col=b>=c.cap?"var(--gn)":"var(--rd)",y0=Y(c.cap).toFixed(1);
$("chart").innerHTML='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block"><path d="'+ar+'" fill="'+col+'" opacity=".12"/><line x1="'+P+'" x2="'+(W-P)+'" y1="'+y0+'" y2="'+y0+'" stroke="var(--mu)" stroke-dasharray="4 4" opacity=".6"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.5" stroke-linejoin="round"/><circle cx="'+X(s.length-1).toFixed(1)+'" cy="'+Y(b).toFixed(1)+'" r="4.5" fill="'+col+'"/><text x="4" y="'+(P+4)+'" font-size="11" fill="var(--mu)">'+Math.round(mx)+'</text><text x="4" y="'+(H-P)+'" font-size="11" fill="var(--mu)">'+Math.round(mn)+'</text><text x="'+(W-P)+'" y="'+(H-8)+'" font-size="11" text-anchor="end" fill="var(--mu)">trade '+trades.length+'</text></svg><p class="sub" style="margin:4px 0 0">Linha tracejada = capital inicial.</p>'}
function group(key){var m={};trades.forEach(function(t){var k=t[key]||"(sem setup)";(m[k]=m[k]||[]).push(t)});
return Object.keys(m).map(function(k){var a=m[k],w=a.filter(function(t){return t.res==="Win"}).length;return{k:k,n:a.length,w:Math.round(w/a.length*100),pl:a.reduce(function(x,t){return x+t.pl},0)}}).sort(function(x,y){return y.pl-x.pl})}
function tbl(h,rows){return'<h2 style="margin-top:14px;font-size:.9rem" class="mut">'+h+'</h2><div class="tb"><table><tr><th>'+h.split(" ").pop()+'</th><th>Trades</th><th>Acerto</th><th>P/L</th></tr>'+rows.map(function(r){return'<tr><td>'+esc(r.k)+'</td><td>'+r.n+'</td><td>'+r.w+'%</td><td class="'+(r.pl>=0?"gn":"rd")+'">'+fmt(r.pl,0)+'</td></tr>'}).join("")+'</table></div>'}
function stats(){if(!trades.length){$("stats").innerHTML='<div class="empty">Regista trades para ver as estatísticas.</div>';return}
var W=trades.filter(function(t){return t.pl>0}),L=trades.filter(function(t){return t.pl<0}),pl=trades.reduce(function(a,t){return a+t.pl},0);
var bal=cfg.cap,pk=bal,dd=0,run=0,mxl=0;trades.forEach(function(t){bal+=t.pl;pk=Math.max(pk,bal);dd=Math.max(dd,pk-bal);run=t.res==="Loss"?run+1:0;mxl=Math.max(mxl,run)});
var avg=function(a){return a.length?a.reduce(function(x,t){return x+t.pl},0)/a.length:0};
var M=[["Lucro médio",fmt(avg(W),0),"gn"],["Perda média",fmt(avg(L),0),"rd"],["Expectativa/trade",fmt(pl/trades.length,1),pl>=0?"gn":"rd"],["Maior seq. de perdas",mxl,""],["Drawdown máx.",fmt(dd,0),"rd"]];
$("stats").innerHTML='<div class="grid">'+M.map(function(m){return'<div class="st"><span>'+m[0]+'</span><b class="'+m[2]+'">'+m[1]+'</b></div>'}).join("")+'</div>'+tbl("Por instrumento",group("inst"))+tbl("Por setup",group("setup"))+tbl("Por RR",group("rr").map(function(r){r.k="1:"+r.k;return r}))}
function hk(x){x=x.toLowerCase().trim();var m=[["p/l","pl"],["instr","inst"],["dire","dir"],["setup","setup"],["nota","nota"],["resultado","res"],["risco","risco"],["rr","rr"],["data","data"]];for(var i=0;i<m.length;i++)if(x.indexOf(m[i][0])===0)return m[i][1];return x}
var COLS=["sem","data","inst","dir","rr","risco","res","pl","setup","nota"];
$("exp").onclick=function(){$("io").value=[COLS.join("\t")].concat(trades.map(function(t){return COLS.map(function(k){return String(t[k]==null?"":t[k]).replace(/[\t\r\n]+/g," ")}).join("\t")})).join("\n");$("io").select();
try{navigator.clipboard.writeText($("io").value).then(function(){$("iomsg").textContent="Copiado. Cola no Excel: cada coluna fica na sua célula."},function(){$("iomsg").textContent="Seleciona o texto acima e copia."})}catch(e){$("iomsg").textContent="Seleciona o texto acima e copia."}};
$("imp").onclick=function(){var L=$("io").value.trim().split(/\r?\n/),add=[];if(L.length>1){var sep=L[0].indexOf("\t")>-1?"\t":L[0].indexOf(";")>-1?";":",",h=L[0].split(sep).map(hk);
L.slice(1).forEach(function(l){var v=l.split(sep),o={};h.forEach(function(k,i){o[k]=(v[i]||"").trim()});var pl=parseFloat(String(o.pl).replace(",","."));if(isNaN(pl))return;
var dt=o.data||today;if(/^\d{2}\/\d{2}\/\d{4}$/.test(dt))dt=dt.split("/").reverse().join("-");
add.push({id:Date.now()+add.length,sem:0,data:dt,inst:(o.inst||"").toUpperCase(),dir:(o.dir||"BUY").toUpperCase(),rr:parseFloat(o.rr)||cfg.rrA,risco:parseFloat(o.risco)||cfg.risco,res:o.res||(pl>0?"Win":pl<0?"Loss":"BE"),pl:pl,setup:o.setup||"",nota:o.nota||""})})}
if(!add.length){$("iomsg").textContent="Nada para importar: precisa de cabeçalho e uma coluna P/L.";return}
trades=trades.concat(add);trades.forEach(function(t,i){t.sem=weekOf(i)});save("tp_trades",trades);formDefaults();render();$("iomsg").textContent=add.length+" trades importados."};
$("file").onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$("io").value=r.result;$("iomsg").textContent="Ficheiro lido. Carrega em Importar."};r.readAsText(f)};
function drawR(){$("myr").innerHTML=cfg.regras.length?cfg.regras.map(function(r,i){return'<div class="tr"><span>'+esc(r)+'</span><button class="ghost" data-r="'+i+'">remover</button></div>'}).join(""):'<div class="empty">Ainda sem regras pessoais.</div>';
document.querySelectorAll("[data-r]").forEach(function(b){b.onclick=function(){cfg.regras.splice(+b.dataset.r,1);save("tp_cfg",cfg);drawR();renderPlan()}})}
function addR(){var v=$("nr").value.trim();if(!v)return;cfg.regras.push(v);$("nr").value="";save("tp_cfg",cfg);drawR();renderPlan()}
$("obj").value=cfg.obj||"";$("obj").oninput=function(){cfg.obj=$("obj").value;save("tp_cfg",cfg);renderPlan()};
$("addr").onclick=addR;$("nr").onkeydown=function(e){if(e.key==="Enter")addR()};drawR();
formDefaults();render();
