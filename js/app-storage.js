// ── 데이터 백업/복원 ─────────────────────────────────────

function downloadTemplate(kind){
  var sy=parseInt(g("sY")?g("sY").value:0)||new Date().getFullYear();
  var csv="";
  if(kind==="short"){
    // 단기: 1줄 헤더(라벨 + 1월~12월), 예시 행
    var hdr=["항목"]; for(var m=1;m<=12;m++)hdr.push(m+"월");
    csv=hdr.join(",")+"\n";
    csv+="급여,300,300,300,300,300,300,300,300,300,300,300,300\n";
    csv+="기타소득,0,0,0,0,0,0,0,0,0,0,0,0\n";
  } else {
    // 중기/장기: 1줄 헤더(라벨 + 연도들), 예시 행
    var per=kind==="mid"?10:30;
    var hdr=["항목"]; for(var i=0;i<per;i++)hdr.push(sy+i);
    csv=hdr.join(",")+"\n";
    csv+="현재자산"; for(var i=0;i<per;i++)csv+=",0"; csv+="\n";
    csv+="저축액"; for(var i=0;i<per;i++)csv+=",0"; csv+="\n";
    csv+="수익률"; for(var i=0;i<per;i++)csv+=",15"; csv+="\n";
  }
  var blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  var nm=kind==="short"?"단기":(kind==="mid"?"중기":"장기");
  a.download="richsister_양식_"+nm+".csv";
  a.click();
  showToast(nm+" 양식을 받았어요. 값을 채워서 다시 불러오세요");
}
var RS_EXTRA_KEYS=["rs_shunit","rs_mdunit","rs_lgunit","rs_daily","rs_daily_cats","rs_daily_moods","rs_daily_budget","rs_daily_link","rs_daily_review","rs_daily_consume","rs_consume_empty","rs_assets","rs_asset_history","rs_cat_hidden","rs_fixed_due","rs_holidays","rs_help_hidden","rs_resist","rs_spend_rules","rs_spend_rules_on","rs_week_start","rs_month_start","rs_month_shortmode","rs_income","rs_income_cats","rs_income_map","rs_income_rm","rs_meal","rs_meal_on","rs_cal_layers","rs_special_plan","rs_nav_pin"];
// ── 구글 드라이브 저장/불러오기 (2단계) — 클라이언트 ID는 주인장이 발급해 넣을 때까지 빈 문자열 = 기능 전체 비활성 ──
var DRIVE_CLIENT_ID="617085954049-ierh9liphmhhn11r352gh9or74k60hj7.apps.googleusercontent.com";
// ── 백업 리마인드 (마지막 백업 후 경과 알림) ─────────────
function _rsHasRealData(){
  try{var d=localStorage.getItem('rs_daily');if(d){var a=JSON.parse(d);if(Array.isArray(a)&&a.length>0)return true;}}catch(e){}
  try{var r=localStorage.getItem('rs7');if(r&&r!=='{}'&&r.length>8)return true;}catch(e){}
  return false;
}
function checkBackupReminder(){
  var el=g('backupReminder');if(!el)return;
  if(!_rsHasRealData()){el.style.display='none';return;}
  var now=Date.now(),DAY=86400000;
  var snooze=parseInt(localStorage.getItem('rs_backup_snooze')||'0',10);
  if(snooze&&now<snooze){el.style.display='none';return;}
  var last=parseInt(localStorage.getItem('rs_last_backup')||'0',10);
  var msg='';
  if(!last){
    var seen=parseInt(localStorage.getItem('rs_first_seen')||'0',10);
    if(!seen){seen=now;try{lsSet('rs_first_seen',String(now),1);}catch(e){}}
    if(now-seen>=7*DAY)msg='아직 한 번도 백업하지 않았어요. 지금 백업해 두면 안전해요.';
  }else{
    var days=Math.floor((now-last)/DAY);
    if(days>=14)msg='마지막 백업 후 '+days+'일 지났어요. 지금 백업해 두면 안전해요.';
  }
  var mb=g('backupReminderMsg');
  if(msg&&mb){mb.textContent=msg;el.style.display='flex';}else{el.style.display='none';}
}
function doBackupNow(){exportData();}
function snoozeBackupReminder(){try{lsSet('rs_backup_snooze',String(Date.now()+7*86400000),1);}catch(e){}var el=g('backupReminder');if(el)el.style.display='none';}
function markBackupDone(){try{lsSet('rs_last_backup',String(Date.now()),1);localStorage.removeItem('rs_backup_snooze');}catch(e){}var el=g('backupReminder');if(el)el.style.display='none';}
function _rsBuildPayload(){
  // ★ 백업 직전 강제 저장: saveSoon() 디바운스 대기 중인 입력(프로젝트 투자금 등)이
  //   rs7에 반영되기 전에 백업하면 최신 입력이 JSON에서 빠진다 — 반드시 먼저 flush.
  var _flushOk=true;
  try{_flushOk=save();}catch(e){_flushOk=false;}
  // 데이터(rs7) + 테마 + 폰트 + 표단위 + 일일기록(키 5종)을 함께 백업 (하위호환: __rsBackup 래퍼)
  var payload={
    __rsBackup:1,
    savedAt:new Date().toISOString(),
    data:localStorage.getItem("rs7")||"{}",
    theme:localStorage.getItem("rs_theme")||"",
    fontStep:localStorage.getItem("rs_fontstep")||"",
    extra:{}
  };
  RS_EXTRA_KEYS.forEach(function(k){var v=localStorage.getItem(k);if(v!=null)payload.extra[k]=v;});
  return {payload:payload,flushOk:_flushOk};
}
function exportData(){
  var _bp=_rsBuildPayload();
  var payload=_bp.payload,_flushOk=_bp.flushOk;
  // 백업에 실제 담긴 내용 집계 — 토스트로 즉시 검증 가능하게
  var _pc=0,_dc=0;
  try{_pc=(JSON.parse(payload.data).SP||[]).length;}catch(_e1){}
  try{var _da=JSON.parse(payload.extra.rs_daily||"[]");_dc=Array.isArray(_da)?_da.length:0;}catch(_e2){}
  const blob=new Blob([JSON.stringify(payload)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="richsister_backup_"+new Date().toISOString().slice(0,10)+".json";
  a.click();
  showToast(_flushOk?("✅ 백업 완료 — 프로젝트 "+_pc+"개 · 일일기록 "+_dc+"건 포함"):("⚠️ 저장에 실패한 상태로 백업했어요 (프로젝트 "+_pc+"개 · 일일기록 "+_dc+"건) — 방금 입력분이 빠졌을 수 있어요"));
  markBackupDone();
}
function _rsApplyPayload(parsed){
  if(parsed&&parsed.__rsBackup){
    // 새 형식: 데이터+테마+폰트
    localStorage.setItem("rs7",parsed.data||"{}");
    if(parsed.theme)localStorage.setItem("rs_theme",parsed.theme);
    if(parsed.fontStep!==""&&parsed.fontStep!=null)localStorage.setItem("rs_fontstep",parsed.fontStep);
    if(parsed.extra&&typeof parsed.extra==="object"){RS_EXTRA_KEYS.forEach(function(k){if(Object.prototype.hasOwnProperty.call(parsed.extra,k))localStorage.setItem(k,parsed.extra[k]);});}
  }else{
    // 옛 형식(rs7 데이터만) — 하위호환
    localStorage.setItem("rs7",JSON.stringify(parsed));
  }
  // ★ 언로드 직전 beforeunload → save()가 "빈 메모리"로 방금 불러온 rs7을 덮어쓰는 것을 차단.
  //   (이 한 줄이 없어서 불러오기가 통째로 무효화됐다 — 세션 43)
  _preventSave=true;
  try{clearTimeout(_saveSoonT);}catch(_){}
  location.reload();
}
function importData(){
  const inp=document.createElement("input");
  inp.type="file";inp.accept=".json";
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        var parsed=JSON.parse(ev.target.result); // 유효성 검사
        _rsApplyPayload(parsed);
      }catch(err){alert("유효하지 않은 백업 파일입니다.");}
    };
    r.readAsText(f);
  };
  inp.click();
}

