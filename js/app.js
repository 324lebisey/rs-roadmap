function initApp(){
  try{loadDaily();}catch(e){}
  try{loadDailyLink();}catch(e){}
  try{loadDailyCats();renderCatOptions();}catch(e){}
  try{var _wsd=parseInt(localStorage.getItem('rs_week_start'),10);if(_wsd>=0&&_wsd<=6)weekStartDay=_wsd;}catch(e){}
  try{var _msd=parseInt(localStorage.getItem('rs_month_start'),10);if(_msd>=1&&_msd<=31)settleStartDay=_msd;var _msm=localStorage.getItem('rs_month_shortmode');if(_msm==='next'||_msm==='last')settleShortMode=_msm;}catch(e){}
  try{loadDailyMoods();loadDailyBudget();migrateWeekly();loadFixedDue();loadHolidays();loadDailyConsume();loadConsumeEmpty();loadCalLayers();loadIncome();loadIncomeCats();loadIncomeMap();}catch(e){}
  // 테마 로딩 (데이터 로딩과 분리)
  try{var th=localStorage.getItem("rs_theme");if(th)setTheme(th);}catch(e){}
  try{applyHelpHidden();}catch(e){}
  try{applyNavPin();}catch(e){}
  try{applySpendRulesOn();}catch(e){}
  try{applyMealOn();}catch(e){}
  // 데이터 로딩
  try{
    var d=JSON.parse(localStorage.getItem("rs7")||"null");
    if(d){
      ["sY","sA","sV","mdY","mdA","mdV","shYear","period"].forEach(function(k){if(d[k])g(k).value=d[k];});
      if(d.YR)YR=d.YR; if(d.ET)ET=d.ET; if(d.EI)EI=d.EI;
      if(d.CRISIS&&Array.isArray(d.CRISIS))CRISIS=d.CRISIS;
      if(d.longUnit)longUnit=d.longUnit;
      if(d.CS)CS=d.CS; if(d.milestones)milestones=d.milestones; if(d.children)children=d.children; if(d.SP)SP=d.SP;
      if(typeof d.reOn==='boolean')reOn=d.reOn; if(d.reP)reP=d.reP; if(d.reL)reL=d.reL; if(d.reR)reR=d.reR; if(Array.isArray(d.aptTargets))aptTargets=d.aptTargets; if(d.reView==='simple'||d.reView==='full')reView=d.reView; /* 내 집 갈아타기 */
      if(Array.isArray(d.assetBlocks))assetBlocks=d.assetBlocks; if(d.abV)abV=d.abV; /* 자산 구역 */
      if(Array.isArray(d.lgRowOrder))lgRowOrder=d.lgRowOrder; /* 장기 행 순서 */
      if(d.shData)shData=d.shData; if(d.mdYR)mdYR=d.mdYR;
      if(d.nyHide)nyHide=parseInt(d.nyHide)||0;   /* 새해 열기 배너 닫음 */
      if(d.monthlyArchive){monthlyArchive=d.monthlyArchive;Object.keys(monthlyArchive).forEach(function(k){monthlyArchive[k]=_migRetroArr(monthlyArchive[k]);});}
      if(d.userGrade)userGrade=d.userGrade;   /* 내 프로젝트 등급 — 복원 (세션 44) */
    if(d.projRates)projRates=d.projRates;
    if(d.projSchedule)projSchedule=d.projSchedule;
    if(d.projTerm)projTerm=d.projTerm;if(d.projRepay)projRepay=d.projRepay;if(d.projEarly)projEarly=d.projEarly;if(d.projAssetHide)projAssetHide=d.projAssetHide;if(d.projOverride)projOverride=d.projOverride;
    if(d.projBonus)projBonus=d.projBonus;if(d.projBonusOn)projBonusOn=d.projBonusOn;
    if(!d.projBonus&&d.projMaturityBonusOn){ /* 구버전 만기 보너스(단일값) → 새 다중구간 배열로 1회 이관 */
      Object.keys(d.projMaturityBonusOn).forEach(function(pid){
        var n=parseFloat(d.projMaturityBonus&&d.projMaturityBonus[pid]);
        if(n>0){projBonus[pid]=[{at:'mat',pct:n}];projBonusOn[pid]=true;}
      });
    }
    if(d.projRateStep)projRateStep=d.projRateStep;if(d.projRateStepOn)projRateStepOn=d.projRateStepOn;if(d.projAddInv)projAddInv=d.projAddInv;if(d.projExtRateOn)projExtRateOn=d.projExtRateOn;if(d.projExtRate)projExtRate=d.projExtRate;if(d.projExtFrom)projExtFrom=d.projExtFrom;if(d.projOwner)projOwner=d.projOwner;if(d.projInclude)projInclude=d.projInclude;if(d.projMemo)projMemo=d.projMemo;if(Array.isArray(d.projSummaryPick)&&d.projSummaryPick.length)projSummaryPick=d.projSummaryPick;if(typeof d.projSummaryFamily==='boolean')projSummaryFamily=d.projSummaryFamily;if(d.userProjects)userProjects=d.userProjects;
      if(d.projInvest){
        projInvest=d.projInvest;
        Object.keys(projInvest).forEach(function(k){
          if(typeof projInvest[k]==="object"&&projInvest[k]!==null){
            var old=projInvest[k];
            projInvest[k]=old.invest||0;
            if(old.customRate)projRates[k]=old.customRate;
          }
        });
      }
      if(d.customRows)customRows=d.customRows;
      if(d.rowLabels)rowLabels=d.rowLabels;
      if(d.customRowsMid)customRowsMid=d.customRowsMid;
      if(d.customRowsShort)customRowsShort=d.customRowsShort;
      if(d.shRowOrder)shRowOrder=d.shRowOrder;
      if(d.shHiddenBase)shHiddenBase=d.shHiddenBase;
      if(Array.isArray(d.shExclIds))shExclIds=d.shExclIds; /* 단기 넣기/빼기 */
      if(d.mdRowOrder)mdRowOrder=d.mdRowOrder;
      if(d.shCustomOnly!=null)shCustomOnly=d.shCustomOnly;
      if(d.customData)customData=d.customData;
      if(d.customNotes)customNotes=d.customNotes;
      if(d.customSectionName)customSectionName=d.customSectionName;
    }
  }catch(e){
    console.error("데이터 로드 오류:",e);
    window._rsLoadError=true; // 부분 복원 상태 → save()가 rs7을 덮어쓰면 미복원 데이터(프로젝트 등)가 영구 삭제됨. 저장 잠금.
    try{showToast("⚠️ 저장된 데이터를 불러오지 못했어요. 덮어쓰기를 막기 위해 저장을 잠갔어요 — 메뉴 › 백업으로 먼저 내보내 주세요.");}catch(_){}
  }
  // 잘못된 저장 데이터 자동 복구
  var sy=parseInt(g("sY").value)||0;
  var per=parseInt(g("period").value)||0;
  if(sy<2020||sy>2060||per<=0){
    g("sY").value=2026; g("period").value=30;
    if(!(parseInt(g("sA").value)>0))g("sA").value=35;
    if(!(parseInt(g("sV").value)>0))g("sV").value=10000;
  }
  // 렌더링
  try{initDragDrop();}catch(e){}
  try{initPaste();}catch(e){}
  window.addEventListener('beforeunload',function(){if(!_preventSave)save();});
  // ri(수익률)/si(저축) 입력: blur 시에만 재계산
  document.addEventListener('change',function(e){
    var t=e.target;
    if(!t)return;
    var cls=t.className||'';
    if(cls.indexOf('ri')>=0||cls.indexOf('si')>=0){recalc();save();}
    if(cls.indexOf('ev-in')>=0||cls.indexOf('ev-cell')>=0||cls.indexOf('cr-cell')>=0||cls.indexOf('qa')>=0){save();}
    if(cls.indexOf('invest-input')>=0){renderSP();renderShort();if(typeof renderMoIncome==='function')renderMoIncome(dailyDate||todayStr());save();}
  });

  // 수익률 일괄 변경 기본값: 현재 시작연도~종료연도
  try{
    var _sy2=parseInt(g("sY").value)||2026;
    var _per2=parseInt(g("period").value)||30;
    if(g("bulkFrom"))g("bulkFrom").value=_sy2;
    if(g("bulkTo"))g("bulkTo").value=_sy2+_per2-1;
    if(g("bulkMFrom"))g("bulkMFrom").value=_sy2;
    if(g("bulkMTo"))g("bulkMTo").value=_sy2+_per2-1;
  }catch(e){}
  try{setLongUnit(longUnit);}catch(e){}
  try{var _fs=localStorage.getItem("rs_fontstep");if(_fs!==null){_fontStep=parseInt(_fs)||0;applyFontSize();}}catch(e){}
  // 각 렌더를 격리: 하나가 실패해도 나머지·토글은 반드시 실행
  try{recalc();}catch(e){console.error("recalc 오류:",e);}
  try{renderCBar();}catch(e){console.error("renderCBar 오류:",e);}   // 자녀 태그 — 부팅 시 누락돼 있던 렌더
  try{syncGradeBtns();}catch(e){console.error("syncGradeBtns 오류:",e);} // 등급 버튼 활성표시 — 복원과 렌더는 한 쌍(§2.23)
  try{renderSP();}catch(e){console.error("renderSP 오류:",e);}       // ★ 프로젝트 목록 — 복원은 됐는데 안 그려지던 근본 원인
  try{renderDaily();}catch(e){console.error("renderDaily 오류:",e);}
  try{dlRenderFocusBanners();}catch(e){}   // 배너는 renderActiveView에서만 그려져 부팅 시 비어 있었음(§2.23)
  try{dlRenderAsnapBanners();}catch(e){}   // 자산 기록 알림 — 부팅 렌더
  try{renderShort();}catch(e){console.error("renderShort 오류:",e);}
  try{renderMid();}catch(e){console.error("renderMid 오류:",e);}
  try{syncImportToggle();}catch(e){console.error("토글 오류:",e);}  // 데이터 유무에 따라 가져오기 영역 열기/닫기
  try{checkBackupReminder();}catch(e){}
  try{if(_driveAvailable()){var _dsb=g('driveSaveBtn'),_dlb=g('driveLoadBtn');if(_dsb)_dsb.style.display='inline-flex';if(_dlb)_dlb.style.display='inline-flex';}}catch(e){}
  /* 첫 사용자는 일일 뷰(스타터 안내문)로, 기록이 있는 사람(백업 불러오기 포함)은 달력부터.
     판정은 백업 리마인드와 같은 _rsHasRealData() 하나를 재사용한다(새 기준 만들지 않음). */
  try{if(_rsHasRealData())setDailyView('calendar');}catch(e){}
  // 시작 화면 — 사용자가 고른 게 daily가 아니면 그 탭으로. 안 골랐으면 지금처럼 daily 그대로(기존 동작 안 바뀜)
  try{var _dt=getDefaultTab();if(_dt!=='daily')showTab(_dt);}catch(e){}
}
initApp();

