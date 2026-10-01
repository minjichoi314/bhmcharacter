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

function formatDate(s){
  return new Intl.DateTimeFormat("ko-KR",{
    dateStyle:"short",
    timeStyle:"short"
  }).format(new Date(s));
}

async function load(){
  adminStatus.textContent = "불러오는 중...";

  const {data,error} = await sb
    .from("artworks")
    .select("id,title,message,image_url,storage_path,status,created_at")
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

    const tdImg = document.createElement("td");
    const img = document.createElement("img");
    img.className = "admin-thumb";
    img.src = item.image_url;
    img.alt = "";
    tdImg.append(img);

    const tdTime = document.createElement("td");
    tdTime.textContent = formatDate(item.created_at);

    const tdTitle = document.createElement("td");
    tdTitle.textContent = item.title || "";

    const tdMessage = document.createElement("td");
    tdMessage.textContent = item.message || "";

    const tdStatus = document.createElement("td");
    tdStatus.textContent = item.status;

    const tdActions = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "admin-actions";

    const approve = document.createElement("button");
    approve.className = "small-btn approve";
    approve.textContent = "공개";
    approve.onclick = ()=>updateStatus(item.id, "approved");

    const hide = document.createElement("button");
    hide.className = "small-btn hide";
    hide.textContent = "숨김";
    hide.onclick = ()=>updateStatus(item.id, "hidden");

    actions.append(approve, hide);
    tdActions.append(actions);

    tr.append(tdImg,tdTime,tdTitle,tdMessage,tdStatus,tdActions);
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
