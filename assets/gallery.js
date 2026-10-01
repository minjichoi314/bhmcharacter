const cfg = window.APP_CONFIG;
let sb;
try{ sb = getSupabaseClient(); }catch(err){ alert(err.message); throw err; }

const grid = document.getElementById("galleryGrid");
const empty = document.getElementById("emptyState");
const eventName = document.getElementById("eventName");
const galleryStatus = document.getElementById("galleryStatus");
eventName.textContent = cfg.EVENT_NAME;

function formatDate(s){
  return new Intl.DateTimeFormat("ko-KR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(s));
}
function render(items){
  grid.innerHTML = "";
  empty.style.display = items.length ? "none" : "block";
  for(const item of items){
    const card = document.createElement("article");
    card.className = "card";
    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = item.title || "관람객 작품";
    const body = document.createElement("div");
    body.className = "card-body";
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = formatDate(item.created_at);
    const h = document.createElement("h3");
    h.textContent = item.title || "축제 참여 작품";
    const p = document.createElement("p");
    p.textContent = item.message || "";
    body.append(meta,h,p);
    card.append(img,body);
    grid.append(card);
  }
}
async function load(){
  galleryStatus.textContent = "불러오는 중...";
  const { data, error } = await sb.from("artworks")
    .select("id,title,message,image_url,created_at")
    .eq("event_id",cfg.EVENT_ID)
    .eq("status","approved")
    .order("created_at",{ascending:false})
    .limit(100);
  if(error){
    galleryStatus.textContent = "불러오기 실패: " + humanizeSupabaseError(error);
    return;
  }
  render(data || []);
  galleryStatus.textContent = `작품 ${data?.length || 0}개`;
}
load();
sb.channel(`gallery-${cfg.EVENT_ID}`)
  .on("postgres_changes",{event:"*",schema:"public",table:"artworks",filter:`event_id=eq.${cfg.EVENT_ID}`},load)
  .subscribe();
setInterval(load, 30000);
