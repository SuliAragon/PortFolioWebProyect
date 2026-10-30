import {homes,workshops,questions,books} from '../data/extended';
import {renovationEstimate,furniturePrice,drivingPrice,canSeat} from '../lib/business-tools';
const root=document.querySelector<HTMLElement>('[data-extended]');
const money=(value:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
const write=(selector:string,value:string)=>{const target=root?.querySelector<HTMLElement>(selector);if(target)target.textContent=value;};

root?.querySelectorAll<HTMLFormElement>('[data-ex-contact]').forEach(form=>form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  write('[data-contact-result]',`Consulta preparada: ${data.get('interest')}. ${data.get('message')} — Resumen local de demostración; no se ha enviado ningún mensaje.`);
}));

root?.querySelectorAll<HTMLButtonElement>('[data-artist]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll<HTMLElement>('[data-flash-artist]').forEach(card=>card.hidden=button.dataset.artist!=='Todos'&&card.dataset.flashArtist!==button.dataset.artist);
  root.querySelectorAll('[data-artist]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
}));
root?.querySelectorAll<HTMLButtonElement>('[data-flash-pick]').forEach(button=>button.addEventListener('click',()=>{
  const input=root.querySelector<HTMLInputElement>('[data-tattoo] input[name="design"]');
  if(input){input.value=button.dataset.flashPick!;input.focus();}
}));
root?.querySelector<HTMLFormElement>('[data-tattoo]')?.addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(!form.reportValidity())return;
  const data=new FormData(form);
  write('[data-tattoo-result]',`Tu propuesta: ${data.get('design')}. Zona: ${data.get('zone')}. Tamaño: ${data.get('size')}. Historia: ${data.get('story')}. Este resumen no reserva una sesión ni se envía al estudio.`);
});

const homeFilter=root?.querySelector<HTMLFormElement>('[data-home-filter]');
const filterHomes=()=>{
  if(!homeFilter)return;const data=new FormData(homeFilter);let count=0;
  root?.querySelectorAll<HTMLElement>('[data-home-card]').forEach(card=>{
    const match=(data.get('area')==='all'||card.dataset.area===data.get('area'))&&Number(card.dataset.price)<=Number(data.get('budget'))&&Number(card.dataset.rooms)>=Number(data.get('rooms'));
    card.hidden=!match;if(match)count++;
  });
  write('[data-home-count]',`${count} ${count===1?'vivienda de ejemplo':'viviendas de ejemplo'}`);
  const empty=root?.querySelector<HTMLElement>('[data-homes-empty]');if(empty)empty.hidden=count>0;
};
homeFilter?.addEventListener('submit',event=>{event.preventDefault();filterHomes();});
homeFilter?.addEventListener('change',filterHomes);
const compared=new Set<string>();
function renderComparison(message?:string){
  const body=root?.querySelector('[data-compare-body]');if(!body)return;body.replaceChildren();
  homes.filter(home=>compared.has(home.id)).forEach(home=>{
    const row=document.createElement('tr');
    [home.name,money(home.price),`${home.metres} m²`,String(home.rooms),home.area].forEach((value,index)=>{
      const cell=document.createElement(index===0?'th':'td');if(index===0)cell.setAttribute('scope','row');cell.textContent=value;row.append(cell);
    });body.append(row);
  });
  const table=root?.querySelector<HTMLElement>('[data-compare-table]');if(table)table.hidden=compared.size===0;
  write('[data-compare-status]',message||`${compared.size} de 3 viviendas seleccionadas. ${compared.size<2?'Añade otra para comparar.':'Compara sus características en la tabla.'}`);
  root?.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach(button=>{
    const selected=compared.has(button.dataset.compare!);button.setAttribute('aria-pressed',String(selected));button.textContent=selected?'✓ Quitar':'＋ Comparar';
  });
}
root?.querySelectorAll<HTMLButtonElement>('[data-compare]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.compare!;
  if(compared.has(id))compared.delete(id);else if(compared.size<3)compared.add(id);else{renderComparison('Puedes comparar hasta tres viviendas. Quita una antes de añadir otra.');return;}
  renderComparison();
}));
root?.querySelector('[data-compare-clear]')?.addEventListener('click',()=>{compared.clear();renderComparison();});

