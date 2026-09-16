(()=>{
const APARTMENTS = [1,5,6,11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36];
const BLOCKS = [{start:7,end:12,name:'Morning'},{start:12,end:17,name:'Afternoon'},{start:17,end:22,name:'Evening'}];
function clock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23',minute:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
  return {date:`${parts.year}-${parts.month}-${parts.day}`,hour:Number(parts.hour)+Number(parts.minute)/60};
}
function addDays(date,n) { const d = new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10); }
function dayIndex(date) {return (new Date(`${date}T12:00:00Z`).getUTCDay()+6)%7;}
function monday(date) {return addDays(date,-dayIndex(date));}
function slot(date,block,changes={},now=clock()) {
 const key=`${date}_${block}`, change=changes[key];
 const period=date<now.date || (date===now.date && now.hour>=BLOCKS[block].end) ? 'past' : date===now.date && now.hour>=BLOCKS[block].start ? 'current':'future';
 return {key,date,block,known:Boolean(change),apartment:change?change.apartment:null,period,version:change?.version||0};
}

const NB='\u202f';
const I18N={
fr:{noDbTitle:'Code requis',noDbCopy:'Saisissez le code de l’immeuble pour voir le planning.',evNoDb:'CODE REQUIS',connNoDb:'Code de l’immeuble requis',dcNoDb:'Saisissez le code de l’immeuble pour voir et modifier les réservations.',pcLabel:'Code de l’immeuble',pcHelp:'Nécessaire pour voir et modifier le planning. Enregistré sur cet appareil.',codeTitle:`Code de l’immeuble`,codeCopy:'Saisissez le code pour ouvrir le planning. Il est enregistré sur cet appareil.',btnUnlock:'Ouvrir le planning',codeEyebrow:'ACCÈS RÉSERVÉ',pcKeep:'Laisser vide pour garder le code enregistré',erPass:'Code de l’immeuble incorrect.',btnCode:'Saisir le code',erConfig:'Application pas encore configurée.',locale:'fr-CH',title:'Buanderie',tagline:'Planning partagé',brand:'Buanderie',weekEyebrow:'VOTRE SEMAINE EN UN COUP D’ŒIL',prev:'Semaine précédente',next:'Semaine suivante',today:'Aujourd’hui',morning:'Matin',afternoon:'Après-midi',evening:'Soir',legPast:'Passé / en cours',legFuture:'À venir',legFree:'Libre maintenant',legMine:'Votre créneau',stMineNow:'À vous maintenant',hint:'Votre créneau habituel est réservé automatiquement. Touchez un créneau pour le modifier. Heures locales suisses.',
idEyebrow:'BONJOUR',idTitle:`Quel est<br>votre appartement${NB}?`,idCopy:'Nous l’enregistrons sur cet appareil pour que vous puissiez gérer vos créneaux de lessive.',idLabel:'Numéro d’appartement',idPlaceholder:'Choisissez votre appartement',idSave:'Enregistrer',idNote:'Ce planning est partagé et fondé sur la confiance. Veuillez choisir uniquement votre propre appartement.',close:'Fermer',language:'Langue',
aptChange:n=>`App. ${n} · Changer`,chooseApt:'Choisir l’appartement',aptOption:n=>`Appartement ${n}`,aptShort:n=>`App. ${n}`,
connConnecting:'Connexion…',connPreview:'Aperçu · enregistré sur cet appareil uniquement',connOk:'Planning partagé · connecté',connOff:'Hors ligne · disponibilité non confirmée',
stEnded:'Terminé',stLoading:'Chargement',stUnconfirmed:'Non confirmé',stFreeNow:'Libre maintenant',stAvailable:'Disponible',stReservedNow:'En cours',stMine:'Votre créneau',stReserved:'Réservé',free:'Libre',
evConnecting:'CONNEXION',evDevice:'SUR CET APPAREIL',evLost:'CONNEXION PERDUE',evNow:'EN CE MOMENT',
ltLoading:'Chargement…',ltUnavailable:'Statut indisponible',ltClosed:'Buanderie fermée',ltFree:'Libre pour une lessive',ltReserved:'Actuellement réservé',
lcFetching:'Récupération des réservations partagées.',lcReconnect:'Reconnectez-vous avant de vous fier à ce planning.',lcOpens:'La prochaine journée de lessive commence à 7 h.',lcFreeUntil:h=>`Disponible jusqu’à ${h} h`,lcHeldUntil:(a,h)=>`Appartement ${a} · jusqu’à ${h} h`,
btnUse:'Utiliser ce créneau',btnFinished:'J’ai terminé · libérer la machine',
dtEnded:'Ce créneau est terminé',dtFree:'Un créneau de lessive libre',dtApt:a=>`Créneau de l’appartement ${a}`,
dcPast:'Les créneaux passés restent en gris et ne peuvent pas être modifiés.',dcNoConn:'Impossible de confirmer la disponibilité pour le moment. Reconnectez-vous pour faire des modifications.',dcFree:'Réservez le temps restant pour votre appartement. La réservation se termine automatiquement à la fin du créneau.',dcMine:`Ce créneau vous est réservé. Terminé plus tôt, ou pas besoin${NB}? Libérez-le pour vos voisins. Votre créneau hebdomadaire habituel reste le vôtre.`,dcOther:'Ce créneau appartient à un autre appartement. Il devient disponible si celui-ci le libère.',
acChoose:'Choisir votre appartement',acBook:a=>`Réserver pour l’appartement ${a}`,acFinish:'Terminé · libérer le temps restant',acRelease:'Libérer ce créneau',
erPick:'Veuillez d’abord choisir votre appartement.',erChanged:'Ce créneau a changé. Veuillez vérifier à nouveau.',erEnded:'Ce créneau est terminé.',erTaken:'Ce créneau est déjà réservé.',erNotYours:'Seul l’appartement titulaire peut libérer ce créneau.',erBusy:'Un voisin modifie ce créneau. Réessayez dans un instant.',erFull:'Stockage plein. Veuillez prévenir la personne responsable de l’immeuble.',erSave:'Enregistrement impossible. Veuillez réessayer.',erRemember:'Votre navigateur ne peut pas mémoriser ce choix.',
toReleased:'Créneau libéré. Merci !'.replace(' !',NB+'!'),toBooked:'Votre créneau de lessive est réservé.',
range:(s,e)=>`${s} h – ${e} h`,aria:(d,s,e,st,x)=>`${d}, de ${s} h à ${e} h, ${st}, ${x}`,stateFree:'libre',stateApt:a=>`appartement ${a}`},
de:{noDbTitle:'Code erforderlich',noDbCopy:'Geben Sie den Hauscode ein, um den Plan zu sehen.',evNoDb:'CODE ERFORDERLICH',connNoDb:'Hauscode erforderlich',dcNoDb:'Geben Sie den Hauscode ein, um Reservationen zu sehen und zu ändern.',pcLabel:'Hauscode',pcHelp:'Nötig, um den Plan zu sehen und zu ändern. Wird auf diesem Gerät gespeichert.',codeTitle:'Hauscode',codeCopy:'Geben Sie den Code ein, um den Plan zu öffnen. Er wird auf diesem Gerät gespeichert.',btnUnlock:'Plan öffnen',codeEyebrow:'ZUGANG FÜR BEWOHNER',pcKeep:'Leer lassen, um den gespeicherten Code zu behalten',erPass:'Falscher Hauscode.',btnCode:'Code eingeben',erConfig:'App ist noch nicht eingerichtet.',locale:'de-CH',title:'Waschküche',tagline:'Gemeinsamer Plan',brand:'Waschküche',weekEyebrow:'IHRE WOCHE IM ÜBERBLICK',prev:'Vorherige Woche',next:'Nächste Woche',today:'Heute',morning:'Morgen',afternoon:'Nachmittag',evening:'Abend',legPast:'Vorbei / belegt',legFuture:'Demnächst',legFree:'Jetzt frei',legMine:'Ihr Termin',stMineNow:'Jetzt Ihr Termin',hint:'Ihr regulärer Termin ist automatisch reserviert. Tippen Sie auf einen Termin, um ihn zu ändern. Zeiten in Schweizer Ortszeit.',
idEyebrow:'GRÜEZI',idTitle:'Welche Wohnung<br>ist Ihre?',idCopy:'Wir speichern die Auswahl auf diesem Gerät, damit Sie Ihre Waschtermine verwalten können.',idLabel:'Wohnungsnummer',idPlaceholder:'Wohnung wählen',idSave:'Wohnung speichern',idNote:'Dieser Plan ist gemeinsam und beruht auf Vertrauen. Bitte wählen Sie nur Ihre eigene Wohnung.',close:'Schliessen',language:'Sprache',
aptChange:n=>`Whg. ${n} · Ändern`,chooseApt:'Wohnung wählen',aptOption:n=>`Wohnung ${n}`,aptShort:n=>`Whg. ${n}`,
connConnecting:'Verbinden…',connPreview:'Vorschau · nur auf diesem Gerät gespeichert',connOk:'Gemeinsamer Plan · verbunden',connOff:'Offline · Verfügbarkeit unbestätigt',
stEnded:'Vorbei',stLoading:'Lädt',stUnconfirmed:'Unbestätigt',stFreeNow:'Jetzt frei',stAvailable:'Verfügbar',stReservedNow:'Jetzt belegt',stMine:'Ihr Termin',stReserved:'Reserviert',free:'Frei',
evConnecting:'VERBINDEN',evDevice:'AUF DIESEM GERÄT',evLost:'VERBINDUNG UNTERBROCHEN',evNow:'JETZT',
ltLoading:'Plan wird geladen…',ltUnavailable:'Status nicht verfügbar',ltClosed:'Waschküche geschlossen',ltFree:'Frei zum Waschen',ltReserved:'Derzeit reserviert',
lcFetching:'Gemeinsame Reservationen werden geladen.',lcReconnect:'Verbinden Sie sich erneut, bevor Sie sich auf diesen Plan verlassen.',lcOpens:'Der nächste Waschtag beginnt um 7 Uhr.',lcFreeUntil:h=>`Verfügbar bis ${h} Uhr`,lcHeldUntil:(a,h)=>`Wohnung ${a} · bis ${h} Uhr`,
btnUse:'Diesen Termin nutzen',btnFinished:'Ich bin fertig · Maschine freigeben',
dtEnded:'Dieser Termin ist vorbei',dtFree:'Ein freies Waschfenster',dtApt:a=>`Termin von Wohnung ${a}`,
dcPast:'Vergangene Termine bleiben grau und können nicht geändert werden.',dcNoConn:'Die Verfügbarkeit kann gerade nicht bestätigt werden. Verbinden Sie sich erneut, um Änderungen vorzunehmen.',dcFree:'Reservieren Sie die verbleibende Zeit für Ihre Wohnung. Die Reservation endet automatisch am Ende des Zeitfensters.',dcMine:'Dieser Termin ist für Sie reserviert. Früher fertig oder nicht nötig? Geben Sie ihn für Ihre Nachbarn frei. Ihr regulärer Wochentermin bleibt bestehen.',dcOther:'Dieser Termin gehört einer anderen Wohnung. Er wird verfügbar, wenn sie ihn freigibt.',
acChoose:'Wohnung wählen',acBook:a=>`Für Wohnung ${a} reservieren`,acFinish:'Fertig · Restzeit freigeben',acRelease:'Termin freigeben',
erPick:'Bitte wählen Sie zuerst Ihre Wohnung.',erChanged:'Dieser Termin hat sich geändert. Bitte prüfen Sie ihn erneut.',erEnded:'Dieser Termin ist vorbei.',erTaken:'Dieser Termin ist bereits reserviert.',erNotYours:'Nur die Wohnung mit diesem Termin kann ihn freigeben.',erBusy:'Jemand ändert diesen Termin gerade. Bitte versuchen Sie es gleich nochmals.',erFull:'Speicher voll. Bitte informieren Sie die zuständige Person im Haus.',erSave:'Speichern nicht möglich. Bitte versuchen Sie es erneut.',erRemember:'Ihr Browser kann diese Auswahl nicht speichern.',
toReleased:'Termin freigegeben. Danke!',toBooked:'Ihr Waschtermin ist reserviert.',
range:(s,e)=>`${s}–${e} Uhr`,aria:(d,s,e,st,x)=>`${d}, ${s} bis ${e} Uhr, ${st}, ${x}`,stateFree:'frei',stateApt:a=>`Wohnung ${a}`},
en:{noDbTitle:'Code required',noDbCopy:'Enter the building code to see the schedule.',evNoDb:'CODE REQUIRED',connNoDb:'Building code required',dcNoDb:'Enter the building code to see and change bookings.',pcLabel:'Building code',pcHelp:'Needed to see and change the schedule. Saved on this device.',codeTitle:'Building code',codeCopy:'Enter the code to open the schedule. It is saved on this device.',btnUnlock:'Open the schedule',codeEyebrow:'RESIDENTS ONLY',pcKeep:'Leave empty to keep the saved code',erPass:'Wrong building code.',btnCode:'Enter code',erConfig:'App is not configured yet.',locale:'en-GB',title:'Laundry',tagline:'Shared schedule',brand:'Laundry',weekEyebrow:'YOUR WEEK AT A GLANCE',prev:'Previous week',next:'Next week',today:'Today',morning:'Morning',afternoon:'Afternoon',evening:'Evening',legPast:'Past / in use',legFuture:'Upcoming',legFree:'Free now',legMine:'Your slot',stMineNow:'Yours now',hint:'Your regular slot is reserved automatically. Tap a slot to make a change. Times are Swiss local time.',
idEyebrow:'HELLO, NEIGHBOUR',idTitle:'Which apartment<br>is yours?',idCopy:'We’ll remember it on this device, so you can manage your laundry slots.',idLabel:'Apartment number',idPlaceholder:'Choose your apartment',idSave:'Save apartment',idNote:'This is a shared, trust-based schedule. Please choose only your own apartment.',close:'Close',language:'Language',
aptChange:n=>`Apt ${n} · Change`,chooseApt:'Choose apartment',aptOption:n=>`Apartment ${n}`,aptShort:n=>`Apt ${n}`,
connConnecting:'Connecting…',connPreview:'Preview · saved on this device only',connOk:'Shared schedule · connected',connOff:'Offline · availability unconfirmed',
stEnded:'Ended',stLoading:'Loading',stUnconfirmed:'Unconfirmed',stFreeNow:'Free now',stAvailable:'Available',stReservedNow:'Reserved now',stMine:'Your slot',stReserved:'Reserved',free:'Free',
evConnecting:'CONNECTING',evDevice:'ON THIS DEVICE',evLost:'CONNECTION LOST',evNow:'RIGHT NOW',
ltLoading:'Loading schedule…',ltUnavailable:'Status unavailable',ltClosed:'Laundry is closed',ltFree:'Free for a wash',ltReserved:'Currently reserved',
lcFetching:'Fetching the shared bookings.',lcReconnect:'Reconnect before relying on this schedule.',lcOpens:'The next laundry day starts at 07:00.',lcFreeUntil:h=>`Available until ${h}:00`,lcHeldUntil:(a,h)=>`Apartment ${a} · until ${h}:00`,
btnUse:'Use this slot',btnFinished:'I’m finished · free the machine',
dtEnded:'This slot has ended',dtFree:'A little laundry window',dtApt:a=>`Apartment ${a}’s slot`,
dcPast:'Past slots stay grey and can’t be changed.',dcNoConn:'We can’t confirm availability right now. Reconnect to make changes.',dcFree:'Book the remaining time for your apartment. The reservation ends automatically at the end of this block.',dcMine:'This time is reserved for you. Finished early, or won’t need it? Release this occurrence for your neighbours. Your regular weekly slot stays yours.',dcOther:'This time belongs to another apartment. It becomes available if they release it.',
acChoose:'Choose your apartment',acBook:a=>`Book for apartment ${a}`,acFinish:'Finished · release remaining time',acRelease:'Release this slot',
erPick:'Please choose your apartment first.',erChanged:'This slot has changed. Please check it again.',erEnded:'This slot has ended.',erTaken:'This slot is already reserved.',erNotYours:'Only the apartment holding this slot can release it.',erBusy:'A neighbour is changing this slot right now. Try again in a moment.',erFull:'Storage is full. Please tell the building organiser.',erSave:'Could not save. Please try again.',erRemember:'Your browser cannot remember this selection.',
toReleased:'Slot released. Thanks, neighbour!',toBooked:'Your laundry slot is booked.',
range:(s,e)=>`${String(s).padStart(2,'0')}:00–${e}:00`,aria:(d,s,e,st,x)=>`${d}, ${s}:00 to ${e}:00, ${st}, ${x}`,stateFree:'free',stateApt:a=>`apartment ${a}`}
};

