function initApp(){
  try{loadDaily();}catch(e){}
  try{loadDailyLink();}catch(e){}
  try{loadDailyCats();renderCatOptions();}catch(e){}
  try{var _wsd=parseInt(localStorage.getItem('rs_week_start'),10);if(_wsd>=0&&_wsd<=6)weekStartDay=_wsd;}catch(e){}
  try{var _msd=parseInt(localStorage.getItem('rs_month_start'),10);if(_msd>=1&&_msd<=31)settleStartDay=_msd;var _msm=localStorage.getItem('rs_month_shortmode');if(_msm==='next'||_msm==='last')settleShortMode=_msm;}catch(e){}
  try{loadDailyMoods();loadDailyBudget();migrateWeekly();loadFixedDue();loadHolidays();loadDailyConsume();loadConsumeEmpty();loadCalLayers();loadIncome();loadIncomeCats();loadIncomeMap();loadIncomeFixed();}catch(e){}
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
  window.addEventListener('beforeunload',rsUnloadWarn);   // 위 save() 뒤에 등록 — 저장이 끝난 상태로 비교
  document.addEventListener('visibilitychange',function(){if(!document.hidden){try{checkBackupReminder();}catch(e){}}});
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
  try{if(ensureIncomeSeed(monthKey(todayStr())))renderActiveView();}catch(e){}   // 고정수입 이어받기 — 복원·렌더가 끝난 뒤에 (§2.23)
  try{checkBackupReminder();}catch(e){}
  try{rsMarkSigBaseline();}catch(e){}   // 창 닫기 경고의 「이번 접속에서 바뀜」 기준값
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
  /* 채움 기준: 이미지 상자가 아니라 로고 잉크 면적. lo/hi=진행 방향으로 잉크가 있는 구간, q[n]=잉크 n%가 채워지는 지점(구간 대비 0~1). assets/rs-fill-mask 를 바꾸면 다시 계산해야 한다. */
  return [
    {index:0,angle:0,arrow:'↑',label:'아래에서 위',dx:0,dy:-1.0000,lo:-1316,hi:-37,q:[0,0.016,0.03,0.046,0.063,0.081,0.099,0.119,0.141,0.166,0.193,0.223,0.234,0.241,0.248,0.255,0.263,0.27,0.278,0.286,0.293,0.3,0.308,0.314,0.321,0.328,0.334,0.339,0.345,0.351,0.356,0.361,0.367,0.372,0.377,0.381,0.387,0.392,0.397,0.403,0.408,0.414,0.419,0.425,0.431,0.438,0.445,0.452,0.46,0.467,0.476,0.485,0.493,0.503,0.512,0.522,0.531,0.54,0.55,0.56,0.569,0.578,0.587,0.595,0.601,0.609,0.618,0.627,0.636,0.646,0.655,0.665,0.675,0.683,0.693,0.701,0.71,0.718,0.726,0.733,0.74,0.75,0.763,0.777,0.791,0.804,0.817,0.831,0.844,0.858,0.871,0.885,0.898,0.912,0.926,0.939,0.952,0.966,0.978,0.987,1]},
    {index:1,angle:45,arrow:'↗',label:'왼쪽 아래에서 오른쪽 위',dx:0.7071,dy:-0.7071,lo:-710.6,hi:466.7,q:[0,0.077,0.104,0.124,0.14,0.158,0.178,0.196,0.207,0.217,0.226,0.235,0.243,0.25,0.258,0.264,0.271,0.278,0.285,0.294,0.306,0.32,0.336,0.353,0.37,0.388,0.399,0.409,0.417,0.425,0.432,0.438,0.444,0.45,0.455,0.46,0.465,0.47,0.474,0.479,0.483,0.488,0.494,0.499,0.505,0.51,0.516,0.521,0.527,0.532,0.537,0.542,0.547,0.552,0.557,0.562,0.567,0.572,0.577,0.582,0.587,0.591,0.595,0.599,0.604,0.608,0.613,0.618,0.623,0.627,0.632,0.637,0.641,0.646,0.651,0.657,0.662,0.668,0.674,0.681,0.688,0.696,0.704,0.713,0.723,0.735,0.754,0.775,0.794,0.811,0.826,0.838,0.848,0.859,0.872,0.886,0.916,0.935,0.949,0.968,1]},
    {index:2,angle:90,arrow:'→',label:'왼쪽에서 오른쪽',dx:1.0000,dy:0,lo:17,hi:1155,q:[0,0.054,0.058,0.062,0.066,0.069,0.073,0.077,0.081,0.084,0.088,0.092,0.096,0.099,0.104,0.107,0.111,0.114,0.119,0.122,0.126,0.129,0.134,0.137,0.141,0.144,0.148,0.152,0.155,0.159,0.164,0.195,0.296,0.338,0.365,0.383,0.398,0.41,0.422,0.43,0.438,0.444,0.451,0.457,0.462,0.467,0.472,0.476,0.481,0.485,0.489,0.493,0.496,0.5,0.504,0.508,0.512,0.516,0.519,0.523,0.527,0.532,0.536,0.541,0.546,0.55,0.555,0.56,0.566,0.571,0.577,0.584,0.593,0.604,0.614,0.626,0.639,0.652,0.668,0.684,0.702,0.721,0.741,0.76,0.779,0.798,0.816,0.832,0.848,0.863,0.877,0.89,0.902,0.915,0.925,0.936,0.945,0.953,0.964,0.978,1]},
    {index:3,angle:135,arrow:'↘',label:'왼쪽 위에서 오른쪽 아래',dx:0.7071,dy:0.7071,lo:47.4,hi:1639.8,q:[0,0.057,0.076,0.09,0.103,0.116,0.129,0.143,0.155,0.168,0.181,0.194,0.206,0.218,0.23,0.241,0.252,0.262,0.273,0.283,0.293,0.302,0.311,0.32,0.328,0.336,0.344,0.352,0.359,0.366,0.373,0.38,0.386,0.391,0.396,0.401,0.406,0.41,0.414,0.419,0.424,0.428,0.433,0.438,0.443,0.448,0.453,0.459,0.465,0.472,0.479,0.487,0.495,0.504,0.514,0.525,0.536,0.547,0.558,0.568,0.578,0.587,0.596,0.605,0.614,0.622,0.63,0.637,0.644,0.651,0.658,0.665,0.672,0.679,0.686,0.693,0.7,0.707,0.715,0.722,0.729,0.737,0.745,0.754,0.762,0.771,0.781,0.79,0.801,0.812,0.824,0.836,0.849,0.862,0.876,0.892,0.909,0.929,0.951,0.977,1]},
    {index:4,angle:180,arrow:'↓',label:'위에서 아래',dx:0,dy:1.0000,lo:37,hi:1316,q:[0,0.013,0.022,0.034,0.048,0.061,0.074,0.088,0.102,0.115,0.129,0.142,0.156,0.169,0.183,0.196,0.209,0.223,0.237,0.25,0.26,0.267,0.274,0.282,0.29,0.299,0.307,0.317,0.325,0.335,0.345,0.354,0.364,0.373,0.382,0.391,0.399,0.405,0.413,0.422,0.431,0.44,0.45,0.46,0.469,0.478,0.488,0.497,0.507,0.515,0.524,0.533,0.54,0.548,0.555,0.562,0.569,0.575,0.581,0.586,0.592,0.597,0.603,0.608,0.613,0.619,0.623,0.628,0.633,0.639,0.644,0.649,0.655,0.661,0.666,0.672,0.679,0.686,0.692,0.7,0.707,0.714,0.722,0.73,0.737,0.745,0.752,0.759,0.766,0.777,0.807,0.834,0.859,0.881,0.901,0.919,0.937,0.954,0.97,0.984,1]},
    {index:5,angle:225,arrow:'↙',label:'오른쪽 위에서 왼쪽 아래',dx:-0.7071,dy:0.7071,lo:-466.7,hi:710.6,q:[0,0.032,0.051,0.065,0.084,0.114,0.128,0.141,0.152,0.162,0.174,0.189,0.206,0.225,0.246,0.265,0.277,0.287,0.296,0.304,0.312,0.319,0.326,0.332,0.338,0.343,0.349,0.354,0.359,0.363,0.368,0.373,0.377,0.382,0.387,0.392,0.396,0.401,0.405,0.409,0.413,0.418,0.423,0.428,0.433,0.438,0.443,0.448,0.453,0.458,0.463,0.468,0.473,0.479,0.484,0.49,0.495,0.501,0.506,0.512,0.517,0.521,0.526,0.53,0.535,0.54,0.545,0.55,0.556,0.562,0.568,0.575,0.583,0.591,0.601,0.612,0.63,0.647,0.664,0.68,0.694,0.706,0.715,0.722,0.729,0.736,0.742,0.75,0.757,0.765,0.774,0.783,0.793,0.804,0.822,0.842,0.86,0.876,0.896,0.923,1]},
    {index:6,angle:270,arrow:'←',label:'오른쪽에서 왼쪽',dx:-1.0000,dy:0,lo:-1155,hi:-17,q:[0,0.022,0.036,0.047,0.055,0.064,0.075,0.085,0.098,0.11,0.123,0.137,0.152,0.168,0.184,0.202,0.221,0.24,0.259,0.279,0.298,0.316,0.332,0.348,0.361,0.374,0.386,0.396,0.407,0.416,0.423,0.429,0.434,0.44,0.445,0.45,0.454,0.459,0.464,0.468,0.473,0.477,0.481,0.484,0.488,0.492,0.496,0.5,0.504,0.507,0.511,0.515,0.519,0.524,0.528,0.533,0.538,0.543,0.549,0.556,0.562,0.57,0.578,0.59,0.602,0.617,0.635,0.662,0.704,0.805,0.836,0.841,0.845,0.848,0.852,0.856,0.859,0.863,0.866,0.871,0.874,0.878,0.881,0.886,0.889,0.893,0.896,0.901,0.904,0.908,0.912,0.916,0.919,0.923,0.927,0.931,0.934,0.938,0.942,0.946,1]},
    {index:7,angle:315,arrow:'↖',label:'오른쪽 아래에서 왼쪽 위',dx:-0.7071,dy:-0.7071,lo:-1639.8,hi:-47.4,q:[0,0.023,0.049,0.071,0.091,0.108,0.124,0.138,0.151,0.164,0.176,0.188,0.199,0.21,0.219,0.229,0.238,0.246,0.255,0.263,0.271,0.278,0.285,0.293,0.3,0.307,0.314,0.321,0.328,0.335,0.342,0.349,0.356,0.363,0.37,0.378,0.386,0.395,0.404,0.413,0.422,0.432,0.442,0.453,0.464,0.475,0.486,0.496,0.505,0.513,0.521,0.528,0.535,0.541,0.547,0.552,0.557,0.562,0.567,0.572,0.576,0.581,0.586,0.59,0.594,0.599,0.604,0.609,0.614,0.62,0.627,0.634,0.641,0.648,0.656,0.664,0.672,0.68,0.689,0.698,0.707,0.717,0.727,0.738,0.748,0.759,0.77,0.782,0.794,0.806,0.819,0.832,0.845,0.857,0.871,0.884,0.897,0.91,0.924,0.943,1]}
  ][index];
}