const workshopForm=root?.querySelector<HTMLFormElement>('[data-workshop]');
const syncWorkshop=()=>{
  if(!workshopForm)return;const selected=workshops.find(w=>w.id===(new FormData(workshopForm)).get('workshop'))!;
  const people=workshopForm.querySelector<HTMLInputElement>('[name="people"]')!;people.max=String(selected.places);
};
root?.querySelectorAll<HTMLButtonElement>('[data-workshop-pick]').forEach(button=>button.addEventListener('click',()=>{
  const select=workshopForm?.querySelector<HTMLSelectElement>('[name="workshop"]');if(select){select.value=button.dataset.workshopPick!;syncWorkshop();select.focus();}
}));
workshopForm?.addEventListener('change',syncWorkshop);
workshopForm?.addEventListener('submit',event=>{
  event.preventDefault();syncWorkshop();if(!workshopForm.reportValidity())return;
  const data=new FormData(workshopForm);const workshop=workshops.find(w=>w.id===data.get('workshop'))!;
  const people=Number(data.get('people'));
  write('[data-workshop-result]',`${workshop.name} · ${workshop.date}, ${workshop.time}. ${people} ${people===1?'persona':'personas'} · ${money(people*workshop.price)}. Plan de ejemplo; no se han reservado plazas.`);
});

const answered=new Map<number,number>();
root?.querySelectorAll<HTMLInputElement>('[data-question] input').forEach(input=>input.addEventListener('change',()=>{
  const field=input.closest<HTMLElement>('[data-question]')!;const index=Number(field.dataset.question);const choice=Number(input.value);answered.set(index,choice);
  const correct=choice===questions[index].correct;
  field.dataset.answer=correct?'correct':'incorrect';field.querySelector<HTMLElement>('[data-answer-feedback]')!.textContent=`${correct?'Correcto.':'Revisa esta idea.'} ${questions[index].explanation}`;
  const score=[...answered].filter(([i,value])=>questions[i].correct===value).length;
  write('[data-test-score]',`${answered.size} / 3 respondidas · ${score} ${score===1?'acierto':'aciertos'}`);
}));
root?.querySelector('[data-test-reset]')?.addEventListener('click',()=>{
  answered.clear();root.querySelectorAll<HTMLInputElement>('[data-question] input').forEach(input=>input.checked=false);
  root.querySelectorAll<HTMLElement>('[data-question]').forEach(field=>{delete field.dataset.answer;field.querySelector<HTMLElement>('[data-answer-feedback]')!.textContent='';});
  write('[data-test-score]','0 / 3 respondidas');
});
const driving=root?.querySelector<HTMLFormElement>('[data-driving]');
function updateDriving(){if(!driving)return;const n=Number(new FormData(driving).get('lessons'));write('[data-lessons-label]',String(n));write('[data-driving-practice]',money(n*32));write('[data-driving-total]',money(drivingPrice(n)));write('[data-driving-result]','');}
driving?.addEventListener('input',updateDriving);
driving?.addEventListener('submit',event=>{event.preventDefault();const n=Number(new FormData(driving).get('lessons'));write('[data-driving-result]',`Plan preparado: base teórica + ${n} prácticas, ${money(drivingPrice(n))}. No incluye tasas, psicotécnico ni examen. Demostración sin matrícula.`);});

root?.querySelector<HTMLInputElement>('[data-room-slider]')?.addEventListener('input',event=>{
  root.querySelector<HTMLElement>('[data-room-comparison]')!.style.setProperty('--reveal',`${(event.target as HTMLInputElement).value}%`);
});
root?.querySelector<HTMLFormElement>('[data-reform]')?.addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget as HTMLFormElement;if(!form.reportValidity())return;
  const data=new FormData(form);const range=renovationEstimate(Number(data.get('area')),data.get('level') as 'essential'|'complete'|'premium');
  write('[data-reform-total]',`${money(range.min)} — ${money(range.max)}`);
});