// ── 구글 드라이브 저장/불러오기 (2단계) ─────────────────────
// jsdom에선 OAuth·fetch를 실행할 수 없으므로 모든 외부 호출을 이 객체 하나로 격리한다.
// 테스트는 이 객체를 통째로 mock으로 갈아끼운다.
var _driveApi={
  getToken:function(){
    return new Promise(function(resolve,reject){
      if(!window.google||!google.accounts||!google.accounts.oauth2){reject(new Error("구글 로그인 스크립트를 불러오지 못했어요."));return;}
      try{
        var _tc=google.accounts.oauth2.initTokenClient({
          client_id:DRIVE_CLIENT_ID,
          scope:"https://www.googleapis.com/auth/drive.file",
          callback:function(resp){
            if(resp&&resp.access_token)resolve(resp.access_token);
            else reject(new Error("로그인에 실패했어요."));
          }
        });
        _tc.requestAccessToken();
      }catch(e){reject(e);}
    });
  },
  upload:function(token,name,text){
    var _boundary="rsdrive"+Date.now();
    var _delim="\r\n--"+_boundary+"\r\n";
    var _close="\r\n--"+_boundary+"--";
    var _body=_delim+"Content-Type: application/json; charset=UTF-8\r\n\r\n"+JSON.stringify({name:name,mimeType:"application/json"})+
      _delim+"Content-Type: application/json\r\n\r\n"+text+_close;
    return fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",{
      method:"POST",
      headers:{"Authorization":"Bearer "+token,"Content-Type":"multipart/related; boundary="+_boundary},
      body:_body
    }).then(function(res){if(!res.ok)throw new Error("업로드 실패");return res.json();})
      .then(function(json){return {id:json.id,name:json.name};});
  },
  list:function(token){
    var _q=encodeURIComponent("name contains 'richsister_' and trashed=false");
    var _url="https://www.googleapis.com/drive/v3/files?q="+_q+"&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,modifiedTime)";
    return fetch(_url,{headers:{"Authorization":"Bearer "+token}})
      .then(function(res){if(!res.ok)throw new Error("목록 조회 실패");return res.json();})
      .then(function(json){return json.files||[];});
  },
  download:function(token,id){
    return fetch("https://www.googleapis.com/drive/v3/files/"+id+"?alt=media",{headers:{"Authorization":"Bearer "+token}})
      .then(function(res){if(!res.ok)throw new Error("다운로드 실패");return res.text();});
  }
};
function _driveAvailable(){
  return location.protocol!=="file:"&&DRIVE_CLIENT_ID!==""&&navigator.onLine!==false;
}
function _rsLoadGis(){
  return new Promise(function(resolve,reject){
    if(window.google&&google.accounts&&google.accounts.oauth2){resolve();return;}
    var s=document.createElement("script");
    s.src="https://accounts.google.com/gsi/client";
    s.onload=function(){resolve();};
    s.onerror=function(){reject(new Error("구글 로그인 스크립트를 불러오지 못했어요."));};
    document.head.appendChild(s);
  });
}
function driveSave(){
  _rsLoadGis().then(function(){
    return _driveApi.getToken();
  }).then(function(token){
    var _bp=_rsBuildPayload();
    var payload=_bp.payload,_flushOk=_bp.flushOk;
    var _pc=0,_dc=0;
    try{_pc=(JSON.parse(payload.data).SP||[]).length;}catch(_e1){}
    try{var _da=JSON.parse(payload.extra.rs_daily||"[]");_dc=Array.isArray(_da)?_da.length:0;}catch(_e2){}
    if(!_flushOk)showToast("⚠️ 저장에 실패한 상태로 드라이브에 올려요 — 방금 입력분이 빠졌을 수 있어요");
    var _d=new Date();var _pad=function(n){return (n<10?"0":"")+n;};
    var _fname="richsister_backup_"+_d.getFullYear()+"-"+_pad(_d.getMonth()+1)+"-"+_pad(_d.getDate())+"_"+_pad(_d.getHours())+_pad(_d.getMinutes())+".json";
    return _driveApi.upload(token,_fname,JSON.stringify(payload)).then(function(){
      showToast("☁️ 드라이브 저장 완료 — 프로젝트 "+_pc+"개 · 일일기록 "+_dc+"건");
      markBackupDone();
    });
  }).catch(function(e){
    showToast("☁️ 드라이브 저장 실패"+(e&&e.message?(" — "+e.message):""));
  });
}
function _driveLoadListHtml(files){
  if(!files||!files.length)return "";
  return files.map(function(f,i){
    var _t="";
    try{_t=new Date(f.modifiedTime).toLocaleString();}catch(_){_t=f.modifiedTime||"";}
    return '<div class="btn btn-ol" style="justify-content:flex-start;text-align:left;width:100%;margin-bottom:6px;white-space:normal" onclick="_driveLoadPick('+i+')"><div style="font-weight:700;word-break:keep-all">'+f.name+'</div><div style="font-size:11px;color:var(--gray)">'+_t+'</div></div>';
  }).join("");
}
var _driveLoadFiles=[];
var _driveLoadToken=null;
function driveLoad(){
  _rsLoadGis().then(function(){
    return _driveApi.getToken();
  }).then(function(token){
    _driveLoadToken=token;
    return _driveApi.list(token);
  }).then(function(files){
    if(!files.length){showToast("드라이브에 저장된 백업이 없어요");return;}
    _driveLoadFiles=files;
    var body=g("driveLoadBody");
    if(body)body.innerHTML=_driveLoadListHtml(files);
    var m=g("driveLoadMod");if(m)m.classList.add("open");
  }).catch(function(e){
    showToast("☁️ 드라이브 목록을 불러오지 못했어요"+(e&&e.message?(" — "+e.message):""));
  });
}
function _driveLoadPick(i){
  var f=_driveLoadFiles[i];if(!f)return;
  var m=g("driveLoadMod");if(m)m.classList.remove("open");
  rsConfirm(f.name+" 백업으로 되돌릴까요?\n지금 이 기기의 기록은 모두 이 백업 내용으로 바뀌어요.\n되돌릴 수 없어요.",function(){
    _driveRestoreFrom(f);
  });
}
function _driveRestoreFrom(f){
  var token=_driveLoadToken;
  var _bp=_rsBuildPayload();
  var _d=new Date();var _pad=function(n){return (n<10?"0":"")+n;};
  var _fname="richsister_autosave_before_restore_"+_d.getFullYear()+"-"+_pad(_d.getMonth()+1)+"-"+_pad(_d.getDate())+"_"+_pad(_d.getHours())+_pad(_d.getMinutes())+".json";
  _driveApi.upload(token,_fname,JSON.stringify(_bp.payload)).then(function(){
    // ★ 사전 자동 업로드 성공 후에만 다운로드·복원 진행 (실패 시 이 then 자체가 안 걸림 → _rsApplyPayload 미호출)
    return _driveApi.download(token,f.id).then(function(text){
      var parsed;
      try{parsed=JSON.parse(text);}catch(e){showToast("유효하지 않은 백업 파일입니다.");return;}
      if(!parsed||parsed.__rsBackup!==1){showToast("유효하지 않은 백업 파일입니다.");return;}
      _rsApplyPayload(parsed);
    },function(downloadErr){
      showToast("드라이브에서 백업을 받아오지 못했어요"+(downloadErr&&downloadErr.message?(" — "+downloadErr.message):""));
    });
  },function(uploadErr){
    showToast("현재 상태를 먼저 저장하지 못해 되돌리기를 멈췄어요"+(uploadErr&&uploadErr.message?(" — "+uploadErr.message):""));
  });
}

// v2.1 - 버전 업데이트


// ── debounce: 연속 입력 시 마지막 입력 후 500ms 뒤 실행 ────


// ── 가져오기 중복 감지 & 검토 ─────────────────────────────
function matchesCalcVals(crId,calcKey){
  if(!lastCalcRows.length)return false;
  var match=0,total=0;
  lastCalcRows.forEach(function(r){
    var imp=pcd(crId+"_"+r.y);
    if(!imp)return;
    total++;
    var calc=r[calcKey]||0;
    if(calc!==0&&Math.abs(imp-calc)/Math.abs(calc)<0.02)match++;
    else if(calc===0&&imp===0)match++;
  });
  return total>0&&match/total>0.8;
}
function detectAndRemoveDuplicates(log){
  if(!lastCalcRows.length)return;
  customRows=customRows.filter(function(cr){
    if(cr.id==="et_default")return true;
    var isDup=(matchesCalcVals(cr.id,"inv")||matchesCalcVals(cr.id,"pr")||matchesCalcVals(cr.id,"tot"));
    if(isDup){
      var backup={};
      Object.keys(customData).forEach(function(k){
        if(k.indexOf(cr.id+"_")===0){backup[k]=customData[k];delete customData[k];}
      });
      log.removed.push({id:cr.id,label:cr.label,data:backup});
      return false;
    }
    log.kept.push({id:cr.id,label:cr.label});
    return true;
  });
}
function showImportReview(){
  if(!lastImportLog)return;
  var log=lastImportLog,h="";
  if(log.std&&log.std.length){
    h+="<p style='font-size:13px;font-weight:700;color:var(--ac);margin:0 0 4px'>✅ 표준 행 ("+log.std.length+"개)</p>";
    log.std.forEach(function(s){h+="<div style='font-size:13px;color:var(--gray);padding:1px 0 1px 10px'>"+s+"</div>";});
  }
  if(log.removed&&log.removed.length){
    h+="<p style='font-size:13px;font-weight:700;color:#aaa;margin:8px 0 4px'>🗑 중복 제거됨 — 계산값과 일치 ("+log.removed.length+"개)</p>";
    log.removed.forEach(function(r,i){
      h+="<div style='display:flex;align-items:center;gap:6px;padding:2px 0 2px 10px'><input type='checkbox' id='rv"+i+"' style='accent-color:var(--ac)'><label for='rv"+i+"' style='font-size:13px;cursor:pointer'>"+r.label+" <span style='color:#ccc;text-decoration:line-through'>계산 중복</span></label></div>";
    });
    h+="<p style='font-size:13px;color:var(--gray);margin:6px 0 0 10px'>체크하면 커스텀 행으로 되살릴 수 있어요</p>";
  }
  var userKept=(log.kept||[]).filter(function(k){return k.id!=="et_default";});
  if(userKept.length){
    h+="<p style='font-size:13px;font-weight:700;color:var(--ac);margin:8px 0 4px'>📋 커스텀 행 유지 ("+userKept.length+"개)</p>";
    userKept.forEach(function(k){h+="<div style='font-size:13px;padding:1px 0 1px 10px'>"+k.label+"</div>";});
  }
  g("importRevBody").innerHTML=h||"<p style='color:var(--gray);font-size:13px'>가져온 데이터가 없습니다.</p>";
  g("importRevMod").classList.add("open");
}
function applyImportReview(){
  if(!lastImportLog||!lastImportLog.removed)return;
  lastImportLog.removed.forEach(function(r,i){
    var cb=document.getElementById("rv"+i);
    if(cb&&cb.checked){
      customRows.push({id:r.id,label:r.label});
      Object.keys(r.data).forEach(function(k){customData[k]=r.data[k];});
    }
  });
  g("importRevMod").classList.remove("open");
  recalc();save();
}

