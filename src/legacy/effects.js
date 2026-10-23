(() => {
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),manifesto=$('#atelier'),craft=$('#methode'),collection=$('#collection'),ritual=$('#rituel'),closing=$('#visit'),header=$('#header'),story=$('#story');
const steps=$$('.craft-step'),craftPhotos=$$('[data-craft-photo]'),craftButtons=$$('[data-craft]'),cards=$$('.flavor-card'),gallery=$('.gallery-track'),galleryWindow=$('.gallery-window'),menuRows=$$('.menu-row'),closingLetters=$$('.closing-word span'),lastCard=Math.max(0,cards.length-1);
// Keep the heading's accessible text intact while each visual word responds to scroll.
const heading=$('.word-reveal'),walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT),texts=[];let node;while(node=walker.nextNode())texts.push(node);
for(const text of texts){const fragment=document.createDocumentFragment();for(const token of text.textContent.split(/(\s+)/)){if(!token.trim()){fragment.append(document.createTextNode(token));continue;}const span=document.createElement('span');span.className='word';span.textContent=token;fragment.append(span);}text.replaceWith(fragment);}
const words=$$('.word-reveal .word');let queued=false,currentCraft=-1,currentCard=0;
const revealTargets=$$('.reveal');if('IntersectionObserver'in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});revealTargets.forEach(element=>revealObserver.observe(element));}else revealTargets.forEach(element=>element.classList.add('visible'));
const pinProgress=(el)=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight));
function scrollToPin(el,p){const top=el.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+p*Math.max(0,el.offsetHeight-innerHeight),behavior:reduced.matches?'auto':'smooth'});}
craftButtons.forEach((b,i)=>b.addEventListener('click',()=>{if(reduced.matches)steps[i].scrollIntoView({behavior:'auto',block:'center'});else scrollToPin(craft,[.04,.5,.96][i]);}));
$$('[data-collection-direction]').forEach(b=>b.addEventListener('click',()=>{const next=clamp(currentCard+Number(b.dataset.collectionDirection),0,lastCard);if(reduced.matches){galleryWindow.scrollTo({left:cards[next].offsetLeft-24,behavior:'auto'});currentCard=next;}else scrollToPin(collection,lastCard?next/lastCard:0);}));
$$('[data-show-flavor]').forEach(b=>b.addEventListener('click',()=>{const button=$(`[data-flavor="${b.dataset.showFlavor}"]`);button.click();}));
function update(){
 queued=false;const vh=innerHeight,vw=innerWidth,noMotion=reduced.matches;
 const mRect=manifesto.getBoundingClientRect(),cp=pinProgress(craft),gp=pinProgress(collection),rp=pinProgress(ritual),ep=pinProgress(closing);
 const wordProgress=clamp((vh*.48-mRect.top)/(manifesto.offsetHeight-vh*.2));
 const rowRects=menuRows.map(row=>({top:row.getBoundingClientRect().top-(parseFloat(row.style.getPropertyValue('--row-y'))||0)})),darkSections=$$('[data-dark-section]').map(el=>el.getBoundingClientRect());
 const galleryTravel=Math.max(0,gallery.scrollWidth-vw),galleryX=-gp*galleryTravel;
 if(!noMotion){
  $('.taste-track').style.transform=`translateX(${-clamp((vh-$('.taste-band').getBoundingClientRect().top)/(vh+120))*210}px)`;
  words.forEach((word,i)=>{const t=smooth(i/words.length*.8,i/words.length*.8+.17,wordProgress);word.style.setProperty('--word-opacity',mix(.12,1,t).toFixed(4));word.style.setProperty('--word-y',`${mix(13,0,t).toFixed(2)}px`);});
  const phase=clamp(cp*2.6-.3,0,2),active=Math.round(phase);
  steps.forEach((step,i)=>{const d=phase-i,alpha=1-smooth(.25,.51,Math.abs(d));step.style.setProperty('--step-opacity',alpha.toFixed(4));step.style.setProperty('--step-y',`${(-d*38).toFixed(2)}px`);step.setAttribute('aria-hidden',String(i!==active));step.inert=i!==active;});
  if(currentCraft!==active){craftButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));$('#craft-count').textContent=`0${active+1} — 03`;currentCraft=active;}
  // One fully opaque base with the incoming photograph above it: no dark dip between exposures.
  craftPhotos.forEach((photo,i)=>{const local=clamp(phase-i+.5),opacity=i===0?1:smooth(i-.78,i-.22,phase);photo.style.setProperty('--photo-opacity',opacity.toFixed(4));photo.style.setProperty('--caption-opacity',(1-smooth(.18,.47,Math.abs(phase-i))).toFixed(4));photo.style.setProperty('--photo-scale',mix(1.035,1.12,local).toFixed(4));photo.style.setProperty('--photo-x',`${mix(1,-1,local).toFixed(3)}%`);photo.style.setProperty('--photo-y',`${mix(.6,-.6,local).toFixed(3)}%`);photo.setAttribute('aria-hidden',String(i!==active));});
  craft.dataset.activePhoto=String(active);craft.style.setProperty('--craft-progress',cp.toFixed(4));
  gallery.style.setProperty('--gallery-x',`${galleryX.toFixed(2)}px`);
  cards.forEach(card=>{const d=clamp((card.offsetLeft+card.offsetWidth*.5+galleryX-vw*.5)/(vw*.7),-1,1);card.style.setProperty('--card-r',`${(d*2.1).toFixed(3)}deg`);card.style.setProperty('--card-y',`${(Math.abs(d)*14).toFixed(2)}px`);card.style.setProperty('--card-scale',(1.025+Math.abs(d)*.035).toFixed(4));});
  currentCard=Math.min(lastCard,Math.round(gp*lastCard));collection.style.setProperty('--collection-progress',mix(.06,1,gp).toFixed(4));$('#collection-count').textContent=`${String(currentCard+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  menuRows.forEach((row,i)=>{const visible=smooth(vh*.92,vh*.57,rowRects[i].top);row.style.setProperty('--row-opacity',mix(.12,1,visible).toFixed(3));row.style.setProperty('--row-y',`${mix(22,0,visible).toFixed(2)}px`);row.style.setProperty('--row-line',visible.toFixed(4));});
  ritual.style.setProperty('--ritual-radius',`${mix(48,1,smooth(.08,.83,rp)).toFixed(2)}%`);ritual.style.setProperty('--ritual-rotation',`${mix(-6,3,rp).toFixed(3)}deg`);ritual.style.setProperty('--ritual-scale',mix(.83,1,smooth(.05,.8,rp)).toFixed(4));ritual.style.setProperty('--ritual-type-x',`${mix(-20,35,rp).toFixed(2)}px`);
  closing.style.setProperty('--closing-copy-y',`${mix(22,-15,ep).toFixed(2)}px`);closingLetters.forEach((letter,i)=>letter.style.setProperty('--letter-y',`${(1-smooth(i*.12,.58+i*.12,ep))*110}px`));
 }else{steps.forEach(step=>{step.removeAttribute('aria-hidden');step.inert=false;});craftPhotos.forEach(photo=>photo.removeAttribute('aria-hidden'));menuRows.forEach(row=>{row.style.setProperty('--row-opacity',1);row.style.setProperty('--row-y','0px');row.style.setProperty('--row-line',1);});}
 const inEditorial=scrollY>story.offsetHeight-60;header.classList.toggle('content-header',inEditorial);
 if(inEditorial){const dark=darkSections.some(rect=>rect.top<=40&&rect.bottom>40);header.classList.toggle('dark',dark);header.classList.add('solid');}
 $$('[data-collection-direction]').forEach(b=>{b.disabled=Number(b.dataset.collectionDirection)<0?currentCard===0:currentCard===lastCard;});
 collection.dataset.scrollProgress=gp.toFixed(4);craft.dataset.scrollProgress=cp.toFixed(4);ritual.dataset.scrollProgress=rp.toFixed(4);closing.dataset.scrollProgress=ep.toFixed(4);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('pageshow',schedule);reduced.addEventListener('change',schedule);galleryWindow.addEventListener('scroll',()=>{if(reduced.matches){currentCard=clamp(Math.round(galleryWindow.scrollLeft/(cards[0].offsetWidth+22)),0,lastCard);$('#collection-count').textContent=`${String(currentCard+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;$$('[data-collection-direction]').forEach(b=>{b.disabled=Number(b.dataset.collectionDirection)<0?currentCard===0:currentCard===lastCard;});}},{passive:true});
document.querySelectorAll('.editorial img').forEach(img=>img.addEventListener('load',schedule,{once:true}));schedule();
})();