(function(){
  var weeklyRsImage='assets/rs_.webp';
  var weeklyRsMaskImage='assets/rs-fill-mask.webp?v=20260918-webp';

  function weeklyRsBudgetCard(title,budget,spent,onch,locked,cbSum){
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
    var ps=direction.dx*580+direction.dy*677.5,gx1=(580+direction.dx*(direction.lo-ps)).toFixed(1),gy1=(677.5+direction.dy*(direction.lo-ps)).toFixed(1),gx2=(580+direction.dx*(direction.hi-ps)).toFixed(1),gy2=(677.5+direction.dy*(direction.hi-ps)).toFixed(1),cut=direction.q[fill];
    var meter='<div class="weekly-rs-meter"><svg viewBox="17 37 1140 1281" role="img" aria-label="'+aria+'">'+
      '<defs><mask id="'+maskId+'" maskUnits="userSpaceOnUse" x="0" y="0" width="1160" height="1355" style="mask-type:alpha"><image href="'+weeklyRsMaskImage+'" x="0" y="0" width="1160" height="1355"></image></mask>'+
      '<linearGradient id="'+gradientId+'" gradientUnits="userSpaceOnUse" x1="'+gx1+'" y1="'+gy1+'" x2="'+gx2+'" y2="'+gy2+'">'+
      '<stop offset="0" stop-color="'+color+'"></stop><stop offset="'+cut+'" stop-color="'+color+'"></stop><stop offset="'+cut+'" stop-color="transparent"></stop><stop offset="1" stop-color="transparent"></stop></linearGradient></defs>'+
      '<rect x="0" y="0" width="1160" height="1355" fill="var(--tbl-border)" mask="url(#'+maskId+')"></rect>'+
      '<rect x="0" y="0" width="1160" height="1355" fill="url(#'+gradientId+')" mask="url(#'+maskId+')"></rect>'+
      '<image class="weekly-rs-outline" href="'+weeklyRsImage+'" x="0" y="0" width="1160" height="1355"></image></svg></div>';
    return '<div class="weekly-budget-panel"><div class="weekly-budget-head"><span style="font-size:13px;color:var(--gray)">'+title+'</span>'+right+'</div>'+meter+
      '<div class="weekly-budget-desktop"><div class="weekly-budget-labels"><span>썼어요</span><span>'+rLabel+'</span></div><div class="weekly-budget-values"><span style="font-weight:600">'+spentTxt+'</span><span style="color:'+rColor+';font-weight:'+rWeight+'">'+rVal+'</span></div></div><div class="weekly-budget-mobile weekly-budget-values"><span style="font-weight:600;color:'+rColor+'">'+mobileSpentTxt+'</span></div>'+cbKeptRowHtml(cbSum)+'</div>';
  }

  var originalBudgetCard=budgetCard;
  budgetCard=function(title,budget,spent,onch,locked,scope,seg,cbSum){
    if(title==='주간 예산')return weeklyRsBudgetCard(title,budget,spent,onch,locked,cbSum);
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

/* ── 표 칸 너비 조절: 헤더 줄 칸 경계를 잡고 드래그하면 그 표의 "모든" 칸이 한 번에 같은 너비로 늘거나 줄어든다(칸 하나씩 아님).
   더블클릭하면 그 표만 기본 너비로 되돌아간다. 표마다(부모 id 기준) 너비를 기억해서 다음에 열어도 유지된다.
   기존 .xl 표 렌더 함수들은 전혀 손대지 않는다 — 새로 생기는 .xl 표를 MutationObserver로 잡아서 씌운다. */
(function(){
  var STORE_KEY='rs_xlw',MIN_W=40,MAX_W=400,EDGE=6;
  function loadMap(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}');}catch(e){return {};}}
  function saveMap(m){try{lsSet(STORE_KEY,JSON.stringify(m));}catch(e){}}
  function xlKey(table){
    var el=table.parentElement;
    while(el&&!el.id)el=el.parentElement;
    if(el&&el.id)return el.id;
    var hdr=table.querySelector('tr');
    return hdr?('h_'+hdr.textContent.trim().slice(0,20)):'default';
  }
  function applyStored(table){
    if(table.dataset.xlwInit)return;
    table.dataset.xlwInit='1';
    var key=xlKey(table);
    table.dataset.xlkey=key;
    var w=loadMap()[key];
    if(w){table.dataset.xlr='1';table.style.setProperty('--xlw',w+'px');}
  }
  function scan(root){
    if(!root||root.nodeType!==1)return;
    if(root.matches&&root.matches('table.xl'))applyStored(root);
    if(root.querySelectorAll)Array.prototype.forEach.call(root.querySelectorAll('table.xl'),applyStored);
  }
  new MutationObserver(function(muts){muts.forEach(function(m){Array.prototype.forEach.call(m.addedNodes,scan);});}).observe(document.body,{childList:true,subtree:true});
  scan(document.body);

  function headerCellAt(table,clientX){
    var row=table.querySelector('tr');if(!row)return null;
    var cells=row.children;
    for(var i=0;i<cells.length;i++){
      var c=cells[i];
      if(c.classList.contains('rl')||c.classList.contains('grp-c'))continue;
      var r=c.getBoundingClientRect();
      if(Math.abs(clientX-r.right)<=EDGE)return c;
    }
    return null;
  }
  var drag=null;
  function startDrag(table,clientX){
    var cell=headerCellAt(table,clientX);
    if(!cell)return false;
    var sc=cell.offsetWidth?cell.getBoundingClientRect().width/cell.offsetWidth:1; /* 데스크톱은 탭에 zoom:1.25 — 화면 좌표(rect·clientX)를 CSS 폭 단위로 환산 */
    drag={table:table,startX:clientX,startW:cell.offsetWidth,sc:sc||1,w:0};
    document.body.style.cursor='col-resize';document.body.style.userSelect='none';
    return true;
  }
  function moveDrag(clientX){
    if(!drag)return;
    var w=Math.max(MIN_W,Math.min(MAX_W,Math.round(drag.startW+(clientX-drag.startX)/drag.sc)));
    drag.table.dataset.xlr='1';drag.table.style.setProperty('--xlw',w+'px');drag.w=w;
  }
  function endDrag(){
    if(!drag)return;
    if(drag.w){var m=loadMap();m[drag.table.dataset.xlkey||xlKey(drag.table)]=drag.w;saveMap(m);}
    document.body.style.cursor='';document.body.style.userSelect='';
    drag=null;
  }
  function resetTable(table){
    var key=table.dataset.xlkey||xlKey(table);
    var m=loadMap();delete m[key];saveMap(m);
    delete table.dataset.xlr;table.style.removeProperty('--xlw');
  }
  document.addEventListener('mousedown',function(e){
    var table=e.target.closest&&e.target.closest('table.xl');
    if(table&&startDrag(table,e.clientX))e.preventDefault();
  });
  var hoverTable=null;
  document.addEventListener('mousemove',function(e){
    if(drag){moveDrag(e.clientX);return;}
    var table=e.target.closest&&e.target.closest('table.xl');
    var onBorder=table&&headerCellAt(table,e.clientX);
    if(hoverTable&&hoverTable!==(onBorder?table:null))hoverTable.style.cursor='';
    hoverTable=onBorder?table:null;
    if(hoverTable)hoverTable.style.cursor='col-resize';
  });
  document.addEventListener('mouseup',endDrag);
  document.addEventListener('dblclick',function(e){
    var table=e.target.closest&&e.target.closest('table.xl');
    if(table&&headerCellAt(table,e.clientX))resetTable(table);
  });
  document.addEventListener('touchstart',function(e){
    var table=e.target.closest&&e.target.closest('table.xl');
    if(table&&e.touches[0]&&startDrag(table,e.touches[0].clientX))e.preventDefault();
  },{passive:false});
  document.addEventListener('touchmove',function(e){if(drag&&e.touches[0]){moveDrag(e.touches[0].clientX);e.preventDefault();}},{passive:false});
  document.addEventListener('touchend',endDrag);
})();
