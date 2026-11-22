/* ConforCam - éléments communs des pages intérieures :
   menu sur téléphone, formulaire de devis, cookies, mesure d'audience et suivi des appels. */
(function(){
var GA='G-CK7Z43CXJ9', FORMSPREE='https://formspree.io/f/xdeelpbj', WA='33770470218';
var accueil = location.pathname === '/' || location.pathname === '/index.html';

function evt(nom, p){ if(typeof window.gtag === 'function'){ window.gtag('event', nom, p || {}); } }

/* Suivi des clics : téléphone, WhatsApp, e-mail (toutes les pages, y compris l'accueil) */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a'); if(!a) return;
  var h = a.getAttribute('href') || '';
  if(h.indexOf('tel:') === 0) evt('clic_telephone', {page: location.pathname});
  else if(h.indexOf('mailto:') === 0) evt('clic_email', {page: location.pathname});
  else if(h.indexOf('wa.me') > -1) evt('clic_whatsapp', {page: location.pathname});
}, true);

if(accueil) return; /* l'accueil garde son formulaire et son bandeau cookies */

/* Menu sur téléphone */
var header = document.querySelector('header'), nav = header && header.querySelector('nav');
if(header && nav){
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'cc-burger'; b.setAttribute('aria-label', 'Ouvrir le menu'); b.setAttribute('aria-expanded', 'false');
  b.innerHTML = '<span></span>';
  header.appendChild(b);
  b.addEventListener('click', function(){
    var o = nav.classList.toggle('cc-ouvert');
    b.setAttribute('aria-expanded', o ? 'true' : 'false');
    b.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
  });
}

/* Formulaire de devis en bas de chaque page */
var main = document.querySelector('main');
if(main && !document.getElementById('devis')){
  var s = document.createElement('section');
  s.className = 'cc-devis'; s.id = 'devis';
  s.innerHTML =
  '<div class="cc-devis-in"><div><span class="cc-tag">Devis gratuit</span><h2>Demander un devis gratuit</h2>' +
  '<p>Décrivez votre lieu et ce que vous souhaitez protéger. Nous venons étudier les lieux gratuitement et vous envoyons un devis au tarif fixé avant l’intervention.</p>' +
  '<p class="cc-direct"><a href="tel:+33770470218">07 70 47 02 18</a><a href="mailto:contact@conforcam.fr">contact@conforcam.fr</a></p></div>' +
  '<form class="cc-form" novalidate>' +
  '<label>Nom et prénom *<input name="nom" autocomplete="name" required></label>' +
  '<label>Téléphone *<input name="telephone" type="tel" autocomplete="tel" required></label>' +
  '<label>Ville *<input name="ville" autocomplete="address-level2" required></label>' +
  '<label>Type de lieu<select name="bien"><option value="">Choisir</option><option>Commerce</option><option>Restaurant ou bar</option><option>Hôtel</option><option>Bureau</option><option>Entrepôt</option><option>Copropriété</option><option>Chantier</option><option>Maison</option><option>Appartement</option><option>Autre</option></select></label>' +
  '<label class="cc-large">Votre projet<textarea name="projet" rows="4" placeholder="Nombre de caméras envisagé, intérieur ou extérieur, contraintes particulières…"></textarea></label>' +
  '<button type="submit" class="cc-btn">Envoyer ma demande</button>' +
  '<button type="button" class="cc-btn cc-wa">Envoyer par WhatsApp</button>' +
  '<p class="cc-msg cc-large" role="status"></p>' +
  '<p class="cc-note cc-large">Réponse sous 24 h ouvrées. Vos coordonnées servent uniquement à répondre à votre demande.</p>' +
  '</form></div>';
  main.parentNode.insertBefore(s, main.nextSibling);

  /* les boutons « Devis gratuit » restent sur la page */
  [].forEach.call(document.querySelectorAll('a[href$="#rappel"]'), function(a){ a.setAttribute('href', '#devis'); });

  var f = s.querySelector('form'), msg = s.querySelector('.cc-msg');
  var v = function(n){ return (f.elements[n].value || '').trim(); };
  var ok = function(){
    var bon = true;
    ['nom','telephone','ville'].forEach(function(n){ var c = f.elements[n]; var vide = !c.value.trim(); c.classList.toggle('cc-err', vide); if(vide) bon = false; });
    if(!bon){ msg.className = 'cc-msg cc-large cc-ko'; msg.textContent = 'Merci de renseigner votre nom, votre téléphone et votre ville.'; }
    return bon;
  };
  f.addEventListener('submit', function(e){
    e.preventDefault(); if(!ok()) return;
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    var d = new FormData();
    d.append('nom', v('nom')); d.append('telephone', v('telephone')); d.append('ville', v('ville'));
    d.append('type_de_bien', v('bien')); d.append('projet', v('projet')); d.append('page', location.pathname);
    fetch(FORMSPREE, {method:'POST', body:d, headers:{'Accept':'application/json'}})
    .then(function(r){ if(!r.ok) throw 0;
      msg.className = 'cc-msg cc-large cc-ok'; msg.textContent = 'Merci, votre demande est bien envoyée. Nous vous recontactons rapidement.';
      evt('generate_lead', {methode:'formulaire', page: location.pathname}); f.reset(); })
    .catch(function(){ msg.className = 'cc-msg cc-large cc-ko'; msg.textContent = 'L’envoi n’a pas abouti. Réessayez ou appelez le 07 70 47 02 18.'; })
    .then(function(){ btn.disabled = false; });
  });
  s.querySelector('.cc-wa').addEventListener('click', function(){
    if(!ok()) return;
    var t = ['Bonjour ConforCam, je souhaite un devis.','','Nom : '+v('nom'),'Téléphone : '+v('telephone'),'Ville : '+v('ville'),'Type de lieu : '+v('bien')];
    if(v('projet')) t.push('Projet : '+v('projet'));
    window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(t.join('\n')), '_blank', 'noopener');
    evt('generate_lead', {methode:'whatsapp', page: location.pathname});
  });
  f.addEventListener('input', function(e){ e.target.classList.remove('cc-err'); });
}

/* Cookies et Google Analytics (même choix que sur l'accueil) */
function chargerGA(){
  if(window.__ga) return; window.__ga = true;
  var sc = document.createElement('script'); sc.async = true; sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(sc);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date()); window.gtag('config', GA);
}
var choix = null; try{ choix = localStorage.getItem('conforcam-cookies'); }catch(e){}
if(choix === 'oui'){ chargerGA(); }
else if(choix !== 'non'){
  var c = document.createElement('div'); c.className = 'cc-cookies';
  c.innerHTML = '<p>Ce site mesure son audience de façon anonyme. <a href="/mentions-legales.html">En savoir plus</a></p><button type="button" data-v="non">Refuser</button><button type="button" data-v="oui" class="cc-oui">Accepter</button>';
  document.body.appendChild(c);
  c.addEventListener('click', function(e){
    var val = e.target.getAttribute && e.target.getAttribute('data-v'); if(!val) return;
    try{ localStorage.setItem('conforcam-cookies', val); }catch(x){}
    c.remove(); if(val === 'oui') chargerGA();
  });
}
})();
