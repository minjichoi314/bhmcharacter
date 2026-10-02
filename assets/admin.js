const cfg = window.APP_CONFIG;

let sb;
try{
  sb = getSupabaseClient();
}catch(err){
  alert(err.message);
  throw err;
}

const tbody = document.getElementById("rows");
const adminStatus = document.getElementById("adminStatus");

function formatDate(value){
  return new Intl.DateTimeFormat("ko-KR",{
    dateStyle:"short",
    timeStyle:"short"
  }).format(new Date(value));
}

async function load(){
  adminStatus.textContent = "불러오는 중...";

  const {data,error} = await sb
    .from("artworks")
    .select("id,image_url,status,created_at")
    .eq("event_id",cfg.EVENT_ID)
    .order("created_at",{ascending:false})
    .limit(200);

  if(error){
    adminStatus.textContent = humanizeSupabaseError(error);
    return;
  }

  tbody.innerHTML = "";

  for(const item of data || []){
    const tr = document.createElement("tr");

    const imageTd = document.createElement("td");
    const img = document.createElement("img");
    img.className = "admin-thumb";
    img.src = item.image_url;
    img.alt = "";
    imageTd.append(img);

    const dateTd = document.createElement("td");
    dateTd.textContent = formatDate(item.created_at);

    const statusTd = document.createElement("td");
    statusTd.textContent = item.status;

    const actionsTd = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const approve = document.createElement("button");
    approve.className = "small-btn approve";
    approve.textContent = "공개";
    approve.onclick = ()=>updateStatus(item.id,"approved");

    const hide = document.createElement("button");
    hide.className = "small-btn hide";
    hide.textContent = "숨김";
    hide.onclick = ()=>updateStatus(item.id,"hidden");

    actions.append(approve,hide);
    actionsTd.append(actions);

    tr.append(imageTd,dateTd,statusTd,actionsTd);
    tbody.append(tr);
  }

  adminStatus.textContent = `총 ${data?.length || 0}개`;
}

async function updateStatus(id,status){
  const {error} = await sb
    .from("artworks")
    .update({status})
    .eq("id",id);

  if(error){
    alert(humanizeSupabaseError(error));
    return;
  }

  load();
}

load();