var _crId=0;
/* 📋 장기 표 행 순서 — 기본행 6개 + 커스텀 행(사진 행 et_default 제외, 항상 맨 아래 고정).
   기본값은 커스텀 행을 L_invest 위에 두어 기존 사용자의 숫자가 바뀌지 않게 한다. */
const LG_BASE=["L_asset","L_sv","L_invest","L_rate","L_profit","L_total"];
function lgCrIds(){return customRows.filter(function(r){return r.id!=='et_default';}).map(function(r){return r.id;});}
function getLongOrder(){
  var crIds=lgCrIds();
  var def=LG_BASE.slice(0,2).concat(crIds).concat(LG_BASE.slice(2));   // 자산(A)·목표 저축액(B) 다음에 커스텀 → 그다음 투자금
  if(!lgRowOrder||lgRowOrder.length===0)return def;
  var ex=lgRowOrder.slice();
  // 없는 기본행은 앞에, 새로 만든 커스텀 행은 투자금 바로 위에(=포함) 끼운다
  LG_BASE.forEach(function(id){if(ex.indexOf(id)<0)ex.unshift(id);});
  crIds.forEach(function(id){if(ex.indexOf(id)<0){var iv=ex.indexOf("L_invest");ex.splice(iv<0?ex.length:iv,0,id);}});
  var valid=LG_BASE.concat(crIds);
  return ex.filter(function(id){return valid.indexOf(id)>=0;});
}
/* 투자금(A+B)보다 위에 있는 커스텀 행 = 15% 복리에 포함 */
function lgInclSet(){
  var order=getLongOrder(),iv=order.indexOf("L_invest"),out={};
  order.forEach(function(id,i){if(LG_BASE.indexOf(id)<0&&iv>=0&&i<iv)out[id]=1;});
  return out;
}
function moveLongRow(id,dir){
  var order=getLongOrder();
  var idx=order.indexOf(id);if(idx<0)return;
  var ni=idx+dir;if(ni<0||ni>=order.length)return;
  var tmp=order[idx];order[idx]=order[ni];order[ni]=tmp;
  lgRowOrder=order;recalc();save();
}
function moveRow(id,dir){
  var idx=customRows.findIndex(function(r){return r.id===id;});
  if(idx<0)return;
  var newIdx=idx+dir;
  if(newIdx<0||newIdx>=customRows.length)return;
  var tmp=customRows[idx];customRows[idx]=customRows[newIdx];customRows[newIdx]=tmp;
  recalc();save();
}
var _addRowTab='long';
/* 📋 넣기/빼기 안내문 — 탭마다 기준 행 이름이 다르다(장기=투자금, 중기=합계, 단기=월 합계). §2.37 세 탭 이식(세션 66) */
var ADD_ROW_INCL_TXT={
  long:{q:'이 항목을 투자금에 넣을까요?',inD:'수익률만큼 같이 불어나요',inH:'주식·펀드처럼 굴릴 돈',outD:'수익률이 안 붙고 총 자산 합계에만 더해져요',outH:'예적금·보증금처럼 따로 두는 돈',foot:'나중에 표에서 <b>▲▼</b>로 「투자금(A+B)」 줄 위아래로 옮기면 언제든 바꿀 수 있어요.'},
  mid:{q:'이 항목을 합계에 넣을까요?',inD:'수익률만큼 같이 불어나요',inH:'주식·펀드처럼 굴릴 돈',outD:'수익률이 안 붙고 총 합계에만 더해져요',outH:'예적금·보증금처럼 따로 두는 돈',foot:'나중에 표에서 <b>▲▼</b>로 「합계」 줄 위아래로 옮기면 언제든 바꿀 수 있어요.'},
  short:{q:'이 항목을 월 합계에 넣을까요?',inD:'그 달 합계에 더해져요',inH:'',outD:'월 합계에는 안 들어가고 표에만 남아요',outH:'',foot:'나중에 표에서 <b>▲▼</b>로 「합계」 줄 위아래로 옮기면 언제든 바꿀 수 있어요.'}
};
function addCustomRow(tab){
  _addRowTab=tab||'long';
  g('addRowInput').value='';
  var box=g('addRowIncl');
  if(box){
    var t=ADD_ROW_INCL_TXT[_addRowTab]||ADD_ROW_INCL_TXT.long;
    box.style.display='';
    var qEl=box.querySelector('.arq');if(qEl)qEl.textContent=t.q;
    var inD=box.querySelector('.arInD');if(inD)inD.textContent=t.inD;
    var inH=box.querySelector('.arInH');if(inH){inH.textContent=t.inH;inH.style.display=t.inH?'':'none';}
    var outD=box.querySelector('.arOutD');if(outD)outD.textContent=t.outD;
    var outH=box.querySelector('.arOutH');if(outH){outH.textContent=t.outH;outH.style.display=t.outH?'':'none';}
    var foot=box.querySelector('.arFoot');if(foot)foot.innerHTML=t.foot;
    var r=box.querySelector('input[value="in"]');if(r)r.checked=true;
  }
  g('addRowMod').classList.add('open');
}
function getShortOrder(){
  var crIds=customRowsShort.map(function(r){return r.id;});
  if(shCustomOnly){
    var base2=["proj"];
    crIds.forEach(function(id){base2.push(id);});
    base2.push("total","pct");
    if(shRowOrder&&shRowOrder.length>0){
      var valid=["proj","total","pct"].concat(crIds);
      var ex=shRowOrder.filter(function(id){return valid.indexOf(id)>=0;});
      crIds.forEach(function(id){if(ex.indexOf(id)<0)ex.splice(ex.indexOf("total"),0,id);});
      return ex;
    }
    return base2;
  }
  var base=["savings","income","proj","target","total","pct"].filter(function(id){return ["savings","income","target"].indexOf(id)<0||shHiddenBase.indexOf(id)<0;});
  if(!shRowOrder||shRowOrder.length===0)return base.concat(crIds);
  var ex=shRowOrder.slice().filter(function(id){return ["savings","income","target"].indexOf(id)<0||shHiddenBase.indexOf(id)<0;});
  crIds.forEach(function(id){if(ex.indexOf(id)<0)ex.push(id);});
  return ex;
}

function moveShortRow(id,dir){
  var order=getShortOrder();
  var idx=order.indexOf(id);if(idx<0)return;
  var ni=idx+dir;if(ni<0||ni>=order.length)return;
  var tmp=order[idx];order[idx]=order[ni];order[ni]=tmp;
  shRowOrder=order;
  // 📋 §2.37 단기 — total 기준 위/아래가 월 총계 포함 여부를 정한다(커스텀 행만 해당)
  var cr=customRowsShort.find(function(x){return x.id===id;});
  if(cr){
    var ti=order.indexOf('total');
    if(ti>=0){
      var newIdx=order.indexOf(id);
      if(newIdx<ti){if(shExclIds.indexOf(id)>=0)shExclIds=shExclIds.filter(function(x){return x!==id;});}
      else{if(shExclIds.indexOf(id)<0)shExclIds.push(id);}
    }
  }
  renderShort();save();
}
function loadShortData(rows){
  if(!rows||rows.length<2){showToast("데이터가 없어요");return false;}
  var yr=parseInt(g("shYear").value)||new Date().getFullYear();
  var SKIP_PAT=[/합계/,/달성률/,/^계$/,/^\s*$/];
  var PROJ_PAT=[/프로젝트/,/project/i];
  // 데이터 초기화
  customRowsShort.forEach(function(cr){
    Object.keys(customData).forEach(function(k){if(k.indexOf(cr.id+"_sh_")===0)delete customData[k];});
  });
  customRowsShort=[];
  var newOrder=["proj"];
  // 첫 행이 헤더(숫자/월 포함)인지 확인
  var dataStart=0;
  var firstRow=rows[0];
  var hasMonthHdr=firstRow&&firstRow.some(function(v){
    var s=String(v).replace(/[월\s]/g,"").trim();return parseInt(s)>=1&&parseInt(s)<=12;
  });
  if(hasMonthHdr)dataStart=1;
  // 데이터 파싱: col0=라벨, col1~col12=1월~12월 (위치 기반)
  for(var ri=dataStart;ri<rows.length;ri++){
    var row=rows[ri];
    var label=String(row[0]||"").trim();
    if(!label||SKIP_PAT.some(function(p){return p.test(label);}))continue;
    if(PROJ_PAT.some(function(p){return p.test(label);}))continue;
    var cr={id:"cr"+(++_crId)+"t"+Date.now()+"r"+ri,label:label};
    customRowsShort.push(cr);
    newOrder.push(cr.id);
    for(var mi=0;mi<12;mi++){
      var v=row[mi+1];
      var n=parseFloat(String(v||0).replace(/,/g,""));
      if(!isNaN(n)&&n!==0)customData[cr.id+"_sh_"+yr+"_"+mi]=n;
    }
  }
  newOrder.push("total","pct");
  shRowOrder=newOrder;shCustomOnly=true;
  renderShort();save();
  showToast("단기 불러오기 완료 ("+customRowsShort.length+"개 항목)");
  return true;
}

function deleteCustomRowMid(id){
  rsConfirm("삭제할까요?",function(){
  customRowsMid=customRowsMid.filter(function(r){return r.id!==id;});
  Object.keys(customData).forEach(function(k){if(k.indexOf(id+"_md_")===0)delete customData[k];});
  renderMid();save();
  });
}
function deleteCustomRowShort(id){
  rsConfirm("삭제할까요?",function(){
  customRowsShort=customRowsShort.filter(function(r){return r.id!==id;});
  Object.keys(customData).forEach(function(k){if(k.indexOf(id+"_sh_")===0)delete customData[k];});
  renderShort();save();
  });
}