const $=id=>document.getElementById(id);
const CFG=window.LAUNDRY_CONFIG||{};
const API=String(CFG.supabaseUrl||'').replace(/\/+$/,'');
const KEY=String(CFG.supabaseKey||'');
const configured=/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)[:/]).+/.test(API)&&KEY&&!/YOUR-/.test(API+KEY);
let lang='fr';
try{const l=localStorage.getItem('laundry-lang');if(I18N[l])lang=l;}catch{}
const T=()=>I18N[lang];
let passcode='';try{passcode=localStorage.getItem('laundry-code')||'';}catch{}
let needCode=!passcode,connecting=configured&&!!passcode,healthy=false;
let promptedApartment=false;
let selected=null,changes={},loaded=new Set(),week=monday(clock().date),active=null,busy=false,loadSeq=0;
try{selected=Number(localStorage.getItem('laundry-apartment'))||null;if(!APARTMENTS.includes(selected))selected=null;}catch{}
const fmt=(date,options)=>new Intl.DateTimeFormat(T().locale,{...options,timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fail=key=>Object.assign(Error(key),{key});
const ERR={bad_passcode:'erPass',slot_changed:'erChanged',slot_ended:'erEnded',slot_taken:'erTaken',not_yours:'erNotYours',bad_apartment:'erPick'};
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200);}
async function rpc(fn,body){
 const headers={'Content-Type':'application/json',apikey:KEY};
 if(/^eyJ/.test(KEY))headers.Authorization='Bearer '+KEY;
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);
 try{
  const r=await fetch(`${API}/rest/v1/rpc/${fn}`,{method:'POST',headers,body:JSON.stringify(body),signal:ctrl.signal,cache:'no-store'});
  const data=await r.json().catch(()=>null);
  if(!r.ok){const e=Error('api');e.api=String(data&&data.message||'');throw e;}
  return Array.isArray(data)?data:[];
 }finally{clearTimeout(timer);}
}
function forgetCode(){passcode='';needCode=true;healthy=false;try{localStorage.removeItem('laundry-code');}catch{}}
function applyLang(){
 const t=T();document.documentElement.lang=lang;document.title=t.title;
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t[el.dataset.i18n]);
 document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t[el.dataset.i18nHtml]);
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t[el.dataset.i18nAria]));
 $('lang').setAttribute('aria-label',t.language);
 document.querySelectorAll('#lang button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
 const sel=$('apartment-select'),v=sel.value;sel.replaceChildren();
 const ph=document.createElement('option');ph.value='';ph.textContent=t.idPlaceholder;sel.append(ph);
 for(const apt of APARTMENTS){const o=document.createElement('option');o.value=apt;o.textContent=t.aptOption(apt);sel.append(o);}
 sel.value=v;
 syncIdentity();
}
function syncIdentity(){
 const t=T(),unlocked=healthy;
 $('identity-eyebrow').textContent=unlocked?t.idEyebrow:t.codeEyebrow;
 $('identity-title').innerHTML=unlocked?t.idTitle:esc(t.codeTitle);
 $('identity-copy').textContent=unlocked?t.idCopy:t.codeCopy;
 $('apartment-field').hidden=!unlocked;
 $('code-field').hidden=unlocked;
 $('apartment-select').required=unlocked;
 $('code-input').required=!unlocked;
 $('save-identity').textContent=unlocked?t.idSave:t.btnUnlock;
 $('identity-note').hidden=!unlocked;
}
function setLang(l){if(!I18N[l]||l===lang)return;lang=l;try{localStorage.setItem('laundry-lang',l);}catch{}applyLang();refresh();}
function connection(){const t=T();$('connection').textContent=!configured?t.erConfig:connecting?t.connConnecting:needCode?t.connNoDb:healthy?t.connOk:t.connOff;}
function sanitize(id,apt,ver){
 if(typeof id!=='string'||!/^\d{4}-\d{2}-\d{2}_[012]$/.test(id))return null;
 if(!(apt===null||APARTMENTS.includes(apt)))return null;
 if(!Number.isInteger(ver)||ver<0)return null;
 return {apartment:apt,version:ver};
}
async function load(){
 if(!configured){connecting=false;healthy=false;refresh();return;}
 if(!passcode){needCode=true;connecting=false;healthy=false;refresh();return;}
 const seq=++loadSeq,weeks=[...new Set([week,monday(clock().date)])];
 try{
  const results=await Promise.all(weeks.map(w=>rpc('get_slots',{p_passcode:passcode,p_from:w,p_to:addDays(w,6)})));
  if(seq!==loadSeq)return;
  const next={...changes};
  weeks.forEach((w,i)=>{
   const end=addDays(w,7);
   for(const k of Object.keys(next))if(k>=w&&k<end)delete next[k];
   for(const r of results[i]){const v=sanitize(r.slot_key,r.slot_apartment,r.slot_version);if(v)next[r.slot_key]=v;}
   loaded.add(w);
  });
  changes=next;healthy=true;needCode=false;
  if(!selected&&!promptedApartment){promptedApartment=true;connecting=false;refresh();openIdentity();return;}
 }catch(e){
  if(seq!==loadSeq)return;
  healthy=false;
  if(e.api==='bad_passcode'){forgetCode();toast(T().erPass);if(!$('identity').open)openIdentity();}
 }
 connecting=false;refresh();
}
function render(){
 const t=T(),now=clock(),curMon=monday(now.date),weekReady=healthy&&loaded.has(week),liveReady=healthy&&loaded.has(curMon);
 const locked=!configured||needCode||!healthy;
 $('schedule').hidden=locked;$('hint').hidden=locked;$('apartment').hidden=locked;
 $('apartment').textContent=selected?t.aptChange(selected):t.chooseApt;
 $('week-title').textContent=`${fmt(week,{day:'numeric',month:'short'})} – ${fmt(addDays(week,6),{day:'numeric',month:'short'})}`;
 $('grid').replaceChildren();
 for(let d=0;d<7;d++){
  const date=addDays(week,d),row=document.createElement('div');row.className='day-row';
  const label=document.createElement('div');label.className=`day-label ${date===now.date?'today':''}`;label.innerHTML=`${esc(fmt(date,{weekday:'short'}))}<small>${esc(date===now.date?t.today:fmt(date,{day:'numeric',month:'short'}))}</small>`;row.append(label);
  for(let b=0;b<3;b++){
   const s=slot(date,b,changes,now),el=document.createElement('button'),shown=weekReady&&s.known,free=shown&&s.apartment===null;
   el.className=`slot ${s.period} ${free&&s.period==='current'?'available':''} ${free&&s.period==='future'?'free-future':''} ${shown&&selected&&s.apartment===selected?'mine':''}`;
   const status=!shown?(connecting||(healthy&&!loaded.has(week))?t.stLoading:t.stUnconfirmed):s.period==='past'?t.stEnded:free?(s.period==='current'?t.stFreeNow:t.stAvailable):s.apartment===selected?(s.period==='current'?t.stMineNow:t.stMine):s.period==='current'?t.stReservedNow:t.stReserved;
   el.innerHTML=`<strong>${esc(!shown?'·':free?t.free:t.aptShort(s.apartment))}</strong><span>${esc(status)}</span>`;
   el.setAttribute('aria-label',t.aria(fmt(date,{weekday:'long',day:'numeric',month:'long'}),BLOCKS[b].start,BLOCKS[b].end,!shown?status:free?t.stateFree:t.stateApt(s.apartment),status));
   el.onclick=()=>openSlot(date,b);row.append(el);
  }$('grid').append(row);
 }
 const b=BLOCKS.findIndex(x=>now.hour>=x.start&&now.hour<x.end),s=b>=0?slot(now.date,b,changes,now):null;
 const liveKnown=Boolean(s&&s.known&&liveReady),free=liveKnown&&s.apartment===null;
 const blocked=needCode||!configured;
 $('live').className=`live ${free?'free':''} ${blocked?'nodb':''}`;
 const eyebrow=connecting?t.evConnecting:blocked?t.evNoDb:!liveReady?t.evLost:t.evNow;
 const title=connecting?t.ltLoading:!configured?t.erConfig:needCode?t.noDbTitle:!s&&liveReady?t.ltClosed:!liveKnown?t.ltUnavailable:free?t.ltFree:t.ltReserved;
 const copy=connecting?t.lcFetching:!configured?'':needCode?t.noDbCopy:!s&&liveReady?t.lcOpens:!liveKnown?t.lcReconnect:free?t.lcFreeUntil(BLOCKS[b].end):t.lcHeldUntil(s.apartment,BLOCKS[b].end);
 $('live').innerHTML=`<p class="eyebrow status-line"><span class="status-dot"></span>${esc(eyebrow)}</p><h2>${esc(title)}</h2><p>${esc(copy)}</p>`;
 const liveButton=(label,fn)=>{const button=document.createElement('button');button.textContent=label;button.onclick=fn;$('live').append(button);};
 if(configured&&needCode&&!connecting)liveButton(t.btnCode,openIdentity);
 else if(liveKnown&&(free||s.apartment===selected))liveButton(free?t.btnUse:t.btnFinished,()=>openSlot(now.date,b));
 connection();
}
function openSlot(date,b){
 const t=T();active={date,b};const s=slot(date,b,changes),ready=healthy&&loaded.has(monday(date))&&s.known,free=ready&&s.apartment===null;
 $('detail-date').textContent=`${fmt(date,{weekday:'long',day:'numeric',month:'short'})} · ${t.range(BLOCKS[b].start,BLOCKS[b].end)}`;
 $('detail-title').textContent=s.period==='past'?t.dtEnded:!ready?t.ltUnavailable:free?t.dtFree:t.dtApt(s.apartment);
 $('detail-copy').textContent=s.period==='past'?t.dcPast:needCode?t.dcNoDb:!ready?t.dcNoConn:free?t.dcFree:s.apartment===selected?t.dcMine:t.dcOther;
 $('detail-actions').replaceChildren();
 const action=(label,fn)=>{const button=document.createElement('button');button.className='primary';button.textContent=label;button.onclick=fn;$('detail-actions').append(button);};
 if(s.period!=='past'&&configured&&needCode)action(t.btnCode,()=>{$('detail').close();openIdentity();});
 else if(s.period!=='past'&&ready){if(!selected)action(t.acChoose,()=>{$('detail').close();openIdentity();});else if(free)action(t.acBook(selected),()=>mutate(s,'book'));else if(s.apartment===selected)action(s.period==='current'?t.acFinish:t.acRelease,()=>mutate(s,'release'));}
 if(!$('detail').open)$('detail').showModal();
}
function refresh(){render();if($('detail').open&&active&&!busy)openSlot(active.date,active.b);}
async function mutate(s,action){
 if(busy)return;busy=true;for(const el of $('detail-actions').children)el.disabled=true;
 try{
  if(!APARTMENTS.includes(selected))throw fail('erPick');
  const rows=await rpc('change_slot',{p_passcode:passcode,p_key:s.key,p_apartment:selected,p_action:action,p_version:s.version});
  const r=rows[0],v=r&&sanitize(r.slot_key,r.slot_apartment,r.slot_version);
  if(v)changes={...changes,[r.slot_key]:v};
  $('detail').close();toast(action==='release'?T().toReleased:T().toBooked);
 }catch(e){
  const t=T(),key=e.key||ERR[e.api];
  if(e.api==='bad_passcode'){forgetCode();$('detail').close();openIdentity();}
  toast(key?t[key]:t.erSave);
 }finally{busy=false;refresh();load();}
}
function openIdentity(){$('apartment-select').value=selected||'';$('code-input').value='';applyLang();if(!$('identity').open)$('identity').showModal();}
applyLang();
document.querySelectorAll('#lang button').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
$('apartment').onclick=openIdentity;
$('identity-close').onclick=()=>$('identity').close();
$('save-identity').onclick=e=>{
 e.preventDefault();
 if(!$('code-field').hidden){
  const code=$('code-input').value.trim();
  if(!code){$('code-input').reportValidity();return;}
  passcode=code;needCode=false;connecting=true;healthy=false;loaded=new Set();changes={};promptedApartment=false;
  try{localStorage.setItem('laundry-code',code);}catch{}
  $('identity').close();render();load();return;
 }
 const value=Number($('apartment-select').value);
 if(!APARTMENTS.includes(value)){$('apartment-select').reportValidity();return;}
 selected=value;
 try{localStorage.setItem('laundry-apartment',String(selected));}catch{toast(T().erRemember);}
 $('identity').close();render();
};
$('close-detail').onclick=()=>$('detail').close();
const go=w=>{week=w;render();load();};
$('prev').onclick=()=>go(addDays(week,-7));$('next').onclick=()=>go(addDays(week,7));$('today').onclick=()=>go(monday(clock().date));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});
window.addEventListener('online',load);
render();load();
setInterval(()=>{if(!document.hidden&&!busy)load();else render();},20000);
if(configured&&!passcode)openIdentity();

})();
