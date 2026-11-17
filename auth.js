var PFX="",ME=null;
(function(){
var $=function(i){return document.getElementById(i)};
function g(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function E(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function nt(v){var d=String(v).replace(/\D/g,"");if(d.indexOf("00258")===0)d=d.slice(5);else if(d.indexOf("258")===0&&d.length>9)d=d.slice(3);return d}
function H(p,salt){var t=salt+p;if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")});return Promise.resolve(FB(t))}
function FB(t){var h=5381;for(var i=0;i<t.length;i++)h=(h*33^t.charCodeAt(i))>>>0;return "w"+h}
function HV(p,u){return u.h.charAt(0)==="w"?Promise.resolve(FB(u.salt+p)):H(p,u.salt)}
function SL(){return Math.random().toString(36).slice(2)+Date.now()}
function eye(){document.querySelectorAll("input[type=password]").forEach(function(i){if(i.parentNode.className==="pw")return;var w=document.createElement("div");w.className="pw";i.parentNode.insertBefore(w,i);w.appendChild(i);var b=document.createElement("button");b.type="button";b.className="eye";b.textContent="👁";b.title="Mostrar/ocultar";b.onclick=function(){var h=i.type==="password";i.type=h?"text":"password";b.textContent=h?"🙈":"👁"};w.appendChild(b)})}
function find(v){var k=v.indexOf("@")>-1?v.toLowerCase():nt(v);return k?U.filter(function(x){return x.email===k||x.tel===k})[0]:null}
function go(id){s("st_ses",id);try{sessionStorage.setItem("st_intro","1");sessionStorage.setItem("st_un","1")}catch(e){}location.reload()}
var U=g("st_users",[]),sid=g("st_ses",null);
ME=U.filter(function(u){return u.id===sid})[0]||null;
function m(t,ok){$("amsg").textContent=t||"";$("amsg").style.color=ok?"var(--gn)":"var(--rd)"}
if(ME){PFX="u"+ME.id+"_";$("app").classList.remove("hid");$("bg2").classList.remove("hid");bgAnim("bg2");
var fn=ME.nome.split(" ")[0];if(window.SB&&ME.cloud)cloudPull(ME.id).then(function(r){var lt=localStorage.getItem(PFX+"ts");lt=lt?Date.parse(lt):0;if(r&&Date.parse(r.updated_at)>lt){cloudApply(PFX,r);location.reload()}else if(!r)cloudPush()});$("hello").textContent="Olá, "+fn;
try{if(sessionStorage.getItem("st_intro")){sessionStorage.removeItem("st_intro");$("iwel").textContent="Bem-vindo, "+fn;$("intro").classList.remove("hid");
setTimeout(function(){$("intro").classList.add("out");setTimeout(function(){$("intro").classList.add("hid")},700)},2500)}}catch(e){}
var tr=g(PFX+"tp_trades",[]),cf=g(PFX+"tp_cfg",{}),mo=cf.moeda||"USC",n=tr.length,w=tr.filter(function(t){return t.res==="Win"}).length,pl=tr.reduce(function(a,t){return a+t.pl},0);
var ini=ME.nome.trim().split(/\s+/).map(function(x){return x[0]}).slice(0,2).join("").toUpperCase();
$("conta").innerHTML='<div class="card prof"><div class="av">'+E(ini)+'</div><div><b style="font-size:1.1rem">'+E(ME.nome)+'</b><div class="sub" style="margin:2px 0 6px">'+E(ME.email||"")+(ME.email&&ME.tel?" · ":"")+E(ME.tel||"")+'</div>'+(ME.ver?'<span class="badge">✓ '+(ME.ver==="email"?"Email":"Telemóvel")+' verificado</span> ':'')+(ME.cloud?'<span class="badge">☁ Sincronizada</span> ':'')+'<span class="sub">Membro desde '+E(ME.criado)+'</span></div></div>'+
'<div class="card"><h2>Resumo</h2><div class="grid" style="grid-template-columns:repeat(3,1fr)"><div class="st"><span>Trades</span><b>'+n+'</b></div><div class="st"><span>Acerto</span><b>'+(n?Math.round(w/n*100)+"%":"–")+'</b></div><div class="st"><span>P/L</span><b class="'+(pl>=0?"gn":"rd")+'">'+pl.toLocaleString("pt-PT",{maximumFractionDigits:0})+' '+E(mo)+'</b></div></div></div>'+
'<div class="card"><h2>Perfil</h2><label>Nome</label><input id="p_nome" value="'+E(ME.nome)+'"><button class="btn" id="p_go" style="margin-top:10px">Guardar nome</button></div>'+
'<div class="card"><h2>Segurança</h2><label>Palavra-passe atual</label><input type="password" id="s_old"><label style="margin-top:8px">Nova palavra-passe</label><input type="password" id="s_new"><label style="margin-top:8px">Repetir nova</label><input type="password" id="s_new2"><button class="btn" id="s_go" style="margin-top:10px">Alterar palavra-passe</button><p class="sub" id="smsg" style="margin:8px 0 0"></p></div>'+
'<div class="card"><h2>Cópia de segurança</h2><p class="sub">Para mudar de dispositivo: exporta aqui, cola e importa no outro.</p><textarea id="bk" style="min-height:70px"></textarea><div class="row2" style="margin-top:8px"><button class="btn sec" id="bk_e">Exportar</button><button class="btn sec" id="bk_i">Importar</button></div></div>'+
'<div class="card"><h2>Sessão</h2><div class="row2"><button class="btn sec" id="out">Sair</button><button class="btn sec" id="del" style="color:var(--rd)">Apagar conta e dados</button></div></div>';
$("p_go").onclick=function(){var v=$("p_nome").value.trim();if(!v)return;ME.nome=v;s("st_users",U);location.reload()};
$("s_go").onclick=function(){var sm=$("smsg"),a=$("s_new").value;
if(ME.cloud&&window.SB){var cm=function(t,ok){sm.style.color=ok?"var(--gn)":"var(--rd)";sm.textContent=t};if(a.length<6||a!==$("s_new2").value)return cm("Mínimo 6 caracteres e as duas novas têm de coincidir.");
SB.auth.signInWithPassword({email:ME.email,password:$("s_old").value}).then(function(r){if(r.error)return cm("Palavra-passe atual errada.");SB.auth.updateUser({password:a}).then(function(r2){cm(r2.error?r2.error.message:"Palavra-passe alterada.",!r2.error)})});return}
HV($("s_old").value,ME).then(function(h){if(h!==ME.h){sm.style.color="var(--rd)";sm.textContent="Palavra-passe atual errada.";return}
if(a.length<6||a!==$("s_new2").value){sm.style.color="var(--rd)";sm.textContent="Mínimo 6 caracteres e as duas novas têm de coincidir.";return}
var sa=SL();H(a,sa).then(function(h2){ME.salt=sa;ME.h=h2;s("st_users",U);sm.style.color="var(--gn)";sm.textContent="Palavra-passe alterada.";["s_old","s_new","s_new2"].forEach(function(i){$(i).value=""})})})};
$("bk_e").onclick=function(){var o={};["tp_cfg","tp_trades","tp_commit"].forEach(function(k){var v=localStorage.getItem(PFX+k);if(v)o[k]=v});$("bk").value=JSON.stringify(o);$("bk").select();try{navigator.clipboard.writeText($("bk").value)}catch(e){}};
$("bk_i").onclick=function(){try{var o=JSON.parse($("bk").value);Object.keys(o).forEach(function(k){if(/^tp_(cfg|trades|commit)$/.test(k))localStorage.setItem(PFX+k,o[k])});location.reload()}catch(e){alert("Backup inválido.")}};
$("out").onclick=function(){var f=function(){localStorage.removeItem("st_ses");location.reload()};if(window.SB&&ME.cloud)SB.auth.signOut().then(f,f);else f()};
$("del").onclick=function(){if(!confirm("Apagar esta conta e todos os seus trades e planos? Não dá para desfazer."))return;
Object.keys(localStorage).forEach(function(k){if(k.indexOf(PFX)===0)localStorage.removeItem(k)});
s("st_users",U.filter(function(u){return u.id!==ME.id}));var fin=function(){localStorage.removeItem("st_ses");location.reload()};if(window.SB&&ME.cloud)SB.from("dados").delete().eq("user_id",ME.id).then(function(){return SB.auth.signOut()}).then(fin,fin);else fin()};
}else{$("auth").classList.remove("hid");bgAnim();
var P=["f_login","f_reg","f_rec","f_code","f_new"],CB=null,CV=null,CODE="",RU=null;
function show(id){P.forEach(function(p){$(p).classList.toggle("hid",p!==id)});$("tabs").classList.toggle("hid",id!=="f_login"&&id!=="f_reg");$("t_l").classList.toggle("on",id==="f_login");$("t_r").classList.toggle("on",id==="f_reg");m("")}
function tr(e){var t=(e.message||"").toLowerCase();return t.indexOf("invalid login")>-1?"Email ou palavra-passe errados.":t.indexOf("not confirmed")>-1?"Confirma primeiro o teu email.":(t.indexOf("rate")>-1||t.indexOf("seconds")>-1)?"Aguarda um minuto e tenta outra vez.":e.message}
function cask(d,fn){CV=fn;$("c_dest").textContent=d;$("c_in").value="";$("c_demo").parentNode.style.display="none";show("f_code")}
function cin(us,first){var md=us.user_metadata||{},id=us.id,pf="u"+id+"_";
cloudPull(id).then(function(row){if(row)cloudApply(pf,row);else if(first&&!U.length)["tp_cfg","tp_trades","tp_commit"].forEach(function(k){var v=localStorage.getItem(k);if(v)localStorage.setItem(pf+k,v)});
if(!U.some(function(x){return x.id===id}))U.push({id:id,nome:md.nome||us.email,email:us.email,tel:md.tel||"",ver:us.email_confirmed_at?"email":"",cloud:true,criado:(us.created_at||"").slice(0,10)});s("st_users",U);go(id)})}
if(window.SB){$("l_lbl").textContent="Email";$("rc_lbl").textContent="Email";$("r_help").textContent="O telemóvel é opcional."}else{$("rc_go").textContent="Continuar";$("r_help").textContent="Basta preencher email ou telemóvel."}
function ask(dest,cb){CV=null;$("c_demo").parentNode.style.display="";CODE=String(Math.floor(100000+Math.random()*900000));CB=cb;$("c_dest").textContent=dest;$("c_demo").textContent=CODE;$("c_in").value="";show("f_code")}
$("t_l").onclick=function(){show("f_login")};$("t_r").onclick=function(){show("f_reg")};
$("lnk_rec").onclick=function(){show("f_rec")};$("rc_back").onclick=$("c_back").onclick=function(){show("f_login")};
if(!U.length)show("f_reg");
$("l_go").onclick=function(){var v=$("l_id").value.trim(),u=find(v);
if(window.SB&&!(u&&!u.cloud)){if(v.indexOf("@")<0)return m("Entra com o teu email.");return SB.auth.signInWithPassword({email:v.toLowerCase(),password:$("l_pw").value}).then(function(r){if(r.error)return m(tr(r.error));cin(r.data.user)})}
if(!u)return m("Conta não encontrada.");
HV($("l_pw").value,u).then(function(h){if(h!==u.h)return m("Palavra-passe errada.");go(u.id)})};
$("r_go").onclick=function(){var n=$("r_nome").value.trim(),em=$("r_email").value.trim().toLowerCase(),tel=nt($("r_tel").value),pw=$("r_pw").value;
if(!n)return m("Indica o teu nome.");
if(!em&&!tel)return m("Indica email ou telemóvel.");
if(em&&!/^\S+@\S+\.\S+$/.test(em))return m("Email inválido.");
if(tel&&tel.length<9)return m("Número inválido (mínimo 9 dígitos).");
if(pw.length<6)return m("Palavra-passe: mínimo 6 caracteres.");
if(pw!==$("r_pw2").value)return m("As palavras-passe não coincidem.");
if(U.some(function(u){return(em&&u.email===em)||(tel&&u.tel===tel)}))return m("Já existe uma conta com esse email ou telemóvel.");
if(window.SB){if(!em)return m("Indica o teu email.");return SB.auth.signUp({email:em,password:pw,options:{data:{nome:n,tel:tel}}}).then(function(r){if(r.error)return m(tr(r.error));if(r.data&&r.data.session)return cin(r.data.user,1);cask(em,function(c){return SB.auth.verifyOtp({email:em,token:c,type:"signup"}).then(function(x){if(x.error)return m("Código incorreto ou expirado.");cin(x.data.user,1)})})})}
(function(cb){cb()})(function(){var salt=SL();H(pw,salt).then(function(h){var u={id:String(Date.now()),nome:n,email:em,tel:tel,salt:salt,h:h,ver:"",criado:new Date().toISOString().slice(0,10)};
if(!U.length)["tp_cfg","tp_trades","tp_commit"].forEach(function(k){var v=localStorage.getItem(k);if(v)localStorage.setItem("u"+u.id+"_"+k,v)});
U.push(u);s("st_users",U);go(u.id)})})};
$("rc_go").onclick=function(){var v=$("rc_id").value.trim(),u=find(v);
if(window.SB&&!(u&&!u.cloud)){if(v.indexOf("@")<0)return m("Indica o email da tua conta.");var em=v.toLowerCase();return SB.auth.resetPasswordForEmail(em).then(function(r){if(r.error)return m(tr(r.error));cask(em,function(c){return SB.auth.verifyOtp({email:em,token:c,type:"recovery"}).then(function(x){if(x.error)return m("Código incorreto ou expirado.");RU=null;show("f_new")})})})}
if(!u)return m("Não encontrámos essa conta.");RU=u;show("f_new")};
$("c_go").onclick=function(){if(CV)return CV($("c_in").value.trim());if($("c_in").value.trim()!==CODE||!CB)return m("Código incorreto.");var f=CB;CB=null;CODE="";f()};
$("n_go").onclick=function(){var p=$("n_pw").value;if(p.length<6)return m("Mínimo 6 caracteres.");if(p!==$("n_pw2").value)return m("As palavras-passe não coincidem.");
if(window.SB&&!RU){var f=function(){show("f_login");m("Palavra-passe alterada. Já podes entrar.",1)};return SB.auth.updateUser({password:p}).then(function(r){if(r.error)return m(tr(r.error));SB.auth.signOut().then(f,f)})}
var sa=SL();H(p,sa).then(function(h){RU.salt=sa;RU.h=h;s("st_users",U);show("f_login");m("Palavra-passe alterada. Já podes entrar.",1)})};
}
eye();
})();