function rlTdMid(key,label,moveId){
  return rlTdMove(key,label,moveId,"moveMidRow",false,"");
}

function getMidOrder(){
  var base=["M_asset","M_sv","M_invest","M_rate","M_total"];
  var crIds=customRowsMid.map(function(r){return r.id;});
  if(!mdRowOrder||mdRowOrder.length===0)return base.concat(crIds);
  var ex=mdRowOrder.slice();
  // 없는 기본행 앞에 추가, 없는 커스텀행 뒤에 추가
  base.forEach(function(id){if(ex.indexOf(id)<0)ex.unshift(id);});
  crIds.forEach(function(id){if(ex.indexOf(id)<0)ex.push(id);});
  // 더 이상 존재하지 않는 행 제거
  var valid=base.concat(crIds);
  return ex.filter(function(id){return valid.indexOf(id)>=0;});
}
function moveMidRow(id,dir){
  var order=getMidOrder();
  var idx=order.indexOf(id);if(idx<0)return;
  var ni=idx+dir;if(ni<0||ni>=order.length)return;
  var tmp=order[idx];order[idx]=order[ni];order[ni]=tmp;
  mdRowOrder=order;renderMid();save();
}
// rlTdM: rlTd에 이동 버튼 추가
function rlTdMove(key,label,moveId,moveFn,showDel,delFn){
  var name=rowLabels[key]||label;
  var upBtn="<button onclick='"+moveFn+"(\""+moveId+"\", -1)' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1'>▲</button>";
  var dnBtn="<button onclick='"+moveFn+"(\""+moveId+"\", 1)' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1'>▼</button>";
  var delBtn=showDel?"<button onclick='"+delFn+"' style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0'>✕</button>":"";
  return "<td class='rl' style='padding:4px 6px;vertical-align:middle;cursor:pointer' ondblclick='editRowLabel(\""+key+"\",\""+String(name).replace(/\n/g," ")+"\")' title='더블클릭: 이름 수정'>"+
    "<div style='display:flex;align-items:center;gap:2px'>"+
    "<div style='display:flex;flex-direction:column;gap:1px'>"+upBtn+dnBtn+"</div>"+
    "<span style='font-size:13px;flex:1;white-space:normal;word-break:break-word'>"+lblHtml(name)+"</span>"+
    delBtn+
    "</div></td>";
}
function rlTdM(key,label,moveId){
  return rlTdMove(key,label,moveId,"moveShortRow",false,"");
}
function rlTdMBase(key,label,moveId){
  return rlTdMove(key,label,moveId,"moveShortRow",true,"deleteBaseRowShort(\""+moveId+"\")");
}
function deleteBaseRowShort(id){
  rsConfirm("표에서 숨길까요? 입력했던 값은 지워지지 않고, 나중에 다시 표시할 수 있어요.",function(){
    if(shHiddenBase.indexOf(id)<0)shHiddenBase.push(id);
    renderShort();save();
  });
}
function restoreBaseRowShort(id){
  shHiddenBase=shHiddenBase.filter(function(k){return k!==id;});
  renderShort();save();
}
var SH_BASE_INFO={savings:{key:"S_salary",label:"급여"},income:{key:"S_income",label:"기타소득"},target:{key:"S_target",label:"목표액"}};
function renderShHiddenSet(){
  var box=g("shHiddenSet");var list=g("shHiddenSetList");if(!box||!list)return;
  var ids=(shHiddenBase||[]).filter(function(id){return !!SH_BASE_INFO[id];});
  if(!ids.length){box.style.display="none";list.innerHTML="";return;}
  box.style.display="block";
  list.innerHTML=ids.map(function(id){
    var lbl=rowLabels[SH_BASE_INFO[id].key]||SH_BASE_INFO[id].label;
    return "<button type='button' onclick='restoreBaseRowShort(\""+id+"\")' style='border:1px solid var(--border);background:#fff;border-radius:99px;padding:4px 12px;font-size:13px;color:var(--ac);cursor:pointer;white-space:nowrap'>+ "+dlEsc(lbl)+" 다시 표시</button>";
  }).join("");
}



/* 📋 중기 넣기/빼기(§2.37 이식) — 「빼기」는 기본 위치(getMidOrder 맨 끝=제외)를 그대로 두고, 「넣기」만 M_invest 앞으로 옮긴다.
   ★ 기본값이 곧 하위호환: mdRowOrder가 비어 있던 기존 사용자는 지금도 커스텀 행이 전부 M_invest 뒤(제외)에 있으므로,
   이 함수가 손대지 않는 기존 저장 데이터의 위치·숫자는 1도 바뀌지 않는다(새로 추가하는 행에만 적용). */
function mdSetRowIncl(id,incl){
  var ord=getMidOrder(),i2=ord.indexOf(id);
  if(i2>=0)ord.splice(i2,1);
  var iv=ord.indexOf('M_invest');
  if(incl)ord.splice(iv<0?0:iv,0,id); else ord.push(id);
  mdRowOrder=ord;
}
/* 📋 단기 넣기/빼기(§2.37 신설) — total 기준 위/아래. shExclIds에 있으면 제외.
   ★ 기본값이 곧 하위호환: shExclIds가 비어 있으면 전부 포함 = 기존 동작(무조건 합계에 들어감) 그대로. */
function shSetRowIncl(id,incl){
  var ord=getShortOrder(),i2=ord.indexOf(id);
  if(i2>=0)ord.splice(i2,1);
  var ti=ord.indexOf('total');
  if(incl){ord.splice(ti<0?ord.length:ti,0,id);shExclIds=shExclIds.filter(function(x){return x!==id;});}
  else{ord.splice(ti<0?ord.length:ti+1,0,id);if(shExclIds.indexOf(id)<0)shExclIds.push(id);}
  shRowOrder=ord;
}
function confirmAddRow(){
  var lbl=g('addRowInput').value.trim();
  if(!lbl)return;
  var row={id:'cr'+(++_crId)+'t'+Date.now(),label:lbl};
  var sel=document.querySelector('#addRowIncl input[name="addRowInclR"]:checked');
  var incl=!(sel&&sel.value==='out');
  if(_addRowTab==='mid'){
    customRowsMid.push(row);
    mdSetRowIncl(row.id,incl);
    renderMid();
  }else if(_addRowTab==='short'){
    customRowsShort.push(row);
    shSetRowIncl(row.id,incl);
    renderShort();
  }else{
    customRows.push(row);
    // 「빼기」를 고르면 투자금(A+B) 아래에 놓는다 — 나중에 ▲▼로 언제든 바꾼다
    if(!incl){
      var ord=getLongOrder(),i2=ord.indexOf(row.id);
      if(i2>=0)ord.splice(i2,1);
      var iv=ord.indexOf('L_invest');
      ord.splice(iv<0?ord.length:iv+1,0,row.id);
      lgRowOrder=ord;
    }
    recalc();
  }
  save();
  closeM('addRowMod');
}
function deleteCustomRow(id){
  rsConfirm("삭제할까요?",function(){
  customRows=customRows.filter(function(r){return r.id!==id;});
  Object.keys(customData).forEach(function(k){if(k.indexOf(id+"_")===0)delete customData[k];});
  recalc();save();
  });
}
// renameSectionName() 제거됨



// ── 구글시트 불러오기 ─────────────────────────────────────
// gviz JSON 응답 → 멀티블록 2D rows 변환
function convertGvizJsonToRows(resp){
  var cols=resp.table.cols, rows=resp.table.rows;
  var yearCols=[], firstAge=null;
  for(var i=1;i<cols.length;i++){
    var lbl=cols[i].label||"";
    var yr=parseInt(lbl);
    if(yr>=2020&&yr<=2065){
      yearCols.push({ci:i,year:yr});
      if(firstAge===null){var am=lbl.match(/(\d+)세/);if(am)firstAge=parseInt(am[1]);}
    }
  }
  if(!yearCols.length)return null;
  var result=[], blockOffset=0;
  function makeYearRow(off){
    var r=[""];
    yearCols.forEach(function(yc){r.push(String(yc.year+off));});
    return r;
  }
  result.push(makeYearRow(0));
  rows.forEach(function(row){
    var c=row.c||[];
    var lbl=c[0]&&c[0].v!==null?String(c[0].v||"").trim():"";
    var allEmpty=yearCols.every(function(yc){return !c[yc.ci]||c[yc.ci].v===null;});
    if(lbl==="연도"&&allEmpty){blockOffset+=yearCols.length;result.push(makeYearRow(blockOffset));return;}
    if(lbl==="나이"&&allEmpty)return;
    if(!lbl&&allEmpty)return;
    if(isCalcRow(lbl))return;
    var dr=[lbl];
    yearCols.forEach(function(yc){
      var cell=c[yc.ci];
      dr.push(!cell||cell.v===null?"":String(cell.v));
    });
    result.push(dr);
  });
  return{rows:result,startAge:firstAge};
}

function extractSheetId(url){
  var m=url.match(/\/spreadsheets\/d\/([a-zA-Z0-9\-_]+)/);
  return m?m[1]:null;
}

