const cfg = window.APP_CONFIG;

const grid = document.getElementById("galleryGrid");
const empty = document.getElementById("emptyState");

const NOTE_SHAPES = [
  "note-heart",
  "note-bear",
  "note-star",
  "note-flower",
  "note-circle",
  "note-cloud"
];

function formatDate(value){
  return new Intl.DateTimeFormat("ko-KR",{
    month:"short",
    day:"numeric",
    hour:"2-digit",
    minute:"2-digit"
  }).format(new Date(value));
}

function render(items){
  grid.innerHTML = "";
  empty.style.display = items.length ? "none" : "block";

  items.forEach((item,index)=>{
    const wrap = document.createElement("article");
    wrap.className = "gallery-item";
    wrap.style.setProperty("--tilt", `${[-2.1,1.4,-1.2,2,-.8,1.1][index % 6]}deg`);

    const note = document.createElement("div");
    note.className = `shape-note ${NOTE_SHAPES[index % NOTE_SHAPES.length]}`;

    const tape = document.createElement("div");
    tape.className = "masking-tape";

    const imageFrame = document.createElement("div");
    imageFrame.className = "image-frame";

    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = "학생이 전송한 축제 그림";
    img.loading = "lazy";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = formatDate(item.created_at);

    imageFrame.append(img);
    note.append(tape,imageFrame,meta);
    wrap.append(note);
    grid.append(wrap);
  });
}

async function load(){
  try{
    const data = await fetchApprovedArtworks(cfg.EVENT_ID,100);
    render(data || []);
  }catch(err){
    console.error(err);
    empty.style.display = "block";
    empty.textContent = "작품을 불러오지 못했어요. " + humanizeSupabaseError(err);
  }
}

load();

// SDK Realtime 대신 5초마다 갱신.
// publishable key를 Authorization Bearer로 잘못 보내는 문제를 피합니다.
setInterval(load,5000);