/* 주간 예산 RS 미터 */
function weeklyRsDirection(weekDate){
  var d=(weekDate&&typeof weekDate.getFullYear==='function')?weekDate:new Date(String(weekDate)+'T00:00:00');
  var weekNumber=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(2026,0,5))/604800000);
  var index=((weekNumber%8)+8)%8;
  return [
    {index:0,angle:0,arrow:'↑',label:'아래에서 위',x1:'0%',y1:'100%',x2:'0%',y2:'0%'},
    {index:1,angle:45,arrow:'↗',label:'왼쪽 아래에서 오른쪽 위',x1:'0%',y1:'100%',x2:'100%',y2:'0%'},
    {index:2,angle:90,arrow:'→',label:'왼쪽에서 오른쪽',x1:'0%',y1:'0%',x2:'100%',y2:'0%'},
    {index:3,angle:135,arrow:'↘',label:'왼쪽 위에서 오른쪽 아래',x1:'0%',y1:'0%',x2:'100%',y2:'100%'},
    {index:4,angle:180,arrow:'↓',label:'위에서 아래',x1:'0%',y1:'0%',x2:'0%',y2:'100%'},
    {index:5,angle:225,arrow:'↙',label:'오른쪽 위에서 왼쪽 아래',x1:'100%',y1:'0%',x2:'0%',y2:'100%'},
    {index:6,angle:270,arrow:'←',label:'오른쪽에서 왼쪽',x1:'100%',y1:'0%',x2:'0%',y2:'0%'},
    {index:7,angle:315,arrow:'↖',label:'오른쪽 아래에서 왼쪽 위',x1:'100%',y1:'100%',x2:'0%',y2:'0%'}
  ][index];
}