// gviz CSV rows (XLSX 파싱 결과) → 멀티블록 재구성
function convertGvizCsvToRows(rows){
  if(!rows||!rows.length)return null;
  // 연도가 있는 행 탐색 (rows[0]뿐 아니라 전체 스캔)
  var yearRow=-1, yearCols=[], firstAge=null;
  for(var ri=0;ri<Math.min(rows.length,10);ri++){
    var row=rows[ri]||[];
    var yCells=[];
    for(var ci=1;ci<row.length;ci++){
      var lbl=String(row[ci]||"").trim();
      var yr=parseInt(lbl);
      if(yr>=2020&&yr<=2065)yCells.push({ci:ci,year:yr});
    }
    if(yCells.length>=2){
      yearRow=ri;
      yearCols=yCells;
      // 나이 추출
      for(var k=0;k<yCells.length;k++){
        var lbl2=String(rows[ri][yCells[k].ci]||"");
        var am=lbl2.match(/(\d+)세/);
        if(am){firstAge=parseInt(am[1]);break;}
      }
      break;
    }
  }
  if(!yearCols.length){
    // 진단: 실제 받은 rows 첫 3행 출력
    var diag="rows[0]="+JSON.stringify((rows[0]||[]).slice(0,5))
      +" | rows[1]="+JSON.stringify((rows[1]||[]).slice(0,3))
      +" | rows[2]="+JSON.stringify((rows[2]||[]).slice(0,3));
    alert("연도 감지 실패. CSV 내용:\n"+diag);
    return null;
  }
  var result=[];
  var blockOffset=0;
  function makeYearRow(off){
    var r=[""];
    yearCols.forEach(function(yc){r.push(String(yc.year+off));});
    return r;
  }
  result.push(makeYearRow(0));
  for(var ri=yearRow+1;ri<rows.length;ri++){
    var row=rows[ri]||[];
    var lbl=String(row[0]||"").trim();
    var allEmpty=yearCols.every(function(yc){return !String(row[yc.ci]||"").trim();});
    if(lbl==="연도"&&allEmpty){blockOffset+=yearCols.length;result.push(makeYearRow(blockOffset));continue;}
    if(lbl==="나이"&&allEmpty)continue;
    if(!lbl&&allEmpty)continue;
    if(isCalcRow(lbl))continue;
    var dr=[lbl];
    yearCols.forEach(function(yc){
      var val=row[yc.ci];
      dr.push(val===undefined||val===null?"":String(val));
    });
    result.push(dr);
  }
  return{rows:result,startAge:firstAge};
}

function fetchGvizTextRows(sid,gid,onDone){
  // file:// 환경에서 fetch()는 CORS 차단됨 — CSV 파일 끌어다 놓기로 이벤트 병합
  onDone(false);
}

function mergeEventCsv(rows){
  var result=convertGvizCsvToRows(rows);
  if(!result){loadSheetData(rows);return;} // 구조 인식 안되면 전체 로드
  var stored=0;
  result.rows.forEach(function(row){
    var lbl=String(row[0]||"").trim();
    if(!lbl||isCalcRow(lbl)||isStdRow(lbl))return;
    var target=null;
    if(isEventLbl(lbl)){
      if(!customRows.some(function(r){return r.id==="et_default";}))
        customRows.unshift({id:"et_default",label:"이벤트/목표"});
      target="et_default";
    } else {
      for(var i=0;i<customRows.length;i++){
        if(customRows[i].label===lbl){target=customRows[i].id;break;}
      }
      if(!target){
        var newId="cr_csv_"+Date.now()+"_"+stored;
        customRows.push({id:newId,label:lbl});
        target=newId;
      }
    }
    var yearRow=result.rows[0]||[];
    for(var ci=1;ci<row.length;ci++){
      var val=String(row[ci]||"").trim();
      if(!val||/^-?[\d,\s\.]+$/.test(val))continue;
      var yr=parseInt(yearRow[ci]||"");
      if(yr>=2020&&yr<=2065){customData[target+"_"+yr]=val;stored++;}
    }
  });
  if(stored>0){
    showToast("✅ 이벤트/텍스트 "+stored+"개 병합됨");
  } else {
    showToast("⚠️ 텍스트 없음 — 숫자 데이터 유지");
  }
  recalc();save();
  g("uploadZone").innerHTML="<span style='font-size:22px'>✅</span><div class='uz-text'><strong>이벤트 병합 완료 ("+stored+"개)</strong></div>";
}

function initDragDrop(){
  // 문서 전체에서 drag 가로채기 (어디에 끌어다 놔도 파일 인식)
  function onDragOver(e){
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect="copy";
    var uz=g("uploadZone");
    if(uz)uz.classList.add("drag-over");
  }
  function onDragLeave(e){
    e.preventDefault();
    var uz=g("uploadZone");
    if(uz)uz.classList.remove("drag-over");
  }
  function onDrop(e){
    e.preventDefault();
    e.stopPropagation();
    var uz=g("uploadZone");
    if(uz)uz.classList.remove("drag-over");
    var files=e.dataTransfer.files;
    if(!files||!files.length)return;
    var f=files[0];
    var name=(f.name||"").toLowerCase();
    if(name.endsWith(".xlsx")||name.endsWith(".xls")||name.endsWith(".csv")){
      handleExcel({files:[f]});
    }
  }
  // 기존 리스너 제거 후 재등록 (중복 방지)
  document.removeEventListener("dragover",onDragOver);
  document.removeEventListener("dragleave",onDragLeave);
  document.removeEventListener("drop",onDrop);
  document.addEventListener("dragover",onDragOver);
  document.addEventListener("dragleave",onDragLeave);
  document.addEventListener("drop",onDrop);
}

function bulkSetRate(tab){
  // tab: 'long'(장기/YR) 또는 'mid'(중기/mdYR)
  var isMid=(tab==="mid");
  var sy=parseInt(g("sY").value)||2026;
  var per=parseInt(g("period").value)||30;
  var fromId=isMid?"bulkMFrom":"bulkFrom";
  var toId=isMid?"bulkMTo":"bulkTo";
  var rateId=isMid?"bulkMRate":"bulkRate";
  var from=parseInt(g(fromId).value)||sy;
  var to=parseInt(g(toId).value)||(sy+per-1);
  var rate=parseFloat(g(rateId).value);
  if(isNaN(rate)||rate<=0||rate>100){showToast("수익률을 1~100 사이로 입력하세요");return;}
  if(from>to){showToast("시작 연도가 종료 연도보다 큽니다");return;}
  var count=0;
  if(isMid){
    for(var y=from;y<=to;y++){mdYR[y]=rate;count++;}
    renderMid();
  } else {
    for(var y=from;y<=to;y++){YR[y]=rate;count++;}
    recalc();
  }
  save();
  showToast("✅ "+from+"~"+to+"년 "+count+"개 → "+rate+"%");
}

function importFromSheet(inputId){
  var url=(g(inputId)?g(inputId).value:"").trim();
  if(!url){alert("구글시트 URL을 입력해주세요.");return;}
  fetchGoogleSheet(url);
}

// 행 이름 셀 — 더블클릭으로 수정 가능
function rlTd(key,def){
  var name=rowLabels[key]||def;
  return "<td class='rl' ondblclick='editRowLabel(\""+key+"\",\""+def+"\")'  title='더블클릭: 이름 수정'>"+lblHtml(name)+"</td>";
}
var _editLabelKey=null,_editLabelDef=null;
function lblHtml(s){
  // 항목명: HTML 이스케이프 후 줄바꿈(\n)을 <br>로
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
}
function editRowLabel(key,def){
  _editLabelKey=key;_editLabelDef=def;
  // 커스텀 행이면 원본 label(줄바꿈 포함)을 직접 찾아 표시
  var cr=null;
  [customRows,customRowsMid,customRowsShort].forEach(function(arr){
    if(!arr)return;
    for(var i=0;i<arr.length;i++){if(arr[i].id===key){cr=arr[i];break;}}
  });
  var _ab=(typeof abNameTarget==='function')?abNameTarget(key):null;
  g("editLabelInput").value = _ab ? (_ab.get()||"") : (cr ? (cr.label||"") : (rowLabels[key]||def));
  g("editLabelMod").classList.add("open");
  setTimeout(function(){var el=g("editLabelInput");if(el){el.focus();el.style.height='auto';el.style.height=Math.max(el.scrollHeight,56)+'px';}},50);
}
function confirmEditLabel(){
  var v=g("editLabelInput").value.trim();
  // 커스텀 행(id)이면 3개 배열에서 찾아 label 수정
  var cr=null;
  [customRows,customRowsMid,customRowsShort].forEach(function(arr){
    if(!arr)return;
    for(var i=0;i<arr.length;i++){if(arr[i].id===_editLabelKey){cr=arr[i];break;}}
  });
  var _ab=(typeof abNameTarget==='function')?abNameTarget(_editLabelKey):null;
  if(_ab){
    if(v)_ab.set(v);
  }else if(cr){
    if(v)cr.label=v;
  }else{
    if(!v||v===_editLabelDef){delete rowLabels[_editLabelKey];}
    else{rowLabels[_editLabelKey]=v;}
  }
  recalc();renderShort();renderMid();save();
  closeM("editLabelMod");
}