root?.querySelectorAll<HTMLButtonElement>('[data-book-filter]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll<HTMLElement>('[data-book-genre]').forEach(card=>card.hidden=button.dataset.bookFilter!=='all'&&card.dataset.bookGenre!==button.dataset.bookFilter);
  root.querySelectorAll('[data-book-filter]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
}));
root?.querySelector<HTMLFormElement>('[data-book-match]')?.addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.currentTarget as HTMLFormElement);
  const book=books.find(book=>book.mood===data.get('mood')&&book.length===data.get('length'))||books.find(book=>book.mood===data.get('mood'))!;
  write('[data-book-result]',`${book.title}, de ${book.author}. ${book.note} ${money(book.price)}. Título ficticio de esta colección.`);
});

const assignments:Record<string,string>={};
const guestCards=Array.from(root?.querySelectorAll<HTMLElement>('[data-guest]')||[]);
guestCards.forEach(guest=>assignments[guest.dataset.guest!]='pending');
function renderSeats(message?:string){
  guestCards.forEach(guest=>{
    const table=assignments[guest.dataset.guest!];root!.querySelector(`[data-table-guests="${table}"]`)!.append(guest);
    guest.querySelector<HTMLSelectElement>('select')!.value=table;
  });
  root?.querySelectorAll<HTMLElement>('[data-table-count]').forEach(count=>count.textContent=String(Object.values(assignments).filter(table=>table===count.dataset.tableCount).length));
  const seated=Object.values(assignments).filter(table=>table!=='pending').length;
  write('[data-seat-status]',message||`${seated} de ${Object.keys(assignments).length} invitados colocados.`);
}
function placeGuest(guest:string,table:string){
  if(!(guest in assignments)||!['pending','olivo','mar','luz'].includes(table))return;
  if(!canSeat(assignments,guest,table)){renderSeats('Esa mesa ya tiene cuatro personas. Elige otra mesa o mueve primero a alguien.');return;}
  assignments[guest]=table;renderSeats();
}
root?.querySelectorAll<HTMLElement>('[data-guest]').forEach(guest=>guest.addEventListener('dragstart',event=>{event.dataTransfer?.setData('text/plain',guest.dataset.guest!);}));
root?.querySelectorAll<HTMLElement>('[data-table]').forEach(table=>{
  table.addEventListener('dragover',event=>{event.preventDefault();table.classList.add('is-drag-over');});
  table.addEventListener('dragleave',()=>table.classList.remove('is-drag-over'));
  table.addEventListener('drop',event=>{event.preventDefault();table.classList.remove('is-drag-over');placeGuest(event.dataTransfer?.getData('text/plain')||'',table.dataset.table!);});
});
root?.querySelectorAll<HTMLSelectElement>('[data-guest-select]').forEach(select=>select.addEventListener('change',()=>placeGuest(select.dataset.guestSelect!,select.value)));
root?.querySelector('[data-seat-reset]')?.addEventListener('click',()=>{Object.keys(assignments).forEach(guest=>assignments[guest]='pending');renderSeats();});

const furniture=root?.querySelector<HTMLFormElement>('[data-furniture]');
function readFurniture(){const data=new FormData(furniture!);return{width:Number(data.get('width')),finish:data.get('finish') as 'oak'|'walnut'|'sage',legs:data.has('legs')};}
function updateFurniture(){
  if(!furniture)return;const {width,finish,legs}=readFurniture();const color={oak:'#b59063',walnut:'#6c4735',sage:'#869180'}[finish];
  const preview=root!.querySelector<HTMLElement>('[data-furniture-preview]')!;
  preview.style.setProperty('--wood',color);preview.style.setProperty('--cabinet-width',`${45+(width-100)/120*45}%`);
  root!.querySelector<HTMLElement>('[data-cabinet-legs]')!.hidden=!legs;
  write('[data-width-label]',`${width} cm`);write('[data-furniture-price]',money(furniturePrice(width,finish,legs)));write('[data-furniture-result]','Configuración actualizada. Puedes revisarla antes de continuar.');
}
furniture?.addEventListener('input',updateFurniture);
furniture?.addEventListener('submit',event=>{
  event.preventDefault();const {width,finish,legs}=readFurniture();const names={oak:'roble natural',walnut:'nogal cálido',sage:'verde salvia'};
  write('[data-furniture-result]',`Línea · ${width} × 75 × 40 cm · ${names[finish]} · ${legs?'con patas elevadas':'sin patas elevadas'} · ${money(furniturePrice(width,finish,legs))}. Configuración de demostración; no se ha creado un pedido.`);
});
