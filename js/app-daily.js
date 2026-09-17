// ── INIT_APP (절대 삭제 금지) ──
/* ── 일일 기록(다이어리) — Stage 1 (rs_daily, rs7과 분리) ─────────── */
function todayStr(){var d=new Date();var m=String(d.getMonth()+1).padStart(2,'0');var dd=String(d.getDate()).padStart(2,'0');return d.getFullYear()+'-'+m+'-'+dd;}
function loadDaily(){try{var v=JSON.parse(localStorage.getItem('rs_daily')||'null');dailyData=Array.isArray(v)?v:[];}catch(e){dailyData=[];}}
function saveDaily(){try{lsSet('rs_daily',JSON.stringify(dailyData));}catch(e){}}
function dlEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function under10k(x){var u=[[1000,'천'],[100,'백'],[10,'십']];var s=[];for(var i=0;i<u.length;i++){var dd=Math.floor(x/u[i][0]);if(dd){s.push((dd===1?'':dd)+u[i][1]);x%=u[i][0];}}if(x)s.push(String(x));return s.join(' ');}
function wonInWords(n){n=Math.floor(Math.abs(Number(n)||0));if(!n)return '';var eok=Math.floor(n/100000000);n%=100000000;var man=Math.floor(n/10000);var rest=n%10000;var p=[];if(eok)p.push(eok.toLocaleString()+'억');if(man)p.push((man===1&&eok===0?'':man.toLocaleString())+'만');if(rest)p.push(under10k(rest));return p.join(' ')+'원';}
function updateAmountWords(){var el=g('dlAmount'),out=g('dlAmountWords');if(!el||!out)return;var raw=(el.value||'').replace(/,/g,'').trim();var n=raw===''?0:parseFloat(raw);out.textContent=(!n||isNaN(n))?'':((n<0?'환불 ':'')+wonInWords(n));}
var DL_TREE_DEFAULT={
 "고정":{"주거":["대출이자/원리금","관리비","도시가스","수도세"],"통신":["휴대폰(나)","휴대폰(남편)","휴대폰(아내)","휴대폰(자녀)","인터넷","OTT/넷플릭스"],"자동차":["주유","주차/통행료","보험/세금","소모품/수리","할부금"],"보험":["나","남편","아내","자녀"],"세금":["건강보험","국민연금","종합소득세","주민세","기타"],"구독":["멤버십","티빙","기타"],"용돈/꾸밈":["내 용돈","내 꾸밈","남편 용돈","남편 꾸밈","아내 용돈","아내 꾸밈","자녀 꾸밈"],"헌금/후원":["헌금","후원"]},
 "변동":{"식비":["식재료","외식/배달","카페/간식","기타"],"생활용품":["생필품","가전/가구","침구/인테리어","잡화"],"자녀":["식비","육아용품","기관/돌봄","놀이/활동","교육/도서","병원","꾸밈/의류"],"건강":["병원","약국","영양제"],"계발/문화":["운동","강의","전시/공연"],"경조사":["경조사비","비상금"],"여행":["숙소","교통","식비","입장료","기타"],"금융":["연회비","수수료"]}
};
var DL_GROUPS=["고정","변동","특별"];
var DL_SPECIAL_DEFAULT=["경조사","명절","여행","기타"];
function dlFlattenCats(tree){var out=[];DL_GROUPS.forEach(function(gr){var grp=(tree&&tree[gr])||{};Object.keys(grp).forEach(function(c){if(out.indexOf(c)<0)out.push(c);});});return out;}
function dlMigrateCats(v){var tree;var hadSpecial;if(v&&!Array.isArray(v)&&typeof v==="object"&&(v["고정"]||v["변동"])){if(!v["고정"])v["고정"]={};if(!v["변동"])v["변동"]={};hadSpecial=!!v["특별"];tree=v;}else{tree=JSON.parse(JSON.stringify(DL_TREE_DEFAULT));if(Array.isArray(v))v.forEach(function(c){c=String(c||"").trim();if(c&&!tree["고정"][c]&&!tree["변동"][c])tree["변동"][c]=[];});hadSpecial=false;}if(!tree["특별"])tree["특별"]={};if(!hadSpecial){DL_SPECIAL_DEFAULT.forEach(function(c){if(tree["고정"][c]||tree["변동"][c]||tree["특별"][c])return;tree["특별"][c]=[];});}return tree;}
function catGroupOf(cat){if(!dailyTree)loadDailyCats();if(dailyTree["고정"]&&dailyTree["고정"][cat])return "고정";if(dailyTree["변동"]&&dailyTree["변동"][cat])return "변동";if(dailyTree["특별"]&&dailyTree["특별"][cat])return "특별";return "";}
function loadDailyCats(){var v=null;try{v=JSON.parse(localStorage.getItem('rs_daily_cats')||'null');}catch(e){}dailyTree=dlMigrateCats(v);dailyCats=dlFlattenCats(dailyTree);}
function saveDailyCats(){try{lsSet('rs_daily_cats',JSON.stringify(dailyTree));}catch(e){}}
function dlSelLabel(){if(dlSelSub)return dlSelGroup+' › '+dlSelCat+' › '+dlSelSub;if(dlSelCat)return dlSelGroup+' › '+dlSelCat;return '분류 선택';}
function updateCatBtn(){var b=g('dlCatBtn');if(b)b.textContent=(dlSelCat?dlSelLabel():'분류 선택')+' ▾';}
function renderCatOptions(){updateCatBtn();var m=g('catModal');if(m&&m.classList.contains('open'))renderCatTree();}
function openCatModal(manage){dlCatManage=!!manage;var ttl=g('catModalTitle');if(ttl)ttl.textContent=dlCatManage?'분류 관리':'분류 선택';var m=g('catModal');if(!m)return;m.classList.add('open');renderCatTree();}
function openCatManage(){openCatModal(true);}
function toggleCatTree(){openCatModal();}


function pickCat(grp,cat,sub){if(dlCatManage)return;dlSelGroup=grp;dlSelCat=cat;dlSelSub=sub||'';updateCatBtn();closeM('catModal');}
function treeToggleCat(grp,cat){var k=grp+'/'+cat;dlTreeOpenCat[k]=!dlTreeOpenCat[k];renderCatTree();}
function catRowClick(grp,cat){if(!dailyTree)loadDailyCats();var subs=(dailyTree[grp]&&dailyTree[grp][cat])||[];if(dlCatManage){treeToggleCat(grp,cat);return;}if(subs.length)treeToggleCat(grp,cat);else pickCat(grp,cat);}
function renderCatTree(){var p=g('catTreeBox');if(!p)return;if(!dailyTree)loadDailyCats();var h='<div style="font-size:13px;color:var(--gray);margin-bottom:12px;line-height:1.5">'+(dlCatManage?'대분류를 눌러 펼치고, ×로 삭제 · +로 추가하세요. 기록은 보존돼요.<br><b>세부 항목은 왼쪽 ⋮⋮ 손잡이를 끌어</b> 다른 대분류 위에 놓으면 옮겨져요(고정↔변동도 돼요). 예산·납부일·지난 기록이 함께 따라가요.<br>대분류 전체를 고정↔변동으로 옮길 땐 오른쪽 「옮기기」를 누르세요.':'대분류를 누르면 펼쳐져요. 세부 항목이나 「전체」를 눌러 선택하세요. (× 삭제)')+'</div>';if(!dlCatManage){var _fdd=fixedDueForDay(dailyDate||todayStr());if(_fdd.length){h+='<div style="background:#eef3ee;border:1px solid var(--ac);border-radius:8px;padding:10px 12px;margin-bottom:12px"><div style="font-size:13px;font-weight:600;color:var(--ac);margin-bottom:7px">📅 오늘 예정 고정지출 — 눌러서 바로 채우기</div>'+_fdd.map(function(it){var nm=it.sub?(it.cat+' › '+it.sub):it.cat;return '<button type="button" onclick="pickFixedDue('+jsArg(it.grp)+','+jsArg(it.cat)+','+jsArg(it.sub)+','+(it.amt||0)+')" style="display:block;width:100%;text-align:left;border:1px solid var(--ac);background:#fff;border-radius:6px;padding:8px 10px;margin-bottom:6px;font-size:14px;color:#111;cursor:pointer;font-family:inherit">'+dlEsc(nm)+(it.amt>0?(' <b style="color:var(--ac)">'+fmtComma(it.amt)+'원</b>'):'')+'</button>';}).join('')+'</div>';}}DL_GROUPS.forEach(function(grp){h+='<div style="font-weight:700;font-size:14px;margin:14px 0 8px">'+grp+'지출</div>';var cats=Object.keys(dailyTree[grp]||{});cats.forEach(function(c){var k=grp+"/"+c;var open=!!dlTreeOpenCat[k];var subs=dailyTree[grp][c]||[];var selCat=(dlSelGroup===grp&&dlSelCat===c&&!dlSelSub);h+='<div style="margin:0 0 5px 0;border:1px solid '+(selCat?'var(--ac)':'transparent')+';border-radius:8px"><div style="display:flex;align-items:center;gap:4px">'+(dlCatManage?('<div class="cat-drop-t" data-grp="'+dlEsc(grp)+'" data-cat="'+dlEsc(c)+'"'):'<div')+' onclick="catRowClick('+jsArg(grp)+','+jsArg(c)+')" style="flex:1;display:flex;align-items:center;gap:9px;cursor:pointer;padding:9px 8px"><span style="width:18px;text-align:center;font-size:15px;color:var(--gray)">'+(subs.length?(open?"▾":"▸"):"·")+'</span><span style="display:inline-block;width:11px;height:11px;border-radius:99px;background:'+catColor(c)+'"></span><span style="font-size:14px;font-weight:600;'+(selCat?"color:var(--ac)":"")+'">'+dlEsc(c)+'</span></div>'+(dlCatManage?('<button type="button" onclick="moveCatGroup('+jsArg(grp)+','+jsArg(c)+')" style="flex-shrink:0;border:1px solid var(--border);background:#fff;border-radius:6px;cursor:pointer;color:var(--gray);font-size:12px;line-height:1;padding:6px 9px;font-family:inherit;white-space:nowrap">옮기기</button>'):'')+'<button type="button" onclick="deleteDlCat('+jsArg(grp)+','+jsArg(c)+')" style="border:none;background:none;cursor:pointer;color:#ccc;font-size:18px;line-height:1;padding:8px 10px">×</button></div>';if(open){h+='<div style="margin:0 8px 8px 36px;display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding-bottom:6px"><span onclick="pickCat('+jsArg(grp)+','+jsArg(c)+')" style="cursor:pointer;border:1px solid '+(selCat?"var(--ac)":"var(--border)")+';border-radius:99px;padding:7px 13px;font-size:13px;'+(selCat?"color:var(--ac);background:var(--ac-light);font-weight:600":"color:var(--gray)")+'">전체</span>';subs.forEach(function(s){var ss=(dlSelGroup===grp&&dlSelCat===c&&dlSelSub===s);h+='<span class="cat-chip" style="display:inline-flex;align-items:center;gap:5px;border:1px solid '+(ss?"var(--ac)":"var(--border)")+';border-radius:99px;padding:7px 8px 7px '+(dlCatManage?'9px':'13px')+';font-size:13px;'+(ss?"color:var(--ac);background:var(--ac-light)":"")+'">'+(dlCatManage?('<span class="cat-grip segtip" data-tip="끌어서 다른 대분류로 옮기기" onpointerdown="catGripDown(event,'+jsArg(grp)+','+jsArg(c)+','+jsArg(s)+')">⋮⋮</span>'):'')+'<span onclick="pickCat('+jsArg(grp)+','+jsArg(c)+','+jsArg(s)+')" style="cursor:pointer">'+dlEsc(s)+'</span><button type="button" onclick="deleteDlSub('+jsArg(grp)+','+jsArg(c)+','+jsArg(s)+')" style="border:none;background:none;cursor:pointer;color:#ccc;font-size:15px;padding:0 2px">×</button></span>';});h+='<button type="button" onclick="addDlSub('+jsArg(grp)+','+jsArg(c)+')" style="border:1px dashed var(--border);background:none;border-radius:99px;padding:7px 13px;font-size:13px;color:var(--gray);cursor:pointer">+ 세부</button></div>';}h+='</div>';});h+='<button type="button" onclick="addDlCat('+jsArg(grp)+')" style="border:1px dashed var(--border);background:none;border-radius:99px;padding:8px 15px;font-size:13px;color:var(--gray);cursor:pointer;margin:6px 0 6px 2px">+ 대분류</button>';});p.innerHTML=h;}
function addDlCat(grp){if(!grp)return;rsPrompt(grp+'지출에 대분류 추가',{placeholder:'예: 식비'},function(name){if(name==null)return;name=String(name).trim();if(!name)return;if(!dailyTree)loadDailyCats();if(!dailyTree[grp][name])dailyTree[grp][name]=[];dailyCats=dlFlattenCats(dailyTree);saveDailyCats();dlTreeOpenCat[grp+'/'+name]=true;renderCatTree();renderActiveView();});}
function addDlSub(grp,cat){if(!grp||!cat)return;rsPrompt(cat+'에 세부항목 추가',{placeholder:'예: 외식'},function(name){if(name==null)return;name=String(name).trim();if(!name)return;if(!dailyTree)loadDailyCats();if(dailyTree[grp][cat].indexOf(name)<0)dailyTree[grp][cat].push(name);saveDailyCats();dlTreeOpenCat[grp+'/'+cat]=true;renderCatTree();renderActiveView();});}
function purgeDeletedCat(cat){
  if(!dlCatDeleted(cat))return;
  var n=0;dailyData.forEach(function(e){if((e.cat||e.category||'')===cat)n++;});
  if(!n)return;
  rsConfirm('"'+cat+'" 분류의 기록 '+n+'건을 영구 삭제할까요?\n모든 기간에서 지워지고 되돌릴 수 없어요.',function(){
    /* 파괴 범위: 삭제된 분류명이 정확히 일치하는 기록만 (사용자가 명시 확인) */
    dailyData=dailyData.filter(function(e){return (e.cat||e.category||'')!==cat;});
    saveDaily();renderActiveView();
  });
}
/* 대분류를 고정↔변동으로 옮긴다 (양 파일 G2).
   catGroupOf가 dailyTree만 보고 판정하고 예산·기록·납부일은 전부 「대분류::세부」 키라
   그룹과 무관 → 트리 키 이동 하나로 끝난다(예산·기록 불변).
   단 집계는 저장하지 않고 매번 계산하므로(§2.2) 지난 기록도 함께 새 그룹으로 다시 분류된다. */
/* ── 세부 항목을 다른 대분류로 끌어 옮기기 (양 파일 G2) ──
   대분류 이동(moveCatGroup)과 결정적으로 다른 점: 예산·납부일 키가 「대분류::세부」라
   대분류가 바뀌면 키 자체가 바뀐다. 그래서 지우지 않고 전부 새 키로 「옮긴다」.
   기록도 함께 옮긴다(대분류만 교체 — 세부 이름·금액·날짜는 불변).
   파괴 범위는 그 세부 하나(G1): 다른 세부·다른 분류는 건드리지 않는다. */
function moveDlSub(grp,cat,sub,tgrp,tcat){
  if(!dailyTree)loadDailyCats();
  if(cat==='대출이자'||tcat==='대출이자'){showToast('대출이자는 자산 탭이 관리해서 옮길 수 없어요.');return;}
  var subs=(dailyTree[grp]&&dailyTree[grp][cat])||[];
  if(subs.indexOf(sub)<0)return;
  var tsubs=(dailyTree[tgrp]&&dailyTree[tgrp][tcat])||null;
  if(!tsubs)return;
  if(grp===tgrp&&cat===tcat)return;
  if(tsubs.indexOf(sub)>=0){showToast('「'+tcat+'」에 같은 이름의 세부가 이미 있어요.');return;}
  var n=dailyData.filter(function(x){return (x.cat||x.category||'')===cat&&(x.sub||'')===sub;}).length;
  rsConfirm('「'+sub+'」'+mealJosa(sub,'을','를')+' '+cat+' → '+tcat+'('+tgrp+'지출)로 옮길까요?\n예산·납부일이 그대로 따라가요.'
    +(n?('\n지난 기록 '+n+'건도 함께 옮겨져요.'):''),function(){
    if((dailyTree[grp][cat]||[]).indexOf(sub)<0)return;
    var ok=subKey(cat,sub),nk=subKey(tcat,sub);
    dailyTree[grp][cat]=dailyTree[grp][cat].filter(function(x){return x!==sub;});
    dailyTree[tgrp][tcat].push(sub);
    [catMonthlyBudget,catWeeklyBudget].forEach(function(m){if(m&&(ok in m)){m[nk]=m[ok];delete m[ok];}});
    [catMonthlyPast,catWeeklyPast].forEach(function(PM){Object.keys(PM||{}).forEach(function(pk){var m=PM[pk];if(m&&(ok in m)){m[nk]=m[ok];delete m[ok];}});});
    if(fixedDue[ok]){fixedDue[nk]=fixedDue[ok];delete fixedDue[ok];}
    dailyData.forEach(function(x){if((x.cat||x.category||'')===cat&&(x.sub||'')===sub){
      if(x.cat!==undefined)x.cat=tcat; if(x.category!==undefined)x.category=tcat;}});
    dailyCats=dlFlattenCats(dailyTree);
    saveDailyCats();saveDailyBudget();saveFixedDue();saveDaily();
    if(dlSelCat===cat&&dlSelSub===sub){dlSelGroup=tgrp;dlSelCat=tcat;updateCatBtn();}
    dlTreeOpenCat[tgrp+'/'+tcat]=true;
    renderCatTree();renderActiveView();
    showToast('「'+sub+'」'+mealJosa(sub,'을','를')+' '+tcat+mealJosa(tcat,'으로','로')+' 옮겼어요.');
  });
}
/* 손잡이만 드래그한다(칩 전체를 잡으면 모바일에서 모달 스크롤이 막힌다).
   포인터 이벤트 하나로 마우스·터치를 함께 처리하고, 드롭 대상은 elementFromPoint로 찾는다. */
var _catDrag=null;
function catGripDown(ev,grp,cat,sub){
  if(ev.button!=null&&ev.button!==0)return;
  if(ev.preventDefault)ev.preventDefault();
  var tg=ev.target||null;
  _catDrag={grp:grp,cat:cat,sub:sub,chip:(tg&&tg.closest)?tg.closest('.cat-chip'):null,over:null};
  if(_catDrag.chip)_catDrag.chip.classList.add('cat-dragging');
  try{var gh=document.createElement('div');gh.id='catDragGhost';gh.textContent=sub;document.body.appendChild(gh);}catch(e){}
  try{if(tg&&tg.setPointerCapture&&ev.pointerId!=null)tg.setPointerCapture(ev.pointerId);}catch(e){}
  document.addEventListener('pointermove',catGripMove,true);
  document.addEventListener('pointerup',catGripUp,true);
  document.addEventListener('pointercancel',catGripUp,true);
  catGripMove(ev);
}
function catGripMove(ev){
  if(!_catDrag)return;
  if(ev.preventDefault)ev.preventDefault();
  var gh=document.getElementById('catDragGhost');
  if(gh){gh.style.left=(ev.clientX+14)+'px';gh.style.top=(ev.clientY-12)+'px';}
  var el=null;try{el=document.elementFromPoint(ev.clientX,ev.clientY);}catch(e){}
  var t=(el&&el.closest)?el.closest('.cat-drop-t'):null;
  if(_catDrag.over&&_catDrag.over!==t)_catDrag.over.classList.remove('cat-drop-on');
  _catDrag.over=t;
  if(t)t.classList.add('cat-drop-on');
}
function catGripUp(ev){
  if(!_catDrag)return;
  var d=_catDrag;_catDrag=null;
  document.removeEventListener('pointermove',catGripMove,true);
  document.removeEventListener('pointerup',catGripUp,true);
  document.removeEventListener('pointercancel',catGripUp,true);
  var gh=document.getElementById('catDragGhost');if(gh&&gh.parentNode)gh.parentNode.removeChild(gh);
  if(d.chip)d.chip.classList.remove('cat-dragging');
  if(d.over)d.over.classList.remove('cat-drop-on');
  if(!d.over)return;
  var tg=d.over.getAttribute('data-grp'),tc=d.over.getAttribute('data-cat');
  if(!tg||!tc)return;
  moveDlSub(d.grp,d.cat,d.sub,tg,tc);
}
function renameDlCat(grp,oldName){
  if(!dailyTree)loadDailyCats();
  if(oldName==='대출이자'){showToast('대출이자는 자산 탭이 관리해서 이름을 바꿀 수 없어요.');return;}
  if(!dailyTree[grp]||!(oldName in dailyTree[grp]))return;
  rsPrompt('「'+oldName+'」 이름 수정',{value:oldName,placeholder:'예: 식비'},function(name){
    if(name==null)return;
    name=String(name).trim();
    if(!name||name===oldName)return;
    if(!dailyTree[grp]||!(oldName in dailyTree[grp]))return;
    if(DL_GROUPS.some(function(g){return dailyTree[g]&&dailyTree[g][name];})){showToast('「'+name+'」'+mealJosa(name,'은','는')+' 이미 있는 이름이에요.');return;}
    dailyTree[grp][name]=dailyTree[grp][oldName];
    delete dailyTree[grp][oldName];
    [catMonthlyBudget,catWeeklyBudget].forEach(function(m){
      if(oldName in m){m[name]=m[oldName];delete m[oldName];}
      Object.keys(m).forEach(function(k){if(k.indexOf(oldName+'::')===0){var nk=name+k.slice(oldName.length);m[nk]=m[k];delete m[k];}});
    });
    [catMonthlyPast,catWeeklyPast].forEach(function(PM){
      Object.keys(PM||{}).forEach(function(pk){var m=PM[pk];if(!m)return;
        if(oldName in m){m[name]=m[oldName];delete m[oldName];}
        Object.keys(m).forEach(function(k){if(k.indexOf(oldName+'::')===0){var nk=name+k.slice(oldName.length);m[nk]=m[k];delete m[k];}});
      });
    });
    Object.keys(fixedDue).forEach(function(k){if(k.indexOf(oldName+'::')===0){var nk=name+k.slice(oldName.length);fixedDue[nk]=fixedDue[k];delete fixedDue[k];}});
    dailyData.forEach(function(x){if((x.cat||x.category||'')===oldName){if(x.cat!==undefined)x.cat=name;if(x.category!==undefined)x.category=name;}});
    if(!specialPlanData)loadSpecialPlan();
    Object.keys(specialPlanData||{}).forEach(function(yk){var yd=specialPlanData[yk];if(yd&&yd.b&&(oldName in yd.b)){yd.b[name]=yd.b[oldName];delete yd.b[oldName];}});
    if(oldName in dlCatCollapsed){dlCatCollapsed[name]=dlCatCollapsed[oldName];delete dlCatCollapsed[oldName];}
    dailyCats=dlFlattenCats(dailyTree);
    saveDailyCats();saveDailyBudget();saveFixedDue();saveDaily();saveSpecialPlan();
    if(dlSelCat===oldName){dlSelCat=name;updateCatBtn();}
    renderCatTree();renderActiveView();
    showToast('「'+oldName+'」'+mealJosa(oldName,'을','를')+' 「'+name+'」'+mealJosa(name,'으로','로')+' 이름을 바꿨어요.');
  });
}
function moveCatGroup(grp,cat){
  if(!dailyTree)loadDailyCats();
  if(cat==='대출이자'){showToast('대출이자는 자산 탭이 관리해서 옮길 수 없어요.');return;}
  if(!dailyTree[grp]||!(cat in dailyTree[grp]))return;
  var opts=DL_GROUPS.filter(function(g){return g!==grp;});
  rsPromptSelect('「'+cat+'」 옮길 그룹',opts,function(to){
    if(to==null||DL_GROUPS.indexOf(to)<0||to===grp)return;
    if(!dailyTree[grp]||!(cat in dailyTree[grp]))return;
    if(!dailyTree[to])dailyTree[to]={};
    if(cat in dailyTree[to]){showToast('「'+cat+'」'+mealJosa(cat,'은','는')+' 이미 '+to+'지출에 있어요.');return;}
    rsConfirm('「'+cat+'」'+mealJosa(cat,'을','를')+' '+to+'지출로 옮길까요?\n세부 항목·예산·납부일·기록은 그대로 따라가요.\n지난 기록도 함께 '+to+'지출로 다시 분류돼요.',function(){
      if(!dailyTree[grp]||!(cat in dailyTree[grp]))return;
      dailyTree[to][cat]=dailyTree[grp][cat];
      delete dailyTree[grp][cat];
      dailyCats=dlFlattenCats(dailyTree);
      saveDailyCats();
      if(dlSelCat===cat)dlSelGroup=to;
      renderCatTree();renderActiveView();
      showToast('「'+cat+'」'+mealJosa(cat,'을','를')+' '+to+'지출로 옮겼어요.');
    });
  });
}
/* 예정 고정지출 목록에서 그 항목 하나만 내린다 (G1 — 보고 있는 그 하나).
   지우는 것은 ① 납부일 ② 「보는 달」의 월간 예산 ③ 「보는 주」의 주간 예산, 이 셋뿐.
   분류·지난 기록·지난 예산은 건드리지 않는다(분류째 지우려면 분류 관리의 ×). */
function dismissFixedPlan(cat,sub){
  if(cat==='대출이자'){showToast('대출은 자산 탭에서 관리해요.');return;}
  var sk=sub?subKey(cat,sub):cat;
  var nm=sub?(cat+' › '+sub):cat;
  rsConfirm('「'+nm+'」'+mealJosa(nm,'을','를')+' 예정 목록에서 뺄까요?\n납부일과 이 달·이 주 예산에서만 빠져요.\n분류와 지난 기록·지난 예산은 그대로 남아요.',function(){
    var dd=dailyDate||todayStr();
    if(fixedDue[sk]){delete fixedDue[sk];saveFixedDue();}
    var mm=bWriteMap('monthly',dd);if(mm&&(sk in mm))delete mm[sk];
    var wm=bWriteMap('weekly',dd);if(wm&&(sk in wm))delete wm[sk];
    saveDailyBudget();
    renderActiveView();
    var cm=g('catModal');if(cm&&cm.classList.contains('open'))renderCatTree();
    showToast('「'+nm+'」'+mealJosa(nm,'을','를')+' 예정에서 뺐어요.');
  });
}
function deleteDlCat(grp,cat){rsConfirm('대분류 "'+cat+'" 삭제할까요?\n기록은 남지만 합산에서 빠져요 — 월간 분류별 아래 "삭제된 분류"에서 영구 삭제할 수 있어요.',function(){if(!dailyTree)loadDailyCats();if(dailyTree[grp])delete dailyTree[grp][cat];delete catWeeklyBudget[cat];delete catMonthlyBudget[cat];[catMonthlyBudget,catWeeklyBudget].forEach(function(mm){Object.keys(mm).forEach(function(k){if(k.indexOf(cat+'::')===0)delete mm[k];});});[[catWeeklyPast,curPKey('weekly')],[catMonthlyPast,curPKey('monthly')]].forEach(function(pr){var PM=pr[0];Object.keys(PM).forEach(function(pk){if(pk<pr[1])return;/* 지난 기간 예산은 보존(주인장 확정) */var mm=PM[pk];if(!mm)return;delete mm[cat];Object.keys(mm).forEach(function(k){if(k.indexOf(cat+'::')===0)delete mm[k];});});});dailyCats=dlFlattenCats(dailyTree);saveDailyCats();saveDailyBudget();if(dlSelGroup===grp&&dlSelCat===cat){dlSelGroup=dlSelCat=dlSelSub='';updateCatBtn();}renderCatTree();renderActiveView();});}
function deleteDlSub(grp,cat,sub){rsConfirm('세부 "'+sub+'" 삭제할까요?\n(기록은 보존돼요)',function(){if(!dailyTree)loadDailyCats();if(dailyTree[grp]&&dailyTree[grp][cat])dailyTree[grp][cat]=dailyTree[grp][cat].filter(function(s){return s!==sub;});delete catMonthlyBudget[subKey(cat,sub)];delete catWeeklyBudget[subKey(cat,sub)];[[catWeeklyPast,curPKey('weekly')],[catMonthlyPast,curPKey('monthly')]].forEach(function(pr){var PM=pr[0];Object.keys(PM).forEach(function(pk){if(pk<pr[1])return;if(PM[pk])delete PM[pk][subKey(cat,sub)];});});delete fixedDue[subKey(cat,sub)];saveFixedDue();saveDailyCats();saveDailyBudget();if(dlSelGroup===grp&&dlSelCat===cat&&dlSelSub===sub){dlSelSub='';updateCatBtn();}renderCatTree();renderActiveView();});}
function localDateStr(dt){var m=String(dt.getMonth()+1).padStart(2,'0');var dd=String(dt.getDate()).padStart(2,'0');return dt.getFullYear()+'-'+m+'-'+dd;}
function weekStartMon(dateStr){var p=dateStr.split('-');var dt=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));var off=(dt.getDay()-weekStartDay+7)%7;dt.setDate(dt.getDate()-off);return dt;}function weekDayNames(){var W=['일','월','화','수','목','금','토'];return W.slice(weekStartDay).concat(W.slice(0,weekStartDay));}function setWeekStartDay(v){var n=parseInt(v,10);if(isNaN(n)||n<0||n>6)n=1;weekStartDay=n;try{lsSet('rs_week_start',String(n));}catch(e){}if(typeof renderDaily==='function')renderDaily();if(typeof renderActiveView==='function')renderActiveView();}
/* ── 월간 정산표에서 가져온 "월 요약" 기록(imp:'m', 그 달 1일에 배정) ──
   월/연 단위 집계(monthEntries·카테고리·월 예산)에는 포함하되,
   일·주 단위 집계(그 날 지출·주간 합계·일별 막대·요일별)에서는 제외한다.
   ★ 무지출일·당근/채찍 판정은 dayNoSpend()로 감싸 기존 의미를 그대로 보존. */
function dlIsMonthSum(e){return !!(e&&e.imp==='m');}
function monthSumNoteHtml(dateStr){
  var ms=monthEntries(dateStr||todayStr()).filter(dlIsMonthSum);
  if(!ms.length)return '';
  var sum=ms.reduce(function(s,e){return s+entrySpend(e);},0);
  return '<div style="margin-top:7px;padding:8px 10px;border:1px dashed var(--tbl-border);border-radius:8px;background:rgba(0,0,0,.02);font-size:12.5px;color:var(--gray);line-height:1.55;word-break:keep-all">'
    +'<b style="color:#111;white-space:nowrap">📥 가져온 월 요약 '+ms.length+'건 ('+fmtComma(sum)+'원)</b><br>'
    +'월간 정산표에서 가져온 기록이에요. 하루하루 쓴 내역이 아니라 <b>그 달의 요약</b>이라 <b>일별 그래프·주간 합계에는 나오지 않아요.</b> '
    +'월 총액·카테고리·월 예산 사용률에는 <b>모두 정상 반영</b>돼요.<br>'
    +'<b style="color:#111">이 달 일일기록 <span style="white-space:nowrap">1일</span>에서 수정할 수 있어요.</b><br>'
    +'<button type="button" onclick="dlGoMonthSum(\''+ms[0].date+'\')" style="margin-top:6px;padding:5px 10px;font-size:12.5px;border:1px solid var(--tbl-border);border-radius:7px;background:#fff;cursor:pointer;white-space:nowrap">가져온 기록 보기 ›</button>'
    +'</div>';
}
function dlGoMonthSum(ds){
  setDailyDate(ds);
  setDailyView('daily');
  var el=g('dlList');
  if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'center'});
}
function dayHasMonthSum(dateStr){return dailyData.some(function(e){return e.imp==='m'&&e.date===dateStr;});}
function monthHasImportSum(dateStr){var ym=String(dateStr).slice(0,7);return dailyData.some(function(e){return e.imp==='m'&&String(e.date).slice(0,7)===ym;});}
/* 월 요약으로 가져온 달은 하루하루 내역이 없다 → 그 달의 모든 날을 무지출로 세면 안 됨 */
function dayNoSpend(dateStr){return dayTotal(dateStr)===0&&!monthHasImportSum(dateStr);}
function dayTotal(dateStr){return dailyData.reduce(function(s,x){return s+((x.date===dateStr&&!dlIsMonthSum(x))?entrySpend(x):0);},0);}
function shiftWeek(delta){var p=(dailyDate||todayStr()).split('-');var dt=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));dt.setDate(dt.getDate()+delta*7);setDailyDate(localDateStr(dt));}
function gotoThisWeek(){setDailyDate(todayStr());}
function fixedDueForWeek(){if(typeof ensureLoanCats==='function')ensureLoanCats();var start=weekStartMon(dailyDate||todayStr());var startS=localDateStr(start);var endD=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);var endS=localDateStr(endD);var months={};for(var i=0;i<7;i++){var dt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);months[dt.getFullYear()+'-'+(dt.getMonth()+1)]=[dt.getFullYear(),dt.getMonth()+1];}var out=[];Object.keys(fixedDue).forEach(function(sk){var fd=fixedDue[sk];if(!fd||!fd.day)return;if(!fixedSubAlive(sk)||!fixedPlanGrpOk(sk)||!fixedPlanShown(sk))return;Object.keys(months).forEach(function(mk){var ym=months[mk];var due=effDueDate(ym[0],ym[1],fd.day,!!fd.shift);if(due>=startS&&due<=endS){if(typeof loanSkInactive==='function'&&loanSkInactive(sk,due))return;var parts=String(sk).split('::');var cat=parts[0],sub=parts[1]||'';var amt=parseFloat(catBudgetMap('monthly',due)[sk])||0;var paid=monthEntries(due).some(function(e){return (e.cat||e.category)===cat&&(e.sub||'')===sub;});var _ln=(cat==='대출이자')?loanItemOf(sub,due):null;if(_ln){amt=Math.max(0,parseFloat(_ln.regular)||0);}if(amt>0||!_ln)out.push({sk:sk,cat:cat,sub:sub,due:due,amt:amt,paid:paid});}});});if(typeof loanSettleForRange==='function')loanSettleForRange(startS,endS).forEach(function(s){out.push(s);});out.sort(function(a,b){return a.due<b.due?-1:a.due>b.due?1:0;});return out;}function loanItemOf(name,ds){try{var le=loanMonthExpense(monthKey(ds));return le.items.filter(function(x){return x.name===name;})[0]||null;}catch(e){return null;}}function loanSettleForRange(startS,endS){var out=[];if(typeof loanMonthExpense!=='function')return out;var mks={};[startS,endS].forEach(function(d){mks[monthKey(d)]=1;});Object.keys(mks).forEach(function(mk){var le;try{le=loanMonthExpense(mk);}catch(e){return;}le.items.forEach(function(it){(it.settle||[]).forEach(function(s){if(s.d<startS||s.d>endS)return;if(!(s.amt>0))return;var sk=subKey('대출이자',it.name);var paid=monthEntries(s.d).some(function(e){return (e.cat||e.category)==='대출이자'&&(e.sub||'')===it.name;});out.push({sk:sk,cat:'대출이자',sub:it.name,due:s.d,amt:s.amt,paid:paid,kind:'settle'});});});});return out;}function fixedPlanGrpOk(sk){var cat=String(sk).split('::')[0];return cat==='대출이자'||catGroupOf(cat)==='고정';}
/* ★ 🙈로 접어둔 세부는 「예정 고정지출」에서 뺀다 (세션 62) — 주기적이지 않은 항목을 지우지 않고 목록에서만 감춘다.
   fixedSubAlive 안에 넣으면 안 된다: pruneOrphanFixedDue()가 그 함수로 청소하므로 숨기는 순간 납부일이 영구 삭제된다(§2.8 세션 59와 같은 함정). */
function fixedPlanShown(sk){var p=String(sk).split('::');var sub=p[1]||'';return !(sub&&typeof isSubHidden==='function'&&isSubHidden(p[0],sub));}function fixedSubAlive(sk){var p=String(sk).split('::');var cat=p[0],sub=p[1]||'';if(cat==='대출이자')return true;var grp=catGroupOf(cat);if(!grp)return false;if(!sub)return true;var subs=(dailyTree&&dailyTree[grp]&&dailyTree[grp][cat])||[];return subs.indexOf(sub)>=0;}function fixedDueForDay(dd){if(!dailyTree)loadDailyCats();var agg={},order=[];var y=parseInt(dd.slice(0,4),10),mo=parseInt(dd.slice(5,7),10);function _add(sk,cat,sub,amt){if(!(amt>0))return;var paid=dailyData.some(function(e){return e.date===dd&&(e.cat||e.category)===cat&&(e.sub||'')===sub;});if(paid)return;if(!(sk in agg)){agg[sk]={sk:sk,grp:catGroupOf(cat)||'고정',cat:cat,sub:sub,amt:0};order.push(sk);}agg[sk].amt+=amt;}Object.keys(fixedDue).forEach(function(sk){var fd=fixedDue[sk];if(!fd||!fd.day)return;if(!fixedSubAlive(sk)||!fixedPlanGrpOk(sk)||!fixedPlanShown(sk))return;var due=effDueDate(y,mo,fd.day,!!fd.shift);if(due!==dd)return;if(typeof loanSkInactive==='function'&&loanSkInactive(sk,dd))return;var parts=String(sk).split('::');var cat=parts[0],sub=parts[1]||'';var amt=parseFloat(catBudgetMap('monthly',dd)[sk])||0;var _ln=(cat==='대출이자'&&typeof loanItemOf==='function')?loanItemOf(sub,dd):null;if(_ln)amt=Math.max(0,parseFloat(_ln.regular)||0);_add(sk,cat,sub,amt);});if(typeof loanSettleForRange==='function')loanSettleForRange(dd,dd).forEach(function(s){_add(s.sk,s.cat,s.sub,s.amt);});return order.map(function(k){return agg[k];});}function pickFixedDue(grp,cat,sub,amt){pickCat(grp,cat,sub);if(amt>0){var a=g('dlAmount');if(a){a.value=amt;if(typeof updateAmountWords==='function')updateAmountWords();}}}function fixedNoDateForWeek(dd){if(!dailyTree)loadDailyCats();var map=catBudgetMap('weekly',dd)||{};var out=[];Object.keys(map).forEach(function(k){var amt=parseFloat(map[k])||0;if(amt<=0)return;var parts=String(k).split('::');var cat=parts[0],sub=parts[1]||'';if(catGroupOf(cat)!=='고정')return;if(!fixedSubAlive(k)||!fixedPlanShown(k))return;var fd=fixedDue[k];if(fd&&fd.day)return;if(typeof loanSkInactive==='function'&&loanSkInactive(k,dd))return;var paid=monthEntries(dd).some(function(e){return (e.cat||e.category)===cat&&(e.sub||'')===sub;});out.push({sk:k,cat:cat,sub:sub,amt:amt,paid:paid});});return out;}function fixedPlanForWeek(dd){var map=catBudgetMap('weekly',dd)||{};var agg={},order=[];fixedDueForWeek().forEach(function(it){if((parseFloat(map[it.sk])||0)>0)return;if(!(it.amt>0))return;if(!(it.sk in agg)){agg[it.sk]={sk:it.sk,cat:it.cat,sub:it.sub,due:it.due,amt:it.amt,paid:it.paid,hasReg:(it.kind!=='settle')};order.push(it.sk);}else if(it.kind==='settle'){agg[it.sk].amt+=it.amt;}else if(!agg[it.sk].hasReg){agg[it.sk].amt+=it.amt;agg[it.sk].hasReg=true;}});return order.map(function(k){return agg[k];});}function ensureFixedInWeekBudget(dd){if(isPastPeriod('weekly',dd))return false;var plan=fixedPlanForWeek(dd);if(!plan.length)return false;var map=bWriteMap('weekly',dd);var ch=false;plan.forEach(function(it){if(!(parseFloat(map[it.sk])>0)){map[it.sk]=it.amt;ch=true;}});if(ch)saveDailyBudget();return ch;}function renderWeek(){var wrap=g('dlWeek');if(!wrap)return;renderWeekDue();var start=weekStartMon(dailyDate||todayStr());var names=weekDayNames();var today=todayStr();var cells='';var endStr='';for(var i=0;i<7;i++){var dt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);var ds=localDateStr(dt);if(i===6)endStr=(dt.getMonth()+1)+'/'+dt.getDate();var sel=(ds===dailyDate);var isToday=(ds===today);var tot=dayTotal(ds);var b=dailyBudgetOf(ds);var over=b>0&&tot>b;var spentColor=sel?'#fff':(over?'#d9534f':'var(--ac)');var totHtml=tot>0?'<div style="font-size:13px;font-weight:600;color:'+spentColor+';margin-top:3px">'+fmtComma(tot)+'</div>':'<div style="font-size:13px;color:transparent;margin-top:3px">0</div>';var budHtml=b>0?'<div style="font-size:13px;color:'+(sel?'#ffffffcc':'var(--gray)')+';margin-top:2px">'+abbrWon(b)+'</div>':'';cells+='<div onclick="setDailyDate(\''+ds+'\')" style="cursor:pointer;flex:1 0 46px;box-sizing:border-box;text-align:center;padding:7px 2px;border-radius:6px;border:1px solid '+(sel?'var(--ac)':'var(--tbl-border)')+';background:'+consumeBg(ds,sel)+';color:'+(sel?'#fff':'#111')+'">'+'<div style="font-size:13px;color:'+(sel?'#fff':'var(--gray)')+'">'+names[i]+'</div>'+'<div style="font-size:17px;font-weight:600;line-height:1.35;zoom:.909">'+dt.getDate()+(isToday&&!sel?'<span style="color:var(--ac)">·</span>':'')+'</div>'+totHtml+budHtml+'</div>';}wrap.innerHTML=cells;var s=(start.getMonth()+1)+'/'+start.getDate();var startStr=localDateStr(start);var endFull=localDateStr(new Date(start.getFullYear(),start.getMonth(),start.getDate()+6));var inWeek=(today>=startStr&&today<=endFull);var lbl=g('dlWeekLabel');if(lbl)lbl.textContent=(inWeek?'이번 주 (':'(')+s+' – '+endStr+')';}
function selectDailyMood(m){dailyMood=(dailyMood===m?'':m);document.querySelectorAll('#dlMoodRow .dl-mood').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===dailyMood);});updateMoodLabel();}
function resetDailyForm(){dailyEditId=null;dailyMood='';if(g('dlAmount'))g('dlAmount').value='';dlSetSignNeg(false);if(g('dlCashback'))g('dlCashback').value='';if(g('dlCbDeduct'))g('dlCbDeduct').checked=true;dlSelGroup='';dlSelCat='';dlSelSub='';if(typeof updateCatBtn==='function')updateCatBtn();closeM('catModal');dlPending=[];if(typeof renderPending==='function')renderPending();var _sb=g('dlStageBtn');if(_sb)_sb.style.display='';if(g('dlNote'))g('dlNote').value='';var b=g('dlAddBtn');if(b)b.textContent='저장';var c=g('dlCancel');if(c)c.style.display='none';var _edr=g('dlEditDateRow');if(_edr)_edr.style.display='none';document.querySelectorAll('#dlMoodRow .dl-mood').forEach(function(x){x.classList.remove('on');});updateAmountWords();}
function setDailyDate(v){dailyDate=v||todayStr();resetDailyForm();renderDaily();renderActiveView();}
function dlSignNeg(){var b=g('dlSignBtn');return !!(b&&b.dataset&&b.dataset.neg==='1');}function dlSetSignNeg(v){var b=g('dlSignBtn');if(!b)return;if(v)b.dataset.neg='1';else b.removeAttribute('data-neg');b.style.background=v?'var(--ac-light)':'#fff';b.style.borderColor=v?'var(--ac)':'var(--border)';b.style.color=v?'var(--ac)':'#111';b.style.fontWeight=v?'600':'400';}function toggleAmountSign(){var el=g('dlAmount');if(!el)return;var neg=!dlSignNeg();dlSetSignNeg(neg);var raw=(el.value||'').replace(/,/g,'').trim();var n=raw===''?NaN:parseFloat(raw);if(!isNaN(n)&&n!==0)el.value=String(neg?-Math.abs(n):Math.abs(n));updateAmountWords();}function dlAmountInput(el){var raw=(el.value||'').replace(/,/g,'').trim();var n=raw===''?NaN:parseFloat(raw);if(raw===''){dlSetSignNeg(false);}else if(!isNaN(n)&&n!==0){if(dlSignNeg()&&n>0){el.value=String(-n);n=-n;}dlSetSignNeg(n<0);}updateAmountWords();}function dlReadAmount(){var amtRaw=(g('dlAmount').value||'').replace(/,/g,'').trim();var a=amtRaw===''?0:parseFloat(amtRaw);return isNaN(a)?0:a;}
function mkRec(date,amount,grp,cat,sub,mood,note,cashback,cbDeduct){return {id:Date.now()+'_'+Math.random().toString(36).slice(2,7),date:date,amount:amount,category:cat,group:grp,cat:cat,sub:sub,mood:mood,note:note,cashback:parseFloat(cashback)||0,cbDeduct:cbDeduct!==false};}
function renderPending(){var box=g('dlPendingBox');if(!box)return;if(dailyEditId||!dlPending.length){box.style.display='none';box.innerHTML='';return;}box.style.display='block';var tot=dlPending.reduce(function(s,x){return s+(x.amount||0);},0);var h='<div style="font-size:13px;color:var(--gray);margin-bottom:7px">담은 내역 '+dlPending.length+'건 · 합계 <b style=\'color:var(--ac)\'>'+fmtComma(tot)+'</b>원</div><div style="display:flex;flex-wrap:wrap;gap:6px">';dlPending.forEach(function(it,i){var lbl=(it.sub?it.cat+' · '+it.sub:it.cat);h+='<span style="display:inline-flex;align-items:center;gap:7px;padding:6px 9px 6px 12px;border:1px solid var(--border);border-radius:99px;font-size:13px;background:#fff"><span style="display:inline-block;width:9px;height:9px;border-radius:99px;background:'+catColor(it.cat)+'"></span>'+dlEsc(lbl)+' <b>'+fmtComma(it.amount)+'</b><button type="button" onclick="removePending('+i+')" style="border:none;background:none;cursor:pointer;color:#bbb;font-size:17px;line-height:1;padding:0 2px">×</button></span>';});h+='</div>';box.innerHTML=h;}
function removePending(i){dlPending.splice(i,1);renderPending();}
function stageDailyItem(){if(dailyEditId)return;var amount=dlReadAmount();if(amount===0){alert('금액을 입력해 주세요.');return;}if(!dlSelCat){alert('분류를 선택해 주세요.');return;}var _stNote=g('dlNote')?g('dlNote').value.trim():'';var _stCb=g('dlCashback')?(parseFloat(g('dlCashback').value)||0):0;var _stCbDeduct=g('dlCbDeduct')?g('dlCbDeduct').checked:true;dlPending.push({group:dlSelGroup,cat:dlSelCat,sub:dlSelSub,amount:amount,note:_stNote,cashback:_stCb,cbDeduct:_stCbDeduct});g('dlAmount').value='';dlSetSignNeg(false);updateAmountWords();dlSelGroup='';dlSelCat='';dlSelSub='';if(g('dlNote'))g('dlNote').value='';if(g('dlCashback'))g('dlCashback').value='';if(g('dlCbDeduct'))g('dlCbDeduct').checked=true;updateCatBtn();renderPending();if(g('dlAmount'))g('dlAmount').focus();}
function addDailyEntry(){
  var amount=dlReadAmount();
  var note=g('dlNote')?g('dlNote').value.trim():'';
  var cb=g('dlCashback')?(parseFloat(g('dlCashback').value)||0):0;var cbDeduct=g('dlCbDeduct')?g('dlCbDeduct').checked:true;
  var date=(dailyDate||todayStr());
  if(dailyEditId){
    var rec=dailyData.filter(function(x){return x.id===dailyEditId;})[0];
    var _nd=(g('dlEditDate')&&g('dlEditDate').value)?g('dlEditDate').value:'';var _moved=false;
    if(rec){rec.amount=amount;rec.category=dlSelCat;rec.group=dlSelGroup;rec.cat=dlSelCat;rec.sub=dlSelSub;rec.mood=dailyMood;rec.note=note;rec.cashback=cb;rec.cbDeduct=cbDeduct;
      if(/^\d{4}-\d{2}-\d{2}$/.test(_nd)&&_nd!==rec.date){rec.date=_nd;_moved=true;}}
    saveDaily();if(_moved)dailyDate=_nd;resetDailyForm();renderDaily();if(typeof renderActiveView==='function')renderActiveView();
    if(_moved&&typeof showToast==='function'){var _dp=_nd.split('-');showToast(parseInt(_dp[1],10)+'월 '+parseInt(_dp[2],10)+'일로 옮겼어요');}
    return;
  }
  var items=dlPending.slice();
  if(amount!==0&&dlSelCat)items.push({group:dlSelGroup,cat:dlSelCat,sub:dlSelSub,amount:amount,cashback:cb,cbDeduct:cbDeduct,note:note});
  if(!items.length){
    if(!dailyMood&&!note){alert('금액·기분·메모 중 하나는 입력해 주세요.');return;}
    dailyData.push(mkRec(date,0,'','','',dailyMood,note));
  }else{
    items.forEach(function(it,idx){dailyData.push(mkRec(date,it.amount,it.group,it.cat,it.sub,dailyMood,it.note||'',it.cashback,it.cbDeduct));});
  }
  dlPending=[];saveDaily();resetDailyForm();renderDaily();
}
function startEditDaily(id){
  var rec=dailyData.filter(function(x){return x.id===id;})[0]; if(!rec)return;
  dailyEditId=id;dailyMood=rec.mood||'';
  if(g('dlAmount'))g('dlAmount').value=rec.amount?rec.amount:'';updateAmountWords();if(g('dlCashback'))g('dlCashback').value=rec.cashback?rec.cashback:'';if(g('dlCbDeduct'))g('dlCbDeduct').checked=(rec.cbDeduct!==false);
  dlSelGroup=rec.group||catGroupOf(rec.cat||rec.category)||'';dlSelCat=rec.cat||rec.category||'';dlSelSub=rec.sub||'';updateCatBtn();
  if(g('dlNote'))g('dlNote').value=rec.note||'';
  document.querySelectorAll('#dlMoodRow .dl-mood').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===dailyMood);});
  var b=g('dlAddBtn');if(b)b.textContent='수정 완료';var c=g('dlCancel');if(c)c.style.display='';var _sb=g('dlStageBtn');if(_sb)_sb.style.display='none';dlPending=[];if(typeof renderPending==='function')renderPending();
  if(g('dlDate'))g('dlDate').value=rec.date; dailyDate=rec.date;
  var _edr=g('dlEditDateRow');if(_edr)_edr.style.display='flex';if(g('dlEditDate'))g('dlEditDate').value=rec.date;
}
function cancelEditDaily(){resetDailyForm();renderDaily();}
function deleteDailyEntry(id){
  rsConfirm('이 기록을 삭제할까요?',function(){
  dailyData=dailyData.filter(function(x){return x.id!==id;});
  if(dailyEditId===id)resetDailyForm();
  saveDaily();renderDaily();
  });
}
function dlRowHtml(rec,showDate){
  var _net=entrySpendRaw(rec);var _del=dlCatDeleted(rec.cat||rec.category||'');var _cb=parseFloat(rec.cashback)||0;var _ded=_cb>0&&rec.cbDeduct!==false;
  var desc='';
  if(rec.mood)desc+='<span class="dlr-mood">'+rec.mood+'</span>';
  if(rec.category)desc+='<span class="dlr-cat" style="'+dlCatChip(rec.category)+'">'+dlEsc(rec.category)+'</span>';
  if(_del)desc+='<span style="font-size:13px;color:var(--gray);border:1px solid var(--border);border-radius:99px;padding:0 7px;white-space:nowrap">합산 제외</span>';
  if(dlIsMonthSum(rec))desc+='<span class="hlp" style="font-size:12px;color:var(--gray);border:1px solid var(--border);border-radius:99px;padding:0 7px;white-space:nowrap;cursor:pointer">월 요약<span class="hlp-pop">월간 정산표에서 가져온 <b>그 달의 요약</b>이에요. 월 합계·카테고리·월 예산에는 들어가지만, <b>그 날 하루의 지출·주간 합계·일별 그래프에는 포함되지 않아요.</b></span></span>';
  desc+='<span class="dlr-amt">'+(rec.amount?fmtComma(_ded?_net:rec.amount)+'원':'-')+'</span>';
  if(rec.note)desc+='<span class="dlr-memo">'+dlEsc(rec.note)+'</span>';
  var metaL='';
  if(showDate)metaL+='<span class="dlr-date">'+dlEsc(rec.date)+'</span>';
  if(_cb>0)metaL+='<span class="dlr-cb'+(_ded?' ded':'')+'">'+(_ded?'캐시백 -'+fmtComma(_cb):'캐시백 '+fmtComma(_cb)+' 받음')+'</span>';
  return '<div class="dlr">'+
    '<div class="dlr-main"><div class="dlr-desc">'+desc+'</div></div>'+
    '<div class="dlr-meta"><div class="dlr-meta-left">'+metaL+'</div>'+
    '<div class="dlr-actions">'+
      '<button class="btn btn-ol" onclick="startEditDaily(\''+rec.id+'\')">수정</button>'+
      '<button class="btn btn-ol" onclick="deleteDailyEntry(\''+rec.id+'\')">삭제</button>'+
    '</div></div></div>';
}
var DL_MOOD_DEFAULT=['😄','🙂','😐','😟','😣'];
function loadDailyMoods(){try{var v=JSON.parse(localStorage.getItem('rs_daily_moods')||'null');dailyMoods=(Array.isArray(v)&&v.length)?v:DL_MOOD_DEFAULT.slice();}catch(e){dailyMoods=DL_MOOD_DEFAULT.slice();}var clean=dailyMoods.filter(function(m){return !/^U0001F[0-9A-Fa-f]{3,}$/.test(String(m));});if(clean.length!==dailyMoods.length){dailyMoods=clean.length?clean:DL_MOOD_DEFAULT.slice();saveDailyMoods();}}
function saveDailyMoods(){try{lsSet('rs_daily_moods',JSON.stringify(dailyMoods));}catch(e){}}
function jsArg(s){return "'"+String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'";}
let dailyConsume={};let consumeEmptyCarrot=true;let dlMoodOpen=false;let dlConsumeOpen=false;let dlMoodManage=false;
function loadDailyConsume(){try{dailyConsume=JSON.parse(localStorage.getItem('rs_daily_consume')||'{}')||{};}catch(e){dailyConsume={};}}
function saveDailyConsume(){try{lsSet('rs_daily_consume',JSON.stringify(dailyConsume));}catch(e){}}
function loadConsumeEmpty(){try{var v=localStorage.getItem('rs_consume_empty');consumeEmptyCarrot=(v===null)?true:(v==='1');}catch(e){}}
function saveConsumeEmpty(){try{lsSet('rs_consume_empty',consumeEmptyCarrot?'1':'0');}catch(e){}}
function setConsumeEmptyCarrot(v){consumeEmptyCarrot=!!v;saveConsumeEmpty();renderConsumePanel();if(g('dlWeek'))renderWeek();}
function consumeOf(ds){if(dailyConsume[ds])return dailyConsume[ds];if(!dayNoSpend(ds))return null;return consumeEmptyCarrot?'carrot':null;}
function consumeBg(ds,sel){if(sel)return 'var(--ac)';var v=consumeOf(ds);if(v==='whip')return 'var(--whip-bg,#fbe7e0)';if(v==='carrot')return 'var(--carrot-bg,#eaf3ec)';return '#fff';}
function toggleMoodPanel(){dlMoodOpen=!dlMoodOpen;var e=g('dlMoodRow');if(e)e.style.display=dlMoodOpen?'flex':'none';document.querySelectorAll('.mood-caret').forEach(function(c){c.textContent=dlMoodOpen?'\u25be':'\u25b8';});if(dlMoodOpen)renderMoodOptions();}
function toggleConsumePanel(){dlConsumeOpen=!dlConsumeOpen;var e=g('dlConsumePanel');if(e)e.style.display=dlConsumeOpen?'block':'none';document.querySelectorAll('.consume-caret').forEach(function(c){c.textContent=dlConsumeOpen?'\u25be':'\u25b8';});var o=g('dlConsumeOpt');if(o)o.style.display=dlConsumeOpen?'inline-flex':'none';var cb=g('dlEmptyCarrot');if(cb)cb.checked=consumeEmptyCarrot;if(dlConsumeOpen)renderConsumePanel();}
function toggleMoodManage(){dlMoodManage=!dlMoodManage;renderMoodOptions();}
function delDailyMood(m){if(!dailyMoods)loadDailyMoods();if(dailyMoods.length<=1)return;dailyMoods=dailyMoods.filter(function(x){return x!==m;});saveDailyMoods();if(dailyMood===m)dailyMood='';renderMoodOptions();}
function updateMoodLabel(){var c=g('dlMoodCur');if(c)c.textContent=dailyMood||'';}
function updateConsumeLabel(){var c=g('dlConsumeCur');if(!c)return;var ds=dailyDate||todayStr();var v=dailyConsume[ds];c.innerHTML=(v==='whip')?'<img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">':(v==='carrot'?'🥕':'');}
function setDailyConsume(v){var ds=dailyDate||todayStr();if(dailyConsume[ds]===v){delete dailyConsume[ds];}else{dailyConsume[ds]=v;}saveDailyConsume();renderConsumePanel();updateConsumeLabel();if(g('dlWeek'))renderWeek();}
function renderConsumePanel(){var box=g('dlConsumePanel');if(!box)return;var ds=dailyDate||todayStr();var cur=dailyConsume[ds]||'';function btn(v,label){var on=(cur===v);var mk=(v==='whip')?'var(--whip-mk,#d9534f)':'var(--carrot-mk,#3f9a68)';var bg=(v==='whip')?'var(--whip-bg,#fbe7e0)':'var(--carrot-bg,#eaf3ec)';return '<button type="button" onclick="setDailyConsume('+jsArg(v)+')" style="flex:1;padding:10px;border-radius:8px;border:1.5px solid '+(on?mk:'var(--tbl-border)')+';background:'+(on?bg:'#fff')+';cursor:pointer;font-size:13px;color:#111;font-weight:'+(on?'600':'400')+'">'+label+'</button>';}box.innerHTML='<div style="display:flex;gap:8px">'+btn('carrot','🥕 당근♥︎')+btn('whip','<img src="'+WHIP_IMG+'" alt="채찍" style="height:1.2em;vertical-align:-3px"> 채찍!')+'</div>'+'<div style=\"font-size:13px;color:var(--gray);margin-top:7px;text-align:center;word-break:keep-all\">선택한 걸 한 번 더 누르면 해제돼요.<br>당근·채찍을 안 골라도 괜찮아요.</div>';}
function weekConsumeTally(dateStr){var start=weekStartMon(dateStr||todayStr());var c=0,w=0;for(var i=0;i<7;i++){var dt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);var v=consumeOf(localDateStr(dt));if(v==='carrot')c++;else if(v==='whip')w++;}return {carrot:c,whip:w};}
function weekConsumeBanner(dateStr){var t=weekConsumeTally(dateStr);if(t.carrot===0&&t.whip===0)return '';var win=(t.carrot>=t.whip)?'carrot':'whip';var tie=(t.carrot===t.whip);var bg=(win==='whip')?'var(--whip-bg,#fbe7e0)':'var(--carrot-bg,#eaf3ec)';var mk=(win==='whip')?'var(--whip-mk,#d9534f)':'var(--carrot-mk,#3f9a68)';var icon=(win==='whip')?'<img src="'+WHIP_IMG+'" alt="채찍" style="height:46px;vertical-align:middle">':'<span style="font-size:44px">🥕</span>';var word=(win==='whip')?'채찍':'당근';var bsuffix=(win==='whip')?'!':'♥︎';var sub=tie?('당근 '+t.carrot+' · 채찍 '+t.whip+' · 비겼어요'):('당근 '+t.carrot+'일 · 채찍 '+t.whip+'일');return '<div style="background:'+bg+';border:3px solid '+mk+';border-radius:10px;padding:16px;text-align:center;margin-bottom:12px"><div style="font-size:13px;color:var(--gray);margin-bottom:4px">이번 주 나의 소비는</div><div style="font-size:30px;font-weight:800;color:'+mk+';line-height:1.15">'+icon+' '+word+bsuffix+'</div><div style="font-size:13px;color:var(--gray);margin-top:6px">'+sub+'</div></div>';}
function renderMoodOptions(){var row=g('dlMoodRow');if(!row)return;if(!dailyMoods)loadDailyMoods();var h='';dailyMoods.forEach(function(m){var on=(m===dailyMood)?' on':'';h+='<span style="position:relative;display:inline-flex">';h+='<button type="button" class="dl-mood'+on+'" data-m="'+dlEsc(m)+'" onclick="selectDailyMood('+jsArg(m)+')">'+dlEsc(m)+'</button>';if(dlMoodManage&&dailyMoods.length>1)h+='<button type="button" onclick="delDailyMood('+jsArg(m)+')" title="삭제" style="position:absolute;top:-7px;right:-7px;width:16px;height:16px;line-height:14px;text-align:center;border-radius:50%;border:none;background:#d9534f;color:#fff;font-size:13px;cursor:pointer;padding:0">\u00d7</button>';h+='</span>';});h+='<button type="button" class="btn btn-ol" onclick="addDailyMood()" style="font-size:13px;padding:5px 9px" title="기분 추가">+</button>';h+='<button type="button" class="btn btn-ol" onclick="toggleMoodManage()" style="font-size:13px;padding:5px 9px">'+(dlMoodManage?'완료':'관리')+'</button>';row.innerHTML=h;updateMoodLabel();}
function addDailyMood(){rsPrompt('기분 이모티콘 추가',{desc:'이모티콘을 입력하거나 붙여넣어 주세요 :)',placeholder:'😀'},function(m){if(m==null)return;m=String(m).trim();if(!m)return;if(!dailyMoods)loadDailyMoods();if(dailyMoods.indexOf(m)>=0){dailyMood=m;renderMoodOptions();return;}dailyMoods.push(m);saveDailyMoods();dailyMood=m;renderMoodOptions();});}
function dailyBudgetOf(ds){return dailyBudgetMap[ds]||0;}
function weekKey(ds){return localDateStr(weekStartMon(ds));}
var settleStartDay=1; /* 월간 정산 시작일 1~31, 1=달력월(기본). localStorage rs_month_start */
var settleShortMode='last'; /* 말일 없는 달: 'last'=그달 말일로, 'next'=다음달1일로. rs_month_shortmode */
var _pendingSettleStart=null; /* 짧은 달 모달이 setSettleStart에서 열릴 때만 값이 채워진다 (세션 44) */
function _dim(y,m){return new Date(y,m,0).getDate();}
function settleEffStart(y,m){var dim=_dim(y,m);if(settleStartDay<=dim)return settleStartDay;return settleShortMode==='next'?dim+1:dim;}
function monthKey(ds){var s=String(ds);if(settleStartDay<=1)return s.slice(0,7);var y=parseInt(s.slice(0,4),10),m=parseInt(s.slice(5,7),10),d=parseInt(s.slice(8,10),10);if(!y||!m||!d)return s.slice(0,7);var eff=settleEffStart(y,m);if(d>=eff){m++;if(m>12){m=1;y++;}}return y+'-'+String(m).padStart(2,'0');}
function prevMonthKey(mk){var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);m--;if(m<1){m=12;y--;}return y+'-'+String(m).padStart(2,'0');}
function monthFirstDate(mk){var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);if(settleStartDay<=1)return mk+'-01';var py=y,pm=m-1;if(pm<1){pm=12;py--;}var eff=settleEffStart(py,pm);if(eff>_dim(py,pm))return mk+'-01';return py+'-'+String(pm).padStart(2,'0')+'-'+String(eff).padStart(2,'0');}
function monthLastDate(mk){var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);var ny=y,nm=m+1;if(nm>12){nm=1;ny++;}var nf=monthFirstDate(ny+'-'+String(nm).padStart(2,'0'));var dt=new Date(nf+'T00:00:00');dt.setDate(dt.getDate()-1);return localDateStr(dt);}
function monthRangeLabel(mk){if(settleStartDay<=1)return '';var f=monthFirstDate(mk).split('-'),l=monthLastDate(mk).split('-');return parseInt(f[1],10)+'/'+parseInt(f[2],10)+'~'+parseInt(l[1],10)+'/'+parseInt(l[2],10);}
function openShortMonthAsk(){var m=g('shortMonthModal');if(m)m.classList.add('open');}
function pickShortMode(mode){settleShortMode=(mode==='next')?'next':'last';try{lsSet('rs_month_shortmode',settleShortMode);}catch(e){}if(_pendingSettleStart!=null){settleStartDay=_pendingSettleStart;_pendingSettleStart=null;try{lsSet('rs_month_start',String(settleStartDay));}catch(e){}}var m=g('shortMonthModal');if(m)m.classList.remove('open');if(typeof renderDaily==='function')renderDaily();if(typeof renderActiveView==='function')renderActiveView();}
function setSettleStart(v){var n=parseInt(v,10);if(isNaN(n)||n<1)n=1;if(n>31)n=31;if(n>=29&&n<=31&&!localStorage.getItem('rs_month_shortmode')){_pendingSettleStart=n;openShortMonthAsk();return;}settleStartDay=n;try{lsSet('rs_month_start',String(n));}catch(e){}if(typeof renderDaily==='function')renderDaily();if(typeof renderActiveView==='function')renderActiveView();}function isPastPeriod(scope,ds){var t=todayStr();if(scope==='weekly')return weekKey(ds)<weekKey(t);return monthKey(ds)<monthKey(t);}
function weeklyBudgetOf(ds){return weeklyBudgetMap[weekKey(ds)]||0;}
function monthlyBudgetOf(ds){return monthlyBudgetMap[monthKey(ds)]||0;}
var fixedDue={};var holidays=[];var loanOvVer=0,loanOvCache={};function pruneOrphanFixedDue(){var ch=false;Object.keys(fixedDue).forEach(function(sk){if(!fixedSubAlive(sk)){delete fixedDue[sk];ch=true;}});if(ch)saveFixedDue();}function loadFixedDue(){try{var v=JSON.parse(localStorage.getItem('rs_fixed_due')||'{}');fixedDue=(v&&typeof v==='object'&&!Array.isArray(v))?v:{};}catch(e){fixedDue={};}pruneOrphanFixedDue();}function saveFixedDue(){try{lsSet('rs_fixed_due',JSON.stringify(fixedDue));}catch(e){}loanOvVer++;}function loadHolidays(){try{var h=JSON.parse(localStorage.getItem('rs_holidays')||'[]');holidays=Array.isArray(h)?h:[];}catch(e){holidays=[];}}function saveHolidays(){try{lsSet('rs_holidays',JSON.stringify(holidays));}catch(e){}}function dlWeekdayKo(ds){var d=new Date(ds+'T00:00:00');return ['일','월','화','수','목','금','토'][d.getDay()];}function isHoliday(ds){var d=new Date(ds+'T00:00:00');var w=d.getDay();if(w===0||w===6)return true;return holidays.indexOf(ds)>=0;}function nextBusinessDay(ds){var d=new Date(ds+'T00:00:00');var guard=0;while(isHoliday(localDateStr(d))&&guard<400){d.setDate(d.getDate()+1);guard++;}return localDateStr(d);}function effDueDate(year,month1,day,shift){var dim=new Date(year,month1,0).getDate();var dd=Math.max(1,Math.min(parseInt(day,10)||1,dim));var ds=year+'-'+String(month1).padStart(2,'0')+'-'+String(dd).padStart(2,'0');return shift?nextBusinessDay(ds):ds;}function openHolidayMod(){renderHolidayList();var m=g('holidayMod');if(m)m.classList.add('open');}function renderHolidayList(){var box=g('holidayList');if(!box)return;var arr=holidays.slice().sort();if(!arr.length){box.innerHTML='<div style="color:var(--gray);font-size:13px;padding:6px 0">등록된 공휴일이 없어요. 토·일은 자동으로 적용돼요.</div>';return;}box.innerHTML=arr.map(function(d){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 2px;border-bottom:1px solid var(--tbl-border)"><span style="font-size:13px;color:#111">'+dlEsc(d)+' <span style="color:var(--gray);font-size:13px">('+dlWeekdayKo(d)+')</span></span><button class="btn btn-ol" style="font-size:13px;padding:3px 8px" onclick="removeHoliday('+jsArg(d)+')">삭제</button></div>';}).join('');}function addHoliday(){var inp=g('holidayInput');if(!inp||!inp.value)return;var v=inp.value;if(holidays.indexOf(v)<0){holidays.push(v);holidays.sort();saveHolidays();}inp.value='';renderHolidayList();}function removeHoliday(d){holidays=holidays.filter(function(x){return x!==d;});saveHolidays();renderHolidayList();}function loadDailyBudget(){try{var v=JSON.parse(localStorage.getItem('rs_daily_budget')||'null');if(v){dailyBudgetMap=(v.dailyMap&&typeof v.dailyMap==='object')?v.dailyMap:{};weeklyBudgetMap=(v.weeklyMap&&typeof v.weeklyMap==='object')?v.weeklyMap:{};monthlyBudgetMap=(v.monthlyMap&&typeof v.monthlyMap==='object')?v.monthlyMap:{};catWeeklyBudget=(v.catWeekly&&typeof v.catWeekly==='object')?v.catWeekly:{};catMonthlyBudget=(v.catMonthly&&typeof v.catMonthly==='object')?v.catMonthly:{};catWeeklyPast=(v.catWeeklyPast&&typeof v.catWeeklyPast==='object')?v.catWeeklyPast:{};catMonthlyPast=(v.catMonthlyPast&&typeof v.catMonthlyPast==='object')?v.catMonthlyPast:{};}}catch(e){dailyBudgetMap={};weeklyBudgetMap={};monthlyBudgetMap={};catWeeklyBudget={};catMonthlyBudget={};}[catWeeklyBudget,catMonthlyBudget].forEach(function(m){Object.keys(m).forEach(function(k){if(k.indexOf('\u0001')>=0){m[k.split('\u0001').join('::')]=m[k];delete m[k];}});});}
function saveDailyBudget(){try{lsSet('rs_daily_budget',JSON.stringify({dailyMap:dailyBudgetMap,weeklyMap:weeklyBudgetMap,monthlyMap:monthlyBudgetMap,catWeekly:catWeeklyBudget,catMonthly:catMonthlyBudget,catWeeklyPast:catWeeklyPast,catMonthlyPast:catMonthlyPast}));}catch(e){}}
function setDailyBudget(v){var n=parseFloat(String(v).replace(/,/g,''));var dd=dailyDate||todayStr();n=isNaN(n)||n<0?0:n;if(n>0)dailyBudgetMap[dd]=n;else delete dailyBudgetMap[dd];saveDailyBudget();renderBudget();renderWeek();renderActiveView();}
function setWeeklyBudget(v){var n=parseFloat(String(v).replace(/,/g,''));var k=weekKey(dailyDate||todayStr());n=isNaN(n)||n<0?0:n;if(n>0)weeklyBudgetMap[k]=n;else delete weeklyBudgetMap[k];saveDailyBudget();renderBudget();renderActiveView();}
function setMonthlyBudget(v){var n=parseFloat(String(v).replace(/,/g,''));var k=monthKey(dailyDate||todayStr());n=isNaN(n)||n<0?0:n;if(n>0)monthlyBudgetMap[k]=n;else delete monthlyBudgetMap[k];saveDailyBudget();renderActiveView();}
function toggleOffBudget(){dlOffBudgetOpen=!dlOffBudgetOpen;renderActiveView();}function toggleDelCatOpen(){dlDelCatOpen=!dlDelCatOpen;renderActiveView();}function setFixedDueDay(sk,v,mk){var d=parseInt(v,10);if(!fixedDue[sk])fixedDue[sk]={};var oldDay=fixedDue[sk].day;if(!d||d<1){delete fixedDue[sk].day;}else{fixedDue[sk].day=Math.min(31,Math.max(1,d));}if(oldDay&&fixedDue[sk].day&&oldDay!==fixedDue[sk].day){var _mk=mk||monthKey(todayStr());var hist=fixedDue[sk].dayHist||(fixedDue[sk].dayHist=[]);var existing=null;for(var i=0;i<hist.length;i++){if(hist[i]&&hist[i].mk===_mk){existing=hist[i];break;}}if(!existing)hist.push({mk:_mk,prevDay:oldDay});}if(fixedDue[sk]&&!fixedDue[sk].day&&!fixedDue[sk].shift)delete fixedDue[sk];saveFixedDue();renderActiveView();}function setFixedDueShift(sk,on){if(!fixedDue[sk])fixedDue[sk]={};fixedDue[sk].shift=!!on;if(!fixedDue[sk].day&&!fixedDue[sk].shift)delete fixedDue[sk];saveFixedDue();renderActiveView();}
function _dueHistRerender(){renderActiveView();if(typeof renderAssets==='function'&&g('assetTable'))renderAssets();}function toggleDueHist(sk){dueHistOpen[sk]=!dueHistOpen[sk];_dueHistRerender();}
function addDueHist(sk,mk){if(!fixedDue[sk])fixedDue[sk]={};if(!fixedDue[sk].dayHist)fixedDue[sk].dayHist=[];var _mk=mk||monthKey(dailyDate||todayStr());fixedDue[sk].dayHist.push({mk:_mk,prevDay:''});dueHistOpen[sk]=true;saveFixedDue();_dueHistRerender();}
function setDueHist(sk,idx,field,val){if(!fixedDue[sk]||!fixedDue[sk].dayHist||!fixedDue[sk].dayHist[idx])return;if(field==='mk')fixedDue[sk].dayHist[idx].mk=val;else fixedDue[sk].dayHist[idx].prevDay=val?Math.min(31,Math.max(1,parseInt(val,10)||1)):'';saveFixedDue();_dueHistRerender();}
function delDueHist(sk,idx){if(!fixedDue[sk]||!fixedDue[sk].dayHist)return;fixedDue[sk].dayHist.splice(idx,1);if(!fixedDue[sk].dayHist.length)delete fixedDue[sk].dayHist;saveFixedDue();_dueHistRerender();}
function weekTotal(dateStr){var start=weekStartMon(dateStr);var s=0;for(var i=0;i<7;i++){var dt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);s+=dayTotal(localDateStr(dt));}return s;}
function commaInput(el){var v=(el.value||'').replace(/[^0-9]/g,'');el.value=v?fmtComma(Number(v)):'';}function loanMonthlyInterest(amt,rate,ds){ds=ds||todayStr();var y=parseInt(ds.slice(0,4),10),mo=parseInt(ds.slice(5,7),10);var dim=new Date(y,mo,0).getDate();return Math.floor((parseFloat(amt)||0)*(parseFloat(rate)||0)/100*dim/365);}
function addMonthsMk(mk,delta){var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10)-1+delta;y+=Math.floor(m/12);m=((m%12)+12)%12;return y+'-'+String(m+1).padStart(2,'0');}
function daysInMk(mk){var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);return new Date(y,m,0).getDate();}
function prevMonthDays(mk){return daysInMk(addMonthsMk(mk,-1));}
function loanElapsedDays(mk,fd,shift){var day=fd&&fd.day;var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);var pm=addMonthsMk(mk,-1);var py=parseInt(pm.slice(0,4),10),pmo=parseInt(pm.slice(5,7),10);var prevDay=day;var hist=(fd&&fd.dayHist)||[];for(var i=0;i<hist.length;i++){if(hist[i]&&hist[i].mk===mk&&hist[i].prevDay){prevDay=hist[i].prevDay;break;}}var cur=new Date(effDueDate(y,m,day,shift)),prev=new Date(effDueDate(py,pmo,prevDay,shift));var d=Math.round((cur-prev)/86400000);return d>0?d:daysInMk(pm);}
function loanOpenDate(a){var v=((a&&a.openDate)||'').trim();return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:'';}
function loanDueNominal(a,mk){var name=((a&&a.name||'').trim())||'대출';var fd=(typeof fixedDue!=='undefined'&&fixedDue)?fixedDue[subKey('대출이자',name)]:null;var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);if(fd&&fd.day)return effDueDate(y,m,fd.day,false);return mk+'-'+String(daysInMk(mk)).padStart(2,'0');}
function loanFirstDays(a,mk,k){if(k!==1)return 0;var od=loanOpenDate(a);if(!od)return 0;var dd=loanDayDiff(od,loanDueNominal(a,mk));var full=loanDays(a,mk);if(dd<=0||dd>=full)return 0;return dd;}
function loanIntOnlyMonth(a,bal,rate,mk){var od=loanOpenDate(a);if(od){var nd=loanDueNominal(a,mk);if(od>=nd)return 0;var pd=loanDueNominal(a,prevMonthKey(mk));if(od>pd){var dd=loanDayDiff(od,nd);return dd>0?Math.floor(bal*(rate/100)*dd/365):0;}}var _nm=((a&&a.name||'').trim())||'대출';var _fd=(typeof fixedDue!=='undefined'&&fixedDue)?fixedDue[subKey('대출이자',_nm)]:null;var _hist=(_fd&&_fd.dayHist)||[];for(var _i=0;_i<_hist.length;_i++){if(_hist[_i]&&_hist[_i].mk===mk&&_hist[_i].prevDay){var _dd=loanElapsedDays(mk,_fd,!!_fd.shift);return Math.floor(bal*(rate/100)*_dd/365);}}return loanMonthlyInterest(bal,rate,mk+'-01');}
function loanDays(a,mk){var name=((a&&a.name||'').trim())||'대출';var fd=(typeof fixedDue!=='undefined'&&fixedDue)?fixedDue[subKey('대출이자',name)]:null;return (fd&&fd.day)?loanElapsedDays(mk,fd,false):prevMonthDays(mk);}
function loanRateAt(a,mk){var base=parseFloat(a&&a.rate)||0;var h=(a&&a.rateHist)||[];var best=null;for(var i=0;i<h.length;i++){var e=h[i];if(!e||!e.mk)continue;if(e.mk<=mk&&(!best||e.mk>best.mk))best=e;}return best?(parseFloat(best.rate)||0):base;}
function loanRepays(a){var r=(a&&a.repays)||[];if(!Array.isArray(r))return [];return r.filter(function(x){return x&&x.d;}).slice().sort(function(x,y){return x.d<y.d?-1:(x.d>y.d?1:0);});}function loanDueOn(a,mk){var name=((a&&a.name||'').trim())||'대출';var fd=(typeof fixedDue!=='undefined'&&fixedDue)?fixedDue[subKey('대출이자',name)]:null;var y=parseInt(mk.slice(0,4),10),m=parseInt(mk.slice(5,7),10);if(fd&&fd.day)return effDueDate(y,m,fd.day,!!fd.shift);return mk+'-'+String(daysInMk(mk)).padStart(2,'0');}function loanDayDiff(d1,d2){var v=Math.round((new Date(d2+'T00:00:00')-new Date(d1+'T00:00:00'))/86400000);return isNaN(v)?0:v;}function loanRepayAmt(ev,bal){if(!ev)return 0;if(ev.full)return bal;var v=Math.round(parseFloat(String(ev.amt==null?0:ev.amt).replace(/,/g,''))||0);if(v<0)v=0;return v>bal?bal:v;}function loanSchedule(a){if(!a||a.type!=='대출')return [];var method=a.method||'이자';if(method==='이자')return [];var P=Math.round(parseFloat(a.amount)||0),n=parseInt(a.term,10)||0;if(P<=0||n<=0)return [];var start=a.startMk||monthKey(todayStr());var basePr=(method==='원금')?Math.floor(P/n/10)*10:0;var bal=P,out=[],M=0,prevR=null;var reps=loanRepays(a);function _segInt(b,d1,d2,ann,r,span,method){var dd=loanDayDiff(d1,d2);if(dd<0)dd=0;return (method==='원금')?Math.floor(b*(ann/100)*dd/365):Math.round(b*r*dd/span);}for(var k=1;k<=n;k++){var mk=addMonthsMk(start,k-1);var ann=loanRateAt(a,mk);var _pd=loanDueOn(a,addMonthsMk(mk,-1)),_cd=loanDueOn(a,mk);var span=loanDayDiff(_pd,_cd);if(span<=0)span=daysInMk(mk);var r=ann/100/12;var it=0,pr=0,extra=0,ended=false,cursor=_pd;var pre=[],post=[];reps.forEach(function(x){if(monthKey(x.d)!==mk)return;(x.d<=_cd?pre:post).push(x);});var evList=[];for(var q=0;q<pre.length;q++){var _i1=_segInt(bal,cursor,pre[q].d,ann,r,span,method);it+=_i1;var am1=loanRepayAmt(pre[q],bal);bal-=am1;extra+=am1;cursor=pre[q].d;evList.push({d:pre[q].d,it:_i1,pr:am1});if(pre[q].full||bal<=0){ended=true;break;}}if(!ended){if(pre.length){it+=_segInt(bal,cursor,_cd,ann,r,span,method);if(method==='원금'){basePr=Math.floor(bal/(n-k+1)/10)*10;}else{var rem0=n-k+1;M=(r===0)?bal/rem0:bal*r*Math.pow(1+r,rem0)/(Math.pow(1+r,rem0)-1);prevR=ann;}}else{if(method==='원금'){var _fd1=loanFirstDays(a,mk,k);it+=Math.floor(bal*(ann/100)*(_fd1||loanDays(a,mk))/365);}else{if(prevR===null||ann!==prevR){var rem=n-k+1;M=(r===0)?bal/rem:bal*r*Math.pow(1+r,rem)/(Math.pow(1+r,rem)-1);prevR=ann;}var _fd2=loanFirstDays(a,mk,k),_ff2=loanDays(a,mk);it+=(_fd2&&_ff2>0)?Math.round(bal*r*_fd2/_ff2):Math.round(bal*r);}}pr=(k===n)?bal:((method==='원금')?basePr:(Math.round(M)-Math.round(bal*r)));if(pr<0)pr=0;if(pr>bal)pr=bal;bal-=pr;cursor=_cd;for(var q2=0;q2<post.length;q2++){var _i2=_segInt(bal,cursor,post[q2].d,ann,r,span,method);it+=_i2;var am2=loanRepayAmt(post[q2],bal);bal-=am2;extra+=am2;cursor=post[q2].d;evList.push({d:post[q2].d,it:_i2,pr:am2});if(post[q2].full||bal<=0){ended=true;break;}}if(!ended&&post.length&&(n-k)>0){if(method==='원금'){basePr=Math.floor(bal/(n-k)/10)*10;}else{var rem4=n-k;M=(r===0)?bal/rem4:bal*r*Math.pow(1+r,rem4)/(Math.pow(1+r,rem4)-1);prevR=ann;}}}var pay=pr+it+extra;out.push({mk:mk,pay:pay,principal:pr+extra,interest:it,balAfter:bal,rate:ann,repay:extra,evs:evList});if(ended||bal<=0)break;}return out;}function loanEndMk(a){if(!a||a.type!=='대출')return '';var method=a.method||'이자';var reps=loanRepays(a);if(method==='이자'){var P0=Math.round(parseFloat(a.amount)||0),bal=P0;for(var i=0;i<reps.length;i++){bal-=loanRepayAmt(reps[i],bal);if(bal<=0)return monthKey(reps[i].d);}return '';}var sch=loanSchedule(a);if(!sch.length)return '';return sch[sch.length-1].mk;}function loanSkInactive(sk,ds){if(String(sk).indexOf('대출이자::')!==0)return false;var nm=String(sk).split('::')[1]||'';if(!assets)loadAssets();var a=assets.filter(function(x){return x.type==='대출'&&(((x.name||'').trim())||'대출')===nm;})[0];if(!a)return false;var end=loanEndMk(a);if(!end)return false;return monthKey(ds||todayStr())>end;}
function loanMonthInfo(a,mk){if(!a||a.type!=='대출')return null;var method=a.method||'이자';if(method==='이자'){var P=Math.round(parseFloat(a.amount)||0),rate=loanRateAt(a,mk);if(P<=0||rate<=0)return null;var reps=loanRepays(a);var pd=loanDueOn(a,prevMonthKey(mk)),cd=loanDueOn(a,mk);var bal=P,i;for(i=0;i<reps.length;i++){if(monthKey(reps[i].d)>=mk)break;bal-=loanRepayAmt(reps[i],bal);}if(bal<=0)return null;var evs=reps.filter(function(x){return monthKey(x.d)===mk;});if(!evs.length){var it0=loanIntOnlyMonth(a,bal,rate,mk);return {principal:0,interest:it0,pay:it0,balAfter:bal};}var extra=0,itot=0,done=false,evList=[];for(i=0;i<evs.length;i++){if(evs[i].full||loanRepayAmt(evs[i],bal)>=bal){var _reg=0,_set=0;if(evs[i].d>cd){_reg=loanMonthlyInterest(bal,rate,mk+'-01');var d2=loanDayDiff(cd,evs[i].d);if(d2<0)d2=0;_set=Math.floor(bal*(rate/100)*d2/365);}else{var d1=loanDayDiff(pd,evs[i].d);if(d1<0)d1=0;_set=Math.floor(bal*(rate/100)*d1/365);}itot=_reg+_set;evList.push({d:evs[i].d,it:_set,pr:bal});extra+=bal;bal=0;done=true;break;}var am=loanRepayAmt(evs[i],bal);extra+=am;bal-=am;evList.push({d:evs[i].d,it:0,pr:am});}if(!done)itot=loanMonthlyInterest(bal+extra,rate,mk+'-01');return {principal:extra,interest:itot,pay:extra+itot,balAfter:bal,repay:extra,evs:evList};}var sch=loanSchedule(a);for(var i=0;i<sch.length;i++)if(sch[i].mk===mk)return sch[i];return null;}
function loanRemaining(a,mk){if(!a||a.type!=='대출')return parseFloat(a&&a.amount)||0;var P=Math.round(parseFloat(a.amount)||0);if((a.method||'이자')==='이자'){var _rp=loanRepays(a),_b=P;for(var _i=0;_i<_rp.length;_i++){if(monthKey(_rp[_i].d)>=mk)break;_b-=loanRepayAmt(_rp[_i],_b);}return _b>0?_b:0;}var sch=loanSchedule(a);if(!sch.length)return P;var rem=P;for(var i=0;i<sch.length;i++){if(sch[i].mk<mk)rem=sch[i].balAfter;else break;}return rem;}
function assetAmt(a,mk){if(a&&a.type==='대출')return loanRemaining(a,mk||monthKey(todayStr()));return parseFloat(a&&a.amount)||0;}
function loanMonthExpense(mk){if(!assets)loadAssets();var out={total:0,items:[]};assets.forEach(function(a){if(a.type!=='대출')return;var info=loanMonthInfo(a,mk);if(!info||info.pay<=0)return;var mode=(a.method&&a.method!=='이자'&&a.spendMode==='interest')?'interest':'full';var _rp=Math.max(0,parseFloat(info.repay)||0);var reflected=(mode==='interest')?info.interest:(info.pay-_rp);if(reflected<0)reflected=0;if(reflected<=0)return;out.total+=reflected;var _settle=[],_sum=0;(info.evs||[]).forEach(function(ev){var v=Math.max(0,parseFloat(ev.it)||0);if(v<=0)return;_settle.push({d:ev.d,amt:v});_sum+=v;});if(_sum>reflected){_sum=reflected;}var _regular=Math.max(0,reflected-_sum);out.items.push({name:((a.name||'').trim())||'대출',method:a.method||'이자',principal:Math.max(0,(info.principal||0)-_rp),interest:info.interest,pay:info.pay,repay:_rp,reflected:reflected,regular:_regular,settle:_settle,mode:mode});});return out;}
function loanPaidOff(a){if(!a||a.type!=='대출')return false;var reps=loanRepays(a);var endMk=loanEndMk(a);var curMk=monthKey(todayStr());return !!(endMk&&reps.length&&reps[reps.length-1].full&&endMk<=curMk);}
function loanCatNames(){if(!assets)loadAssets();var names=[];assets.forEach(function(a){if(a.type!=='대출')return;var nm=((a.name||'').trim())||'대출';if((parseFloat(a.rate)||0)>0&&(parseFloat(a.amount)||0)>0&&names.indexOf(nm)<0)names.push(nm);});return names;}
function ensureLoanCats(){if(!dailyTree)loadDailyCats();if(!dailyTree['고정'])dailyTree['고정']={};var names=loanCatNames();var cur=dailyTree['고정']['대출이자']||null;var changed=false;if(!names.length){if(cur){delete dailyTree['고정']['대출이자'];changed=true;}}else if(!cur||cur.join('\u0001')!==names.join('\u0001')){dailyTree['고정']['대출이자']=names.slice();changed=true;}if(changed){try{dailyCats=dlFlattenCats(dailyTree);}catch(e){}try{saveDailyCats();}catch(e){}}if(typeof ensureLoanBudget==='function')ensureLoanBudget();return names;}function ensureLoanBudget(){if(typeof loanMonthExpense!=='function')return false;if(typeof catMonthlyBudget==='undefined'||!catMonthlyBudget)return false;var mk=curPKey('monthly');var want={},prev={};try{loanMonthExpense(mk).items.forEach(function(it){want[subKey('대출이자',it.name)]=it.reflected;});}catch(e){return false;}try{loanMonthExpense(prevMonthKey(mk)).items.forEach(function(it){prev[subKey('대출이자',it.name)]=it.reflected;});}catch(e){}var ch=false;loanCatNames().forEach(function(nm){var sk=subKey('대출이자',nm);var v=want[sk]||0;var cur=parseFloat(catMonthlyBudget[sk])||0;if(v>0){if(cur!==v){catMonthlyBudget[sk]=v;ch=true;}}else if(cur>0&&cur===(prev[sk]||0)){delete catMonthlyBudget[sk];ch=true;}});if(ch){try{saveDailyBudget();}catch(e){}}return ch;}function loanRow(a){if(a.type!=='대출')return '';var curMk=monthKey(todayStr());var method=a.method||'이자';var amt=Math.round(parseFloat(a.amount)||0);var incl=!!a.incl;var info=loanMonthInfo(a,curMk);var rem=loanRemaining(a,curMk);var repaid=amt-rem;var amort=(method==='원리금'||method==='원금');var LBL={'원리금':'원리금균등','원금':'원금균등','이자':'만기일시(이자만)'};var id=jsArg(a.id);var mopts=['원리금','원금','이자'].map(function(m){return '<option value="'+m+'"'+(m===method?' selected':'')+'>'+LBL[m]+'</option>';}).join('');var won=function(v){return fmtComma(v)+'<span class="ln-u">원</span>';};var stat=function(k,v,sub){return '<div class="ln-stat"><div class="ln-k">'+k+'</div><div class="ln-v">'+v+'</div>'+(sub?'<div class="ln-sub">'+sub+'</div>':'')+'</div>';};var s1;if(!info){s1=stat('이번 달 상환','<span class="ln-none">없음</span>','');}else if(method==='이자'){s1=stat('이번 달 이자',won(info.interest),'원금은 만기에 한 번에');}else{s1=stat('이번 달 상환',won(info.pay),'원금 '+fmtComma(info.principal)+' + 이자 '+fmtComma(info.interest));}var s2=stat('현재 잔액',won(rem),'<span class="nw">대출총액 '+fmtComma(amt)+'원</span>'+(repaid>0?('<span class="nw" style="display:block;color:var(--ac)">−'+fmtComma(repaid)+'원 상환</span>'):''));var stats='<div class="ln-stats">'+s1+s2+'</div>';var row=lnRow;var hist=(a.rateHist||[]);var rhOpen=!!loanRateOpen[a.id];var curRate=loanRateAt(a,curMk);var rMethod=row('상환 방식','<select class="ln-in" onchange="setLoanField('+id+',\'method\',this.value)">'+mopts+'</select>');var rRate=row('이자율','<input class="ln-in num" type="number" step="0.001" value="'+(a.rate||'')+'" placeholder="0" onchange="setLoanField('+id+',\'rate\',this.value)"><span class="ln-u">%</span>',hist.length?('이번 달 적용 금리 <b style="color:#111">'+curRate+'%</b> (금리 변경 이력 기준)'):'');var rTerm=amort?row('상환 기간','<input class="ln-in num" type="number" min="1" step="1" value="'+(a.term||'')+'" placeholder="0" onchange="setLoanField('+id+',\'term\',this.value)"><span class="ln-u">개월</span>'):'';var rStart=amort?row('첫 상환월','<input class="ln-in" type="month" value="'+(a.startMk||curMk)+'" onchange="setLoanField('+id+',\'startMk\',this.value)">'):'';var rOpenD=row('대출 실행일','<input class="ln-in" type="date" value="'+(a.openDate||'')+'" onchange="setLoanField('+id+',\'openDate\',this.value)">','첫 달 이자를 실행일부터 일할 계산해요');var xBtn=function(call){return '<button type="button" class="ln-x" title="삭제" onclick="'+call+'">×</button>';};var addBtn=function(call,label){return '<button type="button" class="ln-add" onclick="'+call+'">+ '+label+'</button>';};var rhRows=hist.map(function(h,ix){return '<div class="ln-item"><input class="ln-in" type="month" value="'+(h.mk||'')+'" onchange="setLoanRateHist('+id+','+ix+',\'mk\',this.value)"><span class="ln-u">부터</span><input class="ln-in num" type="number" step="0.001" value="'+(h.rate||'')+'" onchange="setLoanRateHist('+id+','+ix+',\'rate\',this.value)"><span class="ln-u">%</span>'+xBtn('delLoanRate('+id+','+ix+')')+'</div>';}).join('');var rhBody=rhOpen?('<div class="ln-body"><div class="ln-desc">금리가 바뀐 <span class="nw">적용월</span>과 <span class="nw">새 금리</span>만 넣으면 그 달부터 자동으로 반영돼요.</div>'+rhRows+addBtn('addLoanRate('+id+')','금리 변경 추가')+'</div>'):'';var _dsk=subKey('대출이자',(a.name||'').trim()||'대출');var _dskA=jsArg(_dsk);var _dfd=(typeof fixedDue!=='undefined'&&fixedDue)?(fixedDue[_dsk]||{}):{};var _dh=_dfd.dayHist||[];var dhOpen=!!dueHistOpen[_dsk];var dhRows=_dh.map(function(h,ix){return '<div class="ln-item"><input class="ln-in" type="month" value="'+(h.mk||'')+'" onchange="setDueHist('+_dskA+','+ix+',\'mk\',this.value)"><span class="ln-u">예전 결제일</span><input class="ln-in num" style="width:44px" type="number" min="1" max="31" value="'+(h.prevDay||'')+'" placeholder="9" onchange="setDueHist('+_dskA+','+ix+',\'prevDay\',this.value)"><span class="ln-u">일</span>'+xBtn('delDueHist('+_dskA+','+ix+')')+'</div>';}).join('');var dhNote=_dfd.day?('<div class="ln-desc">현재 납부일 <b style="color:#111">매월 '+_dfd.day+'일</b> · <span class="nw">월간 예산 › 고정지출 › 대출이자</span>에서 바꿀 수 있어요.</div>'):'';var dhBody=dhOpen?('<div class="ln-body">'+dhNote+'<div class="ln-desc">납부일을 바꾸면 <b>그 달만</b> 이자 기간이 늘거나 줄어요. 바뀐 <span class="nw">정산월</span>과 <span class="nw">그전 결제일</span>을 넣으면 그 달 이자를 실제 경과일로 다시 계산하고, <span class="nw">다음 달부터는</span> 새 결제일 기준으로 돌아가요.</div>'+dhRows+addBtn('addDueHist('+_dskA+','+jsArg(curMk)+')','결제일 변경 추가')+'</div>'):'';var reps=loanRepays(a);var rpOpen=!!loanRepayOpen[a.id];var endMk=loanEndMk(a);var paidOff=loanPaidOff(a);var rpRows=reps.map(function(h,ix){return '<div class="ln-item wrap"><span class="ln-ctl" style="margin-left:0"><input class="ln-in" type="date" value="'+(h.d||'')+'" onchange="setLoanRepay('+id+','+ix+',\'d\',this.value)"><input class="ln-in num" style="width:96px" type="text" inputmode="numeric" oninput="commaInput(this)" value="'+(h.full?'':(h.amt?fmtComma(h.amt):''))+'" placeholder="상환 원금" '+(h.full?'disabled':'')+' onchange="setLoanRepay('+id+','+ix+',\'amt\',this.value)"><span class="ln-u">원</span></span><label class="ln-chk"><input type="checkbox" '+(h.full?'checked':'')+' onchange="setLoanRepay('+id+','+ix+',\'full\',this.checked)">전액상환</label>'+xBtn('delLoanRepay('+id+','+ix+')')+'</div>';}).join('');var rpBody=rpOpen?('<div class="ln-body"><div class="ln-desc">중도상환한 <span class="nw">날짜</span>와 <span class="nw">원금</span>을 넣으면 <span class="nw">그날까지의 이자</span>를 일수로 계산해 그 달 납입액에 더해요. <span class="nw">전액상환</span>을 체크하면 <span class="nw">다음 달부터</span> 고정지출 목록에서 빠져요.</div>'+rpRows+addBtn('addLoanRepay('+id+')','상환 기록 추가')+'</div>'):'';var grp=function(label,open,count,call,bd){return '<div class="ln-grp'+(open?' open':'')+'"><div class="ln-row tg" onclick="'+call+'"><span class="ln-k">'+label+'</span><span class="ln-ctl">'+(count?('<b class="ln-cnt">'+count+'건</b>'):'<span class="ln-none">없음</span>')+'<span class="ln-chev">▾</span></span></div>'+bd+'</div>';};var seg=lnSeg;var inclRow=seg('총 자산에서',[['n','빚으로 차감'],['y','더하기']],incl?'y':'n','toggleAssetIncl('+id+')','');var spendRow=amort?seg('월간 예산 반영',[['full','원리금 전액'],['interest','이자만']],a.spendMode==='interest'?'interest':'full','toggleLoanSpend('+id+')',''):'';var advList='<div class="ln-rows">'+grp('금리 변경 이력',rhOpen,hist.length,'toggleLoanRateHist('+id+')',rhBody)+grp('결제일 변경 이력',dhOpen,_dh.length,'toggleDueHist('+_dskA+')',dhBody)+grp('상환 기록',rpOpen,reps.length,'toggleLoanRepay('+id+')',rpBody)+inclRow+spendRow+'</div>'+(paidOff?'<div class="ln-done">✅ 상환 완료</div>':'');var advOpen=!!loanAdvOpen[a.id];var advSummary=[];if(hist.length)advSummary.push('금리 '+hist.length);if(_dh.length)advSummary.push('결제일 '+_dh.length);if(reps.length)advSummary.push('상환 '+reps.length);var advToggle=lnToggle('고급 설정',assetSetSummary(a,advSummary),advOpen,'toggleLoanAdv('+id+')');var excludeBtn=paidOff?('<button type="button" class="ln-excl" onclick="dismissLoanAsset('+id+')">상환 완료 · 자산에서 완전히 제외 ›</button>'):'';var noteLine='<div class="ln-note">이번 달 상환액은 월간 예산에 자동으로 채워져요</div>';var rType=assetTypeRow(a);var mobileHtml=stats+advToggle+(advOpen?('<div class="ln-panel"><div class="ln-colh">대출 정보</div><div class="ln-rows">'+rMethod+rRate+rTerm+rStart+rOpenD+rType+'</div><div class="ln-colh">기록 · 반영</div>'+advList+'<div class="ln-foot">'+assetMemoHtml(a)+assetDelBtn(a,'이 대출 삭제')+'</div>'+noteLine+'</div>'):'')+excludeBtn;var deskAdv='<div class="ln ln-desk"><div><div class="ln-colh">대출 정보</div><div class="ln-rows">'+rMethod+rTerm+rStart+rOpenD+rType+'</div><div class="ln-colh" style="margin-top:18px">메모 <span style="font-weight:400">· 계산엔 반영 안 돼요</span></div>'+assetMemoHtml(a)+'</div><div class="ln-dcol"><div class="ln-colh">기록 · 반영</div>'+advList+noteLine+assetDelBtn(a,'이 대출 삭제')+'</div></div>';return {mobileHtml:mobileHtml,deskAdv:deskAdv,method:method,methodLabel:LBL[method],amt:amt,rem:rem,repaid:repaid,info:info,paidOff:paidOff,excludeBtn:excludeBtn,advOpen:advOpen};}
function loanRowMobile(a){var p=loanRow(a);return p?p.mobileHtml:'';}
function loanRowDesktop(a,dim){var p=loanRow(a);if(!p)return '';var bg=dim?'#fdf6f6':'#fff';var payTxt=(p.method==='이자')?(p.info?(fmtComma(p.info.interest)+'원'):'—'):(p.info?(fmtComma(p.info.pay)+'원'):'—');var remTxt=fmtComma(p.rem)+'원';var inSt='border:none;background:transparent;font-family:inherit;color:#111;width:100%;box-sizing:border-box;padding:2px 0';var dataRow='<tr class="data-row ln-drow" style="background:'+bg+'"><td class="row-name"><input class="ln-nm" value="'+dlEsc(a.name||'')+'" placeholder="대출 이름" onchange="setAssetField('+jsArg(a.id)+',\'name\',this.value)" style="'+inSt+';font-weight:700;font-size:13.5px"></td><td><span class="d-badge ln-badge'+(p.paidOff?' done':'')+'">'+dlEsc(p.methodLabel)+'</span></td><td class="num"><span style="white-space:nowrap;display:inline-flex;align-items:center;gap:2px;width:100%"><input type="text" inputmode="numeric" value="'+(a.amount?fmtComma(a.amount):'')+'" oninput="commaInput(this)" onchange="setAssetField('+jsArg(a.id)+',\'amount\',this.value)" style="'+inSt+';text-align:right;flex:1 1 auto;min-width:0">원</span></td><td class="num"><span style="white-space:nowrap;display:inline-flex;align-items:center;gap:2px;width:100%"><input type="number" step="0.001" value="'+(a.rate||'')+'" onchange="setLoanField('+jsArg(a.id)+',\'rate\',this.value)" style="'+inSt+';text-align:right;flex:1 1 auto;min-width:0">%</span></td><td class="num amt-strong" style="white-space:nowrap">'+payTxt+'</td><td class="num" style="white-space:nowrap">'+remTxt+'</td><td class="as-act">'+(p.excludeBtn?p.excludeBtn.replace('class="ln-excl"','class="ln-excl sm"').replace('상환 완료 · 자산에서 완전히 제외 ›','완전히 제외'):'')+(a.note?'<span class="as-memo-dot" title="메모 있음">📝</span>':'')+'<button type="button" class="d-chev-btn ln-dbtn'+(p.advOpen?' open':'')+'" onclick="toggleLoanAdv('+jsArg(a.id)+')">고급 설정 <span class="chev">▾</span></button></td></tr>';var expandRow='<tr class="expand-row'+(p.advOpen?' open':'')+'"><td colspan="7" class="ln-exp">'+(p.advOpen?p.deskAdv:'')+'</td></tr>';return dataRow+expandRow;}function toggleAssetIncl(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.incl=!a.incl;saveAssets();renderAssets();}function setLoanRate(id,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.rate=parseFloat(String(val).replace(/,/g,''))||0;saveAssets();renderAssets();}function setLoanField(id,field,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;if(field==='rate')a.rate=parseFloat(String(val).replace(/,/g,''))||0;else if(field==='term')a.term=Math.max(0,parseInt(val,10)||0);else if(field==='startMk')a.startMk=val;else if(field==='openDate')a.openDate=val;else if(field==='method'){a.method=val;if(val==='이자'){delete a.term;delete a.startMk;delete a.spendMode;}else{if(!a.startMk)a.startMk=monthKey(todayStr());if(!a.spendMode)a.spendMode='full';}}saveAssets();renderAssets();}
function toggleLoanRepay(id){loanRepayOpen[id]=!loanRepayOpen[id];renderAssets();}function _loanById(id){if(!assets)loadAssets();return assets.filter(function(x){return x.id===id;})[0];}function _loanRepaySync(){try{if(typeof ensureLoanCats==='function')ensureLoanCats();}catch(e){}}function addLoanRepay(id){var a=_loanById(id);if(!a)return;if(!Array.isArray(a.repays))a.repays=[];a.repays.push({d:todayStr(),amt:0,full:false});loanRepayOpen[id]=true;saveAssets();_loanRepaySync();renderAssets();}function setLoanRepay(id,idx,field,val){var a=_loanById(id);if(!a||!Array.isArray(a.repays)||!a.repays[idx])return;var r=a.repays[idx];if(field==='d')r.d=val;else if(field==='amt')r.amt=Math.max(0,Math.round(parseFloat(String(val).replace(/,/g,''))||0));else{r.full=!!val;if(r.full)r.amt=0;}a.repays.sort(function(p,q){return (p.d||'')<(q.d||'')?-1:((p.d||'')>(q.d||'')?1:0);});saveAssets();_loanRepaySync();renderAssets();}function delLoanRepay(id,idx){var a=_loanById(id);if(!a||!Array.isArray(a.repays))return;a.repays.splice(idx,1);if(!a.repays.length)delete a.repays;saveAssets();_loanRepaySync();renderAssets();}function toggleLoanSpend(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.spendMode=(a.spendMode==='interest')?'full':'interest';saveAssets();renderAssets();}
function toggleLoanRateHist(id){loanRateOpen[id]=!loanRateOpen[id];renderAssets();}
function toggleLoanAdv(id){loanAdvOpen[id]=!loanAdvOpen[id];renderAssets();}
function toggleLoanArchive(){loanArchiveOpen=!loanArchiveOpen;renderAssets();}
function dismissLoanAsset(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;rsConfirm('이 대출을 자산 목록에서 완전히 뺄까요?§§기록은 그대로 남고, 월간 예산 반영에도 영향 없어요.',function(){a.dismissed=true;saveAssets();renderAssets();});}
function toggleAssetPrOpen(id){assetPrOpen[id]=!assetPrOpen[id];renderAssets();}
function addLoanRate(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;if(!a.rateHist)a.rateHist=[];var last=a.rateHist.length?a.rateHist[a.rateHist.length-1].mk:(a.startMk||monthKey(todayStr()));a.rateHist.push({mk:addMonthsMk(last,1),rate:loanRateAt(a,addMonthsMk(last,1))});loanRateOpen[id]=true;saveAssets();renderAssets();}
function setLoanRateHist(id,idx,field,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a||!a.rateHist||!a.rateHist[idx])return;if(field==='mk')a.rateHist[idx].mk=val;else a.rateHist[idx].rate=parseFloat(String(val).replace(/,/g,''))||0;a.rateHist.sort(function(p,q){return p.mk<q.mk?-1:(p.mk>q.mk?1:0);});saveAssets();renderAssets();}
function delLoanRate(id,idx){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a||!a.rateHist)return;a.rateHist.splice(idx,1);if(!a.rateHist.length)delete a.rateHist;saveAssets();renderAssets();}function subKey(cat,sub){return cat+'::'+sub;}function curPKey(scope){var t=todayStr();return (scope==='weekly')?weekKey(t):monthKey(t);}function migrateWeekly(){try{if(catWeeklyBudget&&Object.keys(catWeeklyBudget).length){var cw=weekKey(todayStr());if(!catWeeklyPast[cw]||!Object.keys(catWeeklyPast[cw]).length)catWeeklyPast[cw]=Object.assign({},catWeeklyBudget);catWeeklyBudget={};saveDailyBudget();}}catch(e){}}function pullLastWeek(){var dd=dailyDate||todayStr();var pst=localDateStr(new Date(weekStartMon(dd).getTime()-7*86400000));var src=catWeeklyPast[weekKey(pst)]||{};if(!Object.keys(src).length){showToast('지난주에 설정된 예산이 없어요');return;}var dst=bWriteMap('weekly',dd);Object.keys(src).forEach(function(k){dst[k]=src[k];});saveDailyBudget();renderActiveView();showToast('지난주 예산을 불러왔어요');}function bReadMap(scope,ds){ds=ds||todayStr();if(scope==='weekly'){return catWeeklyPast[weekKey(ds)]||{};}var pk=monthKey(ds);var cur=curPKey(scope);if(pk===cur)return catMonthlyBudget;var o=catMonthlyPast[pk];if(o&&Object.keys(o).length)return o;if(pk>cur)return catMonthlyBudget;return {};}function bWriteMap(scope,ds){ds=ds||todayStr();if(scope==='weekly'){var wk=weekKey(ds);if(!catWeeklyPast[wk])catWeeklyPast[wk]={};return catWeeklyPast[wk];}var pk=monthKey(ds);var cur=curPKey(scope);if(pk===cur)return catMonthlyBudget;if(!catMonthlyPast[pk])catMonthlyPast[pk]=(pk>cur)?Object.assign({},catMonthlyBudget):{};return catMonthlyPast[pk];}function loanBudgetOverlay(ds){var mk=monthKey(ds||todayStr());var ck=mk+'|'+loanOvVer;if(loanOvCache.k===ck)return loanOvCache.v;var out={};try{if(typeof loanMonthExpense==='function')loanMonthExpense(mk).items.forEach(function(it){out[subKey('대출이자',it.name)]=it.reflected;});}catch(e){out={};}loanOvCache={k:ck,v:out};return out;}
/* 특별지출(경조사·명절·여행 등) 연간 계획 — rs_special_plan{ "<연도>": { ev:[12칸 이벤트 문자열], b:{ "<특별 대분류명>":[12칸 원 배열] } } }.
   항목 키는 dailyTree['특별']의 대분류 이름 그대로 — 별도 목록을 두지 않고 그때그때 dailyTree를 읽는다(대분류 추가·삭제가 자동 반영, §2.19처럼 없는 항목은 표에서만 빠지고 데이터는 보존).
   월간 예산 오버레이는 loanBudgetOverlay와 동일한 패턴(월 단위 캐시, saveSpecialPlan에서 무효화) — catMonthlyBudget에 직접 쓰지 않아 §2.7 월간 상속(1월 값이 그대로 물려지는 사고)을 피한다. */
function specialCatNames(){if(!dailyTree)loadDailyCats();return Object.keys((dailyTree&&dailyTree['특별'])||{});}
function loadSpecialPlan(){try{var v=JSON.parse(localStorage.getItem('rs_special_plan')||'null');specialPlanData=(v&&typeof v==='object'&&!Array.isArray(v))?v:{};}catch(e){specialPlanData={};}}
function saveSpecialPlan(){try{lsSet('rs_special_plan',JSON.stringify(specialPlanData));}catch(e){}specialOvVer++;}
function specialYearData(yr,create){if(!specialPlanData)loadSpecialPlan();var k=String(yr);var yd=specialPlanData[k];if(!yd){if(!create)return null;yd=specialPlanData[k]={ev:['','','','','','','','','','','',''],b:{}};}else{if(!yd.ev||!Array.isArray(yd.ev)||yd.ev.length!==12)yd.ev=['','','','','','','','','','','',''];if(!yd.b||typeof yd.b!=='object')yd.b={};}return yd;}
function specialBudgetOverlay(ds){var mk=monthKey(ds||todayStr());var ck=mk+'|'+specialOvVer;if(specialOvCache.k===ck)return specialOvCache.v;var out={};try{var yr=mk.slice(0,4),mi=parseInt(mk.slice(5,7),10)-1;var yd=specialYearData(yr,false);if(yd){specialCatNames().forEach(function(c){var arr=yd.b[c];var v=arr?(parseFloat(arr[mi])||0):0;if(v>0)out[c]=v;});}}catch(e){out={};}specialOvCache={k:ck,v:out};return out;}
function catBudgetMap(scope,ds){var m=bReadMap(scope,ds);if(scope!=='monthly')return m;var ov=loanBudgetOverlay(ds||todayStr());var ov2=specialBudgetOverlay(ds||todayStr());var ks=Object.keys(ov);var ks2=Object.keys(ov2);var stale=Object.keys(m).filter(function(k){return k.indexOf('대출이자::')===0&&!(k in ov);});if(!ks.length&&!ks2.length&&!stale.length)return m;var c=Object.assign({},m);stale.forEach(function(k){delete c[k];});ks.forEach(function(k){c[k]=ov[k];});ks2.forEach(function(k){c[k]=ov2[k];});return c;}function setSpecialEvent(yr,mi,val){var yd=specialYearData(yr,true);yd.ev[mi]=String(val||'');saveSpecialPlan();renderActiveView();}
function setSpecialAmt(yr,cat,mi,val){var yd=specialYearData(yr,true);var n=parseFloat(String(val).replace(/,/g,''));n=(isNaN(n)||n<0)?0:n;if(!yd.b[cat]||!Array.isArray(yd.b[cat])||yd.b[cat].length!==12)yd.b[cat]=[0,0,0,0,0,0,0,0,0,0,0,0];yd.b[cat][mi]=n;saveSpecialPlan();renderActiveView();}
function specialYearSum(yr){var yd=specialYearData(yr,false);if(!yd)return 0;var s=0;specialCatNames().forEach(function(c){(yd.b[c]||[]).forEach(function(v){s+=parseFloat(v)||0;});});return s;}
function specialSettleByCat(mk){var ents=monthEntries(monthFirstDate(mk));var m={};ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'';if(catGroupOf(c)==='특별')m[c]=(m[c]||0)+a;});return m;}
function specialSettleSum(mk){var m=specialSettleByCat(mk);var s=0;Object.keys(m).forEach(function(c){s+=m[c];});return s;}
function specialYearSettleSum(yr){var s=0;for(var mi=1;mi<=12;mi++){s+=specialSettleSum(yr+'-'+String(mi).padStart(2,'0'));}return s;}
function specialYearSettleByCat(yr){var m={};for(var mi=1;mi<=12;mi++){var byc=specialSettleByCat(yr+'-'+String(mi).padStart(2,'0'));Object.keys(byc).forEach(function(c){m[c]=(m[c]||0)+byc[c];});}return m;}
function _doResetSpecialYear(yr){if(!specialPlanData)loadSpecialPlan();delete specialPlanData[String(yr)];saveSpecialPlan();}
function resetSpecialYear(yr){var yd=specialYearData(yr,false);if(!yd){showToast('그 해엔 아직 특별지출 계획이 없어요.');return;}rsConfirm(yr+'년 특별지출 계획(이벤트·예산)을 초기화할까요?\n실제 지출 기록은 지워지지 않아요.\n되돌릴 수 없어요.',function(){_doResetSpecialYear(yr);renderActiveView();showToast(yr+'년 특별지출 계획을 초기화했어요.');});}
function gotoSpecialPlan(){setDailyView('special');}
function _pdNoBdg(scope,ds){var m=catBudgetMap(scope,ds||todayStr())||{};var any=false;Object.keys(m).forEach(function(k){if((parseFloat(m[k])||0)>0)any=true;});return !any;}function subBudgetSum(scope,cat,ds){if(scope!=='monthly'&&scope!=='weekly')return 0;if(!dailyTree)loadDailyCats();var m=catBudgetMap(scope,ds);var grp=catGroupOf(cat);var subs=(dailyTree[grp]&&dailyTree[grp][cat])||[];var s=0;subs.forEach(function(sb){s+=(parseFloat(m[subKey(cat,sb)])||0);});return s;}function effCatBudget(scope,cat,ds){var ss=subBudgetSum(scope,cat,ds);if(ss>0)return ss;return parseFloat(catBudgetMap(scope,ds)[cat])||0;}function sumCatBudget(scope,ds){if(!dailyTree)loadDailyCats();var s=0;dailyCats.forEach(function(c){s+=effCatBudget(scope,c,ds);});return s;}function budgetItemsOf(srcScope,dateStr){if(!dailyTree)loadDailyCats();dateStr=dateStr||todayStr();var mp=catBudgetMap(srcScope,dateStr)||{};var items=[];dailyCats.forEach(function(c){var ss=subBudgetSum(srcScope,c,dateStr);if(ss>0){var grp=catGroupOf(c);var subs=(dailyTree[grp]&&dailyTree[grp][c])||[];subs.forEach(function(sb){var v=parseFloat(mp[subKey(c,sb)])||0;if(v>0)items.push({key:subKey(c,sb),cat:c,label:c+' › '+sb,amount:v});});}else{var v=parseFloat(mp[c])||0;if(v>0)items.push({key:c,cat:c,label:c,amount:v});}});return items;}function monthlyBudgetItems(dateStr){return budgetItemsOf('monthly',dateStr);}function pullSrcScope(){return (dlPullScope==='day')?'weekly':'monthly';}function pullItems(dateStr){return budgetItemsOf(pullSrcScope(),dateStr);}function pullSelectAll(){var items=pullItems(dailyDate||todayStr());var allOn=items.length&&items.every(function(it){return dlPullSel[it.key];});items.forEach(function(it){dlPullSel[it.key]=!allOn;});renderPullModal();}
function openPullModal(scope){dlPullScope=scope;dlPullSel={};dlPullDoneOpen=false;var m=g('pullModal');if(!m)return;m.classList.add('open');renderPullModal();}function openPullDay(){openPullModal('day');}function openPullWeek(){openPullModal('week');}function togglePullItem(key){dlPullSel[key]=!dlPullSel[key];renderPullModal();}var dlPullDoneOpen=false;function togglePullDone(){dlPullDoneOpen=!dlPullDoneOpen;renderPullModal();}function renderPullModal(){var box=g('pullBox');if(!box)return;var items=pullItems(dailyDate||todayStr());if(!items.length){box.innerHTML='<div style="font-size:13px;color:var(--gray);padding:12px 0">'+(dlPullScope==='day'?'이번 주 예산을 먼저 세워 주세요.':'월간 탭에서 먼저 예산을 세워 주세요.')+'</div>';return;}var tt=g('pullTitle');if(tt)tt.textContent=(dlPullScope==='day'?'주간 → 오늘(일일) 예산 채우기':'월간 → 주간 예산 채우기');var doneKeys={};var vDate=dailyDate||todayStr();var vWk=localDateStr(weekStartMon(vDate));var vMonth=monthKey(vDate);if(dlPullScope==='week'){Object.keys(catWeeklyPast).forEach(function(wk){if(wk<vWk&&monthKey(wk)===vMonth){var mp=catWeeklyPast[wk]||{};Object.keys(mp).forEach(function(k){if((parseFloat(mp[k])||0)>0)doneKeys[k]=true;});}});}var normal=[],done=[];items.forEach(function(it){if(catGroupOf(it.cat)==='고정'&&doneKeys[it.key])done.push(it);else normal.push(it);});var tot=0;items.forEach(function(it){if(dlPullSel[it.key])tot+=it.amount;});var allOn=items.every(function(it){return dlPullSel[it.key];});function row(it){var on=!!dlPullSel[it.key];return '<div onclick="togglePullItem('+jsArg(it.key)+')" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 6px;border-bottom:1px solid var(--tbl-border);cursor:pointer"><span style="display:flex;align-items:center;gap:10px;font-size:14px"><span style="width:21px;height:21px;border-radius:5px;border:1.5px solid '+(on?'var(--ac)':'var(--border)')+';background:'+(on?'var(--ac)':'#fff')+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:none">'+(on?'✓':'')+'</span>'+dlEsc(it.label)+'</span><b style="font-size:13px;white-space:nowrap">'+fmtComma(it.amount)+'원</b></div>';}var h='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:13px;color:var(--gray)">가져올 항목을 선택하면 '+(dlPullScope==='day'?'오늘':'주간')+' 예산에 반영돼요.</span><button type="button" onclick="pullSelectAll()" style="border:1px solid var(--border);background:#fff;border-radius:99px;padding:4px 10px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit;white-space:nowrap">'+(allOn?'전체 해제':'전체 선택')+'</button></div>';normal.forEach(function(it){h+=row(it);});if(done.length){h+='<div onclick="togglePullDone()" style="display:flex;align-items:center;gap:7px;padding:11px 6px;margin-top:4px;border-top:1px solid var(--border);cursor:pointer;color:var(--gray)"><b style="font-size:13px">✅ 지출 완료 ('+done.length+')</b><span style="font-size:13px;flex:1">이번 달 앞 주에 이미 배정한 고정지출</span><span style="font-size:13px">'+(dlPullDoneOpen?'▴':'▾')+'</span></div>';if(dlPullDoneOpen){done.forEach(function(it){h+=row(it);});}}h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:14px"><span style="font-weight:600">선택 합계</span><b style="color:var(--ac);font-size:17px">'+fmtComma(tot)+'원</b></div><div style="text-align:right;margin-top:14px"><button type="button" class="btn btn-bk" onclick="applyPull()" style="font-size:13px">적용</button></div>';box.innerHTML=h;}function applyPull(){var items=pullItems(dailyDate||todayStr()).filter(function(it){return dlPullSel[it.key];});if(dlPullScope==='day'){var sum=items.reduce(function(s,it){return s+it.amount;},0);setDailyBudget(String(sum));}else{var dd=dailyDate||todayStr();var _map=bWriteMap('weekly',dd);items.forEach(function(it){_map[it.key]=it.amount;});saveDailyBudget();renderActiveView();renderBudget();}closeM('pullModal');}
function helpIcon(text){return '<span class="hlp" onclick="event.stopPropagation();this.classList.toggle(\'on\')" style="color:var(--gray);font-size:13px;font-weight:400;margin-left:5px"><span style="font-size:14px">ⓘ</span><span class="hlp-pop">'+text+'</span></span>';}
function groupSpendOf(scope,dateStr){var ents=(scope==='weekly')?weekEntries(dateStr):monthEntries(dateStr);var f=0,v=0,e2=0;ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;var grp=catGroupOf(e.cat||e.category||'');if(grp==='고정')f+=a;else if(grp==='변동')v+=a;else e2+=a;});return {fix:f,'var':v,etc:e2};}
function budgetCard(title,budget,spent,onch,locked,scope,seg){
  var pct=budget>0?Math.round(spent/budget*100):0;
  var fill=Math.max(0,Math.min(100,pct));
  var over=spent>budget&&budget>0;
  var color=over?'#e07a7a':'var(--ac)';
  var barInner='<div style="height:8px;background:#eee;border-radius:99px;overflow:hidden;margin-bottom:6px"><div style="height:100%;width:'+fill+'%;background:'+color+';border-radius:99px;transition:width .25s"></div></div>';
  if(seg){var _sf=seg.fix||0,_sv=seg['var']||0,_se=seg.etc||0,_sp=_sf+_sv+_se;var _dn=budget>0?budget:(_sp>0?_sp:1);var _rf=_sf/_dn*100,_rv=_sv/_dn*100,_re=_se/_dn*100,_rt=_rf+_rv+_re,_sc=_rt>100?100/_rt:1;_rf*=_sc;_rv*=_sc;_re*=_sc;var _pf=_sp>0?Math.round(_sf/_sp*100):0,_pv=_sp>0?Math.round(_sv/_sp*100):0;var _tip='고정 '+fmtComma(_sf)+'원'+(_sp>0?' ('+_pf+'%)':'')+'§§변동 '+fmtComma(_sv)+'원'+(_sp>0?' ('+_pv+'%)':'')+(_se>0?('§§기타 '+fmtComma(_se)+'원'):'');barInner='<div class="segtip" tabindex="0" data-tip="'+_tip+'" style="margin-bottom:6px"><div style="height:8px;background:#eee;border-radius:99px;overflow:hidden;display:flex">'+(_rf>0?'<div style="height:100%;width:'+_rf+'%;background:'+groupColor('고정')+'"></div>':'')+(_rv>0?'<div style="height:100%;width:'+_rv+'%;background:var(--ac)"></div>':'')+(_re>0?'<div style="height:100%;width:'+_re+'%;background:'+groupColor('')+'"></div>':'')+'</div></div>';}
  var bv=budget>0?budget:'';
  var spentTxt=fmtComma(spent)+'원'+(budget>0?' · '+pct+'%':'');
  var mobileSpentTxt=budget>0?fmtComma(spent)+' / '+fmtComma(budget)+'원':fmtComma(spent)+'원';
  var rLabel=budget>0?(over?'초과':'남음'):'';
  var rVal=budget>0?(over?fmtComma(spent-budget)+'원':fmtComma(budget-spent)+'원'):'예산을 정해보세요';
  var rColor=budget>0?(over?'#d9534f':'var(--ac)'):'var(--gray)';
  var rWeight=budget>0?'600':'400';
  if(locked&&budget<=0){rLabel='';rVal='';}
  var inputInner='<input type="number" class="dlbgt" value="'+bv+'" placeholder="예산" onchange="'+onch+'(this.value)" style="width:84px;text-align:right;padding:4px 6px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">원</span>';var __right,__tap=false;
  var lockRight=budget>0?'<span style="font-size:13px;color:var(--gray)">예산 '+fmtComma(budget)+'원</span>':'<span style="font-size:13px;color:var(--gray)">예산 미설정</span>';if(locked){__right=lockRight;}else if(scope){var _pullBtn=(scope==='day')?'<button type="button" onclick="event.stopPropagation();openPullDay()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:4px 9px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit;white-space:nowrap">📥 주간에서 가져오기</button>':'';__right='<span class="dl-bedit" style="display:inline-flex;align-items:center;gap:5px">'+_pullBtn+inputInner+'</span><span class="dl-bval" style="align-items:center;gap:4px;font-size:13px;color:var(--ac);font-weight:600">'+(budget>0?fmtComma(budget)+'원':'예산 입력')+' ›</span>';__tap=true;}else{__right='<span style="display:inline-flex;align-items:center;gap:3px">'+inputInner+'</span>';}
  return '<div'+(__tap?' onclick="onBudgetCardTap(event,\''+scope+'\')"':'')+' style="padding:11px 12px;border:1px solid var(--tbl-border);border-radius:8px;background:#fff'+(__tap?';cursor:pointer':'')+'">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;min-height:26px;margin-bottom:8px;flex-wrap:wrap;gap:6px">'+
      '<span style="font-size:13px;color:var(--gray)">'+title+'</span>'+
      __right+
    '</div>'+
    barInner+
    '<div class="daily-budget-desktop"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--gray)"><span>썼어요</span><span>'+rLabel+'</span></div><div style="display:flex;justify-content:space-between;font-size:13px;margin-top:2px"><span style="font-weight:600">'+spentTxt+'</span><span style="color:'+rColor+';font-weight:'+rWeight+'">'+rVal+'</span></div></div><div class="daily-budget-mobile" style="font-size:13px;margin-top:2px;color:'+rColor+';font-weight:'+rWeight+'">'+mobileSpentTxt+'</div>'+
  '</div>';
}
function renderBudget(){var box=g('dlBudget');if(!box)return;var dd=dailyDate||todayStr();var dayTitle=(dd===todayStr())?'오늘 예산':((parseInt(dd.split('-')[1]))+'/'+parseInt(dd.split('-')[2])+' 예산');var spentDay=dayTotal(dd);var spentWeek=weekTotal(dd);var pastW=isPastPeriod('weekly',dd);var _ws=sumCatBudget('weekly',dd);box.innerHTML=budgetCard(dayTitle+helpIcon('예산칸에 <b>직접 입력</b>하거나, 「주간에서 가져오기」로 <b>그 주 예산에서 불러올</b> 수 있어요.'),dailyBudgetOf(dd),spentDay,'setDailyBudget',false,'day')+budgetCard('이번 주'+helpIcon('주간 예산은 <b>「주간」 탭</b>에서 설정하세요. 분류별 예산을 세우면 자동으로 합산돼 여기에 표시돼요.'),_ws>0?_ws:weeklyBudgetOf(dd),spentWeek,'setWeeklyBudget',true);}
var budgetModalScope='';
function onBudgetCardTap(e,scope){try{if(!window.matchMedia||!window.matchMedia('(max-width:560px)').matches)return;}catch(_){return;}openBudgetModal(scope);}
function openBudgetModal(scope){budgetModalScope=scope;var dd=dailyDate||todayStr();var cur=scope==='day'?dailyBudgetOf(dd):weeklyBudgetOf(dd);var inp=g('budgetModalInput');if(inp)inp.value=cur>0?cur:'';var t=g('budgetModalTitle');if(t)t.textContent=(scope==='day'?'오늘 예산 설정':'이번 주 예산 설정');var pb=g('budgetModalPullBtn');if(pb)pb.textContent=(scope==='day'?'📥 주간에서 가져오기':'📥 월간에서 가져오기');var m=g('budgetModal');if(m)m.classList.add('open');if(inp)setTimeout(function(){try{inp.focus();}catch(e){}},30);}
function saveBudgetModal(){var inp=g('budgetModalInput');var v=inp?inp.value:'';if(budgetModalScope==='day')setDailyBudget(v);else setWeeklyBudget(v);closeM('budgetModal');}
function pullFromBudgetModal(){var sc=budgetModalScope;closeM('budgetModal');if(sc==='day')openPullDay();else openPullWeek();}
function setDailyView(v){dailyView=v;if(g('dlViewDaily'))g('dlViewDaily').style.display=(v==='daily')?'':'none';if(g('dlViewWeek'))g('dlViewWeek').style.display=(v==='week')?'':'none';if(g('dlViewMonth'))g('dlViewMonth').style.display=(v==='month')?'':'none';if(g('dlViewCal'))g('dlViewCal').style.display=(v==='calendar')?'':'none';if(g('dlViewSpecial'))g('dlViewSpecial').style.display=(v==='special')?'':'none';if(g('dlViewAnalysis'))g('dlViewAnalysis').style.display=(v==='analysis')?'':'none';[['dlSegCal','calendar'],['dlSegDaily','daily'],['dlSegWeek','week'],['dlSegMonth','month'],['dlSegSpecial','special'],['dlSegAnalysis','analysis']].forEach(function(p){var b=g(p[0]);if(b)b.className='btn '+(v===p[1]?'btn-bk':'btn-ol');});var _pb=g('dlPullDayBtn');if(_pb)_pb.style.display=(v==='daily')?'':'none';renderActiveView();if(typeof _stStickyUpdate==='function')setTimeout(_stStickyUpdate,0);}
function anaRange(){var t=todayStr();var tp=t.split('-');var y=parseInt(tp[0],10),m=parseInt(tp[1],10),d=parseInt(tp[2],10);function ds(yy,mm,dd){return yy+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');}function ld(yy,mm){return new Date(yy,mm,0).getDate();}var p=dlAnalysisPreset;if(p==='lastMonth'){var _pk=prevMonthKey(monthKey(t));return [monthFirstDate(_pk),monthLastDate(_pk)];}if(p==='3months'){var dt=new Date(y,m-1,d);dt.setMonth(dt.getMonth()-3);return [localDateStr(dt),t];}if(p==='year')return [ds(y,1,1),t];if(p==='custom')return [dlAnalysisStart||monthFirstDate(monthKey(t)),dlAnalysisEnd||t];return [monthFirstDate(monthKey(t)),t];}function anaDateLabel(ds){var p=ds.split('-');return parseInt(p[1],10)+'월 '+parseInt(p[2],10)+'일('+dlWeekdayKo(ds)+')';}function setAnaPreset(p){dlAnalysisPreset=p;renderAnalysis();}function onAnaRangeChange(){if(g('dlAnaStart'))dlAnalysisStart=g('dlAnaStart').value;if(g('dlAnaEnd'))dlAnalysisEnd=g('dlAnaEnd').value;renderAnalysis();}function toggleAnaCat(c){dlAnaCatOpen[c]=!dlAnaCatOpen[c];renderAnalysis();}function anaCarousel(slides){slides=(slides||[]).filter(function(x){return x&&x.replace(/<!--[^>]*-->/g,'').trim();});if(!slides.length)return '';if(slides.length===1)return slides[0];var track=slides.map(function(s){return '<div class="ana-slide">'+s+'</div>';}).join('');var dots=slides.map(function(s,i){return '<span class="ana-dot'+(i===0?' on':'')+'" onclick="anaGoto('+i+')"></span>';}).join('');return '<div class="ana-cwrap"><button type="button" class="ana-nav ana-prev" onclick="anaSlide(-1)">‹</button><div class="ana-track" id="anaTrack" onscroll="anaSyncDots()">'+track+'</div><button type="button" class="ana-nav ana-next" onclick="anaSlide(1)">›</button></div><div class="ana-dots" id="anaDots">'+dots+'</div>';}function anaSlide(dir){var t=g('anaTrack');if(!t)return;var x=t.scrollLeft+dir*t.clientWidth;if(t.scrollTo)t.scrollTo({left:x,behavior:'smooth'});else t.scrollLeft=x;}function anaGoto(i){var t=g('anaTrack');if(!t)return;var x=i*t.clientWidth;if(t.scrollTo)t.scrollTo({left:x,behavior:'smooth'});else t.scrollLeft=x;}function anaSyncDots(){var t=g('anaTrack');if(!t)return;var i=Math.round(t.scrollLeft/Math.max(1,t.clientWidth));var ds=document.querySelectorAll('#anaDots .ana-dot');for(var k=0;k<ds.length;k++)ds[k].className='ana-dot'+(k===i?' on':'');}
function anaRenderSlides(box,slides){var oldT=g('anaTrack');var prevIdx=0;if(oldT&&oldT.clientWidth)prevIdx=Math.round(oldT.scrollLeft/oldT.clientWidth);box.innerHTML=anaCarousel(slides);var newT=g('anaTrack');if(newT&&prevIdx>0)newT.scrollLeft=prevIdx*newT.clientWidth;anaSyncDots();}function anaSlideSamePoint(startS,endS,total){
  var tmKey=monthKey(todayStr());
  if(monthKey(startS)!==tmKey)return '';
  var DAY=86400000, today=todayStr();
  var cf=monthFirstDate(tmKey);
  var N=Math.round((new Date(today+'T00:00:00')-new Date(cf+'T00:00:00'))/DAY)+1;
  if(N<1)N=1;
  var curSum=0;
  dailyData.forEach(function(e){
    if(monthKey(e.date)!==tmKey)return;
    if(String(e.date)>today)return;
    var a=entrySpend(e);if(a>0)curSum+=a;
  });
  var pmk=prevMonthKey(tmKey);
  var pf=monthFirstDate(pmk), pl=monthLastDate(pmk);
  var pEndD=new Date(pf+'T00:00:00');pEndD.setDate(pEndD.getDate()+(N-1));
  var pEnd=localDateStr(pEndD);var capped=false;
  if(pEnd>pl){pEnd=pl;capped=true;}
  var prevSum=0, prevCnt=0;
  dailyData.forEach(function(e){
    if(monthKey(e.date)!==pmk)return;
    var ds=String(e.date);
    if(ds<pf||ds>pEnd)return;
    prevCnt++;
    var a=entrySpend(e);if(a>0)prevSum+=a;
  });
  var head='<div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">같은 시점 비교</div>';
  var basisNote=(settleStartDay>1)?'<div style="font-size:13px;color:var(--gray);margin-top:8px;word-break:keep-all">달력 날짜가 아니라 <b>정산월 며칠째</b>로 맞춰 비교해요.</div>':'';
  var c='<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px">'+head;
  c+='<div style="font-size:13px;color:var(--gray)">이번 달 '+N+'일차까지</div>';
  c+='<div style="font-size:17px;font-weight:700;color:#111;margin-top:4px">'+fmtComma(curSum)+'원</div>';
  if(prevCnt===0){
    c+='<div style="font-size:13px;color:var(--gray);margin-top:8px;word-break:keep-all">지난 달 같은 기간엔 기록이 없어 비교할 수 없어요.</div>';
    return c+basisNote+'</div>';
  }
  if(prevSum===0){
    c+='<div style="font-size:13px;color:var(--ac);margin-top:8px;word-break:keep-all">지난 달 같은 기간엔 지출이 없었어요.</div>';
    return c+basisNote+'</div>';
  }
  var diff=curSum-prevSum, pct=Math.round(diff/prevSum*100), more=diff>0;
  var col=more?'#d9534f':'var(--ac)', arrow=more?'▲':(diff<0?'▼':''), word=more?'더':'덜', absd=Math.abs(diff);
  c+='<div style="font-size:13px;color:var(--gray);margin-top:8px">지난 달 같은 기간 '+fmtComma(prevSum)+'원'+(capped?' <span style="color:var(--gray)">(지난 달은 더 짧아 말일까지)</span>':'')+'</div>';
  if(diff===0){
    c+='<div style="font-size:15px;font-weight:700;color:#111;margin-top:3px;word-break:keep-all">지난 달과 같은 페이스예요.</div>';
  }else{
    c+='<div style="font-size:15px;font-weight:700;color:'+col+';margin-top:3px;word-break:keep-all">지난 달보다 '+fmtComma(absd)+'원 '+word+' 썼어요 <span style="font-size:13px;white-space:nowrap">'+arrow+' '+Math.abs(pct)+'%</span></div>';
  }
  return c+basisNote+'</div>';
}
function anaSlideProjection(startS,endS,total){var tmKey=monthKey(todayStr());if(monthKey(startS)!==tmKey)return '';var _pf=monthFirstDate(tmKey),_pl=monthLastDate(tmKey);var dim=Math.round((new Date(_pl+'T00:00:00')-new Date(_pf+'T00:00:00'))/86400000)+1;var elapsed=Math.round((new Date(todayStr()+'T00:00:00')-new Date(_pf+'T00:00:00'))/86400000)+1;if(elapsed<1)elapsed=1;var dailyAvg=total/elapsed;var proj=Math.round(dailyAvg*dim);var budEff=sumCatBudget('monthly',todayStr());var bud=budEff>0?budEff:monthlyBudgetOf(todayStr());var diff=bud-proj;var c='<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">월말 예상 지출</div>';c+='<div style="font-size:13px;color:var(--gray)">지금까지 '+elapsed+'일 · 하루 평균 '+fmtComma(Math.round(dailyAvg))+'원</div>';c+='<div style="font-size:17px;font-weight:700;color:#111;margin-top:4px">이 페이스면 월말 약 '+fmtComma(proj)+'원</div>';if(bud>0){if(diff>=0)c+='<div style="font-size:13px;color:var(--ac);margin-top:6px">월간 예산 '+fmtComma(bud)+'원 대비 <b>'+fmtComma(diff)+'원 여유</b> 예상</div>';else c+='<div style="font-size:13px;color:#d9534f;margin-top:6px">월간 예산 '+fmtComma(bud)+'원 대비 <b>'+fmtComma(-diff)+'원 초과</b> 예상</div>';}c+='<div style="font-size:13px;color:var(--gray);margin-top:8px;word-break:keep-all">이번 달 기록을 바탕으로 한 추정이에요. 남은 날의 지출에 따라 달라져요.</div></div>';return c;}function anaSlideTrend(){var _ck=monthKey(todayStr());var _cy=parseInt(_ck.slice(0,4),10),_cm=parseInt(_ck.slice(5,7),10);var months=[];for(var i=5;i>=0;i--){var _yy=_cy,_mm=_cm-i;while(_mm<1){_mm+=12;_yy--;}months.push(_yy+'-'+String(_mm).padStart(2,'0'));}var msum={};dailyData.forEach(function(e){var k=monthKey(e.date);if(months.indexOf(k)>=0){var n=entrySpend(e);if(n>0)msum[k]=(msum[k]||0)+n;}});if(!months.some(function(k){return (msum[k]||0)>0;}))return '';var mx=Math.max.apply(null,months.map(function(k){return msum[k]||0;}).concat([1]));var rows=months.map(function(k){var v=msum[k]||0;var ww=Math.round(v/mx*100);var lbl=parseInt(k.slice(5,7),10)+'월';return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:13px;color:var(--gray);width:34px">'+lbl+'</span><div style="position:relative;flex:1;height:10px;background:var(--border);border-radius:99px"><div style="position:absolute;left:0;top:0;height:100%;width:'+ww+'%;background:var(--ac);border-radius:99px;opacity:.85"></div></div><span style="font-size:13px;color:#333;width:88px;text-align:right;white-space:nowrap">'+fmtComma(v)+'원</span></div>';}).join('');return '<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">월별 지출 추세 <span style="text-transform:none;font-weight:400">(최근 6개월)</span></div><div style="zoom:1.1">'+rows+'</div></div>';}function anaSlideNetTrend(){var _ck=monthKey(todayStr());var _cy=parseInt(_ck.slice(0,4),10),_cm=parseInt(_ck.slice(5,7),10);var mks=[];for(var i=5;i>=0;i--){var y=_cy,m=_cm-i;while(m<1){m+=12;y--;}mks.push(y+'-'+String(m).padStart(2,'0'));}var inc=[],exp=[],net=[],any=false;mks.forEach(function(mk){var fd=monthFirstDate(mk);var _y=parseInt(mk.slice(0,4),10),_mi=parseInt(mk.slice(5,7),10)-1;var pj=(typeof getMonthlyProjectWon==='function')?Math.round(getMonthlyProjectWon(_y,_mi)||0):0;var ic=(monthIncomeTotal(fd)||0)+pj;var ex=0;monthEntries(fd).forEach(function(e){var a=entrySpend(e);if(a>0)ex+=a;});inc.push(ic);exp.push(ex);net.push(ic-ex);if(ic>0||ex>0)any=true;});if(!any)return '';var W=320,H=132,padL=6,padR=6,padT=10,padB=20;var all=inc.concat(exp).concat(net).concat([0]);var mx=Math.max.apply(null,all),mn=Math.min.apply(null,all);if(mx===mn)mx=mn+1;var n=mks.length;function X(i){return padL+i*((W-padL-padR)/(n-1));}function Y(v){return padT+(mx-v)/(mx-mn)*(H-padT-padB);}function poly(arr,col,w){return '<polyline fill="none" style="stroke:'+col+';stroke-width:'+w+'" points="'+arr.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1);}).join(' ')+'"/>';}var gm='var(--carrot-mk,#3f9a68)',rm='var(--whip-mk,#d9534f)',ac='var(--ac)';var zeroY=Y(0);var dots=net.map(function(v,i){return '<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="2.6" style="fill:'+ac+'"/>';}).join('');var xl=mks.map(function(mk,i){return '<text x="'+X(i).toFixed(1)+'" y="'+(H-5)+'" font-size="9" fill="#999" text-anchor="middle">'+parseInt(mk.slice(5,7),10)+'월</text>';}).join('');var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;overflow:visible"><line x1="'+padL+'" y1="'+zeroY.toFixed(1)+'" x2="'+(W-padR)+'" y2="'+zeroY.toFixed(1)+'" stroke="#ccc" stroke-dasharray="3 3" stroke-width="1"/>'+poly(inc,gm,1.2)+poly(exp,rm,1.2)+poly(net,ac,2.4)+dots+xl+'</svg>';var legend='<div style="display:flex;gap:14px;justify-content:center;margin-top:4px;font-size:13px"><span style="color:'+gm+'">— 수입</span><span style="color:'+rm+'">— 지출</span><span style="color:'+ac+';font-weight:700">— 순액</span></div>';return '<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px;margin-top:16px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">순액 추세 <span style="text-transform:none;font-weight:400">(최근 6개월)</span></div>'+svg+legend+'</div>';}
function anaWhipCarrotInsight(dayKeys,byDay){
  var wkTotal={},wkWhip={},wkCarrot={};
  dayKeys.forEach(function(ds){
    var wk=weekKey(ds);
    wkTotal[wk]=(wkTotal[wk]||0)+(byDay[ds]||0);
    var cw=(typeof consumeOf==='function')?consumeOf(ds):null;
    if(cw==='whip')wkWhip[wk]=true;
    else if(cw==='carrot')wkCarrot[wk]=true;
  });
  var whipTotals=[],carrotTotals=[];
  Object.keys(wkTotal).forEach(function(wk){
    if(wkWhip[wk])whipTotals.push(wkTotal[wk]);
    else if(wkCarrot[wk])carrotTotals.push(wkTotal[wk]);
  });
  var MIN_WEEKS=3;
  if(whipTotals.length<MIN_WEEKS||carrotTotals.length<MIN_WEEKS)return '';
  var avgWhip=whipTotals.reduce(function(a,b){return a+b;},0)/whipTotals.length;
  var avgCarrot=carrotTotals.reduce(function(a,b){return a+b;},0)/carrotTotals.length;
  if(avgCarrot<=0)return '';
  var diffPct=Math.round((avgWhip-avgCarrot)/avgCarrot*100);
  if(Math.abs(diffPct)<5)return '';
  var sign=diffPct>0?'+':'';
  var whipIcon='<img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">';
  return whipIcon+' 준 주간엔 🥕 준 주간보다 지출이 평균 <b>'+sign+diffPct+'%</b> 컸어요 <span style="color:var(--gray);font-weight:400">(참고용 상관관계예요 · 그 주에 원래 지출이 많을 다른 이유가 있었을 수도 있어요)</span>';
}
function renderAnalysis(){var box=g('dlAnaBody');if(!box)return;var pr=g('dlAnaPresets');if(pr){var defs=[['thisMonth','이번 달'],['lastMonth','지난 달'],['3months','최근 3개월'],['year','올해'],['custom','설정']];pr.innerHTML=defs.map(function(x){var on=dlAnalysisPreset===x[0];return '<button type="button" onclick="setAnaPreset('+jsArg(x[0])+')" class="btn '+(on?'btn-bk':'btn-ol')+'" style="font-size:13px;padding:4px 10px">'+x[1]+'</button>';}).join('');}var rg=anaRange();var startS=rg[0],endS=rg[1];var rb=g('dlAnaRange');if(rb)rb.style.display=(dlAnalysisPreset==='custom')?'flex':'none';if(dlAnalysisPreset==='custom'){if(g('dlAnaStart')&&!g('dlAnaStart').value)g('dlAnaStart').value=startS;if(g('dlAnaEnd')&&!g('dlAnaEnd').value)g('dlAnaEnd').value=endS;}if(!startS||!endS||startS>endS){anaRenderSlides(box,['<div style="color:var(--gray);font-size:13px;padding:12px 0">기간을 확인해 주세요.</div>']);return;}var ents=dailyData.filter(function(e){var dd=String(e.date);return dd>=startS&&dd<=endS;});var total=0,fixedTotal=0,byDay={},byVarCat={},byVarSub={};ents.forEach(function(e){var net=entrySpend(e);if(net<=0)return;total+=net;if(!dlIsMonthSum(e))byDay[e.date]=(byDay[e.date]||0)+net;var cat=e.cat||e.category||'미분류';var grp=catGroupOf(cat);if(grp==='고정'){fixedTotal+=net;}else{byVarCat[cat]=(byVarCat[cat]||0)+net;var sub=e.sub||'(기타)';byVarSub[cat+'::'+sub]=(byVarSub[cat+'::'+sub]||0)+net;}});var varTotal=0;Object.keys(byVarCat).forEach(function(k){varTotal+=byVarCat[k];});var dayKeys=Object.keys(byDay);var nDays=dayKeys.length;var avg=nDays?Math.round(total/nDays):0;var overDays=0;dayKeys.forEach(function(ds){var b=dailyBudgetOf(ds);if(b>0&&byDay[ds]>b)overDays++;});var rangeDays=Math.round((new Date(endS+'T00:00:00')-new Date(startS+'T00:00:00'))/86400000)+1;var topDay='',topAmt=0;dayKeys.forEach(function(ds){if(byDay[ds]>topAmt){topAmt=byDay[ds];topDay=ds;}});if(!nDays){anaRenderSlides(box,['<div style="color:var(--gray);font-size:13px;padding:16px 0;text-align:center">이 기간에 지출 기록이 없어요.</div>']);return;}var html='<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><div><div style="font-size:13px;color:var(--gray)">총지출</div><div style="font-size:17px;font-weight:700;color:#111">'+fmtComma(total)+'원</div></div><div><div style="font-size:13px;color:var(--gray)">하루 평균</div><div style="font-size:15px;font-weight:600;color:#111">'+fmtComma(avg)+'원</div></div><div><div style="font-size:13px;color:var(--gray)">예산 초과</div><div style="font-size:15px;font-weight:600;color:'+(overDays?'#d9534f':'#111')+'">'+overDays+'일 <span style="font-size:13px;color:var(--gray);font-weight:400">/ '+rangeDays+'일</span></div></div></div>'+(topDay?'<div style="font-size:13px;color:var(--gray);margin-top:9px">가장 많이 쓴 날 · <b style="color:#111">'+anaDateLabel(topDay)+'</b> '+fmtComma(topAmt)+'원</div>':'')+'<div style="font-size:13px;color:var(--gray);margin-top:3px">기록 있는 '+nDays+'일 기준</div></div>';var _impM=0,_impW=0;ents.forEach(function(e){if(e.imp==='m')_impM++;else if(e.imp==='w')_impW++;});if(_impM||_impW){var _iw=[];if(_impM)_iw.push('월 요약');if(_impW)_iw.push('주간표');html+='<div style="background:#fdf6ec;border:1px solid #e0c18a;border-radius:8px;padding:11px 13px;margin-bottom:16px;font-size:13px;color:#7a5a22;line-height:1.6;word-break:keep-all"><b style="white-space:nowrap">📥 가져온 기록이 섞인 기간이에요</b> ('+_iw.join('·')+').<br>가져온 기록은 하루하루의 내역이 아니라 요약이라서, <b>무지출 일수·당근/채찍처럼 날짜 단위로 세는 숫자는 실제와 다를 수 있어요.</b> 총지출·분류별 비중은 그대로 믿어도 돼요.</div>';}var WDN=['일','월','화','수','목','금','토'];var wdSum=[0,0,0,0,0,0,0],wdAll=[0,0,0,0,0,0,0],wdOver=[0,0,0,0,0,0,0];dayKeys.forEach(function(ds){var wd=new Date(ds+'T00:00:00').getDay();wdSum[wd]+=byDay[ds];var b=dailyBudgetOf(ds);if(b>0&&byDay[ds]>b)wdOver[wd]++;});(function(){var _d=new Date(startS+'T00:00:00'),_e=new Date(endS+'T00:00:00'),_g=0;while(_d<=_e&&_g<2000){wdAll[_d.getDay()]++;_d.setDate(_d.getDate()+1);_g++;}})();var wdAvg=wdSum.map(function(v,i){return wdAll[i]?Math.round(v/wdAll[i]):0;});var wdMax=Math.max.apply(null,wdAvg.concat([1]));var totalDays=wdAll.reduce(function(a,b){return a+b;},0);var overallAvg=totalDays?Math.round(total/totalDays):0;var topSubKey='',topSubAmt=0;Object.keys(byVarSub).forEach(function(sk){if(byVarSub[sk]>topSubAmt){topSubAmt=byVarSub[sk];topSubKey=sk;}});var topWd=-1,topWdAvg=-1;wdAvg.forEach(function(a,i){if(a>topWdAvg){topWdAvg=a;topWd=i;}});var ins=[];if(topSubKey&&varTotal>0){var _tp=topSubKey.split('::');var _ps=Math.round(topSubAmt/varTotal*100);ins.push('변동지출의 <b>'+_ps+'%</b>를 <b>'+dlEsc(_tp[0]+(_tp[1]?' › '+_tp[1]:''))+'</b>에 썼어요.');}if(topWd>=0&&topWdAvg>0)ins.push('<b>'+WDN[topWd]+'요일</b>에 하루 평균 가장 많이 써요 ('+fmtComma(topWdAvg)+'원).');if(overDays>0)ins.push('이 기간에 예산을 <b style="color:#d9534f">'+overDays+'일</b> 넘겼어요.');var cwIns=anaWhipCarrotInsight(dayKeys,byDay);if(cwIns)ins.push(cwIns);if(ins.length)html+='<div style="background:#fff;border:1px solid var(--ac);border-radius:8px;padding:11px 13px;margin-bottom:16px"><div style="font-size:13px;color:var(--ac);font-weight:600;margin-bottom:5px">💡 한눈에</div>'+ins.map(function(t){return '<div style="font-size:13px;color:#333;line-height:1.6">· '+t+'</div>';}).join('')+'</div>';var _bdgD=0,_keptD=0;dayKeys.forEach(function(ds){var b=dailyBudgetOf(ds);if(b>0){_bdgD++;if(byDay[ds]<=b)_keptD++;}});var _nsD=0;(function(){var _f=dlFirstRecDate();var _c=new Date(startS+'T00:00:00'),_e2=new Date(endS+'T00:00:00'),_tt=todayStr(),_gg=0;while(_c<=_e2&&_gg<800){var ds=localDateStr(_c);if(ds<=_tt&&(!_f||ds>=_f)&&dayNoSpend(ds))_nsD++;_c.setDate(_c.getDate()+1);_gg++;}})();var _carN=0,_whN=0;(function(){var _f=dlFirstRecDate();var _c=new Date(startS+'T00:00:00'),_e2=new Date(endS+'T00:00:00'),_tt=todayStr(),_gg=0;while(_c<=_e2&&_gg<800){var ds=localDateStr(_c);if(ds<=_tt&&(!_f||ds>=_f)){var cv=consumeOf(ds);if(cv==='carrot')_carN++;else if(cv==='whip')_whN++;}_c.setDate(_c.getDate()+1);_gg++;}})();var _concP=(topSubKey&&varTotal>0)?Math.round(topSubAmt/varTotal*100):0;var _wI='<img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">';var _good=[],_bad=[];if(_bdgD>=3&&_keptD>=Math.ceil(_bdgD*0.7))_good.push('예산 세운 <b>'+_bdgD+'일</b> 중 <b>'+_keptD+'일</b>을 지켰어요.');if(_carN+_whN>=3&&_carN>_whN)_good.push('당근이 '+_wI+'보다 많았어요 <span style="white-space:nowrap">(🥕'+_carN+' · '+_wI+_whN+')</span>.');if(_nsD>=2)_good.push('무지출 <b>'+_nsD+'일</b>을 지켜냈어요.');if(overDays>=1)_bad.push('예산을 <b>'+overDays+'일</b> 넘겼어요.');if(_concP>=45){var _cparts=topSubKey.split('::');_bad.push('변동지출의 <b>'+_concP+'%</b>가 <b>'+dlEsc(_cparts[0]+(_cparts[1]?' › '+_cparts[1]:''))+'</b> 한 곳에 몰렸어요.');}if(_carN+_whN>=3&&_whN>_carN)_bad.push(_wI+'이 당근보다 많았어요 <span style="white-space:nowrap">('+_wI+_whN+' · 🥕'+_carN+')</span>.');if(nDays>=5&&(_good.length||_bad.length)){var _cc='<div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:12px 14px;margin-bottom:16px;word-break:keep-all"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray);margin-bottom:8px">이 기간 나의 소비</div>';if(_good.length){_cc+='<div style="margin-bottom:'+(_bad.length?'10px':'0')+'"><div style="font-size:13px;font-weight:700;color:var(--carrot-mk,#3f9a68);margin-bottom:4px;white-space:nowrap">🥕 잘하고 있어요</div>'+_good.map(function(t){return '<div style="font-size:13px;color:#333;line-height:1.6">· '+t+'</div>';}).join('')+'</div>';}if(_bad.length){_cc+='<div><div style="font-size:13px;font-weight:700;color:#b5762e;margin-bottom:4px;white-space:nowrap">🔧 살펴보면 좋아요</div>'+_bad.map(function(t){return '<div style="font-size:13px;color:#333;line-height:1.6">· '+t+'</div>';}).join('')+'</div>';}_cc+='<div style="font-size:12px;color:var(--gray);margin-top:9px;line-height:1.5">숫자로 보이는 것만 짚었어요 — 그럴 만한 사정이 있었을 수도 있어요.</div></div>';html+=_cc;}html+='<!--SL-->';html+='<div id="dlAnaNote" style="zoom:1.1;word-break:keep-all;background:#f6f4ef;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:13px;color:#666;line-height:1.6">막대는 <b>그 요일의 하루 평균 지출</b>이에요. 구간 안의 <b>해당 요일을 모두</b> 세서(안 쓴 날은 0원 포함) 평균을 내요 — 그래서 기간이 길어도 요일끼리 공정하게 비교돼요.<br><b style="color:#d9534f">빨간 막대</b>는 그 요일에 예산을 넘긴 날이 있었다는 뜻이고, 세로 점선은 <b>전체 하루 평균</b> 위치예요.</div>';html+='<div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:4px 0 9px">요일별 지출 패턴</div>';html+='<div style="zoom:1.1">';var refPct=wdMax>0?Math.max(0,Math.min(100,Math.round(overallAvg/wdMax*100))):0;[1,2,3,4,5,6,0].forEach(function(wd){var avg=wdAvg[wd];var ww=wdMax>0?Math.max(0,Math.min(100,Math.round(avg/wdMax*100))):0;var ov=wdOver[wd];var isTop=(wd===topWd&&avg>0);html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:13px;color:'+(isTop?'#111':'var(--gray)')+';font-weight:'+(isTop?'700':'400')+';width:14px;text-align:center">'+WDN[wd]+'</span><div style="position:relative;flex:1;height:10px;background:var(--border);border-radius:99px"><div style="position:absolute;left:0;top:0;height:100%;width:'+ww+'%;background:'+(ov?'#d9534f':'var(--ac)')+';border-radius:99px;opacity:'+((isTop||ov)?'1':'0.78')+'"></div>'+(overallAvg>0?'<div style="position:absolute;top:-2px;bottom:-2px;left:'+refPct+'%;width:0;border-left:1px dashed #888"></div>':'')+'</div><span style="font-size:13px;color:#333;font-weight:'+(isTop?'700':'400')+';width:80px;text-align:right;white-space:nowrap">'+fmtComma(avg)+'원</span><span style="font-size:13px;color:var(--gray);width:34px;text-align:right;white-space:nowrap">'+wdAll[wd]+'일</span>'+(ov?'<span style="font-size:13px;color:#d9534f;width:56px;text-align:right;white-space:nowrap">초과 '+ov+'일</span>':'<span style="width:56px"></span>')+'</div>';});if(overallAvg>0)html+='<div style="display:flex;align-items:center;gap:5px;margin:7px 0 0 22px;font-size:13px;color:var(--gray)"><span style="display:inline-block;width:16px;border-top:1px dashed #888"></span> 세로 점선 = 전체 하루 평균 '+fmtComma(overallAvg)+'원</div>';html+='</div>';(function(){var _mdDayMood={},_mdVarDay={};ents.forEach(function(e){var m=(e.mood||'').toString().trim();if(m&&!_mdDayMood[e.date])_mdDayMood[e.date]=m;var _nt=entrySpend(e);if(_nt>0&&catGroupOf(e.cat||e.category||'')!=='고정')_mdVarDay[e.date]=(_mdVarDay[e.date]||0)+_nt;});var _mdS={},_mdC={};Object.keys(_mdDayMood).forEach(function(ds){var m=_mdDayMood[ds];var sp=_mdVarDay[ds]||0;_mdS[m]=(_mdS[m]||0)+sp;_mdC[m]=(_mdC[m]||0)+1;});var _mds=Object.keys(_mdC).filter(function(m){return _mdC[m]>=2;});if(_mds.length>=2){_mds.sort(function(a,b){return (_mdS[b]/_mdC[b])-(_mdS[a]/_mdC[a]);});var _mMax=0;_mds.forEach(function(m){var a=_mdS[m]/_mdC[m];if(a>_mMax)_mMax=a;});if(_mMax<1)_mMax=1;var _hi=_mds[0],_lo=_mds[_mds.length-1];var _hiA=Math.round(_mdS[_hi]/_mdC[_hi]),_loA=Math.round(_mdS[_lo]/_mdC[_lo]);html+='<div style="height:18px"></div><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">기분에 따른 변동지출</div>';html+='<div style="zoom:1.1">';_mds.forEach(function(m){var a=Math.round(_mdS[m]/_mdC[m]);var ww=Math.round(a/_mMax*100);html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:16px;width:24px;text-align:center">'+dlEsc(m)+'</span><div style="position:relative;flex:1;height:10px;background:var(--border);border-radius:99px"><div style="position:absolute;left:0;top:0;height:100%;width:'+ww+'%;background:var(--ac);border-radius:99px;opacity:.85"></div></div><span style="font-size:13px;color:#333;width:64px;text-align:right">'+fmtComma(a)+'원</span><span style="font-size:13px;color:var(--gray);width:30px;text-align:right">'+_mdC[m]+'일</span></div>';});html+='</div>';if(_hi!==_lo&&_loA>0){var _r=_hiA/_loA;var _rt=(_r>=1.15)?('약 '+_r.toFixed(1)+'배 '):'';html+='<div style="background:#fff;border:1px solid var(--ac);border-radius:8px;padding:10px 12px;margin-top:9px;font-size:13px;color:#333;line-height:1.6;word-break:keep-all">'+dlEsc(_hi)+'인 날 하루 평균 <b>'+fmtComma(_hiA)+'원</b>으로, '+dlEsc(_lo)+'인 날('+fmtComma(_loA)+'원)보다 '+_rt+'더 써요.</div>';}html+='<div style="font-size:13px;color:var(--gray);margin-top:6px;word-break:keep-all">고정지출은 빼고 <b>변동지출</b>만 봐요(기분과 무관한 고정비 제외). 기분을 2일 이상 남긴 경우만 표시 — 감정에 따라 소비가 달라지는지 살펴보세요.</div>';}})();html+='<div style="height:18px"></div>';html+='<div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">어디에 많이 쓰나'+helpIcon('항목을 누르면 세부 내역(소분류별 금액·비중)을 펼쳐 볼 수 있어요.')+'</div>';var cats=Object.keys(byVarCat).sort(function(a,b){return byVarCat[b]-byVarCat[a];});if(!cats.length){html+='<div style="color:var(--gray);font-size:13px">변동지출 기록이 없어요.</div>';}else{html+='<div style="zoom:1.1;word-break:keep-all">';html+=cats.map(function(cat){var amt=byVarCat[cat];var pct=varTotal?Math.round(amt/varTotal*100):0;var open=!!dlAnaCatOpen[cat];var subsHtml='';if(open){var sks=Object.keys(byVarSub).filter(function(sk){return sk.indexOf(cat+'::')===0;}).sort(function(a,b){return byVarSub[b]-byVarSub[a];});subsHtml=sks.map(function(sk){var sub=sk.slice((cat+'::').length);var sa=byVarSub[sk];var sp=amt?Math.round(sa/amt*100):0;return '<div style="display:flex;justify-content:space-between;font-size:13px;color:#555;padding:3px 0 3px 16px"><span>'+dlEsc(sub)+'</span><span>'+fmtComma(sa)+'원 · '+sp+'%</span></div>';}).join('');}return '<div style="margin-bottom:10px"><div onclick="toggleAnaCat('+jsArg(cat)+')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#111;margin-bottom:3px"><span><span style="color:var(--gray);font-size:13px">'+(open?'▾':'▸')+'</span> '+dlEsc(cat)+'</span><span style="font-weight:600">'+fmtComma(amt)+'원 <span style="color:var(--gray);font-size:13px;font-weight:400">'+pct+'%</span></span></div><div style="height:6px;background:var(--border);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,pct))+'%;background:'+catColor(cat)+'"></div></div>'+subsHtml+'</div>';}).join('');html+='</div>';}if(fixedTotal>0)html+='<div style="zoom:1.1;font-size:13px;color:var(--gray);margin-top:12px;padding-top:10px;border-top:1px solid var(--tbl-border)">고정지출 합계 · '+fmtComma(fixedTotal)+'원</div>';html+='<!--SL-->'+[anaSlideSamePoint(startS,endS,total),anaSlideProjection(startS,endS,total),anaSlideTrend(),anaSlideNetTrend()].filter(Boolean).join('<div style="height:16px"></div>');anaRenderSlides(box,html.split('<!--SL-->'));}const STAR_IMG='data:image/png;base64,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';
function dlViewedCalMonth(){return (dailyDate||todayStr()).slice(0,7);}
function dlRetroIndex(dq){var qa=document.querySelectorAll('.qa');for(var i=0;i<qa.length;i++){if(qa[i].dataset.q===dq)return i;}return -1;}
function dlFocusPlan(){var key=prevMonthKey(dlViewedCalMonth());var arr=monthlyArchive[key];if(!Array.isArray(arr))return null;var idx=dlRetroIndex('다음 달 핵심 행동');if(idx<0)return null;var txt=(arr[idx]||'').trim();if(!txt)return null;return {text:txt,key:key};}
var CROWN_IMG='data:image/png;base64,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'; /* 정산 인증 버튼에 쓰던 왕관 아이콘 재사용 — 대시보드 미래 자산 카드용 */
function dlFocusBannerHtml(){var f=dlFocusPlan();if(!f)return '';return '<div onclick="dlGotoFocusPlan()" style="cursor:pointer;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.02);border:1px solid var(--ac);border-radius:8px;padding:8px 11px;margin-bottom:14px;word-break:keep-all"><img src="'+STAR_IMG+'" alt="" style="height:1.3em;flex:0 0 auto;vertical-align:middle"><span style="font-size:13px;color:var(--fg,#111);line-height:1.4"><b style="color:var(--ac);white-space:nowrap">이달의 집중</b> · '+dlEsc(f.text)+'</span></div>';}
function dlRenderFocusBanners(){var h=dlFocusBannerHtml();['dlFocusDaily','dlFocusWeek','dlFocusMonth'].forEach(function(id){var el=g(id);if(el)el.innerHTML=h;});}
function dlGotoFocusPlan(){var f=dlFocusPlan();showTab('monthly');if(f){var kp=f.key.split('-');var yEl=g('monthYear'),mEl=g('monthMonth');if(yEl)yEl.value=String(parseInt(kp[0],10));if(mEl)mEl.value=String(parseInt(kp[1],10));if(typeof loadMonthlyData==='function')loadMonthlyData();}setTimeout(function(){var t=g('retroNextPlan');if(t&&t.scrollIntoView)t.scrollIntoView({behavior:'smooth',block:'center'});},80);}
function dlAsnapWin(){var d=new Date();var last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return {inWin:(last-d.getDate())<=6,from:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+Math.max(1,last-6)).slice(-2)};}
function dlAsnapDone(){try{if(!assetHistory)loadAssetHistory();}catch(e){return false;}var ym=currentYM(),w=dlAsnapWin(),h=assetHistory||[];for(var i=0;i<h.length;i++){if(h[i].ym===ym)return !!(h[i].md&&h[i].md>=w.from);}return false;}
function dlAsnapBannerHtml(){var w=dlAsnapWin();if(!w.inWin)return '';if(dlAsnapDone())return '';var txt='<b style="color:var(--ac);white-space:nowrap">이번 달 자산 기록</b> · 달이 끝나기 전에 이번 달 자산을 저장해 흐름을 남겨요';return '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:rgba(0,0,0,.02);border:1px solid var(--ac);border-radius:8px;padding:8px 11px;margin-bottom:14px">'+'<span style="flex:0 0 auto;white-space:nowrap">📸</span>'+'<span style="flex:1;min-width:120px;font-size:13px;color:var(--fg,#111);line-height:1.4;word-break:keep-all;overflow-wrap:break-word">'+txt+'</span>'+'<button type="button" onclick="dlGotoAssetSnap()" style="flex:0 0 auto;white-space:nowrap;background:var(--ac);color:#fff;border:none;border-radius:6px;padding:6px 13px;font-size:13px;font-weight:600;cursor:pointer">저장하기</button></div>';}
function dlRenderAsnapBanners(){var h=dlAsnapBannerHtml();['dlAsnapDaily','dlAsnapWeek','dlAsnapMonth'].forEach(function(id){var el=g(id);if(el)el.innerHTML=h;});}
function dlGotoAssetSnap(){showTab('assets');setTimeout(function(){var t=g('assetHistHead');if(t&&t.scrollIntoView)t.scrollIntoView({behavior:'smooth',block:'center'});var b=g('assetSnapBtn');if(b){b.style.boxShadow='0 0 0 3px var(--ac)';setTimeout(function(){b.style.boxShadow='';},1600);}},80);}
/* ── 일일 탭 「달력」 뷰 — 레이어 겹쳐보기 (읽기 전용) ────────────────────
   데이터 소스만 호출한다: 수익금=projPayoutsInMonth(rs 전용) · 고정지출=fixedDueForDay ·
   실제 지출=dayTotal · 당근/채찍=consumeOf. 새 계산 규칙 0개 · 쓰기 0건(§2.2).
   범례 칩이 곧 스위치이고, 꺼진 레이어는 칸·목록·합계에서 함께 빠진다.
   레이어 상태는 rs_cal_layers 한 키에 저장(RS_EXTRA_KEYS 등재). */
var dlCalLayers={payout:1,fixed:1,record:1,mood:1};
function loadCalLayers(){try{var v=JSON.parse(localStorage.getItem('rs_cal_layers')||'null');if(v&&typeof v==='object'){Object.keys(dlCalLayers).forEach(function(k){if(k in v)dlCalLayers[k]=v[k]?1:0;});}}catch(e){}}
function saveCalLayers(){try{lsSet('rs_cal_layers',JSON.stringify(dlCalLayers));}catch(e){}}
function toggleCalLayer(k){if(!(k in dlCalLayers))return;dlCalLayers[k]=dlCalLayers[k]?0:1;saveCalLayers();renderDlCal();}
function dlCalAnyLayer(){return Object.keys(dlCalLayers).some(function(k){return !!dlCalLayers[k];});}
function dlCalPick(ds){setDailyDate(ds);setDailyView('daily');}
/* 아래 목록 전용 필터 — 달력 칸·범례 칩의 합계는 건드리지 않는다.
   (칩이 「종류」를 끄고 켜는 스위치라면, 이건 「분류」 축이다.) */
function setDlCalCat(v){renderDlCal._cat=v||'';renderDlCal();}
function setDlCalSort(v){renderDlCal._sort=v||'';renderDlCal();}
/* 채찍은 이미지 고정(§2.9). 데이터 URI를 칸마다 박으면 innerHTML이 수백KB가 되므로
   전용 클래스 규칙을 한 번만 주입해 재사용한다(§1.1-10 상수 1회 정의). */
function dlCalWhipStyle(){if(dlCalWhipStyle._done)return;dlCalWhipStyle._done=1;try{var st=document.createElement('style');st.textContent='.dcal-whip{background-image:url("'+WHIP_IMG+'")}';document.head.appendChild(st);}catch(e){}}
function dlCalMoodIcon(v){return (v==='whip')?'<span class="dcal-whip" role="img" aria-label="채찍"></span>':'🥕';}
function dlCalItem(cls,nm,won){return "<div class='dcal-it'><span class='dcal-ic "+cls+"'>●</span><span class='dcal-nm'>"+nm+"</span><span class='dcal-amt'>"+fmtComma(won)+"원</span></div>";}
/* 실제 지출은 「실제 지출」이라는 뭉뚱그린 이름 대신 그 날 기록의 분류 › 소분류를 그대로 보여준다.
   (납부 완료한 고정지출이 예정에서 빠지고 여기로 넘어와도 무슨 항목인지 바로 알 수 있게) */
function dlCalDaySpend(ds){var agg={},order=[];
  dailyData.forEach(function(x){if(x.date!==ds||dlIsMonthSum(x))return;var a=entrySpend(x);if(a===0)return;
    var cat=x.cat||x.category||'미분류',sub=x.sub||'';var k=cat+'\u0001'+sub;
    if(!(k in agg)){agg[k]={nm:(sub?(cat+' \u203a '+sub):cat),cat:cat,won:0};order.push(k);}agg[k].won+=a;});
  return order.map(function(k){return agg[k];});}
function dlCalFillOp(v,max){if(!(v>0)||!(max>0))return 0;var r=v/max;return r<=.25?.10:(r<=.5?.18:(r<=.75?.27:.36));}
function dlCalData(y,m1){
  var dim=new Date(y,m1,0).getDate();
  var pay={};
  if(dlCalLayers.payout){projPayoutsInMonth(y,m1).forEach(function(it){var dd=parseInt(it.ds.slice(8,10),10);(pay[dd]=pay[dd]||[]).push(it);});}
  var o={dim:dim,days:{},payN:0,payWon:0,fixN:0,fixWon:0,recN:0,recWon:0,carrot:0,whip:0,maxSpent:0};
  for(var d=1;d<=dim;d++){
    var ds=y+'-'+String(m1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var c={ds:ds,pay:[],fix:[],spent:0,recs:[],mood:null};
    if(dlCalLayers.payout&&pay[d]){c.pay=pay[d];o.payN+=c.pay.length;c.pay.forEach(function(x){o.payWon+=x.won;});}
    if(dlCalLayers.fixed){c.fix=fixedDueForDay(ds)||[];o.fixN+=c.fix.length;c.fix.forEach(function(x){o.fixWon+=(parseFloat(x.amt)||0);});}
    if(dlCalLayers.record){var t=dayTotal(ds);if(t!==0){c.spent=t;c.recs=dlCalDaySpend(ds);o.recN++;o.recWon+=t;if(t>o.maxSpent)o.maxSpent=t;}}
    if(dlCalLayers.mood){var mv=consumeOf(ds);if(mv){c.mood=mv;if(mv==='carrot')o.carrot++;else if(mv==='whip')o.whip++;}}
    o.days[d]=c;
  }
  return o;
}
function renderDlCal(){
  var box=g('dlCal');if(!box)return;
  dlCalWhipStyle();
  var today=todayStr(),cur=dailyDate||today;
  var y=parseInt(cur.slice(0,4),10),m1=parseInt(cur.slice(5,7),10);
  var D=dlCalData(y,m1);
  function chip(k,ic,label,info){
    return "<button type='button' class='dcal-chip"+(dlCalLayers[k]?' on':'')+"' onclick=\"toggleCalLayer("+jsArg(k)+")\">"
      +ic+"<span>"+label+"</span><span class='dcal-cn'>"+(dlCalLayers[k]?info:'꺼짐')+"</span></button>";
  }
  var chips="<div class='dcal-chips'>"
    +chip('payout',"<span class='dcal-sw dcal-pay'></span>",'수익금',D.payN?(D.payN+'건 · '+fmtComma(D.payWon)+'원'):'없음')
    +chip('fixed',"<span class='dcal-sw dcal-fix'></span>",'고정지출',D.fixN?(D.fixN+'건 · '+fmtComma(D.fixWon)+'원'):'없음')
    +chip('record',"<span class='dcal-sw dcal-rec'></span>",'실제 지출',D.recN?(D.recN+'일 · '+fmtComma(D.recWon)+'원'):'없음')
    +chip('mood','🥕','당근·채찍',(D.carrot||D.whip)?('당근 '+D.carrot+' · 채찍 '+D.whip):'없음')
    +"</div>"
    +"<div class='dcal-hint help-toggle'>위 항목을 눌러 켜고 끌 수 있어요. 꺼진 항목은 달력·목록·합계에서 함께 빠져요."
    +"<br>공휴일은 \u2699 메뉴 \u203a 공휴일에서 등록할 수 있어요. 날짜를 누르면 그 날 일일 기록으로 이동해요.</div>";
  var isCur=(today.slice(0,7)===cur.slice(0,7));
  var head="<div class='dcal-head'>"
    +"<button type='button' class='dcal-nav' onclick='shiftMonth(-1)'>◀</button>"
    +"<span class='dcal-ttl'>"+y+"년 "+m1+"월</span>"
    +"<button type='button' class='dcal-nav' onclick='shiftMonth(1)'>▶</button>"
    +(isCur?'':"<button type='button' class='dcal-nav' onclick='gotoThisMonth()'>이번 달</button>")
    +"</div>";
  if(!dlCalAnyLayer()){box.innerHTML=head+chips+"<div class='dcal-empty'>표시할 항목을 하나 이상 켜주세요</div>";return;}
  /* 그 달에 실제로 등장한 대분류만 고를 수 있게 한다(없는 분류를 목록에 만들지 않는다) */
  var catSet={},catList=[];
  for(var d0=1;d0<=D.dim;d0++){var c0=D.days[d0];
    c0.fix.forEach(function(it){if(it.cat&&!catSet[it.cat]){catSet[it.cat]=1;catList.push(it.cat);}});
    c0.recs.forEach(function(it){if(it.cat&&!catSet[it.cat]){catSet[it.cat]=1;catList.push(it.cat);}});}
  catList.sort();
  var fcat=renderDlCal._cat||'';
  if(fcat&&!catSet[fcat]){fcat='';renderDlCal._cat='';}   /* 이 달에 없는 분류면 조용히 전체로 */
  var fsort=renderDlCal._sort||'';
  var dayHasCat=function(c){if(!fcat)return false;
    return c.fix.some(function(it){return it.cat===fcat;})||c.recs.some(function(it){return it.cat===fcat;});};
  var cells='';
  ['일','월','화','수','목','금','토'].forEach(function(w,wi){cells+="<div class='dcal-wd"+(wi===0?' dcal-hol':(wi===6?' dcal-sat':''))+"'>"+w+"</div>";});
  var first=new Date(y,m1-1,1).getDay();
  for(var i=0;i<first;i++)cells+="<div class='dcal-c dcal-out'></div>";
  for(var d=1;d<=D.dim;d++){
    var c=D.days[d];var mk='';
    if(c.pay.length)mk+="<span class='dcal-mk dcal-pay'>"+new Array(Math.min(c.pay.length,3)+1).join('●')+"</span>";
    if(c.fix.length)mk+="<span class='dcal-mk dcal-fix'>"+new Array(Math.min(c.fix.length,3)+1).join('●')+"</span>";
    if(c.mood)mk+="<span class='dcal-mk'>"+dlCalMoodIcon(c.mood)+"</span>";
    var op=dlCalFillOp(c.spent,D.maxSpent);
    var dw=new Date(y,m1-1,d).getDay(),reg=(holidays.indexOf(c.ds)>=0);
    var dcls='dcal-d'+((dw===0||reg)?' dcal-hol':(dw===6?' dcal-sat':''));
    cells+="<div class='dcal-c"+(c.ds===today?' dcal-today':'')+(c.ds===cur?' dcal-sel':'')+"' onclick=\"dlCalPick('"+c.ds+"')\">"
      +(reg?"<span class='dcal-hfill'></span>":'')
      +(op?("<span class='dcal-fill' style='opacity:"+op+"'></span>"):'')
      +(dayHasCat(c)?"<span class='dcal-ring'></span>":'')
      +"<span class='"+dcls+"'>"+d+"</span>"+(mk?("<span class='dcal-mks'>"+mk+"</span>"):'')+"</div>";
  }
  var glist=[];
  for(var d2=1;d2<=D.dim;d2++){
    var c2=D.days[d2];
    if(!(c2.pay.length||c2.fix.length||c2.spent||c2.mood))continue;
    var items='',sum=0,n=0;
    if(!fcat)c2.pay.forEach(function(it){items+=dlCalItem('dcal-pay',dlEsc(it.name)+(it.shifted?" <span class='dcal-sub'>휴일 순연</span>":''),it.won);sum+=(parseFloat(it.won)||0);n++;});
    c2.fix.forEach(function(it){if(fcat&&it.cat!==fcat)return;items+=dlCalItem('dcal-fix',dlEsc(it.sub?(it.cat+' › '+it.sub):it.cat),it.amt);sum+=(parseFloat(it.amt)||0);n++;});
    c2.recs.forEach(function(it){if(fcat&&it.cat!==fcat)return;items+=dlCalItem('dcal-rec',dlEsc(it.nm),it.won);sum+=(parseFloat(it.won)||0);n++;});
    if(!n&&!(!fcat&&c2.mood))continue;   /* 분류를 고른 동안엔 기분만 있는 날은 감춘다 */
    glist.push({d:d2,ds:c2.ds,mood:c2.mood,items:items,sum:sum});
  }
  if(fsort==='amt')glist.sort(function(a,b){return b.sum-a.sum;});
  var groups=glist.map(function(gp){
    return "<div class='dcal-grp'><div class='dcal-gd' onclick=\"dlCalPick('"+gp.ds+"')\"><span>"+m1+"/"+gp.d+"("+dlWeekdayKo(gp.ds)+")</span>"
      +(gp.mood?("<span>"+dlCalMoodIcon(gp.mood)+"</span>"):'')+"</div>"+gp.items+"</div>";
  }).join('');
  var _o=function(v,l,cur){return "<option value='"+dlEsc(v)+"'"+(cur===v?" selected":"")+">"+dlEsc(l)+"</option>";};
  var fbar=catList.length?("<div class='dcal-fbar'>"
    +"<select class='dcal-fsel' onchange='setDlCalCat(this.value)'>"+_o('','전체 분류',fcat)+catList.map(function(c){return _o(c,c,fcat);}).join('')+"</select>"
    +"<select class='dcal-fsel' onchange='setDlCalSort(this.value)'>"+_o('','날짜순',fsort)+_o('amt','금액 큰 순',fsort)+"</select>"
    +"</div>"):"";
  box.innerHTML=head+chips+"<div class='dcal-grid'>"+cells+"</div>"+fbar
    +(groups?("<div class='dcal-list'>"+groups+"</div>")
      :("<div class='dcal-empty'>"+(fcat?"고른 분류에 해당하는 내용이 없어요.":"이 달에는 표시할 내용이 없어요.")+"</div>"));
}
function renderActiveView(){dlRenderFocusBanners();dlRenderAsnapBanners();if(dailyView==='week')renderWeekView();else if(dailyView==='month')renderMonthView();else if(dailyView==='calendar')renderDlCal();else if(dailyView==='special')renderSpecialView();else if(dailyView==='analysis')renderAnalysis();else renderBudget();}
var DL_PALETTES={
  crimson:['#A01035','#C96A78','#E0A96D','#8C6A56','#B58DB0','#6E9C8A','#D98C9D','#A85751','#C9A36A','#7A4A52'],
  mint:['#1B6E4F','#5FA88A','#8FB97E','#C2B96A','#5F9CA8','#A88FB0','#C98E6D','#3F8C6E','#7EC8A8','#9CAE5E'],
  clay:['#1a3a3a','#4F8C7E','#FFB084','#B8A4ED','#C9A36A','#E08A8A','#7FA8C0','#9CB86E','#5FA89A','#D9A0C0'],
  clay2:['#7C5FC7','#B8A4ED','#FF4D8B','#A4D4C5','#F0A6C8','#6FA0D8','#E0B05A','#8FB97E','#C98ED0','#5FB0E8'],
  fiesta:['#0FB89A','#B8A4ED','#FF4D8B','#FFB084','#5FB0E8','#F0C94A','#8FD17A','#C97FD0','#FF8FA8','#56C7B8'],
  _default:['#c08497','#e8a87c','#85b79d','#9fa8da','#f0b67f','#b39ddb','#7fc8c0','#f48fb1','#a5d6a7','#ce93d8']
};
function dlPalette(){var t=(document.body.className||'').trim().split(/\s+/)[0];return DL_PALETTES[t]||DL_PALETTES._default;}
function dlExtraColor(idx){var hue=Math.round((idx*137.508+47)%360);var light=(idx%2===0)?60:44;return 'hsl('+hue+',55%,'+light+'%)';}
function catColor(cat){if(cat==='미분류')return '#bbbbbb';if(!dailyCats)loadDailyCats();var i=dailyCats.indexOf(cat);if(i<0)return '#c8c8c8';var pal=dlPalette();if(i<pal.length)return pal[i];return dlExtraColor(i-pal.length);}
function dlRgb(c){c=String(c).trim();if(c.charAt(0)==='#'){var h=c.slice(1);if(h.length===3)h=h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}var m=c.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%/i);if(m){var H=(+m[1])/360,S=(+m[2])/100,L=(+m[3])/100;var q=L<0.5?L*(1+S):L+S-L*S;var p=2*L-q;var hue=function(t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};return [Math.round(hue(H+1/3)*255),Math.round(hue(H)*255),Math.round(hue(H-1/3)*255)];}var rm=c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);if(rm)return [+rm[1],+rm[2],+rm[3]];return [140,140,140];}
function dlCatChip(cat){var rgb=dlRgb(catColor(cat));var r=rgb[0],g=rgb[1],b=rgb[2];var bg='rgba('+r+','+g+','+b+',.14)';var tx='rgb('+Math.round(r*0.58)+','+Math.round(g*0.58)+','+Math.round(b*0.58)+')';return 'background:'+bg+';color:'+tx;}
function recGroup(e){var grp=e.group,c=e.cat||e.category;/* 저장된 그룹은 그 그룹에 분류가 아직 있을 때만 믿는다 — 분류를 옮기면 지난 기록도 새 그룹으로 */if(grp!=='고정'&&grp!=='변동'&&grp!=='특별'||!(dailyTree&&dailyTree[grp]&&dailyTree[grp][c]))grp=catGroupOf(c);if(grp!=='고정'&&grp!=='변동'&&grp!=='특별')grp='미분류';return grp;}
function groupColor(grp){if(grp==='고정')return '#9AA7B8';if(grp==='변동')return ac();if(grp==='특별')return specialColor();return '#cfcfcf';}
function stackedCatDatasets(dates){if(!dailyTree)loadDailyCats();var order=['고정','변동','특별','미분류'];var present={};dailyData.forEach(function(e){if(dates.indexOf(e.date)<0||dlIsMonthSum(e))return;var a=entrySpend(e);if(a>0)present[recGroup(e)]=true;});var groups=order.filter(function(gr){return present[gr];});return groups.map(function(gr){var data=dates.map(function(ds){return dailyData.reduce(function(s,e){if(e.date!==ds||dlIsMonthSum(e))return s;var a=entrySpend(e);if(a===0)return s;return s+(recGroup(e)===gr?a:0);},0);});return {label:(gr==='고정'?'고정':gr==='변동'?'변동':gr==='특별'?'특별':'미분류'),data:data,backgroundColor:groupColor(gr),borderRadius:3,stack:'spend'};});}
function abbrWon(v){v=Number(v)||0;if(v>=10000){var m=v/10000;return (m>=10?Math.round(m):Math.round(m*10)/10)+'만';}return v.toLocaleString();}
function fmtEok(won){won=Math.round(Number(won)||0);if(won>=100000000){var e=won/1e8;return (e>=10?(Math.round(e*10)/10):(Math.round(e*100)/100))+'억';}if(won>=10000){return Math.round(won/10000).toLocaleString()+'만';}return won.toLocaleString();}
function dlChartOpts(maxV){var _fs=dlFontScale();var o={responsive:true,maintainAspectRatio:false,events:['click'],interaction:{mode:'index',intersect:false,axis:'x'},plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,boxHeight:10,font:{size:Math.round(10*_fs)},padding:7}},tooltip:{mode:'index',intersect:false,axis:'x',titleFont:{size:Math.round(12*_fs)},bodyFont:{size:Math.round(12*_fs)},footerFont:{size:Math.round(11*_fs)},filter:function(ctx){return (parseFloat(ctx.parsed.y)||0)>0;},itemSort:function(a,b){var pa=(a.dataset&&a.dataset.label==='예산')?1:0,pb=(b.dataset&&b.dataset.label==='예산')?1:0;return pa-pb;},callbacks:{label:function(ctx){return (ctx.dataset.label?ctx.dataset.label+': ':'')+(ctx.parsed.y||0).toLocaleString()+'원';},footer:function(items){var s=0,n=0;items.forEach(function(it){if(it.dataset&&it.dataset.stack==='spend'){s+=(parseFloat(it.parsed.y)||0);n++;}});return n>1?'지출 합계: '+s.toLocaleString()+'원':'';}}}},scales:{x:{stacked:true,ticks:{font:{size:Math.round(10*_fs)}},grid:{display:false}},y:{stacked:true,beginAtZero:true,ticks:{font:{size:Math.round(10*_fs)},callback:function(v){return abbrWon(v);}},grid:{color:'#f0f0f0'}},yBudget:{display:false,stacked:false,beginAtZero:true,min:0}}};if(maxV){o.scales.y.max=maxV;o.scales.yBudget.max=maxV;}return o;}
function dlCatDeleted(c){c=String(c||'');if(!c||c==='미분류')return false;return catGroupOf(c)==='';}
function entrySpendRaw(e){var a=parseFloat(e.amount)||0;if(a===0)return 0;if(a<0)return a;var cb=parseFloat(e.cashback)||0;if(cb>0&&e.cbDeduct!==false){a-=cb;if(a<0)a=0;}return a;}
function entrySpend(e){if(dlCatDeleted(e.cat||e.category||''))return 0;return entrySpendRaw(e);}function catSpentMap(scope,dateStr){if(typeof ensureLoanCats==='function')ensureLoanCats();var entries=(scope==='weekly')?weekEntries(dateStr):monthEntries(dateStr);var m={};entries.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'미분류';m[c]=(m[c]||0)+a;});return m;}
function prevPeriodDate(scope,ds){var p=ds.split('-');if(scope==='weekly'){var dt=new Date(+p[0],+p[1]-1,+p[2]);dt.setDate(dt.getDate()-7);return localDateStr(dt);}var d2=new Date(+p[0],+p[1]-1,1);d2.setMonth(d2.getMonth()-1);return localDateStr(d2);}
function _settleCard(label,name,val,color){return '<div style="flex:1;min-width:96px;background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:9px 11px"><div style="font-size:13px;color:var(--gray);margin-bottom:3px">'+label+'</div><div style="font-size:13px;font-weight:700">'+dlEsc(name)+'</div><div style="font-size:13px;color:'+color+';font-weight:600;margin-top:2px">'+val+'</div></div>';}
function settlementCompareHtml(scope,dateStr,isPast){
  if(!dailyTree)loadDailyCats();
  var now=catSpentMap(scope,dateStr),before=catSpentMap(scope,prevPeriodDate(scope,dateStr));
  var rows=Object.keys(now).filter(function(c){return now[c]>0;}).map(function(c){return {c:c,n:now[c]||0,p:before[c]||0,b:effCatBudget(scope,c,dateStr)};});
  if(!rows.length)return '';
  var current=scope==='weekly'?'이번주':'이번달',previous=scope==='weekly'?'지난주':'지난달';
  function compare(n,p){if(!p)return '<span style="color:#ccc">-</span>';var d=n-p;return d?'<span style="color:'+(d>0?'#d9534f':'#1B6E4F')+'">'+(d>0?'▲ ':'▼ ')+fmtComma(Math.abs(d))+' ('+(d>0?'+':'')+Math.round(d/p*100)+'%)</span>':'-';}
  function budget(n,b){if(!b)return '<span style="color:#ccc">-</span>';var d=n-b;return d?'<span style="color:'+(d>0?'#d9534f':'#1B6E4F')+'">'+(d>0?'▲ ':'▼ ')+fmtComma(Math.abs(d))+' ('+Math.round(Math.abs(d)/b*100)+'%)</span>':'-';}
  function rowBg(bg){return bg?'background-color:#fff;background-image:linear-gradient('+bg+','+bg+');':'';}
  function stickyBg(bg){return bg?rowBg(bg):'background-color:#fff;';}
  function item(x,strong,bg){return '<tr style="'+rowBg(bg)+(strong?'font-weight:700;':'')+'"><td class="st-first" style="'+stickyBg(bg)+'padding:7px 6px;font-size:13px">'+dlEsc(x.c)+'</td><td style="padding:7px 6px;text-align:right;font-size:13px">'+fmtComma(x.n)+'</td><td style="padding:7px 6px;text-align:right;font-size:13px">'+budget(x.n,x.b)+'</td><td style="padding:7px 6px 7px 18px;text-align:right;font-size:13px;color:var(--gray)">'+fmtComma(x.p)+'</td><td style="padding:7px 6px;text-align:right;font-size:13px">'+compare(x.n,x.p)+'</td></tr>';}
  function groupRow(label,bg){return '<tr style="'+rowBg(bg)+'"><td class="st-first" style="'+stickyBg(bg)+'padding:7px 6px;font-size:13px;font-weight:700">'+label+'</td><td></td><td></td><td></td><td></td></tr>';}
  var groups={고정:[],변동:[],특별:[],기타:[]};rows.forEach(function(x){var g=catGroupOf(x.c)||'기타';groups[g].push(x);});
  var body='',all={c:'총계',n:0,p:0,b:0},count=0;
  [['고정','🔒 고정비','var(--st-fix-h)','var(--st-fix-y)'],['변동','🔄 변동비','var(--st-var-h)','var(--st-var-y)'],['특별','🎁 특별비','var(--st-spec-h)','var(--st-spec-y)'],['기타','기타','rgba(0,0,0,.045)','rgba(0,0,0,.03)']].forEach(function(g){var set=groups[g[0]];if(!set.length)return;count++;set.sort(function(a,b){return b.n-a.n;});body+=groupRow(g[1],g[2])+set.map(function(x){return item(x,false,'');}).join('');var sum={c:g[0]+'비 계',n:0,p:0,b:0};set.forEach(function(x){sum.n+=x.n;sum.p+=x.p;sum.b+=x.b;all.n+=x.n;all.p+=x.p;all.b+=x.b;});body+=item(sum,true,g[3]);});
  if(count>1)body+=item(all,true,'var(--st-tot)');
  return '<div style="margin:22px 0 16px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:8px">정산 비교</div><div class="tbl-wrap st-table-wrap"><table class="st-table"><colgroup><col class="st-col-cat"><col class="st-col-now"><col class="st-col-budget"><col class="st-col-previous"><col class="st-col-change"></colgroup><thead><tr style="color:var(--gray)"><th class="st-first" style="text-align:left;padding:4px 6px;font-size:13px">분류</th><th style="text-align:right;padding:4px 6px;font-size:13px">'+current+'</th><th style="text-align:right;padding:4px 6px;font-size:13px">예산대비</th><th style="text-align:right;padding:4px 6px 4px 18px;font-size:13px">'+previous+'</th><th style="text-align:right;padding:4px 6px;font-size:13px">증감</th></tr></thead><tbody>'+body+'</tbody></table></div></div>';
}
var xlsRows=[],xlsCols=[],xlsSelCol=-1,xlsHeaderRaw=[],xlsWb=null,xlsSheet='',xlsErr='',xlsMode='header';
var _XLS_FIX=['월세','전세','관리비','가스','수도','전기','통신','휴대폰','핸드폰','폰요금','인터넷','보험','대출','이자','원리금','할부','구독','넷플릭스','유튜브','왓챠','티빙','디즈니','ott','멤버십','정수기','렌탈','렌트','회비','후원','헌금','기부','세금','국민연금','건강보험','연금','적금','저축','용돈','학원','월납','요금'];
var _XLS_VAR=['식비','식재료','외식','배달','카페','간식','마트','장보','생활','생필','의류','의복','패션','미용','뷰티','화장','쇼핑','문화','여가','취미','취향','여행','숙박','교통','택시','버스','지하철','주유','기름','주차','의료','병원','약국','건강','운동','헬스','경조','선물','모임','접대','육아','아기','자녀','유아','기저귀','분유','반려','애견','수수료','용품','도서'];
function _xnorm(s){return String(s==null?'':s).replace(/\s/g,'').trim();}
function _xgrp(s){var t=_xnorm(s);if(t.indexOf('고정')===0)return '고정';if(t.indexOf('변동')===0)return '변동';return '';}
function _xamt(v){var n=parseFloat(String(v==null?'':v).replace(/[^0-9.\-]/g,''));return isNaN(n)?0:n;}
function _xlsClassify(item){
  if(!dailyTree)loadDailyCats();
  var g=catGroupOf(item);if(g)return g;
  var s=_xnorm(item).toLowerCase();
  for(var i=0;i<_XLS_FIX.length;i++){if(s.indexOf(_XLS_FIX[i])>=0)return '고정';}
  for(var i=0;i<_XLS_VAR.length;i++){if(s.indexOf(_XLS_VAR[i])>=0)return '변동';}
  return '변동';
}
function openExcelImport(){var inp=g('xlsImportInput');if(inp){inp.value='';inp.click();}}
function onExcelImportFile(ev){
  var f=ev.target.files&&ev.target.files[0];if(!f)return;
  if(typeof XLSX==='undefined'){alert('엑셀 기능을 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.');return;}
  var name=(f.name||'').toLowerCase();var isCsv=name.indexOf('.csv')===name.length-4&&name.length>4;
  var rd=new FileReader();
  rd.onload=function(e){
    try{
      var wb=isCsv?XLSX.read(e.target.result,{type:'string'}):XLSX.read(new Uint8Array(e.target.result),{type:'array'});
      if(!wb.SheetNames||!wb.SheetNames.length){alert('시트를 찾지 못했어요.');return;}
      xlsWb=wb;selectXlsSheetIdx(0);
      var m=g('xlsImportModal');if(m)m.classList.add('open');
    }catch(err){alert('파일을 읽지 못했어요. 엑셀(.xlsx)·CSV 형식인지 확인해 주세요.');}
  };
  if(isCsv)rd.readAsText(f);else rd.readAsArrayBuffer(f);
}
function selectXlsSheetIdx(i){
  if(!xlsWb||!xlsWb.SheetNames)return;
  var nm=xlsWb.SheetNames[i];if(nm==null)return;
  xlsSheet=nm;
  var rows=XLSX.utils.sheet_to_json(xlsWb.Sheets[nm],{header:1,defval:''});
  prepExcelImport(rows);
  renderExcelImport();
}
function prepExcelImport(rows){
  xlsRows=[];xlsCols=[];xlsSelCol=-1;xlsHeaderRaw=[];xlsErr='';xlsMode='header';
  if(!rows||!rows.length){xlsErr='빈 시트예요. 다른 시트를 골라보세요.';return false;}
  var hr=-1;
  for(var i=0;i<Math.min(rows.length,15);i++){
    var j=(rows[i]||[]).map(_xnorm).join('|');
    if(j.indexOf('대분류')>=0||j.indexOf('소분류')>=0||j.indexOf('구분')>=0){hr=i;break;}
  }
  if(hr<0)return _prepHeaderless(rows);
  var header=(rows[hr]||[]).map(_xnorm);
  function findCol(key){for(var c=0;c<header.length;c++){if(header[c].indexOf(key)>=0)return c;}return -1;}
  var ci={grp:findCol('구분'),cat:findCol('대분류'),sub:findCol('소분류')};
  if(ci.cat<0&&ci.sub<0)return _prepHeaderless(rows);
  var ignore=['구분','대분류','소분류','분석','피드백','비고','증감'];
  var cand=[];
  for(var c=0;c<header.length;c++){
    if(c===ci.grp||c===ci.cat||c===ci.sub)continue;
    var h=header[c];if(!h)continue;
    var skip=false;ignore.forEach(function(x){if(h.indexOf(x)>=0)skip=true;});
    if(skip)continue;
    cand.push({idx:c,label:(rows[hr][c]!==''&&rows[hr][c]!=null)?rows[hr][c]:('열 '+(c+1))});
  }
  var sel=-1;cand.forEach(function(o){if(_xnorm(o.label).indexOf('예산')>=0)sel=o.idx;});
  if(sel<0&&cand.length)sel=cand[cand.length-1].idx;
  var data=[],lastGrp='',lastCat='';
  for(var r=hr+1;r<rows.length;r++){
    var row=rows[r];if(!row)continue;
    var g0=_xgrp(ci.grp>=0?row[ci.grp]:'');if(g0)lastGrp=g0;
    var cat=_xnorm(ci.cat>=0?row[ci.cat]:'');if(cat)lastCat=cat;
    var sub=_xnorm(ci.sub>=0?row[ci.sub]:'');
    if(!sub)continue;
    if(sub.indexOf('계')===0||sub.indexOf('총계')>=0||sub==='합계')continue;
    if(!lastCat)continue;
    data.push({grp:lastGrp,cat:lastCat,sub:sub,row:row,sel:true});
  }
  if(!data.length)return _prepHeaderless(rows);
  xlsRows=data;xlsCols=cand;xlsSelCol=sel;xlsHeaderRaw=rows[hr];xlsMode='header';
  return true;
}
function _prepHeaderless(rows){
  xlsRows=[];xlsCols=[];xlsSelCol=-1;xlsHeaderRaw=[];xlsErr='';xlsMode='auto';
  if(!dailyTree)loadDailyCats();
  var maxc=0;rows.forEach(function(r){if(r&&r.length>maxc)maxc=r.length;});
  if(maxc<2){xlsErr='이 시트에서 항목·금액을 찾지 못했어요. 다른 시트를 골라보세요.';return false;}
  var txt=[],num=[];for(var c=0;c<maxc;c++){txt[c]=0;num[c]=0;}
  rows.forEach(function(r){if(!r)return;for(var c=0;c<maxc;c++){var v=r[c];if(v==null||v==='')continue;
    if(_xamt(v)>0&&/^[\s0-9,.\-원₩]+$/.test(String(v)))num[c]++;
    else if(/[가-힣A-Za-z]/.test(String(v)))txt[c]++;
  }});
  var labelCol=-1,best=0;for(var c=0;c<maxc;c++){if(txt[c]>best){best=txt[c];labelCol=c;}}
  if(labelCol<0){xlsErr='항목 이름 열을 찾지 못했어요. 다른 시트를 골라보세요.';return false;}
  var cand=[];
  for(var c=0;c<maxc;c++){if(c===labelCol)continue;if(num[c]>=1){
    var samp='';for(var r2=0;r2<rows.length;r2++){var v=rows[r2]&&rows[r2][c];if(v!=null&&_xamt(v)>0){samp=fmtComma(_xamt(v));break;}}
    cand.push({idx:c,label:'열 '+(c+1)+(samp?(' (예: '+samp+')'):'')});
  }}
  if(!cand.length){xlsErr='금액(숫자) 열을 찾지 못했어요. 다른 시트를 골라보세요.';return false;}
  var sel=cand[0].idx,selN=num[cand[0].idx];cand.forEach(function(o){if(num[o.idx]>selN){selN=num[o.idx];sel=o.idx;}});
  var data=[];
  rows.forEach(function(r){if(!r)return;var label=_xnorm(r[labelCol]);if(!label)return;
    if(label.indexOf('총계')>=0||label.indexOf('합계')>=0||label.indexOf('소계')>=0||/계$/.test(label))return;
    var hasNum=false;cand.forEach(function(o){if(_xamt(r[o.idx])>0)hasNum=true;});
    if(!hasNum)return;
    data.push({grp:_xlsClassify(label),cat:label,sub:'',row:r,sel:true});
  });
  if(!data.length){xlsErr='가져올 항목을 찾지 못했어요. 다른 시트를 골라보세요.';return false;}
  xlsRows=data;xlsCols=cand;xlsSelCol=sel;xlsHeaderRaw=[];xlsMode='auto';
  return true;
}
function _xlsCounts(){var n=0,sel=0;xlsRows.forEach(function(d){var won=_xamt(d.row[xlsSelCol]);if(won<=0)return;n++;if(d.sel)sel++;});return {n:n,sel:sel};}
function _xlsNoteHtml(){if(!dailyTree)loadDailyCats();var monLbl=_xlsMonLbl();var n=0,sel=0,newCats=0,newSubs=0;xlsRows.forEach(function(d){var won=_xamt(d.row[xlsSelCol]);if(won<=0)return;n++;if(!d.sel)return;sel++;var grp=d.grp||catGroupOf(d.cat)||'변동';var hasCat=!!(dailyTree[grp]&&dailyTree[grp][d.cat]);if(!hasCat)newCats++;if(d.sub){var subs=hasCat?dailyTree[grp][d.cat]:[];if(subs.indexOf(d.sub)<0)newSubs++;}});return '총 '+n+'개 중 <b>'+sel+'개</b>를 <b>'+monLbl+'</b> 월간 예산에 채워요. 새 분류 '+newCats+'개·세부 '+newSubs+'개. <b>그 달만</b> 반영되고 다른 달·기록은 그대로예요.';}
function _xlsUpdateCount(){var c=_xlsCounts();var nb=g('xlsNote');if(nb)nb.innerHTML=_xlsNoteHtml();var b=g('xlsApplyBtn');if(b){b.textContent=c.sel+'개 가져오기';b.disabled=(c.sel===0);}}
function toggleXlsRow(i){if(xlsRows[i])xlsRows[i].sel=!xlsRows[i].sel;_xlsUpdateCount();}
function xlsToggleAll(){var c=_xlsCounts();var t=(c.sel<c.n);xlsRows.forEach(function(d){var won=_xamt(d.row[xlsSelCol]);if(won>0)d.sel=t;});renderExcelImport();}
function setXlsCol(i){xlsSelCol=parseInt(i);renderExcelImport();}
function _xlsMonLbl(){var dd=dailyDate||todayStr();var p=monthKey(dd).split('-');return parseInt(p[0])+'년 '+parseInt(p[1])+'월';}
function renderExcelImport(){
  if(!dailyTree)loadDailyCats();
  var monLbl=_xlsMonLbl();
  var html='';
  if(xlsWb&&xlsWb.SheetNames&&xlsWb.SheetNames.length>1){
    html+='<div style="margin-bottom:12px"><div style="font-weight:600;margin-bottom:6px">어떤 <b>시트</b>를 가져올까요?</div><div style="display:flex;flex-direction:column;gap:5px">';
    xlsWb.SheetNames.forEach(function(nm,i){var on=(nm===xlsSheet);html+='<label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:14px"><input type="radio" name="xlssheet" '+(on?'checked ':'')+'onchange="selectXlsSheetIdx('+i+')" style="accent-color:var(--ac)"><span>'+dlEsc(String(nm))+'</span></label>';});
    html+='</div></div>';
  }
  if(xlsErr){
    html+='<div style="color:#d9534f;margin:8px 0;font-size:13.5px;line-height:1.5">'+dlEsc(xlsErr)+'</div>';
    html+='<div style="display:flex;justify-content:flex-end;margin-top:10px"><button type="button" class="btn btn-ol" onclick="closeM(\'xlsImportModal\')">닫기</button></div>';
    g('xlsImportBox').innerHTML=html;return;
  }
  if(xlsMode==='auto'){
    html+='<div style="font-size:13px;color:var(--ac);background:rgba(0,0,0,.03);border-radius:8px;padding:8px 10px;margin-bottom:10px;line-height:1.5">머리글(구분·대분류·소분류)이 없어 <b>항목 이름으로 고정/변동을 자동 분류</b>했어요. 아래 🔒·🔄가 맞는지 확인해 주세요.</div>';
  }
  var colH='<div style="margin-bottom:12px"><div style="font-weight:600;margin-bottom:6px">어느 열을 <b>'+monLbl+' 예산</b>으로 가져올까요?</div>';
  if(!xlsCols.length){colH+='<div style="color:#d9534f">가져올 금액 열을 찾지 못했어요.</div>';}
  else{colH+='<div style="display:flex;flex-direction:column;gap:5px">';
    xlsCols.forEach(function(o){var on=(o.idx===xlsSelCol);colH+='<label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:14px"><input type="radio" name="xlscol" '+(on?'checked ':'')+'onchange="setXlsCol('+o.idx+')" style="accent-color:var(--ac)"><span>'+dlEsc(String(o.label))+'</span></label>';});
    colH+='</div>';}
  colH+='</div>';
  var rowsHtml='';
  xlsRows.forEach(function(d,idx){var won=_xamt(d.row[xlsSelCol]);if(won<=0)return;
    var grp=d.grp||catGroupOf(d.cat)||'변동';
    var hasCat=!!(dailyTree[grp]&&dailyTree[grp][d.cat]);
    var subs=hasCat?dailyTree[grp][d.cat]:[];
    var catNew=!hasCat;
    var newSub=d.sub?(subs.indexOf(d.sub)<0):false;
    var catCell=dlEsc(d.cat)+((catNew&&!d.sub)?' <span style="color:var(--ac);font-size:11px">신규</span>':'');
    var subCell=d.sub?(dlEsc(d.sub)+(newSub?' <span style="color:var(--ac);font-size:11px">신규</span>':'')):'<span style="color:var(--gray)">—</span>';
    rowsHtml+='<tr style="border-top:1px solid var(--tbl-border)"><td style="padding:4px 6px;text-align:center"><input type="checkbox" '+(d.sel?'checked ':'')+'onchange="toggleXlsRow('+idx+')" style="accent-color:var(--ac)"></td><td style="padding:4px 6px">'+(grp==='고정'?'🔒':'🔄')+'</td><td style="padding:4px 6px;word-break:keep-all">'+catCell+'</td><td style="padding:4px 6px;word-break:keep-all">'+subCell+'</td><td style="padding:4px 6px;text-align:right;font-weight:600">'+fmtComma(won)+'</td></tr>';
  });
  var _c=_xlsCounts();
  var selAllBtn=_c.n?('<div style="display:flex;justify-content:flex-end;margin-bottom:6px"><button type="button" onclick="xlsToggleAll()" style="border:1px solid var(--tbl-border);background:#fff;border-radius:99px;padding:4px 11px;font-size:12px;cursor:pointer;font-family:inherit">'+(_c.sel<_c.n?'전체 선택':'전체 해제')+'</button></div>'):'';
  var note='<div id="xlsNote" style="font-size:13px;color:var(--gray);margin:6px 0 8px;line-height:1.5">'+_xlsNoteHtml()+'</div>';
  var table=_c.n?('<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--gray)"><th style="padding:4px 6px"></th><th style="padding:4px 6px"></th><th style="text-align:left;padding:4px 6px">대분류</th><th style="text-align:left;padding:4px 6px">소분류</th><th style="text-align:right;padding:4px 6px">예산</th></tr></thead><tbody>'+rowsHtml+'</tbody></table>'):'<div style="color:#d9534f;margin:10px 0">가져올 금액이 없어요. 다른 열을 골라보세요.</div>';
  var btns='<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px"><button type="button" class="btn btn-ol" onclick="closeM(\'xlsImportModal\')">취소</button><button type="button" class="btn btn-bk" id="xlsApplyBtn" onclick="applyExcelImport()"'+(_c.sel?'':' disabled')+'>'+_c.sel+'개 가져오기</button></div>';
  g('xlsImportBox').innerHTML=html+colH+note+selAllBtn+table+btns;
}
function applyExcelImport(){
  var dd=dailyDate||todayStr();
  if(!dailyTree)loadDailyCats();
  var map=bWriteMap('monthly',dd);
  var cnt=0,addedC=0,addedS=0;
  xlsRows.forEach(function(d){if(!d.sel)return;var won=_xamt(d.row[xlsSelCol]);if(won<=0)return;
    var grp=d.grp||catGroupOf(d.cat)||'변동';
    if(!dailyTree[grp])dailyTree[grp]={};
    if(!dailyTree[grp][d.cat]){dailyTree[grp][d.cat]=[];addedC++;}
    if(d.sub){if(dailyTree[grp][d.cat].indexOf(d.sub)<0){dailyTree[grp][d.cat].push(d.sub);addedS++;}map[subKey(d.cat,d.sub)]=won;}
    else{map[d.cat]=won;}
    cnt++;
  });
  saveDailyCats();loadDailyCats();saveDailyBudget();
  if(typeof renderMonthView==='function')renderMonthView();
  if(typeof renderCatOptions==='function')try{renderCatOptions();}catch(e){}
  closeM('xlsImportModal');
  alert(cnt+'개 항목을 '+monthKey(dd)+' 월간 예산에 가져왔어요.'+(addedC?('\n새 분류 '+addedC+'개·세부 '+addedS+'개가 추가됐어요.'):''));
}
/* ── 가계부 가져오기 (주간 인증표·월간 정산표 → 일일 기록) ─────────────
   기록 표식: rec.imp='w'(주간표 일별 기록) / rec.imp='m'(월간 정산표 요약 기록, 매월 1일).
   충돌 규칙(순서 무관): 한 달의 지출 기록 주인은 한 소스 —
   · 주간표를 올리면 그 달의 imp:'m' 요약만 자동 교체(직접 입력·다른 달 불변).
   · 월간표는 그 달에 일별(imp:'w')·직접 입력 지출 기록이 있으면 기록은 건너뜀(수입·예산은 병합).
   파괴 작업은 imp 표식이 붙은 기록만, 그 달만 건드린다(G1). 버킷은 달력월(slice 0,7). */
var lgStage=null,lgYearSel=0,lgMonSel={},lgOptSavings=false,lgOptIncome=true,lgOptBudget=true,lgCatMapOpen=false;
function lgKeyOf(it){return it.kind==='savings'?(it.sub||it.cat):it.cat;}
var LG_SYN=[
  ['식비',['식비','식사','식자재','식재료','먹거리','장보기','외식','배달','카페','음료','커피','간식','부식','주식']],
  ['자동차',['교통','교통비','택시','버스','전철','지하철','대중교통','주유','유류','주차','통행료','차량','자동차']],
  ['통신',['통신','인터넷','휴대폰','핸드폰','폰요금','전화','구독료']],
  ['주거',['관리비','월세','전기','수도','가스','공과금','주거','도시가스','렌탈']],
  ['보험',['보험']],
  ['건강',['의료','병원','약국','약값','치과','영양제','건강','운동','헬스']],
  ['용돈/꾸밈',['용돈','꾸밈','미용','헤어','피부','화장품','네일','의류','옷','잡화','마사지']],
  ['생활용품',['생활용품','생필품','살림','소모품','잡화']],
  ['계발/문화',['문화','여가','취미','영화','공연','도서','책','자기계발','자기개발','교육','학원','수강','스터디','강의','계발']],
  ['경조사',['경조사','선물','축의금','부의금']],
  ['자녀',['육아','아이','자녀','기저귀','분유','키즈']],
  ['여행',['여행','숙소','항공']],
  ['세금',['세금','수수료','국민연금','건강보험']]
];
function _lgSynKey(t){
  for(var i=0;i<LG_SYN.length;i++){
    var syn=LG_SYN[i][1];
    for(var j=0;j<syn.length;j++){if(t===syn[j]||(syn[j].length>=2&&t.indexOf(syn[j])>=0))return LG_SYN[i][0];}
  }
  return '';
}
function _lgGeneric(t){return /^(기타|기타지출|기타비용|잡비|예비비|미분류|기타수입)$/.test(t);}
function lgCatMatch(label){
  if(!dailyTree)loadDailyCats();
  function N(x){return _xnorm(x).replace(/[\s·,.\-()]/g,'');}
  var raw=N(label);
  if(!raw||_lgGeneric(raw))return '';
  var cats=[];
  DL_GROUPS.forEach(function(g){Object.keys(dailyTree[g]||{}).forEach(function(c){cats.push(c);});});
  var norm={};cats.forEach(function(c){norm[c]=N(c);});
  var parts=String(label).split(/[\/+,&·|]/).map(N).filter(function(t){return t&&!_lgGeneric(t);});
  /* 완전 일치용: 라벨 전체 우선 / 유사어·소분류용: 앞 토큰 우선(전체는 마지막) */
  var toks=[raw].concat(parts.filter(function(t){return t!==raw;}));
  var stoks=parts.filter(function(t){return t!==raw;}).concat([raw]);
  var hit='';
  /* 1) 대분류 이름과 완전 일치 (전체 → 앞 토큰 순) */
  for(var t1=0;t1<toks.length&&!hit;t1++){
    cats.forEach(function(c){if(!hit&&norm[c]===toks[t1])hit=c;});
  }
  if(hit)return hit;
  /* 2) 유사어 사전 → 같은 개념의 내 대분류 (앞 토큰 우선) */
  for(var t2=0;t2<stoks.length&&!hit;t2++){
    var key=_lgSynKey(stoks[t2]);
    if(!key)continue;
    var kk=N(key);
    cats.forEach(function(c){if(!hit&&norm[c]===kk)hit=c;});
    if(!hit)cats.forEach(function(c){if(!hit&&norm[c].length>=2&&(norm[c].indexOf(kk)>=0||kk.indexOf(norm[c])>=0))hit=c;});
    if(!hit)cats.forEach(function(c){if(!hit&&_lgSynKey(norm[c])===key)hit=c;});
  }
  if(hit)return hit;
  /* 3) 기존 소분류 이름과 일치 → 그 대분류 (범용 소분류명 제외) */
  for(var t3=0;t3<stoks.length&&!hit;t3++){
    DL_GROUPS.forEach(function(g){
      Object.keys(dailyTree[g]||{}).forEach(function(c){
        (dailyTree[g][c]||[]).forEach(function(sb){
          var ns=N(sb);
          if(!hit&&!_lgGeneric(ns)&&ns===stoks[t3])hit=c;
        });
      });
    });
  }
  if(hit)return hit;
  /* 4) 부분 일치 (가장 긴 이름 우선) */
  var best='',bl=0;
  cats.forEach(function(c){
    var n=norm[c];if(n.length<2)return;
    if(raw.indexOf(n)>=0||n.indexOf(raw)>=0){if(n.length>bl){bl=n.length;best=c;}}
  });
  return best;
}
function lgDefaultAssign(it){
  if(it.kind==='income')return 'income';
  if(it.kind==='savings')return 'sav';
  var m=lgCatMatch(it.cat);
  if(m)return 'cat:'+m;
  return it.grp==='고정'?'new_fix':'new_var';
}
function lgDefaultAssignW(cat){
  var m=lgCatMatch(cat);
  if(m)return 'cat:'+m;
  return _xlsClassify(cat)==='고정'?'new_fix':'new_var';
}
function _lgIsTot(s){var t=_xnorm(s);if(!t)return false;if(/(소계|합계|총계|총액|누계|Total)/i.test(t))return true;if(/총$/.test(t))return true;return t==='계'||t==='합';}
function _lgAmt(v){if(v instanceof Date)return 0;if(typeof v==='string'&&_lgDateCell(v))return 0;return _xamt(v);}
function _lgDateCell(v){
  if(v instanceof Date){if(isNaN(v.getTime()))return null;return {y:v.getFullYear(),m:v.getMonth()+1,d:v.getDate()};}
  var t=String(v==null?'':v).trim();if(!t||t.length>18)return null;
  var f=t.match(/^(20\d{2})\s*[.\-\/년]\s*(\d{1,2})\s*[.\-\/월]\s*(\d{1,2})\s*일?\s*(\([^)]*\))?$/);
  if(f){var fm=parseInt(f[2],10),fd=parseInt(f[3],10);if(fm>=1&&fm<=12&&fd>=1&&fd<=31)return {y:parseInt(f[1],10),m:fm,d:fd};return null;}
  var m=t.match(/^(\d{1,2})\s*[\/.월\-]\s*(\d{1,2})\s*일?\s*(\([^)]*\))?$/);
  if(!m)return null;
  var mo=parseInt(m[1],10),dy=parseInt(m[2],10);
  if(mo<1||mo>12||dy<1||dy>31)return null;
  return {m:mo,d:dy};
}
function _lgYearFrom(s,strict){
  /* strict=true(셀 값): 금액(예 20000)의 오인 방지 — 년 표기나 연·월 패턴이 있어야 인정 */
  s=String(s==null?'':s);
  var m=s.match(/(?:^|[^0-9])(20\d{2})\s*년/);if(m)return parseInt(m[1],10);
  m=s.match(/(?:^|[^0-9])(20\d{2})\s*[.\-\/]\s*\d{1,2}(?:[^0-9]|$)/);if(m)return parseInt(m[1],10);
  if(!strict){m=s.match(/(?:^|[^0-9])(20\d{2})(?:[^0-9]|$)/);if(m)return parseInt(m[1],10);}
  return 0;
}
function lgFindYear(rows,sheetName,fileName){
  var y=_lgYearFrom(sheetName,false)||_lgYearFrom(fileName,false);if(y)return y;
  for(var i=0;i<Math.min(rows.length,4);i++){
    var row=rows[i]||[];
    for(var c=0;c<row.length;c++){
      if(row[c] instanceof Date)continue;
      var sv=String(row[c]==null?'':row[c]);if(!sv||sv.length>40)continue;
      var y2=_lgYearFrom(sv,true);if(y2)return y2;
    }
  }
  return 0;
}
function _lgIsNumCell(v){
  if(typeof v==='number')return isFinite(v);
  if(typeof v!=='string')return false;
  var t=v.replace(/[,\s원₩▲▼+]/g,'');
  return /^-?\d+(\.\d+)?%?$/.test(t)&&t!=='-'&&t!=='';
}
function lgColStats(rows){
  var st=[],n=Math.min(rows.length,500);
  for(var r=0;r<n;r++){var row=rows[r]||[];
    for(var c=0;c<row.length;c++){
      var v=row[c];if(v==null||v==='')continue;
      if(!st[c])st[c]={num:0,neg:0,pct:0,txt:0};
      if(v instanceof Date||_lgDateCell(v)){st[c].txt++;continue;}
      if(_lgIsNumCell(v)){
        st[c].num++;
        var x=(typeof v==='number')?v:_xamt(v);
        if(x<0)st[c].neg++;
        if(typeof v==='string'&&/%\s*$/.test(v.trim()))st[c].pct++;
      } else st[c].txt++;
    }
  }
  return st;
}
function lgHdrTexts(rows,hdrIdx){
  var out=[],scan=(hdrIdx>=0)?[hdrIdx]:[0,1,2,3,4];
  scan.forEach(function(r){
    var row=rows[r]||[];
    for(var c=0;c<row.length;c++){
      if(out[c]!==undefined&&out[c]!=='')continue;
      var v=row[c];if(v==null||v===''||v instanceof Date)continue;
      if(_lgIsNumCell(v)||_lgDateCell(v))continue;
      out[c]=_xnorm(v);
    }
  });
  return out;
}
function lgFindCols(rows,hdrIdx){
  /* 열 통계로 금액 열을 찾고, 헤더 텍스트는 힌트로만 사용 */
  var st=lgColStats(rows),hts=lgHdrTexts(rows,hdrIdx);
  function monOf(t){var m=String(t||'').match(/(\d{1,2})\s*월/);return m?parseInt(m[1],10):0;}
  // 피벗(항목|1월|2월|…) 감지
  var pivotRow=-1,pv=[];
  var scan=(hdrIdx>=0)?[hdrIdx]:[0,1,2,3,4];
  for(var si=0;si<scan.length;si++){
    var r=scan[si],row=rows[r]||[],hit=[];
    for(var c=0;c<row.length;c++){
      var t=(row[c] instanceof Date)?'':_xnorm(row[c]);
      var mm=t.match(/^(\d{1,2})월$/);
      if(mm){var mv=parseInt(mm[1],10);if(mv>=1&&mv<=12)hit.push({c:c,mo:mv});}
    }
    if(hit.length>=3){pivotRow=r;pv=hit;break;}
  }
  if(pivotRow>=0)return {pivot:pv,hdr:pivotRow,actual:-1,budget:-1,actualMon:0,firstAmtCol:pv[0].c};
  // 후보: 숫자 셀이 2개 이상이고 텍스트보다 많은 열 (비율 열 제외)
  var cands=[];
  for(var c2=1;c2<st.length;c2++){
    var s2=st[c2];if(!s2)continue;
    if(s2.num>=2&&s2.num>=s2.txt&&s2.pct<=s2.num*0.3)cands.push(c2);
  }
  if(!cands.length)return null;
  function hint(c){
    var t=hts[c]||'';
    if(!t)return '';
    if(/(잔액|누계|증감|차액|비율|달성|%)/.test(t))return 'bad';
    if(t.indexOf('예산')>=0)return 'bud';
    if(/(결산|정산|지출|사용|실적|수입|금액)/.test(t))return 'act';
    return '';
  }
  var good=cands.filter(function(c){return hint(c)!=='bad';});
  if(!good.length)return null;
  var actual=-1;
  ['act','','bud'].some(function(k){
    for(var i=0;i<good.length;i++){if(hint(good[i])===k){actual=good[i];return true;}}
    return false;
  });
  if(actual<0)actual=good[0];
  var actualMon=monOf(hts[actual]);
  var buds=good.filter(function(c){return c!==actual&&hint(c)==='bud';});
  var budget=-1;
  if(buds.length===1)budget=buds[0];
  else if(buds.length>1){budget=buds[0];if(actualMon){buds.forEach(function(bc){if(monOf(hts[bc])===actualMon)budget=bc;});}}
  var firstAmtCol=(budget>=0&&budget<actual)?budget:actual;
  if(firstAmtCol<1)return null;
  return {pivot:null,hdr:hdrIdx,actual:actual,budget:budget,actualMon:actualMon,firstAmtCol:firstAmtCol};
}
function lgClassifySheet(rows){
  for(var i=0;i<Math.min(rows.length,8);i++){
    var n=0;(rows[i]||[]).forEach(function(v){if(_lgDateCell(v))n++;});
    if(n>=2)return {type:'weekly',hdr:i};
  }
  var kw=-1;
  for(var j=0;j<Math.min(rows.length,15);j++){
    var cells=(rows[j]||[]).map(function(v){return (v instanceof Date)?'':_xnorm(v);});
    var amtOk=cells.some(function(t){return t&&t.length<=8&&t.indexOf('년')<0&&/(예산|결산|정산)/.test(t);});
    if(amtOk){kw=j;break;}
  }
  var cols=lgFindCols(rows,kw);
  if(cols)return {type:'monthly',hdr:kw};
  return null;
}
function lgParseMonthly(rows,hdrIdx,sheetName,fileName){
  var cols=lgFindCols(rows,hdrIdx);
  if(!cols)return null;
  var amtCols=cols.pivot?cols.pivot:[{c:cols.actual,mo:0}];
  var firstAmtCol=cols.firstAmtCol,budget=cols.pivot?-1:cols.budget;
  var bodyStart=(cols.hdr>=0)?cols.hdr+1:0;
  // 연·월 탐색 (제목·시트명·파일명)
  var mo=cols.actualMon,yr=0;
  var texts=[{s:String(sheetName||''),strict:false},{s:String(fileName||''),strict:false}];
  var scanTo=(cols.hdr>=0)?cols.hdr:Math.min(rows.length-1,3);
  for(var i=0;i<=scanTo;i++){(rows[i]||[]).forEach(function(v){if(!(v instanceof Date)){var sv=String(v==null?'':v);if(sv&&sv.length<40)texts.push({s:sv,strict:true});}});}
  texts.forEach(function(t){
    var s=t.s;
    var ym=s.match(/(?:^|[^0-9])(20\d{2})\s*년?\s*[\s.\-\/]*(\d{1,2})\s*월/);
    if(ym){if(!yr)yr=parseInt(ym[1],10);if(!mo)mo=parseInt(ym[2],10);return;}
    if(!yr)yr=_lgYearFrom(s,t.strict);
    if(!mo){var m2=s.match(/(^|[^0-9])(\d{1,2})\s*월/);if(m2){var mm=parseInt(m2[2],10);if(mm>=1&&mm<=12)mo=mm;}}
  });
  var byMo={},any=false;
  function put(m,it){if(!byMo[m])byMo[m]=[];byMo[m].push(it);any=true;}
  var carry=[],r,c2;
  for(r=bodyStart;r<rows.length;r++){
    var row=rows[r]||[];
    var expl=[],deepest=-1,isTot=false;
    for(c2=0;c2<firstAmtCol;c2++){
      var lv=row[c2];var t3=(lv instanceof Date)?'':_xnorm(lv);
      if(t3&&_lgIsNumCell(lv))t3='';
      if(t3){expl[c2]=t3;deepest=c2;if(_lgIsTot(t3))isTot=true;}
    }
    if(isTot)continue;
    for(c2=0;c2<firstAmtCol;c2++){
      if(expl[c2]){carry[c2]=expl[c2];for(var c3=c2+1;c3<firstAmtCol;c3++)carry[c3]='';}
    }
    if(deepest<0)continue;
    var item=expl[deepest];
    if(/^(항목|구분|대분류|소분류|분류|내역|내용|카테고리)$/.test(item))continue;
    var lbls=[];for(c2=0;c2<deepest;c2++){if(carry[c2])lbls.push(carry[c2]);}
    var mid=(lbls.length>=2)?lbls[lbls.length-1]:'';
    var kind,grp='',cat,sub;
    if(!lbls.length){if(/^(수입|총수입|부수입|수익금?|소득)$/.test(item)){kind='income';grp='';cat=item;sub='';}else{kind='expense';grp=_xlsClassify(item);cat=item;sub='';}}
    else{
      var blk=lbls[0];
      if(/(수입|수익|소득)/.test(blk))kind='income';
      else if(/(저축|투자|상환|적금|연금)/.test(blk))kind='savings';
      else{kind='expense';grp=(blk+'|'+mid).indexOf('고정')>=0?'고정':'변동';}
      if(kind==='expense'){if(mid){cat=mid;sub=item;}else{cat=item;sub='';}}
      else if(kind==='savings'){grp='고정';cat='저축·상환';sub=item;}
      else{cat=item;sub='';}
    }
    var bud=(budget>=0)?Math.round(_lgAmt(row[budget])):0;
    for(var ai=0;ai<amtCols.length;ai++){
      var amt=Math.round(_lgAmt(row[amtCols[ai].c]));
      var b2=(ai===0)?bud:0;
      if(amt<=0&&b2<=0)continue;
      put(amtCols[ai].mo,{kind:kind,grp:grp,cat:cat,sub:sub,amount:amt,budget:b2});
    }
  }
  if(!any)return null;
  var months=[];
  Object.keys(byMo).forEach(function(k){
    var mk=parseInt(k,10);
    months.push({mo:(mk||mo||0),items:byMo[k]});
  });
  months.sort(function(a,b){return a.mo-b.mo;});
  return {yr:yr,months:months,needMon:months.some(function(m){return !m.mo;})};
}
function lgParseWeekly(rows,hdrIdx){
  var hdr=rows[hdrIdx]||[];
  var colDate=[],cur=null,c;
  for(c=0;c<hdr.length;c++){
    var dc=_lgDateCell(hdr[c]);
    if(dc){cur=dc;colDate[c]=cur;continue;}
    var t=(hdr[c] instanceof Date)?'x':_xnorm(hdr[c]);
    if(t){cur=null;colDate[c]=null;continue;}
    colDate[c]=cur;
  }
  var firstDateCol=-1,lastDateCol=-1;
  for(c=0;c<colDate.length;c++){if(colDate[c]){if(firstDateCol<0)firstDateCol=c;lastDateCol=c;}}
  if(firstDateCol<1)return null;
  var roleRow=-1,r;
  for(r=hdrIdx+1;r<=Math.min(hdrIdx+4,rows.length-1);r++){
    var cnt=0,rr=rows[r]||[];
    for(c=firstDateCol;c<rr.length;c++){var t2=(rr[c] instanceof Date)?'':_xnorm(rr[c]);if(t2==='내역'||t2==='내용'||t2==='금액'||t2==='메모')cnt++;}
    if(cnt>=3){roleRow=r;break;}
  }
  var roleOf=[];
  if(roleRow>=0){var rr2=rows[roleRow]||[];for(c=0;c<rr2.length;c++){var t3=(rr2[c] instanceof Date)?'':_xnorm(rr2[c]);roleOf[c]=(t3.indexOf('금액')>=0)?'amt':((t3==='내역'||t3==='내용'||t3==='메모')?'note':'');}}
  var bodyStart=(roleRow>=0?roleRow+1:hdrIdx+1);
  var lblCol=-1,best=0;
  for(c=0;c<firstDateCol;c++){var n2=0;for(r=bodyStart;r<rows.length;r++){var lv=(rows[r]||[])[c];if(!(lv instanceof Date)&&_xnorm(lv))n2++;}if(n2>best){best=n2;lblCol=c;}}
  if(lblCol<0)return null;
  var groups=[];
  for(c=firstDateCol;c<=lastDateCol;c++){var d5=colDate[c];if(!d5)continue;
    if(!groups.length||groups[groups.length-1].date!==d5)groups.push({date:d5,cols:[c]});
    else groups[groups.length-1].cols.push(c);
  }
  groups.forEach(function(gp){
    gp.amt=gp.cols[gp.cols.length-1];gp.note=(gp.cols.length>1?gp.cols[0]:-1);
    gp.cols.forEach(function(cc){if(roleOf[cc]==='amt')gp.amt=cc;else if(roleOf[cc]==='note')gp.note=cc;});
  });
  var pm=-1,bump=0;
  groups.forEach(function(gp){if(pm>=0&&gp.date.m<pm)bump++;pm=gp.date.m;gp.bump=gp.date.y?0:bump;});
  var recs=[];
  var LBL_SKIP=/^(일정|저녁|아침|점심|메뉴|날짜|요일|예산|무지출)$/;
  for(r=bodyStart;r<rows.length;r++){
    var row=rows[r]||[];var lblV=row[lblCol];
    var lbl=(lblV instanceof Date)?'':_xnorm(lblV);
    if(!lbl)continue;
    if(_lgIsTot(lbl)||LBL_SKIP.test(lbl))continue;
    groups.forEach(function(gp){
      var amt=Math.round(_lgAmt(row[gp.amt]));if(amt<=0)return;
      var note=(gp.note>=0&&!(row[gp.note] instanceof Date))?String(row[gp.note]==null?'':row[gp.note]).trim():'';
      if(_lgDateCell(note))note='';
      if(note.length>80)note=note.slice(0,79)+'…';
      recs.push({y:gp.date.y||0,m:gp.date.m,d:gp.date.d,bump:gp.bump||0,cat:lbl,note:note,amount:amt});
    });
  }
  return recs.length?{recs:recs}:null;
}
function openLedgerImport(){var inp=g('lgFileInput');if(inp){inp.value='';inp.click();}}
function onLedgerFiles(ev){
  var files=ev.target.files;if(!files||!files.length)return;
  if(typeof XLSX==='undefined'){alert('엑셀 기능을 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.');return;}
  var pending=files.length,sheets=[],errFiles=[];
  Array.prototype.forEach.call(files,function(f){
    var nm=(f.name||'').toLowerCase();var isCsv=/\.csv$/.test(nm);
    var rd=new FileReader();
    function done(){if(--pending===0)lgOpenPick(sheets,errFiles);}
    rd.onload=function(e){
      try{
        var wb=isCsv?XLSX.read(e.target.result,{type:'string'}):XLSX.read(new Uint8Array(e.target.result),{type:'array',cellDates:true});
        (wb.SheetNames||[]).forEach(function(sn){
          var rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:''});
          sheets.push({file:f.name||'',name:sn,rows:rows});
        });
      }catch(err){errFiles.push(f.name||'파일');}
      done();
    };
    rd.onerror=function(){errFiles.push(f.name||'파일');done();};
    if(isCsv)rd.readAsText(f);else rd.readAsArrayBuffer(f);
  });
}
function lgOpenPick(sheets,errFiles){
  if(!sheets||!sheets.length){alert('시트를 찾지 못했어요.'+(errFiles&&errFiles.length?('\n읽지 못한 파일: '+errFiles.join(', ')):''));return;}
  sheets.forEach(function(sh){sh.cls=lgClassifySheet(sh.rows);});
  lgStage={step:'pick',raw:sheets,pickSel:{},errFiles:errFiles||[],parsed:[],skipped:[],needYear:false};
  sheets.forEach(function(sh,i){lgStage.pickSel[i]=!!sh.cls;});
  var mo=g('lgImportModal');if(mo)mo.classList.add('open');
  if(sheets.length===1){lgStage.pickSel[0]=true;lgProceedPick();}
  else renderLedgerPick();
}
function lgTogglePick(i){if(!lgStage)return;lgStage.pickSel[i]=!lgStage.pickSel[i];renderLedgerPick();}
function lgToggleAllPick(){
  if(!lgStage||!lgStage.raw||!lgStage.raw.length)return;
  var allOn=lgStage.raw.every(function(sh,i){return !!lgStage.pickSel[i];});
  lgStage.raw.forEach(function(sh,i){lgStage.pickSel[i]=!allOn;});
  renderLedgerPick();
}
function renderLedgerPick(){
  var box=g('lgImportBox');if(!box||!lgStage)return;
  var html='<div style="font-weight:600;margin-bottom:6px;font-size:14px">어떤 <b>시트</b>를 가져올까요?</div>';
  html+='<div style="font-size:13px;color:var(--gray);margin-bottom:10px;line-height:1.5;word-break:keep-all">주간 인증표·월간 정산표가 든 시트를 골라주세요. 표지·메모 시트는 빼면 돼요.</div>';
  if(lgStage.errFiles.length)html+='<div style="font-size:13px;color:#d9534f;margin-bottom:10px">읽지 못한 파일: '+dlEsc(lgStage.errFiles.join(', '))+'</div>';
  var lgTot=lgStage.raw.length;
  var lgOn=lgStage.raw.filter(function(sh,i){return !!lgStage.pickSel[i];}).length;
  var lgAll=lgTot>0&&lgOn===lgTot;
  html+='<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px"><span style="font-size:13px;color:var(--gray);white-space:nowrap">'+lgOn+' / '+lgTot+'개 선택</span><button type="button" onclick="lgToggleAllPick()" '+(lgTot?'':'disabled ')+'style="padding:5px 10px;font-size:13px;border:1px solid var(--tbl-border);border-radius:7px;background:#fff;cursor:'+(lgTot?'pointer':'default')+';white-space:nowrap;opacity:'+(lgTot?'1':'.45')+'">'+(lgAll?'전체 해제':'전체 선택')+'</button></div>';
  html+='<div style="display:flex;flex-direction:column;gap:5px;border:1px solid var(--tbl-border);border-radius:8px;padding:8px 10px;margin-bottom:12px">';
  var selN=0;
  lgStage.raw.forEach(function(sh,i){
    var on=!!lgStage.pickSel[i];if(on)selN++;
    var src=(sh.file?dlEsc(sh.file)+' › ':'')+dlEsc(sh.name);
    var hint=sh.cls?(sh.cls.type==='weekly'?'주간 인증표로 보여요':'월간 정산표로 보여요'):'형식 미인식 — 선택하면 확인해 볼게요';
    var hc=sh.cls?'var(--ac)':'var(--gray)';
    html+='<label style="display:flex;align-items:flex-start;gap:7px;cursor:pointer;font-size:13px;word-break:keep-all"><input type="checkbox" '+(on?'checked ':'')+'onchange="lgTogglePick('+i+')" style="accent-color:var(--ac);margin-top:2px"><span>'+src+' <span style="color:'+hc+';white-space:nowrap">— '+hint+'</span></span></label>';
  });
  html+='</div>';
  html+='<div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ol" onclick="closeM(\'lgImportModal\')">취소</button><button type="button" class="btn btn-bk" onclick="lgProceedPick()"'+(selN?'':' disabled')+'>다음 ('+selN+'개)</button></div>';
  box.innerHTML=html;
}
function lgBackToPick(){if(!lgStage)return;lgStage.step='pick';renderLedgerPick();}
function lgProceedPick(){
  if(!lgStage)return;
  var parsed=[],failed=[],needYear=false;
  lgStage.raw.forEach(function(sh,i){
    if(!lgStage.pickSel[i])return;
    var cls=sh.cls,okp=false;
    if(cls&&cls.type==='weekly'){
      var w=lgParseWeekly(sh.rows,cls.hdr);
      if(w){
        var yr=lgFindYear(sh.rows,sh.name,sh.file);
        w.recs.forEach(function(rc){if(!rc.y&&yr)rc.y=yr;});
        if(w.recs.some(function(rc){return !rc.y;}))needYear=true;
        parsed.push({type:'weekly',name:sh.name,file:sh.file,recs:w.recs});okp=true;
      }
    } else if(cls&&cls.type==='monthly'){
      var m=lgParseMonthly(sh.rows,cls.hdr,sh.name,sh.file);
      if(m){
        if(!m.yr)needYear=true;
        m.months.forEach(function(mm){
          parsed.push({type:'monthly',name:sh.name,file:sh.file,mo:mm.mo||((new Date()).getMonth()+1),moPick:!mm.mo,yr:m.yr,items:mm.items});
        });
        okp=true;
      }
    }
    if(!okp)failed.push((sh.file?sh.file+' › ':'')+sh.name);
  });
  lgStage.parsed=parsed;lgStage.skipped=failed;lgStage.needYear=needYear;lgStage.step='preview';
  var cmap={},ckeys=[];
  function regKey(k,def){if(!k)return;if(!(k in cmap)){cmap[k]=def;ckeys.push(k);}}
  parsed.forEach(function(p){
    if(p.type==='weekly')p.recs.forEach(function(rc){regKey(rc.cat,lgDefaultAssignW(rc.cat));});
    else p.items.forEach(function(it){regKey(lgKeyOf(it),lgDefaultAssign(it));});
  });
  lgStage.catMap=cmap;lgStage.catKeys=ckeys;lgCatMapOpen=false;
  lgYearSel=(new Date()).getFullYear();
  lgMonSel={};lgOptSavings=false;lgOptIncome=true;lgOptBudget=true;
  renderLedgerPreview();
}
function lgAssemble(){
  var months={},bad=0,cmap=(lgStage&&lgStage.catMap)||{};
  function M(ym){if(!months[ym])months[ym]={wRecs:[],wSav:[],mExp:[],mSav:[],inc:[],_incMap:{},srcW:0,srcM:0};return months[ym];}
  function addInc(mm,cat,amount){mm._incMap[cat]=(mm._incMap[cat]||0)+amount;}
  lgStage.parsed.forEach(function(p){
    if(p.type==='weekly'){
      p.recs.forEach(function(rc){
        var y=(rc.y||lgYearSel)+(rc.y?0:(rc.bump||0));
        var dt=new Date(y,rc.m-1,rc.d);
        if(dt.getFullYear()!==y||dt.getMonth()!==rc.m-1||dt.getDate()!==rc.d){bad++;return;}
        var ds=y+'-'+String(rc.m).padStart(2,'0')+'-'+String(rc.d).padStart(2,'0');
        var mm=M(ds.slice(0,7));mm.srcW=1;
        var a=cmap[rc.cat]||lgDefaultAssignW(rc.cat);
        if(a==='skip')return;
        if(a==='income'){addInc(mm,rc.cat,rc.amount);return;}
        if(a==='sav'){mm.wSav.push({ds:ds,grp:'고정',cat:'저축·상환',sub:rc.cat,note:rc.note,amount:rc.amount});return;}
        if(a.indexOf('cat:')===0){
          var T=a.slice(4);
          mm.wRecs.push({ds:ds,grp:catGroupOf(T)||'변동',cat:T,sub:(_xnorm(T)===_xnorm(rc.cat)?'':rc.cat),note:rc.note,amount:rc.amount});
          return;
        }
        mm.wRecs.push({ds:ds,grp:(a==='new_fix'?'고정':'변동'),cat:rc.cat,sub:'',note:rc.note,amount:rc.amount});
      });
    } else {
      var y2=p.yr||lgYearSel;
      var mm2=M(y2+'-'+String(p.mo).padStart(2,'0'));mm2.srcM=1;
      p.items.forEach(function(it){
        var key=lgKeyOf(it);
        var a=cmap[key]||lgDefaultAssign(it);
        if(a==='skip')return;
        if(a==='income'){if((it.amount||0)>0)addInc(mm2,key,it.amount);return;}
        if(a==='sav'){mm2.mSav.push({grp:'고정',cat:'저축·상환',sub:key,amount:it.amount||0,budget:it.budget||0});return;}
        var cat,sub,grp;
        if(a.indexOf('cat:')===0){
          cat=a.slice(4);grp=catGroupOf(cat)||'변동';
          sub=(it.kind==='savings')?'':(it.sub||(_xnorm(cat)===_xnorm(it.cat)?'':it.cat));
        } else {
          cat=(it.kind==='savings')?key:it.cat;
          sub=(it.kind==='savings')?'':it.sub;
          grp=(a==='new_fix')?'고정':'변동';
        }
        mm2.mExp.push({grp:grp,cat:cat,sub:sub,amount:it.amount||0,budget:it.budget||0});
      });
    }
  });
  Object.keys(months).forEach(function(ym){
    var mm=months[ym];
    mm.inc=Object.keys(mm._incMap).map(function(k){return {cat:k,amount:Math.round(mm._incMap[k])};});
    delete mm._incMap;
  });
  return {months:months,bad:bad};
}
function lgExistCensus(ym){
  var man=0,iw=0,im=0;
  dailyData.forEach(function(e){
    if(String(e.date).slice(0,7)!==ym)return;
    if((parseFloat(e.amount)||0)<=0)return;
    if(e.imp==='w')iw++;else if(e.imp==='m')im++;else man++;
  });
  return {man:man,iw:iw,im:im};
}
function lgPlan(){
  var asm=lgAssemble();
  var yms=Object.keys(asm.months).sort();
  var today=todayStr();
  var plan={rows:[],bad:asm.bad,future:0,wN:0,mN:0,incN:0,budN:0,savN:0};
  yms.forEach(function(ym){
    var mm=asm.months[ym];var cen=lgExistCensus(ym);
    var row={ym:ym,mm:mm,cen:cen,sel:(lgMonSel[ym]!==false)};
    row.wCnt=mm.wRecs.length+(lgOptSavings?mm.wSav.length:0);
    /* 주간 표에서 실제로 넣을 기록이 있을 때만 「일별로 교체」 — 전부 건너뛴 달은 월간 요약을 지우지 않는다 */
    row.useW=!!(mm.srcW&&row.wCnt>0);
    row.recBlocked=(mm.srcM&&!row.useW&&(cen.iw>0||cen.man>0));
    var mExp=0,mSav=0,mBud=0;
    mm.mExp.forEach(function(it){if(it.amount>0)mExp++;if((it.budget||0)>0)mBud++;});
    mm.mSav.forEach(function(it){if(it.amount>0)mSav++;if(lgOptSavings&&(it.budget||0)>0)mBud++;});
    row.mExp=mExp;row.mSav=mSav;row.mInc=mm.inc.length;row.mBud=mBud;
    mm.wRecs.forEach(function(rc){if(rc.ds>today)plan.future++;});
    mm.wSav.forEach(function(rc){if(rc.ds>today)plan.future++;});
    if(row.sel){
      if(row.useW)plan.wN+=row.wCnt;
      if(mm.srcM&&!row.useW&&!row.recBlocked){plan.mN+=mExp;if(lgOptSavings)plan.mN+=mSav;}
      if(lgOptIncome)plan.incN+=mm.inc.length;
      if(lgOptBudget)plan.budN+=mBud;
      plan.savN+=mSav+mm.wSav.length;
    }
    plan.rows.push(row);
  });
  return plan;
}
function lgToggleCatMap(){lgCatMapOpen=!lgCatMapOpen;renderLedgerPreview();}
function lgSetCatMap(ki,v){if(!lgStage||!lgStage.catKeys)return;var k=lgStage.catKeys[ki];if(k===undefined)return;lgStage.catMap[k]=v;renderLedgerPreview();}
function lgSetSheetMon(i,v){if(!lgStage||!lgStage.parsed[i])return;lgStage.parsed[i].mo=parseInt(v,10)||1;renderLedgerPreview();}
function lgSetYear(v){lgYearSel=parseInt(v,10)||(new Date()).getFullYear();renderLedgerPreview();}
function lgToggleMon(ym){lgMonSel[ym]=(lgMonSel[ym]===false);renderLedgerPreview();}
function lgToggleOpt(k){if(k==='sav')lgOptSavings=!lgOptSavings;else if(k==='inc')lgOptIncome=!lgOptIncome;else if(k==='bud')lgOptBudget=!lgOptBudget;renderLedgerPreview();}
function lgMonLbl(ym){return parseInt(ym.slice(0,4),10)+'년 '+parseInt(ym.slice(5,7),10)+'월';}
function renderLedgerPreview(){
  var box=g('lgImportBox');if(!box||!lgStage)return;
  if(!lgStage.parsed.length){
    var eh='<div style="font-size:13px;color:#333;line-height:1.6;word-break:keep-all">선택한 시트에서 가계부 형식을 인식하지 못했어요.<br><br>이런 표를 읽을 수 있어요:<br>· <b>주간 인증표</b> — 첫 줄에 날짜(7/5 등), 왼쪽에 분류, 날짜마다 내역·금액<br>· <b>월간 정산표</b> — 구분·항목 열과 예산·정산(결산) 열</div>';
    if(lgStage.skipped.length)eh+='<div style="font-size:13px;color:var(--gray);margin-top:8px">확인한 시트: '+dlEsc(lgStage.skipped.join(', '))+'</div>';
    eh+='<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">'+(lgStage.raw.length>1?'<button type="button" class="btn btn-ol" onclick="lgBackToPick()">← 시트 다시 고르기</button>':'')+'<button type="button" class="btn btn-ol" onclick="closeM(\'lgImportModal\')">닫기</button></div>';
    box.innerHTML=eh;return;
  }
  var plan=lgPlan();
  var wSheets=lgStage.parsed.filter(function(p){return p.type==='weekly';}).length;
  var mSheets=lgStage.parsed.filter(function(p){return p.type==='monthly';}).length;
  var html='<div style="font-size:13px;color:#333;line-height:1.55;margin-bottom:10px">인식 결과 — '+(wSheets?('주간 인증표 <b>'+wSheets+'개</b>'):'')+(wSheets&&mSheets?' · ':'')+(mSheets?('월간 정산표 <b>'+mSheets+'개</b>'):'')+(lgStage.raw.length>1?' <button type="button" onclick="lgBackToPick()" style="border:1px solid var(--tbl-border);background:#fff;border-radius:99px;padding:2px 10px;font-size:13px;color:var(--gray);cursor:pointer;font-family:inherit;white-space:nowrap;margin-left:4px">← 시트 다시 고르기</button>':'')+'</div>';
  if(lgStage.skipped.length)html+='<div style="font-size:13px;color:#b5762e;margin:-4px 0 10px;line-height:1.5;word-break:keep-all">인식하지 못한 시트 '+lgStage.skipped.length+'개: '+dlEsc(lgStage.skipped.slice(0,4).join(', '))+(lgStage.skipped.length>4?' 외':'')+'</div>';
  if(lgStage.errFiles.length)html+='<div style="font-size:13px;color:#d9534f;margin:-4px 0 10px">읽지 못한 파일: '+dlEsc(lgStage.errFiles.join(', '))+'</div>';
  if(lgStage.needYear){
    var yNow=(new Date()).getFullYear(),opts='';
    for(var yy=yNow;yy>=yNow-4;yy--)opts+='<option value="'+yy+'"'+(yy===lgYearSel?' selected':'')+'>'+yy+'년</option>';
    html+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--ac-light);border:1px solid var(--tbl-border);border-radius:8px;padding:8px 11px;margin-bottom:12px"><span style="font-size:13px;color:#333;word-break:keep-all">연도 표시가 없는 표가 있어요 — 어느 해 기록인가요?</span><select onchange="lgSetYear(this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit">'+opts+'</select></div>';
  }
  lgStage.parsed.forEach(function(p,pi){
    if(p.type!=='monthly'||!p.moPick)return;
    var mopts='';for(var mm2=1;mm2<=12;mm2++)mopts+='<option value="'+mm2+'"'+(mm2===p.mo?' selected':'')+'>'+mm2+'월</option>';
    html+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--ac-light);border:1px solid var(--tbl-border);border-radius:8px;padding:8px 11px;margin-bottom:12px"><span style="font-size:13px;color:#333;word-break:keep-all">「'+dlEsc(p.name)+'」 표에 월 표시가 없어요 — 몇 월 기록인가요?</span><select onchange="lgSetSheetMon('+pi+',this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit">'+mopts+'</select></div>';
  });
  if(plan.future>0)html+='<div style="font-size:13px;color:#d9534f;margin-bottom:10px;word-break:keep-all">⚠ 오늘보다 미래 날짜 기록이 '+plan.future+'건 있어요 — 연도를 확인해 주세요.</div>';
  if(!plan.rows.length)html+='<div style="font-size:13px;color:var(--gray);margin:4px 0 10px">선택된 시트가 없어요 — 위에서 가져올 시트를 골라주세요.</div>';
  html+='<div style="border:1px solid var(--tbl-border);border-radius:8px;margin-bottom:10px'+(plan.rows.length?'':';display:none')+'"><table style="width:100%;border-collapse:collapse;font-size:13px">';
  plan.rows.forEach(function(row){
    var src=[];
    if(row.mm.srcW)src.push('일별 '+row.wCnt+'건');
    if(row.mm.srcM)src.push('월간 '+(row.mExp+(lgOptSavings?row.mSav:0))+'항목');
    if(row.mInc)src.push('수입 '+row.mInc+'건');
    var st=[];
    if(row.useW){
      st.push('일별 기록으로 저장');
      if(row.cen.im+row.cen.iw>0)st.push('<span style="color:var(--ac)">이전에 가져온 기록 교체</span>');
      if(row.mm.srcM)st.push('<span style="color:var(--gray)">월간표 지출은 일별과 겹쳐 제외</span>');
    } else if(row.mm.srcM){
      if(row.recBlocked)st.push('<span style="color:#b5762e">지출 기록 건너뜀 — 이미 기록 '+(row.cen.iw+row.cen.man)+'건 있음</span>');
      else{st.push('매월 1일에 요약 저장');if(row.cen.im)st.push('<span style="color:var(--ac)">이전 가져오기 '+row.cen.im+'건 교체</span>');}
    }
    if(row.cen.man&&row.useW)st.push('<span style="color:#b5762e">⚠ 직접 입력 '+row.cen.man+'건과 겹칠 수 있어요</span>');
    html+='<tr style="border-bottom:1px solid var(--tbl-border)"><td style="padding:7px 8px;vertical-align:top;width:30px"><input type="checkbox" '+(row.sel?'checked ':'')+'onchange="lgToggleMon(\''+row.ym+'\')" style="accent-color:var(--ac)"></td><td style="padding:7px 4px;vertical-align:top;white-space:nowrap;font-weight:700">'+lgMonLbl(row.ym)+'</td><td style="padding:7px 8px;vertical-align:top;word-break:keep-all"><div>'+src.join(' + ')+'</div><div style="color:var(--gray);margin-top:2px;line-height:1.45">'+st.join('<br>')+'</div></td></tr>';
  });
  html+='</table></div>';
  if(lgStage.catKeys&&lgStage.catKeys.length){
    var cm=lgStage.catMap,cnt={inc:0,exp:0,sav:0,skip:0};
    lgStage.catKeys.forEach(function(k){
      var a=cm[k]||'new_var';
      if(a==='income')cnt.inc++;else if(a==='sav')cnt.sav++;else if(a==='skip')cnt.skip++;else cnt.exp++;
    });
    html+='<div style="border:1px solid var(--tbl-border);border-radius:8px;padding:8px 11px;margin-bottom:10px">';
    html+='<div onclick="lgToggleCatMap()" style="cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:13px;font-weight:600;white-space:nowrap;color:var(--ac)">'+(lgCatMapOpen?'▾':'▸')+' 분류 확인·수정</span><span style="font-size:13px;color:var(--gray);word-break:keep-all">수입 '+cnt.inc+' · 지출 '+cnt.exp+' · 저축 '+cnt.sav+(cnt.skip?' · 제외 '+cnt.skip:'')+'</span></div>';
    if(lgCatMapOpen){
      var treeCats={};DL_GROUPS.forEach(function(g){treeCats[g]=Object.keys((dailyTree&&dailyTree[g])||{});});
      html+='<div style="font-size:13px;color:var(--gray);margin:7px 0 8px;word-break:keep-all">잘못 나뉜 항목이 있으면 어디로 갈지 직접 골라주세요. 아래 화살표(→)가 실제로 저장될 위치예요. 「새 분류」는 표의 이름 그대로 대분류를 만들어요(같은 이름의 대분류가 이미 있으면 그 분류에 합쳐져요).</div><div style="display:flex;flex-direction:column;gap:6px">';
      lgStage.catKeys.forEach(function(k,ki){
        var cur=cm[k]||'new_var';
        var opts='<option value="income"'+(cur==='income'?' selected':'')+'>수입</option>'
          +'<option value="new_fix"'+(cur==='new_fix'?' selected':'')+'>새 분류 (고정지출)</option>'
          +'<option value="new_var"'+(cur==='new_var'?' selected':'')+'>새 분류 (변동지출)</option>';
        DL_GROUPS.forEach(function(g){
          if(!treeCats[g].length)return;
          opts+='<optgroup label="내 분류 · '+g+'">'+treeCats[g].map(function(c){var v='cat:'+c;return '<option value="'+dlEsc(v)+'"'+(cur===v?' selected':'')+'>'+dlEsc(c)+'</option>';}).join('')+'</optgroup>';
        });
        opts+='<option value="sav"'+(cur==='sav'?' selected':'')+'>저축·상환 (지출 제외)</option>'
          +'<option value="skip"'+(cur==='skip'?' selected':'')+'>가져오지 않기</option>';
        var dest;
        if(cur==='income')dest='수입으로';
        else if(cur==='sav')dest='저축·상환 › '+dlEsc(k);
        else if(cur==='skip')dest='가져오지 않음';
        else if(cur.indexOf('cat:')===0){var _tc=cur.slice(4);dest=(_xnorm(_tc)===_xnorm(k))?('기존 «'+dlEsc(_tc)+'»에 합침'):('«'+dlEsc(_tc)+'» › '+dlEsc(k));}
        else {var _ex=catGroupOf(k);dest=_ex?('같은 이름의 기존 «'+dlEsc(k)+'»에 합침'):('새 대분류 «'+dlEsc(k)+'» 생성');}
        html+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="font-size:13px;word-break:keep-all;flex:1;min-width:0">'+dlEsc(k)+'<br><span style="color:var(--gray);font-size:13px">→ '+dest+'</span></span><select onchange="lgSetCatMap('+ki+',this.value)" style="max-width:52%;padding:3px 6px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit">'+opts+'</select></div>';
      });
      html+='</div>';
    }
    html+='</div>';
  }
  html+='<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">';
  if(plan.savN>0)html+='<label style="display:flex;align-items:flex-start;gap:7px;cursor:pointer;font-size:13px;word-break:keep-all"><input type="checkbox" '+(lgOptSavings?'checked ':'')+'onchange="lgToggleOpt(\'sav\')" style="accent-color:var(--ac);margin-top:2px"><span>저축·상환 항목도 지출로 가져오기 <span style="color:var(--gray)">(저축·적금·대출상환 등 — 보통은 지출이 아니라 꺼둬요)</span></span></label>';
  var hasM=lgStage.parsed.some(function(p){return p.type==='monthly';});
  if(hasM){
    html+='<label style="display:flex;align-items:flex-start;gap:7px;cursor:pointer;font-size:13px;word-break:keep-all"><input type="checkbox" '+(lgOptIncome?'checked ':'')+'onchange="lgToggleOpt(\'inc\')" style="accent-color:var(--ac);margin-top:2px"><span>수입 항목을 월간 수입에 기록</span></label>';
    html+='<label style="display:flex;align-items:flex-start;gap:7px;cursor:pointer;font-size:13px;word-break:keep-all"><input type="checkbox" '+(lgOptBudget?'checked ':'')+'onchange="lgToggleOpt(\'bud\')" style="accent-color:var(--ac);margin-top:2px"><span>예산 열을 그 달 월간 예산에 기록</span></label>';
  }
  html+='</div>';
  html+='<div style="font-size:13px;color:var(--gray);line-height:1.5;margin-bottom:12px;word-break:keep-all">💡 이미 직접 입력한 기록이 있다면 그 내용은 절대 건드리지 않아요.</div>';
  var total=plan.wN+plan.mN;
  html+='<div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ol" onclick="closeM(\'lgImportModal\')">취소</button><button type="button" class="btn btn-bk" onclick="applyLedgerImport()"'+((total+plan.incN+plan.budN)?'':' disabled')+'>기록 '+total+'건 가져오기</button></div>';
  box.innerHTML=html;
}
function applyLedgerImport(){
  if(!lgStage)return;
  if(!dailyTree)loadDailyCats();
  var plan=lgPlan();
  var addW=0,addM=0,dup=0,repl=0,incN=0,budN=0,skipped=[];
  function ensureCat(grp,cat,sub){
    var eg=catGroupOf(cat);
    if(eg)grp=eg;
    else{grp=(grp==='고정'||grp==='변동')?grp:'변동';if(!dailyTree[grp])dailyTree[grp]={};dailyTree[grp][cat]=[];}
    if(sub&&dailyTree[grp][cat].indexOf(sub)<0)dailyTree[grp][cat].push(sub);
    return grp;
  }
  var incMonths=[],incCatAdded=false;
  plan.rows.forEach(function(row){
    if(!row.sel)return;
    var ym=row.ym,mm=row.mm;
    if(row.useW){
      var wAll=mm.wRecs.concat(lgOptSavings?mm.wSav:[]);
      /* 파괴 최소범위: 이 달의 imp:'m' 요약 + 이번에 덮는 "날짜"의 imp:'w' 기록만 제거.
         (같은 표를 다시 올리면 분류를 바꿔도 옛 기록이 남지 않도록 — 직접 입력 기록은 불변) */
      var dset={};wAll.forEach(function(rc){dset[rc.ds]=1;});
      var before=dailyData.length;
      dailyData=dailyData.filter(function(e){
        if(e.imp==='m'&&String(e.date).slice(0,7)===ym)return false;
        if(e.imp==='w'&&dset[e.date])return false;
        return true;
      });
      repl+=(before-dailyData.length);
      wAll.forEach(function(rc){
        var grp=ensureCat(rc.grp,rc.cat,rc.sub||'');
        var rec=mkRec(rc.ds,rc.amount,grp,rc.cat,rc.sub||'','',rc.note||'',0,true);
        rec.imp='w';dailyData.push(rec);addW++;
      });
    }
    if(mm.srcM){
      if(!row.useW&&!row.recBlocked){
        if(row.cen.im){dailyData=dailyData.filter(function(e){return !(e.imp==='m'&&String(e.date).slice(0,7)===ym);});repl+=row.cen.im;}
        var ds1=ym+'-01';
        var mAll=mm.mExp.concat(lgOptSavings?mm.mSav:[]);
        mAll.forEach(function(it){
          if((it.amount||0)<=0)return;
          var g2=ensureCat(it.grp,it.cat,it.sub);
          var rec2=mkRec(ds1,it.amount,g2,it.cat,it.sub||'','','',0,true);
          rec2.imp='m';dailyData.push(rec2);addM++;
        });
      } else if(!row.useW&&row.recBlocked)skipped.push(lgMonLbl(ym));
      if(lgOptBudget){
        var map=null;
        var bAll=mm.mExp.concat(lgOptSavings?mm.mSav:[]);
        bAll.forEach(function(it){
          var b=Math.round(it.budget||0);if(b<=0)return;
          if(!map)map=bWriteMap('monthly',ym+'-01');
          ensureCat(it.grp,it.cat,it.sub);
          map[it.sub?subKey(it.cat,it.sub):it.cat]=b;budN++;
        });
      }
    }
    if(lgOptIncome&&mm.inc.length){
      if(!incomeData[ym])incomeData[ym]=[];
      incomeData[ym]=incomeData[ym].filter(function(it){return !it.imp;});
      var ics=getIncomeCats();
      mm.inc.forEach(function(it){
        if(it.cat&&ics.indexOf(it.cat)<0){ics.push(it.cat);incCatAdded=true;}
        incomeData[ym].push({cat:it.cat,amount:Math.round(it.amount),imp:1});incN++;
      });
      if(incMonths.indexOf(ym)<0)incMonths.push(ym);
    }
  }); 
  saveDaily();saveDailyCats();loadDailyCats();saveDailyBudget();saveIncome();
  if(incCatAdded){saveIncomeCats();if(typeof renderIncomeCatList==='function')try{renderIncomeCatList();}catch(e){}}
  incMonths.forEach(function(ym){try{applyIncomeToRoadmap(ym);}catch(e){}});
  if(typeof renderCatOptions==='function')try{renderCatOptions();}catch(e){}
  closeM('lgImportModal');lgStage=null;
  if(typeof renderActiveView==='function')renderActiveView();
  if(typeof renderDaily==='function')try{renderDaily();}catch(e){}
  var msg='가계부에서 기록 '+(addW+addM)+'건을 가져왔어요.';
  var det=[];
  if(addW)det.push('일별 '+addW+'건');
  if(addM)det.push('월간 요약 '+addM+'건');
  if(incN)det.push('수입 '+incN+'건');
  if(budN)det.push('예산 '+budN+'항목');
  if(det.length)msg+='\n'+det.join(' · ');
  if(repl)msg+='\n이전에 가져온 기록 '+repl+'건은 새로 교체했어요.';
  if(skipped.length)msg+='\n'+skipped.join(', ')+'은 이미 기록이 있어 지출 기록을 건너뛰었어요.';
  alert(msg);
}
var _stBar=null,_stInit=false,_stTick=false;
function _stEnsureInit(){if(_stInit)return;_stInit=true;try{window.addEventListener('scroll',_stOnScroll,{passive:true});window.addEventListener('resize',_stOnScroll);}catch(e){}}
function _stEnsureBar(){if(_stBar&&document.body.contains(_stBar))return _stBar;_stBar=document.createElement('div');_stBar.id='stStickyHdr';_stBar.style.cssText='position:fixed;top:0;left:0;z-index:40;display:none;overflow:hidden;pointer-events:none;box-shadow:0 2px 5px rgba(0,0,0,.07)';document.body.appendChild(_stBar);return _stBar;}
function _stScaleOf(el){try{var p=document.createElement('div');p.style.cssText='position:absolute;left:-9999px;top:0;width:100px;height:0;visibility:hidden';el.appendChild(p);var z=p.getBoundingClientRect().width/100;el.removeChild(p);return (z>0.1&&z<5)?z:1;}catch(e){return 1;}}
function _stVisibleTable(){var ts=document.querySelectorAll('table.st-table');for(var i=0;i<ts.length;i++){if(ts[i].offsetParent!==null)return ts[i];}return null;}
function _stStickyUpdate(){
  var bar=_stEnsureBar();
  if(document.querySelector('.modal-bg.open')){bar.style.display='none';return;}
  var t=_stVisibleTable();
  if(!t){bar.style.display='none';return;}
  var head=t.querySelector('thead'),tr=head&&head.querySelector('tr');
  if(!tr){bar.style.display='none';return;}
  var tRect=t.getBoundingClientRect(),hRect=head.getBoundingClientRect();
  if(!(tRect.top<0 && tRect.bottom>hRect.height+8)){bar.style.display='none';return;}
  var Z=_stScaleOf(t.parentElement||t);
  var pad=(4*Z)+'px '+(6*Z)+'px',fs=(13*Z)+'px';
  var ths=tr.children,cells='';
  for(var i=0;i<ths.length;i++){var r=ths[i].getBoundingClientRect();var al=(i===0?'left':'right');cells+='<div style="flex:0 0 '+r.width+'px;width:'+r.width+'px;box-sizing:border-box;text-align:'+al+';padding:'+pad+';font-size:'+fs+';color:var(--gray);white-space:nowrap;overflow:hidden">'+ths[i].textContent+'</div>';}
  bar.innerHTML='<div style="display:flex;width:'+tRect.width+'px;background:var(--st-head-bg)">'+cells+'</div>';
  bar.style.left=tRect.left+'px';bar.style.width=tRect.width+'px';bar.style.display='block';
}
function _stOnScroll(){_stEnsureInit();if(_stTick)return;_stTick=true;requestAnimationFrame(function(){_stTick=false;_stStickyUpdate();});}
_stEnsureInit();
var catHidden=null,dlHiddenOpen=false;
function loadCatHidden(){try{var v=JSON.parse(localStorage.getItem('rs_cat_hidden')||'null');catHidden=Array.isArray(v)?v:[];}catch(e){catHidden=[];}}



var dlCatCollapsed={},dlSubHiddenOpen={},dlGrpCollapsed={},loanRateOpen={},loanRepayOpen={},dueHistOpen={},loanAdvOpen={},assetPrOpen={},loanArchiveOpen=false;
function isSubHidden(c,sub){if(!catHidden)loadCatHidden();return catHidden.indexOf(subKey(c,sub))>=0;}
function toggleSubHidden(c,sub){if(!catHidden)loadCatHidden();var k=subKey(c,sub);var i=catHidden.indexOf(k);if(i>=0)catHidden.splice(i,1);else catHidden.push(k);try{lsSet('rs_cat_hidden',JSON.stringify(catHidden));}catch(e){}renderActiveView();}
function toggleSubHiddenOpen(c){dlSubHiddenOpen[c]=!dlSubHiddenOpen[c];renderActiveView();}
function toggleCatCollapse(c){dlCatCollapsed[c]=!dlCatCollapsed[c];renderActiveView();}
function toggleGrpCollapse(scope,grp){var k=scope+'_'+grp;dlGrpCollapsed[k]=!dlGrpCollapsed[k];renderActiveView();}
function moveCat(grp,cat,dir){if(!dailyTree)loadDailyCats();var keys=Object.keys(dailyTree[grp]||{});var i=keys.indexOf(cat);if(i<0)return;var j=i+dir;if(j<0||j>=keys.length)return;var t=keys[i];keys[i]=keys[j];keys[j]=t;var rb={};keys.forEach(function(k){rb[k]=dailyTree[grp][k];});dailyTree[grp]=rb;dailyCats=dlFlattenCats(dailyTree);saveDailyCats();renderActiveView();}
function monthSubSpent(c,sb,ds){var t=0;monthEntries(ds).forEach(function(e){var a=entrySpend(e);if(a===0)return;if((e.cat||e.category)===c&&e.sub===sb)t+=a;});return t;}function varMonthlyHint(scope,cat,ds){if(scope!=='weekly'||catGroupOf(cat)!=='변동')return '';var lim=effCatBudget('monthly',cat,ds);if(lim<=0)return '';var spent=catSpentMap('monthly',ds)[cat]||0;var left=lim-spent;var over=left<0;var pct=Math.min(100,Math.max(0,Math.round(spent/lim*100)));var barCol=over?'#d9534f':'var(--ac)';var txt=over?('<span style="color:#d9534f">월 한도 '+fmtComma(lim)+'원 · '+fmtComma(-left)+'원 초과</span>'):('남은 월 한도 '+fmtComma(left)+'원 / '+fmtComma(lim)+'원');var bar='<span style="display:inline-block;width:60px;height:5px;border-radius:99px;background:var(--border);overflow:hidden;flex:none;margin-left:8px"><span style="display:block;height:100%;width:'+pct+'%;background:'+barCol+';border-radius:99px"></span></span>';return '<div class="vmh" style="display:flex;align-items:center;font-size:13px;color:var(--gray);margin:-3px 0 9px;padding-left:15px"><span>'+txt+'</span>'+bar+'</div>';}function catBudgetHtml(scope,dateStr,isPast){isPast=!!isPast;if(typeof ensureLoanCats==='function')ensureLoanCats();var pkey=(scope==='weekly')?weekKey(dateStr):monthKey(dateStr);var pastNote='';var planning=dlPlanAll;var entries=(scope==='weekly')?weekEntries(dateStr):monthEntries(dateStr);if(!dailyTree)loadDailyCats();var spent={},spentSub={};entries.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'미분류';spent[c]=(spent[c]||0)+a;if(e.sub){var sk=subKey(c,e.sub);spentSub[sk]=(spentSub[sk]||0)+a;}});function _spIsEtcGrp(grp){return grp==='';}var sumFix=0,sumVar=0,sumSpec=0,sumEtc=0;Object.keys(spent).forEach(function(c){var grp=catGroupOf(c);if(grp==='고정')sumFix+=spent[c];else if(grp==='변동')sumVar+=spent[c];else if(grp==='특별')sumSpec+=spent[c];else if(_spIsEtcGrp(grp))sumEtc+=spent[c];});var allowSub=(scope==='monthly'||scope==='weekly');function subInputs(c){var grp=catGroupOf(c);var subs=(dailyTree[grp]&&dailyTree[grp][c])||[];var h='<div style="margin:-4px 0 12px 16px;padding:6px 0 2px 10px;border-left:2px solid var(--ac-light)">';function _row(sb,hidden){var sk=subKey(c,sb);var sbd=parseFloat(catBudgetMap(scope,dateStr)[sk])||0;var _sset=sbd>0;var ssp=spentSub[sk]||0;var _mlim=parseFloat(catBudgetMap('monthly',dateStr)[sk])||0;var _spLabel;if(scope==='weekly'&&_mlim>0){var _ms=monthSubSpent(c,sb,dateStr);_spLabel='<span style="white-space:nowrap">썼어요 <span style="'+(_ms>_mlim?'color:#d9534f;font-weight:600':'')+'">'+fmtComma(_ms)+'</span></span> <span style="white-space:nowrap">/ 월 '+fmtComma(_mlim)+'</span>';}else{_spLabel='<span style="white-space:nowrap">썼어요 '+fmtComma(ssp)+'</span>';}var _statusLabel='';if(_sset){_statusLabel=(ssp>sbd)?' <span style="white-space:nowrap">· <span style="color:#d9534f;font-weight:600">'+fmtComma(ssp-sbd)+'원 초과</span></span>':' <span style="white-space:nowrap">· <span style="color:var(--ac)">남음 '+fmtComma(sbd-ssp)+'원</span></span>';}var act=hidden?('<button type="button" onclick="toggleSubHidden('+jsArg(c)+','+jsArg(sb)+')" style="border:1px solid var(--border);background:#fff;border-radius:99px;padding:1px 8px;font-size:13px;color:var(--ac);cursor:pointer">복원</button>'):('<button type="button" onclick="toggleSubHidden('+jsArg(c)+','+jsArg(sb)+')" title="이 세부 접기" style="border:none;background:none;cursor:pointer;color:#bbb;font-size:13px;padding:0 2px">🙈</button><button type="button" onclick="deleteDlSub('+jsArg(grp)+','+jsArg(c)+','+jsArg(sb)+')" style="border:none;background:none;cursor:pointer;color:#ccc;font-size:15px;line-height:1;padding:0 2px">×</button>');var _due='';if(scope==='monthly'&&grp==='고정'){var _fd=fixedDue[sk]||{};var _day=_fd.day||'';var _yr=parseInt(dateStr.slice(0,4),10),_mo=parseInt(dateStr.slice(5,7),10);var _hint='';if(_day){var _ed=effDueDate(_yr,_mo,_day,!!_fd.shift);var _ep=_ed.split('-');_hint='<span style="font-size:13px;color:var(--ac);margin-left:4px;white-space:nowrap">→ '+parseInt(_ep[1],10)+'월 '+parseInt(_ep[2],10)+'일('+dlWeekdayKo(_ed)+') 결제 예정</span>';}var _hBtn='',_hBody='';if(c==='대출이자'){var _fh=_fd.dayHist||[];var _hOpen=!!dueHistOpen[sk];var _hRows=_fh.map(function(h,ix){return '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px"><input type="month" value="'+(h.mk||'')+'" onchange="setDueHist('+jsArg(sk)+','+ix+',\'mk\',this.value)" style="padding:5px 7px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111;max-width:100%;min-width:0"><span style="font-size:13px;color:var(--gray);white-space:nowrap">그 달의 예전 결제일</span><input type="number" min="1" max="31" value="'+(h.prevDay||'')+'" placeholder="예)9" onchange="setDueHist('+jsArg(sk)+','+ix+',\'prevDay\',this.value)" style="width:52px;text-align:center;padding:2px 4px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">일</span><button type="button" onclick="delDueHist('+jsArg(sk)+','+ix+')" style="border:none;background:none;cursor:pointer;color:#ccc;font-size:15px;line-height:1;padding:0 2px">×</button></div>';}).join('');_hBody=_hOpen?('<div style="margin:2px 0 9px;padding:8px 10px;border:1px solid var(--border);border-radius:6px;background:#fff;word-break:keep-all"><div style="font-size:12px;color:var(--gray);margin-bottom:7px">납부일을 바꾸면 <b>그 달만</b> 이자 기간이 늘거나 줄어요.<br>바뀐 <span style="white-space:nowrap">정산월</span>과 <span style="white-space:nowrap">그전까지 쓰던 결제일</span>을 넣으면, 그 달 이자를 <span style="white-space:nowrap">(예전 결제일→새 결제일)</span> 실제 경과일로 다시 계산해요. 다음 달부터는 새 결제일 기준으로 돌아가요.</div>'+_hRows+'<button type="button" onclick="addDueHist('+jsArg(sk)+','+jsArg(monthKey(dateStr))+')" style="border:1px dashed var(--border);background:none;border-radius:99px;padding:4px 12px;font-size:13px;color:var(--gray);cursor:pointer;font-family:inherit;white-space:nowrap">+ 결제일 변경 추가</button></div>'):'';_hBtn='<button type="button" onclick="toggleDueHist('+jsArg(sk)+')" style="border:1px solid var(--border);background:none;border-radius:99px;padding:2px 10px;font-size:12px;color:var(--gray);cursor:pointer;font-family:inherit;white-space:nowrap;margin-left:2px">결제일 변경 이력'+(_fh.length?' '+_fh.length:'')+' '+(_hOpen?'▴':'▾')+'</button>';}_due='<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:-2px 0 9px;padding-left:2px"><span style="font-size:13px;color:var(--gray)">납부일 매월</span><input type="number" min="1" max="31" value="'+_day+'" placeholder="-" onchange="setFixedDueDay('+jsArg(sk)+',this.value,'+jsArg(monthKey(dateStr))+')" style="width:44px;text-align:center;padding:2px 4px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">일</span><label style="font-size:13px;color:var(--gray);display:inline-flex;align-items:center;gap:3px;cursor:pointer"><input type="checkbox" '+(_fd.shift?'checked':'')+' onchange="setFixedDueShift('+jsArg(sk)+',this.checked)" style="margin:0;vertical-align:middle"> 주말/휴일이면 다음 영업일</label>'+_hint+_hBtn+'</div>'+_hBody;}return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px"><div style="flex:1;min-width:0;word-break:keep-all"><div style="font-size:13px;color:#444">'+dlEsc(sb)+'</div><div style="color:var(--gray);font-size:13px;margin-top:2px;line-height:1.35">'+_spLabel+_statusLabel+'</div></div><span style="display:inline-flex;align-items:center;gap:4px"><input type="number" class="dlbgt" value="'+(_sset?sbd:'')+'" placeholder="예산" onchange="setCatBudget('+jsArg(scope)+','+jsArg(sk)+',this.value,'+jsArg(dateStr)+')" style="width:64px;text-align:right;padding:3px 5px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">원</span>'+act+'</span></div>'+_due;}subs.forEach(function(sb){if(isSubHidden(c,sb))return;if(typeof loanSkInactive==='function'&&loanSkInactive(subKey(c,sb),dateStr))return;if(!planning){var _sk=subKey(c,sb);if((parseFloat(catBudgetMap(scope,dateStr)[_sk])||0)<=0)return;}h+=_row(sb,false);});var hid=subs.filter(function(sb){return isSubHidden(c,sb);});if(planning&&hid.length){h+='<div onclick="toggleSubHiddenOpen('+jsArg(c)+')" style="cursor:pointer;font-size:13px;color:var(--gray);margin:2px 0 6px;user-select:none">🙈 숨긴 세부 ('+hid.length+') '+(dlSubHiddenOpen[c]?'▴':'▾')+'</div>';if(dlSubHiddenOpen[c])hid.forEach(function(sb){h+=_row(sb,true);});}h+='<button type="button" onclick="addDlSub('+jsArg(grp)+','+jsArg(c)+')" style="border:1px dashed var(--border);background:none;border-radius:99px;padding:4px 12px;font-size:13px;color:var(--gray);cursor:pointer;margin-top:2px">+ 세부 추가</button></div>';return h;}function section(grp,icon,sum){var cats=dailyCats.filter(function(c){return catGroupOf(c)===grp;});var rows='';cats.forEach(function(c){var sp=spent[c]||0;var ss=subBudgetSum(scope,c,dateStr);var bd=ss>0?ss:(catBudgetMap(scope,dateStr)[c]||0);var bSet=bd>0;if(planning||sp>0||bd>0){var grp2=catGroupOf(c);var hasSubs=allowSub&&((dailyTree[grp2]&&dailyTree[grp2][c])||[]).length>0;if(!(c in dlCatCollapsed))dlCatCollapsed[c]=(ss<=0);var collapsed=dlCatCollapsed[c];var _mv=planning?'<button type="button" onclick="moveCat('+jsArg(grp2)+','+jsArg(c)+',-1)" title="위로" style="border:none;background:none;cursor:pointer;color:#bbb;font-size:13px;padding:0 1px">↑</button><button type="button" onclick="moveCat('+jsArg(grp2)+','+jsArg(c)+',1)" title="아래로" style="border:none;background:none;cursor:pointer;color:#bbb;font-size:13px;padding:0 1px">↓</button>':'';var _cv=(planning&&hasSubs)?'<button type="button" onclick="toggleCatCollapse('+jsArg(c)+')" title="세부 펼치기/접기" style="border:none;background:none;cursor:pointer;color:var(--gray);font-size:13px;padding:0 4px">'+(collapsed?'▾':'▴')+'</button>':'';var _ex=_mv+_cv;var _editableTop=(grp2==='특별')?false:!(ss>0);rows+=catBudgetRow(scope,c,sp,bd,_editableTop,false,_ex,dateStr,bSet);rows+=varMonthlyHint(scope,c,dateStr);if(hasSubs&&(planning||ss>0)&&!(planning&&collapsed))rows+=subInputs(c);}});if(!rows)rows='<div style="font-size:13px;color:var(--gray);padding:2px 0 10px">아직 기록이 없어요.</div>';var gKey=scope+'_'+grp;var gCollapsed=!!dlGrpCollapsed[gKey];var _link=(grp==='특별')?'<button type="button" onclick="event.stopPropagation();gotoSpecialPlan()" style="border:1px solid var(--border);background:#fff;border-radius:99px;padding:2px 10px;font-size:12px;color:var(--ac);cursor:pointer;font-family:inherit;white-space:nowrap;margin-left:auto">머니플랜에서 수정</button>':'';var gHead='<div onclick="toggleGrpCollapse('+jsArg(scope)+','+jsArg(grp)+')" style="cursor:pointer;user-select:none;display:flex;justify-content:flex-start;align-items:baseline;gap:10px;margin:4px 0 9px"><span style="color:var(--gray);font-size:13px">'+(gCollapsed?'▸':'▾')+'</span><span style="font-weight:700;font-size:13px">'+grp+'지출</span><span style="font-size:13px;color:var(--gray)">소계 '+fmtComma(sum)+'원</span>'+_link+'</div>';return gHead+(gCollapsed?'':rows);}var planBtn='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:20px 0 8px"><span style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray)">분류별</span><div style="display:flex;gap:6px"><button type="button" onclick="openCatManage()" style="border:1px solid var(--border);background:#fff;border-radius:99px;padding:6px 13px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit">🗂 분류 관리</button><button type="button" onclick="toggleDlPlanAll()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:6px 13px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit">'+(planning?'접기':'+ 예산 세우기')+'</button></div></div>';var pullBtns=(planning&&scope==='weekly')?'<div style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:12px;flex-wrap:wrap"><button type="button" onclick="pullLastWeek()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:6px 13px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit">📋 지난주 예산 불러오기</button><button type="button" onclick="openPullWeek()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:6px 13px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit">📥 월간 예산에서 가져오기</button></div>':((planning&&scope==='monthly')?'<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button type="button" onclick="openExcelImport()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:6px 13px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit">📥 엑셀·CSV로 채우기</button></div>':'');var planHint=planning?'<div class="empty-guide" style="margin-bottom:12px">💡 자주 안 쓰는 <b>세부 항목</b>은 🙈 이모티콘을 눌러 접어두고(<b>주간 예정 고정지출 목록에서도 빠져요</b> — 기록·예산은 그대로), 사용하지 않지만 남겨두고 싶은 <b>대분류</b>는 세모(▾)를 눌러 닫아둘 수 있어요.<br>화살표(↑↓)로 대분류 순서를 정할 수 있어요. 예산을 다 입력한 후 <b>접기</b>를 누르면 내가 입력한 예산만 남아요.<br>예산은 <b>기간마다 따로</b> 저장돼서, 이번에 입력한 값이 지난 기간엔 적용되지 않아요.'+(scope==='monthly'?'<br>💳 자산 탭에 <b>대출</b>을 넣으면, 매달 납입액이 <b>고정지출 › 대출이자</b> 예산에 자동으로 채워져요. 지출은 다른 고정지출처럼 일일 기록에서 남기면 돼요.<br>📅 달을 앞뒤로 넘기면 <b>그 달에 낼 이자</b>가 보여요. 아직 시작 전인 대출은 <b>첫 상환월부터</b>, 다 갚은 대출은 <b>완제한 달까지만</b> 나와요.':'')+'</div>':'';var _comp=settlementCompareHtml(scope,dateStr,isPast);var _ratio='';var _special='<div style="height:12px"></div><div>'+section('특별','',sumSpec)+'</div></div></div>';var _breakdown=_ratio+planBtn+pullBtns+pastNote+planHint+'<div class="daily-sections"><div>'+section('고정','',sumFix)+'</div>'+'<div class="cs"><div>'+section('변동','',sumVar)+'</div>'+_special;var html=_comp+_breakdown;var etcCats=Object.keys(spent).filter(function(c){return _spIsEtcGrp(catGroupOf(c))&&spent[c]>0;});if(etcCats.length){html+='<div style="height:12px"></div><div style="display:flex;justify-content:flex-start;align-items:baseline;gap:10px;margin:4px 0 9px"><span style="font-weight:700;font-size:13px">❔ 기타/미분류</span><span style="font-size:13px;color:var(--gray)">소계 '+fmtComma(sumEtc)+'원</span></div>';etcCats.forEach(function(c){html+=catBudgetRow(scope,c,spent[c],0,false,(c!=='미분류'));});}
var delSpent={},delCnt={};entries.forEach(function(e){var c=e.cat||e.category||'';if(!dlCatDeleted(c))return;var a=entrySpendRaw(e);if(a===0)return;delSpent[c]=(delSpent[c]||0)+a;delCnt[c]=(delCnt[c]||0)+1;});
var delCats=Object.keys(delSpent).sort(function(a,b){return delSpent[b]-delSpent[a];});
if(delCats.length){
  var delTot=0;delCats.forEach(function(c){delTot+=delSpent[c];});
  html+='<div style="height:12px"></div><div onclick="toggleDelCatOpen()" style="cursor:pointer;user-select:none;display:flex;justify-content:flex-start;align-items:baseline;gap:10px;margin:4px 0 9px;flex-wrap:wrap"><span style="color:var(--gray);font-size:13px">'+(dlDelCatOpen?'▾':'▸')+'</span><span style="font-weight:700;font-size:13px">🗂 삭제된 분류 ('+delCats.length+')</span><span style="font-size:13px;color:var(--gray);white-space:nowrap">합산 제외 · '+fmtComma(delTot)+'원</span></div>';
  if(dlDelCatOpen){
    delCats.forEach(function(c){
      html+='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:13px;color:var(--gray);word-break:keep-all">'+dlEsc(c)+' <span style="white-space:nowrap">(삭제됨)</span></span><span style="display:inline-flex;align-items:center;gap:8px;white-space:nowrap"><span style="font-size:13px;color:var(--gray)">'+delCnt[c]+'건 · '+fmtComma(delSpent[c])+'원</span><button type="button" onclick="purgeDeletedCat('+jsArg(c)+')" style="border:1px solid var(--border);background:#fff;border-radius:99px;padding:2px 10px;font-size:13px;color:#d9534f;cursor:pointer;font-family:inherit">영구 삭제</button></span></div>';
    });
    html+='<div style="font-size:13px;color:var(--gray);margin-top:2px;line-height:1.5;word-break:keep-all">분류를 삭제해서 합산에서 빠진 기록이에요. 영구 삭제하면 <b>모든 기간</b>에서 지워지고 되돌릴 수 없어요.</div>';
  }
}var offByCat={},offTotal=0,_obm=catBudgetMap(scope,dateStr);dailyCats.filter(function(c){return catGroupOf(c)!=='특별';}).forEach(function(c){var ownSet=(parseFloat(_obm[c])||0)>0;var ss=subBudgetSum(scope,c,dateStr);if(ownSet&&ss===0)return;var subsList=(dailyTree[catGroupOf(c)]&&dailyTree[catGroupOf(c)][c])||[];var subMap={},catOff=0,sumSub=0;subsList.forEach(function(sb){var sk=subKey(c,sb);var sa=spentSub[sk]||0;if(sa<=0)return;sumSub+=sa;var subBudgeted=(parseFloat(_obm[sk])||0)>0;if(ss>0){if(!subBudgeted){subMap[sb]=sa;catOff+=sa;}}else{subMap[sb]=sa;catOff+=sa;}});var noSub=(spent[c]||0)-sumSub;if(noSub>0){subMap['(기타)']=(subMap['(기타)']||0)+noSub;catOff+=noSub;}if(catOff>0){offByCat[c]={total:catOff,subs:subMap};offTotal+=catOff;}});var _anyBdg=false;Object.keys(_obm).forEach(function(k){if((parseFloat(_obm[k])||0)>0)_anyBdg=true;});if(!_anyBdg)offTotal=0;if(offTotal>0){var _oo=dlOffBudgetOpen;html+='<div style="margin-top:22px;border-top:1px solid var(--tbl-border);padding-top:12px"><div onclick="toggleOffBudget()" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:#c08a3e;font-weight:600">💸 예산 외 지출 <span style="color:var(--gray);font-size:13px">'+(_oo?'▾':'▸')+'</span></span><span style="font-size:13px;font-weight:700;color:#c08a3e">'+fmtComma(offTotal)+'원</span></div>';if(_oo){html+='<div style="margin-top:9px">'+Object.keys(offByCat).sort(function(a,b){return offByCat[b].total-offByCat[a].total;}).map(function(c){var o=offByCat[c];var subsHtml=Object.keys(o.subs).sort(function(a,b){return o.subs[b]-o.subs[a];}).map(function(sb){return '<div style="display:flex;justify-content:space-between;font-size:13px;color:#777;padding:2px 0 2px 14px"><span>'+dlEsc(sb)+'</span><span>'+fmtComma(o.subs[sb])+'원</span></div>';}).join('');return '<div style="margin-bottom:7px"><div style="display:flex;justify-content:space-between;font-size:13px;color:#111"><span>'+dlEsc(c)+'</span><span style="font-weight:600">'+fmtComma(o.total)+'원</span></div>'+subsHtml+'</div>';}).join('')+'</div>';}html+='<div style="font-size:13px;color:var(--gray);margin-top:6px;line-height:1.5">예산을 안 잡은 분류·세부에 쓴 금액이에요. 예산을 잡으면 여기서 빠져요.</div></div>';}return html;}
function certWrapText(text,maxW,font){var cv=document.createElement('canvas');var ctx=cv.getContext('2d');ctx.font=font;var lines=[];var cur='';for(var i=0;i<text.length;i++){var ch=text[i];if(ch==='\n'){lines.push(cur);cur='';continue;}var t=cur+ch;if(ctx.measureText(t).width>maxW&&cur!==''){lines.push(cur);cur=ch;}else cur=t;}if(cur)lines.push(cur);if(!lines.length)lines=[''];return lines;}
function certChipsLayout(items,maxWidth,font){if(!items.length)return [];var cv=document.createElement('canvas');var ctx=cv.getContext('2d');ctx.font=font;var rows=[];var cur=[];var curW=0;items.forEach(function(it){var w=8+4+ctx.measureText(it.label).width+14;if(curW+w>maxWidth&&cur.length){rows.push(cur);cur=[];curW=0;}cur.push(it);curW+=w;});if(cur.length)rows.push(cur);return rows;}
var _certWhipImg=(typeof WHIP_IMG!=='undefined')?new Image():null;if(_certWhipImg)_certWhipImg.src=WHIP_IMG;
function _certWhipReady(){if(!_certWhipImg)return Promise.resolve();if(_certWhipImg.complete&&_certWhipImg.naturalWidth>0)return Promise.resolve();return new Promise(function(res){_certWhipImg.onload=function(){res();};_certWhipImg.onerror=function(){res();};});}
var _certRsImg=new Image();_certRsImg.src='assets/rs_.png';
var _certRsMaskImg=new Image();_certRsMaskImg.src='assets/rs-fill-mask.png?v=20260914-gap-cutout';
function _certRsReady(){function w(img){if(img.complete&&img.naturalWidth>0)return Promise.resolve();return new Promise(function(res){img.onload=function(){res();};img.onerror=function(){res();};});}return Promise.all([w(_certRsImg),w(_certRsMaskImg)]);}
function certGaugeCanvas(w,h,pct,fillColor,baseColor){
  var R=6;
  function maskedFill(paint){
    var c=document.createElement('canvas');c.width=w*R;c.height=h*R;var cx=c.getContext('2d');cx.scale(R,R);
    cx.drawImage(_certRsMaskImg,0,0,w,h);cx.globalCompositeOperation='source-in';paint(cx);
    return c;
  }
  var oc=document.createElement('canvas');oc.width=w*R;oc.height=h*R;var octx=oc.getContext('2d');octx.scale(R,R);
  var fh=Math.max(0,Math.min(100,pct===null?0:pct))/100*h;
  octx.drawImage(maskedFill(function(cx){cx.fillStyle=baseColor;cx.fillRect(0,0,w,h);}),0,0,w,h);
  if(fh>0)octx.drawImage(maskedFill(function(cx){cx.fillStyle=fillColor;cx.fillRect(0,h-fh,w,fh);}),0,0,w,h);
  octx.drawImage(_certRsImg,0,0,w,h);
  return oc;
}
function certGroupData(scope,cat,spentMap,dateStr){var sp=spentMap[cat]||0;var ss=subBudgetSum(scope,cat,dateStr);var bd=ss>0?ss:(parseFloat(catBudgetMap(scope,dateStr)[cat])||0);if(bd<=0)return null;var pct=Math.round(sp/bd*100);return {cat:cat,pct:pct,over:sp>bd};}
function certChartData(scope,dateStr){var dates=[],labels=[];if(scope==='weekly'){var st=weekStartMon(dateStr);var names=weekDayNames();for(var i=0;i<7;i++){var dt=new Date(st.getFullYear(),st.getMonth(),st.getDate()+i);dates.push(localDateStr(dt));}labels=names;}else{var mk=monthKey(dateStr);var f=monthFirstDate(mk),l=monthLastDate(mk);var c=new Date(f+'T00:00:00'),e=new Date(l+'T00:00:00'),g=0;while(c<=e&&g<40){var ds=localDateStr(c);dates.push(ds);labels.push(String(parseInt(ds.slice(8,10),10)));c.setDate(c.getDate()+1);g++;}}var fix=[],vr=[],bud=[];dates.forEach(function(ds){var f2=0,v2=0;dailyData.forEach(function(e){if(e.date!==ds)return;var a=entrySpend(e);if(a===0)return;var grp=recGroup(e);if(grp==='고정')f2+=a;else if(grp==='변동')v2+=a;});fix.push(f2);vr.push(v2);bud.push(dailyBudgetOf(ds)||0);});return {dates:dates,labels:labels,fix:fix,vr:vr,bud:bud};}
function certCategoryDonutData(scope,dateStr){var entries=(scope==='weekly')?weekEntries(dateStr):monthEntries(dateStr);var spent={},total=0;entries.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'미분류';spent[c]=(spent[c]||0)+a;total+=a;});if(total<=0)return {total:0,items:[],bigItems:[],smallItems:[],leftN:0,rightN:0,shift:0};var sorted=Object.keys(spent).map(function(c){return {cat:c,pct:Math.round(spent[c]/total*100),frac:spent[c]/total};}).sort(function(a,b){return b.pct-a.pct;});var THRESH=0.06;var start=-Math.PI/2;var full=sorted.map(function(it){var end=start+it.frac*Math.PI*2;var mid=(start+end)/2;var e={cat:it.cat,pct:it.pct,frac:it.frac,over:false,startA:start,endA:end,mid:mid};start=end;return e;});var bigItems=full.filter(function(e){return e.frac>=THRESH;});var smallItems=full.filter(function(e){return e.frac<THRESH;});smallItems.forEach(function(e){e.side=(Math.cos(e.mid)<0)?'left':'right';});var leftN=smallItems.filter(function(e){return e.side==='left';}).length;var rightN=smallItems.filter(function(e){return e.side==='right';}).length;var shift=Math.max(-14,Math.min(14,(leftN-rightN)*7));return {total:total,items:full,bigItems:bigItems,smallItems:smallItems,leftN:leftN,rightN:rightN,shift:shift};}
function certIncomeData(dateStr){var mk=monthKey(dateStr);var items=incomeData[mk]||[];var iyr=parseInt(mk.slice(0,4),10),imi=parseInt(mk.slice(5,7),10)-1;var projInc=(typeof getMonthlyProjectWon==='function')?Math.round(getMonthlyProjectWon(iyr,imi)||0):0;var inc=items.reduce(function(s,it){return s+(parseInt(it.amount,10)||0);},0)+projInc;var ents=monthEntries(dateStr);var exp=0,fix=0,varr=0,spec=0;ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;exp+=a;var grp=catGroupOf(e.cat||e.category||'');if(grp==='고정')fix+=a;else if(grp==='특별')spec+=a;else varr+=a;});var net=inc-exp;var fixPct=inc>0?Math.round(fix/inc*100):null;var varPct=inc>0?Math.round(varr/inc*100):null;var specPct=inc>0?Math.round(spec/inc*100):null;var netPct=inc>0?Math.round(net/inc*100):null;var byc={};items.forEach(function(it){var c=it.cat||'기타';byc[c]=(byc[c]||0)+(parseInt(it.amount,10)||0);});if(projInc>0)byc['프로젝트 이자']=(byc['프로젝트 이자']||0)+projInc;var incBreak=Object.keys(byc).filter(function(c){return byc[c]>0;}).map(function(c){return {cat:c,pct:inc>0?Math.round(byc[c]/inc*100):0,frac:inc>0?(byc[c]/inc):0,color:_incColor(c)};}).sort(function(a,b){return b.pct-a.pct;});var legendRows=certChipsLayout(incBreak.map(function(sg){return {label:sg.cat+' '+sg.pct+'%',color:sg.color};}),380-48,"11px 'Pretendard','Noto Sans KR',sans-serif");return {hasIncome:inc>0,fixPct:fixPct,varPct:varPct,specPct:specPct,netPct:netPct,netPositive:net>=0,incBreak:incBreak,legendRows:legendRows};}
/* §4.2-20 STEP3 승인된 예외 2/2 — 이번 달 순액(원). certIncomeData()는 %만 돌려주므로, 대시보드가 쓸 원 단위 값을 같은 재료(incomeData+getMonthlyProjectWon+monthEntries/entrySpend)로 반환. 새 계산 규칙 없음. */
function monthNetWon(dateStr){
  var mk=monthKey(dateStr);
  var items=incomeData[mk]||[];
  var iyr=parseInt(mk.slice(0,4),10),imi=parseInt(mk.slice(5,7),10)-1;
  var projInc=(typeof getMonthlyProjectWon==='function')?Math.round(getMonthlyProjectWon(iyr,imi)||0):0;
  var inc=items.reduce(function(s,it){return s+(parseInt(it.amount,10)||0);},0)+projInc;
  var ents=monthEntries(dateStr);
  var exp=0;
  ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;exp+=a;});
  return inc-exp;
}
function certReviewData(scope,dateStr){var tal=(scope==='weekly')?weekConsumeTally(dateStr):monthConsumeTally(dateStr);var bodyFont="13px 'Pretendard','Noto Sans KR',sans-serif";var maxW=380-48;function wrap(t){t=(t||'').toString().trim();if(!t)return [];return certWrapText(t,maxW,bodyFont);}var best='',worst='',carrotNote='',whipNote='',memo='';if(scope==='weekly'){var r=weekReviewOf(dateStr);best=r.best||'';worst=r.worst||'';memo=r.memo||'';}else{var r=monthReviewOf(dateStr);best=r.best||'';worst=r.worst||'';carrotNote=r.carrot||'';whipNote=r.whip||'';}return {carrot:tal.carrot,whip:tal.whip,bestLines:wrap(best),worstLines:wrap(worst),carrotNoteLines:wrap(carrotNote),whipNoteLines:wrap(whipNote),memoLines:wrap(memo)};}
/* ── 정산 비교 (인증 캡처용 · 금액 미표시, 퍼센트만) ───────── */
function certCompareData(scope,dateStr){
  if(!dailyTree)loadDailyCats();
  var thisMap=catSpentMap(scope,dateStr);
  var prevMap=catSpentMap(scope,prevPeriodDate(scope,dateStr));
  var list=Object.keys(thisMap).filter(function(c){return (thisMap[c]||0)>0;}).map(function(c){
    var t=thisMap[c]||0,p=prevMap[c]||0;
    return {cat:c,t:t,p:p,d:t-p,b:effCatBudget(scope,c,dateStr)};
  });
  if(!list.length)return null;
  var per=(scope==='weekly')?'지난주':'지난달';
  var totalT=list.reduce(function(s,x){return s+x.t;},0);
  /* 카드 3종 — 금액 대신 비중/증감률 */
  var byThis=list.slice().sort(function(a,b){return b.t-a.t;});
  var inc=list.filter(function(x){return x.d>0&&x.p>0;}).sort(function(a,b){return b.d-a.d;});
  var dec=list.filter(function(x){return x.d<0&&x.p>0&&x.t>0;}).sort(function(a,b){return a.d-b.d;});
  var cards=[];
  if(byThis[0]&&byThis[0].t>0&&totalT>0)
    cards.push({title:'가장 많이 쓴 곳',cat:byThis[0].cat,val:'전체의 '+Math.round(byThis[0].t/totalT*100)+'%',color:'ac'});
  if(inc[0])
    cards.push({title:per+'보다 늘어난 곳',cat:inc[0].cat,val:'▲ +'+Math.round(inc[0].d/inc[0].p*100)+'%',color:'up'});
  if(dec[0])
    cards.push({title:per+'보다 아낀 곳',cat:dec[0].cat,val:'▼ '+Math.round(dec[0].d/dec[0].p*100)+'%',color:'down'});
  /* 행: 예산대비 · 증감 (퍼센트만) */
  function budCell(t,b){
    if(!(b>0))return null;
    if(t>b)return {dir:'▲',pct:Math.round((t-b)/b*100),color:'up'};
    if(t<b)return {dir:'▼',pct:Math.round((b-t)/b*100),color:'down'};
    return {dir:'',pct:0,color:'gray'};
  }
  function chgCell(t,p,d){
    if(!(t>0&&p>0)||d===0)return null;
    return {dir:(d>0?'▲':'▼'),pct:Math.round(d/p*100),color:(d>0?'up':'down')};
  }
  function mkRow(x){return {cat:x.cat,bud:budCell(x.t,x.b),chg:chgCell(x.t,x.p,x.d)};}
  function mkSum(label,items){
    var t=0,p=0,b=0;
    items.forEach(function(x){t+=x.t;p+=x.p;if(x.b>0)b+=x.b;});
    return {cat:label,bud:budCell(t,b),chg:chgCell(t,p,t-p),sum:true};
  }
  var gF=[],gV=[],gE=[];
  list.forEach(function(x){var g=catGroupOf(x.cat);if(g==='고정')gF.push(x);else if(g==='변동')gV.push(x);else gE.push(x);});
  var bySize=function(a,b){return b.t-a.t;};
  gF.sort(bySize);gV.sort(bySize);gE.sort(bySize);
  var groups=[];
  if(gF.length)groups.push({label:'고정비',key:'fix',rows:gF.map(mkRow),sum:mkSum('고정비 계',gF)});
  if(gV.length)groups.push({label:'변동비',key:'var',rows:gV.map(mkRow),sum:mkSum('변동비 계',gV)});
  if(gE.length)groups.push({label:'기타',key:'etc',rows:gE.map(mkRow),sum:mkSum('기타 계',gE)});
  var total=(groups.length>1)?mkSum('총계',list):null;
  return {cards:cards,groups:groups,total:total};
}
function certBuildData(scope,dateStr,includeSettle){if(!dailyTree)loadDailyCats();var entries=(scope==='weekly')?weekEntries(dateStr):monthEntries(dateStr);var spent={};entries.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'미분류';spent[c]=(spent[c]||0)+a;});var totalSpent=Object.keys(spent).reduce(function(s,c){return s+spent[c];},0);var totalBudget=sumCatBudget(scope,dateStr);var overallPct=totalBudget>0?Math.round(totalSpent/totalBudget*100):null;var fixed=[],variable=[];dailyCats.forEach(function(c){var grp=catGroupOf(c);var d=certGroupData(scope,c,spent,dateStr);if(!d)return;if(grp==='고정')fixed.push(d);else if(grp==='변동')variable.push(d);});fixed.sort(function(a,b){return b.pct-a.pct;});variable.sort(function(a,b){return b.pct-a.pct;});var chart=certChartData(scope,dateStr);var donut=(scope==='monthly')?certCategoryDonutData(scope,dateStr):null;var settle=(scope==='monthly'&&includeSettle)?certIncomeData(dateStr):null;var compare=(scope==='monthly'&&includeSettle)?certCompareData(scope,dateStr):null;var review=certReviewData(scope,dateStr);return {overallPct:overallPct,overAll:(overallPct!==null&&overallPct>100),fixed:fixed,variable:variable,chart:chart,donut:donut,settle:settle,compare:compare,review:review};}
function buildCertCanvas(scope,dateStr,data){var cs=getComputedStyle(document.body);var ac=(cs.getPropertyValue('--ac')||'').trim()||'#b3315a';var W=380,R=3;var scopeLabel=scope==='weekly'?'주간':'월간';var periodLabel='';if(scope==='weekly'){var st=weekStartMon(dateStr),en=new Date(st.getFullYear(),st.getMonth(),st.getDate()+6);periodLabel=(st.getMonth()+1)+'/'+st.getDate()+' – '+(en.getMonth()+1)+'/'+en.getDate();}else{var mk=monthKey(dateStr),mp=mk.split('-');periodLabel=mp[0]+'년 '+parseInt(mp[1],10)+'월';}
  var headerH=88,topH=178,rowH=32,secHeadH=34,secGap=20,footH=14;
  var chartBarH=86,chartLabelH=18,chartH=secHeadH+chartBarH+chartLabelH+secGap;
  var gm='#3f9a68',rm='#d9534f';
  var chipRowH=22;
  function secH(items){return items.length?(secHeadH+items.length*rowH+secGap):0;}
  var donutR=84;
  function donutH(dn){if(!dn||!dn.items.length)return 0;var gap=19;var contentH=Math.max(donutR*2,dn.leftN*gap,dn.rightN*gap)+18;return secHeadH+contentH+secGap;}
  var wfBarAreaH=100,wfLabelH=34,wfLegendGap=16;
  function waterfallH(s){if(!s)return 0;if(!s.hasIncome)return secHeadH+24+secGap;var legendH=s.legendRows.length?(wfLegendGap+s.legendRows.length*chipRowH):0;return secHeadH+wfBarAreaH+wfLabelH+legendH+secGap;}
  var reviewRowH=24,reviewBlockGap=10,reviewLineH=18,reviewHeadH=20;
  function blockH(lines){return lines.length?(reviewHeadH+lines.length*reviewLineH+reviewBlockGap):0;}
  function reviewH(rv){if(!rv)return 0;var hasTal=(rv.carrot>0||rv.whip>0);var h=(hasTal?reviewRowH:0)+blockH(rv.carrotNoteLines)+blockH(rv.whipNoteLines)+blockH(rv.memoLines)+blockH(rv.bestLines)+blockH(rv.worstLines);if(h<=0)return 0;return secHeadH+h+secGap;}
  var cmpCardH=56,cmpHeadRowH=20,cmpRowH=22;
  function compareH(cp){
    if(!cp)return 0;
    var h=(cp.cards.length?cmpCardH+10:0)+cmpHeadRowH;
    cp.groups.forEach(function(gp){h+=cmpRowH+gp.rows.length*cmpRowH+cmpRowH;});
    if(cp.total)h+=cmpRowH;
    return secHeadH+h+secGap;
  }
  var H=headerH+waterfallH(data.settle)+compareH(data.compare)+topH+chartH+donutH(data.donut)+secH(data.fixed)+secH(data.variable)+reviewH(data.review)+footH;
  var cv=document.createElement('canvas');cv.width=W*R;cv.height=H*R;cv.style.width='100%';cv.style.maxWidth=W+'px';cv.style.height='auto';cv.style.display='block';
  var ctx=cv.getContext('2d');ctx.scale(R,R);
  var FF="'Pretendard','Noto Sans KR',sans-serif";var SERIF="'Cormorant Garamond',serif";
  ctx.fillStyle='#fbf8f3';ctx.fillRect(0,0,W,H);
  ctx.fillStyle=ac;ctx.fillRect(0,0,W,6);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#999';ctx.font="600 13px "+SERIF;ctx.textAlign='left';ctx.fillText('RICHSISTER 부자언니',24,36);
  ctx.fillStyle='#111';ctx.font="700 21px "+FF;ctx.fillText(scopeLabel+' 정산 인증',24,64);
  ctx.fillStyle='#999';ctx.font="13px "+FF;ctx.textAlign='right';ctx.fillText(periodLabel,W-24,64);
  ctx.textAlign='left';ctx.strokeStyle='#e8e2d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(24,80);ctx.lineTo(W-24,80);ctx.stroke();
  var y=headerH;
  function drawChipRows(rows,startY){
    var yy=startY;
    rows.forEach(function(row){
      var lx=24;ctx.font="11px "+FF;ctx.textBaseline='middle';
      row.forEach(function(it){
        var tw=ctx.measureText(it.label).width;
        ctx.fillStyle=it.color;ctx.beginPath();ctx.arc(lx+4,yy+9,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#888';ctx.fillText(it.label,lx+12,yy+10);
        lx+=12+tw+14;
      });
      ctx.textBaseline='alphabetic';
      yy+=chipRowH;
    });
    return yy;
  }
  (function(){
    var s=data.settle;if(!s)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('정산 · 이 달의 돈의 흐름',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    if(!s.hasIncome){
      ctx.fillStyle='#999';ctx.font="13px "+FF;ctx.textAlign='left';ctx.fillText('이 달 수입 기록이 없어요.',24,y+16);
      y+=24+secGap;return;
    }
    var fixPct=s.fixPct||0,varPct=s.varPct||0,specPct=s.specPct||0,netPct=s.netPct||0;
    var bottom=Math.min(0,netPct),top=100,range=top-bottom;if(range<=0)range=1;
    var barY=y,barH=wfBarAreaH;
    function _wfY(v){return barH-((v-bottom)/range*barH);}
    var colW=(W-48)/5,colPad=colW*0.16;
    function drawBar(idx,lo,hi,color,op){
      var cx0=24+idx*colW+colPad;var cw=colW-colPad*2;
      var yTop=barY+_wfY(hi),yBot=barY+_wfY(lo);var h=Math.max(1,yBot-yTop);
      ctx.globalAlpha=op||1;ctx.fillStyle=color;ctx.fillRect(cx0,yTop,cw,h);ctx.globalAlpha=1;
    }
    var segs=s.incBreak.length?s.incBreak:[{cat:'수입',pct:100,frac:1,color:gm}];
    var run=0;var cx0=24+0*colW+colPad,cw=colW-colPad*2;
    segs.forEach(function(sg){
      var lo=run,hi=run+sg.frac*100;
      var yTop=barY+_wfY(hi),yBot=barY+_wfY(lo);var h=Math.max(1,yBot-yTop);
      ctx.fillStyle=sg.color;ctx.fillRect(cx0,yTop,cw,h);
      run=hi;
    });
    drawBar(1,100-fixPct,100,rm,1);
    drawBar(2,100-fixPct-varPct,100-fixPct,rm,0.5);
    drawBar(3,100-fixPct-varPct-specPct,100-fixPct-varPct,rm,0.35);
    drawBar(4,Math.min(0,netPct),Math.max(0,netPct),s.netPositive?gm:rm,1);
    var labels=[['수입','100%',gm],['고정비','-'+fixPct+'%',rm],['변동비','-'+varPct+'%',rm],['특별비','-'+specPct+'%',rm],['순액',(s.netPositive&&netPct>0?'+':'')+netPct+'%',s.netPositive?gm:rm]];
    labels.forEach(function(lb,idx){
      var cx=24+idx*colW+colW/2;
      ctx.textAlign='center';
      ctx.fillStyle='#888';ctx.font="12px "+FF;ctx.fillText(lb[0],cx,barY+barH+16);
      ctx.fillStyle=lb[2];ctx.font="700 13px "+FF;ctx.fillText(lb[1],cx,barY+barH+31);
    });
    ctx.textAlign='left';
    y+=wfBarAreaH+wfLabelH;
    if(s.legendRows.length){
      y+=wfLegendGap;
      y=drawChipRows(s.legendRows,y);
    }
    y+=secGap;
  })();
  (function(){
    var cp=data.compare;if(!cp)return;
    var UP='#d9534f',DOWN='#1B6E4F',GRAY='#aaa';
    function col(k){return k==='up'?UP:(k==='down'?DOWN:(k==='ac'?ac:GRAY));}
    function fitText(t,maxW){var d=t;while(ctx.measureText(d).width>maxW&&d.length>1){d=d.slice(0,-1);}return d===t?t:(d.slice(0,-1)+'…');}
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('정산 비교',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    /* 카드 3종 */
    if(cp.cards.length){
      var n=cp.cards.length,gap=8,cw=(W-48-gap*(n-1))/n;
      cp.cards.forEach(function(cd,i){
        var cx0=24+i*(cw+gap);
        ctx.fillStyle='#fff';ctx.strokeStyle='#e8e2d8';ctx.lineWidth=1;
        ctx.beginPath();ctx.rect(cx0,y,cw,cmpCardH);ctx.fill();ctx.stroke();
        ctx.textAlign='left';
        ctx.fillStyle='#aaa';ctx.font="9.5px "+FF;ctx.fillText(fitText(cd.title,cw-14),cx0+7,y+15);
        ctx.fillStyle='#111';ctx.font="700 12px "+FF;ctx.fillText(fitText(cd.cat,cw-14),cx0+7,y+32);
        ctx.fillStyle=col(cd.color);ctx.font="700 12px "+FF;ctx.fillText(fitText(cd.val,cw-14),cx0+7,y+48);
      });
      y+=cmpCardH+10;
    }
    /* 표: 분류 · 예산대비 · 증감 (금액 열 없음) */
    var xBud=W-24-96,xChg=W-24;
    ctx.font="10px "+FF;ctx.fillStyle='#aaa';
    ctx.textAlign='left';ctx.fillText('분류',26,y+13);
    ctx.textAlign='right';ctx.fillText('예산대비',xBud,y+13);ctx.fillText('증감',xChg,y+13);
    ctx.textAlign='left';
    y+=cmpHeadRowH;
    function cellText(c){return c?((c.dir?c.dir+' ':'')+(c.pct>0&&c.dir==='▲'?'+':'')+Math.abs(c.pct)+'%'):'–';}
    function drawRow(r,bold,bg){
      if(bg){ctx.fillStyle=bg;ctx.fillRect(24,y,W-48,cmpRowH);}
      ctx.font=(bold?"700 11.5px ":"11.5px ")+FF;
      ctx.textAlign='left';ctx.fillStyle=bold?'#111':'#333';
      ctx.fillText(fitText(r.cat,W-48-110-14),30,y+15);
      ctx.textAlign='right';
      ctx.fillStyle=r.bud?col(r.bud.color):'#ccc';ctx.fillText(cellText(r.bud),xBud,y+15);
      ctx.fillStyle=r.chg?col(r.chg.color):'#ccc';ctx.fillText(cellText(r.chg),xChg,y+15);
      ctx.textAlign='left';
      y+=cmpRowH;
    }
    var HDBG={fix:'#e9ecf7',var:'#fbeae4',etc:'rgba(0,0,0,.045)'};
    var SUMBG={fix:'#dfe4f4',var:'#f7ded4',etc:'rgba(0,0,0,.03)'};
    cp.groups.forEach(function(gp){
      ctx.fillStyle=HDBG[gp.key];ctx.fillRect(24,y,W-48,cmpRowH);
      ctx.fillStyle='#333';ctx.font="700 11.5px "+FF;ctx.textAlign='left';
      ctx.fillText(gp.label,30,y+15);
      y+=cmpRowH;
      gp.rows.forEach(function(r){drawRow(r,false,null);});
      drawRow(gp.sum,true,SUMBG[gp.key]);
    });
    if(cp.total)drawRow(cp.total,true,'#dceee6');
    y+=secGap;
  })();
  (function(){
    var gaugeColor=data.overAll?'#d9534f':ac;
    var bigPct=data.overallPct===null?'–':data.overallPct+'%';
    if(_certRsImg.naturalWidth>0&&_certRsMaskImg.naturalWidth>0){
      var gw=132,gh=gw*(_certRsImg.naturalHeight/_certRsImg.naturalWidth),gap=20;
      ctx.font="14px "+FF;var labelW=ctx.measureText('전체 예산 사용률').width;
      ctx.font="700 46px "+FF;var pctW=ctx.measureText(bigPct).width;
      var textW=Math.max(labelW,pctW);
      var groupW=gw+gap+textW,groupX=(W-groupW)/2,textX=groupX+gw+gap;
      var gauge=certGaugeCanvas(gw,gh,data.overallPct,gaugeColor,'#e7ded0');
      ctx.drawImage(gauge,groupX,y+(topH-gh)/2,gw,gh);
      var textCY=y+topH/2;
      ctx.textAlign='left';
      ctx.fillStyle='#888';ctx.font="14px "+FF;ctx.fillText('전체 예산 사용률',textX,textCY-14);
      ctx.fillStyle=gaugeColor;ctx.font="700 46px "+FF;ctx.fillText(bigPct,textX,textCY+32);
    }else{
      ctx.fillStyle='#888';ctx.font="13px "+FF;ctx.textAlign='left';ctx.fillText('전체 예산 사용률',24,y+18);
      ctx.fillStyle=gaugeColor;ctx.font="700 32px "+FF;ctx.textAlign='right';ctx.fillText(bigPct,W-24,y+38);
      ctx.textAlign='left';
      var barY2=y+52,barH2=10;
      ctx.fillStyle='#eee';ctx.fillRect(24,barY2,W-48,barH2);
      if(data.overallPct!==null){var fillW=Math.max(0,Math.min(100,data.overallPct))/100*(W-48);ctx.fillStyle=data.overAll?'#e07a7a':ac;ctx.fillRect(24,barY2,fillW,barH2);}
    }
  })();
  y+=topH;
  (function(){
    var cd=data.chart;if(!cd||!cd.dates.length)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('지출 흐름',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    var cy=y+secHeadH,ch=chartBarH;
    var n=cd.dates.length;var plotW=W-48;var slotW=plotW/n;var barW=Math.max(2,slotW*0.6);
    var maxV=0;for(var i=0;i<n;i++){maxV=Math.max(maxV,cd.fix[i]+cd.vr[i],cd.bud[i]||0);}if(maxV<=0)maxV=1;
    var fixColor=groupColor('고정'),varColor=groupColor('변동'),budColor=(typeof budgetLineColor==='function')?budgetLineColor():ac;
    var pts=[];
    for(var j=0;j<n;j++){
      var slotX=24+j*slotW;var barX=slotX+(slotW-barW)/2;
      var fH=(cd.fix[j]/maxV)*ch,vH=(cd.vr[j]/maxV)*ch;
      var by=cy+ch;
      if(vH>0){ctx.fillStyle=varColor;ctx.fillRect(barX,by-vH,barW,vH);by-=vH;}
      if(fH>0){ctx.fillStyle=fixColor;ctx.fillRect(barX,by-fH,barW,fH);}
      var bv=cd.bud[j]||0;pts.push({x:slotX+slotW/2,y:cy+ch-Math.min(1,bv/maxV)*ch});
      if(cd.labels[j]!=null&&(n<=7||j%5===0||j===n-1)){ctx.fillStyle='#aaa';ctx.font="10px "+FF;ctx.textAlign='center';ctx.fillText(cd.labels[j],slotX+slotW/2,cy+ch+chartLabelH-4);}
    }
    var hasBud=cd.bud.some(function(v){return v>0;});
    if(hasBud){
      ctx.save();ctx.setLineDash([4,3]);ctx.strokeStyle=budColor;ctx.lineWidth=1.5;ctx.beginPath();
      pts.forEach(function(p,idx){if(idx===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
      ctx.stroke();ctx.restore();
    }
    ctx.textAlign='left';
    y+=chartH;
  })();
  (function(){
    var dn=data.donut;if(!dn||!dn.items.length)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('카테고리별 지출 비중',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    var rOuter=donutR,rInner=donutR*0.55,gap=19;
    var contentH=Math.max(rOuter*2,dn.leftN*gap,dn.rightN*gap)+18;
    var cx=W/2+dn.shift,cy=y+contentH/2;
    dn.items.forEach(function(it){
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,rOuter,it.startA,it.endA);ctx.closePath();
      ctx.fillStyle=catColor(it.cat);ctx.fill();
    });
    ctx.beginPath();ctx.arc(cx,cy,rInner,0,Math.PI*2);ctx.fillStyle='#fbf8f3';ctx.fill();
    var labelR=(rOuter+rInner)/2;
    dn.bigItems.forEach(function(it){
      var lx=cx+Math.cos(it.mid)*labelR,ly=cy+Math.sin(it.mid)*labelR;
      ctx.textAlign='center';
      ctx.fillStyle='#fff';ctx.font="12px "+FF;ctx.fillText(it.cat,lx,ly-2);
      ctx.font="11px "+FF;ctx.fillText(it.pct+'%',lx,ly+12);
    });
    var topB=cy-contentH/2+8,botB=cy+contentH/2-8;
    function layoutSide(items){
      var arr=items.map(function(it){var p1x=cx+Math.cos(it.mid)*rOuter,p1y=cy+Math.sin(it.mid)*rOuter;return {it:it,p1x:p1x,p1y:p1y,labelY:p1y};});
      arr.sort(function(a,b){return a.p1y-b.p1y;});
      for(var i=1;i<arr.length;i++){if(arr[i].labelY<arr[i-1].labelY+gap)arr[i].labelY=arr[i-1].labelY+gap;}
      if(arr.length){var over=arr[arr.length-1].labelY-botB;if(over>0)arr.forEach(function(a){a.labelY-=over;});var under=topB-arr[0].labelY;if(under>0)arr.forEach(function(a){a.labelY+=under;});}
      return arr;
    }
    var leftArr=layoutSide(dn.smallItems.filter(function(e){return e.side==='left';}));
    var rightArr=layoutSide(dn.smallItems.filter(function(e){return e.side==='right';}));
    ctx.font="11px "+FF;
    function drawSide(arr,side){
      arr.forEach(function(o){
        var kneeX=(side==='right')?(cx+rOuter+16):(cx-rOuter-16);
        ctx.strokeStyle=catColor(o.it.cat);ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(o.p1x,o.p1y);ctx.lineTo(kneeX,o.labelY);ctx.stroke();
        var tx=(side==='right')?(kneeX+6):(kneeX-6);
        var avail=(side==='right')?(W-24-tx):(tx-24);
        var pctStr=o.it.pct+'%';var disp=o.it.cat;var whole=disp+' '+pctStr;
        while(ctx.measureText(whole).width>avail&&disp.length>1){disp=disp.slice(0,-1);whole=disp+'… '+pctStr;}
        if(disp!==o.it.cat)disp=disp+'…';
        var name=disp+' ';
        if(side==='right'){
          ctx.textAlign='left';
          ctx.fillStyle='#666';ctx.fillText(name,tx,o.labelY+4);
          var nw=ctx.measureText(name).width;
          ctx.fillStyle=catColor(o.it.cat);ctx.font="600 11px "+FF;ctx.fillText(pctStr,tx+nw,o.labelY+4);ctx.font="11px "+FF;
        }else{
          ctx.textAlign='right';
          ctx.fillStyle=catColor(o.it.cat);ctx.font="600 11px "+FF;ctx.fillText(pctStr,tx,o.labelY+4);ctx.font="11px "+FF;
          var pw=ctx.measureText(pctStr).width;
          ctx.fillStyle='#666';ctx.fillText(name,tx-pw,o.labelY+4);
        }
      });
    }
    drawSide(leftArr,'left');drawSide(rightArr,'right');
    ctx.textAlign='left';
    y+=contentH+secGap;
  })();
  function drawSection(title,items){
    if(!items.length)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText(title,24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    items.forEach(function(it){
      var color=catColor(it.cat);
      ctx.beginPath();ctx.arc(28,y+9,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.fillStyle='#333';ctx.font="600 14px "+FF;ctx.textAlign='left';ctx.fillText(it.cat,40,y+13);
      ctx.fillStyle=it.over?'#d9534f':'#111';ctx.font="700 14px "+FF;ctx.textAlign='right';ctx.fillText((it.over?'\u26A0 ':'')+it.pct+'%',W-24,y+13);
      ctx.textAlign='left';
      var mbY=y+18,mbH=6;
      ctx.fillStyle='#eee';ctx.fillRect(40,mbY,W-64,mbH);
      var mw=Math.max(0,Math.min(100,it.pct))/100*(W-64);
      ctx.fillStyle=color;ctx.fillRect(40,mbY,mw,mbH);
      y+=rowH;
    });
    y+=secGap;
  }
  drawSection('고정지출',data.fixed);
  drawSection('변동지출',data.variable);
  (function(){
    var rv=data.review;if(!rv)return;
    var hasTal=(rv.carrot>0||rv.whip>0);
    var hasAny=hasTal||rv.carrotNoteLines.length||rv.whipNoteLines.length||rv.memoLines.length||rv.bestLines.length||rv.worstLines.length;
    if(!hasAny)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('되돌아보기',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    if(hasTal){
      ctx.fillStyle='#333';ctx.font="600 13px "+FF;ctx.textAlign='left';
      var t1='\uD83E\uDD55 당근 '+rv.carrot+'일';
      ctx.fillText(t1,24,y+16);
      var wx=24+ctx.measureText(t1).width+16;
      if(_certWhipImg&&_certWhipImg.naturalWidth>0){
        var ih=14,iw=ih*(_certWhipImg.naturalWidth/_certWhipImg.naturalHeight);
        ctx.drawImage(_certWhipImg,wx,y+16-ih*0.82,iw,ih);
        wx+=iw+4;
      }
      ctx.fillText('채찍 '+rv.whip+'일',wx,y+16);
      y+=reviewRowH;
    }
    function drawTextBlock(icon,label,lines,useWhipImg){
      if(!lines.length)return;
      ctx.fillStyle='#888';ctx.font="600 12px "+FF;ctx.textAlign='left';
      var lx=24;
      if(useWhipImg&&_certWhipImg&&_certWhipImg.naturalWidth>0){
        var ih=13,iw=ih*(_certWhipImg.naturalWidth/_certWhipImg.naturalHeight);
        ctx.drawImage(_certWhipImg,lx,y+2,iw,ih);
        lx+=iw+4;
      }else if(icon){
        ctx.fillText(icon,lx,y+12);
        lx+=ctx.measureText(icon).width+4;
      }
      ctx.fillText(label,lx,y+12);
      y+=reviewHeadH;
      ctx.fillStyle='#333';ctx.font="13px "+FF;
      lines.forEach(function(ln){ctx.fillText(ln,24,y+13);y+=reviewLineH;});
      y+=reviewBlockGap;
    }
    drawTextBlock('\uD83E\uDD55 ','당근',rv.carrotNoteLines,false);
    drawTextBlock(null,'채찍',rv.whipNoteLines,true);
    drawTextBlock('\uD83D\uDCDD ','회고',rv.memoLines,false);
    drawTextBlock('\uD83C\uDFC6 ','베스트',rv.bestLines,false);
    drawTextBlock('\uD83D\uDCB8 ','워스트',rv.worstLines,false);
    y+=secGap;
  })();
  return cv;
}
/* ── 인증 드롭다운(정산/예산) ───────────────────────── */
function closeCertMenus(){var ms=document.querySelectorAll('.certmenu');for(var i=0;i<ms.length;i++)ms[i].classList.remove('on');}
function toggleCertMenu(ev,scope){
  if(ev){ev.stopPropagation();}
  var m=g(scope==='weekly'?'certMenuWeekly':'certMenuMonthly');if(!m)return;
  var wasOpen=m.classList.contains('on');
  closeCertMenus();
  if(!wasOpen)m.classList.add('on');
}
function pickCert(scope,kind){closeCertMenus();openCertCapture(scope,kind);}
document.addEventListener('click',function(){closeCertMenus();});

/* ── 예산 인증 데이터 (금액 미표시 — 전체 예산 대비 비중 %만) ── */
function certBudgetData(scope,dateStr){
  if(!dailyTree)loadDailyCats();
  var items=[];
  dailyCats.forEach(function(c){
    if(typeof dlCatDeleted==='function'&&dlCatDeleted(c))return;  /* 삭제된 분류 제외 (rs_complete) */
    var bd=effCatBudget(scope,c,dateStr);
    if(bd<=0)return;
    items.push({cat:c,amt:bd,grp:catGroupOf(c)});
  });
  var total=items.reduce(function(s,it){return s+it.amt;},0);
  if(total<=0)return {total:0,fixed:[],variable:[],fixPct:0,varPct:0,donut:null,chart:null};
  items.forEach(function(it){it.pct=Math.round(it.amt/total*100);it.frac=it.amt/total;});
  function bySize(a,b){return b.amt-a.amt;}
  var fixed=items.filter(function(it){return it.grp==='고정';}).sort(bySize);
  var variable=items.filter(function(it){return it.grp!=='고정';}).sort(bySize);
  var fixSum=fixed.reduce(function(s,it){return s+it.amt;},0);
  var fixPct=Math.round(fixSum/total*100);
  return {
    total:total,fixed:fixed,variable:variable,
    fixPct:fixPct,varPct:100-fixPct,
    donut:certBudgetDonutData(items,total),
    chart:(scope==='weekly')?certBudgetChart(dateStr,total):null   /* 주간만 일별 막대+예산 점선 */
  };
}
/* 주간 예산 점선: 일별 예산이 있으면 그대로, 없으면 주간 총예산을 7일 균등 배분 */
function certBudgetChart(dateStr,total){
  var cd=certChartData('weekly',dateStr);
  var hasDaily=cd.bud.some(function(v){return v>0;});
  if(!hasDaily&&total>0){
    var per=total/7;
    cd.bud=cd.bud.map(function(){return per;});
    cd.evenSplit=true;
  }
  return cd;
}
/* 도넛 기하 — 정산 도넛과 같은 규칙(작은 조각 6% 미만은 리더선) */
function certBudgetDonutData(items,total){
  var sorted=items.slice().sort(function(a,b){return b.frac-a.frac;});
  var THRESH=0.06,start=-Math.PI/2;
  var full=sorted.map(function(it){
    var end=start+it.frac*Math.PI*2;var mid=(start+end)/2;
    var e={cat:it.cat,pct:it.pct,frac:it.frac,startA:start,endA:end,mid:mid};
    start=end;return e;
  });
  var smallItems=full.filter(function(e){return e.frac<THRESH;});
  smallItems.forEach(function(e){e.side=(Math.cos(e.mid)<0)?'left':'right';});
  var leftN=smallItems.filter(function(e){return e.side==='left';}).length;
  var rightN=smallItems.filter(function(e){return e.side==='right';}).length;
  return {total:total,items:full,
    bigItems:full.filter(function(e){return e.frac>=THRESH;}),
    smallItems:smallItems,leftN:leftN,rightN:rightN,
    shift:Math.max(-14,Math.min(14,(leftN-rightN)*7))};
}
/* ── 예산 인증 캔버스 (금액은 어디에도 그리지 않는다) ── */
function buildBudgetCanvas(scope,dateStr,data){
  var cs=getComputedStyle(document.body);
  var ac=(cs.getPropertyValue('--ac')||'').trim()||'#b3315a';
  var W=380,R=3;
  var scopeLabel=scope==='weekly'?'주간':'월간';
  var periodLabel='';
  if(scope==='weekly'){
    var st=weekStartMon(dateStr),en=new Date(st.getFullYear(),st.getMonth(),st.getDate()+6);
    periodLabel=(st.getMonth()+1)+'/'+st.getDate()+' – '+(en.getMonth()+1)+'/'+en.getDate();
  }else{
    var mk=monthKey(dateStr),mp=mk.split('-');
    periodLabel=mp[0]+'년 '+parseInt(mp[1],10)+'월';
  }
  var FF="'Pretendard','Noto Sans KR',sans-serif";var SERIF="'Cormorant Garamond',serif";
  var headerH=88,topH=118,rowH=32,secHeadH=34,secGap=20,footH=16;
  var chartBarH=86,chartLabelH=18,chartH=secHeadH+chartBarH+chartLabelH+secGap;
  var donutR=84;
  function secH(items){return items.length?(secHeadH+items.length*rowH+secGap):0;}
  function donutH(dn){if(!dn||!dn.items.length)return 0;var gap=19;return secHeadH+Math.max(donutR*2,dn.leftN*gap,dn.rightN*gap)+18+secGap;}
  var H=headerH+topH+(data.chart?chartH:0)+donutH(data.donut)+secH(data.fixed)+secH(data.variable)+footH;

  var cv=document.createElement('canvas');
  cv.width=W*R;cv.height=H*R;cv.style.width='100%';cv.style.maxWidth=W+'px';cv.style.height='auto';cv.style.display='block';
  var ctx=cv.getContext('2d');ctx.scale(R,R);
  ctx.fillStyle='#fbf8f3';ctx.fillRect(0,0,W,H);
  ctx.fillStyle=ac;ctx.fillRect(0,0,W,6);
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#999';ctx.font="600 13px "+SERIF;ctx.textAlign='left';ctx.fillText('RICHSISTER 부자언니',24,36);
  ctx.fillStyle='#111';ctx.font="700 21px "+FF;ctx.fillText(scopeLabel+' 예산 인증',24,64);
  ctx.fillStyle='#999';ctx.font="13px "+FF;ctx.textAlign='right';ctx.fillText(periodLabel,W-24,64);
  ctx.textAlign='left';ctx.strokeStyle='#e8e2d8';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(24,80);ctx.lineTo(W-24,80);ctx.stroke();
  var y=headerH;

  /* 예산 구성: 고정 vs 변동 (100% 스택바) */
  (function(){
    var fixColor=groupColor('고정'),varColor=groupColor('변동');
    ctx.fillStyle='#888';ctx.font="13px "+FF;ctx.textAlign='left';ctx.fillText('예산 구성',24,y+18);
    ctx.textAlign='right';
    ctx.fillStyle=fixColor;ctx.font="700 15px "+FF;
    var t1='고정 '+data.fixPct+'%';var t2='변동 '+data.varPct+'%';
    var w2=ctx.measureText(t2).width;
    ctx.fillStyle=varColor;ctx.fillText(t2,W-24,y+18);
    ctx.fillStyle=fixColor;ctx.fillText(t1,W-24-w2-12,y+18);
    ctx.textAlign='left';
    var barY=y+34,barH=14;
    var fw=(W-48)*data.fixPct/100;
    ctx.fillStyle=fixColor;ctx.fillRect(24,barY,fw,barH);
    ctx.fillStyle=varColor;ctx.fillRect(24+fw,barY,(W-48)-fw,barH);
    ctx.fillStyle='#aaa';ctx.font="11px "+FF;
    ctx.fillText('금액은 가렸어요 · 비중(%)만 보여요',24,y+70);
  })();
  y+=topH;

  /* 주간: 일별 막대 + 예산 점선 */
  (function(){
    var cd=data.chart;if(!cd||!cd.dates.length)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('일별 예산선',24,y+14);
    if(cd.evenSplit){ctx.textAlign='right';ctx.font="10px "+FF;ctx.fillText('주간 예산 ÷ 7일',W-24,y+14);ctx.textAlign='left';}
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    var cy=y+secHeadH,ch=chartBarH;
    var n=cd.dates.length,plotW=W-48,slotW=plotW/n,barW=Math.max(2,slotW*0.6);
    var maxV=0;for(var i=0;i<n;i++){maxV=Math.max(maxV,cd.fix[i]+cd.vr[i],cd.bud[i]||0);}
    if(maxV<=0)maxV=1;
    var fixColor=groupColor('고정'),varColor=groupColor('변동');
    var budColor=(typeof budgetLineColor==='function')?budgetLineColor():ac;
    var pts=[];
    for(var j=0;j<n;j++){
      var slotX=24+j*slotW,barX=slotX+(slotW-barW)/2;
      var fH=(cd.fix[j]/maxV)*ch,vH=(cd.vr[j]/maxV)*ch,by=cy+ch;
      if(vH>0){ctx.fillStyle=varColor;ctx.fillRect(barX,by-vH,barW,vH);by-=vH;}
      if(fH>0){ctx.fillStyle=fixColor;ctx.fillRect(barX,by-fH,barW,fH);}
      var bv=cd.bud[j]||0;pts.push({x:slotX+slotW/2,y:cy+ch-Math.min(1,bv/maxV)*ch});
      if(cd.labels[j]!=null){ctx.fillStyle='#aaa';ctx.font="10px "+FF;ctx.textAlign='center';ctx.fillText(cd.labels[j],slotX+slotW/2,cy+ch+chartLabelH-4);}
    }
    if(cd.bud.some(function(v){return v>0;})){
      ctx.save();ctx.setLineDash([4,3]);ctx.strokeStyle=budColor;ctx.lineWidth=1.5;ctx.beginPath();
      pts.forEach(function(p,idx){if(idx===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
      ctx.stroke();ctx.restore();
    }
    ctx.textAlign='left';
    y+=chartH;
  })();

  /* 분류별 예산 비중 도넛 */
  (function(){
    var dn=data.donut;if(!dn||!dn.items.length)return;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText('분류별 예산 비중',24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    var rOuter=donutR,rInner=donutR*0.55,gap=19;
    var contentH=Math.max(rOuter*2,dn.leftN*gap,dn.rightN*gap)+18;
    var cx=W/2+dn.shift,cy=y+contentH/2;
    dn.items.forEach(function(it){
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,rOuter,it.startA,it.endA);ctx.closePath();
      ctx.fillStyle=catColor(it.cat);ctx.fill();
    });
    ctx.beginPath();ctx.arc(cx,cy,rInner,0,Math.PI*2);ctx.fillStyle='#fbf8f3';ctx.fill();
    var labelR=(rOuter+rInner)/2;
    dn.bigItems.forEach(function(it){
      var lx=cx+Math.cos(it.mid)*labelR,ly=cy+Math.sin(it.mid)*labelR;
      ctx.textAlign='center';
      ctx.fillStyle='#fff';ctx.font="12px "+FF;ctx.fillText(it.cat,lx,ly-2);
      ctx.font="11px "+FF;ctx.fillText(it.pct+'%',lx,ly+12);
    });
    var topB=cy-contentH/2+8,botB=cy+contentH/2-8;
    function layoutSide(items){
      var arr=items.map(function(it){return {it:it,p1x:cx+Math.cos(it.mid)*rOuter,p1y:cy+Math.sin(it.mid)*rOuter,labelY:cy+Math.sin(it.mid)*rOuter};});
      arr.sort(function(a,b){return a.p1y-b.p1y;});
      for(var i=1;i<arr.length;i++){if(arr[i].labelY<arr[i-1].labelY+gap)arr[i].labelY=arr[i-1].labelY+gap;}
      if(arr.length){
        var over=arr[arr.length-1].labelY-botB;if(over>0)arr.forEach(function(a){a.labelY-=over;});
        var under=topB-arr[0].labelY;if(under>0)arr.forEach(function(a){a.labelY+=under;});
      }
      return arr;
    }
    var leftArr=layoutSide(dn.smallItems.filter(function(e){return e.side==='left';}));
    var rightArr=layoutSide(dn.smallItems.filter(function(e){return e.side==='right';}));
    ctx.font="11px "+FF;
    function drawSide(arr,side){
      arr.forEach(function(o){
        var kneeX=(side==='right')?(cx+rOuter+16):(cx-rOuter-16);
        ctx.strokeStyle=catColor(o.it.cat);ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(o.p1x,o.p1y);ctx.lineTo(kneeX,o.labelY);ctx.stroke();
        var tx=(side==='right')?(kneeX+6):(kneeX-6);
        var avail=(side==='right')?(W-24-tx):(tx-24);
        var pctStr=o.it.pct+'%',disp=o.it.cat,whole=disp+' '+pctStr;
        while(ctx.measureText(whole).width>avail&&disp.length>1){disp=disp.slice(0,-1);whole=disp+'… '+pctStr;}
        if(disp!==o.it.cat)disp=disp+'…';
        var name=disp+' ';
        if(side==='right'){
          ctx.textAlign='left';
          ctx.fillStyle='#666';ctx.fillText(name,tx,o.labelY+4);
          var nw=ctx.measureText(name).width;
          ctx.fillStyle=catColor(o.it.cat);ctx.font="600 11px "+FF;ctx.fillText(pctStr,tx+nw,o.labelY+4);ctx.font="11px "+FF;
        }else{
          ctx.textAlign='right';
          ctx.fillStyle=catColor(o.it.cat);ctx.font="600 11px "+FF;ctx.fillText(pctStr,tx,o.labelY+4);ctx.font="11px "+FF;
          var pw=ctx.measureText(pctStr).width;
          ctx.fillStyle='#666';ctx.fillText(name,tx-pw,o.labelY+4);
        }
      });
    }
    drawSide(leftArr,'left');drawSide(rightArr,'right');
    ctx.textAlign='left';
    y+=contentH+secGap;
  })();

  /* 고정·변동 분류별 비중 바 (막대는 최대 항목 기준 상대 길이 — 금액 아님) */
  function drawSection(title,items){
    if(!items.length)return;
    var maxPct=items.reduce(function(m,it){return Math.max(m,it.pct);},0)||1;
    ctx.fillStyle='#aaa';ctx.font="600 12px "+FF;ctx.textAlign='left';ctx.fillText(title,24,y+14);
    ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(24,y+22);ctx.lineTo(W-24,y+22);ctx.stroke();
    y+=secHeadH;
    items.forEach(function(it){
      var color=catColor(it.cat);
      ctx.beginPath();ctx.arc(28,y+9,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.fillStyle='#333';ctx.font="600 14px "+FF;ctx.textAlign='left';ctx.fillText(it.cat,40,y+13);
      ctx.fillStyle='#111';ctx.font="700 14px "+FF;ctx.textAlign='right';ctx.fillText(it.pct+'%',W-24,y+13);
      ctx.textAlign='left';
      var mbY=y+18,mbH=6;
      ctx.fillStyle='#eee';ctx.fillRect(40,mbY,W-64,mbH);
      ctx.fillStyle=color;ctx.fillRect(40,mbY,(it.pct/maxPct)*(W-64),mbH);
      y+=rowH;
    });
    y+=secGap;
  }
  drawSection('고정지출 예산',data.fixed);
  drawSection('변동지출 예산',data.variable);
  return cv;
}

function openCertCapture(scope,kind){
  kind=kind||'settle';
  var btn=g(scope==='weekly'?'certBtnWeekly':'certBtnMonthly');
  var dd=dailyDate||todayStr();
  var data;
  if(kind==='budget'){
    data=certBudgetData(scope,dd);
    if(!data.total){showToast('예산을 먼저 세워야 인증할 수 있어요');return;}
  }else{
    var includeSettle=(scope==='monthly'&&typeof dlMoSettleOpen!=='undefined'&&dlMoSettleOpen);
    data=certBuildData(scope,dd,includeSettle);
    if(data.overallPct===null&&!data.fixed.length&&!data.variable.length){showToast('예산을 먼저 세워야 인증할 수 있어요');return;}
  }
  var origLabel=btn?btn.innerHTML:'';
  if(btn){btn.textContent='캡처 중...';btn.disabled=true;}
  Promise.all([_certWhipReady(),_certRsReady()]).then(function(){
    var cv=(kind==='budget')?buildBudgetCanvas(scope,dd,data):buildCertCanvas(scope,dd,data);
    cv.toBlob(function(blob){
      if(!blob){if(btn){btn.innerHTML=origLabel;btn.disabled=false;}return;}
      function doFallback(){
        var a=document.createElement('a');a.download='richsister_'+scope+'_'+(kind==='budget'?'예산':'정산')+'인증.png';a.href=cv.toDataURL('image/png');a.click();
        if(btn){btn.textContent='저장됨!';btn.disabled=false;setTimeout(function(){btn.innerHTML=origLabel;},2000);}
        showToast('클립보드 복사가 지원되지 않아 이미지로 저장했어요.');
      }
      if(navigator.clipboard&&window.ClipboardItem){
        navigator.clipboard.write([new ClipboardItem({'image/png':blob})]).then(function(){
          if(btn){btn.textContent='복사됨!';btn.disabled=false;setTimeout(function(){btn.innerHTML=origLabel;},2000);}
          showToast('클립보드에 복사했어요. 바로 붙여넣기 해보세요!');
        }).catch(doFallback);
      }else{doFallback();}
    },'image/png');
  });
}

function weekEntries(dateStr){var start=weekStartMon(dateStr);var s=localDateStr(start);var e=localDateStr(new Date(start.getFullYear(),start.getMonth(),start.getDate()+6));return dailyData.filter(function(x){return x.date>=s&&x.date<=e&&!dlIsMonthSum(x);});}
function monthEntries(dateStr){var pre=monthKey(dateStr);return dailyData.filter(function(x){return monthKey(x.date)===pre;});}
function budgetLineColor(){var c=' '+(document.body.className||'')+' ';if(c.indexOf(' fiesta ')>=0)return '#FF1FA2';if(c.indexOf(' clay2 ')>=0)return '#00C2D6';if(c.indexOf(' clay ')>=0)return '#FF7A29';if(c.indexOf(' mint ')>=0)return '#FF3D9A';return '#7C3AED';}
/* ── 🍚 주간 식단 & 장보기 (rs_meal / rs_meal_on · 기본 숨김) ─────
   메모 줄(식단) + 금액 줄(장보기: 품목+금액, 기본 5줄) → 일별·주간 예상 합계 →
   「주간 예산에 반영」으로 그 주·그 분류 예산만 설정. 지출로는 넣지 않는다(§2.10).
   줄 구성은 주마다 독립(추가·삭제는 보고 있는 그 주에만 적용 — G1). */
var mealData=null;
var MEAL_DEFAULT=[{id:'b',label:'아침',type:'memo'},{id:'l',label:'점심',type:'memo'},{id:'d',label:'저녁',type:'memo'},
 {id:'s1',label:'🛒 장보기',type:'cost',grp:'s'},{id:'s2',label:'',type:'cost',grp:'s'},{id:'s3',label:'',type:'cost',grp:'s'},
 {id:'s4',label:'',type:'cost',grp:'s'},{id:'s5',label:'',type:'cost',grp:'s'}];
var MEAL_LOCK={b:1,l:1,d:1};
function mealDefRows(){return MEAL_DEFAULT.map(function(r){return {id:r.id,label:r.label,type:r.type,grp:r.grp};});}
function loadMeal(){var v=null;try{v=JSON.parse(localStorage.getItem('rs_meal')||'null');}catch(e){}mealData=(v&&typeof v==='object')?v:{};
  if(!mealData.weeks||typeof mealData.weeks!=='object')mealData.weeks={};
  if(!mealData.cells||typeof mealData.cells!=='object')mealData.cells={};
  if(!mealData.amts||typeof mealData.amts!=='object')mealData.amts={};
  if(!mealData.cats||typeof mealData.cats!=='object')mealData.cats={};
  mealMigrate();}
function mealMigrate(){if(mealData.v===2)return;var ch=false;
  ['cells','amts'].forEach(function(k){var m=mealData[k]||{};Object.keys(m).forEach(function(ds){
    if(m[ds]&&m[ds]['s']!==undefined){m[ds]['s1']=m[ds]['s'];delete m[ds]['s'];ch=true;}});});
  Object.keys(mealData.weeks).forEach(function(wk){var w=mealData.weeks[wk];if(!w||!Array.isArray(w.rows))return;
    var ex=w.rows.filter(function(r){return r&&r.id!=='s';}).map(function(r){
      var o={id:r.id,label:r.label,type:(r.type==='cost'?'cost':'memo')};if(o.type==='cost')o.grp=r.grp||r.id;return o;});
    w.rows=mealDefRows().concat(ex);ch=true;});
  mealData.v=2;if(ch||true)saveMeal();}
function saveMeal(){try{lsSet('rs_meal',JSON.stringify(mealData));}catch(e){}}
function mealOn(){try{return localStorage.getItem('rs_meal_on')==='1';}catch(e){return false;}}
function applyMealOn(){['mealToggleBtn','mealToggleBtn2'].forEach(function(id){var b=g(id);if(b)b.textContent=mealOn()?'표시':'숨김';});var box=g('dlMeal');if(box&&!mealOn())box.innerHTML='';}
function toggleMealOn(){var on=mealOn();try{lsSet('rs_meal_on',on?'0':'1');}catch(e){}applyMealOn();if(mealOn())renderMeal();}
function mealWkKey(dateStr){return localDateStr(weekStartMon(dateStr||dailyDate||todayStr()));}
function mealDatesOf(wk){var p=wk.split('-');var st=new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));var out=[];for(var i=0;i<7;i++)out.push(localDateStr(new Date(st.getFullYear(),st.getMonth(),st.getDate()+i)));return out;}
function mealPrevWk(wk){var p=wk.split('-');return localDateStr(new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2])-7));}
function mealRows(wk){if(!mealData)loadMeal();var w=mealData.weeks[wk];return (w&&Array.isArray(w.rows)&&w.rows.length)?w.rows:mealDefRows();}
function mealOwnRows(wk){if(!mealData)loadMeal();if(!mealData.weeks[wk]||!Array.isArray(mealData.weeks[wk].rows)||!mealData.weeks[wk].rows.length)mealData.weeks[wk]={rows:mealDefRows()};return mealData.weeks[wk].rows;}
function mealCell(ds,rid){if(!mealData)loadMeal();var c=mealData.cells[ds];return (c&&c[rid])?c[rid]:'';}
function mealAmt(ds,rid){if(!mealData)loadMeal();var a=mealData.amts[ds];return (a&&a[rid])?(parseFloat(a[rid])||0):0;}
function mealWriteCell(ds,rid,v){if(!mealData)loadMeal();if(v==null||String(v).trim()===''){if(mealData.cells[ds]){delete mealData.cells[ds][rid];if(!Object.keys(mealData.cells[ds]).length)delete mealData.cells[ds];}return;}if(!mealData.cells[ds])mealData.cells[ds]={};mealData.cells[ds][rid]=String(v);}
function mealWriteAmt(ds,rid,n){if(!mealData)loadMeal();n=parseFloat(n)||0;if(n<=0){if(mealData.amts[ds]){delete mealData.amts[ds][rid];if(!Object.keys(mealData.amts[ds]).length)delete mealData.amts[ds];}return;}if(!mealData.amts[ds])mealData.amts[ds]={};mealData.amts[ds][rid]=n;}
function mealSet(el){if(!el||!el.dataset)return;var ds=el.dataset.ds,rid=el.dataset.rid;if(!ds||!rid)return;clearTimeout(mealSetSoon._t);mealWriteCell(ds,rid,el.value);saveMeal();}
function mealSetSoon(el){clearTimeout(mealSetSoon._t);mealSetSoon._t=setTimeout(function(){mealSet(el);},400);}
function mealSetAmt(el){if(!el||!el.dataset)return;var ds=el.dataset.ds,rid=el.dataset.rid;if(!ds||!rid)return;
  mealWriteAmt(ds,rid,String(el.value).replace(/[^0-9.]/g,''));saveMeal();mealRefreshSums();}
function mealDaySum(wk,ds){var s=0;mealRows(wk).forEach(function(r){if(r.type==='cost')s+=mealAmt(ds,r.id);});return s;}
function mealWeekSum(wk){var s=0;mealDatesOf(wk).forEach(function(ds){s+=mealDaySum(wk,ds);});return s;}
function mealRefreshSums(){var box=g('dlMeal');if(!box)return;var wk=mealWkKey(),dates=mealDatesOf(wk);
  var cells=box.querySelectorAll('.meal-sumc');
  for(var i=0;i<cells.length&&i<dates.length;i++){var v=mealDaySum(wk,dates[i]);cells[i].textContent=v>0?fmtComma(v):'-';}
  var tot=box.querySelector('.meal-tot');if(tot)tot.textContent=fmtComma(mealWeekSum(wk));}
function mealWeekHasData(wk){var ds=mealDatesOf(wk),rows=mealRows(wk),i,j;
  for(i=0;i<ds.length;i++)for(j=0;j<rows.length;j++){if(mealCell(ds[i],rows[j].id).trim()!==''||mealAmt(ds[i],rows[j].id)>0)return true;}
  return !!(mealData.weeks[wk]&&Array.isArray(mealData.weeks[wk].rows)&&mealData.weeks[wk].rows.length!==MEAL_DEFAULT.length);}
function mealNewId(){return 'r'+Date.now().toString(36)+Math.floor(Math.random()*100);}
/* 줄 추가·이름변경·삭제 — 모두 보고 있는 그 주에만 적용(G1) */
var MEAL_ADD_OPTS=['메모 줄 · 식단처럼 글만 적어요','금액 줄 · 품목과 금액을 적어요'];
function mealAddRow(type){var wk=mealWkKey(),rows=mealOwnRows(wk);
  if(rows.length>=24){showToast('줄이 너무 많아요');return;}
  if(type==='memo'||type==='cost'){mealAddRowNamed(type,rows);return;}
  rsPromptSelect('어떤 줄을 추가할까요?',MEAL_ADD_OPTS,function(v){
    mealAddRowNamed(/금액/.test(String(v))?'cost':'memo',rows);},{desc:'이번 주에만 추가돼요.'});}
function mealAddRowNamed(type,rows){
  if(type==='cost'){
    rsPrompt('추가할 금액 줄 이름',{placeholder:'예: 생필품',desc:'품목과 금액을 적는 줄이에요.'},function(v){
      v=(v||'').trim();if(!v)return;var gid=mealNewId();
      rows.push({id:gid+'a',label:v.slice(0,8),type:'cost',grp:gid});
      saveMeal();renderMeal();});
    return;}
  rsPrompt('추가할 메모 줄 이름',{placeholder:'예: 간식',desc:'글만 적는 줄이에요.'},function(v){
    v=(v||'').trim();if(!v)return;
    var last=-1;rows.forEach(function(r,i){if(r.type==='memo')last=i;});
    rows.splice(last+1,0,{id:mealNewId(),label:v.slice(0,8),type:'memo'});
    saveMeal();renderMeal();});}
function mealRenameRow(rid){var rows=mealOwnRows(mealWkKey()),r=null,i;for(i=0;i<rows.length;i++)if(rows[i].id===rid)r=rows[i];if(!r)return;
  rsPrompt('줄 이름 바꾸기',{value:r.label},function(v){v=(v||'').trim();if(!v)return;r.label=v.slice(0,8);saveMeal();renderMeal();});}
function mealDelRow(rid){var wk=mealWkKey(),rows=mealOwnRows(wk),idx=-1,i;
  for(i=0;i<rows.length;i++)if(rows[i].id===rid)idx=i;if(idx<0)return;
  var r=rows[idx];
  var nm=r.label||(r.type==='cost'?'금액 줄':'메모 줄');
  var hasTxt=false;mealDatesOf(wk).forEach(function(ds){if(mealCell(ds,rid).trim()!==''||mealAmt(ds,rid)>0)hasTxt=true;});
  var go=function(){
    /* 그룹 첫 줄을 지우면 다음 줄이 이름·분류를 물려받는다 */
    if(r.type==='cost'&&r.label){var nx=rows[idx+1];if(nx&&nx.grp===r.grp)nx.label=r.label;}
    rows.splice(idx,1);
    mealDatesOf(wk).forEach(function(ds){mealWriteCell(ds,rid,'');mealWriteAmt(ds,rid,0);});
    saveMeal();renderMeal();showToast('줄을 지웠어요');};
  if(!hasTxt){go();return;}
  rsConfirm('「'+nm+'」 줄을 지울까요?\n이번 주에 적은 이 줄 내용만 지워져요(다른 주는 그대로).',go);}
/* 금액 줄 ↔ 분류 연결 */
function mealCatOf(grp){if(!mealData)loadMeal();
  if(Object.prototype.hasOwnProperty.call(mealData.cats,grp))return mealData.cats[grp]||'';
  if(grp==='s'){if(!dailyTree)loadDailyCats();var v=(dailyTree&&dailyTree['변동']&&dailyTree['변동']['식비'])||null;
    if(v&&v.indexOf('식재료')>=0)return subKey('식비','식재료');
    if(v)return '식비';}
  return '';}
function mealCatLabel(key){if(!key)return '분류 선택';return key.indexOf('::')>=0?key.split('::').join(' › '):key;}
function mealJosa(w,withB,noB){var t=String(w||'');if(!t)return noB;var c=t.charCodeAt(t.length-1);
  if(!(c>=0xAC00&&c<=0xD7A3))return noB;return ((c-0xAC00)%28)?withB:noB;}
function mealPickCat(grp,info,done){if(!dailyTree)loadDailyCats();
  info=info||{};
  var nm=info.label||(grp==='s'?'🛒 장보기':'금액 줄');
  var plain=nm.replace(/^[^가-힣A-Za-z0-9]+/,'').trim()||nm;
  var opts=[],map={};
  var add=function(lbl,key){if(!(lbl in map)){opts.push(lbl);map[lbl]=key;}};
  DL_GROUPS.forEach(function(gr){var g2=(dailyTree&&dailyTree[gr])||{};
    Object.keys(g2).forEach(function(c){
      add(c+' (전체)',c);
      (g2[c]||[]).forEach(function(sb){add(c+' › '+sb,subKey(c,sb));});});});
  add('예산에 넣지 않기','');
  /* 지금 골라둔 분류를 맨 위로 올려 기본 선택되게 한다 */
  var now=mealCatOf(grp),nowLbl='';
  Object.keys(map).forEach(function(l){if(map[l]===now&&!nowLbl)nowLbl=l;});
  if(nowLbl){opts.splice(opts.indexOf(nowLbl),1);opts.unshift(nowLbl);}
  mealPickCat._opts=map;
  var desc='이번 주 '+plain+' 합계 '+fmtComma(info.sum||0)+'원을 고른 분류의 주간 예산으로 넣어요.';
  if(nowLbl)desc+='\n지금 골라둔 분류 · '+nowLbl;
  rsPromptSelect(nm+mealJosa(plain,'은','는')+' 어느 예산에 넣을까요?',opts,function(v){
    var m=mealPickCat._opts||{};var key=(v in m)?m[v]:'';mealPickCat._opts=null;
    if(!mealData)loadMeal();
    mealData.cats[grp]=key;
    saveMeal();
    if(done)done();else renderMeal();},{desc:desc});}
function mealBudgetPlan(){var wk=mealWkKey(),dates=mealDatesOf(wk),by={},noCat={};
  mealRows(wk).forEach(function(r){if(r.type!=='cost')return;
    var s=0;dates.forEach(function(ds){s+=mealAmt(ds,r.id);});
    if(s<=0)return;
    var cat=mealCatOf(r.grp);
    if(!cat){noCat[r.grp]=1;return;}
    by[cat]=(by[cat]||0)+s;});
  return {by:by,noCat:Object.keys(noCat).length};}
/* 「주간 예산에 반영」 → 금액이 있는 그룹마다 분류를 고른 뒤 확인 */
function mealApplyBudget(){var wk=mealWkKey(),dates=mealDatesOf(wk),seen={},grps=[];
  mealRows(wk).forEach(function(r){if(r.type!=='cost')return;
    var s=0;dates.forEach(function(ds){s+=mealAmt(ds,r.id);});
    if(s<=0)return;
    if(!seen[r.grp]){seen[r.grp]={sum:0,label:''};grps.push(r.grp);}
    seen[r.grp].sum+=s;
    if(!seen[r.grp].label&&r.label)seen[r.grp].label=r.label;});
  if(!grps.length){showToast('장보기 금액을 먼저 적어주세요');return;}
  var i=0;
  var nextPick=function(){
    if(i>=grps.length){mealApplyConfirm();return;}
    var gk=grps[i++];
    mealPickCat(gk,{label:seen[gk].label,sum:seen[gk].sum},nextPick);
  };
  nextPick();}
function mealApplyConfirm(){var dd=dailyDate||todayStr();
  var pl=mealBudgetPlan(),keys=Object.keys(pl.by);
  if(!keys.length){showToast(pl.noCat?'예산에 넣지 않기로 해서 바뀐 게 없어요':'장보기 금액을 먼저 적어주세요');return;}
  var ds=mealDatesOf(mealWkKey()),a=ds[0].split('-'),b=ds[6].split('-');
  var range=parseInt(a[1],10)+'/'+parseInt(a[2],10)+'~'+parseInt(b[1],10)+'/'+parseInt(b[2],10);
  var cur=catBudgetMap('weekly',dd)||{};
  var list=keys.map(function(k){var was=parseFloat(cur[k])||0;
    return mealCatLabel(k)+'\n'+fmtComma(was)+'원 → '+fmtComma(pl.by[k])+'원';}).join('\n\n');
  rsConfirm(range+' 주간 예산을 이렇게 바꿀까요?\n\n'+list
    +'\n\n· 이 주의 예산만 바뀌어요. 다른 주는 그대로예요.'
    +'\n· 아직 지출로 기록된 건 아니에요. 장 본 날 일일에 적어주세요.'
    +(pl.noCat?'\n· 「예산에 넣지 않기」로 둔 줄 '+pl.noCat+'개는 빠져요.':''),
    function(){keys.forEach(function(k){setCatBudget('weekly',k,pl.by[k],dd);});showToast('주간 예산에 반영했어요');});}
/* 지난주 불러오기 — 보고 있는 그 주만 갱신(G1) */
function mealPullLastCore(wk){var pwk=mealPrevWk(wk),prow=mealRows(pwk),pds=mealDatesOf(pwk),cds=mealDatesOf(wk);
  if(!mealData)loadMeal();
  cds.forEach(function(ds){if(mealData.cells[ds])delete mealData.cells[ds];if(mealData.amts[ds])delete mealData.amts[ds];});
  mealData.weeks[wk]={rows:prow.map(function(r){return {id:r.id,label:r.label,type:r.type,grp:r.grp};})};
  pds.forEach(function(pd,i){prow.forEach(function(r){
    var v=mealCell(pd,r.id);if(v.trim()!=='')mealWriteCell(cds[i],r.id,v);
    var a=mealAmt(pd,r.id);if(a>0)mealWriteAmt(cds[i],r.id,a);});});
  saveMeal();renderMeal();showToast('지난주 식단을 가져왔어요');}
function mealPullLast(){var wk=mealWkKey(),pwk=mealPrevWk(wk);
  if(!mealWeekHasData(pwk)){showToast('지난주에 적어둔 식단이 없어요');return;}
  if(mealWeekHasData(wk)){rsConfirm('이번 주 식단을 지난주 내용으로 덮어쓸까요?\n보고 있는 이 주만 바뀌어요.',function(){mealPullLastCore(wk);});return;}
  mealPullLastCore(wk);}
function renderMeal(){var box=g('dlMeal');if(!box)return;
  if(!mealOn()){box.innerHTML='';return;}
  if(!mealData)loadMeal();
  var wk=mealWkKey(),dates=mealDatesOf(wk),names=weekDayNames(),rows=mealRows(wk);
  var head='<tr><th class="meal-c0 meal-h0">구분'+helpIcon('칸 안에서 <b>엔터</b>를 누르면 줄이 바뀌어요. 글이 길어지면 칸도 같이 늘어나요.')+'</th>';
  dates.forEach(function(ds,i){var p=ds.split('-');head+='<th>'+p[1]+'/'+p[2]+'&nbsp;('+names[i]+')</th>';});
  head+='</tr>';
  var body='';
  rows.forEach(function(r,i){
    var cost=(r.type==='cost');
    var first=cost&&(i===0||rows[i-1].grp!==r.grp);
    var lab='',canDel=false;
    if(cost){
      if(first){lab+='<span class="meal-lab">'+dlEsc(r.label||'금액 줄')+'</span>';
        if(r.grp!=='s')lab+='<span class="meal-rowbtn" onclick="mealRenameRow(\''+r.id+'\')">✏️</span>';}
      canDel=!(first&&r.grp==='s');
    }else{
      lab+='<span class="meal-lab">'+dlEsc(r.label)+'</span>';
      if(!MEAL_LOCK[r.id]){lab+='<span class="meal-rowbtn" onclick="mealRenameRow(\''+r.id+'\')">✏️</span>';canDel=true;}
    }
    if(canDel)lab='<span class="meal-x" onclick="mealDelRow(\''+r.id+'\')">✕</span>'+lab;
    body+='<tr class="'+(cost?'meal-r-cost':'meal-r-memo')+'"><th class="meal-c0">'+lab+'</th>';
    dates.forEach(function(ds){
      if(cost){
        body+='<td class="meal-cst"><div class="meal-line">'
          +'<textarea class="meal-it" rows="1" placeholder="품목" data-ds="'+ds+'" data-rid="'+r.id+'" oninput="ar(this);mealSetSoon(this)" onchange="mealSet(this)">'+dlEsc(mealCell(ds,r.id))+'</textarea>'
          +'<input class="meal-amt" type="text" inputmode="numeric" placeholder="0" value="'+(mealAmt(ds,r.id)>0?fmtComma(mealAmt(ds,r.id)):'')+'" data-ds="'+ds+'" data-rid="'+r.id+'" oninput="commaInput(this)" onchange="mealSetAmt(this)">'
          +'</div></td>';
      }else{
        body+='<td><textarea class="meal-ta" rows="1" data-ds="'+ds+'" data-rid="'+r.id+'" oninput="ar(this);mealSetSoon(this)" onchange="mealSet(this)">'+dlEsc(mealCell(ds,r.id))+'</textarea></td>';
      }
    });
    body+='</tr>';
  });
  body+='<tr class="meal-sum"><th class="meal-c0">예상 합계</th>';
  dates.forEach(function(ds){var v=mealDaySum(wk,ds);body+='<td class="meal-sumc">'+(v>0?fmtComma(v):'-')+'</td>';});
  body+='</tr>';
  box.innerHTML='<div class="meal-card"><div class="meal-top">'
    +'<span class="meal-ttl">🍚&nbsp;이번 주 식단 &amp; 장보기</span>'
    +'<span class="meal-sumtxt">이번 주 예상 <b class="meal-tot">'+fmtComma(mealWeekSum(wk))+'</b>원</span>'
    +'<span style="flex:1"></span>'
    +'<button type="button" class="btn btn-ol meal-btn" onclick="mealPullLast()">지난주 불러오기</button>'
    +'<button type="button" class="btn btn-ol meal-btn" onclick="mealAddRow()">+ 줄 추가</button>'
    +'<button type="button" class="btn btn-ac meal-btn" onclick="mealApplyBudget()">주간 예산에 반영</button>'
    +'</div><div class="meal-wrap"><table class="meal-tbl"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'
    +'<div class="meal-hint">💡 여기 적은 금액은 <b>계획(예산)</b>이에요. 「주간 예산에 반영」을 누르면 그 주 분류별 예산으로 들어가고, <b>실제로 쓴 돈은 일일 기록</b>에 남기면 돼요.</div></div>';
  var tas=box.querySelectorAll('.meal-ta,.meal-it');
  for(var i=0;i<tas.length;i++)ar(tas[i]);
}
function loadDailyReview(){var v=null;try{v=JSON.parse(localStorage.getItem('rs_daily_review')||'null');}catch(e){}dailyReview=(v&&typeof v==='object')?v:{};if(!dailyReview.weekly)dailyReview.weekly={};if(!dailyReview.monthly)dailyReview.monthly={};}
function saveDailyReview(){try{lsSet('rs_daily_review',JSON.stringify(dailyReview));}catch(e){}}
function wkRevKey(dateStr){return localDateStr(weekStartMon(dateStr));}
function weekReviewOf(dateStr){if(!dailyReview)loadDailyReview();return dailyReview.weekly[wkRevKey(dateStr)]||{};}
function monthReviewOf(dateStr){if(!dailyReview)loadDailyReview();return dailyReview.monthly[monthKey(dateStr)]||{};}
function setWkRev(field,val){if(!dailyReview)loadDailyReview();var k=wkRevKey(dailyDate||todayStr());var o=dailyReview.weekly[k]||{};o[field]=val;dailyReview.weekly[k]=o;saveDailyReview();}
function setMoRev(field,val){if(!dailyReview)loadDailyReview();var k=monthKey(dailyDate||todayStr());var o=dailyReview.monthly[k]||{};o[field]=val;dailyReview.monthly[k]=o;saveDailyReview();}
function revBox(title,hint,field,val,scope){return '<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;margin-bottom:5px">'+title+'</div><textarea rows="1" class="ul-textarea" oninput="'+(scope==='wk'?'setWkRev':'setMoRev')+'('+jsArg(field)+',this.value)" placeholder="'+hint+'">'+dlEsc(val||'')+'</textarea></div>';}
function monthConsumeTally(dateStr){var mk=monthKey(dateStr||todayStr());var _f=monthFirstDate(mk),_l=monthLastDate(mk);var t=todayStr();var c=0,w=0;var _c=new Date(_f+'T00:00:00'),_e=new Date(_l+'T00:00:00'),_g=0;while(_c<=_e&&_g<40){var ds=localDateStr(_c);if(ds<=t){var v=consumeOf(ds);if(v==='carrot')c++;else if(v==='whip')w++;}_c.setDate(_c.getDate()+1);_g++;}return {carrot:c,whip:w};}
function dlFirstRecDate(){var m=null;dailyData.forEach(function(e){var d=String(e.date);if(m===null||d<m)m=d;});return m;}
function noSpendStreak(){var t=todayStr();var first=dlFirstRecDate();if(!first)return 0;var cur=new Date(t+'T00:00:00');var n=0,guard=0;while(guard<800){var ds=localDateStr(cur);if(ds<first)break;if(!dayNoSpend(ds))break;n++;cur.setDate(cur.getDate()-1);guard++;}return n;}
function monthNoSpendCount(){var t=todayStr();var tp=t.split('-');var y=parseInt(tp[0],10),mo=parseInt(tp[1],10);var first=dlFirstRecDate();if(!first)return 0;var days=new Date(y,mo,0).getDate();var endD=Math.min(parseInt(tp[2],10),days);var c=0;for(var d=1;d<=endD;d++){var ds=y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');if(ds<first)continue;if(dayNoSpend(ds))c++;}return c;}
function streakBannerHtml(){var first=dlFirstRecDate();if(!first)return '';var mc=monthNoSpendCount();var st=noSpendStreak();if(mc<=0&&st<2)return '';var mk='var(--carrot-mk,#3f9a68)';var bg='var(--carrot-bg,#eaf3ec)';var msg;if(mc>0){msg='이번 달 무지출 <b>'+mc+'일</b>';if(st>=2)msg+=' · 🔥 <b>'+st+'일</b> 연속!';}else{msg='🔥 무지출 <b>'+st+'일</b> 연속!';}return '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--tbl-border);font-size:13px;color:#555;line-height:1.4;word-break:keep-all;text-align:center">🥕 '+msg+'</div>';}
function renderMoConsume(dateStr){var box=g('dlMoConsume');if(!box)return;var mk=monthKey(dateStr||todayStr());var _f=monthFirstDate(mk),_l=monthLastDate(mk);var t=todayStr();var cells='',cnt=0,_firstLbl='',_lastLbl='';var _c=new Date(_f+'T00:00:00'),_e=new Date(_l+'T00:00:00'),_g=0;while(_c<=_e&&_g<40){var ds=localDateStr(_c);var _dnum=parseInt(ds.slice(8,10),10);if(_g===0)_firstLbl=_dnum+'일';_lastLbl=_dnum+'일';var col='#f3f1ec',lbl='-';if(ds<=t){var v=consumeOf(ds);if(v==='whip'){col='var(--whip-bg,#fbe7e0)';lbl='채찍';}else if(v==='carrot'){col='var(--carrot-bg,#eaf3ec)';lbl='당근';}}var out=(ds===t)?'outline:2px solid var(--ac);outline-offset:-2px;':'';cells+='<div title="'+_dnum+'일: '+lbl+'" style="height:16px;background:'+col+';border-radius:2px;'+out+'"></div>';cnt++;_c.setDate(_c.getDate()+1);_g++;}var tal=monthConsumeTally(dateStr);box.innerHTML='<div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:11px 12px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:13px;color:var(--gray)"><span>🥕 당근 <b style="color:var(--carrot-mk,#3f9a68)">'+tal.carrot+'</b>일 · <img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px"> <span style="color:var(--whip-mk,#d9534f)">채찍</span> <b style="color:var(--whip-mk,#d9534f)">'+tal.whip+'</b>일</span><span>이 달의 소비 분위기'+helpIcon('칸 색은 그날의 평가예요 — 당근(잘함)·채찍(아쉬움). 회색은 기록이 없거나 평가 안 한 날, 오늘 이후 날짜는 빈칸이에요.')+'</span></div><div style="display:grid;grid-template-columns:repeat('+cnt+',1fr);gap:2px">'+cells+'</div><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--gray);margin-top:3px"><span>'+_firstLbl+'</span><span>'+_lastLbl+'</span></div></div>';}
function monthSummaryStats(dateStr){var dd=dateStr||dailyDate||todayStr();var p=dd.split('-');var y=parseInt(p[0],10),mo=parseInt(p[1],10);var ents=monthEntries(dd);var total=0,byVar={};ents.forEach(function(e){var net=entrySpend(e);if(net<=0)return;total+=net;var cat=e.cat||e.category||'미분류';if(catGroupOf(cat)!=='고정'){byVar[cat]=(byVar[cat]||0)+net;}});var cats=Object.keys(byVar).sort(function(a,b){return byVar[b]-byVar[a];});var tal=monthConsumeTally(dd);var t=todayStr();var tp=t.split('-');var days=new Date(y,mo,0).getDate();var sameMonth=(parseInt(tp[0],10)===y&&parseInt(tp[1],10)===mo);var endD=sameMonth?Math.min(parseInt(tp[2],10),days):days;var first=dlFirstRecDate();var noSpend=0;for(var d=1;d<=endD;d++){var ds=y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0');if(first&&ds<first)continue;if(dayNoSpend(ds))noSpend++;}var rv=(typeof monthReviewOf==='function')?(monthReviewOf(dd)||{}):{};var budEff=(typeof sumCatBudget==='function')?sumCatBudget('monthly',dd):0;var budget=budEff>0?budEff:((typeof monthlyBudgetOf==='function')?monthlyBudgetOf(dd):0);var budgetPct=budget>0?Math.round(total/budget*100):0;var prevTotal=0;if(typeof prevPeriodDate==='function'){var pEnts=monthEntries(prevPeriodDate('monthly',dd));pEnts.forEach(function(e){var net=entrySpend(e);prevTotal+=net;});}var prevDelta=total-prevTotal;var prevPct=prevTotal>0?Math.round(prevDelta/prevTotal*100):0;return {y:y,mo:mo,carrot:tal.carrot,whip:tal.whip,noSpend:noSpend,total:total,topCat:cats[0]||'',topAmt:cats[0]?byVar[cats[0]]:0,saveCat:cats.length>1?cats[cats.length-1]:'',saveAmt:cats.length>1?byVar[cats[cats.length-1]]:0,best:rv.best||'',worst:rv.worst||'',carrotNote:rv.carrot||'',whipNote:rv.whip||'',resist:resistMonthTotal(dd),budget:budget,budgetPct:budgetPct,prevTotal:prevTotal,prevDelta:prevDelta,prevPct:prevPct};}
function downloadSummaryCard(){if(!window._summaryCardURL)return;var a=document.createElement('a');a.href=window._summaryCardURL;a.download='richsister_결산.png';document.body.appendChild(a);a.click();document.body.removeChild(a);}
function openMonthSummaryCard(){var dd=dailyDate||todayStr();var s=monthSummaryStats(dd);var cs=getComputedStyle(document.body);var ac=(cs.getPropertyValue('--ac')||'').trim()||'#b3315a';var carrotMk=(cs.getPropertyValue('--carrot-mk')||'').trim()||'#3f9a68';var whipMk=(cs.getPropertyValue('--whip-mk')||'').trim()||'#d9534f';var W=480,R=2;var statRows=[];statRows.push({label:'🥕 당근',val:s.carrot+'일',color:carrotMk});statRows.push({label:'채찍',val:s.whip+'일',color:whipMk,lx:52,whip:true});statRows.push({label:'무지출 데이',val:s.noSpend+'일',color:carrotMk});statRows.push({label:'이번 달 총지출',val:fmtComma(s.total)+'원',color:'#111'});if(s.budget>0){var overBud=s.total>s.budget;statRows.push({label:'예산 대비 지출률',val:s.budgetPct+'%',color:overBud?'#d9534f':ac});}if(s.prevTotal>0){var upM=s.prevDelta>0,downM=s.prevDelta<0;var arrowM=upM?'▲ ':(downM?'▼ ':'');var pcTxtM=s.prevPct?(' ('+(upM?'+':'')+s.prevPct+'%)'):'';statRows.push({label:'전월 대비',val:arrowM+fmtComma(Math.abs(s.prevDelta))+'원'+pcTxtM,color:upM?'#d9534f':(downM?'#1B6E4F':'#666')});}if(s.topCat)statRows.push({label:'가장 많이 쓴 분류',val:s.topCat+' ('+fmtComma(s.topAmt)+'원)',color:ac});if(s.saveCat)statRows.push({label:'가장 적게 쓴 분류',val:s.saveCat+' ('+fmtComma(s.saveAmt)+'원)',color:'#666'});if(s.resist>0)statRows.push({label:'💪 지켜낸 금액',val:fmtComma(s.resist)+'원',color:carrotMk});function trimNote(t){t=(t||'').toString().trim();if(!t)return '';if(t.length>34)t=t.slice(0,33)+'…';return t;}var noteRows=[];var cN=trimNote(s.carrotNote);if(cN)noteRows.push({icon:'🥕 당근',text:cN});var wN=trimNote(s.whipNote);if(wN)noteRows.push({icon:'채찍',text:wN,whip:true});var bN=trimNote(s.best);if(bN)noteRows.push({icon:'🏆 베스트',text:bN});var oN=trimNote(s.worst);if(oN)noteRows.push({icon:'💸 워스트',text:oN});var statTop=128,statSp=32;var statBottom=statRows.length?(statTop+(statRows.length-1)*statSp+20):92;var noteTop=statBottom+30;var noteSp=27;var H;if(noteRows.length){H=noteTop+36+noteRows.length*noteSp+22;}else{H=statBottom+22;}if(H<300)H=300;var cv=document.createElement('canvas');cv.width=W*R;cv.height=H*R;cv.style.width='100%';cv.style.maxWidth=W+'px';cv.style.height='auto';cv.style.display='block';var ctx=cv.getContext('2d');ctx.scale(R,R);var FF="'Pretendard','Noto Sans KR',sans-serif";var SERIF="'Cormorant Garamond',serif";ctx.fillStyle='#fbf8f3';ctx.fillRect(0,0,W,H);ctx.fillStyle=ac;ctx.fillRect(0,0,W,7);ctx.textBaseline='alphabetic';ctx.fillStyle='#999';ctx.font='600 15px '+SERIF;ctx.textAlign='left';ctx.fillText('RICHSISTER 부자언니',26,42);ctx.fillStyle='#111';ctx.font='700 26px '+FF;ctx.fillText(s.y+'년 '+s.mo+'월 결산',26,76);ctx.strokeStyle='#e8e2d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(26,92);ctx.lineTo(W-26,92);ctx.stroke();function row(label,val,yy,vcolor,lx){ctx.fillStyle='#888';ctx.font='15px '+FF;ctx.textAlign='left';ctx.fillText(label,lx||26,yy);ctx.fillStyle=vcolor||'#111';ctx.font='700 18px '+FF;ctx.textAlign='right';ctx.fillText(val,W-26,yy);ctx.textAlign='left';}var whipRowY=0;statRows.forEach(function(r,i){var yy=statTop+i*statSp;row(r.label,r.val,yy,r.color,r.lx);if(r.whip)whipRowY=yy;});var whipNoteY=0;if(noteRows.length){ctx.fillStyle='#aaa';ctx.font='600 13px '+FF;ctx.textAlign='left';ctx.fillText('회고 메모',26,noteTop);ctx.strokeStyle='#e8e2d8';ctx.beginPath();ctx.moveTo(26,noteTop+8);ctx.lineTo(W-26,noteTop+8);ctx.stroke();noteRows.forEach(function(n,i){var yy=noteTop+40+i*noteSp;var lx=n.whip?52:26;ctx.font='600 14px '+FF;ctx.fillStyle='#999';ctx.textAlign='left';ctx.fillText(n.icon,lx,yy);var iconW=ctx.measureText(n.icon).width;ctx.fillStyle='#444';ctx.font='14px '+FF;ctx.fillText(n.text,lx+iconW+8,yy);if(n.whip)whipNoteY=yy;});}function finalize(){var body=g('summaryCardBody');if(body){body.innerHTML='';body.appendChild(cv);}try{window._summaryCardURL=cv.toDataURL('image/png');}catch(e){window._summaryCardURL='';}var m=g('summaryCardModal');if(m)m.classList.add('open');}var wi=new Image();wi.onload=function(){try{if(whipRowY)ctx.drawImage(wi,26,whipRowY-13,20,17);if(whipNoteY)ctx.drawImage(wi,26,whipNoteY-12,16,14);}catch(e){}finalize();};wi.onerror=function(){finalize();};try{wi.src=WHIP_IMG;}catch(e){finalize();}}
var resistData=null,spendRules=null,srEditOpen=false,dlResistOpen=false;
function loadResist(){try{var v=JSON.parse(localStorage.getItem('rs_resist')||'null');resistData=Array.isArray(v)?v:[];}catch(e){resistData=[];}}
function saveResist(){try{lsSet('rs_resist',JSON.stringify(resistData));}catch(e){}}
function resistOfDay(ds){if(resistData===null)loadResist();return resistData.filter(function(r){return r.date===ds;});}
function resistDayTotal(ds){return resistOfDay(ds).reduce(function(s,r){return s+(parseFloat(r.amount)||0);},0);}
function resistMonthTotal(ds){if(resistData===null)loadResist();var ym=monthKey(ds||todayStr());return resistData.filter(function(r){return monthKey(r.date)===ym;}).reduce(function(s,r){return s+(parseFloat(r.amount)||0);},0);}
function addResist(){var ai=g('dlResistAmt'),ni=g('dlResistNote');if(!ai)return;var amt=parseFloat((ai.value||'').replace(/[^0-9.]/g,''))||0;if(amt<=0){ai.focus();return;}if(resistData===null)loadResist();resistData.push({id:'rs'+Date.now()+Math.random().toString(36).slice(2,5),date:dailyDate||todayStr(),amount:amt,note:(ni?ni.value:'').trim()});saveResist();ai.value='';if(ni)ni.value='';renderResist(dailyDate);}
function delResist(id){if(resistData===null)loadResist();resistData=resistData.filter(function(r){return r.id!==id;});saveResist();renderResist(dailyDate);}
function toggleResist(){dlResistOpen=!dlResistOpen;renderResist(dailyDate);}function renderResist(dateStr){var box=g('dlResistCard');if(!box)return;var btn=g('dlResistBtn');if(btn)btn.className='btn '+(dlResistOpen?'btn-bk':'btn-ol');if(!dlResistOpen){box.innerHTML='';return;}var ds=dateStr||dailyDate||todayStr();var list=resistOfDay(ds);var tot=resistDayTotal(ds);var mtot=resistMonthTotal(ds);var rows=list.map(function(r){return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--tbl-border)"><span style="flex:1;font-size:13px;color:#111">'+(r.note?dlEsc(r.note):'<span style="color:var(--gray)">참았어요</span>')+'</span><span style="font-size:13px;font-weight:700;color:var(--carrot-mk,#3f9a68)">'+fmtComma(parseFloat(r.amount)||0)+'원</span><button type="button" onclick="delResist('+jsArg(r.id)+')" style="border:none;background:none;color:var(--gray);cursor:pointer;font-size:14px;padding:0 2px">×</button></div>';}).join('');box.innerHTML='<div style="background:var(--carrot-bg,#eaf3ec);border:1px solid var(--carrot-mk,#3f9a68);border-radius:8px;padding:12px;margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:14px;font-weight:700;color:#111">🛡️ 지름신 물리침'+helpIcon('내 지갑은 내가 지킨다! 충동구매처럼 사고 싶었지만 안 산 걸 적어요. 실제 잔고가 아니라 「안 쓴 보람」을 모아 보는 칸이에요(변동지출).')+'</span><span style="font-size:13px;color:var(--gray)">이 달 누계 <b style="color:var(--carrot-mk,#3f9a68)">'+fmtComma(mtot)+'</b>원</span></div><div style="display:flex;gap:6px"><input id="dlResistAmt" type="text" inputmode="numeric" placeholder="금액" style="width:88px;padding:7px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;box-sizing:border-box"><input id="dlResistNote" type="text" placeholder="무엇을 참았나요? (선택)" style="flex:1;min-width:0;padding:7px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;box-sizing:border-box"><button type="button" onclick="addResist()" class="btn btn-bk" style="font-size:13px;padding:7px 12px;white-space:nowrap">추가</button></div>'+rows+(list.length?'<div style="text-align:right;font-size:13px;color:var(--gray);margin-top:6px">오늘 지켜낸 금액 <b style="color:var(--carrot-mk,#3f9a68)">'+fmtComma(tot)+'원</b></div>':'')+'</div>';}function loadSpendRules(){try{var v=JSON.parse(localStorage.getItem('rs_spend_rules')||'null');spendRules=(v&&typeof v==='object')?{use:Array.isArray(v.use)?v.use:[],avoid:Array.isArray(v.avoid)?v.avoid:[]}:{use:[],avoid:[]};}catch(e){spendRules={use:[],avoid:[]};}}
function saveSpendRules(){try{lsSet('rs_spend_rules',JSON.stringify(spendRules));}catch(e){}}
function addSpendRule(kind){if(spendRules===null)loadSpendRules();var inp=g('srIn_'+kind);if(!inp)return;var t=(inp.value||'').trim();if(!t)return;if(!spendRules[kind])spendRules[kind]=[];spendRules[kind].push(t);saveSpendRules();inp.value='';renderSpendRules();var i2=g('srIn_'+kind);if(i2)i2.focus();}
function delSpendRule(kind,idx){if(spendRules===null)loadSpendRules();if(spendRules[kind])spendRules[kind].splice(idx,1);saveSpendRules();renderSpendRules();}
function toggleSpendRulesEdit(){srEditOpen=!srEditOpen;renderSpendRules();}
function srColHtml(kind,title,color){var arr=spendRules[kind]||[];var chips=arr.length?arr.map(function(t,i){return '<span style="display:inline-flex;align-items:center;gap:3px;background:#fff;border:1px solid '+color+';color:#111;border-radius:99px;padding:3px 9px;font-size:13px;margin:0 4px 4px 0">'+dlEsc(t)+(srEditOpen?'<span onclick="delSpendRule('+jsArg(kind)+','+i+')" style="cursor:pointer;color:var(--gray);font-weight:700">×</span>':'')+'</span>';}).join(''):'<span style="font-size:13px;color:var(--gray)">'+(srEditOpen?'아래에 추가하세요':'아직 없어요')+'</span>';var editor=srEditOpen?'<div style="display:flex;gap:5px;margin-top:6px"><input id="srIn_'+kind+'" type="text" placeholder="항목 추가" style="flex:1;min-width:0;padding:6px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;box-sizing:border-box"><button type="button" onclick="addSpendRule('+jsArg(kind)+')" class="btn btn-ol" style="font-size:13px;padding:5px 9px;white-space:nowrap">추가</button></div>':'';return '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:700;color:'+color+';margin-bottom:5px">'+title+'</div><div>'+chips+'</div>'+editor+'</div>';}
function spendRulesOff(){try{return localStorage.getItem('rs_spend_rules_on')==='0';}catch(e){return false;}}
function applySpendRulesOn(){['spendRulesToggleBtn','spendRulesToggleBtn2'].forEach(function(id){var b=g(id);if(b)b.textContent=spendRulesOff()?'숨김':'표시';});var box=g('dlSpendRules');if(box&&spendRulesOff())box.innerHTML='';}
function toggleSpendRulesOn(){var off=spendRulesOff();try{lsSet('rs_spend_rules_on',off?'1':'0');}catch(e){}applySpendRulesOn();if(!spendRulesOff())renderSpendRules();}
function renderSpendRules(){var box=g('dlSpendRules');if(!box)return;if(spendRulesOff()){box.innerHTML='';return;}if(spendRules===null)loadSpendRules();box.innerHTML='<div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:12px;margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px"><span style="font-size:13px;letter-spacing:.05em;color:var(--gray);font-weight:700">🌟 나의 쓸쓰안쓰'+helpIcon('가치 있게 쓸 곳과 참을 곳을 직접 정해두고, 매일 정산할 때 떠올리는 칸이에요. ✏️ 편집으로 바꿀 수 있어요.')+'</span><span onclick="toggleSpendRulesEdit()" style="cursor:pointer;font-size:13px;color:var(--ac)">'+(srEditOpen?'완료':'✏️ 편집')+'</span></div><div style="display:flex;gap:14px">'+srColHtml('use','👍 쓸 것','var(--carrot-mk,#3f9a68)')+srColHtml('avoid','🚫 안 쓸 것','var(--whip-mk,#d9534f)')+'</div></div>';}
function weekVarSpend(weekStartDs){if(!dailyData)loadDaily();var start=new Date(weekStartDs+'T00:00:00');var tot=0;for(var i=0;i<7;i++){var d=new Date(start);d.setDate(start.getDate()+i);var ds=localDateStr(d);dailyData.forEach(function(e){if(e.date!==ds)return;var net=entrySpend(e);if(net<=0)return;if(catGroupOf(e.cat||e.category||'')!=='고정')tot+=net;});}return tot;}
function weekNoSpendDays(weekStartDs){var start=new Date(weekStartDs+'T00:00:00');var t=todayStr();var first=dlFirstRecDate();var n=0;for(var i=0;i<7;i++){var d=new Date(start);d.setDate(start.getDate()+i);var ds=localDateStr(d);if(ds>t)continue;if(first&&ds<first)continue;if(dayNoSpend(ds))n++;}return n;}
function weekResistTotal(weekStartDs){if(resistData===null)loadResist();var start=new Date(weekStartDs+'T00:00:00');var d6=new Date(start);d6.setDate(start.getDate()+6);var ds6=localDateStr(d6);return resistData.filter(function(r){return r.date>=weekStartDs&&r.date<=ds6;}).reduce(function(s,r){return s+(parseFloat(r.amount)||0);},0);}
function monthRollupHtml(dateStr){var ym=monthKey(dateStr||todayStr());var y=parseInt(ym.slice(0,4),10),mo=parseInt(ym.slice(5,7),10);var mtot=resistMonthTotal(dateStr);var monday=localDateStr(weekStartMon(monthFirstDate(ym)));var weeks=[];var cur=new Date(monday+'T00:00:00');for(var gu=0;gu<8;gu++){var ms=localDateStr(cur);if(ms>monthLastDate(ym))break;if(monthKey(ms)===ym)weeks.push(ms);cur.setDate(cur.getDate()+7);}var html='';if(mtot>0){html+='<div style="height:14px"></div><div style="background:var(--carrot-bg,#eaf3ec);border:1px solid var(--carrot-mk,#3f9a68);border-radius:8px;padding:11px 13px;margin-bottom:12px;font-size:13px;color:#333;word-break:keep-all">💪 이번 달 내가 지켜낸 금액 <b style="color:var(--carrot-mk,#3f9a68)">'+fmtComma(mtot)+'원</b>'+helpIcon('지름신을 물리치고 안 쓴 돈을 이 달 동안 모은 누계예요. 실제 잔고가 아니라 「안 쓴 보람」을 모아 보는 금액이에요(일일 화면 「지름신 물리침」에 적은 합계).')+'</div>';}var cards='',maxSp=1,stat=[];weeks.forEach(function(ms,idx){var rv=weekReviewOf(ms);var sp=weekVarSpend(ms);var tal=weekConsumeTally(ms);var ns=weekNoSpendDays(ms);var rt=weekResistTotal(ms);if(sp>maxSp)maxSp=sp;stat.push({i:idx+1,sp:sp,carrot:tal.carrot});var good=(rv.carrot||rv.best||'').toString().trim();var bad=(rv.whip||rv.worst||'').toString().trim();var memo=(rv.memo||'').toString().trim();var notes='';if(good)notes+='<div style="font-size:13px;color:#333;margin-top:3px">🏆 베스트&nbsp;| '+dlEsc(good)+'</div>';if(bad)notes+='<div style="font-size:13px;color:#333;margin-top:3px">💸 워스트&nbsp;| '+dlEsc(bad)+'</div>';if(memo)notes+='<div style="font-size:13px;color:var(--gray);margin-top:3px">📝 '+dlEsc(memo)+'</div>';cards+='<div style="border:1px solid var(--tbl-border);border-radius:8px;padding:10px 12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span style="font-size:13px;font-weight:700;color:#111">'+(idx+1)+'주차</span><span style="font-size:13px;color:var(--gray)">변동 <b style="color:#111">'+fmtComma(sp)+'</b></span></div><div style="font-size:13px;color:var(--gray);margin-top:3px;word-break:keep-all">🥕'+tal.carrot+' <img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">'+tal.whip+' · 무지출 '+ns+'일'+(rt>0?' · 💪'+fmtComma(rt):'')+'</div>'+notes+'</div>';});if(weeks.length){var bars='';stat.forEach(function(s){var h=Math.round(s.sp/maxSp*100);bars+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px"><div style="width:100%;display:flex;align-items:flex-end;height:46px"><div style="width:100%;background:var(--ac);opacity:.8;border-radius:3px 3px 0 0;height:'+h+'%"></div></div><span style="font-size:13px;color:var(--gray)">'+s.i+'주</span></div>';});var lean=stat.slice().sort(function(a,b){return a.sp-b.sp;})[0];var carr=stat.slice().sort(function(a,b){return b.carrot-a.carrot;})[0];var ins='';if(stat.length>=2){ins='<div style="font-size:13px;color:#333;margin-top:16px;line-height:1.6;word-break:keep-all">가장 아낀 주 <b>'+lean.i+'주차</b>('+fmtComma(lean.sp)+'원)';if(carr&&carr.carrot>0)ins+=' · 🥕 제일 많은 주 <b>'+carr.i+'주차</b>('+carr.carrot+'일)';ins+='</div>';}html+='<div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:28px 0 14px">이 달의 주간 되돌아보기</div><div style="display:flex;gap:6px;align-items:flex-end;margin-bottom:14px">'+bars+'</div>'+ins+'<div style="height:20px"></div>'+cards;}return html;}
function monthDdRefHtml(ymKey){var r=monthReviewOf(ymKey+'-01');var g1=(r.carrot||'').toString().trim(),b1=(r.whip||'').toString().trim(),be=(r.best||'').toString().trim(),wo=(r.worst||'').toString().trim();if(!(g1||b1||be||wo))return '';var rows='';if(g1)rows+='<div class="mdr-r"><span class="mdr-k">🥕&nbsp;잘한 점</span><span class="mdr-v">'+dlEsc(g1)+'</span></div>';if(b1)rows+='<div class="mdr-r"><span class="mdr-k"><img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">&nbsp;아쉬운 점</span><span class="mdr-v">'+dlEsc(b1)+'</span></div>';if(be)rows+='<div class="mdr-r"><span class="mdr-k">🏆&nbsp;베스트</span><span class="mdr-v">'+dlEsc(be)+'</span></div>';if(wo)rows+='<div class="mdr-r"><span class="mdr-k">💸&nbsp;워스트</span><span class="mdr-v">'+dlEsc(wo)+'</span></div>';return '<div class="mdr"><div class="mdr-t"><img src="'+PIN_IMG+'" alt="" style="height:1.1em;vertical-align:-2px">&nbsp;이 달의 지출 되돌아보기</div>'+rows+'</div>';}
function fixHlpPos(pop){try{var hlp=pop.parentElement;var r=hlp.getBoundingClientRect();pop.style.left='0px';pop.style.right='auto';var pw=pop.offsetWidth;var vw=window.innerWidth||document.documentElement.clientWidth;var m=10;var L=r.left;if(L+pw>vw-m)L=vw-m-pw;if(L<m)L=m;pop.style.left=(L-r.left)+'px';}catch(e){}}document.addEventListener('click',function(){setTimeout(function(){var ps=document.querySelectorAll('.hlp.on .hlp-pop');for(var i=0;i<ps.length;i++)fixHlpPos(ps[i]);},0);},true);function _segBox(){var b=document.getElementById('segTipBox');if(!b){b=document.createElement('div');b.id='segTipBox';document.body.appendChild(b);}return b;}function _segShow(t,x,y){if(!t)return;var b=_segBox();b.innerHTML=String(t).split('§§').join('<br>');b.style.display='block';_segMove(x,y);}function _segMove(x,y){var b=document.getElementById('segTipBox');if(!b||b.style.display==='none')return;var w=b.offsetWidth,h=b.offsetHeight,vw=window.innerWidth||document.documentElement.clientWidth,vh=window.innerHeight||document.documentElement.clientHeight,m=8;var L=x+18;if(L+w>vw-m)L=x-18-w;if(L<m)L=m;var T=y-h/2;if(T+h>vh-m)T=vh-m-h;if(T<m)T=m;b.style.left=L+'px';b.style.top=T+'px';}function _segHide(){var b=document.getElementById('segTipBox');if(b)b.style.display='none';}document.addEventListener('mousemove',function(e){var el=e.target,t=(el&&el.closest)?el.closest('.segtip'):null;if(t){_segShow(t.getAttribute('data-tip'),e.clientX,e.clientY);}else{_segHide();}},true);document.addEventListener('touchstart',function(e){var el=e.target,t=(el&&el.closest)?el.closest('.segtip'):null;if(t&&e.touches&&e.touches[0]){_segShow(t.getAttribute('data-tip'),e.touches[0].clientX,e.touches[0].clientY);}else{_segHide();}},true);document.addEventListener('scroll',_segHide,true);function weekReviewHtml(dateStr){var r=weekReviewOf(dateStr);return weekConsumeBanner(dateStr)+'<div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:14px">'+revBox('🏆 이번 주 베스트 지출','잘 썼다 싶은 지출은?','best',r.best,'wk')+revBox('💸 이번 주 워스트 지출','아깝다 싶은 지출은?','worst',r.worst,'wk')+revBox('📝 회고 메모','이번 주를 돌아보며 한마디','memo',r.memo,'wk')+'</div>';}
function renderMonthReview(){var dd=dailyDate||todayStr();if(g('dlMoReview'))g('dlMoReview').innerHTML=monthReviewHtml(dd);}
function applyReviewVis(){['dlWkReview','dlMoReview'].forEach(function(id){var e=g(id);if(e)e.style.display=dlReviewOpen?'':'none';});var cs=document.querySelectorAll('.rev-caret');for(var i=0;i<cs.length;i++)cs[i].textContent=dlReviewOpen?'▾':'▸';var hs=document.querySelectorAll('.rev-head');for(var j=0;j<hs.length;j++){hs[j].style.color=dlReviewOpen?'var(--gray)':'var(--ac)';hs[j].style.fontWeight=dlReviewOpen?'400':'700';}}
function toggleReview(){dlReviewOpen=!dlReviewOpen;applyReviewVis();}function applyRecentVis(){var e=g('dlRecent');if(e)e.style.display=dlRecentOpen?'':'none';var cs=document.querySelectorAll('.rec-caret');for(var i=0;i<cs.length;i++)cs[i].textContent=dlRecentOpen?'▾':'▸';}function toggleRecent(){dlRecentOpen=!dlRecentOpen;applyRecentVis();}
function toggleDlPlanAll(){dlPlanAll=!dlPlanAll;document.body.classList.toggle('dl-plan-open',dlPlanAll);renderActiveView();}
function setCatBudget(scope,cat,v,dateStr){var n=parseFloat(String(v).replace(/,/g,''));n=isNaN(n)||n<0?0:n;var ds=dateStr||todayStr(),map=bWriteMap(scope,ds);if(n>0)map[cat]=n;else delete map[cat];if(scope==='monthly'){var weekly=bWriteMap('weekly',ds);if(n>0)weekly[cat]=n;else delete weekly[cat];}saveDailyBudget();renderActiveView();}
/* Desktop keeps the explanatory labels; mobile CSS swaps in the compact value. */
function catBudgetRow(scope,cat,spent,budget,editable,deleted,extra,dateStr,bSet){
  var setb=!!bSet,pct=budget>0?Math.round(spent/budget*100):0,fill=Math.max(0,Math.min(100,pct)),over=setb&&spent>budget,color=catColor(cat);
  var dot='<span style="display:inline-block;width:9px;height:9px;border-radius:99px;background:'+color+';margin-right:6px;vertical-align:middle"></span>';
  var nm='<span style="font-size:13px;font-weight:500'+(deleted?';color:var(--gray)':'')+'">'+dlEsc(cat)+(deleted?' (삭제됨)':'')+'</span>';
  var right=setb?(over?'<span style="color:#d9534f;font-weight:600">'+fmtComma(spent-budget)+'원 초과</span>':'<span style="color:var(--ac)">남음 '+fmtComma(budget-spent)+'원</span>'):'<span style="color:var(--gray)">'+(deleted?'삭제된 분류':'예산 미설정')+'</span>';
  var input=editable?'<span class="cat-budget-input" style="display:inline-flex;align-items:center;gap:2px"><input type="number" class="dlbgt" value="'+(setb?budget:'')+'" placeholder="예산" onchange="setCatBudget('+jsArg(scope)+','+jsArg(cat)+',this.value,'+jsArg(dateStr||'')+')" style="width:59px;text-align:right;padding:3px 5px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">원</span></span>':'';
  var mobile=setb?fmtComma(spent)+' / '+fmtComma(budget)+'원':fmtComma(spent)+'원';
  return '<div class="cat-budget-row" style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:8px"><span>'+dot+nm+'</span><span style="display:inline-flex;align-items:center;gap:6px">'+input+(extra||'')+'</span></div><div style="height:6px;background:#eee;border-radius:99px;overflow:hidden"><div style="height:100%;width:'+fill+'%;background:'+color+';border-radius:99px;transition:width .2s"></div></div><div class="cat-budget-desktop" style="display:flex;justify-content:space-between;font-size:13px;margin-top:3px"><span style="color:var(--gray)">썼어요 '+fmtComma(spent)+'원'+(budget>0?' · '+pct+'%':'')+'</span>'+right+'</div><div class="cat-budget-mobile" style="font-size:13px;margin-top:3px;color:'+(over?'#d9534f':'var(--gray)')+'">'+mobile+'</div></div>';
}
function compactMobileSubSummaries(){
  if(!(window.matchMedia('(max-width:900px)').matches||window.matchMedia('(hover:none)').matches))return;
  ['dlWeekCat','dlMoCat'].forEach(function(id){
    var root=g(id);if(!root)return;
    root.querySelectorAll('div').forEach(function(el){
      if(el.children.length&&Array.prototype.some.call(el.children,function(c){return c.tagName==='DIV';}))return;
      var text=el.textContent||'';
      if(text.indexOf('썼어요')<0)return;
      var spent=(text.match(/썼어요\s*([\d,]+)/)||[])[1];
      if(!spent)return;
      var left=(text.match(/남음\s*([\d,]+)원/)||[])[1];
      var over=(text.match(/([\d,]+)원\s*초과/)||[])[1];
      var spentNum=parseInt(spent.replace(/,/g,''),10),budget=left?spentNum+parseInt(left.replace(/,/g,''),10):over?spentNum-parseInt(over.replace(/,/g,''),10):0;
      el.textContent=budget?fmtComma(spentNum)+' / '+fmtComma(budget)+'원':fmtComma(spentNum)+'원';
    });
  });
  var dueRoot=g('dlMoCat');if(!dueRoot)return;
  dueRoot.querySelectorAll('span').forEach(function(el){
    if(el.children.length===0&&(el.textContent||'').indexOf('결제 예정')>=0)el.textContent=el.textContent.replace(/\s*결제 예정\s*/g,' ').trim();
  });
}
function compactMobileWeekDueTitle(){
  if(!(window.matchMedia('(max-width:900px)').matches||window.matchMedia('(hover:none)').matches))return;
  var title=document.querySelector('#dlWeekDue .week-due-title,#dlWeekDue .weekly-due-panel>div:first-child');if(title)title.textContent='📅 이번 주 고정지출';
}
var renderActiveViewBase=renderActiveView;renderActiveView=function(){renderActiveViewBase();compactMobileSubSummaries();compactMobileWeekDueTitle();};
/* Direct renderer: status copy belongs to CSS, so mobile never needs a text-removal pass. */
function renderWeekDue(){var box=g('dlWeekDue');if(!box)return;var dd=dailyDate||todayStr(),items=fixedDueForWeek(),nodate=fixedNoDateForWeek(dd);if(!items.length&&!nodate.length){box.innerHTML='';return;}function row(nm,label,amt,paid,cat,sub,can){var remove=can?'<button type="button" class="segtip week-due-remove" data-tip="예정 목록에서 빼기§§(분류·지난 기록은 그대로)" onclick="dismissFixedPlan('+jsArg(cat)+','+jsArg(sub||'')+')">×</button>':'';return '<div class="week-due-row"><span class="week-due-main"><span class="week-due-name">'+dlEsc(nm)+'</span><span class="week-due-meta"><span>'+label+'</span>'+(amt>0?'<span>'+fmtComma(amt)+'원</span>':'')+'</span></span><span class="week-due-actions"><span class="week-due-status '+(paid?'week-due-paid':'week-due-pending')+'"><span class="week-due-status-icon">'+(paid?'✅':'□')+'</span></span>'+remove+'</span></div>';}var rows=items.map(function(it){var p=it.due.split('-'),label=parseInt(p[1],10)+'/'+parseInt(p[2],10)+'('+dlWeekdayKo(it.due)+')'+(it.kind==='settle'?' · 상환 정산':'');return row(it.sub?(it.cat+' › '+it.sub):it.cat,label,it.amt,it.paid,it.cat,it.sub,it.cat!=='대출이자'&&it.kind!=='settle');}).join('');rows+=nodate.map(function(it){return row(it.sub?(it.cat+' › '+it.sub):it.cat,'날짜 미정',it.amt,it.paid,it.cat,it.sub,it.cat!=='대출이자');}).join('');box.innerHTML='<div class="week-due-box"><div class="week-due-title">📅 이번 주 예정 고정지출</div>'+rows+'</div>';}
function setMoRevTab(t){dlMoRevTab=t;renderMonthReview();}
function monthReviewHtml(dateStr){var r=monthReviewOf(dateStr);var tabs=[['carrot','🥕 당근','이번 달 잘한 점, 칭찬할 점'],['whip','<img src="'+WHIP_IMG+'" alt="채찍" style="height:1.15em;vertical-align:-3px;margin-right:1px"> 채찍','이번 달 아쉬운 점, 고칠 점'],['best','🏆 베스트','이번 달 베스트 지출'],['worst','💸 워스트','이번 달 워스트 지출']];var cur=tabs.filter(function(t){return t[0]===dlMoRevTab;})[0]||tabs[0];var tabColors={carrot:'var(--carrot-mk,#3f9a68)',whip:'var(--whip-mk,#d9534f)',best:'var(--dcal-pay,#3E7CB1)',worst:'var(--dcal-fix,#C97B3C)'};var btns='<div style="display:flex;gap:18px;flex-wrap:wrap;border-bottom:1px solid var(--border);margin-bottom:12px">';tabs.forEach(function(t){var on=(t[0]===dlMoRevTab),col=tabColors[t[0]];btns+='<button type="button" onclick="setMoRevTab('+jsArg(t[0])+')" style="border:none;background:none;padding:8px 2px;margin-bottom:-1px;white-space:nowrap;font-size:13px;border-bottom:2px solid '+(on?col:'transparent')+';color:'+(on?col:'var(--gray)')+';font-weight:'+(on?'700':'400')+';cursor:pointer;font-family:inherit">'+t[1]+'</button>';});btns+='</div>';return '<div style="text-align:center;margin-bottom:12px"><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><div style="position:relative;display:inline-block"><span style="position:absolute;top:-8px;left:-8px;z-index:2">'+helpIcon('이번 달 당근·채찍·무지출·총지출을 그림 한 장으로 만들어 저장·공유할 수 있어요.')+'</span><button type="button" class="btn btn-ol" onclick="openMonthSummaryCard()" style="font-size:13px;padding:7px 14px;white-space:nowrap">📸 이번 달 결산 카드</button></div> <button type="button" class="btn btn-ol" onclick="openYearRollup()" style="font-size:13px;padding:7px 14px;white-space:nowrap">'+yearRollupIconHtml()+' 올해 모아보기</button></div></div><div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:14px">'+btns+'<textarea rows="1" class="ul-textarea" oninput="setMoRev('+jsArg(cur[0])+',this.value)" onchange="renderMonthReview()" placeholder="'+cur[2]+'">'+dlEsc(r[cur[0]]||'')+'</textarea></div>'+monthRollupHtml(dateStr);}
function withBudgetLine(dates){var ds=stackedCatDatasets(dates);var bdata=dates.map(function(d){var b=dailyBudgetOf(d);return b>0?b:0;});if(bdata.some(function(v){return v!=null;}))ds=ds.concat([{type:'line',label:'예산',data:bdata,borderColor:budgetLineColor(),backgroundColor:budgetLineColor(),borderDash:[6,4],borderWidth:2.5,pointRadius:2.8,pointBackgroundColor:budgetLineColor(),pointBorderWidth:0,pointHitRadius:6,fill:false,yAxisID:'yBudget',order:-1,spanGaps:false,tension:0}]);return ds;}
function dlChartMax(datasets){var hasB=datasets.some(function(d){return d.label==='예산';});if(!hasB)return null;var n=0;datasets.forEach(function(d){if(d.data&&d.data.length>n)n=d.data.length;});var top=0;for(var i=0;i<n;i++){var s=0;datasets.forEach(function(d){if(d.stack==='spend')s+=(parseFloat(d.data[i])||0);});if(s>top)top=s;}datasets.forEach(function(d){if(d.label==='예산')d.data.forEach(function(v){if(v!=null&&v>top)top=v;});});return top>0?Math.ceil(top*1.1):null;}
function renderWeekView(){if(!g('dlViewWeek'))return;['weekStartSel','weekStartSel2'].forEach(function(id){if(g(id))g(id).value=String(weekStartDay);});var dd=dailyDate||todayStr();var pastW=isPastPeriod('weekly',dd);var start=weekStartMon(dd);var endDt=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);var sLab=(start.getMonth()+1)+'/'+start.getDate();var eLab=(endDt.getMonth()+1)+'/'+endDt.getDate();var today=todayStr();var inWeek=(today>=localDateStr(start)&&today<=localDateStr(endDt));if(g('dlWkLabel'))g('dlWkLabel').textContent=(inWeek?'이번 주 ':'')+sLab+' – '+eLab;ensureFixedInWeekBudget(dd);renderWeekDue();renderMeal();if(g('dlWkBudget')){var _ws=sumCatBudget('weekly',dd);g('dlWkBudget').innerHTML=budgetCard('주간 예산',_ws>0?_ws:weeklyBudgetOf(dd),weekTotal(dd),'setWeeklyBudget',_ws>0);}if(g('dlWkCat'))g('dlWkCat').innerHTML=catBudgetHtml('weekly',dd,pastW);if(g('dlWkReview'))g('dlWkReview').innerHTML=weekReviewHtml(dd);applyReviewVis();var names=weekDayNames();var wdates=[];for(var i=0;i<7;i++){wdates.push(localDateStr(new Date(start.getFullYear(),start.getMonth(),start.getDate()+i)));}if(g('dlWeekChart')){var _wds=withBudgetLine(wdates);mkChart('dlWeekChart',{type:'bar',data:{labels:names,datasets:_wds},options:dlChartOpts(dlChartMax(_wds))});}}
var INCOME_CATS=['급여','상여','부수입','금융소득','기타'];
var INCOME_IMG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABICAYAAABGOvOzAAALHklEQVR42s2cfbBUdRnHP2d3uSDEW6A4IhiWvJSVoIYoI4pJRiripGOFmTGaM1ljEzU1U5qMOI5YIU42U2Y2QKISY6UGDSQlEpopKTlgVGiFBoKX95d7d7c/zvdpn/vj7O7ZvbvcPTNn9u7Zc34vz+95vs/3eX7PudAaRwbI6RMgCr4DZN3f5wM/BF4G3gEOAXuAzcBi4NKg7ZY+qg0w6yZ/ErAUOAIUq5wrgNOq9RG1wOQLwIeAa4EJwCCt5p+0mi/r3vHA48BIfe/UPX8FdgH9gdOBc53AdgBTgY2ur5Zb+ZuBw2VW8SAwV4LZ4a4/oWtJx0TgFSCve18EerWaKdgKXeImdQj4NXAfsAzY6X7rcH8vDDQ4505r92QJzITwsQQc6dEj0qq8IrXcBUwJ7hkFPCLt6NREliXgQni06fNOPVMAbtO1XCut/jS3qre5weckHIDBwG6t5FvAEAkvU6X9CPi4a//ucgLI9NDq4wZ4CHhYY+l0qx0BNwED9NvdMotsCjArAnvd952tCH4rNNBXnVZE7mwDNumet+QdohSey1b5Cj2bByar32wraEDRqTfAfzXIjH6zz48Ao3XPo0C7JlBM2c80B6B9y2lNK7IkW+Gr9Xde5CdKOflCgAVt4g9TnKBbwgRWaUIvuUl7gPuxGN/rDtlr7WO2c4X/APqlNKOmHmajP9XAtgvdk5jpacA5dbJWs/eHpBVFaVWPu0Pr/MvOTV0QqG2j3G1GAFjQuTAUQE/Yg9noM1JPxNQiB4CeLLW5ydQKtkWBbKfaGxIAcY95gUgs8DVdu8whduTu6xAO5CW4TA101jzGaAmyqNC5iznlekgAOa3Kz4C7gDECxX6K6grAfvn/TYr61gPbAr5QKAOAGQmvF3CrE/qaVnF1JvhvaHCdKeL7dmC5GGRIezMJCZRTgJXu+Y1An57yApEG63n+h12wUnA0OK/TvnckCOg3wLgyfb1PIfSOQHjjj7XZJ62Kj9juSAh1K52FIFZ4R+H0ccBZwC0SzN7guY3AmeUmHzVhpa2TvLs+VAmM8/Q5RjF7rsIYrK2k3zv17BHgTal7eGwFfiTXt18amG+2ivtjBHAj8EsNsljnWZCW5BOuh/f+B3gM+JSiyKrerhEa4CWbkVpeB1zsAh47DgJviJa+LsG0K+mRUdDybmA4cKqY4IkJHCIT+PqFwJNKf+0KxlaoIYCq2cYzDtU/CzyfsCqviddfI4DqVUMfA5XknCveUHReI+/+Pikhi9xUpPfqPhN4IZj02+L60wRS5QCy3Jk0gZz6es7F+XlpVO8KgNs0kBsr+/YTfwP4tuyfhFXJVFiZbAIoevfp7/sapb2BDuD7xyLp6aV7s2zXJr5Teb0hDVLFbAWgtfamyt5tDN9sJru1AQ1Sdsav+hIBllfVqA7BXinwHJjiGcORc+T3jRtc3AxNyDmV90D0pouva5l45ADUtKRNfrsovv+APEgl2mpCuMq5xa0SYKZRIGiTn6iw0ia/xpGPtKFqpVy+5e8O6vNfAs9qvN2E8KAb252N0gJrYFJg7w+6jnMpVzwKaPAI4n28M4g3QB7TCh5SH19N2b5p0jDhUJ54X3F4d3m/Tf6DatjIxD0J3iBNghNFcYuBv4mamkAPB8xuP3B8sMJptHQeR2+01AWIZj/DgH+6Rr9bY9rK7jlBWdlygU3eRXwFCWSxA9ZsyvGOlPAKxHUCbfXgQORserUb8KI6gW4QsMH568NVeH/eacLbwOUphWC//8q1dV49WGA33+4aek7SrAVZrZ37nZrbxF4EvqOA5QrgczKtDWXMopwQfBWJLcz1ro3bazUD6+Bsp57tNahiqPonAvtccsMGlamgytcoDebzBO1S76jKs1nFGuZJVtUKhNaID2iurwNMTFCXqg2jrH8Msr05R3O9aY0j3ivIO6/wgwRXej4wXwvm5/Cqc6X90ka91uh1bvKr6kRSu/8GqbCtyAL1UwnZe+vzRocJxg8GB55hqdOUtcDnJYAHnODHptEC89N95KIsATG+TkKRc8L0vn1lCoGaXz8eOKBzk2L9k4PJ3BuQM8Orpx3eTCuTrEkc8LWuoYe7waY8lviwNQ9MT+nfM0qdjawyhmHStLWBIMzsrkrTn2nAeuefz0wjuRTu9AU3oAJxtcdHExIqabkJFdJclwHPBjxjibuvYl/jnb39oQHpYxPcuc4DdLjPr6QIojIpXG8UPJ9RqL6brvWCg6rNaa574IYGxdXW2dVOJY84+3xK2WEaIPCQob6feDfJ5vS8y1UkpsbX6cZ9LpvTiPSSacIFLtztdALZA3zdCbsRcby11Y94J6no3HDfJK06xUV7a5uwX5B1gLUkge3Z4CY0UAi+5ugR18+jSX3McDfc06S0UphE3ew8xBEXBX66gULIOIx42s3xlrCPW92Pn2liXs17lQHA9xLcVhGY1UATzDhavk0CPyi2+X9qvch1PrEbK+BTXJWyRL7tyymVxHa4cPj0GnIOaTHhSjfPlV5Aqx3dfE8DpV9NG2xgZ4j7F5wm/KLByU1rZ4XzQhfYj3928ffQOkAwcsxvhtjeDOC9Kdpqc5pQdEmRfZS2xBq1fRfRtV7I6o7Z6LK8A+ro1KS7PKCj84OVrvb8SwFhmtpgLTDGa+x0FzA806CGUaLDQCZPXJhYTClQC2NxjHRwEzxRUVkj1P6FGUVcFor2rqPhorOvrGvjbOUTOhWMVKoDKNC1VjASGDbysHE+665NQpTUVG9MnSBo9//WuTXThpnBKvhNUIvSTiXe4TH7zFMqgWkUIFs7o8Ks0f3Obi+p0+6MdIwVgIWlL/Ndrj48xsp8fKzwFxq/xR051bc8woackpF2nCVVrrVjq+HbpGTncq1wXhOZQ1y3u0b97SQuh5sAfEIcPe8GOs892+iylk7XZg7iN7YOBaFw1A2gAbiIeKu8GCRFy50+Lri3SVzEJ2vbXQaJnFyQsbCx3WRhJoQThC8FulZ0lKvvaSfe94cGbm4mcIFJbgxLrWLzcTGyNuBLwBdJ92pK0pEXuG2nVKNrk/q3vMRxum+38pCrgZ8T1w016/0+e99guvv+jA+JD2hQB1w2NdsNtB0p07LV3iGtGChAHMbR5TPNqvAwje6vRbD03Ejf6X1OHX+fkG6qNfi4ySVZOl0sniSwZtf3mLtd4Ob4kzD3NlR02Gx1QZWcXTUMeCiw8VmUNkX8y1HNDrps8rMcKO9T4BeFg54eoPIddapnJFW/kPh1t3WU8vrHqlDZ84hZlErvi8SbKEfNyb7MofQ+n6lKX3dPq7+O7t8pyFGqSbbJ31Up6WMXv0XXMvYNWk0vrGpMzZe4Rcdg0mE/U5Rr9G53XoJ2lLXh2fII3o4XiTiRIIxjqRleuGG/kwW4nmvsprTRm4pimxAmUEqZe9a2zFHYpGdzdC2MrBXw/DOZIIhKEvQI4AvyXiHJesoFVnUVS2SJd1u2JrC3LcT/ymImR1eHVvLH2TJnWgY4UIxujmKX9oSxrVcesCKIp0lUGCsbRFzNMVtJy/DYQ1wYvVHnZuI9+u1SwYOkr9qORJIGyD0PV4ptHPAB4hehkqLLfcDviIuzn6T0rlC594tqKnnJO1JxEfBJpa1GVUlC7JEA9ijm3y8PY1lgb899iHd03qXJ21kJX3YrzfUE8T9g+HuZcdMdAXj19Q32Jd5YnUxctjqOuHS9f5PA74Bi+S0K4NYR7wFuS8hN5NNOql5eTUInfcSvRxPX64wSNgxTIqK/hNYWAJpFjEekIXuJ3wnaTvwWyFat7BYFTHsTTDXjMkqpj/8BOtyuU4hYz9YAAAAASUVORK5CYII=';
let incomeData={}; /* 수입: {정산월키:[{cat,amount(원)}]} — 월별만, localStorage rs_income */
var incomeCats=null;
var PIN_IMG='data:image/png;base64,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';
function loadIncomeCats(){try{var v=JSON.parse(localStorage.getItem('rs_income_cats')||'null');incomeCats=(Array.isArray(v)&&v.length)?v.slice():INCOME_CATS.slice();}catch(e){incomeCats=INCOME_CATS.slice();}}
function saveIncomeCats(){try{lsSet('rs_income_cats',JSON.stringify(incomeCats));}catch(e){}}
function getIncomeCats(){if(!incomeCats)loadIncomeCats();return incomeCats;}
function openIncomeCatModal(){renderIncomeCatList();var m=g('incomeCatModal');if(m)m.classList.add('open');}
function renderIncomeCatList(){var box=g('incomeCatList');if(!box)return;var cats=getIncomeCats();box.innerHTML=cats.map(function(c,i){return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:7px"><input type="text" value="'+dlEsc(c)+'" onchange="renameIncomeCat('+i+',this.value)" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111"><button type="button" onclick="delIncomeCat('+i+')" title="삭제" style="border:none;background:none;cursor:'+(cats.length<=1?'default':'pointer')+';color:'+(cats.length<=1?'#eee':'#ccc')+';font-size:16px;padding:0 4px">\u00d7</button></div>';}).join('');}
function addIncomeCat(){var inp=g('incomeCatNew');if(!inp)return;var v=(inp.value||'').trim();if(!v)return;var cats=getIncomeCats();if(cats.indexOf(v)>=0){inp.value='';return;}cats.push(v);saveIncomeCats();inp.value='';renderIncomeCatList();renderMoIncome(dailyDate||todayStr());}
function renameIncomeCat(i,val){var cats=getIncomeCats();var v=(val||'').trim();if(!v){renderIncomeCatList();return;}if(cats.indexOf(v)>=0&&cats[i]!==v){renderIncomeCatList();return;}var old=cats[i];cats[i]=v;saveIncomeCats();Object.keys(incomeData).forEach(function(mk){(incomeData[mk]||[]).forEach(function(it){if(it.cat===old)it.cat=v;});});saveIncome();applyIncomeToRoadmap(_incMk());renderIncomeCatList();renderMoIncome(dailyDate||todayStr());}
function delIncomeCat(i){var cats=getIncomeCats();if(cats.length<=1)return;cats.splice(i,1);saveIncomeCats();renderIncomeCatList();renderMoIncome(dailyDate||todayStr());}
var incomeMap=null,incomeRoadmapOn=false;
function loadIncomeMap(){try{var v=JSON.parse(localStorage.getItem('rs_income_map')||'null');incomeMap=(v&&typeof v==='object')?v:{};}catch(e){incomeMap={};}incomeRoadmapOn=localStorage.getItem('rs_income_rm')==='1';}
function saveIncomeMap(){try{lsSet('rs_income_map',JSON.stringify(incomeMap));lsSet('rs_income_rm',incomeRoadmapOn?'1':'0');}catch(e){}}
function incomeMapOf(cat){if(!incomeMap)loadIncomeMap();if(cat in incomeMap)return incomeMap[cat];return (cat==='급여')?'savings':'income';}
function _incomeRowSums(mk){var items=incomeData[mk]||[];var s=0,i=0;items.forEach(function(it){var t=incomeMapOf(it.cat);var amt=parseInt(it.amount,10)||0;if(t==='savings')s+=amt;else if(t==='income')i+=amt;});return {s:s,i:i};}
function applyIncomeToRoadmap(mk){if(!incomeRoadmapOn||!mk)return;var yr=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;if(!yr||mi<0)return;var sums=_incomeRowSums(mk);if(!shData.savings)shData={savings:{},income:{},target:{}};shData.savings[yr+'_'+mi]=sums.s;shData.income[yr+'_'+mi]=sums.i;if(typeof renderShort==='function')renderShort();if(typeof save==='function')save();}
function openIncomeMapModal(){var t=g('incomeRmToggle');if(t)t.checked=incomeRoadmapOn;renderIncomeMapList();var m=g('incomeMapModal');if(m)m.classList.add('open');}
function toggleIncomeRoadmap(on){incomeRoadmapOn=!!on;saveIncomeMap();if(incomeRoadmapOn)applyIncomeToRoadmap(_incMk());renderIncomeMapList();}
function setIncomeMap(cat,val){if(!incomeMap)loadIncomeMap();incomeMap[cat]=val;saveIncomeMap();if(incomeRoadmapOn)applyIncomeToRoadmap(_incMk());renderIncomeMapList();}
function renderIncomeMapList(){var box=g('incomeMapList');if(!box)return;var cats=getIncomeCats();var mk=_incMk();var sums=_incomeRowSums(mk);var opt=function(sel){return '<option value="savings"'+(sel==='savings'?' selected':'')+'>급여 행</option><option value="income"'+(sel==='income'?' selected':'')+'>기타소득 행</option><option value=""'+(sel===''?' selected':'')+'>반영 안 함</option>';};box.innerHTML=cats.map(function(c){return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:7px"><span style="flex:1;font-size:13px;color:#111;word-break:keep-all">'+dlEsc(c)+'</span><select onchange="setIncomeMap('+jsArg(c)+',this.value)" style="padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111;background:#fff">'+opt(incomeMapOf(c))+'</select></div>';}).join('')+'<div style="font-size:13px;color:var(--gray);margin-top:10px;padding-top:10px;border-top:1px solid var(--tbl-border);line-height:1.6">이 달 기준 → 급여 행 <b style="color:#111">'+fmtComma(sums.s)+'원</b> · 기타소득 행 <b style="color:#111">'+fmtComma(sums.i)+'원</b><br>같은 행으로 지정한 항목은 합산돼요. 프로젝트 이자는 이미 자동연결돼 있어요.</div>';}
function loadIncome(){try{var v=JSON.parse(localStorage.getItem('rs_income')||'null');incomeData=(v&&typeof v==='object')?v:{};}catch(e){incomeData={};}}
function saveIncome(){try{lsSet('rs_income',JSON.stringify(incomeData));}catch(e){}}
function _incArr(mk){if(!incomeData[mk])incomeData[mk]=[];return incomeData[mk];}
function monthIncomeTotal(dateStr){var a=incomeData[monthKey(dateStr||todayStr())]||[];return a.reduce(function(s,it){return s+(parseInt(it.amount,10)||0);},0);}
function _incMk(){return monthKey(dailyDate||todayStr());}
function addIncomeItem(){_incArr(_incMk()).push({cat:(getIncomeCats()[0]||'기타'),amount:0});saveIncome();applyIncomeToRoadmap(_incMk());renderMoIncome(dailyDate||todayStr());}
function setIncomeCat(idx,val){var a=_incArr(_incMk());if(a[idx]){a[idx].cat=val;saveIncome();applyIncomeToRoadmap(_incMk());renderMoIncome(dailyDate||todayStr());}}
function setIncomeName(idx,val){var a=_incArr(_incMk());if(a[idx]){a[idx].name=String(val||'').trim();saveIncome();renderMoIncome(dailyDate||todayStr());}}
function setIncomeAmt(idx,val){var a=_incArr(_incMk());if(a[idx]){a[idx].amount=parseInt(String(val).replace(/[^0-9]/g,''),10)||0;saveIncome();applyIncomeToRoadmap(_incMk());renderMoIncome(dailyDate||todayStr());}}
function delIncomeItem(idx){var a=_incArr(_incMk());a.splice(idx,1);saveIncome();applyIncomeToRoadmap(_incMk());renderMoIncome(dailyDate||todayStr());}
function _incomeWaterfall(inc,fix,varr,spec,net,incBreak){
 if(inc<=0&&fix<=0&&varr<=0&&spec<=0)return '';
 var H=104,bottom=Math.min(0,net),top=Math.max(inc,0),range=top-bottom;if(range<=0)range=1;
 function yb(v){return (v-bottom)/range*H;}
 function bar(lo,hi,c,op){var b=yb(lo),h=yb(hi)-yb(lo);if(h<1&&hi!==lo)h=1;return '<div style="position:absolute;left:14%;right:14%;bottom:'+b+'px;height:'+h+'px;background:'+c+';opacity:'+(op||1)+';border-radius:2px"></div>';}
 function col(inner,label,val,vc){return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px"><div style="position:relative;width:100%;height:'+H+'px">'+inner+'</div><div style="font-size:13px;color:var(--gray);text-align:center;line-height:1.35">'+label+'<br><span style="color:'+vc+';font-weight:600;white-space:nowrap">'+val+'</span></div></div>';}
 var gm='var(--carrot-mk,#3f9a68)',rm='var(--whip-mk,#d9534f)';
 var incBars='';var _run=0;(incBreak||[]).forEach(function(seg){if(seg.amount<=0)return;incBars+=bar(_run,_run+seg.amount,seg.color,1);_run+=seg.amount;});if(!incBars)incBars=bar(0,inc,gm,1);
 var incLegend=(incBreak&&incBreak.length>1)?('<div style="display:flex;flex-wrap:wrap;gap:8px 10px;justify-content:center;margin-top:9px">'+incBreak.map(function(s){return '<span style="font-size:13px;color:var(--gray);display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:'+s.color+'"></span>'+dlEsc(s.label)+'</span>';}).join('')+'</div>'):'';
 var afterFix=inc-fix,afterVar=afterFix-varr;
 return '<div style="background:var(--ac-light,#f6f4ef);border-radius:8px;padding:12px 10px 10px;margin-bottom:12px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">이 달의 돈의 흐름</div><div style="display:flex;gap:4px;align-items:flex-end">'
  +col(incBars,'수입',fmtComma(inc),gm)
  +col(bar(afterFix,inc,rm,1),'고정비','−'+fmtComma(fix),rm)
  +col(bar(afterVar,afterFix,rm,0.5),'변동비','−'+fmtComma(varr),rm)
  +col(bar(net,afterVar,rm,0.35),'특별비','−'+fmtComma(spec),rm)
  +col(bar(Math.min(0,net),Math.max(0,net),(net>=0?gm:rm),1),'순액',(net<0?'−':'')+fmtComma(Math.abs(net)),(net>=0?gm:rm))
  +'</div>'+incLegend+'</div>';
}
function _incomeCompareHtml(dd){
 var mk=monthKey(dd),pmk=prevMonthKey(mk);
 var cur=incomeData[mk]||[],prev=incomeData[pmk]||[];
 function agg(arr){var m={};arr.forEach(function(it){var c=it.cat||'기타';m[c]=(m[c]||0)+(parseInt(it.amount,10)||0);});return m;}
 var tm=agg(cur),pm=agg(prev);
 if(typeof getMonthlyProjectWon==='function'){var _ty=parseInt(mk.slice(0,4),10),_tmi=parseInt(mk.slice(5,7),10)-1;var _tpj=Math.round(getMonthlyProjectWon(_ty,_tmi)||0);if(_tpj>0)tm['프로젝트 이자']=(tm['프로젝트 이자']||0)+_tpj;var _py=parseInt(pmk.slice(0,4),10),_pmi=parseInt(pmk.slice(5,7),10)-1;var _ppj=Math.round(getMonthlyProjectWon(_py,_pmi)||0);if(_ppj>0)pm['프로젝트 이자']=(pm['프로젝트 이자']||0)+_ppj;}
 var cats=Object.keys(tm).concat(Object.keys(pm)).filter(function(v,i,a){return a.indexOf(v)===i;}).filter(function(c){return (tm[c]||0)>0||(pm[c]||0)>0;});
 if(!cats.length)return '';
 cats.sort(function(a,b){return (tm[b]||0)-(tm[a]||0);});
 var gm='var(--carrot-mk,#3f9a68)',rm='var(--whip-mk,#d9534f)';
 function dcell(t,p){var d=t-p;var has=(p>0||t>0);var dCol=has?(d>0?gm:(d<0?rm:'var(--gray)')):'var(--gray)';var dTxt=(has&&d!==0)?((d>0?'▲ ':'▼ ')+fmtComma(Math.abs(d))):'-';var pc=(p>0)?(' ('+(d>0?'+':'')+Math.round(d/p*100)+'%)'):'';return '<td style="padding:6px 6px;text-align:right;font-size:13px;color:'+dCol+'">'+dTxt+pc+'</td>';}
 var rows=cats.map(function(c){var t=tm[c]||0,p=pm[c]||0;return '<tr style="border-top:1px solid var(--tbl-border)"><td style="padding:6px 6px;font-size:13px;word-break:keep-all">'+dlEsc(c)+'</td><td style="padding:6px 6px;text-align:right;font-size:13px;font-weight:600">'+fmtComma(t)+'</td><td style="padding:6px 6px;text-align:right;font-size:13px;color:var(--gray)">'+fmtComma(p)+'</td>'+dcell(t,p)+'</tr>';}).join('');
 var tt=0,tp=0;cats.forEach(function(c){tt+=tm[c]||0;tp+=pm[c]||0;});
 var totRow='<tr style="border-top:2px solid var(--tbl-border);font-weight:700;background:var(--st-tot)"><td style="padding:7px 6px;font-size:13px">합계</td><td style="padding:7px 6px;text-align:right;font-size:13px">'+fmtComma(tt)+'</td><td style="padding:7px 6px;text-align:right;font-size:13px;color:var(--gray)">'+fmtComma(tp)+'</td>'+dcell(tt,tp)+'</tr>';
 return '<div style="margin-top:18px"><div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:8px">수입 비교 <span style="text-transform:none;letter-spacing:0">(지난달 대비)</span></div><table style="width:100%;border-collapse:separate;border-spacing:0"><thead><tr style="color:var(--gray)"><th style="text-align:left;padding:4px 6px;font-size:13px">분류</th><th style="text-align:right;padding:4px 6px;font-size:13px">이번달</th><th style="text-align:right;padding:4px 6px;font-size:13px">지난달</th><th style="text-align:right;padding:4px 6px;font-size:13px">증감</th></tr></thead><tbody>'+rows+totRow+'</tbody></table></div>';
}
function _incColor(cat){var pal=['#3f9a68','#5b8def','#e0a458','#9b6dd0','#e0457b','#2fa9a0','#c98a3e','#e8623f'];var cats=getIncomeCats();var i=cats.indexOf(cat);if(i<0){var h=0,st=String(cat||'');for(var k=0;k<st.length;k++)h=(h*31+st.charCodeAt(k))>>>0;i=cats.length+(h%pal.length);}return pal[i%pal.length];}
function moIncomeFlowHtml(dateStr){var dd=dateStr||todayStr();var mk=monthKey(dd);
 var items=incomeData[mk]||[];
 var _iyr=parseInt(mk.slice(0,4),10),_imi=parseInt(mk.slice(5,7),10)-1;var projInc=(typeof getMonthlyProjectWon==='function')?Math.round(getMonthlyProjectWon(_iyr,_imi)||0):0;
 var inc=items.reduce(function(s,it){return s+(parseInt(it.amount,10)||0);},0)+projInc;
 var ents=monthEntries(dd);var exp=0,fix=0,varr=0,spec=0;
 ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;exp+=a;var grp=catGroupOf(e.cat||e.category||'');if(grp==='고정')fix+=a;else if(grp==='특별')spec+=a;else varr+=a;});
 var net=inc-exp;
 var ncol=net>=0?'#3f9a68':'#d9534f';
 var _mkp=mk.split('-');var moLabel=_mkp[0]+'년 '+parseInt(_mkp[1],10)+'월';
 var pct1=function(v){return (inc>0)?(' <span style="font-size:13px;font-weight:400">('+(v/inc*100).toFixed(1)+'%)</span>'):'';};
 var sumCard='<div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:9px">'+dlEsc(moLabel)+' 수입 · 순액</div><div style="display:flex;gap:8px;text-align:center;margin-bottom:12px">'
  +'<div style="flex:1;background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:9px 5px"><div style="font-size:13px;color:var(--gray)">수입</div><div style="font-size:15px;font-weight:700;color:var(--carrot-mk,#3f9a68)">'+fmtComma(inc)+'</div></div>'
  +'<div style="flex:1;background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:9px 5px"><div style="font-size:13px;color:var(--gray)">지출</div><div style="font-size:15px;font-weight:700;color:var(--whip-mk,#d9534f)">'+fmtComma(exp)+pct1(exp)+'</div></div>'
  +'<div style="flex:1;background:#fff;border:1.5px solid '+ncol+';border-radius:8px;padding:9px 5px"><div style="font-size:13px;color:var(--gray)">순액</div><div style="font-size:15px;font-weight:700;color:'+ncol+'">'+(net<0?'−':'')+fmtComma(Math.abs(net))+pct1(net)+'</div></div>'
  +'</div>';
 var _byc={};items.forEach(function(it){var c=it.cat||'기타';_byc[c]=(_byc[c]||0)+(parseInt(it.amount,10)||0);});var incBreak=Object.keys(_byc).filter(function(c){return _byc[c]>0;}).sort(function(a,b){return _byc[b]-_byc[a];}).map(function(c){return {label:c,amount:_byc[c],color:_incColor(c)};});if(projInc>0)incBreak.push({label:'프로젝트 이자',amount:projInc,color:'var(--ac)'});
 var wf=_incomeWaterfall(inc,fix,varr,spec,net,incBreak);
 var selSt="padding:5px 8px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111;background:#fff";
 var inSt="flex:1;min-width:84px;text-align:right;padding:5px 7px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111";
 var nmSt="flex:1.3;min-width:0;padding:5px 7px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:inherit;color:#111";
 var rows=items.map(function(it,idx){
   var cats=getIncomeCats().slice();if(it.cat&&cats.indexOf(it.cat)<0)cats.push(it.cat);
   var opts=cats.map(function(c){return '<option'+(c===it.cat?' selected':'')+'>'+dlEsc(c)+'</option>';}).join('');
   var av=(parseInt(it.amount,10)||0);
   return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:7px"><select onchange="setIncomeCat('+idx+',this.value)" style="'+selSt+'">'+opts+'</select><input type="text" value="'+dlEsc(it.name||'').replace(/\"/g,'&quot;')+'" placeholder="내용 (선택)" onchange="setIncomeName('+idx+',this.value)" style="'+nmSt+'"><input type="text" inputmode="numeric" value="'+(av?av.toLocaleString():'')+'" placeholder="금액" oninput="commaInput(this)" onchange="setIncomeAmt('+idx+',this.value)" style="'+inSt+'"><span style="font-size:13px;color:var(--gray);white-space:nowrap">원</span><button type="button" onclick="delIncomeItem('+idx+')" title="삭제" style="border:none;background:none;cursor:pointer;color:#ccc;font-size:16px;line-height:1;padding:0 3px">×</button></div>';
 }).join('');
 (function(){var cnt={},sum={};items.forEach(function(it){var c=it.cat||'기타';cnt[c]=(cnt[c]||0)+1;sum[c]=(sum[c]||0)+(parseInt(it.amount,10)||0);});var subs=Object.keys(cnt).filter(function(c){return cnt[c]>=2;});if(subs.length)rows+='<div style="font-size:12.5px;color:var(--gray);margin:-2px 0 8px;word-break:keep-all">'+subs.map(function(c){return dlEsc(c)+' '+cnt[c]+'건 소계 <b style="color:#111">'+fmtComma(sum[c])+'원</b>';}).join(' · ')+'</div>';})();
 var projRow=projInc>0?'<div style="display:flex;gap:6px;align-items:center;margin-bottom:7px;padding:2px 0"><span style="flex:1;font-size:13px;color:#111;margin-left:2px">프로젝트 이자 <span style="color:var(--ac);font-size:13px">자동연결</span></span><span style="font-size:13px;font-weight:600;color:var(--carrot-mk,#3f9a68)">'+fmtComma(projInc)+'</span><span style="font-size:13px;color:var(--gray)">원</span></div>':'';
 if(!rows&&!projRow)rows='<div style="font-size:13px;color:var(--gray);padding:2px 0 8px">아직 수입 기록이 없어요. 급여·부수입 등을 추가해 보세요.</div>';
 rows=projRow+rows;
 var section='<div style="display:flex;justify-content:space-between;align-items:baseline;margin:2px 0 9px"><span style="font-weight:700;font-size:13px"><img src="'+INCOME_IMG+'" alt="수입" style="height:1.15em;vertical-align:-2px"> 이 달 수입'+helpIcon('같은 분류로 여러 줄 넣어도 돼요(예: 계좌별 이자를 금융소득으로 각각). 합계에 자동으로 더해지고, 한 분류가 2건 이상이면 목록 아래에 분류별 소계가 떠요.')+'</span><span style="font-size:13px;color:var(--gray);white-space:nowrap">합계 '+fmtComma(inc)+'원</span></div>'
   +rows
   +'<div style="display:flex;gap:10px;align-items:center;margin-top:2px;flex-wrap:wrap"><button type="button" onclick="addIncomeItem()" style="border:1px dashed var(--border);background:none;border-radius:99px;padding:5px 14px;font-size:13px;color:var(--gray);cursor:pointer;white-space:nowrap">+ 수입 추가</button><button type="button" onclick="openIncomeCatModal()" style="border:none;background:none;color:var(--ac);font-size:13px;cursor:pointer;padding:5px 2px;white-space:nowrap">✏️ 카테고리 편집</button><button type="button" onclick="openIncomeMapModal()" style="border:none;background:none;color:var(--ac);font-size:13px;cursor:pointer;padding:5px 2px;white-space:nowrap">🔗 로드맵 연결</button></div>';
 return '<div style="background:#fff;border:1px solid var(--tbl-border);border-radius:10px;padding:13px 13px 15px">'+sumCard+wf+section+_incomeCompareHtml(dd)+'</div>';
}
function renderMoIncome(dateStr){
  /* ★ 세션 36에 moIncomeFlowHtml을 분리하면서 본문이 비어 정산 패널이 갱신되지 않던 회귀 수정.
     수입 추가/삭제/금액·분류 변경 후 이 함수가 유일한 재렌더 경로다. */
  var dd=dateStr||dailyDate||todayStr();
  var box=g('dlMoSettle');
  if(box&&typeof dlMoSettleOpen!=='undefined'&&dlMoSettleOpen&&typeof moIncomeFlowHtml==='function')box.innerHTML=moIncomeFlowHtml(dd);
  if(typeof renderAnalysis==='function')renderAnalysis();
}
var dlMonthSlide=0,_moBarCfg=null,_moChartDd='';
function setMonthSlide(i){dlMonthSlide=i;var s0=g('mchS0'),s1=g('mchS1');if(s0)s0.style.display=i===0?'':'none';if(s1)s1.style.display=i===1?'':'none';var t0=g('mchT0'),t1=g('mchT1');if(t0){t0.style.color=i===0?'var(--ac)':'var(--gray)';t0.style.fontWeight=i===0?'700':'400';}if(t1){t1.style.color=i===1?'var(--ac)':'var(--gray)';t1.style.fontWeight=i===1?'700':'400';}if(i===0){if(_moBarCfg&&g('dlMonthChart'))mkChart('dlMonthChart',_moBarCfg);}else{renderMonthDonut(_moChartDd||dailyDate||todayStr());}}
function renderMonthDonut(dd){if(!g('dlMonthDonut'))return;var ents=monthEntries(dd);var byCat={};ents.forEach(function(e){var a=entrySpend(e);if(a===0)return;var c=e.cat||e.category||'미분류';byCat[c]=(byCat[c]||0)+a;});var cats=Object.keys(byCat).filter(function(c){return byCat[c]>0;}).sort(function(a,b){return byCat[b]-byCat[a];});if(!cats.length){if(charts['dlMonthDonut']){charts['dlMonthDonut'].destroy();charts['dlMonthDonut']=null;}return;}var data=cats.map(function(c){return byCat[c];});var cols=cats.map(function(c){return catColor(c);});var tot=data.reduce(function(s,x){return s+x;},0);mkChart('dlMonthDonut',{type:'doughnut',data:{labels:cats,datasets:[{data:data,backgroundColor:cols,borderColor:'#fff',borderWidth:2,hoverOffset:12,hoverBorderColor:'#fff',hoverBorderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',events:['click'],onClick:function(){},plugins:{legend:{position:'bottom',onClick:function(){},labels:{font:{size:Math.round(11*dlFontScale())},boxWidth:12,padding:7,usePointStyle:true,pointStyle:'circle'}},tooltip:{position:'nearest',displayColors:true,padding:9,titleFont:{size:Math.round(13*dlFontScale())},bodyFont:{size:Math.round(13*dlFontScale())},callbacks:{label:function(ctx){var v=ctx.parsed||0;var p=tot?Math.round(v/tot*100):0;return ctx.label+': '+v.toLocaleString()+'원 ('+p+'%)';}}}}}});}
function renderMonthView(){if(!g('dlViewMonth'))return;['settleStartSel','settleStartSel2'].forEach(function(id){var _ss=g(id);if(_ss){if(!_ss.options.length){var _so='';for(var _si=1;_si<=31;_si++){_so+="<option value='"+_si+"'>"+(_si===1?'매월 1일 (달력월)':(_si+'일'))+'</option>';}_ss.innerHTML=_so;}_ss.value=String(settleStartDay);}});var dd=dailyDate||todayStr();var p=dd.split('-');var y=parseInt(p[0]),mo=parseInt(p[1]);var pastM=isPastPeriod('monthly',dd);var _mkL=monthKey(dd),_mpL=_mkL.split('-'),_rgL=monthRangeLabel(_mkL);if(g('dlMoLabel'))g('dlMoLabel').textContent=_mpL[0]+'년 '+parseInt(_mpL[1],10)+'월'+(_rgL?' ('+_rgL+')':'');var ents=monthEntries(dd);var total=ents.reduce(function(s,e){return s+entrySpend(e);},0);if(g('dlMoTotal')){var _ms=sumCatBudget('monthly',dd);g('dlMoTotal').innerHTML=budgetCard('월간 예산',_ms>0?_ms:monthlyBudgetOf(dd),total,'setMonthlyBudget',_ms>0,null,groupSpendOf('monthly',dd));}if(g('dlMoCat'))g('dlMoCat').innerHTML=catBudgetHtml('monthly',dd,pastM);if(g('dlMoReview'))renderMonthReview();applyReviewVis();var _mk2=monthKey(dd),_f2=monthFirstDate(_mk2),_l2=monthLastDate(_mk2);var labels=[],mdates=[];var _cx=new Date(_f2+'T00:00:00'),_ex=new Date(_l2+'T00:00:00'),_gx=0;while(_cx<=_ex&&_gx<40){var _dx=localDateStr(_cx);labels.push(String(parseInt(_dx.slice(8,10),10)));mdates.push(_dx);_cx.setDate(_cx.getDate()+1);_gx++;}if(g('dlMonthChart')){var _mds=withBudgetLine(mdates);_moBarCfg={type:'bar',data:{labels:labels,datasets:_mds},options:dlChartOpts(dlChartMax(_mds))};_moChartDd=dd;setMonthSlide(dlMonthSlide);}var _imN=g('dlMoImpNote');if(_imN)_imN.innerHTML=monthSumNoteHtml(dd);renderMoConsume(dd);var _msBox=g('dlMoSettle');if(_msBox&&dlMoSettleOpen)_msBox.innerHTML=moIncomeFlowHtml(dd);}
function spYearNav(dir){renderSpecialView._year=(renderSpecialView._year||parseInt((dailyDate||todayStr()).slice(0,4),10))+dir;renderActiveView();}
function _spChartOpts(){
  var _fs=(typeof dlFontScale==='function')?dlFontScale():1;
  return {responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:true,position:'top',labels:{boxWidth:10,boxHeight:10,font:{size:Math.round(10*_fs)},padding:7}},
      tooltip:{titleFont:{size:Math.round(12*_fs)},bodyFont:{size:Math.round(12*_fs)},
        callbacks:{label:function(ctx){return (ctx.dataset.label||'')+': '+fmtComma(ctx.parsed.y||0)+'원';}}}},
    scales:{x:{grid:{display:false},ticks:{font:{size:Math.round(10*_fs)}}},
      y:{beginAtZero:true,ticks:{font:{size:Math.round(10*_fs)},callback:function(v){return abbrWon(v);}}}}};
}
function setSpecialChartTab(i){
  dlSpecialChartTab=i;
  var s0=g('spChS0'),s1=g('spChS1');
  if(s0)s0.style.display=(i===0)?'':'none';
  if(s1)s1.style.display=(i===1)?'':'none';
  var t0=g('spChT0'),t1=g('spChT1');
  if(t0){t0.style.color=(i===0)?'var(--ac)':'var(--gray)';t0.style.fontWeight=(i===0)?'700':'400';}
  if(t1){t1.style.color=(i===1)?'var(--ac)':'var(--gray)';t1.style.fontWeight=(i===1)?'700':'400';}
  if(i===0){if(_spMonBarCfg&&g('spMonthChart'))mkChart('spMonthChart',_spMonBarCfg);}
  else{if(_spCatBarCfg&&g('spCatChart'))mkChart('spCatChart',_spCatBarCfg);}
}
var dlSpecialChartTab=0,_spMonBarCfg=null,_spCatBarCfg=null;
function renderSpecialView(){
  var box=g('dlSpecialBody');if(!box)return;
  if(!dailyTree)loadDailyCats();
  var yr=renderSpecialView._year||parseInt((dailyDate||todayStr()).slice(0,4),10);
  renderSpecialView._year=yr;
  var names=specialCatNames();
  var yd=specialYearData(yr,false);
  var budgetSum=specialYearSum(yr);
  var settleSum=specialYearSettleSum(yr);
  var monLabels=MONTHS;
  var head='<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">'
    +'<div style="display:flex;align-items:center;gap:8px;white-space:nowrap"><button type="button" class="btn btn-ol" onclick="spYearNav(-1)">◀</button><span style="font-size:16px;font-weight:700;white-space:nowrap">'+yr+'년</span><button type="button" class="btn btn-ol" onclick="spYearNav(1)">▶</button></div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
    +'<button type="button" class="btn btn-ol" onclick="addDlCat(\'특별\')">+ 항목 추가</button>'
    +'</div></div>';
  var overallCard='<div style="margin-bottom:16px">'+budgetCard('연간 특별지출',budgetSum,settleSum,'',true)+'</div>';
  if(!names.length){
    box.innerHTML=head+overallCard+'<div class="empty-guide">아직 특별지출 대분류가 없어요.<br><b>+ 항목 추가</b>로 경조사·명절·여행처럼 <b>매년 반복되지만 매달은 아닌</b> 지출을 따로 계획해보세요.</div>';
    return;
  }
  /* 단기 로드맵(.xl)과 같은 표 문법 재사용 — sticky 항목 열(.rl) · 테마 헤더(.col-hdr) · 합계 열(.sum-cell) · 합계 행(.r-total) */
  var hdr='<td class="rl col-hdr">항목</td>'+monLabels.map(function(m){return '<td class="col-hdr" style="text-align:center">'+m+'</td>';}).join('')+'<td class="col-hdr" style="text-align:center">합계</td>';
  var evRow='<tr><td class="rl sp-memo-rl">메모</td>'+monLabels.map(function(m,mi){var v=(yd&&yd.ev&&yd.ev[mi])||'';return '<td class="sp-memo-td" style="padding:4px"><textarea class="sp-memo-in" rows="1" placeholder="메모" oninput="ar(this)" onchange="setSpecialEvent('+yr+','+mi+',this.value)">'+dlEsc(v)+'</textarea></td>';}).join('')+'<td class="sp-memo-td"></td></tr>';
  var monBudget=monLabels.map(function(m,mi){var s=0;names.forEach(function(c){var arr=(yd&&yd.b&&yd.b[c])||[];s+=parseFloat(arr[mi])||0;});return s;});
  var monActual=monLabels.map(function(m,mi){return specialSettleSum(yr+'-'+String(mi+1).padStart(2,'0'));});
  var bodyRows=names.map(function(c){
    var arr=(yd&&yd.b&&yd.b[c])||[0,0,0,0,0,0,0,0,0,0,0,0];
    var rowSum=0;
    var cells=monLabels.map(function(m,mi){var v=parseFloat(arr[mi])||0;rowSum+=v;var dv=v>0?fmtComma(v):'';return '<td style="padding:2px 4px;text-align:right"><input type="text" inputmode="numeric" class="si" value="'+dv+'" placeholder="-" style="text-align:right" onfocus="siFocus(this)" onchange="setSpecialAmt('+yr+','+jsArg(c)+','+mi+',this.value)"></td>';}).join('');
    return '<tr><td class="rl" ondblclick="renameDlCat(\'특별\','+jsArg(c)+')">'+dlEsc(c)+'</td>'+cells+'<td class="sum-cell" style="text-align:right">'+fmtComma(rowSum)+'</td></tr>';
  }).join('');
  var totCells=monBudget.map(function(s){return '<td style="text-align:right">'+fmtComma(s)+'</td>';}).join('');
  var totRow='<tr class="r-total"><td class="rl">합계</td>'+totCells+'<td class="sum-cell" style="text-align:right">'+fmtComma(budgetSum)+'</td></tr>';
  var table='<div class="tbl-wrap"><table class="xl"><tbody><tr>'+hdr+'</tr>'+bodyRows+totRow+evRow+'</tbody></table></div>';
  var settleByCat=specialYearSettleByCat(yr);
  var catBudgetArr=names.map(function(c){var s=0;((yd&&yd.b&&yd.b[c])||[]).forEach(function(v){s+=parseFloat(v)||0;});return s;});
  var catActualArr=names.map(function(c){return settleByCat[c]||0;});
  _spMonBarCfg={type:'bar',data:{labels:monLabels,datasets:[
    {label:'예산',data:monBudget,backgroundColor:'#c9c9c9',borderRadius:3},
    {label:'정산',data:monActual,backgroundColor:specialColor(),borderRadius:3}
  ]},options:_spChartOpts()};
  _spCatBarCfg={type:'bar',data:{labels:names,datasets:[
    {label:'예산',data:catBudgetArr,backgroundColor:'#c9c9c9',borderRadius:3},
    {label:'정산',data:catActualArr,backgroundColor:specialColor(),borderRadius:3}
  ]},options:_spChartOpts()};
  var settleBlock='<div style="margin-top:22px;border-top:1px solid var(--tbl-border);padding-top:14px">'
    +'<div style="font-weight:700;font-size:13px;margin-bottom:10px">연간 정산(실제 지출)</div>'
    +'<div id="spChS0" style="height:220px"><canvas id="spMonthChart"></canvas></div>'
    +'<div id="spChS1" style="height:220px;display:none"><canvas id="spCatChart"></canvas></div>'
    +'<div style="display:flex;gap:16px;justify-content:center;align-items:center;margin-top:8px">'
    +'<span id="spChT0" onclick="setSpecialChartTab(0)" style="cursor:pointer;font-size:13px;color:var(--ac);font-weight:700">월별</span>'
    +'<span id="spChT1" onclick="setSpecialChartTab(1)" style="cursor:pointer;font-size:13px;color:var(--gray)">카테고리별</span>'
    +'</div></div>';
  box.innerHTML=head+overallCard+table+settleBlock;
  try{[].forEach.call(box.querySelectorAll('.sp-memo-in'),function(el){ar(el);});}catch(e){}
  setSpecialChartTab(dlSpecialChartTab);
}
var dlMoSettleOpen=false;
function toggleMoSettle(){dlMoSettleOpen=!dlMoSettleOpen;var box=g('dlMoSettle');var btn=g('dlMoSettleBtn');if(box)box.style.display=dlMoSettleOpen?'':'none';if(btn)btn.textContent=dlMoSettleOpen?'정산 ▴':'정산 ▾';if(dlMoSettleOpen&&box)box.innerHTML=moIncomeFlowHtml(dailyDate||todayStr());}
function shiftMonth(delta){var p=(dailyDate||todayStr()).split('-');var y=parseInt(p[0]),mo=parseInt(p[1]);var dt=new Date(y,mo-1+delta,1);setDailyDate(localDateStr(dt));}
function gotoThisMonth(){setDailyDate(todayStr());}
function dlSearchRecords(){var inp=g('dlSearchInput');dlSearchQuery=inp?inp.value:'';var cb=g('dlSearchClearBtn');if(cb)cb.style.display=dlSearchQuery.trim()?'inline-flex':'none';renderDaily();}
function dlClearSearch(){dlSearchQuery='';var inp=g('dlSearchInput');if(inp)inp.value='';var cb=g('dlSearchClearBtn');if(cb)cb.style.display='none';renderDaily();}
function toggleRecentExpand(){dailyRecentExpanded=!dailyRecentExpanded;renderDaily();}
function renderDaily(){
  if(!g('dlDate'))return;
  if(!dailyDate)dailyDate=todayStr();
  g('dlDate').value=dailyDate;
  renderBudget();
  renderWeek();
  var _sb=g('dlStreakBanner');if(_sb)_sb.innerHTML=streakBannerHtml();renderSpendRules();renderResist(dailyDate);
  renderMoodOptions();
  renderConsumePanel();updateMoodLabel();updateConsumeLabel();
  var _mr=g('dlMoodRow');if(_mr)_mr.style.display=dlMoodOpen?'flex':'none';var _cp=g('dlConsumePanel');if(_cp)_cp.style.display=dlConsumeOpen?'block':'none';var _co=g('dlConsumeOpt');if(_co)_co.style.display=dlConsumeOpen?'inline-flex':'none';var _ec=g('dlEmptyCarrot');if(_ec)_ec.checked=consumeEmptyCarrot;
  document.querySelectorAll('.mood-caret').forEach(function(c){c.textContent=dlMoodOpen?'▾':'▸';});document.querySelectorAll('.consume-caret').forEach(function(c){c.textContent=dlConsumeOpen?'▾':'▸';});
  var dayRecs=dailyData.filter(function(x){return x.date===dailyDate;});
  g('dlList').innerHTML=dayRecs.length?dayRecs.map(function(r){return dlRowHtml(r,false);}).join(''):'<div style="color:var(--gray);font-size:13px;padding:10px 0">이 날의 기록이 없어요.</div>';
  var _sorted=dailyData.slice().sort(function(a,b){return (a.date<b.date?1:a.date>b.date?-1:(a.id<b.id?1:-1));});
  var _q=(dlSearchQuery||'').trim().toLowerCase();
  var _html;
  if(_q){
    var _matched=_sorted.filter(function(r){
      var hay=((r.note||'')+' '+(r.category||'')+' '+(r.sub||'')).toLowerCase();
      return hay.indexOf(_q)>=0;
    });
    var _cap=_matched.slice(0,50);
    _html=_cap.length?('<div style="font-size:13px;color:var(--gray);margin-bottom:6px">'+_matched.length+'건 찾음'+(_matched.length>50?' (최근 50건 표시)':'')+'</div>'+_cap.map(function(r){return dlRowHtml(r,true);}).join('')):'<div style="color:var(--gray);font-size:13px;padding:10px 0">검색 결과가 없어요.</div>';
  }else{
    var _tp=todayStr().split('-');var _cd=new Date(parseInt(_tp[0]),parseInt(_tp[1])-1,parseInt(_tp[2]));_cd.setDate(_cd.getDate()-6);var _cut=localDateStr(_cd);
    var _within=_sorted.slice(0,5);
    var _show=dailyRecentExpanded?_sorted.slice(0,100):_within;
    _html=_show.length?_show.map(function(r){return dlRowHtml(r,true);}).join(''):'<div style="color:var(--gray);font-size:13px;padding:10px 0">'+((dailyRecentExpanded||_sorted.length===0)?'아직 기록이 없어요.':'최근 7일 기록이 없어요.')+'</div>';
    var _more=_sorted.length-_within.length;
    if(!dailyRecentExpanded&&_more>0)_html+='<div style="text-align:center;margin-top:8px"><button type="button" class="btn btn-ol" style="font-size:13px;padding:4px 12px" onclick="toggleRecentExpand()">더 보기 ('+_more+'개)</button></div>';
    else if(dailyRecentExpanded&&_more>0)_html+='<div style="text-align:center;margin-top:8px"><button type="button" class="btn btn-ol" style="font-size:13px;padding:4px 12px" onclick="toggleRecentExpand()">접기</button></div>';
  }
  g('dlRecent').innerHTML=_html;applyRecentVis();
  var gv=g('dlGuide');if(gv)gv.innerHTML='<div class="empty-guide">👋 <b>처음이신가요?</b><br>💡 <b>자산·프로젝트</b>를 먼저 정리하면 로드맵·예산에 자동 반영돼요(대출은 월간 예산에, 자산은 장기 로드맵 시작 자산에, 프로젝트 투자금은 자산·로드맵에).<br>🧾 그동안 엑셀로 가계부를 써왔다면 <b>「가계부 가져오기」</b>로 주간 인증표·월간 정산표를 올려 지난 달 기록·수입·예산을 한 번에 채울 수 있어요 — <button type="button" onclick="openLedgerImport()" style="border:1px solid var(--ac);background:#fff;border-radius:99px;padding:2px 11px;font-size:13px;color:var(--ac);cursor:pointer;font-family:inherit;white-space:nowrap;vertical-align:1px">🧾 지금 가져오기</button> <span style="color:var(--gray);white-space:nowrap">(언제든 ⚙ 메뉴에서 가져올 수 있어요)</span><br>① <b>월간</b> 탭에서 분류별 예산을 먼저 세워두면, 주간은 <b>「월간에서 가져오기」</b>로, 일일은 <b>「주간에서 가져오기」</b>로 편하게 이어받을 수 있어요.<br>② 매일 금액·분류를 골라 <b>저장</b>하면 지출이 기록돼요.<br>③ <b>일일·주간·월간</b>으로 정산(쓴 돈·남은 예산)을 확인하세요.<br><span style="color:var(--gray)">화면 곳곳의 <b>ⓘ</b>를 누르면(PC는 마우스를 올리면) 그 자리에서 바로 설명이 떠요.<br>자세한 사용법은 우측 상단 <b>❓ 도움말</b>.</span></div>';
}