var _rsCb=null;
/* ★ §§ 는 툴팁·확인창 공통의 「줄 나눔」 표식이다(§2.13). 확인창이 이걸 그대로 찍어 화면에 §§가 보이던 것을 고쳤다(세션 65). */
function rsSplitMsg(el,msg){
  if(!el)return;
  el.textContent='';
  String(msg==null?'':msg).split('§§').forEach(function(part,i){
    if(i>0){el.appendChild(document.createElement('br'));el.appendChild(document.createElement('br'));}
    el.appendChild(document.createTextNode(part));
  });
}
function rsConfirm(msg,onYes){_rsCb=(typeof onYes==='function')?onYes:null;var m=g('rsConfirmMsg');if(m)rsSplitMsg(m,msg);var d=g('rsConfirmMod');if(d){d.classList.add('open');}else{if(_rsCb){var cb=_rsCb;_rsCb=null;cb();}}}
function rsConfirmYes(){closeM('rsConfirmMod');var cb=_rsCb;_rsCb=null;if(cb)cb();}
/* ── 앱 내 입력 모달 (★ prompt()는 모바일에서 뜨지 않아 금지 — 정본 §2.10) ── */
var _rsPromptCb=null;
function _rsPromptOpen(title,desc,bodyHtml,cb){
  _rsPromptCb=(typeof cb==='function')?cb:null;
  var t=g('rsPromptTitle');if(t)t.textContent=title||'입력';
  var d=g('rsPromptDesc');if(d){if(desc){rsSplitMsg(d,desc);d.style.display='';}else{d.style.display='none';}}
  var b=g('rsPromptBody');if(b)b.innerHTML=bodyHtml;
  var m=g('rsPromptMod');if(!m)return;
  m.classList.add('open');
  setTimeout(function(){var i=g('rsPromptInput');if(i){try{i.focus();if(i.select)i.select();}catch(e){}}},30);
}
function rsPrompt(title,opt,cb){
  opt=opt||{};
  var html='<input id="rsPromptInput" type="text" value="'+dlEsc(String(opt.value||''))+'" placeholder="'+dlEsc(String(opt.placeholder||''))+'" style="width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box" onkeydown="if(event.key===\'Enter\'){event.preventDefault();rsPromptOk();}">';
  _rsPromptOpen(title,opt.desc||'',html,cb);
}
function rsPromptSelect(title,options,cb,opt){
  opt=opt||{};
  var html='<select id="rsPromptInput" style="width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box">';
  (options||[]).forEach(function(o){html+='<option value="'+dlEsc(String(o))+'">'+dlEsc(String(o))+'</option>';});
  html+='</select>';
  _rsPromptOpen(title,opt.desc||'',html,cb);
}
function rsPromptTextarea(title,opt,cb){
  opt=opt||{};
  var html='<textarea id="rsPromptInput" rows="3" placeholder="'+dlEsc(String(opt.placeholder||''))+'" style="width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;font-size:15px;font-family:inherit;box-sizing:border-box;resize:vertical">'+dlEsc(String(opt.value||''))+'</textarea>';
  _rsPromptOpen(title,opt.desc||'',html,cb);
}
/* 로드맵 셀 메모 — 엑셀 셀 노트처럼, 커스텀 행의 한 칸(연도·월)에 계산과 무관한 메모를 남긴다.
   구조: td는 편집 대상이 아니고(position:relative만), 그 안의 span이 기존 contenteditable 칸 그대로 담당,
   메모 점(cellNoteDot)은 그 span의 형제로 얹어서 contenteditable 안에 안 섞이게 한다(글자 지워짐 방지). */
function cellNoteDot(key,openFnName){
  var has=!!(customNotes&&customNotes[key]);
  var tip=has?('메모: '+String(customNotes[key])):'메모 추가';
  return "<span class='cell-note-dot"+(has?" has-note":"")+"' onclick='event.stopPropagation();"+openFnName+"("+jsArg(key)+")' title='"+dlEsc(tip)+"'></span>";
}
function _openCellNoteCore(key,renderFn){
  rsPromptTextarea('셀 메모',{value:(customNotes&&customNotes[key])||'',placeholder:'예) 아파트 3억 + 사업장 1억',desc:'이 칸의 숫자에 대한 메모예요. 계산에는 반영되지 않아요.'},function(v){
    v=(v||'').trim();
    if(v)customNotes[key]=v;else delete customNotes[key];
    save();
    try{renderFn();}catch(e){}
  });
}
function openCellNoteLong(key){_openCellNoteCore(key,recalc);}
function openCellNoteMid(key){_openCellNoteCore(key,renderMid);}
function openCellNoteShort(key){_openCellNoteCore(key,renderShort);}
function rsPromptOk(){
  var i=g('rsPromptInput');var v=i?i.value:'';
  closeM('rsPromptMod');
  var cb=_rsPromptCb;_rsPromptCb=null;
  if(cb)cb(v);
}
function clearMonthlyCore(){document.querySelectorAll('.qa').forEach(function(el){el.value='';});}
function clearMonthly(){rsConfirm('이달 입력 내용을 전부 비울까요?',function(){clearMonthlyCore();showToast('입력 내용을 비웠어요');});}

// 이미지 배열 정규화 — 구버전 string → [{src,w}] 자동 변환
function getImgs(y){
  var v=EI[y];
  if(!v)return [];
  if(typeof v==='string')return [{src:v,w:120}];
  return v;
}
function resizeImg(dataUrl,maxW,cb,q){
  var img=new Image();
  img.onload=function(){
    var w=img.width,h=img.height;
    if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
    var c=document.createElement("canvas");c.width=w;c.height=h;
    var ctx=c.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
    try{cb(c.toDataURL("image/jpeg",(q>0?q:0.82)));}catch(e){cb(dataUrl);}  // 변환 실패 시 원본
  };
  img.onerror=function(){cb(dataUrl);};
  img.src=dataUrl;
}
/* ── 저장공간 모달 ─────────────────────────────────────── */
function openStorageMod(){renderStorageMod();var m=g('storageMod');if(m)m.classList.add('open');if(typeof closeHeaderMenu==='function')closeHeaderMenu();}
function renderStorageMod(){
  var box=g('storageBody');if(!box)return;
  var used=lsBytes(),pct=lsPct(),im=imgStats();
  var col=(pct>=85)?'#d9534f':((pct>=70)?'#c08a3e':'var(--ac)');
  var pf=imgProfile();
  var h='';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px"><span style="font-size:13px;color:var(--gray);white-space:nowrap">사용 중</span><span style="font-size:15px;font-weight:700;color:'+col+';white-space:nowrap">'+pct+'% <span style="font-size:13px;font-weight:400;color:var(--gray)">('+fmtKB(used)+' / 5MB)</span></span></div>';
  h+='<div style="height:10px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:12px"><div style="height:100%;width:'+Math.max(2,pct)+'%;background:'+col+';border-radius:99px"></div></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:13px;color:#333;padding:7px 2px;border-top:1px solid var(--tbl-border)"><span style="white-space:nowrap">📷 사진</span><span style="white-space:nowrap"><b>'+im.count+'장</b> · '+fmtKB(im.bytes)+' <span style="color:var(--gray)">(전체의 '+(used?Math.round(im.bytes/used*100):0)+'%)</span></span></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:13px;color:#333;padding:7px 2px;border-top:1px solid var(--tbl-border)"><span style="white-space:nowrap">📝 그 밖의 기록</span><span style="white-space:nowrap">'+fmtKB(Math.max(0,used-im.bytes))+'</span></div>';
  h+='<div style="font-size:13px;color:var(--gray);line-height:1.6;margin-top:12px;word-break:keep-all">브라우저가 주는 저장 공간은 <b>약 5MB로 정해져 있어 늘릴 수 없어요.</b> 대부분은 사진이 차지해요.<br>사진은 지금 <b>가로 '+pf.maxW+'px</b>로 줄여 저장돼요(공간이 찰수록 더 작게).</div>';
  if(im.count>0){
    h+='<button type="button" class="btn btn-ol" style="width:100%;margin-top:12px;font-size:13px;padding:9px;white-space:nowrap" onclick="compactImages()">🗜 사진 압축해 공간 확보</button>';
    h+='<div style="font-size:13px;color:var(--gray);line-height:1.5;margin-top:5px;word-break:keep-all">가지고 있는 사진 '+im.count+'장을 더 작게 다시 저장해요. 화면에서 보이는 크기(작은 썸네일)는 그대로예요. <b style="color:#c0392b">원래 화질로는 되돌릴 수 없어요.</b></div>';
  }
  h+='<button type="button" class="btn btn-bk" style="width:100%;margin-top:10px;font-size:13px;padding:9px;white-space:nowrap" onclick="closeM(\'storageMod\');exportData()">'+icoBkp()+'&nbsp;지금 백업 받아두기</button>';
  box.innerHTML=h;
}
/* 기존 사진을 현재 프로필로 재압축 (한 장씩 순차 처리) */
function compactImages(){
  var list=[];
  Object.keys(EI||{}).forEach(function(y){
    var arr=EI[y];if(!Array.isArray(arr))return;
    arr.forEach(function(it,idx){if(it&&it.src)list.push([y,idx]);});
  });
  if(!list.length){showToast('압축할 사진이 없어요.');return;}
  var before=lsBytes();
  var pf={maxW:420,q:0.55};  // 정리 시엔 가장 강하게
  var i=0;
  showToast('사진 '+list.length+'장 압축 중…');
  (function step(){
    if(i>=list.length){
      var okSave=save();
      var after=lsBytes();
      var saved=Math.max(0,before-after);
      renderStorageMod();
      showToast(okSave===false?'⚠️ 압축은 했지만 저장에 실패했어요.':('✅ '+fmtKB(saved)+' 확보했어요 (저장공간 '+lsPct()+'%).'));
      return;
    }
    var y=list[i][0],idx=list[i][1];i++;
    var it=EI[y]&&EI[y][idx];
    if(!it||!it.src){step();return;}
    resizeImg(it.src,pf.maxW,function(small){
      if(small&&small.length<it.src.length)it.src=small;  // 더 커지면 그대로 둠
      step();
    },pf.q);
  })();
}

