const cfg=window.APP_CONFIG;
let sb;
try{ sb=getSupabaseClient(); }catch(err){ alert(err.message); throw err; }

const grid=document.getElementById('galleryGrid');
const empty=document.getElementById('emptyState');
const eventName=document.getElementById('eventName');
const galleryStatus=document.getElementById('galleryStatus');
eventName.textContent=cfg.EVENT_NAME;

function formatDate(value){
  return new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
}
function render(items){
  grid.innerHTML='';
  empty.style.display=items.length ? 'none' : 'block';

  items.forEach(item=>{
    const card=document.createElement('article');
    card.className='art-note';

    const tape=document.createElement('div');
    tape.className='masking-tape';

    const img=document.createElement('img');
    img.src=item.image_url;
    img.alt='학생이 전송한 축제 그림';
    img.loading='lazy';

    const copy=document.createElement('div');
    copy.className='note-copy';

    const meta=document.createElement('p');
    meta.className='note-meta';
    meta.textContent=formatDate(item.created_at);

    const message=document.createElement('p');
    message.className='note-message';
    message.textContent=item.message || '';

    copy.append(meta,message);
    card.append(tape,img,copy);
    grid.append(card);
  });
}

async function load(){
  galleryStatus.textContent='작품을 불러오는 중...';
  const {data,error}=await sb.from('artworks')
    .select('id,message,image_url,created_at')
    .eq('event_id',cfg.EVENT_ID)
    .eq('status','approved')
    .order('created_at',{ascending:false})
    .limit(100);

  if(error){
    console.error(error);
    galleryStatus.textContent='불러오기 실패 · '+humanizeSupabaseError(error);
    return;
  }

  render(data || []);
  galleryStatus.textContent=`현재 작품 ${data?.length || 0}개`;
}
load();

sb.channel(`gallery-${cfg.EVENT_ID}`)
  .on('postgres_changes',{event:'*',schema:'public',table:'artworks',filter:`event_id=eq.${cfg.EVENT_ID}`},load)
  .subscribe();
setInterval(load,30000);
