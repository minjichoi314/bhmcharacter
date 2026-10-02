const cfg = window.APP_CONFIG;

let sb;
try{
  sb = getSupabaseClient();
}catch(err){
  alert(err.message);
  throw err;
}

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
  const {data,error} = await sb
    .from("artworks")
    .select("id,image_url,created_at")
    .eq("event_id",cfg.EVENT_ID)
    .eq("status","approved")
    .order("created_at",{ascending:false})
    .limit(100);

  if(error){
    console.error(error);
    empty.style.display = "block";
    empty.textContent = "작품을 불러오지 못했어요.";
    return;
  }

  render(data || []);
}

load();

sb
  .channel(`gallery-${cfg.EVENT_ID}`)
  .on(
    "postgres_changes",
    {
      event:"*",
      schema:"public",
      table:"artworks",
      filter:`event_id=eq.${cfg.EVENT_ID}`
    },
    load
  )
  .subscribe();

setInterval(load,30000);