function addImgToYear(y,src){
  var item={src:src,w:120};
  var arr=getImgs(y);
  arr.push(item);
  EI[y]=arr;
  recalc();
  var okSave=save();
  if(okSave===false){
    /* 저장 실패(공간 부족) → "방금 넣은 그 한 장"만 되돌린다.
       ★ 되돌리는 범위: 이 사진 객체 하나뿐. 다른 사진·다른 연도·다른 기록은 절대 건드리지 않는다.
       ★ 인덱스(pop)가 아니라 객체 자신을 찾아 지운다 — 연속 붙여넣기로 순서가 엇갈려도 엉뚱한 사진이 지워지지 않게.
       ★ 이어지는 save()는 "지금 메모리에 있는 현재 데이터"를 그대로 다시 쓰는 것. 옛 데이터를 읽어와 덮어쓰지 않는다. */
    var cur=getImgs(y);
    var at=cur.indexOf(item);
    if(at>=0)cur.splice(at,1);
    EI[y]=cur;
    recalc();save();
    showToast('⚠️ 저장 공간이 부족해 사진을 넣지 못했어요. ⚙ 메뉴 › 저장공간에서 정리해 주세요.');
    return;
  }
  var p=lsPct();
  if(p>=80)showToast('저장공간 '+p+'% 사용 중 — ⚙ 메뉴 › 저장공간에서 사진을 정리할 수 있어요.');
}
function rmImgAt(y,idx){
  if(!confirm('이 사진을 삭제할까요?'))return;
  var arr=getImgs(y);
  arr.splice(idx,1);
  if(arr.length===0){delete EI[y];}else{EI[y]=arr;}
  recalc();save();
}

// ── 이미지 드래그 리사이즈 ──────────────────────────────────
var _rsState=null; // {y, idx, startX, startW, el}
function rsStart(e,y,idx){
  e.preventDefault();
  var wrap=e.target.parentNode;
  var img=wrap.querySelector('.ev-img2');
  _rsState={y:y,idx:idx,startX:e.clientX,startW:img.offsetWidth,img:img};
  document.body.classList.add('img-resizing');
  document.addEventListener('mousemove',rsMove);
  document.addEventListener('mouseup',rsEnd);
}
function rsMove(e){
  if(!_rsState)return;
  var dx=e.clientX-_rsState.startX;
  var nw=Math.max(60,Math.min(600,_rsState.startW+dx));
  _rsState.img.style.width=nw+'px';
}
function rsEnd(){
  if(!_rsState)return;
  var y=_rsState.y, idx=_rsState.idx;
  var nw=parseInt(_rsState.img.style.width)||120;
  var arr=getImgs(y);
  if(arr[idx])arr[idx].w=nw;
  EI[y]=arr;
  save();
  _rsState=null;
  document.body.classList.remove('img-resizing');
  document.removeEventListener('mousemove',rsMove);
  document.removeEventListener('mouseup',rsEnd);
}

// ── 사진 탭 확대 (모바일 — hover가 없어 탭으로 토글) ──────────
function imgZoomTap(el){
  var wrap=el.parentNode;
  var on=wrap.classList.contains('zoom-on');
  var list=document.querySelectorAll('.img-wrap.zoom-on');
  for(var i=0;i<list.length;i++)list[i].classList.remove('zoom-on');
  if(!on)wrap.classList.add('zoom-on');
}

// ── 클립보드 이미지 붙여넣기 ────────────────────────────────
function initPaste(){
  document.addEventListener('paste',function(e){
    var items=e.clipboardData&&e.clipboardData.items;
    if(!items)return;
    var hasImg=false;
    for(var q=0;q<items.length;q++){if(items[q].type&&items[q].type.indexOf('image')>=0){hasImg=true;break;}}
    if(!hasImg)return;
    if(pImg==null){showToast('붙여넣을 칸(이벤트/목표)을 먼저 클릭하세요');return;}
    for(var i=0;i<items.length;i++){
      if(items[i].type.indexOf('image')>=0){
        var file=items[i].getAsFile();
        var r=new FileReader();
        (function(fr){
          fr.onload=function(ev){var py=pImg;var _pf=imgProfile();resizeImg(ev.target.result,_pf.maxW,function(small){addImgToYear(py,small);},_pf.q);};
          fr.readAsDataURL(file);
        })(r);
        e.preventDefault();
        break;
      }
    }
  });
}