(function(){
  var weeklyRsImage='assets/rs_.webp';
  var weeklyRsMaskImage='assets/rs-fill-mask.webp?v=20260918-webp';

  function weeklyRsBudgetCard(title,budget,spent,onch,locked){
    var pct=budget>0?Math.round(spent/budget*100):0;
    var fill=Math.max(0,Math.min(100,pct));
    var over=spent>budget&&budget>0;
    var color=over?'#d9534f':'var(--ac)';
    var bv=budget>0?budget:'';
    var spentTxt=fmtComma(spent)+'원'+(budget>0?' · '+pct+'%':'');
    var mobileSpentTxt=budget>0?fmtComma(spent)+' / '+fmtComma(budget)+'원':fmtComma(spent)+'원';
    var rLabel=budget>0?(over?'초과':'남음'):'';
    var rVal=budget>0?(over?fmtComma(spent-budget)+'원':fmtComma(budget-spent)+'원'):'예산을 정해보세요';
    var rColor=budget>0?(over?'#d9534f':'var(--ac)'):'var(--gray)';
    var rWeight=budget>0?'600':'400';
    if(locked&&budget<=0){rLabel='';rVal='';}
    var input='<input type="number" class="dlbgt" value="'+bv+'" placeholder="예산" onchange="'+onch+'(this.value)" style="width:84px;text-align:right;padding:4px 6px;border:1px solid var(--border);border-radius:2px;font-size:13px;font-family:inherit;color:#111"><span style="font-size:13px;color:var(--gray)">원</span>';
    var right=locked?(budget>0?'<span style="font-size:13px;color:var(--gray)">예산 '+fmtComma(budget)+'원</span>':'<span style="font-size:13px;color:var(--gray)">예산 미설정</span>'):'<span style="display:inline-flex;align-items:center;gap:3px">'+input+'</span>';
    var direction=weeklyRsDirection(weekStartMon(dailyDate||todayStr()));
    var maskId='weeklyRsMask'+direction.index;
    var gradientId='weeklyRsGradient'+direction.index;
    var aria='주간 예산 '+fill+'% 채움';
    var meter='<div class="weekly-rs-meter"><svg viewBox="17 37 1140 1281" role="img" aria-label="'+aria+'">'+
      '<defs><mask id="'+maskId+'" maskUnits="userSpaceOnUse" x="0" y="0" width="1160" height="1355" style="mask-type:alpha"><image href="'+weeklyRsMaskImage+'" x="0" y="0" width="1160" height="1355"></image></mask>'+
      '<linearGradient id="'+gradientId+'" x1="'+direction.x1+'" y1="'+direction.y1+'" x2="'+direction.x2+'" y2="'+direction.y2+'">'+
      '<stop offset="0%" stop-color="'+color+'"></stop><stop offset="'+fill+'%" stop-color="'+color+'"></stop><stop offset="'+fill+'%" stop-color="transparent"></stop><stop offset="100%" stop-color="transparent"></stop></linearGradient></defs>'+
      '<rect x="0" y="0" width="1160" height="1355" fill="var(--tbl-border)" mask="url(#'+maskId+')"></rect>'+
      '<rect x="0" y="0" width="1160" height="1355" fill="url(#'+gradientId+')" mask="url(#'+maskId+')"></rect>'+
      '<image class="weekly-rs-outline" href="'+weeklyRsImage+'" x="0" y="0" width="1160" height="1355"></image></svg></div>';
    return '<div class="weekly-budget-panel"><div class="weekly-budget-head"><span style="font-size:13px;color:var(--gray)">'+title+'</span>'+right+'</div>'+meter+
      '<div class="weekly-budget-desktop"><div class="weekly-budget-labels"><span>썼어요</span><span>'+rLabel+'</span></div><div class="weekly-budget-values"><span style="font-weight:600">'+spentTxt+'</span><span style="color:'+rColor+';font-weight:'+rWeight+'">'+rVal+'</span></div></div><div class="weekly-budget-mobile weekly-budget-values"><span style="font-weight:600;color:'+rColor+'">'+mobileSpentTxt+'</span></div></div>';
  }

  var originalBudgetCard=budgetCard;
  budgetCard=function(title,budget,spent,onch,locked,scope,seg){
    if(title==='주간 예산')return weeklyRsBudgetCard(title,budget,spent,onch,locked);
    return originalBudgetCard.apply(this,arguments);
  };

  var originalRenderWeekDue=renderWeekDue;
  renderWeekDue=function(){
    originalRenderWeekDue();
    var box=g('dlWeekDue');
    if(!box)return;
    if(!box.firstElementChild){
      box.innerHTML='<div class="weekly-due-panel"><div style="font-size:13px;font-weight:600;color:#111;margin-bottom:6px">📅 이번 주 예정 고정지출</div><div style="font-size:13px;color:var(--gray);padding:8px 2px">예정된 고정지출이 없어요.</div></div>';
      return;
    }
    box.firstElementChild.classList.add('weekly-due-panel');
  };

  if(g('dlViewWeek')&&g('dlViewWeek').style.display!=='none')renderWeekView();
})();
