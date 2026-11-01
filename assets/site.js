/* ConforCam - scripts communs : menu mobile, formulaire, cookies, mesure d'audience */
(function(){
var TEL='33770470218';
var FORMSPREE='https://formspree.io/f/xdeelpbj';
var GA='G-CK7Z43CXJ9';

/* Mesure : n'envoie rien tant que les cookies ne sont pas acceptes */
function evenement(nom,params){ if(typeof window.gtag==='function'){ window.gtag('event',nom,params||{}); } }

/* Menu mobile */
var burger=document.querySelector('.burger');
var menu=document.getElementById('menu');
if(burger&&menu){
  burger.addEventListener('click',function(){
    var ouvert=menu.classList.toggle('ouvert');
    burger.setAttribute('aria-expanded',ouvert?'true':'false');
    burger.setAttribute('aria-label',ouvert?'Fermer le menu':'Ouvrir le menu');
  });
  menu.addEventListener('click',function(e){
    if(e.target.tagName==='A'){ menu.classList.remove('ouvert'); burger.setAttribute('aria-expanded','false'); }
  });
}

/* Clics telephone, WhatsApp et mail */
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a');
  if(!a)return;
  var h=a.getAttribute('href')||'';
  if(h.indexOf('tel:')===0) evenement('clic_telephone',{emplacement:a.className||'lien'});
  else if(h.indexOf('mailto:')===0) evenement('clic_email');
  else if(h.indexOf('wa.me')>-1) evenement('clic_whatsapp');
});

/* Formulaire de devis */
var f=document.getElementById('form-devis');
if(f){
  var msg=f.querySelector('.message-form');
  if(!msg){ msg=document.createElement('p'); msg.className='message-form large'; f.appendChild(msg); }
  var valeur=function(n){ var c=f.elements[n]; return c?c.value.trim():''; };
  var verifier=function(){
    var ok=true;
    ['nom','telephone','ville'].forEach(function(n){
      var c=f.elements[n]; if(!c)return;
      if(!c.value.trim()){ c.classList.add('champ-erreur'); ok=false; } else { c.classList.remove('champ-erreur'); }
    });
    if(!ok){ msg.className='message-form large visible ko'; msg.textContent='Merci de renseigner votre nom, votre téléphone et votre ville.'; }
    return ok;
  };
  var texte=function(){
    var l=['Bonjour ConforCam, je souhaite un devis.','','Nom : '+valeur('nom'),'Téléphone : '+valeur('telephone'),'Ville : '+valeur('ville'),'Type de lieu : '+valeur('bien')];
    if(valeur('projet')) l.push('Projet : '+valeur('projet'));
    return l.join('\n');
  };
  var envoiMail=document.getElementById('envoi-mail');
  if(envoiMail) envoiMail.addEventListener('click',function(){
    if(!verifier())return;
    var b=this; b.disabled=true;
    var d=new FormData();
    d.append('nom',valeur('nom')); d.append('telephone',valeur('telephone')); d.append('ville',valeur('ville'));
    d.append('type_de_bien',valeur('bien')); d.append('projet',valeur('projet')); d.append('page',location.pathname);
    fetch(FORMSPREE,{method:'POST',body:d,headers:{'Accept':'application/json'}})
    .then(function(r){
      if(!r.ok) throw new Error('erreur');
      msg.className='message-form large visible ok';
      msg.textContent='Merci, votre demande est bien envoyée. Nous vous recontactons rapidement.';
      evenement('generate_lead',{methode:'formulaire',page:location.pathname});
      f.reset();
    })
    .catch(function(){
      msg.className='message-form large visible ko';
      msg.textContent="Le message n'a pas pu partir. Réessayez ou appelez-nous au 07 70 47 02 18.";
    })
    .finally(function(){ b.disabled=false; });
  });
  var envoiWa=document.getElementById('envoi-whatsapp');
  if(envoiWa) envoiWa.addEventListener('click',function(){
    if(!verifier())return;
    window.open('https://wa.me/'+TEL+'?text='+encodeURIComponent(texte()),'_blank','noopener');
    evenement('generate_lead',{methode:'whatsapp',page:location.pathname});
    msg.className='message-form large visible ok';
    msg.textContent="Votre demande est prête : il ne reste plus qu'à l'envoyer dans WhatsApp.";
  });
  f.addEventListener('input',function(e){ e.target.classList.remove('champ-erreur'); });
  /* La barre d'appel mobile s'efface quand le formulaire est a l'ecran */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ document.body.classList.toggle('cache-flottants',e[0].isIntersecting); },{threshold:0.15}).observe(f);
  }
}

/* Cookies et Google Analytics */
function chargerGA(){
  if(window.__gaCharge)return; window.__gaCharge=true;
  var s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+GA;
  document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){ window.dataLayer.push(arguments); };
  window.gtag('js',new Date()); window.gtag('config',GA);
}
var b=document.getElementById('cookie-bandeau');
if(!b){
  b=document.createElement('div'); b.id='cookie-bandeau'; b.className='cookie-bandeau'; b.hidden=true;
  b.innerHTML='<p>Mesure d’audience anonyme. <a href="/politique-confidentialite/">En savoir plus</a></p><button type="button" id="cookie-refuser">Refuser</button><button type="button" id="cookie-accepter" class="cookie-ok">Accepter</button>';
  document.body.appendChild(b);
}
var choix=null;
try{ choix=localStorage.getItem('conforcam-cookies'); }catch(e){}
if(choix==='oui'){ chargerGA(); } else if(choix!=='non'){ b.hidden=false; }
function enregistrer(v){ try{ localStorage.setItem('conforcam-cookies',v); }catch(e){} b.hidden=true; }
document.getElementById('cookie-accepter').addEventListener('click',function(){ enregistrer('oui'); chargerGA(); });
document.getElementById('cookie-refuser').addEventListener('click',function(){ enregistrer('non'); });
})();