/* ── 월간 탭 초기화: 그 정산월에 속한 항목만 선택해서 삭제 ── */
var mrsSel={rec:true,con:true,bdg:true,dbg:true,wbg:true,inc:true,rev:true};
function mrsMonthKey(){return monthKey(dailyDate||todayStr());}
function mrsWeekKeys(mk){
  var seen={},out=[];
  Object.keys(weeklyBudgetMap||{}).concat(Object.keys(catWeeklyPast||{})).forEach(function(wk){
    if(seen[wk])return;seen[wk]=1;
    if(monthKey(wk)===mk)out.push(wk);
  });
  return out;
}
function mrsStats(mk){
  if(!dailyReview)loadDailyReview();
  var recs=dailyData.filter(function(e){return monthKey(e.date)===mk;}).length;
  var con=Object.keys(dailyConsume||{}).filter(function(d){return monthKey(d)===mk;}).length;
  var dbg=Object.keys(dailyBudgetMap||{}).filter(function(d){return monthKey(d)===mk;}).length;
  var wbg=mrsWeekKeys(mk).length;
  var cm=(mk===curPKey('monthly'))?catMonthlyBudget:(catMonthlyPast[mk]||{});
  var bdg=((parseFloat(monthlyBudgetMap[mk])||0)>0||Object.keys(cm).length>0)?1:0;
  var inc=(incomeData[mk]||[]).length;
  var rv=dailyReview.monthly[mk]||{};
  var rev=Object.keys(rv).filter(function(k){return String(rv[k]||'').trim()!=='';}).length?1:0;
  return {rec:recs,con:con,bdg:bdg,dbg:dbg,wbg:wbg,inc:inc,rev:rev};
}
function mrsSet(k,v){mrsSel[k]=!!v;renderMonthReset();}
function mrsToggleAll(){
  var st=mrsStats(mrsMonthKey());
  var live=['rec','con','bdg','dbg','wbg','inc','rev'].filter(function(k){return st[k]>0;});
  if(!live.length)return;
  var allOn=live.every(function(k){return mrsSel[k];});
  live.forEach(function(k){mrsSel[k]=!allOn;});
  renderMonthReset();
}
function openMonthReset(){
  var mk=mrsMonthKey();var st=mrsStats(mk);
  ['rec','con','bdg','dbg','wbg','inc','rev'].forEach(function(k){mrsSel[k]=st[k]>0;});
  renderMonthReset();
  var d=g('mrsMod');if(d)d.classList.add('open');
}
function renderMonthReset(){
  var mk=mrsMonthKey();var st=mrsStats(mk);
  var mlabel=parseInt(mk.slice(5,7),10)+'월';
  var rng=(typeof monthRangeLabel==='function')?monthRangeLabel(mk):'';
  var rows=[
    ['rec','📝 기록',st.rec?(st.rec+'건'):'없음','지출·메모·기분'],
    ['con','🥕 당근/채찍',st.con?(st.con+'일'):'없음',''],
    ['bdg','💰 월간 예산',st.bdg?'설정됨':'없음','분류별 예산 포함'],
    ['dbg','📅 일일 예산',st.dbg?(st.dbg+'일'):'없음',''],
    ['wbg','🗓️ 주간 예산',st.wbg?(st.wbg+'주'):'없음','이 달에서 시작하는 주'],
    ['inc','💵 수입',st.inc?(st.inc+'건'):'없음','정산 패널'],
    ['rev','📖 회고 메모',st.rev?'있음':'없음','당근·채찍·베스트·워스트']
  ];
  var h='<div style="font-size:13px;color:var(--gray);line-height:1.55;word-break:keep-all;margin-bottom:11px"><b style="color:#111">'+mlabel+'</b>'+(rng?' <span style="white-space:nowrap">('+rng+')</span>':'')+'에 속한 것만 지워요.<br>남기고 싶은 항목은 체크를 풀면 돼요. 월간회고 탭의 기록은 지우지 않아요.</div>';
  var live=rows.filter(function(r){return st[r[0]]>0;}).map(function(r){return r[0];});
  var allOn=live.length>0&&live.every(function(k){return mrsSel[k];});
  var selN=live.filter(function(k){return mrsSel[k];}).length;
  h+='<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px"><span style="font-size:13px;color:var(--gray);white-space:nowrap">'+selN+' / '+live.length+'개 선택</span><button type="button" onclick="mrsToggleAll()" '+(live.length?'':'disabled ')+'style="padding:5px 10px;font-size:13px;border:1px solid var(--tbl-border);border-radius:7px;background:#fff;cursor:'+(live.length?'pointer':'default')+';white-space:nowrap;opacity:'+(live.length?'1':'.45')+'">'+(allOn?'전체 해제':'전체 선택')+'</button></div>';
  rows.forEach(function(r){
    var k=r[0],has=st[k]>0;
    h+='<label style="display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid var(--tbl-border);border-radius:9px;margin-bottom:6px;cursor:'+(has?'pointer':'default')+';opacity:'+(has?'1':'.42')+'">'
      +'<input type="checkbox" '+(mrsSel[k]&&has?'checked':'')+(has?'':' disabled')+' onchange="mrsSet(\''+k+'\',this.checked)" style="width:16px;height:16px;flex-shrink:0;accent-color:var(--ac)">'
      +'<span style="flex:1;min-width:0;word-break:keep-all"><span style="font-size:14px;font-weight:600;white-space:nowrap">'+r[1]+'</span>'
      +(r[3]?'<span style="font-size:12px;color:var(--gray);margin-left:6px">'+r[3]+'</span>':'')+'</span>'
      +'<span style="font-size:13px;color:'+(has?'#111':'var(--gray)')+';white-space:nowrap;flex-shrink:0">'+r[2]+'</span></label>';
  });
  h+='<div style="margin-top:10px;font-size:13px;color:#c0392b;word-break:keep-all">진행 전 <b>⚙ 메뉴 › 💾 저장하기</b>로 저장해두세요. 되돌릴 수 없어요.</div>';
  var b=g('mrsBody');if(b)b.innerHTML=h;
}
function mrsRun(){
  var mk=mrsMonthKey();var st=mrsStats(mk);
  var any=['rec','con','bdg','dbg','wbg','inc','rev'].some(function(k){return mrsSel[k]&&st[k]>0;});
  if(!any){showToast('지울 항목을 선택해주세요');return;}
  if(!dailyReview)loadDailyReview();
  if(mrsSel.rec&&st.rec>0){
    dailyData=dailyData.filter(function(e){return monthKey(e.date)!==mk;});
    saveDaily();
  }
  if(mrsSel.con&&st.con>0){
    Object.keys(dailyConsume).forEach(function(d){if(monthKey(d)===mk)delete dailyConsume[d];});
    saveDailyConsume();
  }
  var bdgTouched=false;
  if(mrsSel.bdg&&st.bdg>0){
    delete monthlyBudgetMap[mk];
    if(mk===curPKey('monthly'))catMonthlyBudget={};else delete catMonthlyPast[mk];
    bdgTouched=true;
  }
  if(mrsSel.dbg&&st.dbg>0){
    Object.keys(dailyBudgetMap).forEach(function(d){if(monthKey(d)===mk)delete dailyBudgetMap[d];});
    bdgTouched=true;
  }
  if(mrsSel.wbg&&st.wbg>0){
    mrsWeekKeys(mk).forEach(function(wk){delete weeklyBudgetMap[wk];delete catWeeklyPast[wk];});
    bdgTouched=true;
  }
  if(bdgTouched)saveDailyBudget();
  if(mrsSel.inc&&st.inc>0){delete incomeData[mk];saveIncome();}
  if(mrsSel.rev&&st.rev>0){delete dailyReview.monthly[mk];saveDailyReview();}
  closeM('mrsMod');
  if(typeof renderDaily==='function')renderDaily();
  if(typeof renderActiveView==='function')renderActiveView();
  save();
  showToast(parseInt(mk.slice(5,7),10)+'월 초기화 완료');
}
function getActiveTab(){var a="long";document.querySelectorAll(".tab").forEach(function(t){if(t.classList.contains("active")){var m=(t.getAttribute("onclick")||"").match(/'(\w+)'/);if(m)a=m[1];}});if(a==="roadmap")a=(rmTab==="short"||rmTab==="mid"||rmTab==="long")?rmTab:"long";return a;}
function resetAll(){
  var tab=getActiveTab();
  var nm={daily:"일일 기록",assets:"자산",short:"단기",mid:"중기",long:"장기",monthly:"월간회고",scenario:"시나리오",projects:"프로젝트"}[tab]||tab;if(tab==="daily")nm={daily:"일일",week:"주간",month:"월간",special:"특별"}[dailyView]||"일일";
  if(tab==="scenario"){showToast("시나리오 탭은 따로 저장되는 기록이 없어요");return;}
  if(tab==="daily"&&dailyView==="month"){openMonthReset();return;}
  var _msg;if(tab==="daily"){var _dd2=dailyDate||todayStr();var _pp=_dd2.split("-");if(dailyView==="week"){var _st=weekStartMon(_dd2);var _en=new Date(_st.getFullYear(),_st.getMonth(),_st.getDate()+6);_msg=(_st.getMonth()+1)+"/"+_st.getDate()+"–"+(_en.getMonth()+1)+"/"+_en.getDate()+" 주 예산을 초기화할까요?";}else if(dailyView==="month"){_msg=parseInt(_pp[1])+"월 예산을 초기화할까요?";}else if(dailyView==="special"){var _spYr=renderSpecialView._year||parseInt(_pp[0],10);_msg=_spYr+"년 특별지출 계획(이벤트·예산)을 초기화할까요?\n실제 지출 기록은 지워지지 않아요.";}else{_msg=parseInt(_pp[1])+"월 "+parseInt(_pp[2])+"일 기록과 예산을 초기화할까요?";}}else{_msg=nm+" 탭의 기록을 초기화할까요?";}rsConfirm(_msg+"\n진행 전 백업해두세요(⚙ 메뉴 › 💾 저장하기).\n되돌릴 수 없어요.",function(){
    if(tab==="short"){shData={savings:{},income:{},target:{}};customRowsShort=[];shRowOrder=[];renderShort();}
    else if(tab==="mid"){mdYR={};customRowsMid=[];g("mdY").value=new Date().getFullYear();g("mdA").value="";g("mdV").value="";renderMid();}
    else if(tab==="long"){YR={};ET={};CS={};EI={};customRows=[{id:"et_default",label:"이벤트/목표"}];Object.keys(customData).forEach(function(k){delete customData[k];});if(g("sA"))g("sA").value="";if(g("sV"))g("sV").value="";children=[];renderCBar();recalc();renderMid();}
    else if(tab==="monthly"){clearMonthlyCore();}
    else if(tab==="daily"){var _dd=dailyDate||todayStr();if(dailyView==="week"){var _wk=weekKey(_dd);delete weeklyBudgetMap[_wk];delete catWeeklyPast[_wk];saveDailyBudget();}else if(dailyView==="month"){var _mk=monthKey(_dd);delete monthlyBudgetMap[_mk];if(_mk===monthKey(todayStr()))catMonthlyBudget={};else delete catMonthlyPast[_mk];saveDailyBudget();}else if(dailyView==="special"){var _spYr2=renderSpecialView._year||parseInt(_dd.slice(0,4),10);_doResetSpecialYear(_spYr2);}else{dailyData=dailyData.filter(function(e){return e.date!==_dd;});saveDaily();delete dailyBudgetMap[_dd];saveDailyBudget();}if(typeof renderDaily==="function")renderDaily();if(typeof renderActiveView==="function")renderActiveView();}
    else if(tab==="assets"){assets=[];saveAssets();if(typeof renderAssets==="function")renderAssets();}
    else if(tab==="projects"){SP=[];projInvest={};projRates={};document.querySelectorAll("#pOpts input[type=checkbox]").forEach(function(c){c.checked=false;});if(typeof renderSP==="function")renderSP();recalc();}
    save();showToast(nm+" 초기화 완료");
  });
}



function fetchGoogleSheet(overrideUrl){
  var url=overrideUrl||(g("gsUrl").value||"").trim();
  if(!url){alert("구글시트 URL을 입력해주세요.");return;}
  var sid=extractSheetId(url);
  if(!sid){alert("올바른 구글시트 URL이 아닙니다.");return;}
  var gidMatch=url.match(/[#&?]gid=(\d+)/);
  var gid=gidMatch?gidMatch[1]:"";
  var btn=g("gsFetchBtn");
  btn.textContent="불러오는 중...";btn.disabled=true;
  var uz=g("uploadZone");
  uz.innerHTML="<span style='font-size:22px'>⏳</span><div class='uz-text'>구글시트 연결 중...</div>";

  function resetUI(msg){
    btn.textContent="불러오기";btn.disabled=false;
    uz.innerHTML="<span style='font-size:22px'>📂</span><div class='uz-text'><strong>xlsx / xls / csv 파일을 끌어오거나 클릭해서 업로드</strong></div>";
    if(msg)alert(msg);
  }
  function cleanup(){
    clearTimeout(timer);
    var old=document.getElementById("__gsScript");
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    if(window.__gsOrig!==undefined){
      if(window.google&&window.google.visualization&&window.google.visualization.Query)
        window.google.visualization.Query.setResponse=window.__gsOrig;
      delete window.__gsOrig;
    }
  }

  var timer=setTimeout(function(){
    cleanup();
    resetUI("10초 응답 없음.\n구글시트가 '링크 있는 모든 사용자 — 뷰어'로 공유됐는지 확인해주세요.");
  },10000);

  // setResponse 오버라이드 (CORS 우회)
  if(!window.google)window.google={};
  if(!window.google.visualization)window.google.visualization={};
  if(!window.google.visualization.Query)window.google.visualization.Query={};
  window.__gsOrig=window.google.visualization.Query.setResponse;
  window.google.visualization.Query.setResponse=function(resp){
    cleanup();
    if(!resp||resp.status==="error"||!resp.table){
      var detail=(resp&&resp.errors)?resp.errors[0].message:"";
      resetUI("구글이 오류를 반환했습니다.\n공유 설정: 링크 있는 모든 사용자 → 뷰어\n"+detail);
      return;
    }
    showToast("데이터 수신: "+resp.table.rows.length+"행");
    // gviz JSON → rows 변환
    var result=convertGvizJsonToRows(resp);
    if(!result){
      resetUI("연도 정보를 찾을 수 없습니다.\n\n헤더(맨 윗줄)에 연도가 있어야 해요: 2026, 2027, 2028 \u2026\n연.월 형식(2026.01)이나 제목 줄이 위에 있으면 인식이 안 돼요.");
      return;
    }
    showToast("멀티블록: "+result.rows.length+"행");
    if(result.startAge)g("sA").value=result.startAge;
    loadSheetData(result.rows);
    // 이벤트 텍스트 2차 로드
    fetchGvizTextRows(sid,gid,function(ok){
      btn.textContent="불러오기";btn.disabled=false;
      recalc();save();
      g("gsUrl").value="";
    });
  };

  var script=document.createElement("script");
  script.id="__gsScript";
  script.src="https://docs.google.com/spreadsheets/d/"+sid
    +"/gviz/tq?tqx=out:json"+(gid?"&gid="+gid:"");
  script.onerror=function(){
    cleanup();
    resetUI("스크립트 로드 실패. 공유 설정을 확인해주세요.");
  };
  document.head.appendChild(script);
}

