// ── 단기 ─────────────────────────────────────────────
function fmtComma(n){
  if(!n&&n!==0)return'';
  var v=Math.round(n);
  return v===0?'0':v.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
}
function stripComma(s){return parseFloat(String(s).replace(/,/g,''))||0;}
function fmtUnitDisp(v){if(v===0||v==="")return "0";var r=Math.round(v*10)/10;var s=(r%1===0)?String(r):r.toFixed(1);return s.replace(/\B(?=(\d{3})+(?!\d))/g,",");}

function siBlur(el,key,yr2,mi){var n=stripComma(el.value);var won=(shUnit>1)?Math.round(n*shUnit):n;if(shData[key])shData[key][yr2+'_'+mi]=won;renderShort();save();}
function siFocus(el){el.value=el.value.replace(/,/g,'');}
function setShUnit(u){
  shUnit=u;
  lsSet("rs_shunit",String(u));
  syncShUnitBtns();
  renderShort();
}
function syncShUnitBtns(){
  var w=g("shUnitWon"),m=g("shUnitMan");
  if(w)w.classList.toggle("on",shUnit===1);
  if(m)m.classList.toggle("on",shUnit>1);
}
function setMdUnit(u){mdUnit=u;lsSet("rs_mdunit",String(u));syncMdUnitBtns();renderMid();}
function syncMdUnitBtns(){var w=g("mdUnitWon"),m=g("mdUnitMan");if(w)w.classList.toggle("on",mdUnit===1);if(m)m.classList.toggle("on",mdUnit>1);}
function setLgUnit(u){lgUnit=u;lsSet("rs_lgunit",String(u));syncLgUnitBtns();recalc();}
/* §4.2-27 로드맵 드롭다운(탭 바로 아래 팝업 · 📂 불러오기와 같은 방식) — setRmTab: 값 저장(표 단위 토글과 같은 방식), showRmSub: 서브뷰 전환 + 원래 showTab이 돌리던 렌더 동일 수행 */
function setRmTab(v){if(v!=="short"&&v!=="mid"&&v!=="long")v="long";rmTab=v;lsSet("rs_rmtab",v);}
function showRmSub(v){
  if(v!=="short"&&v!=="mid"&&v!=="long")v="long";
  document.querySelectorAll(".rm-sub").forEach(function(s){s.classList.toggle("active",s.id===v);});
  document.querySelectorAll(".rm-tab-opt").forEach(function(o,i){o.classList.toggle("on",["short","mid","long"][i]===v);});
  if(v==="short")renderShort();
  else if(v==="mid")renderMid();
  else recalc();
}
function pickRmTab(v){setRmTab(v);document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("active",(t.getAttribute("onclick")||"").indexOf("'roadmap'")>=0);});document.querySelectorAll(".section").forEach(function(s){s.classList.toggle("active",s.id==="roadmap");});showRmSub(rmTab);closeRmTabDrop();}
function toggleRmTabDrop(){
  var drop=g("rmTabDrop");if(!drop)return;
  var open=drop.style.display==="block";
  if(!open){
    var btn=g("rmTabBtn");
    if(btn){
      var r=btn.getBoundingClientRect();  // fixed 포지션이라 .tabs의 overflow-x:auto(모바일)에 안 잘리는 대신, 좌표를 직접 계산해야 함
      drop.style.top=r.bottom+"px";
      drop.style.left=r.left+"px";
    }
  }
  drop.style.display=open?"none":"block";
  if(!open){
    setTimeout(function(){
      function _rmc(e){
        if(!drop.contains(e.target)&&e.target.id!=="rmTabBtn"){closeRmTabDrop();document.removeEventListener("click",_rmc);}
      }
      document.addEventListener("click",_rmc);
    },0);
  }
}
function closeRmTabDrop(){var drop=g("rmTabDrop");if(drop)drop.style.display="none";}
/* 시작 화면 선택 — 저장은 rs_default_tab 하나(새 상태변수 최소화), 기본값은 지금처럼 daily(기존 동작 그대로) */
var DEFAULT_TAB_OPTS=['dashboard','daily','roadmap','monthly','projects','assets','scenario'];
function getDefaultTab(){var v=null;try{v=localStorage.getItem('rs_default_tab');}catch(e){}return (DEFAULT_TAB_OPTS.indexOf(v)>=0)?v:'daily';}
function setDefaultTab(v){if(DEFAULT_TAB_OPTS.indexOf(v)<0)v='daily';try{lsSet('rs_default_tab',v);}catch(e){}}
function syncLgUnitBtns(){var w=g("lgUnitWon"),m=g("lgUnitMan");if(w)w.classList.toggle("on",lgUnit===1);if(m)m.classList.toggle("on",lgUnit>1);}

function fmtSh(won){
  if(!won&&won!==0)return"-";
  var n=Math.round(won);
  if(n===0)return"0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}
// customData 값 파싱: 쉼표 제거 후 숫자화 (음수/소수 OK, 비숫자/문자는 0)
function pcd(key){
  var v=customData[key];
  if(v==null||v==="")return 0;
  var n=parseFloat(String(v).replace(/,/g,""));
  return isNaN(n)?0:n;
}
// 프로젝트 시작 연·월 파싱 (date "YY.MM.DD" 형식만 인식, 아니면 null)
function getProjStart(p){
  var s=(p&&p.date)?String(p.date):"";
  var m=s.match(/^(\d{2})\.(\d{2})\.(\d{2})/);  // 26.03.16
  if(!m)return null;
  return {year:2000+parseInt(m[1],10), month:parseInt(m[2],10)}; // month 1~12
}
// 특정 연(yr)·월(mi: 0~11)에 적용되는 프로젝트 월수익 합 (만원→원)
// 규칙: 시작 연월을 아는 프로젝트는 "시작월 다음 달"부터 수익 적용. 시작일 불명이면 항상 적용(기존 동작)
// ── 단기딜(termMonths) 헬퍼: 월차별 수익률 직접입력 ──
function _freshP(p){return allP().find(function(x){return x.id===(p&&p.id);})||p;}
function shortRates(p){var fp=_freshP(p);var n=fp.termMonths||0;var sc=projSchedule[fp.id];var base=fp.monthlyRates||[];var out=[];for(var k=0;k<n;k++){var ov=sc&&sc.rates&&sc.rates[k];out.push((ov!=null&&ov!=='')?(parseFloat(ov)||0):(base[k]!=null?base[k]:0));}return out;}
function shortStartYM(p){var fp=_freshP(p);var sc=projSchedule[fp.id];if(sc&&sc.start){var v=String(sc.start);return /^\d{4}-\d{2}-\d{2}$/.test(v)?monthKey(v):v.slice(0,7);}var st=getProjStart(fp);return st?(st.year+'-'+String(st.month).padStart(2,'0')):'';}
/* 단기딜 운용 시작「일」(YYYY-MM-DD) — 없으면 ''. 수령일 계산·조기상환 기준일 전용, 월 귀속은 shortStartYM 그대로 */
function shortStartDate(p){var fp=_freshP(p);var sc=projSchedule[fp.id];
  if(sc&&sc.start&&/^\d{4}-\d{2}-\d{2}$/.test(String(sc.start)))return String(sc.start);
  var d=projTermDefault(fp);return d.start||'';}
function shortStartAbs(p){var ym=shortStartYM(p);var m=ym&&ym.match(/^(\d{4})-(\d{2})$/);if(!m)return null;return parseInt(m[1],10)*12+(parseInt(m[2],10)-1);}
function shortSummaryText(p){var r=shortRates(p);var tot=r.reduce(function(a,b){return a+(parseFloat(b)||0);},0);return '월차별 '+r.join('/')+'% · 합 '+(Math.round(tot*10)/10)+'%';}
function setShortStart(pid,val){if(!projSchedule[pid])projSchedule[pid]={start:'',rates:[]};projSchedule[pid].start=val||'';/* 저장·재계산은 change(invest-input) 리스너에서 */
  saveSoon();
}
function setShortRate(pid,k,val){if(!projSchedule[pid])projSchedule[pid]={start:'',rates:[]};if(!projSchedule[pid].rates)projSchedule[pid].rates=[];projSchedule[pid].rates[k]=(val===''?null:(parseFloat(val)||0));
  saveSoon();
}
function shortInputs(p){var fp=_freshP(p);var n=fp.termMonths||0;var r=shortRates(fp);var ym=shortStartYM(fp);var sd=shortStartDate(fp);var cells='';for(var k=0;k<n;k++){cells+="<span style='display:inline-flex;align-items:center;gap:2px'><span style='font-size:13px;color:var(--gray)'>"+(k+1)+"월차</span><input type='number' min='0' max='50' step='0.1' value='"+(r[k]||'')+"' class='invest-input' style='width:52px' oninput='setShortRate("+fp.id+","+k+",this.value)'><span style='font-size:13px;color:var(--ac)'>%</span></span>";}return "<div class='pe-row'><span class='pe-f pe-date'><span class='lb'>시작일</span><input type='date' value='"+sd+"' class='invest-input segtip' data-tip='운용 시작일§§수익금 수령일 계산에 쓰여요' onchange='setShortStart("+fp.id+",this.value)'></span>"+cells+(ym?(sd?'':"<span style='font-size:13px;color:#c08a3e;word-break:keep-all'>시작 "+ym+" · 일자까지 넣으면 수령일이 달력에 표시돼요</span>"):"<span style='font-size:13px;color:#c08a3e;word-break:keep-all'>시작일을 입력하면 로드맵에 반영돼요</span>")+"</div>";}

// 조기상환: 그 정산월의 일할 수익 정보 {mk,days,amtWon} (초일·상환일 모두 산입)
function projEarlyInfo(p){var ed=projEarly[p.id];if(!ed)return null;
  var mk=monthKey(ed);
  var _fp=allP().find(function(x){return x.id===p.id;})||p;
  var inv=(parseFloat(projInvest[p.id])||0)*10000;
  var yr=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;
  // 딜 기준일 = 시작일의 '일'(월 지급·회차 경계). 일수는 은행식: 직전 기준일 다음날~상환일.
  var aDay=0,_asrc=(((_fp.termMonths||0)>0)?shortStartDate(_fp):'')||((getProjTerm(p)||{}).start)||_fp.date||'';
  var _dm=String(_asrc).match(/(\d{2,4})[.\-](\d{1,2})[.\-](\d{1,2})/);
  if(_dm)aDay=parseInt(_dm[3],10);
  function _D(str){var a=String(str).split('-');return new Date(parseInt(a[0],10),parseInt(a[1],10)-1,parseInt(a[2],10));}
  var edD=_D(ed),la,na;
  if(aDay>0){var ay=edD.getFullYear(),am=edD.getMonth();
    if(edD.getDate()<aDay){am--;if(am<0){am=11;ay--;}}
    la=new Date(ay,am,aDay);na=new Date(ay,am+1,aDay);
  }else{la=_D(monthFirstDate(mk));na=_D(monthLastDate(mk));na=new Date(na.getFullYear(),na.getMonth(),na.getDate()+1);}
  var days=Math.round((edD-la)/86400000);if(days<0)days=0;
  var len=Math.round((na-la)/86400000);if(len<=0)len=30;
  var sameMonth=(la.getFullYear()===yr&&la.getMonth()===mi); // 직전 기준일이 이 달 → 이 달 정기 지급은 이미 발생
  var amt=0,detail='';
  if((_fp.termMonths||0)>0){
    var _r=shortRates(_fp),_n=_fp.termMonths,_sa=shortStartAbs(_fp);
    var _k=(yr*12+mi)-_sa;              // 이 달의 정기 회차
    var idx=sameMonth?_k+1:_k;          // 조기상환 시점에 진행 중이던 회차(일할 대상)
    var reg=(sameMonth&&_k>=1&&_k<=_n)?inv*((parseFloat(_r[_k-1])||0)/100):0;
    var prt=(idx>=1&&idx<=_n&&days>0)?inv*((parseFloat(_r[idx-1])||0)/100)*(days/len):0;
    amt=reg+prt;
    detail=(reg?('정기 '+Math.round(reg).toLocaleString()+'원'+(prt?' + ':'')):'')
          +(prt?((parseFloat(_r[idx-1])||0)+'% '+days+'일치 '+Math.round(prt).toLocaleString()+'원'):'');
  }else{
    var eff=projEffAt(p,yr,mi,inv,getEffectiveRate(p));
    var reg2=sameMonth?eff.principalWon*(eff.rate/100)/12:0;
    var prt2=(days>0)?eff.principalWon*(eff.rate/100)/365*days:0;
    amt=reg2+prt2;
    detail=(reg2?('정기 '+Math.round(reg2).toLocaleString()+'원'+(prt2?' + ':'')):'')
          +(prt2?(eff.rate+'% '+days+'일치 '+Math.round(prt2).toLocaleString()+'원'):'');
  }
  return {mk:mk,days:days,amtWon:Math.round(amt),detail:detail};
}
function setEarly(pid,val){if(val)projEarly[pid]=val;else delete projEarly[pid];
  saveSoon();
}
function startEarly(pid){projEarly[pid]=todayStr();renderSP();renderShort();if(typeof renderMoIncome==='function')renderMoIncome(dailyDate||todayStr());save();}
function clearEarly(pid){delete projEarly[pid];renderSP();renderShort();if(typeof renderMoIncome==='function')renderMoIncome(dailyDate||todayStr());save();}
// 일부 상환: 정렬된 상환 목록에서 (yr,mi) 정산월에 적용되는 남은원금·수익률 해소
function _repaySorted(pid){var a=projRepay[pid];if(!a||!a.length)return [];
  return a.slice().filter(function(x){return x&&x.from;}).sort(function(a,b){return a.from<b.from?-1:(a.from>b.from?1:0);});}
function _projRateAtMk(p,mkStr){
  var m=mkStr&&mkStr.match(/^(\d{4})-(\d{2})$/); if(!m)return getEffectiveRate(p)||0;
  var fp=_freshP(p);
  if((fp.termMonths||0)>0){ // 단기딜: 회차별 배열에서 그 달의 값을 그대로(연 수익률 개념 없음)
    var sa=shortStartAbs(fp); if(sa==null)return 0;
    var k=(parseInt(m[1],10)*12+(parseInt(m[2],10)-1))-sa;
    var r=shortRates(fp);
    return parseFloat(r[Math.max(0,Math.min(k,fp.termMonths)-1)])||0;
  }
  return projEffAt(p,parseInt(m[1],10),parseInt(m[2],10)-1,0,getEffectiveRate(p)||0).rate;
}
// 단기딜(월차별 수익률)까지 포함해 "지금" 적용 중인 수익률 하나를 뽑는다 — 자산 탭 표시용
function projCurrentRatePct(p){
  var fp=_freshP(p);
  if((fp.termMonths||0)>0){
    var r=shortRates(fp),n=fp.termMonths,sa=shortStartAbs(fp);
    if(sa==null||!n)return 0;
    var d=new Date();var k=(d.getFullYear()*12+d.getMonth())-sa+1; // 1-based 진행 회차
    if(k<1)k=1; if(k>n)k=n;
    return parseFloat(r[k-1])||0;
  }
  var ds=new Date();var mk=(typeof monthKey==='function')?monthKey(ds.getFullYear()+'-'+String(ds.getMonth()+1).padStart(2,'0')+'-'+String(ds.getDate()).padStart(2,'0')):'';
  return _projRateAtMk(p,mk);
}
function _addInvSorted(pid){var a=projAddInv[pid];if(!a||!a.length)return [];
  return a.slice().filter(function(x){return x&&x.from;}).sort(function(a,b){return a.from<b.from?-1:(a.from>b.from?1:0);});}
function projEffAt(p,yr,mi,basePrincipalWon,baseRate){
  var pr={principalWon:basePrincipalWon,rate:baseRate};
  var list=_repaySorted(p.id),add=_addInvSorted(p.id);
  var step=projRateStepOn[p.id]?(parseFloat(projRateStep[p.id])||0):0;
  var extR=projExtRateOn[p.id]?(parseFloat(projExtRate[p.id])||0):0;
  var extM=extR>0?(projExtFrom[p.id]||''):''; // 적용 시작을 안 골랐으면 미적용(미완성 줄과 같은 규칙)
  var extFa=/^\d{4}-\d{2}$/.test(extM)?(parseInt(extM.slice(0,4),10)*12+(parseInt(extM.slice(5,7),10)-1)):null;
  if(!list.length&&!add.length&&!(step>0)&&extFa==null)return pr;
  var cur=yr*12+mi,lastFa=null,rateFixed=false;
  for(var i=0;i<list.length;i++){
    var f=list[i].from;var fa=parseInt(f.slice(0,4),10)*12+(parseInt(f.slice(5,7),10)-1);
    var pw=(parseFloat(list[i].principal)||0)*10000; // 남은 원금 만원→원
    if(!(pw>0))continue; // 원금 미입력/0 → 미완성 줄, 절대 0으로 적용하지 않음
    if(cur>=fa){ // 적용 시작월(정산월)부터 계속 — 다음 상환이 있으면 그 달부터 덮어씀
      var _hasRt=(list[i].rate!=null&&list[i].rate!==''&&parseFloat(list[i].rate)>0);
      var rt=_hasRt?parseFloat(list[i].rate):baseRate;
      pr={principalWon:pw,rate:rt};lastFa=fa;rateFixed=_hasRt; // 수익률을 적었으면 그 값이 최종(연 인상을 더 얹지 않는다)
    }
  }
  for(var j=0;j<add.length;j++){ // 추가 투자 — 그 정산월부터 원금에 더한다(일할 없음)
    var af=add[j].from;var aa=parseInt(af.slice(0,4),10)*12+(parseInt(af.slice(5,7),10)-1);
    var aw=(parseFloat(add[j].amount)||0)*10000; // 추가로 넣은 금액 만원→원
    if(!(aw>0))continue; // 금액 미입력/0 → 미완성 줄
    // 일부 상환의 「남은 원금」은 그 시점의 절대값이므로, 그보다 앞선 추가분은 이미 포함된 것으로 본다
    if(cur>=aa&&(lastFa==null||aa>lastFa))pr.principalWon+=aw;
  }
  if(extFa!=null&&cur>=extFa&&(lastFa==null||extFa>=lastFa)){ // 연장 수익률 — 그 정산월부터 최종
    pr.rate=extR;rateFixed=true;
  }
  if(step>0&&!rateFixed){ // 연 수익률 인상 — 시작 정산월 기준 12개월마다 누적 가산(상환 줄에 수익률을 적었으면 그 값이 최종)
    var sa=projStartAbsOf(p);
    if(sa!=null){var yrs=Math.floor((cur-sa-1)/12);if(yrs>0)pr.rate=(pr.rate||0)+step*yrs;} // 첫 수령=시작 다음 달 → 1년차 수령 12회를 채운 다음 달부터 인상
  }
  pr.fixed=rateFixed; // 이 달의 수익률이 「최종 확정」인지(연 인상이 더 붙지 않는지)
  return pr;
}
// 자산 탭용: 오늘(현재 정산월) 기준 남은 투자원금(원). 미래 예정 상환은 아직 미반영.
function projCurrentPrincipalWon(p){
  if(projAssetHide[p.id])return 0; // 사용자가 정리한 항목만 자산에서 제외
  if(!projIncluded(p))return 0; // 「관리만」으로 고른 프로젝트는 자산 합계에서 제외(프로젝트 탭 표시는 불변)
  var base=(parseFloat(projInvest[p.id])||0)*10000;
  var d=new Date();
  var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var mk=(typeof monthKey==='function')?monthKey(ds):ds.slice(0,7);
  var yr=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;
  if(!_repaySorted(p.id).length&&!_addInvSorted(p.id).length)return base;
  return projEffAt(p,yr,mi,base,0).principalWon;
}
// 만기/조기상환 상태 — 자동 제외하지 않고 자산 탭에 배지로 표시, 사용자가 「정리」로 확정
function projMaturityStatus(p){
  var d=new Date();
  var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var ed=projEarly[p.id];if(ed&&ds>ed)return '조기상환';
  var _fp=allP().find(function(x){return x.id===p.id;})||p;
  if((_fp.termMonths||0)>0){var _sa=shortStartAbs(_fp);var mk=(typeof monthKey==='function')?monthKey(ds):ds.slice(0,7);
    var yr=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;
    if(_sa!=null&&(yr*12+mi)>_sa+_fp.termMonths)return '만기';}
  else{var _tm=getProjTerm(p);if(_tm&&_tm.end&&ds>_tm.end)return '만기';}
  return '';
}
function dismissProjAsset(pid){rsConfirm('이 항목을 자산 목록에서 뺄까요?§§프로젝트 기록과 지난 수익은 그대로 남아요.',function(){projAssetHide[pid]=true;renderAssets();save();});}
// 추가 수익률 구간 합산(%): atMat=자연 만기 정산월인가, monthIdx=이 달의 운용월차(1부터) — 일치하는 구간들의 pct 합
function projBonusPctSum(pid,atMat,monthIdx){
  if(!projBonusOn[pid])return 0;
  var arr=projBonus[pid]||[];var s=0;
  arr.forEach(function(r){
    var n=parseFloat(r&&r.pct)||0;if(!(n>0))return;
    if(r.at==='mat'){if(atMat)s+=n;}
    else{var m=parseInt(r.at,10);if(m>0&&monthIdx!=null&&m===monthIdx)s+=n;}
  });
  return s;
}
// 한 프로젝트의 (yr,mi) 정산월 수익(원) — getMonthlyProjectWon에서 동작 동일하게 추출(누적 replay 공용)
function projMonthWon(p,yr,mi){
    const inv=(parseFloat(projInvest[p.id])||0)*10000;  // 투자금 만원→원
    var _fp=allP().find(function(x){return x.id===p.id;})||p;
    if((_fp.termMonths||0)>0){ // 단기딜: 월차별 수익률, 운용 N개월만 적용(연환산·영구 적용 안 함)
      var _r=shortRates(_fp), _n=_fp.termMonths;
      if(yr==null||mi==null){var _avg=_r.reduce(function(a,b){return a+(parseFloat(b)||0);},0)/(_n||1);return inv*_avg/100;}
      var _sa=shortStartAbs(_fp); if(_sa==null)return 0; // 시작월 미정 → 0
      var _k=(yr*12+mi)-_sa; // 0=시작월, 첫 수익=다음 달 → [1..N]
      var _ed2=projEarly[p.id];
      if(_ed2){var _em2=monthKey(_ed2);var _eb2=parseInt(_em2.slice(0,4),10)*12+(parseInt(_em2.slice(5,7),10)-1);var _cu2=yr*12+mi;
        if(_cu2>_eb2)return 0; // 조기상환 이후 → 0
        if(_cu2===_eb2){var _i2=projEarlyInfo(p);return _i2?_i2.amtWon:0;} } // 그 달만 일할
      if(_k<1||_k>_n)return 0;
      var _effS=projEffAt(p,yr,mi,inv,0); // 일부 상환·추가 투자 반영(정산월 경계, 일할 X) — rate는 월차별 배열을 쓰므로 무시
      var _out1=_effS.principalWon*((parseFloat(_r[_k-1])||0)/100);
      var _bp1=projBonusPctSum(p.id,(_k===_n&&!_ed2),_k); // 만기(마지막 회차, 조기상환 없을 때만) 또는 지정 개월차
      if(_bp1>0)_out1+=_effS.principalWon*(_bp1/100);
      return _out1;
    }
    const monthly=inv*(getEffectiveRate(p)/100)/12;
    if(yr==null||mi==null)return monthly; // 인자 없으면 기존처럼 전부(badge 등 합계용 호환)
    var _tm=getProjTerm(p);
    if(!_tm.start)return monthly; // 시작일 불명 → 레거시(항상 전액, 만기 시점 알 수 없어 보너스 미적용)
    var _sk=monthKey(_tm.start); // 시작일이 속한 정산월(월 시작일 설정 반영)
    var _sa=parseInt(_sk.slice(0,4),10)*12+(parseInt(_sk.slice(5,7),10)-1);
    var cur=yr*12+mi;
    if(cur<_sa+1)return 0; // 첫 수익 = 시작 정산월 다음 달
    var _ea=null;
    if(_tm.end){var _ek=monthKey(_tm.end);_ea=parseInt(_ek.slice(0,4),10)*12+(parseInt(_ek.slice(5,7),10)-1);if(cur>_ea)return 0;} // 종료 정산월 이후 → 0
    var _ed=projEarly[p.id];
    if(_ed){var _emk=monthKey(_ed);var _eab=parseInt(_emk.slice(0,4),10)*12+(parseInt(_emk.slice(5,7),10)-1);
      if(cur>_eab)return 0; // 조기상환 이후 → 0
      if(cur===_eab){var _ii=projEarlyInfo(p);return _ii?_ii.amtWon:0;} } // 그 달만 일할
    var _eff=projEffAt(p,yr,mi,inv,getEffectiveRate(p)); // 일부 상환 반영(정산월 경계, 일할 X)
    var _out2=_eff.principalWon*(_eff.rate/100)/12; // 매달 월 수익 전액(일할 X)
    var _k2=cur-_sa; // 운용월차(1부터, 시작 다음 달=1)
    var _bp2=projBonusPctSum(p.id,(_ea!=null&&cur===_ea&&!_ed),_k2);
    if(_bp2>0)_out2+=_eff.principalWon*(_bp2/100);
    return _out2;
}
function getMonthlyProjectWon(yr,mi){return SP.reduce(function(s,p){return s+(projIncluded(p)?projMonthWon(p,yr,mi):0);},0);}
// ── 누적 수익: 시작 정산월~이번 정산월(만기·조기상환 달까지) projMonthWon 재생 합산 ──
// 시작 불명(운용기간·시작월 없음) → {unknown:true}: 무한 누적 방지, 카드에 안내만 표시
function projStartAbsOf(p){
  var fp=_freshP(p);
  if((fp.termMonths||0)>0)return shortStartAbs(fp);
  var tm=getProjTerm(p); if(!tm.start)return null;
  var k=monthKey(tm.start);
  return parseInt(k.slice(0,4),10)*12+(parseInt(k.slice(5,7),10)-1);
}
function projCumInfo(p){
  var inv=(parseFloat(projInvest[p.id])||0)*10000; if(!(inv>0))return null;
  var sa=projStartAbsOf(p); if(sa==null)return {unknown:true};
  var _mk=monthKey(todayStr());
  var cur=parseInt(_mk.slice(0,4),10)*12+(parseInt(_mk.slice(5,7),10)-1);
  if(cur<sa)return {won:0,months:0,pct:0};
  var fp=_freshP(p);
  var end=cur;
  if((fp.termMonths||0)>0){end=Math.min(end,sa+fp.termMonths);}
  else{var tm=getProjTerm(p);if(tm.end){var ek=monthKey(tm.end);end=Math.min(end,parseInt(ek.slice(0,4),10)*12+(parseInt(ek.slice(5,7),10)-1));}}
  var ed=projEarly[p.id];
  if(ed){var em=monthKey(ed);end=Math.min(end,parseInt(em.slice(0,4),10)*12+(parseInt(em.slice(5,7),10)-1));}
  var tot=0,g2=0;
  for(var m=sa;m<=end&&g2<600;m++,g2++){tot+=projMonthWon(p,Math.floor(m/12),m%12);}
  return {won:Math.round(tot),months:Math.max(0,end-sa),pct:tot/inv*100};
}
function hasData(sectionId){
  // 표의 "실제 데이터 칸"에만 값이 있는지 확인
  // ※ ri(수익률)는 기본값 15가 있는 골격이므로 제외!
  var sec=g(sectionId); if(!sec)return false;
  // 중기는 추가 항목(customRowsMid)이 있어야 데이터 입력칸이 생김
  if(sectionId==="mid"&&typeof customRowsMid!=="undefined"&&customRowsMid&&customRowsMid.length>0)return true;
  // 현재자산이 입력되면 표(자산·투자금·수익·총자산)가 실제로 채워짐 → 데이터 있음
  // (나이·자녀만으론 금액 표가 비어있으므로 제외)
  if(sectionId==="mid"){var mv=parseFloat((g("mdV")&&g("mdV").value||"").replace(/,/g,""))||0;var lv=parseFloat((g("sV")&&g("sV").value||"").replace(/,/g,""))||0;if(mv>0||lv>0)return true;}
  if(sectionId==="long"){var lgv=parseFloat((g("sV")&&g("sV").value||"").replace(/,/g,""))||0;if(lgv>0)return true;}
  // 실제 데이터 칸: si(저축/단기 셀)·ev-in(이벤트/목표 메모)·invest-input(투자)·cr-cell·[data-ck](커스텀 행 셀)
  var cells=sec.querySelectorAll(".si,.ev-in,.invest-input,.cr-cell,[data-ck]");
  for(var i=0;i<cells.length;i++){
    var el=cells[i];
    if(el.closest&&el.closest(".imp-body"))continue;  // 가져오기 영역(엑셀/시트 칸) 제외
    var v=(el.value!=null?el.value:el.textContent||"").trim().replace(/,/g,"");
    if(!v)continue;
    if(isNaN(parseFloat(v)))return true;          // 텍스트 메모 = 데이터
    if(parseFloat(v)!==0)return true;             // 0이 아닌 숫자 = 데이터
  }
  return false;
}
var _fontStep=0;  // -1~+3 단계
var FSZ_SCALES=[0.74,0.82,0.9,1.0,1.12,1.26,1.42];
function dlFontScale(){return FSZ_SCALES[_fontStep+3]||1.0;}
function applyFontSize(){
  // zoom으로 모든 글자(안내문·표·입력칸 포함) 비율 조정
  var scale=dlFontScale();
  document.body.style.zoom=scale;
  // zoom이 position:fixed 요소(내비 드로어 등)의 100dvh 높이까지 키워 화면 밖으로 밀어내므로 역보정
  document.documentElement.style.setProperty('--fsz-scale',scale);
  // zoom 미지원 브라우저(firefox) 대비 transform fallback 없이 zoom 우선
  try{lsSet("rs_fontstep",String(_fontStep));}catch(e){}
  // 차트(막대 그래프 등)는 캔버스에 폰트 크기를 직접 그려서 zoom만으로는 툴팁·호버 글씨가 같이 줄지 않으므로 강제로 다시 그린다
  // ★ 대시보드 차트도 반드시 포함(테마 전환과 같은 이유 — 재발 금지)
  Object.keys(charts).forEach(function(k){if(charts[k]){charts[k].destroy();charts[k]=null;}});
  setTimeout(function(){try{renderActiveView();}catch(e){}renderShort();renderMid();recalc();try{renderDashboard();}catch(e){}try{applyHelpHidden();}catch(e){}try{applyNavPin();}catch(e){}},50);
}
function changeFontSize(dir){
  if(dir===0)_fontStep=0;
  else _fontStep=Math.max(-3,Math.min(3,_fontStep+dir));
  applyFontSize();
}
function toggleImp(id){
  // 사용자가 헤더 클릭 시 직접 열고닫기
  var box=g(id); if(box)box.classList.toggle("open");
}
function setOpen(el,shouldOpen){
  if(!el)return;
  if(shouldOpen)el.classList.add("open");
  else el.classList.remove("open");
}
function syncImportToggle(){
  // 표에 데이터가 있으면 가져오기 영역을 접고, 비어있으면 펼친다
  try{
    setOpen(g("importShort"), !hasData("short"));
    setOpen(g("importMid"), !hasData("mid"));
    setOpen(g("importLong"), !hasData("long"));
  }catch(e){console.error("토글 동기화 오류:",e);}
}
function loadDailyLink(){try{var v=JSON.parse(localStorage.getItem('rs_daily_link')||'null');dailyLinkMonths=(v&&typeof v==='object')?v:{};}catch(e){dailyLinkMonths={};}}
function saveDailyLink(){try{lsSet('rs_daily_link',JSON.stringify(dailyLinkMonths));}catch(e){}}
function dailyMonthTotal(yr,mi){var pre=yr+'-'+String(mi+1).padStart(2,'0');return dailyData.reduce(function(s,e){return s+(monthKey(e.date)===pre?entrySpend(e):0);},0);}
function dailyLinkOn(yr,mi){return !!dailyLinkMonths[yr+'_'+mi];}
function dailyLinkExpenseWon(yr,mi){return dailyLinkOn(yr,mi)?dailyMonthTotal(yr,mi):0;}
function toggleDailyLink(yr,mi){var k=yr+'_'+mi;if(dailyLinkMonths[k])delete dailyLinkMonths[k];else dailyLinkMonths[k]=true;saveDailyLink();renderShort();}
function renderShort(){
  const yr=parseInt(g("shYear").value)||2026;
  const shBl=g("shBlur")&&g("shBlur").checked;
  g("shTitle").textContent="단기 로드맵 ("+yr+"년)";
  if(!shData.savings)shData={savings:{},income:{},target:{}};
  const hdr=(t,wide)=>"<td style='background:var(--tbl-hdr-bg);color:var(--tbl-hdr-color);font-weight:700;font-size:13px;text-align:center;min-width:"+(wide?"60px":"46px")+"'>"+(t||"")+"</td>";
  const projMo=getMonthlyProjectWon();  // 합계/그래프용(전체)
  function cell(won){
    const s=fmtSh(won);
    return shBl?"<span class='blurred' style='display:inline-block;filter:blur(2.5px)'>"+s+"</span>":s;
  }
  function inputCell(v,key,mi){
    var dispV=(shUnit>1)?(v/shUnit):v;
    if(shBl) return "<td><span class='blurred' style='display:inline-block;filter:blur(2.5px)'>"+fmtSh(dispV)+"</span></td>";
    var dvShow=(shUnit>1)?fmtUnitDisp(dispV):fmtComma(dispV);
    return "<td style='padding:2px 4px;text-align:right'><input type='text' inputmode='numeric' class='si' value='"+dvShow+"' placeholder='-' style='width:100%;max-width:100%;box-sizing:border-box;text-align:right' onfocus='siFocus(this)' onblur='siBlur(this,\""+key+"\",\""+yr+"\",\""+mi+"\")'></td>";
  }

  let h="<table class='xl'><tbody><tr><td class='rl col-hdr'>구분</td>";
  MONTHS.forEach(m=>h+=hdr(m,false));h+=hdr("계",true)+"</tr>";
  // 행별 데이터 계산
  var salTots=[],incTots=[],tgtTots=[],projTots=[],sumTots=[];
  var salTot=0,incTot=0,tgtTot=0,projYrTot=0;
  MONTHS.forEach(function(_,mi){
    const sv=shData.savings[yr+"_"+mi]||0;
    const ic=shData.income[yr+"_"+mi]||0;
    const tg=shData.target[yr+"_"+mi]||0;
    const pm=getMonthlyProjectWon(yr,mi);  // 시작월 다음 달부터 적용
    // 커스텀 행 합산 (target 행 제외 · §2.37 제외로 옮긴 행은 뺀다)
    var crSum=customRowsShort.reduce(function(acc,cr){
      if(cr.label==="목표액"||cr.id.indexOf("target")>=0)return acc;
      if(shExclIds.indexOf(cr.id)>=0)return acc;
      return acc+(pcd(cr.id+"_sh_"+yr+"_"+mi));
    },0);
    salTots.push(sv);salTot+=sv;
    incTots.push(ic);incTot+=ic;
    tgtTots.push(tg);tgtTot+=tg;
    projTots.push(pm);projYrTot+=pm;
    sumTots.push(sv+ic+pm+crSum-dailyLinkExpenseWon(yr,mi));
  });
  // 행 렌더 함수 맵
  var rowRenderers={
    savings:function(){
      var r="<tr class='r-asset'>"+rlTdMBase("S_salary","급여","savings");
      MONTHS.forEach((_,mi)=>r+=inputCell(salTots[mi],"savings",mi));
      return r+"<td class='sum-cell'>"+cell(salTot)+"</td></tr>";
    },
    income:function(){
      var r="<tr class='r-sv'>"+rlTdMBase("S_income","기타소득","income");
      MONTHS.forEach((_,mi)=>r+=inputCell(incTots[mi],"income",mi));
      return r+"<td class='sum-cell'>"+cell(incTot)+"</td></tr>";
    },
    proj:function(){
      var r="<tr class='r-sub'><td class='rl' style='font-size:13px'>"+
        (rowLabels["S_proj"]||"프로젝트")+"<br><span style='color:var(--ac);font-size:13px'>자동연결</span></td>";
      MONTHS.forEach((_,mi)=>r+="<td style='color:var(--ac);text-align:right;padding:2px 4px'>"+cell(projTots[mi])+"</td>");
      return r+"<td class='sum-cell' style='color:var(--ac)'>"+cell(projYrTot)+"</td></tr>";
    },
    target:function(){
      var r="<tr class='r-invest'>"+rlTdMBase("S_target","목표액","target");
      MONTHS.forEach((_,mi)=>r+=inputCell(tgtTots[mi],"target",mi));
      return r+"<td class='sum-cell'>"+cell(tgtTot)+"</td></tr>";
    },
    total:function(){
      var r="<tr class='r-total'>"+rlTd("S_total","합계");
      var tot=0;
      MONTHS.forEach((_,mi)=>{const s=sumTots[mi];tot+=s;r+="<td class='r-total' style='text-align:right;font-weight:700'>"+cell(s)+"</td>";});
      return r+"<td class='sum-cell'>"+cell(tot)+"</td></tr>";
    },
    pct:function(){
      let ps=0,pc=0;
      var r="<tr class='r-sub'><td class='rl'>달성률</td>";
      MONTHS.forEach((_,mi)=>{
        const s=sumTots[mi];const tg=tgtTots[mi];
        if(tg>0){var p=Math.round(s/tg*100);ps+=p;pc++;r+="<td class='"+(p>=100?"pct-good":"pct-bad")+"' style='text-align:center'>"+p+"%</td>";}
        else r+="<td class='pct-na' style='text-align:center'>-</td>";
      });
      const ap=pc>0?Math.round(ps/pc):null;
      return r+"<td class='sum-cell "+(ap!=null?(ap>=100?"pct-good":"pct-bad"):"pct-na")+"'>"+(ap!=null?ap+"%":"-")+"</td></tr>";
    }
  };
  rowRenderers.dailylink=function(){
    var r="<tr class='r-sub'><td class='rl' style='font-size:13px'>일일 지출<br><span style='color:var(--ac);font-size:13px'>일일기록 연동</span></td>";
    var tot=0;
    MONTHS.forEach(function(_,mi){
      if(dailyLinkOn(yr,mi)){
        var w=dailyMonthTotal(yr,mi);tot+=(-w);
        var disp=shBl?"<span class='blurred' style='display:inline-block;filter:blur(2.5px)'>"+fmtSh(-w)+"</span>":fmtSh(-w);
        r+="<td onclick='toggleDailyLink("+yr+","+mi+")' title='클릭: 이 달 일일기록 연동 해제' style='color:var(--ac);text-align:right;padding:2px 4px;cursor:pointer;background:var(--ac-light);font-size:14px'>"+disp+"<br><span style='font-size:13px;color:var(--ac)'>일일기록</span></td>";
      }else{
        r+="<td onclick='toggleDailyLink("+yr+","+mi+")' title='클릭: 이 달을 일일기록 합계로 채우기' style='text-align:center;padding:2px 4px;cursor:pointer;color:#ccc;font-size:18px'>+</td>";
      }
    });
    return r+"<td class='sum-cell' style='color:var(--ac)'>"+cell(tot)+"</td></tr>";
  };
  // getShortOrder 순서로 렌더
  var order=getShortOrder();
  order=order.slice();
  if(order.indexOf("dailylink")<0&&(dailyData.length>0||Object.keys(dailyLinkMonths).length>0)){var _ti=order.indexOf("total");if(_ti<0)_ti=order.length;order.splice(_ti,0,"dailylink");}
  order.forEach(function(id){
    if(rowRenderers[id]){h+=rowRenderers[id]();}
    else{
      var cr=customRowsShort.find(function(x){return x.id===id;});
      if(!cr)return;
      var tot=0;
      var row="<tr class='r-sub'><td class='rl' style='padding:4px 6px;vertical-align:middle;cursor:pointer' ondblclick='editRowLabel(\""+cr.id+"\",\""+String(cr.label).replace(/\n/g," ")+"\")' title='더블클릭: 이름 수정'>"+
        "<div style='display:flex;align-items:center;gap:2px'>"+
        "<div style='display:flex;flex-direction:column;gap:1px'>"+
        "<button onclick='moveShortRow(\""+cr.id+"\", -1)' class='no-copy' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1'>▲</button>"+
        "<button onclick='moveShortRow(\""+cr.id+"\", 1)' class='no-copy' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1'>▼</button>"+
        "</div>"+
        "<span style='font-size:13px;flex:1;word-break:break-word'>"+lblHtml(cr.label)+"</span>"+
        "<button onclick='deleteCustomRowShort(\""+cr.id+"\")' style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0'>✕</button>"+
        "</div></td>";
      MONTHS.forEach(function(_,mi){
        var k=cr.id+"_sh_"+yr+"_"+mi;
        var v=pcd(k);
        tot+=v;
        row+=shBl?"<td style='padding:2px 4px;min-width:52px;text-align:right'><span class='blurred' style='display:inline-block;filter:blur(3px)'>"+((v&&v!==0)?Math.round(v).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,","):"0")+"</span></td>":"<td style='padding:2px 4px;min-width:52px;text-align:right;cursor:pointer;position:relative'><span contenteditable='true' data-ck='"+k+"' style='display:block' onfocus='this.textContent=this.textContent.replace(/,/g,\"\")' onblur='var raw=this.textContent.replace(/[^0-9.\\-]/g,\"\");var neg=/^-/.test(raw.trim());var n=parseFloat(raw.replace(/-/g,\"\"))||0;if(neg)n=-n;customData[this.dataset.ck]=n;renderShort();save()'>"+((v&&v!==0)?Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):"0")+"</span>"+cellNoteDot(k,'openCellNoteShort')+"</td>";
      });
      row+="<td class='sum-cell'>"+cell(tot)+"</td></tr>";
      h+=row;
    }
  });
  h+="</tbody></table>";
  var _sw=g("shWrap");if(_sw){_sw.innerHTML="";void _sw.offsetHeight;_sw.innerHTML=h;}
  renderShHiddenSet();
  var _dh=g("shDailyHint");if(_dh)_dh.innerHTML=(dailyData.length>0||Object.keys(dailyLinkMonths).length>0)?"💡 <b>일일 지출</b> 행의 <b>달 칸</b>을 누르면 그 달 일일기록 합계가 반영돼요 (다시 누르면 해제)":"";
  updateShortChart(yr,projMo);syncShUnitBtns();
  updateShortBadge(yr);
}

function toggleCrisis(y){
  y=parseInt(y);
  var i=CRISIS.indexOf(y);
  if(i>=0)CRISIS.splice(i,1);
  else CRISIS.push(y);
  recalc();renderMid();save();  // 장기+중기 모두 즉시 갱신
}
function yhCell(y,bl){
  const cr=CRISIS.includes(y);
  const bg=cr?"var(--tbl-crisis-bg)":"var(--tbl-year-bg)";
  const co=cr?"var(--tbl-crisis-color)":"var(--tbl-year-color)";
  // 클릭하면 위기연도 지정/해제 (셀 색 짙어지고 ⚠ 위기 표시)
  var _gt=_msYearCache&&_msYearCache[y];
  var _gtD=_gt?(bl?"<span class='blurred'>"+_gt+"</span>":_gt):"";
  return "<td onclick='toggleCrisis("+y+")' title='클릭해서 위기연도 지정/해제"+(_gt&&!bl?" · 🎯 "+_gt+" 도달":(_gt?" · 🎯 목표 도달":""))+"' style='background:"+bg+";color:"+co+";font-weight:700;font-size:13px;text-align:center;cursor:pointer'>"+y+"년"+(cr?"<br><span style='font-size:13px;opacity:.85'>⚠ 위기</span>":"")+(_gt?"<br><span style='font-size:12px;white-space:nowrap'>🎯"+_gtD+"</span>":"")+"</td>";
}
function renderMid(){
  var mdY2=parseInt(g("mdY").value)||2026,mdA2=parseInt(g("mdA").value)||0,mdV2=(parseFloat(g("mdV").value)||0)*10000;  // 만원 입력 → 원 변환
  var bl=g("mdBlur")&&g("mdBlur").checked;
  var sa=mdA2>0?mdA2:(function(){var lsA=parseInt(g("sA")&&g("sA").value)||0;var lsY=parseInt(g("sY")&&g("sY").value)||2026;return lsA>0?(lsA+(mdY2-lsY)):null;})(); /* 중기 나이: 자체 입력 없으면 장기(sA) 기준 연도보정 */
  var order=getMidOrder();
  // 합계(M_invest)보다 위에 있는 커스텀 행 식별
  var invIdx=order.indexOf("M_invest");
  var aboveCustom=[];  // 합계 위 커스텀 (합계+복리에 포함)
  order.forEach(function(rid,i){
    if(rid.indexOf("M_")!==0 && invIdx>=0 && i<invIdx){
      var cr=customRowsMid.find(function(x){return x.id===rid;});
      if(cr)aboveCustom.push(cr);
    }
  });
  // 💰 자산 구역(§2.36 중기 이식 · 세션 66) — 장기와 같은 계승 규칙 · 상승률은 구역 공통 · 15% 복리 밖 · 총 자산 합계에만 합류
  var _mdAtT=abList().filter(function(b){return (b.rows||[]).length>0;});
  var _mdFull=_mdAtT.length>0;  // 그룹 열(자세히 표)은 구역에 항목이 하나라도 있을 때만 켠다
  var _abP={}; // 블록 행별 계승값(원) — 저장하지 않는 파생(§2.2)
  // 연도별 복리 계산 (합계 위 커스텀을 원금에 포함)
  var rs=[];var cur=mdV2;
  for(var i=0;i<11;i++){
    var y=mdY2+i;
    var rate=(mdYR[y]!=null?mdYR[y]:15)/100;
    var sv=CS[y]!=null?CS[y]:0;
    // 합계 위 커스텀 행의 해당 연도 값 합산
    var crAbove=aboveCustom.reduce(function(acc,cr){
      var v=pcd(cr.id+"_md_"+y);
      return acc+v;
    },0);
    // 합계 = 직전 자산 + 연저축 + 합계위커스텀
    var hap=cur+sv+crAbove;
    // 총합계 = 합계 * (1+수익률)
    var tot=hap*(1+rate);
    // 합계 아래 커스텀 행 = 현금 자산 합계에 단순 합산(수익률 미적용, §2.37 「빼기」)
    var belowSum=0;
    order.forEach(function(rid2,i2){
      if(rid2.indexOf("M_")!==0 && invIdx>=0 && i2>invIdx){
        belowSum+=pcd(rid2+"_md_"+y);
      }
    });
    // 💰 자산 구역: 계승 규칙은 §2.35·§2.36과 같다 — 적은 해는 그 값, 안 적은 해는 전해×(1+상승률). neg 행은 뺀다.
    var _abRow={},_abBlk={},_atEq=0;
    abList().forEach(function(b){
      var rt=abRate(b),eq=0;
      (b.rows||[]).forEach(function(rw){
        var ov=abV[rw.id+'_md_'+y],v;
        if(ov!=null)v=parseFloat(ov)||0;
        else v=(i===0)?0:Math.round((_abP[rw.id]||0)*(1+rt/100));
        _abP[rw.id]=v;_abRow[rw.id]=v;
        eq+=(rw.neg?-v:v);
      });
      _abBlk[b.id]=eq;_atEq+=eq;
    });
    rs.push({y:y,asset:cur,sv:sv,crAbove:crAbove,hap:hap,tot:tot,rate:rate,belowSum:belowSum,ab:_abRow,abBlk:_abBlk,atEq:_atEq});
    cur=tot;  // 다음 해 자산은 올해 총합계(블록·제외행은 다음 해 원금에 안 들어간다 — 15% 복리 밖)
  }
  function fmt(v,b){var dv=(mdUnit>1)?(v/mdUnit):v;var s=(mdUnit>1)?fmtUnitDisp(dv):fmtSh(dv);return b?"<span class='blurred'>"+s+"</span>":s;}
  var _mdHdrRows=1+(sa?1:0)+children.length;  // 「기준」그룹 = 연도+나이+자녀 행 수
  let h="<table class='xl"+(_mdFull?" has-grp":"")+"'><tbody><tr>"+(_mdFull?reGrpTd("기준",_mdHdrRows):"")+"<td class='rl col-hdr'>구분/년</td>";
  rs.forEach(r=>h+=yhCell(r.y,bl));h+="</tr>";
  if(sa){h+="<tr class='r-sub'><td class='rl'>나이</td>";for(var i=0;i<11;i++){var _ag=(sa+i)+"세";h+="<td style='text-align:center'>"+(bl?"<span class='blurred'>"+_ag+"</span>":_ag)+"</td>";}h+="</tr>";}
  children.forEach(function(c){var cca=parseInt(c.age);h+="<tr class='r-sub'><td class='rl'>"+dlEsc(c.name)+"</td>";for(var i=0;i<11;i++){var _cag=isNaN(cca)?"":((cca+i)+"세");h+="<td style='text-align:center'>"+(bl&&_cag?"<span class='blurred'>"+_cag+"</span>":_cag)+"</td>";}h+="</tr>";});
  // ── 현금 자산 블록(기본행+커스텀행) — 그룹 열은 order 전체를 한 덩어리로 묶는다 ──
  var _mdFirst=true;
  order.forEach(function(rid){
    if(rid==="M_asset"){
      h+="<tr class='r-asset'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMid("M_asset","현 자산","M_asset");
      rs.forEach(r=>h+="<td class=''>"+fmt(r.asset,bl)+"</td>");h+="</tr>";
    } else if(rid==="M_sv"){
      h+="<tr class='r-sv'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMid("M_sv","연저축액","M_sv");
      rs.forEach(r=>h+="<td class=''>"+fmt(r.sv,bl)+"</td>");h+="</tr>";
    } else if(rid==="M_invest"){
      h+="<tr class='r-invest'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMid("M_invest","합계","M_invest");
      rs.forEach(r=>h+="<td class=''>"+fmt(r.hap,bl)+"</td>");h+="</tr>";
    } else if(rid==="M_rate"){
      h+="<tr class='r-rate'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMid("M_rate","수익률","M_rate");
      rs.forEach(r=>h+="<td><div class='rpill'><input class='ri' type='number' value='"+(mdYR[r.y]!=null?mdYR[r.y]:15)+"' min='0' max='99' step='0.1' oninput=\"mdYR["+r.y+"]=parseFloat(this.value)||15\" onchange=\"renderMid();save()\"><span style='font-size:13px;font-weight:700;color:#3d3000'>%</span></div></td>");h+="</tr>";
    } else if(rid==="M_total"){
      h+="<tr class='r-total'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMid("M_total",_mdFull?"현금 자산 합계":"총 합계","M_total");
      rs.forEach(function(r){
        var grand=r.tot+r.belowSum;
        h+="<td class='' style='"+(CRISIS.includes(r.y)?"color:var(--crisis-text)":"")+"'>"+fmt(grand,bl)+"</td>";
      });h+="</tr>";
    } else {
      var cr=customRowsMid.find(function(x){return x.id===rid;});
      if(!cr)return;
      h+="<tr class='r-sub'>"+((_mdFull&&_mdFirst)?reGrpTd("현금<br>자산",order.length):"");_mdFirst=false;
      h+=rlTdMove(cr.id,cr.label.replace(/\n/g,"\n"),cr.id,"moveMidRow",true,"deleteCustomRowMid(\""+cr.id+"\")");
      var msy=mdY2;
      for(var yi=0;yi<11;yi++){
        var ky=msy+yi;var kk=cr.id+"_md_"+ky;var vv=customData[kk]||"";
        h+=bl?"<td style='padding:2px 4px;min-width:70px;text-align:right'><span class='blurred' style='display:inline-block;filter:blur(3px)'>"+(vv?fmtComma(vv):"0")+"</span></td>":"<td style='padding:2px 4px;min-width:70px;cursor:pointer;text-align:right;position:relative'><span contenteditable='true' data-ck='"+kk+"' style='display:block' onfocus='this.textContent=this.textContent.replace(/,/g,\"\")' onblur='var t=(this.textContent||\"\").trim();var d=t.replace(/,/g,\"\");if(d!==\"\"&&/^-?\\d+(\\.\\d+)?$/.test(d)){customData[this.dataset.ck]=fmtComma(parseFloat(d));this.textContent=fmtComma(parseFloat(d));}else{customData[this.dataset.ck]=t;this.textContent=t;}renderMid();save()'>"+(vv?fmtComma(vv):"")+"</span>"+cellNoteDot(kk,'openCellNoteMid')+"</td>";
      }
      h+="</tr>";
    }
  });
  // ── 💰 자산 구역 (블록마다 항목 행 + 상승률 + 합계) — 장기와 같은 렌더링, 스코프만 _md_ ──
  _mdAtT.forEach(function(b){
    var _raw=String(b.name||'자산'),_bn=lblHtml(_raw),_first=true;
    var _bnGrp=(_raw.indexOf('\n')<0)?_bn.replace(/ /g,'<br>'):_bn;
    var _grp=function(){var t=_first?reGrpTd("<span class='ab-grp' ondblclick='editRowLabel(\""+reEsc(b.id)+"\",\"\")' style='cursor:pointer'>"+_bnGrp+"</span>",abRowsN(b,true)):"";_first=false;return t;};
    (b.rows||[]).forEach(function(rw){
      h+="<tr class='r-sv'>"+_grp();
      h+="<td class='rl' style='padding:4px 6px;vertical-align:top;cursor:pointer' ondblclick='editRowLabel(\""+reEsc(rw.id)+"\",\"\")'>";
      h+="<div style='display:flex;align-items:center;gap:2px'>";
      h+="<div style='display:flex;flex-direction:column;gap:1px'>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-r='"+reEsc(rw.id)+"' data-d='-1' onclick='abMoveRow(this.dataset.r,parseInt(this.dataset.d))'>▲</button>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-r='"+reEsc(rw.id)+"' data-d='1' onclick='abMoveRow(this.dataset.r,parseInt(this.dataset.d))'>▼</button>";
      h+="</div>";
      h+="<span style='font-size:13px;flex:1;white-space:normal;word-break:keep-all;overflow-wrap:break-word'>"+lblHtml(rw.label||'항목')+(rw.neg?"<span style='white-space:nowrap'>&nbsp;(−)</span>":"")+"</span>";
      h+="<button class='segtip' data-tip='합계에서 빼는 항목§§대출처럼 갚아야 할 돈에 쓰세요' style='background:none;border:none;cursor:pointer;color:"+(rw.neg?'var(--ac)':'#ccc')+";font-size:12px;padding:0' data-r='"+reEsc(rw.id)+"' onclick='abToggleNeg(this.dataset.r)'>±</button>";
      h+="<button style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-r='"+reEsc(rw.id)+"' onclick='abDelRow(this.dataset.r)'>×</button>";
      h+="</div></td>";
      rs.forEach(function(r){h+=abCellTdMid(r.y,(r.ab&&r.ab[rw.id])||0,rw.id,bl);});
      h+="</tr>";
    });
    h+="<tr class='r-rate'>"+_grp();
    h+="<td class='rl' style='padding:4px 6px;vertical-align:middle'><div style='display:flex;align-items:center;gap:4px;flex-wrap:wrap'>";
    h+="<span style='font-size:13px;white-space:nowrap'>상승률</span>";
    h+="<button class='segtip' data-tip='이 구역에 항목을 하나 더 넣어요' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;white-space:nowrap' data-b='"+reEsc(b.id)+"' onclick='abAddRow(this.dataset.b)'>＋&nbsp;항목</button>";
    h+="<button class='segtip' data-tip='이 구역을 통째로 지워요§§다른 구역과 현금 자산은 그대로예요' style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-b='"+reEsc(b.id)+"' onclick='abDelBlock(this.dataset.b)'>×</button>";
    h+="</div></td>";
    rs.forEach(function(r){h+="<td><div class='rpill'><input class='ri' type='number' value='"+abRate(b)+"' min='-99' max='99' step='0.1' data-b='"+reEsc(b.id)+"' oninput='abSetRate(this)' onchange='abSetRateChg(this)'><span style='font-size:13px;font-weight:700;color:#3d3000'>%</span></div></td>";});
    h+="</tr>";
    h+="<tr class='r-total'>"+_grp()+"<td class='rl' style='padding:4px 6px;word-break:keep-all;overflow-wrap:break-word'>"+_bn+"<span style='white-space:nowrap'>&nbsp;합계</span></td>";
    rs.forEach(function(r){h+="<td>"+fmt((r.abBlk&&r.abBlk[b.id])||0,bl)+"</td>";});
    h+="</tr>";
  });
  if(_mdFull){
    h+="<tr class='r-total'>"+reGrpTd("",1)+rlTd('M_grand','총 자산 합계');
    rs.forEach(function(r){var grand=r.tot+r.belowSum+r.atEq;h+="<td style='color:var(--ac)'>"+fmt(grand,bl)+"</td>";});h+="</tr>";
  }
  h+="</tbody></table>";
  g("mdWrap").innerHTML=h;try{syncMdUnitBtns();}catch(e){}
  updateMidChart(rs);
}

function getRate(y){return YR[y]!=null?YR[y]:15;}
/* ── 🎯 목표 마일스톤 · 📐 수익률 민감도 (읽기 전용 오버레이 — 로드맵 데이터에 쓰지 않음) ── */
function milestoneReachMap(){var m={};if(!lastCalcRows.length)return m;milestones.forEach(function(t){var w=(parseFloat(t)||0)*10000;if(!(w>0))return;for(var i=0;i<lastCalcRows.length;i++){if(lastCalcRows[i].tot>=w){var y=lastCalcRows[i].y;m[y]=(m[y]?m[y]+"·":"")+fmtEok(w);break;}}});return m;}
function addMilestone(){var v=parseFloat(g('msAmt').value)||0;if(!(v>0)){alert('목표 금액을 만원 단위로 입력해 주세요. (예: 10000 = 1억)');return;}if(milestones.indexOf(v)>=0){alert('이미 있는 목표예요.');return;}if(milestones.length>=12){alert('마일스톤은 12개까지 추가할 수 있어요.');return;}milestones.push(v);milestones.sort(function(a,b){return a-b;});g('msAmt').value='';save();recalc();}
function rmMilestone(i){milestones.splice(i,1);save();recalc();}
function renderMilestones(){var el=g('msList');if(!el)return;var bl=g('blur')&&g('blur').checked;var B=function(t){return bl?"<span class='blurred'>"+t+"</span>":t;};
  if(!milestones.length){el.innerHTML="<span style='font-size:13px;color:#bbb;word-break:keep-all'>목표 금액을 추가하면 도달 시점을 알려줘요 (만원 단위, 예: 10000 = 1억)</span>";return;}
  el.innerHTML=milestones.map(function(t,i){var w=t*10000;var hit=null;for(var k=0;k<lastCalcRows.length;k++){if(lastCalcRows[k].tot>=w){hit=lastCalcRows[k];break;}}
    var right=hit?("<b style='color:var(--ac);white-space:nowrap'>"+hit.y+"년</b>"+(hit.age!=null?" <span style='color:var(--gray);white-space:nowrap'>("+hit.age+"세)</span>":"")):"<span style='color:#c0392b;white-space:nowrap'>기간 내 미도달</span>";
    return "<div style='display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px'><span style='white-space:nowrap'>🎯 "+B(fmtEok(w))+"</span><span style='color:var(--gray)'>→</span>"+right+"<button type='button' title='삭제' onclick='rmMilestone("+i+")' style='border:none;background:none;color:#bbb;cursor:pointer;font-size:14px;padding:0 4px;font-family:inherit'>✕</button></div>";}).join('');}
function setSensDelta(d){sensDelta=d;renderSens();}
function renderSens(){var bEl=g('sensBtns'),lEl=g('sensLine');if(!bEl||!lEl)return;
  bEl.innerHTML=[0.5,1,2,3].map(function(d){var on=(d===sensDelta);return "<button type='button' onclick='setSensDelta("+d+")' style='border:1px solid "+(on?"var(--ac)":"var(--border)")+";background:"+(on?"var(--ac-light)":"#fff")+";color:"+(on?"var(--ac)":"#555")+";border-radius:99px;padding:3px 10px;font-size:13px;cursor:pointer;font-family:inherit;white-space:nowrap;margin:0 4px 4px 0'>±"+d+"%p</button>";}).join('');
  if(!lastCalcRows.length){lEl.innerHTML='';return;}
  var bl=g('blur')&&g('blur').checked;var B=function(t){return bl?"<span class='blurred'>"+t+"</span>":t;};
  var period=lastCalcRows.length-1;
  var base=lastCalcRows[period].tot;
  var lo=computeRows(-sensDelta),hi=computeRows(sensDelta);
  var loT=lo[lo.length-1].tot,hiT=hi[hi.length-1].tot;
  var h="매년 수익률이 ±"+sensDelta+"%p 다르면 <b>"+period+"년 뒤</b>: <span style='white-space:nowrap'>"+B(fmtEok(loT))+"</span> <span style='color:var(--gray)'>←</span> <b style='white-space:nowrap'>"+B(fmtEok(base))+"</b> <span style='color:var(--gray)'>→</span> <b style='color:var(--ac);white-space:nowrap'>"+B(fmtEok(hiT))+"</b>";
  milestones.forEach(function(t){var w=t*10000;if(!(w>0))return;var f=function(rows){for(var k=0;k<rows.length;k++)if(rows[k].tot>=w)return rows[k].y+"년";return "미도달";};
    h+="<br><span style='color:var(--gray)'>🎯 "+B(fmtEok(w))+" 도달:</span> <span style='white-space:nowrap'>"+f(lo)+"</span> <span style='color:var(--gray)'>←</span> <span style='white-space:nowrap'>"+f(lastCalcRows)+"</span> <span style='color:var(--gray)'>→</span> <b style='color:var(--ac);white-space:nowrap'>"+f(hi)+"</b>";});
  lEl.innerHTML=h;}
function getSv(i,y){return CS[y]!=null?CS[y]:(DS[i]||0);}
/* ── 🏢 부동산·갈아타기 ────────────────────────────────────────
   저장: reOn(켬) · reP(시세 덮어쓰기) · reL(대출 덮어쓰기) · reR(상승률) · aptTargets(3채) — 전부 rs7 블롭, 새 localStorage 키 없음
   계승: 값을 안 적은 해는 시세=전해×(1+상승률), 대출=전해 그대로 (월간 예산과 같은 앞으로 계승 방식) */
/* ── 💰 자산 구역(블록) 헬퍼 (세션 65) ──────────────────────────
   상승률은 블록 하나에 공통이다(행마다 두면 표가 감당이 안 된다 — 특정 행만 다르면 그 해 금액을 직접 적으면 그때부터 고정된다). */
function abList(){if(!Array.isArray(assetBlocks))assetBlocks=[];return assetBlocks;}
function abRate(b){var v=b&&b.rate;return (v==null||v==='')?3:(parseFloat(v)||0);}
function abBlock(id){var a=abList();for(var i=0;i<a.length;i++)if(String(a[i].id)===String(id))return a[i];return null;}
function abRowOf(rid){var a=abList();for(var i=0;i<a.length;i++){var rs=a[i].rows||[];for(var j=0;j<rs.length;j++)if(String(rs[j].id)===String(rid))return {b:a[i],r:rs[j],bi:i,ri:j};}return null;}
/* 블록이 차지하는 행 수 = 항목 행 + 상승률 1 + (자세히면 합계 1) */
function abRowsN(b,full){return (b.rows||[]).length+1+(full?1:0);}
function abNewId(p){return p+Date.now()+Math.floor(Math.random()*1000);}
function reRate(y){var v=reR[y];return (v==null||v==='')?2:(parseFloat(v)||0);}
function reApts(){if(!Array.isArray(aptTargets))aptTargets=[];while(aptTargets.length<3)aptTargets.push({name:'',size:'',price:0,loan:0,spare:0});return aptTargets;}
const HOME_IMG="data:image/png;base64,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";
function reEok1(won){return (Math.round((Number(won)||0)/1e7)/10)+'억';}
function reEsc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');}
/* ── 💰 자산 구역 만들기 · 고치기 · 지우기 ──────────────────────
   드롭다운은 자산 탭(rs_assets)의 실제 항목을 그대로 보여준다 — 이미 적어둔 걸 다시 적게 하지 않는다. */
function abAssetOpts(){
  var out=[{v:'__new',t:'+ 새 자산 구역'}];
  try{ if(!assets)loadAssets(); }catch(_){}
  var by={};
  (assets||[]).forEach(function(a){ (by[a.type||'기타']=by[a.type||'기타']||[]).push(a); });
  Object.keys(by).forEach(function(ty){
    by[ty].forEach(function(a){ out.push({v:'a:'+a.id, t:ty+' › '+(a.name||'이름 없음')}); });
  });
  return out;
}
function syncAbPicker(){
  var ps=g('atPreset'); if(!ps)return;
  var keep=ps.value, opts=abAssetOpts();
  ps.innerHTML='';
  opts.forEach(function(o){var e2=document.createElement('option');e2.value=o.v;e2.textContent=o.t;ps.appendChild(e2);});
  if(keep&&opts.some(function(o){return o.v===keep;}))ps.value=keep;
}
function abUniqueName(nm){
  var used={};abList().forEach(function(b){used[b.name]=1;});
  if(!used[nm])return nm;
  var k=2;while(used[nm+' '+k])k++;return nm+' '+k;
}
function abAddBlock(name,rate){
  var b={id:abNewId('ab'),name:abUniqueName(name||'새 자산'),rate:(rate==null?3:rate),rows:[]};
  abList().push(b);return b;
}
/* 드롭다운 「추가」 — 자산 탭 항목 하나를 행으로 데려온다. 그 유형의 구역이 없으면 만든다.
   ★ 로드맵 셀을 덮는 동작이라 첫 해 칸만 채운다(§5 「로드맵 쓰기는 사용자가 눌렀을 때만」). 다음 해부터는 상승률이 굴린다. */
function abAddFromPicker(){
  var ps=g('atPreset'); if(!ps)return;
  var v=String(ps.value||'');
  if(v==='__new'||!v){ var nb=abAddBlock('새 자산',3); nb.rows.push({id:abNewId('ar'),label:'항목 1',neg:false}); abRefreshAll();return; }
  var aid=v.slice(2);
  try{ if(!assets)loadAssets(); }catch(_){}
  var a=(assets||[]).find(function(x){return String(x.id)===aid;});
  if(!a){showToast('자산 탭에서 그 항목을 찾지 못했어요.');return;}
  var ty=a.type||'기타';
  var b=null,list=abList();
  for(var i=0;i<list.length;i++){if(list[i].name===ty||list[i].name.indexOf(ty)===0){b=list[i];break;}}
  if(!b)b=abAddBlock(ty, (ty==='예적금'?3:ty==='연금'?4:ty==='부동산'?2:ty==='대출'?0:3));
  var nm=a.name||ty;
  if((b.rows||[]).some(function(r){return r.label===nm;})){showToast('「'+nm+'」은(는) 이미 들어와 있어요.');return;}
  var row={id:abNewId('ar'),label:nm,neg:(ty==='대출')};
  b.rows.push(row);
  var won=0;try{won=Math.round(assetAmt(a)||0);}catch(_){won=Math.round(parseFloat(a.amount)||0);}
  var y0=parseInt(g('sY').value)||2026;
  if(won>0)abV[row.id+'_'+y0]=won;              // 첫 해만 채운다(장기 스코프) — 중기는 자기 스코프에 값을 넣기 전까진 0에서 시작(단기는 연동 안 함)
  abRefreshAll();
  showToast('「'+nm+'」을(를) '+b.name+' 구역에 넣었어요.');
}
/* 이름 수정은 공용 편집 모달(editRowLabel)이 맡는다 — textarea라 줄바꿈을 넣을 수 있다(§2.4와 같은 관례) */
function abNameTarget(key){
  var b=abBlock(key);if(b)return {set:function(v){b.name=v;},get:function(){return b.name;}};
  var f=abRowOf(key);if(f)return {set:function(v){f.r.label=v;},get:function(){return f.r.label;}};
  return null;
}
/* 💰 자산 구역 구조(블록·행 추가/이동/삭제/± 전환)는 장기·중기 두 탭이 공유한다 — 단기는 연동 안 함(주인장 지시). 어느 쪽에서 고쳐도 둘 다 갱신(G2). */
function abRefreshAll(){recalc();try{renderMid();}catch(e){}save();}
function abSetRate(el){var b=abBlock(el.dataset.b);if(!b)return;var v=parseFloat(el.value);b.rate=isNaN(v)?'':v;saveSoon();}
function abSetRateChg(el){abSetRate(el);abRefreshAll();}
function abToggleNeg(rid){var f=abRowOf(rid);if(!f)return;f.r.neg=!f.r.neg;abRefreshAll();}
function abAddRow(bid){
  var b=abBlock(bid);if(!b)return;
  if(!Array.isArray(b.rows))b.rows=[];
  b.rows.push({id:abNewId('ar'),label:'항목 '+(b.rows.length+1),neg:false});
  abRefreshAll();
}
function abMoveRow(rid,dir){
  var f=abRowOf(rid);if(!f)return;
  var rs=f.b.rows,ni=f.ri+dir;if(ni<0||ni>=rs.length)return;
  var t=rs[f.ri];rs[f.ri]=rs[ni];rs[ni]=t;abRefreshAll();
}
/* ★ G1 — 행 삭제는 그 행 하나, 구역 삭제는 그 구역 하나. 다른 구역·현금·내 집·커스텀 행·다른 해는 손대지 않는다.
   abV 키는 장기 rid_연도 · 중기 rid_md_연도 · 단기 rid_sh_연도_월 — 전부 rid_로 시작하므로 한 번에 정리된다. */
function abDelRow(rid){
  var f=abRowOf(rid);if(!f)return;
  rsConfirm('「'+f.r.label+'」 항목을 지울까요?§§이 항목에 적은 연도별 금액도 함께 지워져요. 같은 구역의 다른 항목은 그대로예요.',function(){
    var g2=abRowOf(rid);if(!g2)return;
    var i=g2.b.rows.indexOf(g2.r);if(i<0)return;   // 객체 동일성으로 제거(§1.1-9)
    g2.b.rows.splice(i,1);
    Object.keys(abV).forEach(function(k){if(k.indexOf(rid+'_')===0)delete abV[k];});
    abRefreshAll();
  });
}
function abDelBlock(bid){
  var b=abBlock(bid);if(!b)return;
  rsConfirm('「'+b.name+'」 구역을 통째로 지울까요?§§그 구역의 항목과 금액이 함께 지워져요. 다른 자산 구역과 현금·내 집 자산은 그대로예요.',function(){
    var b2=abBlock(bid);if(!b2)return;
    var list=abList(),i=list.indexOf(b2);if(i<0)return;
    (b2.rows||[]).forEach(function(r){Object.keys(abV).forEach(function(k){if(k.indexOf(r.id+'_')===0)delete abV[k];});});
    list.splice(i,1);
    abRefreshAll();
  });
}
function setReOn(on){reOn=!!on;recalc();save();}
function toggleReView(){reView=(reView==='full')?'simple':'full';recalc();save();}
/* 패널 접힘 — 저장하지 않는 화면 상태. 변수도 두지 않고 화면에서 직접 읽는다(상태변수를 늘리지 않기 위해) */
function reBoxOpenNow(){var a=document.querySelector('#reBox .re-apt');return !!a&&a.style.display!=='none';}
function toggleReBox(){var open=!reBoxOpenNow(),aps=document.querySelectorAll('#reBox .re-apt');for(var i=0;i<aps.length;i++)aps[i].style.display=open?'':'none';syncReUI();}
/* 아파트별 연도별 시세와 가능 여부 — 파생 전용(저장 안 함).
   판정: 그 해 총 자산(현금+부동산) + 그 집 대출 − 여유금 ≥ 그 해 그 집 시세. 해마다 따로 본다(비쌌다 가능해졌다 다시 멀어질 수 있다) */
function reAptCalc(rows){
  return reApts().map(function(a){
    var price=parseFloat(a.price)||0;
    if(!(price>0))return null;
    var loan=parseFloat(a.loan)||0,spare=parseFloat(a.spare)||0,p=price,prices=[],ok=[],first=null;
    for(var i=0;i<rows.length;i++){
      if(i>0)p=p*(1+reRate(rows[i].y)/100);
      var can=(rows[i].grand+loan-spare>=p);
      prices.push(Math.round(p));ok.push(can);
      if(can&&first===null)first=i;
    }
    return {prices:prices,ok:ok,first:first,name:(a.name||''),size:(a.size||'')};
  });
}
/* 표 셀(시세·대출) — 형제인 목표 저축액 칸과 같은 관례: 표 단위 토글(lgUnit) 표시, 저장은 원 */
function reCellFocus(el){el.style.background='#fffde7';el.value=String(el.value).replace(/,/g,'');}
function reCellIn(el){
  var y=parseInt(el.dataset.y,10),base=parseFloat(el.dataset.d)||0,map=(el.dataset.f==='L')?reL:reP;
  var raw=String(el.value).replace(/,/g,'').trim();
  if(raw===''){delete map[y];return;}
  var n=Math.round((parseFloat(raw)||0)*lgUnit);
  // 화면에 보이던 계승값 그대로면 덮어쓰지 않는다 — 무심코 지나가기만 해도 그 해가 고정되는 것 방지
  if(Math.abs(n-base)<Math.max(1,lgUnit)){delete map[y];}else{map[y]=n;}
}
function reCellBlur(el){
  reCellIn(el);
  el.style.background='transparent';
  var n=parseFloat(String(el.value).replace(/,/g,''))||0;
  el.value=n?((lgUnit>1)?fmtUnitDisp(n):fmtComma(n)):'';
  recalc();save();
}
function reRateIn(el){var y=parseInt(el.dataset.y,10),v=parseFloat(el.value);if(isNaN(v)){delete reR[y];}else{reR[y]=v;}}
/* 아파트 3채 설정 칸 — 입력은 만원, 저장은 원(현재 자산 sV와 같은 관례 §2.1) */
function reAptIn(el){
  var a=reApts()[parseInt(el.dataset.i,10)];if(!a)return;
  var f=el.dataset.f;
  if(f==='name'||f==='size'){a[f]=el.value;}
  else{a[f]=Math.round((parseFloat(String(el.value).replace(/,/g,''))||0)*10000);}
  saveSoon();
}
function reAptChg(el){reAptIn(el);recalc();save();}
/* 체크박스·패널 상태를 화면에 되비침 — renderLong 끝에서 호출(부팅 렌더는 initApp→recalc 경로로 커버 §2.23) */
function syncReUI(){
  var ck=g('reOnChk');if(ck)ck.checked=!!reOn;
  var bx=g('reBox');if(bx)bx.style.display=reOn?'block':'none';
  var vb=g('reViewBtn');
  if(vb){vb.style.display=(reOn||abList().length>0||lgCrIds().some(function(id){return !lgInclSet()[id];}))?'inline-block':'none';vb.textContent=(reView==='full')?'간단히':'자세히';}
  try{syncAbPicker();}catch(_){}
  if(!reOn)return;
  var _op=reBoxOpenNow();
  var tg=g('reBoxTgl');if(tg)tg.innerHTML=(_op?'▼':'▶')+"&nbsp;<img src='"+HOME_IMG+"' alt='' style='width:17px;height:17px;vertical-align:-4px'>&nbsp;갈아타고&nbsp;싶은&nbsp;집";
  var hn=g('reBoxHint');if(hn)hn.style.display=_op?'':'none';
  var as=reApts();
  for(var i=0;i<3;i++){
    (function(a,i){
      ['name','size','price','loan','spare'].forEach(function(f){
        var el=g('reApt_'+f+'_'+i);if(!el)return;
        if(document.activeElement===el)return; // 타이핑 중엔 덮어쓰지 않는다
        el.value=(f==='name'||f==='size')?(a[f]||''):(a[f]?String(Math.round(a[f]/10000)):'');
      });
    })(as[i],i);
  }
}
// 30년 로드맵 행 계산 — recalc에서 동작 동일 추출. rateDelta(%p)는 민감도 탐색 전용(기본 0, 아무것도 저장 안 함)
function computeRows(rateDelta){
  const sy=parseInt(g("sY").value)||2026;
  const sa=parseInt(g("sA").value)||0;
  let asset=(parseFloat(g("sV").value)||0)*10000;  // 만원 입력 → 원
  const period=parseInt(g("period").value)||30;
  const _d=rateDelta||0;
  const rows=[];
  var _reP=0,_reL=0; // 🏢 부동산 시세·대출 계승값(원) — 저장하지 않는 파생
  var _abP={}; // 💰 블록 행별 계승값(원) — 저장하지 않는 파생
  var _lgIncl=lgInclSet();  // 📋 투자금에 포함되는 커스텀 행
  for(let i=0;i<=period;i++){
    const y=sy+i,sv=getSv(i,y);
    // 장기 커스텀 행 합산 (et_default=메모/사진 행 제외, 수입+/지출-)
    var crSum=0,crOut=0;
    customRows.forEach(function(cr){
      if(cr.id==="et_default")return;
      var v=pcd(cr.id+"_"+y);
      if(_lgIncl[cr.id])crSum+=v; else crOut+=v;   // 위=투자금 포함 · 아래=투자금 제외(총 자산 합계로)
    });
    const inv=asset+sv+crSum,r=(getRate(y)+_d)/100,pr=inv*r,tot=inv+pr;
    // 🏢 부동산 트랙: 적은 해는 그 값, 안 적은 해는 시세=전해×(1+상승률)·대출=전해 그대로
    if(i===0){_reP=(reP[y]!=null?reP[y]:0);_reL=(reL[y]!=null?reL[y]:0);}
    else{_reP=(reP[y]!=null?reP[y]:Math.round(_reP*(1+reRate(y)/100)));_reL=(reL[y]!=null?reL[y]:_reL);}
    const _reE=_reP-_reL;
    // 💰 자산 구역: 부동산과 같은 계승 규칙 — 적은 해는 그 값, 안 적은 해는 전해×(1+상승률). neg 행은 합계에서 뺀다.
    var _abRow={},_abBlk={},_atEq=0;
    abList().forEach(function(b){
      var rt=abRate(b),eq=0;
      (b.rows||[]).forEach(function(rw){
        var ov=abV[rw.id+'_'+y],v;
        if(ov!=null)v=parseFloat(ov)||0;
        else v=(i===0)?0:Math.round((_abP[rw.id]||0)*(1+rt/100));
        _abP[rw.id]=v;_abRow[rw.id]=v;
        eq+=(rw.neg?-v:v);
      });
      _abBlk[b.id]=eq;_atEq+=eq;
    });
    rows.push({y,age:sa?sa+i:null,sv,inv,pr,tot,asset,crSum:crSum,crOut:crOut,crisis:CRISIS.includes(y),reP:_reP,reL:_reL,reEq:_reE,ab:_abRow,abBlk:_abBlk,atEq:_atEq,grand:tot+(reOn?_reE:0)+_atEq+crOut});asset=tot;
  }
  return rows;
}
function recalc(){
  const sy=parseInt(g("sY").value)||2026;
  const bl=g("blur").checked;
  const period=parseInt(g("period").value)||30;
  const rows=computeRows(0);
  const vb=g("validBadge");
  if(vb)vb.style.display="none";
  g("longTblTitle").textContent="장기 로드맵("+period+"년)";
  lastCalcRows=rows.slice();
  _msYearCache=milestoneReachMap(); // 표 연도 🎯 배지 캐시 (renderLong보다 먼저)
  renderLong(rows,bl,sy);
  updateLongChart(rows);
  renderMilestones();renderSens();
  renderNyBox();
  setTimeout(updateProgressBadge,100);
  if(g('scV')&&!g('scV').value)g('scV').placeholder=g('sV').value?g('sV').value+'만원 (장기 연동)':'장기탭 연동';
}
/* §4.2-20 STEP3 대시보드 — 읽기 전용, 자체 산식 없음. 전부 원본 함수 반환값을 표시만 함(①). 카드 접기/숨김 등 개인화는 1차에 넣지 않음(⑥). */
function goDashScrollTo(elId){
  var el=g(elId);
  if(el&&typeof el.scrollIntoView==='function')el.scrollIntoView({behavior:'smooth',block:'center'});
}
function goDashTab(id,elId){showTab(id);if(elId)goDashScrollTo(elId);}
function goDashRoadmap(sub,elId){showTab('roadmap');setRmTab(sub);showRmSub(sub);closeRmTabDrop();if(elId)goDashScrollTo(elId);}
function goDashDailyAnalysis(){showTab('daily');if(typeof setDailyView==='function')setDailyView('analysis');}
function goDashDailyMonth(){showTab('daily');if(typeof setDailyView==='function')setDailyView('month');}
function renderDashboard(){
  var wrap=g("dashboardBody");if(!wrap)return;
  var _icoAsset="<img src='"+INCOME_IMG+"' alt='자산' style='height:1.15em;vertical-align:-3px'>";
  var _icoProj="<img src='"+PIN_IMG+"' alt='프로젝트' style='height:1.15em;vertical-align:-3px'>";
  var _icoHome="<img src='"+HOME_IMG+"' alt='집' style='height:1.15em;vertical-align:-3px'>";
  var _icoBkp="<img src='"+CAB_IMG+"' alt='백업' style='height:1.15em;vertical-align:-3px'>";

  // 총자산 — 히어로 카드(가장 위, 가장 크게) · 누르면 자산 탭으로 · 유형별 비중은 도넛 차트로 시각화
  // 대출은 assetByType()가 포함/차감(incl) 부호를 반영하지 않으므로, assetTotal()과 같은 재료(assetAmt+incl)로 부호만 별도 계산한다 — 새 산식 아님, 기존 규칙 재사용
  var _at=assetTotal();
  var _abt=assetByType();
  if(!assets)loadAssets();
  var _loanInclSum=0,_loanExclSum=0;
  (assets||[]).forEach(function(a){
    if(a.type==='대출'){
      var la=assetAmt(a);
      if(a.incl)_loanInclSum+=la; else _loanExclSum+=la;
    }
  });
  var _donutData={};
  Object.keys(_abt).forEach(function(k){if(k!=='대출')_donutData[k]=_abt[k];});
  if(_loanInclSum>0)_donutData['대출']=_loanInclSum;
  var _abtKeys=Object.keys(_donutData).sort(function(a,b){return _donutData[b]-_donutData[a];});
  var _abtChipsInner=_abtKeys.map(function(k){return "<div class='dash-chip'><div class='dash-chip-l'>"+k+"</div><div class='dash-chip-v'>"+fmtWon(_donutData[k])+"</div></div>";}).join('');
  if(_loanExclSum>0){
    _abtChipsInner+="<div class='dash-chip dash-chip-neg'><div class='dash-chip-l'>대출(총액 차감)</div><div class='dash-chip-v'>−"+fmtWon(_loanExclSum)+"</div></div>";
  }
  var _abtChips=(_abtKeys.length||_loanExclSum>0)?("<div class='dash-chips'>"+_abtChipsInner+"</div>"):"";
  var _abtChartHtml=_abtKeys.length?"<div class='dash-hero-chart'><canvas id='dashAssetChart'></canvas></div>":"";
  var heroHtml="<div class='dash-hero dash-clickable' onclick=\"goDashTab('assets','assetTotal')\"><div class='dash-hero-top'><div><div class='dash-card-t'>"+_icoAsset+" 총자산</div><div class='dash-card-v'>"+fmtWon(_at)+"</div>"+_abtChips+"</div>"+_abtChartHtml+"</div></div>";

  // ★ lastCalcRows를 믿지 말 것(⑤) — 장기 탭을 한 번도 안 열었을 수 있으므로 computeRows(0)를 직접 불러 milestoneReachMap()이 참조하는 전역을 최신으로 맞춘다
  var _rows=computeRows(0);
  lastCalcRows=_rows.slice();

  // ── 「진행 현황」 구역: 프로젝트 · 목표 도달 · 미래 자산 · 갈아타기 — 각 카드는 해당 탭으로 연결 ──
  var progressCards="";
  if(typeof SP!=='undefined'&&SP.length){
    var _pmo=projSummaryVal('mo'),_py1=projSummaryVal('y1'),_pfut=projSummaryVal('fut'),_pcnt=projSummaryVal('cnt');
    progressCards+="<div class='dash-card dash-clickable' onclick=\"goDashTab('projects','projList')\"><div class='dash-card-t'>"+_icoProj+" 프로젝트</div><div class='dash-card-grid'>"+
      "<div><div class='dash-mini-l'>이번 달 이자</div><div class='dash-mini-v'>"+_pmo.txt+"</div></div>"+
      "<div><div class='dash-mini-l'>1년 내 받을 돈</div><div class='dash-mini-v'>"+_py1.txt+"</div></div>"+
      "<div><div class='dash-mini-l'>만기까지</div><div class='dash-mini-v'>"+_pfut.txt+"</div></div>"+
      "<div><div class='dash-mini-l'>진행 건수</div><div class='dash-mini-v'>"+_pcnt.txt+"</div></div>"+
      "</div></div>";
  }
  var _ms=milestoneReachMap();
  var _msYears=Object.keys(_ms).map(Number).sort(function(a,b){return a-b;});
  if(_msYears.length){
    progressCards+="<div class='dash-card dash-clickable' onclick=\"goDashRoadmap('long','msList')\"><div class='dash-card-t'>🎯 목표 도달 예상</div><div class='dash-card-sub'>"+
      _msYears.map(function(y){return y+"년 "+_ms[y];}).join(' · ')+"</div></div>";
  }
  var _period=parseInt(g("period").value)||30;
  var _yrs=[5,10,20,30].filter(function(n){return n<=_period&&_rows[n];});
  if(_yrs.length){
    var _icoCrown="<img src='"+CROWN_IMG+"' alt='왕관' style='height:1.15em;vertical-align:-3px'>";
    progressCards+="<div class='dash-card dash-clickable' onclick=\"goDashRoadmap('long','longChart')\"><div class='dash-card-t'>"+_icoCrown+" 미래 자산 미리보기</div>"+
      "<div class='dash-chart-box'><canvas id='dashFutureChart'></canvas></div>"+
      "<div class='dash-card-grid'>"+
      _yrs.map(function(n){var r=_rows[n];return "<div><div class='dash-mini-l'>"+n+"년 뒤("+r.y+")</div><div class='dash-mini-v'>"+fmtWon(r.tot)+"</div></div>";}).join('')+
      "</div></div>";
  }
  if(typeof reOn!=='undefined'&&reOn){
    var _thisYr=new Date().getFullYear();
    var _rr=_rows.filter(function(r){return r.y===_thisYr;})[0]||_rows[0];
    if(_rr){
      // 목표 아파트 이름·매매 가능까지 남은 기간 — 새 산식 아님, 이미 있는 reAptCalc(rows) 그대로 재사용(§2.35와 같은 판정)
      var _aptHtml='';
      if(typeof reAptCalc==='function'){
        var _aptList=reAptCalc(_rows).filter(Boolean);
        if(_aptList.length){
          _aptHtml="<div class='dash-chips' style='margin-top:10px'>"+_aptList.map(function(ap,ai){
            var nm=ap.name||('아파트'+(ai+1));
            var status;
            if(ap.first===0)status='지금 매매 가능';
            else if(ap.first!=null&&_rows[ap.first])status=(_rows[ap.first].y-_thisYr)+'년 뒤 매매 가능';
            else status='이 기간 안엔 어려워요';
            return "<div class='dash-chip"+(ap.first==null?' dash-chip-neg':'')+"'><div class='dash-chip-l'>"+dlEsc(nm)+"</div><div class='dash-chip-v'>"+status+"</div></div>";
          }).join('')+"</div>";
        }
      }
      progressCards+="<div class='dash-card dash-clickable' onclick=\"goDashRoadmap('long','reBoxTgl')\"><div class='dash-card-t'>"+_icoHome+" 내 집 갈아타기</div><div class='dash-card-v'>"+fmtWon(_rr.reEq)+"</div><div class='dash-card-sub'>현재 부동산 순자산(시세−대출)</div>"+_aptHtml+"</div>";
    }
  }

  // ── 「올해 목표」 구역: 목표 수익(장기 탭) · 저축 달성률(일일 기록) ──
  var goalCards="";
  var _pv=progressVals();
  if(_pv){
    goalCards+="<div class='dash-card dash-clickable' onclick=\"goDashRoadmap('long','longYearBadge')\"><div class='dash-card-t'>"+_icoAsset+" "+_pv.now+"년 목표 수익</div><div class='dash-card-v'>"+fmtWon(_pv.profit)+"</div><div class='dash-card-sub'>투자금 "+fmtWon(_pv.inv)+" × "+_pv.rate+"%</div></div>";
  }
  if(typeof dailyData!=='undefined'&&dailyData.length){
    var _sy=parseInt(g("sY").value)||2026;
    var _thisY2=new Date().getFullYear();
    var _i=_thisY2-_sy;
    var _plan=getSv(_i,_thisY2);
    var _sum=0;
    var _curMo=new Date().getMonth()+1;
    for(var _m=1;_m<=_curMo;_m++){
      _sum+=monthNetWon(_thisY2+'-'+String(_m).padStart(2,'0')+'-01');
    }
    var _pct=(_plan>0)?Math.round(_sum/_plan*100):null;
    var _barPct=_pct!=null?Math.max(0,Math.min(100,_pct)):0;
    var _barOver=_pct!=null&&_pct>100;
    goalCards+="<div class='dash-card dash-clickable' onclick=\"goDashRoadmap('short')\"><div class='dash-card-t'>📊 "+_thisY2+"년 저축 달성률</div>"+
      (_pct!=null?("<div class='dash-card-v'>"+_pct+"%</div><div class='dash-progress"+(_barOver?" dash-progress-over":"")+"'><div class='dash-progress-fill' style='width:"+_barPct+"%'></div></div><div class='dash-card-sub'>실적 "+fmtWon(_sum)+" / 계획 "+fmtWon(_plan)+"</div>"):"<div class='dash-card-sub'>올해 계획 저축액이 없어요</div>")+
      "</div>";
  }

  // ── 「이번 달 소비」 구역: 일일기록 › 분석에서 이미 쓰는 monthSummaryStats()·anaSlideProjection() 그대로 재사용(자체 산식 없음) ──
  var monthCards="";
  if(typeof monthSummaryStats==='function'&&typeof dailyData!=='undefined'&&dailyData.length){
    var _mstat=monthSummaryStats(todayStr());
    if(_mstat.total>0){
      var _budTxt=_mstat.budget>0?(' · 예산 대비 '+_mstat.budgetPct+'%'):'';
      var _prevTxt=_mstat.prevTotal>0?(' · 전월보다 '+(_mstat.prevDelta>=0?'+':'')+fmtWon(_mstat.prevDelta)):'';
      monthCards+="<div class='dash-card dash-clickable' onclick=\"goDashDailyMonth()\"><div class='dash-card-t'>🧾 이번 달 소비</div><div class='dash-card-v'>"+fmtWon(_mstat.total)+"</div><div class='dash-card-sub'>"+(_mstat.topCat?('가장 많이 쓴 곳 '+dlEsc(_mstat.topCat)+' '+fmtWon(_mstat.topAmt)):'')+_budTxt+_prevTxt+"</div></div>";
    }
    if(_mstat.total>0&&typeof anaSlideProjection==='function'&&typeof monthKey==='function'&&typeof monthFirstDate==='function'&&typeof monthLastDate==='function'){
      var _tmk=monthKey(todayStr());
      var _projHtml=anaSlideProjection(monthFirstDate(_tmk),monthLastDate(_tmk),_mstat.total);
      if(_projHtml)monthCards+="<div class='dash-card dash-card-flush dash-clickable' onclick=\"goDashDailyAnalysis()\">"+_projHtml+"</div>";
    }
  }

  // ── 「알림」 구역: 백업 상태(누르면 바로 백업) · 이달의 집중(자체 링크 보유) · 이번 달 자산 기록(자산 탭) · 쓸쓰안쓰 · 이번 주 식단(켜져 있을 때만) ──
  var noticeCards="";
  var _backupTxt=(function(){
    var now=Date.now(),DAY=86400000;
    var last=parseInt(localStorage.getItem('rs_last_backup')||'0',10);
    if(!last){
      var seen=parseInt(localStorage.getItem('rs_first_seen')||'0',10);
      if(seen&&(now-seen)>=7*DAY)return "아직 한 번도 백업하지 않았어요";
      return "아직 백업 기록이 없어요";
    }
    var days=Math.floor((now-last)/DAY);
    return days>=14?("⚠ 마지막 백업 후 "+days+"일 지났어요"):("마지막 백업 "+days+"일 전");
  })();
  noticeCards+="<div class='dash-card dash-clickable' onclick=\"doBackupNow()\"><div class='dash-card-t'>"+_icoBkp+" 백업 상태</div><div class='dash-card-sub'>"+_backupTxt+"</div></div>";
  var _focus=(typeof dlFocusBannerHtml==='function')?dlFocusBannerHtml():'';
  if(_focus)noticeCards+="<div class='dash-card dash-card-flush'>"+_focus+"</div>";
  if(typeof dlAsnapWin==='function'){
    var _win=dlAsnapWin();
    if(_win.inWin){
      var _done=(typeof dlAsnapDone==='function')&&dlAsnapDone();
      noticeCards+="<div class='dash-card dash-clickable' onclick=\"goDashTab('assets','assetSnapBtn')\"><div class='dash-card-t'>📸 이번 달 자산 기록</div><div class='dash-card-sub'>"+(_done?'이번 달 기록 완료':'아직 이번 달 자산을 기록하지 않았어요')+"</div></div>";
    }
  }
  // 나의 쓸쓰안쓰(켜져 있고 내용이 있을 때만 — spendRulesOff()·spendRules는 기존 함수/변수 그대로)
  if(typeof spendRulesOff==='function'&&!spendRulesOff()){
    if(typeof spendRules==='undefined'||spendRules===null){if(typeof loadSpendRules==='function')loadSpendRules();}
    var _srUse=(spendRules&&spendRules.use)||[],_srAvoid=(spendRules&&spendRules.avoid)||[];
    if(_srUse.length||_srAvoid.length){
      noticeCards+="<div class='dash-card dash-clickable' onclick=\"goDashTab('daily')\"><div class='dash-card-t'>🌟 나의 쓸쓰안쓰</div>"+
        (_srUse.length?"<div class='dash-card-sub'><b style='color:var(--carrot-mk,#3f9a68)'>👍 쓸 것</b> "+_srUse.map(dlEsc).join(', ')+"</div>":"")+
        (_srAvoid.length?"<div class='dash-card-sub'><b style='color:var(--whip-mk,#d9534f)'>🚫 안 쓸 것</b> "+_srAvoid.map(dlEsc).join(', ')+"</div>":"")+
        "</div>";
    }
  }
  // 이번 주 식단(mealOn()일 때만 — 식단 안 쓰는 사람에겐 자연히 안 보임)
  if(typeof mealOn==='function'&&mealOn()){
    if(typeof mealData==='undefined'||mealData===null){if(typeof loadMeal==='function')loadMeal();}
    var _mwk=mealWkKey(),_mdates=mealDatesOf(_mwk),_mnames=weekDayNames();
    var _memoRows=mealRows(_mwk).filter(function(r){return r.type==='memo';});
    var _mealIcon={b:'🍳',l:'🍱',d:'🍽️'};
    var _mealLines=[];
    _mdates.forEach(function(ds,i){
      var chips=[];
      _memoRows.forEach(function(r){var v=mealCell(ds,r.id);if(v)chips.push('<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(0,0,0,.05);border-radius:99px;padding:2px 9px;font-size:12.5px;white-space:nowrap">'+(_mealIcon[r.id]||'📝')+' '+dlEsc(v)+'</span>');});
      if(chips.length)_mealLines.push('<div style="display:flex;align-items:center;flex-wrap:wrap;gap:5px"><b style="flex-shrink:0;font-size:12.5px">'+_mnames[i]+'</b>'+chips.join('')+'</div>');
    });
    if(_mealLines.length){
      noticeCards+="<div class='dash-card dash-clickable' onclick=\"goDashTab('daily')\"><div class='dash-card-t'>🍚 이번 주 식단</div><div class='dash-card-sub' style='display:flex;flex-direction:column;gap:6px'>"+_mealLines.join('')+"</div></div>";
    }
  }

  var html="<div class='dash-columns'><div class='dash-section'>"+heroHtml+"</div>";
  if(progressCards)html+="<div class='dash-section'><div class='dash-section-title'>진행 현황</div><div class='dash-grid'>"+progressCards+"</div></div>";
  var goalMonthHtml="";
  if(goalCards)goalMonthHtml+="<div class='dash-section-title'>올해 목표</div><div class='dash-grid'>"+goalCards+"</div>";
  if(monthCards)goalMonthHtml+="<div class='dash-section-title'"+(goalCards?" style='margin-top:24px'":"")+">이번 달 소비</div><div class='dash-grid'>"+monthCards+"</div>";
  if(goalMonthHtml)html+="<div class='dash-section'>"+goalMonthHtml+"</div>";
  if(noticeCards)html+="<div class='dash-section'><div class='dash-section-title'>알림</div><div class='dash-grid'>"+noticeCards+"</div></div>";
  html+="</div>";

  wrap.innerHTML=html;

  // ── 차트는 DOM에 캔버스가 들어간 뒤에 그린다(mkChart가 실제 캔버스 element를 찾아 붙임) ──
  if(_abtKeys.length){
    var _abtColors=themePalette(_abtKeys.length);
    mkChart('dashAssetChart',{type:'doughnut',data:{labels:_abtKeys,datasets:[{data:_abtKeys.map(function(k){return _donutData[k];}),backgroundColor:_abtColors,borderWidth:1,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ct){var v=ct.parsed||0;var pc=_at>0?Math.round(v/_at*100):0;return ct.label+': '+fmtWon(v)+' ('+pc+'%)';}}}}}});
  }
  if(_yrs.length){
    mkChart('dashFutureChart',{type:'bar',data:{labels:_yrs.map(function(n){return n+'년 뒤('+_rows[n].y+')';}),datasets:[{data:_yrs.map(function(n){return _rows[n].tot;}),backgroundColor:ac(),borderRadius:6,maxBarThickness:46}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ct){return fmtWon(ct.parsed.y);}}}},scales:{y:{ticks:{callback:function(v){return fmtEok(v);}}},x:{ticks:{font:{size:11}}}}}});
  }
}
function reCellTd(r,v,f,bl){
  var d=(lgUnit>1)?(v/lgUnit):v,t=v?((lgUnit>1)?fmtUnitDisp(d):fmtComma(v)):"";
  if(bl)return "<td style='padding:3px 5px;text-align:right'>"+(t?"<span class='blurred' style='display:inline-block'>"+t+"</span>":"")+"</td>";
  return "<td style='padding:3px 5px'><input type='text' inputmode='numeric' class='si' value='"+t+"' data-y='"+r.y+"' data-f='"+f+"' data-d='"+v+"' style='width:68px;text-align:right' onfocus='reCellFocus(this)' oninput='reCellIn(this)' onblur='reCellBlur(this)'></td>";
}
/* 💰 블록 셀 — reCellTd와 같은 규칙(표 단위 토글 표시 · 원 저장 · 계승값이면 override 삭제) */
function abCellTd(r,v,rid,bl){
  var d=(lgUnit>1)?(v/lgUnit):v,t=v?((lgUnit>1)?fmtUnitDisp(d):fmtComma(v)):"";
  if(bl)return "<td style='padding:3px 5px;text-align:right'>"+(t?"<span class='blurred' style='display:inline-block'>"+t+"</span>":"")+"</td>";
  return "<td style='padding:3px 5px'><input type='text' inputmode='numeric' class='si' value='"+t+"' data-y='"+r.y+"' data-r='"+reEsc(rid)+"' data-d='"+v+"' style='width:68px;text-align:right' onfocus='reCellFocus(this)' oninput='abCellIn(this)' onblur='abCellBlur(this)'></td>";
}
function abCellIn(el){
  var y=parseInt(el.dataset.y,10),rid=el.dataset.r,base=parseFloat(el.dataset.d)||0;
  var k=rid+'_'+y,raw=String(el.value).replace(/,/g,'').trim();
  if(raw===''){delete abV[k];return;}
  var n=Math.round((parseFloat(raw)||0)*lgUnit);
  // 화면에 보이던 계승값 그대로면 덮어쓰지 않는다(§2.35와 같은 규칙)
  if(Math.abs(n-base)<Math.max(1,lgUnit)){delete abV[k];}else{abV[k]=n;}
}
function abCellBlur(el){
  abCellIn(el);
  el.style.background='transparent';
  var n=parseFloat(String(el.value).replace(/,/g,''))||0;
  el.value=n?((lgUnit>1)?fmtUnitDisp(n):fmtComma(n)):'';
  recalc();save();
}
/* 💰 중기 스코프 블록 셀(§2.36 중기 이식 · 세션 66) — abCellTd/In/Blur와 같은 규칙, 단위는 mdUnit · 키는 rid_md_연도 */
function abCellTdMid(y,v,rid,bl){
  var d=(mdUnit>1)?(v/mdUnit):v,t=v?((mdUnit>1)?fmtUnitDisp(d):fmtComma(v)):"";
  if(bl)return "<td style='padding:3px 5px;text-align:right'>"+(t?"<span class='blurred' style='display:inline-block'>"+t+"</span>":"")+"</td>";
  return "<td style='padding:3px 5px'><input type='text' inputmode='numeric' class='si' value='"+t+"' data-y='"+y+"' data-r='"+reEsc(rid)+"' data-d='"+v+"' style='width:68px;text-align:right' onfocus='reCellFocus(this)' oninput='abCellInMid(this)' onblur='abCellBlurMid(this)'></td>";
}
function abCellInMid(el){
  var y=parseInt(el.dataset.y,10),rid=el.dataset.r,base=parseFloat(el.dataset.d)||0;
  var k=rid+'_md_'+y,raw=String(el.value).replace(/,/g,'').trim();
  if(raw===''){delete abV[k];return;}
  var n=Math.round((parseFloat(raw)||0)*mdUnit);
  if(Math.abs(n-base)<Math.max(1,mdUnit)){delete abV[k];}else{abV[k]=n;}
}
function abCellBlurMid(el){
  abCellInMid(el);
  el.style.background='transparent';
  var n=parseFloat(String(el.value).replace(/,/g,''))||0;
  el.value=n?((mdUnit>1)?fmtUnitDisp(n):fmtComma(n)):'';
  renderMid();save();
}
function reGrpTd(lb,n){return "<td class='grp-c' rowspan='"+n+"'>"+lb+"</td>";}
function renderLong(rows,bl,sy){
  const chunks=[];for(let i=0;i<rows.length;i+=10)chunks.push(rows.slice(i,i+10));
  var _reApt=reOn?reAptCalc(rows):[];
  var _atT=abList();
  var _lgIn=lgInclSet(),_lgOrder=getLongOrder();
  var _crOutIds=lgCrIds().filter(function(id){return !_lgIn[id];});   // 투자금 아래로 내린 커스텀 행
  var _full=(reOn||_atT.length>0||_crOutIds.length>0)&&reView==='full';   // 자세히 = 그룹 열이 붙는 표
  var _aptN=_full?_reApt.filter(function(x){return !!x;}).length:0;
  let h="";
  chunks.forEach(function(chunk,chunkIdx){
    h+="<table class='xl"+(_full?" has-grp":"")+"' style='margin-bottom:0'><tbody>";
    h+="<tr>"+(_full?reGrpTd("기준",2+children.length):"")+"<td class='rl col-hdr' style='font-weight:700;vertical-align:middle'>연도</td>";
    chunk.forEach(r=>h+=yhCell(r.y,bl));h+="</tr>";
    h+="<tr class='r-sub'><td class='rl'>나이</td>";
    chunk.forEach(function(r){var _ag=(r.age!=null?r.age+"세":"");h+="<td style='text-align:center'>"+(bl&&_ag?"<span class='blurred'>"+_ag+"</span>":_ag)+"</td>";});h+="</tr>";
    children.forEach(c=>{
      h+="<tr class='r-sub'><td class='rl'>"+dlEsc(c.name)+"</td>";
      chunk.forEach(function(r){var ca=parseInt(c.age);var _ag=(isNaN(ca)?"":(ca+(r.y-sy))+"세");h+="<td style='text-align:center'>"+(bl&&_ag?"<span class='blurred'>"+_ag+"</span>":_ag)+"</td>";});h+="</tr>";
    });
    // ── 현금 자산 블록 — 행 순서는 getLongOrder()가 정한다(커스텀 행을 투자금 위/아래로 옮길 수 있다)
    var _lgFirst=true;
    var _rr={};
    _rr['L_asset']=function(){
      var t="<tr class='r-asset'>"+(_full?reGrpTd("현금<br>자산",_lgOrder.length):"")+rlTd('L_asset','자산(A)');
      _lgFirst=false;
      chunk.forEach(r=>t+="<td class=''>"+fmt(r.asset,bl)+"</td>");return t+"</tr>";
    };
    _rr['L_sv']=function(){
      var t="<tr class='r-sv'>"+(_full&&_lgFirst?reGrpTd("현금<br>자산",_lgOrder.length):"")+rlTd('L_sv','목표 저축액(B)');
    var _svCells="";chunk.forEach(function(r){var _sv=getSv(r.y-sy,r.y);var _svD=(lgUnit>1)?(_sv/lgUnit):_sv;var _svtxt=_sv?((lgUnit>1)?fmtUnitDisp(_svD):fmtComma(_sv)):"";if(bl){_svCells+="<td style='padding:3px 5px;text-align:right'>"+(_svtxt?"<span class='blurred' style='display:inline-block'>"+_svtxt+"</span>":"")+"</td>";}else{_svCells+="<td style='padding:3px 5px'><input type='text' inputmode='numeric' class='si' value='"+_svtxt+"' style='width:68px;text-align:right' oninput=\"CS["+r.y+"]=Math.round((parseFloat(this.value.replace(/,/g,''))||0)*lgUnit)\" onfocus=\"this.style.background='#fffde7';this.value=this.value.replace(/,/g,'')\" onblur=\"this.style.background='transparent';var _n=parseFloat(this.value.replace(/,/g,''))||0;this.value=_n?((lgUnit>1)?fmtUnitDisp(_n):fmtComma(_n)):'';recalc();save()\"></td>";}});
      return t+_svCells+"</tr>";
    };
    _rr['L_invest']=function(){
      var t="<tr class='r-invest'>"+(_full&&_lgFirst?reGrpTd("현금<br>자산",_lgOrder.length):"")+rlTd('L_invest','투자금(A+B)');_lgFirst=false;
      chunk.forEach(r=>t+="<td class=''>"+fmt(r.inv,bl)+"</td>");return t+"</tr>";
    };
    _rr['L_rate']=function(){
      var t="<tr class='r-rate'>"+rlTd('L_rate','수익률');
      chunk.forEach(r=>t+="<td><div class='rpill'><input class='ri' type='number' value='"+getRate(r.y)+"' min='0' max='99' step='0.1' oninput=\"YR["+r.y+"]=parseFloat(this.value)||15;\" onchange=\"recalc();save()\"><span style='font-size:13px;font-weight:700;color:#3d3000'>%</span></div></td>");return t+"</tr>";
    };
    _rr['L_profit']=function(){
      var t="<tr class='r-profit'>"+rlTd('L_profit','수익(C)');
      chunk.forEach(r=>t+="<td class=''>"+fmt(r.pr,bl)+"</td>");return t+"</tr>";
    };
    _rr['L_total']=function(){
      var t="<tr class='r-total'>"+rlTd('L_total',_full?'현금 자산 합계':'총자산(A+B+C)');
      chunk.forEach(r=>t+="<td class='' style='"+(r.crisis?"color:var(--crisis-text)":"")+"'>"+fmt(r.tot,bl)+"</td>");return t+"</tr>";
    };
    // 커스텀 행 — 순서 안에서 위/아래로 움직이며, 위치가 투자금 포함 여부를 정한다
    _lgOrder.forEach(function(id){
      if(_rr[id]){h+=_rr[id]();return;}
      var cr=customRows.find(function(x){return x.id===id;});
      if(!cr)return;
      h+="<tr class='r-event'>"+(_full&&_lgFirst?reGrpTd("현금<br>자산",_lgOrder.length):"");_lgFirst=false;
      h+="<td class='rl' style='padding:4px 6px;vertical-align:top;cursor:pointer' ondblclick='editRowLabel(\""+cr.id+"\",\""+String(cr.label).replace(/\n/g," ")+"\")'>";
      h+="<div style='display:flex;align-items:center;gap:2px'>";
      h+="<div style='display:flex;flex-direction:column;gap:1px'>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-rid='"+cr.id+"' data-d='-1' onclick='moveLongRow(this.dataset.rid,parseInt(this.dataset.d))'>▲</button>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-rid='"+cr.id+"' data-d='1' onclick='moveLongRow(this.dataset.rid,parseInt(this.dataset.d))'>▼</button>";
      h+="</div>";
      h+="<span style='font-size:13px;flex:1;white-space:normal;word-break:keep-all;overflow-wrap:break-word'>"+lblHtml(cr.label)+"</span>";
      h+="<button style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-rid='"+cr.id+"' onclick='deleteCustomRow(this.dataset.rid)'>×</button>";
      h+="</div></td>";
      chunk.forEach(function(r){
        var k=cr.id+"_"+r.y;var val=customData[k]||'';
        h+="<td style='padding:2px 4px;min-width:70px;cursor:pointer;text-align:right;position:relative'><span contenteditable='true' data-ck='"+k+"' style='display:block' onfocus='this.textContent=this.textContent.replace(/,/g,\"\")' onblur='var t=(this.textContent||\"\").trim();var d=t.replace(/,/g,\"\");if(d!==\"\"&&/^-?\\d+(\\.\\d+)?$/.test(d)){customData[this.dataset.ck]=fmtComma(parseFloat(d));this.textContent=fmtComma(parseFloat(d));}else{customData[this.dataset.ck]=t;this.textContent=t;}recalc();save()'>"+dlEsc(val||"")+"</span>"+cellNoteDot(k,'openCellNoteLong')+"</td>";
      });
      h+="</tr>";
    });
    // ── 내 집 갈아타기 (켰을 때만) ──────────────────────────
    if(reOn){
      h+="<tr class='r-sv'>"+(_full?reGrpTd("부동산<br>자산",4):"")+rlTd('L_reP','내 집 시세');
      chunk.forEach(function(r){h+=reCellTd(r,r.reP,'P',bl);});h+="</tr>";
      h+="<tr class='r-sv'>"+rlTd('L_reL','내 집 대출(−)');
      chunk.forEach(function(r){h+=reCellTd(r,r.reL,'L',bl);});h+="</tr>";
      h+="<tr class='r-rate'>"+rlTd('L_reR','시세 상승률');
      chunk.forEach(function(r){h+="<td><div class='rpill'><input class='ri' type='number' value='"+reRate(r.y)+"' min='0' max='99' step='0.1' data-y='"+r.y+"' oninput='reRateIn(this)' onchange='recalc();save()'><span style='font-size:13px;font-weight:700;color:#3d3000'>%</span></div></td>";});h+="</tr>";
      if(_full){
        h+="<tr class='r-total'>"+rlTd('L_reEq','부동산 자산 합계');
        chunk.forEach(function(r){h+="<td>"+fmt(r.reEq,bl)+"</td>";});h+="</tr>";
      }
    }
    // ── 💰 자산 구역 (블록마다 항목 행 + 상승률 + 합계) ────────
    _atT.forEach(function(b){
      var _raw=String(b.name||'자산'),_bn=lblHtml(_raw),_first=true;
      var _bnGrp=(_raw.indexOf('\n')<0)?_bn.replace(/ /g,'<br>'):_bn;   // 줄바꿈을 직접 넣었으면 그대로, 아니면 어절 단위로 접는다
      var _grp=function(){var t=(_full&&_first)?reGrpTd("<span class='ab-grp' ondblclick='editRowLabel(\""+reEsc(b.id)+"\",\"\")' style='cursor:pointer'>"+_bnGrp+"</span>",abRowsN(b,_full)):"";_first=false;return t;};
      (b.rows||[]).forEach(function(rw){
        h+="<tr class='r-sv'>"+_grp();
        h+="<td class='rl' style='padding:4px 6px;vertical-align:top;cursor:pointer' ondblclick='editRowLabel(\""+reEsc(rw.id)+"\",\"\")'>";
        h+="<div style='display:flex;align-items:center;gap:2px'>";
        h+="<div style='display:flex;flex-direction:column;gap:1px'>";
        h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-r='"+reEsc(rw.id)+"' data-d='-1' onclick='abMoveRow(this.dataset.r,parseInt(this.dataset.d))'>▲</button>";
        h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-r='"+reEsc(rw.id)+"' data-d='1' onclick='abMoveRow(this.dataset.r,parseInt(this.dataset.d))'>▼</button>";
        h+="</div>";
        h+="<span style='font-size:13px;flex:1;white-space:normal;word-break:keep-all;overflow-wrap:break-word'>"+lblHtml(rw.label||'항목')+(rw.neg?"<span style='white-space:nowrap'>&nbsp;(−)</span>":"")+"</span>";
        h+="<button class='segtip' data-tip='합계에서 빼는 항목§§대출처럼 갚아야 할 돈에 쓰세요' style='background:none;border:none;cursor:pointer;color:"+(rw.neg?'var(--ac)':'#ccc')+";font-size:12px;padding:0' data-r='"+reEsc(rw.id)+"' onclick='abToggleNeg(this.dataset.r)'>±</button>";
        h+="<button style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-r='"+reEsc(rw.id)+"' onclick='abDelRow(this.dataset.r)'>×</button>";
        h+="</div></td>";
        chunk.forEach(function(r){h+=abCellTd(r,(r.ab&&r.ab[rw.id])||0,rw.id,bl);});
        h+="</tr>";
      });
      h+="<tr class='r-rate'>"+_grp();
      h+="<td class='rl' style='padding:4px 6px;vertical-align:middle'><div style='display:flex;align-items:center;gap:4px;flex-wrap:wrap'>";
      h+="<span style='font-size:13px;white-space:nowrap'>상승률</span>";
      h+="<button class='segtip' data-tip='이 구역에 항목을 하나 더 넣어요' style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;white-space:nowrap' data-b='"+reEsc(b.id)+"' onclick='abAddRow(this.dataset.b)'>＋&nbsp;항목</button>";
      h+="<button class='segtip' data-tip='이 구역을 통째로 지워요§§다른 구역과 현금·내 집 자산은 그대로예요' style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-b='"+reEsc(b.id)+"' onclick='abDelBlock(this.dataset.b)'>×</button>";
      h+="</div></td>";
      chunk.forEach(function(r){h+="<td><div class='rpill'><input class='ri' type='number' value='"+abRate(b)+"' min='-99' max='99' step='0.1' data-b='"+reEsc(b.id)+"' oninput='abSetRate(this)' onchange='abSetRateChg(this)'><span style='font-size:13px;font-weight:700;color:#3d3000'>%</span></div></td>";});
      h+="</tr>";
      if(_full){
        h+="<tr class='r-total'>"+_grp()+"<td class='rl' style='padding:4px 6px;word-break:keep-all;overflow-wrap:break-word'>"+_bn+"<span style='white-space:nowrap'>&nbsp;합계</span></td>";
        chunk.forEach(function(r){h+="<td>"+fmt((r.abBlk&&r.abBlk[b.id])||0,bl)+"</td>";});
        h+="</tr>";
      }
    });
    if(_full){
      h+="<tr class='r-total'>"+reGrpTd("",1)+rlTd('L_grand','총 자산 합계');
      chunk.forEach(function(r){h+="<td style='color:var(--ac)'>"+fmt(r.grand,bl)+"</td>";});h+="</tr>";
    }
    if(reOn){
      if(_full){
        // 아파트별 한 행 — 칸은 그 해 시세, 갈아탈 수 있는 해엔 배지
        var _aptSeen=0;
        _reApt.forEach(function(ap,ai){
          if(!ap)return;
          var nm=ap.name||('아파트'+(ai+1));
          h+="<tr class='r-event'>"+((_aptSeen===0)?reGrpTd("갈아타기",_aptN):"")+
             "<td class='rl'>"+reEsc(nm)+(ap.size?"<br>("+reEsc(ap.size)+")":"")+"</td>";
          _aptSeen++;
          chunk.forEach(function(r){
            var i=r.y-sy,can=ap.ok[i],pv=ap.prices[i];
            // 배지는 처음 가능해진 해에만 — 이후 가능한 해는 칸 강조만(매해 반복하면 칸을 넘친다)
            var tip=reEsc(nm)+' 갈아타기 가능'+(bl?'':'§§그 해 시세 '+reEok1(pv));
            h+="<td class='"+(can?"re-ok":"")+"' style='vertical-align:middle'>"+fmt(pv,bl)+
               ((can&&i===ap.first)?"<div class='re-chip segtip' data-tip='"+tip+"'>🏠&nbsp;가능</div>":"")+"</td>";
          });
          h+="</tr>";
        });
      }else{
        h+="<tr class='r-event'>"+rlTd('L_reSwitch','갈아타기');
        chunk.forEach(function(r){
          var chips='';
          _reApt.forEach(function(ap,ai){
            if(!ap||ap.first===null||rows[ap.first].y!==r.y)return;
            var nm=ap.name||('아파트'+(ai+1));
            var tip=reEsc(nm)+' 갈아타기 가능'+(bl?'':'§§그 해 시세 '+reEok1(ap.prices[ap.first]));
            chips+="<div class='re-chip segtip' data-tip='"+tip+"'>🏠&nbsp;"+reEsc(nm)+"</div>";
          });
          h+="<td style='text-align:center;vertical-align:middle'>"+chips+"</td>";
        });h+="</tr>";
      }
    }
    // ── 커스텀 행들 (이벤트/목표 포함) ──────────────────────
    var _btm=customRows.filter(function(cr){return cr.id==='et_default';});
    _btm.forEach(function(cr,crIdx){
      h+="<tr class='r-event'>"+((_full&&crIdx===0)?reGrpTd("목표 및<br>보상",_btm.length):"");
      // 행 레이블 + 순서변경 + 이름변경 + 삭제 버튼
      h+="<td class='rl' style='padding:4px 6px;vertical-align:top;cursor:pointer' ondblclick='editRowLabel(\""+cr.id+"\",\""+String(cr.label).replace(/\n/g," ")+"\")' title='더블클릭: 이름 수정'>";
      h+="<div style='display:flex;align-items:center;gap:2px'>";
      h+="<div style='display:flex;flex-direction:column;gap:1px'>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-rid='"+cr.id+"' data-d='-1' onclick='moveRow(this.dataset.rid,parseInt(this.dataset.d))'>▲</button>";
      h+="<button style='background:none;border:none;cursor:pointer;color:var(--ac);font-size:13px;padding:0;line-height:1' data-rid='"+cr.id+"' data-d='1' onclick='moveRow(this.dataset.rid,parseInt(this.dataset.d))'>▼</button>";
      h+="</div>";
      h+="<span style='font-size:13px;flex:1;white-space:normal;word-break:break-word'>" +lblHtml(cr.label)+ "</span>";
      if(cr.id!=='et_default'){
      if(cr.id!=='et_default'){h+="<button style='background:none;border:none;cursor:pointer;color:#ccc;font-size:13px;padding:0' data-rid='"+cr.id+"' onclick='deleteCustomRow(this.dataset.rid)'>×</button>";}
      }
      h+="</div></td>";
      // 각 연도 칸
      chunk.forEach(function(r){
        var k=cr.id+"_"+r.y;
        var val=customData[k]||'';
        var imgHtml='';
        if(cr.id==='et_default'){
          var imgs=getImgs(r.y);
          imgHtml='<div class="img-cell-inner">';
          imgs.forEach(function(im,ii){
            imgHtml+="<div class='img-wrap'><img src='"+im.src+"' class='ev-img2' style='width:"+im.w+"px;height:auto' onclick='imgZoomTap(this)'>"+
              "<div class='img-handle' onmousedown='rsStart(event,"+r.y+","+ii+")'></div>"+
              "<div class='img-del' onclick='rmImgAt("+r.y+","+ii+")'>&#10005;</div></div>";
          });
          imgHtml+="<button class='ib' onclick='pickImg("+r.y+")' title='클릭해서 사진 파일 선택'>+</button>";
          imgHtml+='</div>';
        }
        if(cr.id==='et_default'){
          h+="<td style='padding:4px;vertical-align:top'><textarea class='ev-in' rows='2' data-k='"+k+"' data-y='"+r.y+"' placeholder='입력...' oninput='crInput(this)' onfocus='pImg=parseInt(this.dataset.y);this.value=this.value.replace(/,/g,\"\")' onblur='crBlur(this)'>"+dlEsc(val)+"</textarea>"+imgHtml+"</td>";
        } else {
          // 새로 추가한 항목: 중기처럼 셀 직접 입력(숫자면 쉼표, 문자도 가능)
          h+="<td style='padding:2px 4px;min-width:70px;cursor:pointer;text-align:right' contenteditable='true' data-ck='"+k+"' onfocus='this.textContent=this.textContent.replace(/,/g,\"\")' onblur='var t=(this.textContent||\"\").trim();var d=t.replace(/,/g,\"\");if(d!==\"\"&&/^-?\\d+(\\.\\d+)?$/.test(d)){customData[this.dataset.ck]=fmtComma(parseFloat(d));this.textContent=fmtComma(parseFloat(d));}else{customData[this.dataset.ck]=t;this.textContent=t;}recalc();save()'>"+dlEsc(val||"")+"</td>";
        }
      });
      h+="</tr>";
    });
    // + 항목 추가 버튼 (마지막 청크에만)

    h+="</tbody></table><div style='height:16px'></div>";
  });
  var _tw=g("tblWrap");if(_tw){_tw.innerHTML="";void _tw.offsetHeight;_tw.innerHTML=h;}try{syncLgUnitBtns();}catch(e){}
  // 🏢 표 아래 3분할 요약(마지막 해 기준) — 전부 파생, 저장 안 함
  var _rsm=g("reSummary");
  if(_rsm){
    if((!reOn&&!_atT.length&&!_crOutIds.length)||!rows.length){_rsm.style.display="none";_rsm.innerHTML="";}
    else{
      var _lr=rows[rows.length-1];
      var _other=(reOn?_lr.reEq:0)+(_lr.atEq||0)+(_lr.crOut||0);   // 15% 복리에 들어가지 않는 자산 전부
      var _note=[];if(reOn)_note.push("부동산 = 시세 − 대출");
      _atT.forEach(function(b){_note.push(reEsc(b.name||'자산'));});
      _crOutIds.forEach(function(id){var cr=customRows.find(function(x){return x.id===id;});if(cr)_note.push(reEsc(String(cr.label).replace(/\n/g,' ')));});
      _rsm.style.display="block";
      _rsm.innerHTML="<div class='re-sum'>"+
        "<div><div class='re-sum-l'>현금자산</div><div class='re-sum-v'>"+fmt(_lr.tot,bl)+"</div></div>"+
        "<div><div class='re-sum-l'>그 외 자산</div><div class='re-sum-v'>"+fmt(_other,bl)+"</div></div>"+
        "<div><div class='re-sum-l'>총자산</div><div class='re-sum-v'>"+fmt(_lr.grand,bl)+"</div></div>"+
        "</div><div style='font-size:12px;color:var(--gray);margin-top:5px;word-break:keep-all'>"+_lr.y+"년 기준 · 그 외 자산 = "+(_note.join(" + ")||"—")+" (수익률 계산에 안 들어가요)</div>";
    }
  }
  try{syncReUI();}catch(e){}
}

// ── 자녀 ─────────────────────────────────────────────
function openChildModal(){g("cName").value=CLABELS[children.length]||"";g("cAge").value="";g("cMod").classList.add("open");}
function addChild(){
  const name=g("cName").value.trim()||CLABELS[children.length]||"자녀";
  const age=parseInt(g("cAge").value);
  if(isNaN(age)||age<0){alert("나이를 입력해주세요.");return;}
  children.push({name,age});closeM("cMod");renderCBar();renderMid();recalc();save();
}
function deleteChild(i){children.splice(i,1);renderCBar();renderMid();recalc();save();}
/* ── 연말 마무리 · 새해 열기 (§4.2-20 STEP 2) ───────────────────────────
   ★ G1: 지우거나 한 칸씩 미는 데이터가 없다. 장기·중기 값은 전부 절대 연도 키
   (CS[y]·YR[y]·ET/EI[y]·customData['id_'+y]·abV['rid_'+y]·reP/reL/reR[y]·mdYR[y])라
   시작 연도만 옮기면 표가 저절로 미끄러진다. 값을 밀면 오히려 기록이 어긋난다.
   바뀌는 것: sY·sA·children[].age·sV, 그리고 중기 mdY·mdA·mdV. 그 외 전부 불변. */
var nyHide=0;   // 「올해는 그만 보기」로 배너를 닫은 달력 연도 — rs7 저장
var NEWYEAR_IMG='data:image/png;base64,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';   // 불꽃놀이 아이콘(§1.1-10 · 192px 원본을 64px로)
function newYearIconHtml(h){return NEWYEAR_IMG?'<img src="'+NEWYEAR_IMG+'" alt="" style="height:'+(h||'1.35em')+';vertical-align:-5px">':'';}
/* 표시 규칙 — 평소엔 화면에 없다.
   ① 올해가 시작 연도보다 뒤면(해가 넘어갔다) 배너
   ② 올해가 시작 연도이고 12월이면 미리 안내
   ③ 「올해는 그만 보기」로 닫은 해에는 안 뜬다(nyHide = 닫은 달력 연도)
   기능 자체는 메뉴 › 새해 열기에 상시 있다. */
function nyState(){
  var y=parseInt(g("sY")&&g("sY").value)||0; if(!y)return null;
  var now=new Date(),cy=now.getFullYear(),mo=now.getMonth()+1;
  if(nyHide===cy)return null;
  if(cy>y)return{y:y,mode:'past'};
  if(cy===y&&mo===12)return{y:y,mode:'dec'};
  return null;
}
function renderNyBox(){
  var mi=g("nyMenuIco"); if(mi&&!mi.innerHTML)mi.innerHTML=newYearIconHtml('1.15em');
  var b=g("nyBox"); if(!b)return;
  var st=nyState();
  if(!st){b.style.display='none';b.innerHTML='';return;}
  var msg=(st.mode==='past')
    ? ('아직 '+st.y+'년 로드맵이에요. '+(st.y+1)+'년을 열까요?')
    : ('곧 '+st.y+'년이 끝나요. 마무리하고 '+(st.y+1)+'년을 열 수 있어요.');
  b.innerHTML='<span class="ny-ic">'+newYearIconHtml()+'</span>'
    +'<span class="ny-msg">'+msg+' 적어둔 기록·사진은 지워지지 않아요.</span>'
    +'<button class="ny-btn" onclick="openNewYear()">새해 열기</button>'
    +'<button class="ny-off" onclick="nyDismiss()">올해는 그만 보기</button>';
  b.style.display='flex';
}
function nyDismiss(){nyHide=new Date().getFullYear();save();renderNyBox();}
function openNewYear(){
  var y=parseInt(g("sY")&&g("sY").value)||2026;
  var a=parseInt(g("sA")&&g("sA").value)||0;
  var my=parseInt(g("mdY")&&g("mdY").value)||0;
  var ma=parseInt(g("mdA")&&g("mdA").value)||0;
  var kid=0;
  try{if(children&&children.length)children.forEach(function(c){if(!isNaN(parseInt(c.age)))kid++;});}catch(e){}
  var L=[];
  L.push('• 시작 연도  '+y+' → '+(y+1));
  if(a>0)L.push('• 내 나이  '+a+'세 → '+(a+1)+'세');
  if(kid>0)L.push('• 자녀 '+kid+'명도 한 살씩');
  if(my>0)L.push('• 중기 시작 연도  '+my+' → '+(my+1)+(ma>0?('  (나이 '+ma+'→'+(ma+1)+'세)'):''));
  L.push('• 시작 자산은 다음 화면에서 확인해요');
  rsConfirm(y+'년을 마감하고 '+(y+1)+'년을 열까요?\n\n'+L.join('\n')
    +'\n\n적어둔 저축액·수익률·이벤트·사진은 지워지지 않아요. 표에서만 빠집니다.\n먼저 백업하셨나요? (메뉴 › 백업)',
    function(){newYearAskAsset(y);});
}
function newYearAskAsset(oldY){
  var cur=parseFloat(String((g("sV")&&g("sV").value)||'').replace(/,/g,''))||0;
  var man=cur,desc='';
  var tot=0;
  try{if(typeof assetTotal==='function')tot=assetTotal()||0;}catch(e){tot=0;}
  if(tot>0){man=Math.round(tot/10000);desc='자산 탭 총자산 기준이에요. 다르면 고쳐 주세요. (지금 '+fmtComma(cur)+'만원)';}
  else{desc='자산 탭에 등록된 자산이 없어 지금 값('+fmtComma(cur)+'만원)을 그대로 뒀어요.';}
  rsPrompt((oldY+1)+'년 시작 자산(만원)',{value:man,desc:desc},function(v){
    var n=parseFloat(String(v==null?'':v).replace(/,/g,''));
    if(isNaN(n)||n<0){try{showToast('숫자를 넣어주세요.');}catch(e){}return;}
    applyNewYear(n);
  });
}
function applyNewYear(newSvMan){
  var oy=parseInt(g("sY").value)||2026;
  // 지금 실제 자산을 그 달 기록으로 남긴다(기존 rs_asset_history 형식 그대로 · 계획값은 섞지 않는다)
  try{if(typeof assetTotal==='function'&&assetTotal()>0&&typeof snapshotAssets==='function')snapshotAssets(false);}catch(e){}
  g("sY").value=oy+1;
  var a=parseInt(g("sA").value)||0; if(a>0)g("sA").value=a+1;
  // 자녀 나이는 시작 연도 기준 「현재 나이」라 같이 올려야 한다(안 올리면 전원 한 살 어려진다)
  try{if(children&&children.length)children.forEach(function(c){var k=parseInt(c.age);if(!isNaN(k))c.age=k+1;});}catch(e){}
  g("sV").value=newSvMan;
  var my=parseInt(g("mdY")&&g("mdY").value)||0;
  if(my>0){
    g("mdY").value=my+1;
    var ma=parseInt(g("mdA").value)||0; if(ma>0)g("mdA").value=ma+1;
    // 중기 현재 자산은 시작 연도가 장기와 같을 때만 맞춘다(따로 잡아둔 해면 건드리지 않는다)
    if(my===oy&&g("mdV")&&String(g("mdV").value).trim()!=='')g("mdV").value=newSvMan;
  }
  try{if(typeof renderCBar==='function')renderCBar();}catch(e){}
  recalc();
  try{if(typeof renderMid==='function')renderMid();}catch(e){}
  save();
  try{showToast((oy+1)+'년을 열었어요. 지난 기록은 그대로 있어요.');}catch(e){}
}
function renderCBar(){
  var html=children.map((c,i)=>"<span class='child-tag'>"+dlEsc(c.name)+" (현재 "+c.age+"세)<button onclick='deleteChild("+i+")'>×</button></span>").join("");
  var b1=g("childBar"); if(b1)b1.innerHTML=html;
  var b2=g("childBarMid"); if(b2)b2.innerHTML=html;
}

// ── 이미지 ───────────────────────────────────────────
function pickImg(y){
  fImg=y;                       // 파일 선택용 연도 (붙여넣기와 분리)
  g("gImg").value="";
  g("gImg").click();            // + 버튼: 한 번 클릭에 파일 선택창 열기
}
function handleImg(inp){
  if(!inp.files[0]||fImg==null)return;
  const r=new FileReader();r.onload=e=>{var py=fImg;var _pf=imgProfile();resizeImg(e.target.result,_pf.maxW,function(small){addImgToYear(py,small);},_pf.q);fImg=null;};r.readAsDataURL(inp.files[0]);
}


// ── 엑셀 ─────────────────────────────────────────────
function triggerExcel(){g("excelInput").value="";g("excelInput").click();}
// ── 레이블 정규화 ────────────────────────────────────────
function normLbl(s){
  return String(s||"").trim().toLowerCase()
    .replace(/\s/g,"").replace(/\(.*?\)/g,"")
    .replace(/[\u2460-\u2473\d\.\-]/g,"");
}
function isAssetRow(r){
  var n=normLbl(r),lo=String(r).toLowerCase();
  if(n.includes("합계")||n.includes("투자금")||n.includes("총자산"))return false;
  if(lo.includes("자산(a)")&&!lo.includes("투자금"))return true;
  return n==="자산"||n==="현자산"||n==="현재자산"||n==="기초자산"
    ||n==="전기자산"||n==="투자가능자산"||n==="보유자산";
}
function isSvRow(r){var n=normLbl(r);return n.includes("저축")&&!n.includes("목표달성");}
function isRateRow(r){var n=normLbl(r);return n.includes("수익률")||n==="율"||n.includes("이율");}
function isAgeRow(r){var n=normLbl(r);return n==="나이"||n==="연령"||n==="age";}
function isStdRow(r){return isAgeRow(r)||isAssetRow(r)||isSvRow(r)||isRateRow(r);}
// 이미 표준 표에 표시되는 계산 행 (커스텀 행으로 가져오지 않음)
function isCalcRow(r){
  var n=normLbl(r);
  var lo=String(r).toLowerCase().trim();
  // 합계류 (투자금 A+B)
  if(n==="합계"||n==="투자합계"||n==="소계"||n==="투자금합계")return true;
  // 수익(숫자%) 형태 → 수익(C) 계산값
  if(/^수익\d/.test(n)||/수익\s*\(\s*\d+/.test(lo))return true;
  // 총합계/총자산 → 총자산(A+B+C)
  if(n==="총합계"||n==="총자산"||n==="누적자산"||n==="자산합계")return true;
  return false;
}
// 이벤트/목표 행 여부
function isEventLbl(r){
  var n=normLbl(r);
  return n.includes("이벤트")||(n.includes("목표")&&!n.includes("저축")&&!n.includes("수익"));
}

// ── 블록 감지 ─────────────────────────────────────────────
function detectBlocks(rows){
  var blocks=[];
  for(var r=0;r<rows.length;r++){
    var ys=[];
    for(var ci=0;ci<rows[r].length;ci++){
      var v=parseInt(rows[r][ci]);
      if(v>=2020&&v<=2065)ys.push({col:ci,year:v});
    }
    if(ys.length>=2)blocks.push({row:r,years:ys});
  }
  return blocks;
}

// ── 레이블 컬럼 탐색 ─────────────────────────────────────
function getLabelCol(row){
  for(var lc=0;lc<2;lc++){
    var c=String(row[lc]||"").trim();
    if(c&&isNaN(parseFloat(c)))return{rawLbl:c,lblCol:lc};
  }
  return null;
}

// ── 표준 행 파싱 ─────────────────────────────────────────
function parseStandardRows(blocks,rows){
  var found=[];var firstBlock=true;
  blocks.forEach(function(blk,bi){
    var nextRow=bi+1<blocks.length?blocks[bi+1].row:rows.length;
    var minYIB=Math.min.apply(null,blk.years.map(function(y){return y.year;}));
    for(var r=blk.row+1;r<nextRow;r++){
      var row=rows[r];if(!row||!row.length)continue;
      var info=getLabelCol(row);if(!info)continue;
      var rawLbl=info.rawLbl,lblCol=info.lblCol,dt=null;
      if(isAgeRow(rawLbl))dt="age";
      else if(isAssetRow(rawLbl))dt="asset";
      else if(isSvRow(rawLbl))dt="sv";
      else if(isRateRow(rawLbl))dt="rate";
      if(!dt)continue;
      // 단위·비율 판정은 칸마다가 아니라 행 전체로 한다 (50만 원 한 칸이 만원으로, 0.5% 한 칸이 50%로 바뀌던 문제)
      var rowMax=0;blk.years.forEach(function(o){if(o.col<=lblCol)return;var v=parseFloat(String(row[o.col]==null?"":row[o.col]).replace(/,/g,""));if(!isNaN(v))rowMax=Math.max(rowMax,Math.abs(v));});
      blk.years.forEach(function(o){
        if(o.col<=lblCol)return;
        var val=row[o.col];if(val===""||val==null)return;
        var num=parseFloat(String(val).replace(/,/g,""));
        if(isNaN(num))return;
        if(dt==="age"&&firstBlock&&o.year===minYIB){
          g("sA").value=Math.round(num);
          if(!found.includes("나이"))found.push("나이");
        }else if(dt==="asset"&&firstBlock&&o.year===minYIB){
          // sV 입력칸은 "만원" 단위 (recalc에서 ×10000). 큰 값(원)이면 만원으로 환산, 이미 만원이면 그대로
          var manwon=rowMax>=1000000?Math.round(num/10000):Math.round(num);  // 첫해 한 칸이 아니라 행 전체로 원/만원 판정
          g("sV").value=manwon;
          if(!found.includes("자산"))found.push("자산("+manwon.toLocaleString()+"만원)");
        }else if(dt==="sv"){
          CS[o.year]=rowMax>=100000?num:num*10000;  // 행에 10만 이상 값이 하나라도 있으면 원, 아니면 만원입력으로 간주
          if(!found.includes("저축액"))found.push("저축액");
        }else if(dt==="rate"){
          YR[o.year]=rowMax>1?num:num*100;  // 행 전체가 1 이하일 때만 소수(0.05=5%)로 간주
          if(!found.includes("수익률"))found.push("수익률");
        }
      });
    }
    firstBlock=false;
  });
  return found;
}

// ── 커스텀 텍스트 행 파싱 ────────────────────────────────
function parseCustomTextRows(blocks,rows){
  var found=[];
  var existingLabels=customRows.map(function(r){return r.label;});
  var newRows=[];
  blocks.forEach(function(blk,bi){
    var nextRow=bi+1<blocks.length?blocks[bi+1].row:rows.length;
    for(var r=blk.row+1;r<nextRow;r++){
      var row=rows[r];if(!row||!row.length)continue;
      var info=getLabelCol(row);if(!info)continue;
      var rawLbl=info.rawLbl,lblCol=info.lblCol;
      if(isStdRow(rawLbl)||isCalcRow(rawLbl))continue;
      // 이벤트 행 → et_default에 매핑
      if(isEventLbl(rawLbl)){
        // et_default 없으면 추가
        if(!customRows.some(function(r){return r.id==='et_default';})){
          customRows.unshift({id:'et_default',label:'이벤트/목표'});
        }
        blk.years.forEach(function(o){
          if(o.col<=lblCol)return;
          var s=String(row[o.col]||"").trim();
          if(s)customData["et_default_"+o.year]=s;
        });
        continue;
      }
      var matched=null;
      for(var i=0;i<customRows.length;i++){if(customRows[i].label===rawLbl){matched=customRows[i];break;}}
      var tid;
      if(matched){tid=matched.id;}
      else if(!existingLabels.includes(rawLbl)){
        tid="cr_xl_"+rawLbl.replace(/[^a-z0-9\uAC00-\uD7A3]/gi,"")+"_"+Date.now();
        newRows.push({id:tid,label:rawLbl});
        existingLabels.push(rawLbl);
      }else continue;
      blk.years.forEach(function(o){
        if(o.col<=lblCol)return;
        var s=String(row[o.col]||"").trim();
        if(s)customData[tid+"_"+o.year]=s;
      });
      if(!found.includes(rawLbl))found.push(rawLbl);
    }
  });
  if(newRows.length){
    var ei=-1;for(var i=0;i<customRows.length;i++){if(customRows[i].id==="et_default"){ei=i;break;}}
    if(ei>=0)customRows.splice.apply(customRows,[ei+1,0].concat(newRows));
    else customRows=customRows.concat(newRows);
  }
  return found;
}

// ── 시트 데이터 로드 ─────────────────────────────────────
function loadSheetData(rows){
  var blocks=detectBlocks(rows);
  if(!blocks.length){
    alert("연도 행을 찾을 수 없습니다.\n\n표 형식을 확인해 주세요.\n\n\u2022 맨 윗줄(헤더)에 연도가 있어야 해요: 2026, 2027, 2028 ...\n\u2022 연.월 형식(2026.01)이나 제목 줄이 위에 있으면 인식이 안 돼요.\n\u2022 헤더 위의 제목 줄은 지워주세요.\n\n장기는 연 단위(2026\u00b72027\u2026), 단기는 월 단위(1\uc6d4~12\uc6d4) 표를 받아요.");
    return false;
  }
  var allYears=[];
  blocks.forEach(function(b){b.years.forEach(function(y){allYears.push(y.year);});});
  var minYear=Math.min.apply(null,allYears);
  var maxYear=Math.max.apply(null,allYears);
  var period=maxYear-minYear;
  if(period>0){g("sY").value=minYear;g("period").value=period;}
  var stdFound=parseStandardRows(blocks,rows);
  var custFound=parseCustomTextRows(blocks,rows);
  var allFound=stdFound.concat(custFound);
  if(allFound.length>0){
    g("uploadZone").innerHTML="<span style='font-size:22px'>\u2705</span><div class='uz-text'><strong>\ud30c\uc2f1 \uc644\ub8cc \u2014 "+blocks.length+"\uac1c \ube14\ub85d / "+period+"\ub144\uce58</strong> "+allFound.join(", ")+" \uc801\uc6a9\ub428</div>";
  }else{
    alert("\ub370\uc774\ud130\ub97c \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.\n\ud589 \ub808\uc774\ube14(\ub098\uc774, \uc790\uc0b0, \uc800\ucd95\uc561, \uc218\uc775\ub960 \ub4f1)\uc744 \ud655\uc778\ud574\uc8fc\uc138\uc694.");
  }
  recalc();
  // Method A 중복 감지
  var log={std:allFound.slice(),removed:[],kept:[]};
  detectAndRemoveDuplicates(log);
  customRows.forEach(function(cr){if(cr.id!=="et_default"&&!log.removed.some(function(r){return r.id===cr.id;}))log.kept.push({id:cr.id,label:cr.label});});
  lastImportLog=log;
  if(log.removed.length){
    showToast(log.removed.map(function(r){return r.label;}).join(", ")+" 중복 제거됨 — 검토하려면 [가져오기 검토] 클릭");
    var btn=document.getElementById("importReviewBtn");
    if(btn)btn.style.display="inline-flex";
  }
  save();renderShort();renderMid();
  return true;
}

// ── 파일 읽기 (xlsx + csv) ───────────────────────────────
function handleExcel(input){
  if(!input.files[0])return;
  var file=input.files[0];
  var isCsv=file.name.toLowerCase().endsWith(".csv");
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var wb=isCsv
        ?XLSX.read(e.target.result,{type:"string"})
        :XLSX.read(new Uint8Array(e.target.result),{type:"array"});
      var proceed=function(sheetName){
        try{
          var rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{header:1,defval:""});
          // 이미 URL로 숫자 데이터가 로드된 경우 → 이벤트/텍스트만 병합
          var hasMainData=parseInt(g("period").value)>0&&parseInt(g("sY").value)>=2020;
          if(getActiveTab()==="short"){
            loadShortData(rows);
          } else if(hasMainData&&isCsv){
            mergeEventCsv(rows);
          } else {
            loadSheetData(rows);
          }
        }catch(err){showToast("오류: "+err.message);}
      };
      if(wb.SheetNames.length>1){
        rsPromptSelect("어떤 시트를 가져올까요?",wb.SheetNames,function(sn){if(sn)proceed(sn);});
      }else{
        proceed(wb.SheetNames[0]);
      }
    }catch(err){showToast("오류: "+err.message);}
  };
  if(isCsv)reader.readAsText(file,"UTF-8");
  else reader.readAsArrayBuffer(file);
}

function copyTbl(captureId){
  const el=g(captureId);
  if(!el){alert("캡처 대상을 찾을 수 없습니다.");return;}
  const btn=event.currentTarget;
  btn.textContent="캡처 중...";btn.disabled=true;
  // 모바일에서 .tbl-wrap 이 overflow-x:auto(!important) 라 보이는 폭만 캡처되던 문제
  // → 캡처 동안만 클리핑을 풀고 실제 내용 폭(scrollWidth)을 고정, 캡처 후 원복
  const capFix=[];
  var fullW=el.scrollWidth;
  el.querySelectorAll('.tbl-wrap').forEach(function(wp){
    capFix.push({el:wp,ox:wp.style.getPropertyValue('overflow-x'),oxp:wp.style.getPropertyPriority('overflow-x'),w:wp.style.width});
    var sw=wp.scrollWidth;
    wp.style.setProperty('overflow-x','visible','important');
    if(sw>0)wp.style.width=sw+'px';
    if(sw>fullW)fullW=sw;
  });
  capFix.push({el:el,ox:el.style.getPropertyValue('overflow-x'),oxp:el.style.getPropertyPriority('overflow-x'),w:el.style.width});
  if(fullW>0)el.style.width=fullW+'px';
  function capRestore(){capFix.forEach(function(x){
    if(x.ox)x.el.style.setProperty('overflow-x',x.ox,x.oxp);else x.el.style.removeProperty('overflow-x');
    x.el.style.width=x.w;});}
  // 버튼/이동버튼 임시 숨기기
  const hiddenBtns=[];
  el.querySelectorAll('button,[style*="flex-direction:column"]').forEach(function(b){
    hiddenBtns.push({el:b,vis:b.style.visibility,w:b.style.width,ov:b.style.overflow,p:b.style.padding});
    b.style.visibility='hidden';b.style.width='0';b.style.overflow='hidden';b.style.padding='0';
  });
  // blur 요소들을 canvas로 선렌더링 (CSS filter를 픽셀로 변환)
  const blurCanvas=[];
  el.querySelectorAll('span.blurred').forEach(function(b){
    try{
      var w=Math.max(b.offsetWidth,30),h=Math.max(b.offsetHeight,12);
      var txt=b.textContent.trim();
      var cv=document.createElement('canvas');
      cv.width=w*2;cv.height=h*2;
      var ctx=cv.getContext('2d');
      ctx.scale(2,2);
      // 배경 (연분홍)
      ctx.fillStyle='rgba(252,235,235,0.6)';ctx.fillRect(0,0,w,h);
      // blur 텍스트
      ctx.filter='blur(8px)';
      ctx.fillStyle='#555';
      ctx.font='11px sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(txt,w/2,h/2);
      var img=new Image();
      img.src=cv.toDataURL('image/png');
      img.style.cssText='width:'+w+'px;height:'+h+'px;vertical-align:middle;display:inline-block';
      blurCanvas.push({el:b,html:b.innerHTML,st:b.getAttribute('style')||''});
      b.innerHTML='';b.appendChild(img);b.style.filter='none';
    }catch(e){}
  });
  // textarea(이벤트/목표 메모)를 canvas로 직접 렌더링 → 이미지로 교체
  // (html2canvas가 한글+커스텀폰트 여러 줄을 겹쳐 그리는 버그 회피. 줄 간격을 픽셀로 직접 통제)
  const taSwap=[];
  el.querySelectorAll('textarea').forEach(function(ta){
    var cs=window.getComputedStyle(ta);
    var w=ta.offsetWidth||120;
    var fontSize=parseFloat(cs.fontSize)||13;
    var lineH=Math.round(fontSize*1.65);
    var padL=8,padT=6;
    var innerW=Math.max(w-padL*2,20);
    var fontStr=(cs.fontStyle||'normal')+' '+(cs.fontWeight||'400')+' '+fontSize+'px '+(cs.fontFamily||'sans-serif');
    var mcv=document.createElement('canvas');var mctx=mcv.getContext('2d');mctx.font=fontStr;
    // 줄바꿈: \n 우선, 그 다음 글자 단위 폭 줄바꿈
    var lines=[];
    (ta.value||'').split('\n').forEach(function(rl){
      if(rl===''){lines.push('');return;}
      var cur='';
      for(var i=0;i<rl.length;i++){
        var test=cur+rl[i];
        if(mctx.measureText(test).width>innerW && cur!==''){lines.push(cur);cur=rl[i];}
        else cur=test;
      }
      lines.push(cur);
    });
    if(lines.length===0)lines=[''];
    var totalH=Math.max(ta.offsetHeight||30, padT*2+lines.length*lineH);
    var cv=document.createElement('canvas');
    cv.width=Math.round(w*2);cv.height=Math.round(totalH*2);
    var ctx=cv.getContext('2d');ctx.scale(2,2);
    var bg=cs.backgroundColor;
    ctx.fillStyle=(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')?bg:'#ffffff';
    ctx.fillRect(0,0,w,totalH);
    ctx.font=fontStr;ctx.fillStyle=cs.color||'#333';ctx.textBaseline='top';ctx.textAlign='left';
    lines.forEach(function(ln,idx){ctx.fillText(ln,padL,padT+idx*lineH);});
    var img=document.createElement('img');
    img.src=cv.toDataURL('image/png');
    img.style.cssText='width:'+w+'px;height:'+totalH+'px;display:inline-block;vertical-align:top';
    taSwap.push({ta:ta,img:img});
    ta.parentNode.insertBefore(img,ta);
    ta.style.display='none';
  });
  setTimeout(function(){
    // 부모(#long 등)에 zoom:1.25가 걸려 있어 scrollWidth(줌 미반영)만 쓰면 딱 1/1.25 만큼 잘림.
    // getBoundingClientRect 는 zoom 이 반영된 실제 그려지는 폭을 준다(MDN).
    var _r=el.getBoundingClientRect?el.getBoundingClientRect():null;
    var _zoom=(_r&&el.offsetWidth>0)?(_r.width/el.offsetWidth):1;
    if(!(_zoom>0)||!isFinite(_zoom))_zoom=1;
    var capW=Math.ceil(Math.max((_r&&_r.width)||0,Math.max(fullW,el.scrollWidth,1)*_zoom));
    var capScale=2;if(capW*capScale>16384)capScale=Math.max(1,Math.min(2,Math.floor(16384/capW*10)/10)); // 캔버스 크기 한계 방어(하한 1배)
    html2canvas(el,{scale:capScale,backgroundColor:"#ffffff",useCORS:true,allowTaint:true,logging:false,foreignObjectRendering:false,width:capW,windowWidth:Math.max(capW,document.documentElement.clientWidth||0)})
    .then(function(canvas){
      // 복원
      capRestore();
      blurCanvas.forEach(function(x){x.el.innerHTML=x.html;if(x.st)x.el.setAttribute('style',x.st);else x.el.removeAttribute('style');});
      taSwap.forEach(function(x){x.ta.style.display='';if(x.img.parentNode)x.img.parentNode.removeChild(x.img);});
      hiddenBtns.forEach(function(x){x.el.style.visibility=x.vis;x.el.style.width=x.w;x.el.style.overflow=x.ov;x.el.style.padding=x.p;});
      canvas.toBlob(function(blob){
        if(!blob){btn.textContent="표 복사";btn.disabled=false;return;}
        if(navigator.clipboard&&window.ClipboardItem){
          navigator.clipboard.write([new ClipboardItem({"image/png":blob})])
            .then(function(){btn.textContent="복사됨!";btn.disabled=false;setTimeout(function(){btn.textContent="표 복사";},2000);})
            .catch(function(){fallbackDownload(canvas,btn);});
        }else{fallbackDownload(canvas,btn);}
      },"image/png");
    }).catch(function(err){
      capRestore();
      blurCanvas.forEach(function(x){x.el.innerHTML=x.html;if(x.st)x.el.setAttribute('style',x.st);else x.el.removeAttribute('style');});
      taSwap.forEach(function(x){x.ta.style.display='';if(x.img.parentNode)x.img.parentNode.removeChild(x.img);});
      hiddenBtns.forEach(function(x){x.el.style.visibility=x.vis;x.el.style.width=x.w;x.el.style.overflow=x.ov;x.el.style.padding=x.p;});
      btn.textContent="표 복사";btn.disabled=false;
    });
  },60);
}

function fallbackDownload(canvas,btn){
  const a=document.createElement("a");a.download="richsister_roadmap.png";a.href=canvas.toDataURL("image/png");a.click();
  btn.textContent="저장됨!";btn.disabled=false;setTimeout(()=>btn.textContent="표 복사",2000);
}

// ── 답변 복사 ─────────────────────────────────────────
/* ── 회고 복사 공통: 서식(굵게) 있는 HTML + 일반 텍스트 동시 복사 ── */
function _cpBr(s){return dlEsc(s).split('\n').join('<br>');}
function monthDdRefCopy(ymKey){
  var r=monthReviewOf(ymKey+'-01');
  var items=[['잘한 점',r.carrot],['아쉬운 점',r.whip],['베스트',r.best],['워스트',r.worst]];
  var txt='',html='';
  items.forEach(function(it){
    var v=(it[1]||'').toString().trim();if(!v)return;
    txt+=it[0]+' | '+v+'\n';
    html+='<div>'+dlEsc(it[0])+' | <b>'+_cpBr(v)+'</b></div>';
  });
  if(!txt)return null;
  return {txt:'[ 이 달의 지출 되돌아보기 ]\n\n'+txt+'\n',
          html:'<div><b>[ 이 달의 지출 되돌아보기 ]</b></div><div><br></div>'+html+'<div><br></div>'};
}
function copyRich(txt,html,done){
  var fin=function(){if(done)done();};
  function legacy(){try{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}catch(e){}fin();}
  function plain(){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(fin,legacy);else legacy();}
  try{
    if(navigator.clipboard&&navigator.clipboard.write&&window.ClipboardItem&&window.Blob){
      navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([txt],{type:'text/plain'})})]).then(fin,plain);
      return;
    }
  }catch(e){}
  plain();
}
function copyAnswers(){
  const y=g("monthYear").value,m=g("monthMonth").value;
  var head="RICHSISTER 부자언니 로드맵 — "+y+"년 "+m+"월 회고";
  var line="─".repeat(40);
  let t=head+"\n"+line+"\n\n";
  let h='<div style="font-size:14px;line-height:1.75"><div><b>'+dlEsc(head)+'</b></div><div>'+line+'</div><div><br></div>';
  var dd=monthDdRefCopy(getMonthKey());
  if(dd){t+=dd.txt;h+=dd.html;}
  document.querySelectorAll(".qs").forEach(s=>{
    var sec=s.querySelector(".qst").textContent;
    t+="[ "+sec+" ]\n\n";
    h+='<div><b>[ '+dlEsc(sec)+' ]</b></div><div><br></div>';
    s.querySelectorAll(".qb").forEach(b=>{const q=b.querySelector(".qa").dataset.q,a=b.querySelector(".qa").value.trim();if(a){t+="Q. "+q+"\nA. "+a+"\n\n";h+='<div>Q. '+dlEsc(q)+'</div><div>A. <b>'+_cpBr(a)+'</b></div><div><br></div>';}});
  });
  h+='</div>';
  if(t.indexOf("Q. ")<0&&!dd){showToast("작성된 답변이 없어요");return;}
  var btn=(typeof event!=="undefined"&&event)?event.currentTarget:null;
  copyRich(t,h,function(){if(btn){btn.textContent="복사됨!";setTimeout(()=>btn.textContent="전체 복사",2000);}});
}

// ── 월간 회고 ─────────────────────────────────────────
function initMonthlySelectors(){
  const ySel=g("monthYear"),mSel=g("monthMonth");
  if(!ySel.options.length){
    const now=new Date();const cy=now.getFullYear(),cm=now.getMonth()+1;
    for(let y=2024;y<=2035;y++){const o=document.createElement("option");o.value=y;o.textContent=y+"년";if(y===cy)o.selected=true;ySel.appendChild(o);}
    for(let m=1;m<=12;m++){const o=document.createElement("option");o.value=m;o.textContent=m+"월";if(m===cm)o.selected=true;mSel.appendChild(o);}
    loadMonthlyData();
  }
  renderMonthDdRef();
  updateYearRecapButtonState();
}
function getMonthKey(){return g("monthYear").value+"-"+String(g("monthMonth").value).padStart(2,"0");}
function renderMonthDdRef(){var _ddr=g("monthDdRef");if(_ddr)_ddr.innerHTML=monthDdRefHtml(getMonthKey());}
/* 월간 회고: 예전 저장본(19문항, 위치 기반)을 새 순서(21문항)로 이관 — 기존 답변 보존 */
function _migRetroArr(a){
  if(!Array.isArray(a)||a.length!==19)return a;
  var n=[];for(var i=0;i<21;i++)n[i]="";
  for(var i=0;i<14;i++)n[i]=a[i]||"";
  n[14]=a[15]||"";  /* 로드맵 수정 사항 */
  n[17]=a[17]||"";  /* 나에게 하고 싶은 말 */
  n[18]=a[14]||"";  /* 다음 달 핵심 행동 */
  n[19]=a[16]||"";  /* 계속 고민 중인 것 */
  n[20]=a[18]||"";  /* 이번 달 나를 칭찬한다면 */
  return n;         /* n[15],n[16] = 신규 문항 빈칸 */
}
function loadMonthlyData(){
  const key=getMonthKey();
  const saved=monthlyArchive[key];
  const tas=document.querySelectorAll(".qa");
  tas.forEach((t,i)=>{t.value=saved?saved[i]||"":"";ar(t);});
  setMonthStatus(saved?"저장된 기록 있음":"미작성",!!saved);
  renderMonthDdRef();
  renderHistoryList();
  updateYearRecapButtonState();
}
function saveMonthly(){
  const key=getMonthKey();
  monthlyArchive[key]=[...document.querySelectorAll(".qa")].map(t=>t.value);
  save();showToast("✓ "+g("monthYear").value+"년 "+g("monthMonth").value+"월 저장됨");
  setMonthStatus("저장됨",true);
  renderHistoryList();
  updateYearRecapButtonState();
}
/* 월간 회고 헤더의 상태 글자 */
function setMonthStatus(t,on){var s=g("monthStatus");if(!s)return;s.textContent=t;s.classList.toggle("on",on);}
function renderHistoryList(){
  const keys=Object.keys(monthlyArchive).sort().reverse();
  const el=g("historyList");
  if(el)el.innerHTML="";
  const dl=g("monthHistoryList");
  if(!dl)return;
  if(!keys.length){
    dl.innerHTML="<div style='padding:12px;font-size:13px;color:var(--gray);text-align:center'>저장된 기록 없음</div>";
    return;
  }
  dl.innerHTML="";
  keys.forEach(function(k){
    const ans=monthlyArchive[k];
    const parts=k.split("-");const y=parts[0],m=parts[1];
    const label=y+"년 "+parseInt(m)+"월";
    const hasData=ans&&ans.some(function(a){return a&&a.trim();});
    const div=document.createElement("div");
    div.style.cssText="padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--tbl-border);display:flex;justify-content:space-between;align-items:center";
    div.onmouseover=function(){this.style.background="var(--ac-light)";};
    div.onmouseout=function(){this.style.background="";};
    div.innerHTML="<span style='font-size:13px;font-weight:600'>"+label+"</span>"
      +"<span style='font-size:13px;color:var(--ac)'>"+(hasData?"보기 →":"빈 기록")+"</span>";
    div.onclick=function(){viewMonthModal(k);};
    dl.appendChild(div);
  });
}
function toggleMonthHistory(){
  const drop=g("monthHistoryDrop");
  if(!drop)return;
  const open=drop.style.display==="block";
  drop.style.display=open?"none":"block";
  if(!open){
    renderHistoryList();
    setTimeout(function(){
      function _c(e){
        if(!drop.contains(e.target)&&e.target.id!=="historyToggleBtn"){
          drop.style.display="none";
          document.removeEventListener("click",_c);
        }
      }
      document.addEventListener("click",_c);
    },0);
  }
}
function viewMonthModal(key){
  const parts=key.split("-");const y=parts[0],m=parts[1];
  const ans=monthlyArchive[key]||[];
  const modal=g("monthViewModal");
  if(!modal)return;
  const drop=g("monthHistoryDrop");
  if(drop)drop.style.display="none";
  g("monthViewTitle").textContent=y+"년 "+parseInt(m)+"월 회고";
  // 이전/다음 네비
  const keys=Object.keys(monthlyArchive).sort().reverse();
  const ci=keys.indexOf(key);
  const nav=g("monthViewNav");nav.innerHTML="";
  if(ci<keys.length-1){
    var bp=document.createElement("button");
    bp.className="btn btn-ol";bp.style.fontSize="11px";bp.style.padding="2px 8px";
    bp.textContent="◀ 이전";
    bp.onclick=(function(k){return function(){viewMonthModal(k);};})(keys[ci+1]);
    nav.appendChild(bp);
  }
  if(ci>0){
    var bn=document.createElement("button");
    bn.className="btn btn-ol";bn.style.fontSize="11px";bn.style.padding="2px 8px";
    bn.textContent="다음 ▶";
    bn.onclick=(function(k){return function(){viewMonthModal(k);};})(keys[ci-1]);
    nav.appendChild(bn);
  }
  // Q&A 내용 렌더
  var html="";var qi=0;
  document.querySelectorAll(".qs").forEach(function(sec){
    var st=sec.querySelector(".qst");
    html+="<div style='font-size:13px;font-weight:700;color:var(--ac);margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--tbl-border)'>"+(st?st.textContent:"")+"</div>";
    sec.querySelectorAll(".qb").forEach(function(qb){
      var qt=qb.querySelector(".qt");
      var a=ans[qi]||"";
      html+="<div style='margin-bottom:12px'>"
        +"<div style='font-size:13px;color:var(--gray);margin-bottom:4px'>"+(qt?qt.textContent.trim():"")+"</div>"
        +"<div style='font-size:13px;line-height:1.6;white-space:pre-wrap;padding:8px 12px;background:var(--ac-light);border-radius:4px;min-height:32px'>"+(a?"<span>"+a.replace(/</g,"&lt;")+"</span>":"<span style='color:var(--gray);font-style:italic'>미작성</span>")+"</div>"
        +"</div>";
      qi++;
    });
  });
  g("monthViewBody").innerHTML=html;
  modal.dataset.key=key;
  modal.style.display="flex";
}
function closeMonthModal(){
  var m=g("monthViewModal");if(m)m.style.display="none";
}
function copyMonthView(){
  var modal=g("monthViewModal");if(!modal)return;
  var key=modal.dataset.key;
  var parts=key.split("-");var y=parts[0],m=parts[1];
  var ans=monthlyArchive[key]||[];
  var qs=[].slice.call(document.querySelectorAll(".qa"));
  var head=y+"년 "+parseInt(m)+"월 회고";
  var line="─".repeat(30);
  var t=head+"\n"+line+"\n\n";
  var h='<div style="font-size:14px;line-height:1.75"><div><b>'+dlEsc(head)+'</b></div><div>'+line+'</div><div><br></div>';
  var dd=monthDdRefCopy(key);
  if(dd){t+=dd.txt;h+=dd.html;}
  qs.forEach(function(q,i){if(q.dataset.q&&ans[i]&&ans[i].trim()){t+="Q. "+q.dataset.q+"\nA. "+ans[i].trim()+"\n\n";h+='<div>Q. '+dlEsc(q.dataset.q)+'</div><div>A. <b>'+_cpBr(ans[i].trim())+'</b></div><div><br></div>';}});
  h+='</div>';
  copyRich(t,h,function(){showToast("복사됐어요");});
}



// ── 프로젝트 모달 ─────────────────────────────────────
function openProjModal(){renderPOpts();g("pMod").classList.add("open");}
function renderPOpts(){
  const accessible=userGrade?allP().filter(p=>canAccess(p)):allP();
  const inaccessible=userGrade?allP().filter(p=>!canAccess(p)):[];
  function mkRow(p,dim){
    const chk=SP.find(s=>s.id===p.id)?"checked":"";
    const style=dim?"style='opacity:.5'":"";
    const nick=p.nick?` <span style="color:var(--gray);font-size:13px">/ ${dlEsc(p.nick)}</span>`:"";
    const rn=p.rateNote?`<span style="font-size:13px;color:var(--ac);margin:0 4px">${dlEsc(p.rateNote)}</span>`:"";
    const pd=p.period?`<span style="font-size:13px;color:var(--gray);flex-shrink:0">${dlEsc(p.period)}</span>`:"";
    const _uNoEmpty=p.user&&(!p.no||p.no==='★');
    const noLbl=_uNoEmpty?`<span class='segtip' style='font-size:13px;color:var(--ac);margin-right:6px;white-space:nowrap' data-tip='내가 직접 추가한 프로젝트'>직접</span>`:`<span style='font-size:13px;color:var(--gray);margin-right:6px'>No.${dlEsc(p.no)}</span>`;
    const ub=p.user?`<span style='display:inline-flex;gap:4px;flex-shrink:0'><button type='button' class='segtip' data-tip='수정' onclick='event.preventDefault();event.stopPropagation();editUserProj(${p.id})' style='border:1px solid var(--border);background:#fff;border-radius:6px;padding:2px 7px;font-size:13px;cursor:pointer;white-space:nowrap'>✏️</button><button type='button' class='segtip' data-tip='완전 삭제' onclick='event.preventDefault();event.stopPropagation();deleteUserProj(${p.id})' style='border:1px solid var(--border);background:#fff;border-radius:6px;padding:2px 7px;font-size:13px;cursor:pointer;white-space:nowrap'>🗑️</button></span>`:"";
    return `<label class='popt' ${style}><input type='checkbox' ${chk} value='${p.id}' style='accent-color:var(--ac)'><span style='flex:1'>${noLbl}<strong>${dlEsc(p.name)}</strong>${nick}</span>${rn}${pd}${ub}</label>`;
  }
  let html="";
  if(userGrade&&inaccessible.length){
    html+=`<div style='font-size:13px;color:var(--gray);padding:7px 12px;border-bottom:1px solid var(--border)'>▼ 내 등급 참여 가능 (${accessible.length}개)</div>`;
    html+=accessible.map(p=>mkRow(p,false)).join("");
    html+=`<div style='font-size:13px;color:#bbb;padding:7px 12px;border-top:1px solid var(--border);border-bottom:1px solid var(--border)'>▼ 참여 불가 (${inaccessible.length}개)</div>`;
    html+=inaccessible.map(p=>mkRow(p,true)).join("");
  }else{
    html=allP().map(p=>mkRow(p,false)).join("");
  }
  html+=`<div style='padding:12px 4px 2px;text-align:center'><button type='button' onclick='openUserProjModal()' style='border:1px dashed var(--ac);background:#fff;color:var(--ac);border-radius:99px;padding:7px 16px;font-size:14px;cursor:pointer;font-family:inherit;white-space:nowrap'>＋ 내 프로젝트 직접 추가</button></div>`;
  g("pOpts").innerHTML=html;
}

function applyP(){
  const cs=document.querySelectorAll("#pOpts input[type=checkbox]:checked");
  SP=Array.from(cs).map(c=>{const id=parseInt(c.value);return SP.find(s=>s.id===id)||{...allP().find(x=>x.id===id)};});
  renderSP();save();closeM("pMod");
}

/* ── 내 프로젝트 직접 추가 (사용자 정의 프로젝트) ── */
let upEditId=null; /* 편집 중인 내 프로젝트 id (null=새로 추가) */
function upNextId(){var m=10000;userProjects.forEach(function(p){if(p.id>m)m=p.id;});return m+1;}
function upTypeChange(){var el=document.querySelector('input[name=upType]:checked');var t=el?el.value:'normal';g('upNormalBox').style.display=(t==='short')?'none':'';g('upShortBox').style.display=(t==='short')?'':'none';if(t==='short')upRenderRates();}
function upRenderRates(){var n=parseInt(g('upMonths').value,10)||0;if(n>24)n=24;var box=g('upRates');var old=[];box.querySelectorAll('input').forEach(function(inp,i){old[i]=inp.value;});var h='';for(var k=0;k<n;k++){h+="<span style='display:inline-flex;align-items:center;gap:3px;white-space:nowrap'><span style='font-size:13px;color:var(--gray)'>"+(k+1)+"월차</span><input type='number' min='0' max='50' step='0.1' id='upRate_"+k+"' style='width:58px;margin-bottom:0' value='"+(old[k]!=null?old[k]:'')+"'><span style='font-size:13px;color:var(--gray)'>%</span></span>";}box.innerHTML=h?("<div style='display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 14px'>"+h+"</div>"):'';}
function openUserProjModal(pid){
  upEditId=pid||null;
  var p=pid?(allP().find(function(x){return x.id===pid;})||null):null;
  var isCat=!!(p&&!p.user);   /* 공식 카탈로그 프로젝트 → 원본 대신 덮어쓰기(projOverride)에 저장 */
  var isShort=!!(p&&(p.termMonths||0)>0);
  g('upTitle').textContent=p?(isCat?'프로젝트 수정':'내 프로젝트 수정'):'내 프로젝트 직접 추가';
  g('upOkBtn').textContent=p?'저장':'추가';
  g('upNo').value=(p&&p.no&&p.no!=='★')?p.no:'';
  g('upName').value=p?p.name:'';
  g('upNick').value=(p&&p.nick)?p.nick:'';
  document.querySelector('input[name=upType][value=normal]').checked=!isShort;
  document.querySelector('input[name=upType][value=short]').checked=isShort;
  g('upRate').value=(p&&!isShort&&p.rate)?p.rate:'';
  g('upMonths').value=isShort?p.termMonths:'';
  g('upStart').value=isShort?shortStartDate(p):'';
  var _cn=g('upCatNote');if(_cn)_cn.style.display=isCat?'':'none';
  var _rb=g('upResetBtn');if(_rb)_rb.style.display=(isCat&&projOverride[pid])?'':'none';
  var _mb=g('upMatBonus');if(_mb)_mb.checked=!!projBonusOn[pid];
  var _ow=g('upOwner');if(_ow)_ow.value=(pid?projOwnerOf(pid):'');
  var _mm=g('upMemo');if(_mm)_mm.value=(pid?(projMemo[pid]||''):'');
  var _ic=g('upInclude');if(_ic)_ic.checked=(pid?projIncluded(pid):true);
  upTypeChange();
  if(isShort){var _er=shortRates(p);upRenderRates();_er.forEach(function(r,k){var el=g('upRate_'+k);if(el&&r!=null&&r!=='')el.value=r;});}
  g('userProjModal').classList.add('open');
}
/* 공식 프로젝트 덮어쓰기 되돌리기 — 그 프로젝트 하나만(G1). 투자금·수익률칸·상환기록은 그대로 */
function resetProjOverride(){
  if(upEditId==null||!projOverride[upEditId])return;
  rsConfirm('이 프로젝트를 원래 공지 내용으로 되돌릴까요?\n(투자 금액·수익률 입력칸·상환 기록은 그대로 남아요)',function(){
    delete projOverride[upEditId];
    save();renderSP();renderPOpts();renderShort();
    try{recalc();}catch(_){}
    if(typeof renderMoIncome==='function')try{renderMoIncome(dailyDate||todayStr());}catch(_){}
    closeM('userProjModal');showToast('원래대로 되돌렸어요');
  });
}
function confirmUserProj(){
  var name=(g('upName').value||'').trim();
  if(!name){alert('프로젝트 이름을 입력해 주세요.');return;}
  var tEl=document.querySelector('input[name=upType]:checked');var t=tEl?tEl.value:'normal';
  var _base=(upEditId!=null)?(allP().find(function(x){return x.id===upEditId;})||null):null;
  var _own=(g('upOwner')?(g('upOwner').value||'').trim():'');
  var _memo=(g('upMemo')?(g('upMemo').value||'').trim():'');
  var _isCat=!!(_base&&!_base.user);
  var rate=0,n=0,rates=[],start='';
  if(t==='short'){
    n=parseInt(g('upMonths').value,10)||0;
    if(!(n>=1)){alert('운용 개월 수를 입력해 주세요.');return;}
    for(var k=0;k<n;k++){var el=g('upRate_'+k);rates.push(el?(parseFloat(el.value)||0):0);}
    start=g('upStart').value||'';
  }else{
    rate=parseFloat(g('upRate').value)||0;
    /* 공식 프로젝트는 비워두면 내 등급 기준을 그대로 쓴다 */
    if(!(rate>0)&&!_isCat){alert('연 수익률(%)을 입력해 주세요.');return;}
  }
  if(_isCat){ /* 원본 카탈로그는 건드리지 않고 덮어쓰기만 기록 */
    var ov={name:name,nick:(g('upNick').value||'').trim()};
    var _no=(g('upNo').value||'').trim();if(_no&&_no!=='★')ov.no=_no;
    if(t==='short'){ov.termMonths=n;ov.monthlyRates=rates;ov.fixedRate=false;ov.rate=0;
      if(!projSchedule[upEditId])projSchedule[upEditId]={start:'',rates:[]};
      projSchedule[upEditId].start=start;projSchedule[upEditId].rates=[]; /* 월차 수익률의 기준값은 방금 입력한 값 하나로 */
    }else{ov.termMonths=0;ov.monthlyRates=[];ov.fixedRate=(rate>0);ov.rate=rate;}
    projOverride[upEditId]=ov;
    if(g('upMatBonus')&&g('upMatBonus').checked)projBonusOn[upEditId]=true;else delete projBonusOn[upEditId];
    if(_own)projOwner[upEditId]=_own;else delete projOwner[upEditId];
    if(_memo)projMemo[upEditId]=_memo;else delete projMemo[upEditId];
    if(g('upInclude')&&!g('upInclude').checked)projInclude[upEditId]=false;else delete projInclude[upEditId];
    var _si2=SP.findIndex(function(x){return x.id===upEditId;});
    if(_si2>=0)SP[_si2]={...(allP().find(function(x){return x.id===upEditId;}))};
    renderSP();renderPOpts();renderShort();
    try{recalc();}catch(_){}
    if(typeof renderMoIncome==='function')try{renderMoIncome(dailyDate||todayStr());}catch(_){}
    save();closeM('userProjModal');return;
  }
  var p;
  if(upEditId!=null){p=userProjects.find(function(x){return x.id===upEditId;});if(!p){closeM('userProjModal');return;}}
  else{p={id:upNextId(),user:true,no:'',minGrade:'rs'};userProjects.push(p);}
  p.name=name;
  p.no=(g('upNo').value||'').trim();if(p.no==='★')p.no='';
  p.nick=(g('upNick').value||'').trim();
  if(t==='short'){
    p.termMonths=n;p.monthlyRates=rates;delete p.fixedRate;delete p.rate;
    if(!projSchedule[p.id])projSchedule[p.id]={start:'',rates:[]};
    projSchedule[p.id].start=start;projSchedule[p.id].rates=[];
  }else{
    p.fixedRate=true;p.rate=rate;delete p.termMonths;delete p.monthlyRates;delete projSchedule[p.id];
  }
  if(g('upMatBonus')&&g('upMatBonus').checked)projBonusOn[p.id]=true;else delete projBonusOn[p.id];
  if(_own)projOwner[p.id]=_own;else delete projOwner[p.id];
  if(_memo)projMemo[p.id]=_memo;else delete projMemo[p.id];
  if(g('upInclude')&&!g('upInclude').checked)projInclude[p.id]=false;else delete projInclude[p.id];
  var si=SP.findIndex(function(x){return x.id===p.id;});
  if(si>=0)SP[si]={...p};else SP.push({...p}); /* 추가 즉시 선택 목록에 반영 */
  renderSP();renderPOpts();renderShort();
  try{recalc();}catch(_){}
  if(typeof renderMoIncome==='function')try{renderMoIncome(dailyDate||todayStr());}catch(_){}
  save();closeM('userProjModal');
}
function editUserProj(pid){openUserProjModal(pid);}
function deleteUserProj(pid){
  var p=userProjects.find(function(x){return x.id===pid;});if(!p)return;
  if(!confirm('「'+p.name+'」 프로젝트를 완전히 삭제할까요?\n(투자금·수익률·상환 기록도 함께 지워져요)'))return;
  userProjects=userProjects.filter(function(x){return x.id!==pid;});
  SP=SP.filter(function(x){return x.id!==pid;});
  delete projInvest[pid];delete projRates[pid];delete projSchedule[pid];delete projTerm[pid];delete projRepay[pid];delete projEarly[pid];delete projAssetHide[pid];delete projOverride[pid];delete projBonus[pid];delete projBonusOn[pid];delete projRateStep[pid];delete projRateStepOn[pid];delete projAddInv[pid];delete projExtRateOn[pid];delete projExtRate[pid];delete projExtFrom[pid];delete projOwner[pid];delete projInclude[pid];delete projMemo[pid];
  renderSP();renderPOpts();renderShort();
  if(typeof renderMoIncome==='function')try{renderMoIncome(dailyDate||todayStr());}catch(_){}
  save();
}

let userGrade=null;
let projInvest={};
let projRates={};
let projSchedule={}; /* 단기딜: {id:{start:'YYYY-MM',rates:[월차별%]}} */
let projTerm={}; /* 운용기간 직접입력(일 단위): {id:{start:'YYYY-MM-DD',end:'YYYY-MM-DD'}} — 단기로드맵에 일할 비례 반영 */
let projRepay={}; /* 일부 상환: {id:[{from:'YYYY-MM',principal:만원,rate:%|''}]} — 그 정산월부터 남은 원금·수익률로 프로젝트 이자 감소 */
let projEarly={}; /* 조기상환: {id:'YYYY-MM-DD'} — 그 정산월만 일할 계산(초일·상환일 포함), 이후 수익 0 */
let projAssetHide={}; /* 만기·조기상환 자산 정리: {id:true} — 사용자가 「정리」로 확정한 항목만 자산에서 제외 */
let projOverride={}; /* 공식 카탈로그 프로젝트 덮어쓰기: {id:{no,name,nick,rate,fixedRate,termMonths,monthlyRates}} — 원본 APS는 불변, allP()에서만 입힌다 */
let projBonus={}; /* 추가 수익률 구간들: {id:[{at:'mat'|N(개월차),pct:%}]} — 자연 만기(조기상환 없이) 또는 지정 운용월차에 그 정산월 원금 기준 1회만 추가, 일할 금지(§2.5 동일 원칙) */
let projExtRateOn={};    /* 연장 수익률 옵션 사용 여부: {id:true} (세션 60) */
let projExtRate={};      /* 연장 수익률(%): 적용 시작 정산월부터 이 값이 최종 — 연 인상을 더 얹지 않는다 */
let projExtFrom={};      /* 연장 수익률 적용 시작 'YYYY-MM' — 비어 있으면 미적용 */
let projRateStep={};     /* 연 수익률 인상폭(%p/년): {id:1} — 시작 정산월 기준 12개월마다 누적 가산(세션 59) */
let projRateStepOn={};   /* 연 수익률 인상 옵션 사용 여부: {id:true} — 켜야 카드에 입력칸이 보인다(만기 보너스와 같은 방식) */
let projAddInv={};       /* 추가 투자 기록: {id:[{from:'YYYY-MM',amount:만원}]} — 그 정산월부터 원금에 더한다(일할 없음) */
let projBonusOn={}; /* 추가 수익률 옵션 사용 여부: {id:true} — 생성/수정 모달에서 켜야 카드에 구간 목록이 보임(세션 57, 세션 75서 다중구간으로 확장) */
let projOwner={}; /* 명의: {id:'배우자'} — 빈 값/없음 = 내 명의. 표시·필터 전용이며 수익·자산·로드맵 계산엔 일절 참여하지 않는다(세션 57) */
let projMemo={}; /* 프로젝트 메모: {id:'세후 12%…'} — 계약 조건 등 자유 메모. 표시 전용이며 수익·자산·로드맵 계산엔 일절 참여하지 않는다(세션 58) */
let projInclude={}; /* 로드맵·자산 반영 여부: {id:false}만 저장(없으면 반영). 차단은 getMonthlyProjectWon·projCurrentPrincipalWon 두 관문뿐 — 프로젝트 탭(카드·누적·수령 달력·타임라인·요약)은 직접 호출이라 불변(세션 57 2차) */
let projSummaryPick=['inv','mo','cum','mat3']; /* 상단 요약 스트립에 띄울 지표 키(최대 4개) */
let projSummaryFamily=true; /* 요약 합산에 가족 명의(명의가 적힌 프로젝트)를 포함할지 — 목록 필터와는 별개 스위치 */
const WHIP_IMG='data:image/png;base64,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';
const RECAP_BOOK_IMG='data:image/png;base64,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';
function recapBookIconHtml(sz){return '<img src="'+RECAP_BOOK_IMG+'" alt="책" style="height:'+(sz||'1em')+';vertical-align:-3px">';}
const YEAR_ROLLUP_IMG='data:image/png;base64,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';
function yearRollupIconHtml(sz){return '<img src="'+YEAR_ROLLUP_IMG+'" alt="올해 모아보기" style="height:'+(sz||'1em')+';vertical-align:-3px">';}

function syncGradeBtns(){
  var _gs=g("gradeSelect");if(_gs)_gs.value=(userGrade||"");   /* 등급은 제목 줄의 드롭다운 하나. 미선택이면 「등급 선택」 그대로 — 고르지도 않은 등급이 골라진 것처럼 보이면 안 된다 */
}
function selectGrade(g2){
  userGrade=g2;
  syncGradeBtns();
  renderSP();
  renderPOpts();
  renderShort(); // 단기 프로젝트 수익 업데이트
  save();        // ★ 등급은 rs7에 저장된다 (누락돼 있었음 — 세션 44)
}

function getGradeOrder(g2){return {trinity:4,black:3,trs:2,rs:1}[g2]||0;}

function canAccess(proj){
  if(!userGrade)return true;
  const minG=proj.minGrade||'rs';
  return getGradeOrder(userGrade)>=getGradeOrder(minG);
}

const gradeRates={trinity:18,black:17,trs:16,rs:15};
function getEffectiveRate(p){
  // 항상 최신 APS 정의 참조 (저장된 SP가 구버전일 수 있음)
  var fresh=allP().find(function(x){return x.id===p.id;})||p;
  var r=projRates[fresh.id];
  if(r&&r>0)return r;
  if(fresh.fixedRate)return fresh.rate;
  if(fresh.gradeOverride&&userGrade&&fresh.gradeOverride[userGrade]!=null)
    return fresh.gradeOverride[userGrade];
  return userGrade?(gradeRates[userGrade]||fresh.rate):fresh.rate;
}
function setCustomRate(pid,val){
  projRates[pid]=val>0?val:null;
  saveSoon();  // 렌더링은 change(칸 이탈)에서, 저장은 입력 즉시
}
function bonusRowsHtml(id){
  var arr=(projBonus[id]&&projBonus[id].length)?projBonus[id]:[{at:'',pct:''}];
  return arr.map(function(r,idx){
    var isMat=(r.at==='mat');
    return "<span class='pe-f pe-pct' style='flex-wrap:wrap'>"
      +(idx===0?"<span class='lb' style='color:#c08a3e'>추가 수익률</span>":"")
      +"<label class='proj-ck' style='margin:0 2px 0 0'><input type='checkbox' style='accent-color:#c08a3e' "+(isMat?'checked':'')+" onchange='setBonusMat("+id+","+idx+",this.checked)'>만기</label>"
      +"<input type='number' min='1' max='360' step='1' style='width:14px' placeholder='1' value='"+(isMat?'':(r.at||''))+"' "+(isMat?'disabled':'')+" data-tip='이 운용월차(1부터)에 1회 추가' class='invest-input segtip' oninput='setBonusMonth("+id+","+idx+",this.value)'><span class='lb' style='color:#c08a3e'>개월차</span>"
      +"<input type='number' min='0' max='50' step='0.5' style='width:23px' placeholder='0' value='"+(r.pct||'')+"' class='invest-input segtip' data-tip='그 정산월 원금 기준 1회 추가되는 보너스 수익률(%)' oninput='setBonusPct("+id+","+idx+",this.value)'><span class='lb' style='color:#c08a3e'>%</span>"
      +"<button type='button' class='rm-btn segtip' data-tip='이 구간 삭제' onclick='delBonusRow("+id+","+idx+")'>×</button>"
      +(idx===arr.length-1?"<span class='segtip' data-tip='구간 추가' style='cursor:pointer;color:#c08a3e;font-weight:700;padding:0 4px' onclick='addBonusRow("+id+")'>+</span>":"")
      +"</span>";
  }).join('');
}
function _ensureBonus(pid){if(!projBonus[pid])projBonus[pid]=[];return projBonus[pid];}
function addBonusRow(pid){_ensureBonus(pid).push({at:'',pct:''});renderSP();save();}
function delBonusRow(pid,idx){var a=_ensureBonus(pid);a.splice(idx,1);renderSP();save();}
function setBonusMat(pid,idx,checked){var a=_ensureBonus(pid);if(a[idx])a[idx].at=checked?'mat':1;renderSP();save();}
function setBonusMonth(pid,idx,val){var a=_ensureBonus(pid);if(!a[idx])return;var n=parseInt(val,10);a[idx].at=(n>0)?n:1;saveSoon();}
function setBonusPct(pid,idx,val){var a=_ensureBonus(pid);if(!a[idx])return;var n=parseFloat(val);a[idx].pct=(n>0)?n:null;saveSoon();}
function projTermDefault(p){var fp=_freshP(p);var start='',end='';var ds=String(fp.date||'');var md=ds.match(/^(\d{2})\.(\d{2})\.(\d{2})/);if(md)start='20'+md[1]+'-'+md[2]+'-'+md[3];var pd=String(fp.period||'');if(!start){var ps=pd.match(/^(\d{2})\.(\d{2})\.(\d{2})/);if(ps)start='20'+ps[1]+'-'+ps[2]+'-'+ps[3];}var pe=pd.match(/~(\d{2})\.(\d{2})\.(\d{2})/);if(pe)end='20'+pe[1]+'-'+pe[2]+'-'+pe[3];return {start:start,end:end};}
function _termToDate(v,isEnd){if(!v)return '';if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;if(/^\d{4}-\d{2}$/.test(v)){if(isEnd){var y=parseInt(v.slice(0,4),10),m=parseInt(v.slice(5,7),10);return v+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0');}return v+'-01';}return '';}
function getProjTerm(p){var fp=_freshP(p);var d=projTermDefault(fp);var o=projTerm[fp.id]||{};var s=('start' in o)?o.start:d.start,e=('end' in o)?o.end:d.end;return {start:_termToDate(s,false),end:_termToDate(e,true)};}
function setProjStart(pid,val){if(!projTerm[pid])projTerm[pid]={};projTerm[pid].start=val||'';/* 저장·재계산은 change(invest-input) 리스너 */
  saveSoon();
}
function setProjEnd(pid,val){if(!projTerm[pid])projTerm[pid]={};projTerm[pid].end=val||'';/* 저장·재계산은 change(invest-input) 리스너 */
  saveSoon();
}
/* ── 카드 읽기 구역 (세션 58) — 숫자는 전부 실제 반영값(일부 상환·조기상환 포함) ── */
function projReadHtml(p){
  var fp=_freshP(p),isShort=(fp.termMonths||0)>0,i=projDayInfo(p),out=[];
  var mk=monthKey(todayStr()),y=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;

  var a=[];
  if(i.start&&i.end)a.push("운용 <span class='proj-date'>"+_projDate2(i.start)+'~'+_projDate2(i.end)+'</span>');
  else if(fp.period)a.push("운용 <span class='proj-date'>"+fp.period+'</span>');
  else if(fp.date)a.push("시작 <span class='proj-date'>"+fp.date+'</span>');
  var ts=projTermSummaryLine(p);
  if(a.length)out.push("<span class='proj-desktop-only'>"+a.concat(ts?[ts]:[]).join(' · ')+"</span><span class='proj-mobile-only'>"+a.join(' · ')+(ts?"<br><span class='proj-mobile-sub'>• "+ts+'</span>':'')+'</span>');

  var b=[];
  var _stp=projRateStepOn[p.id]?(parseFloat(projRateStep[p.id])||0):0;
  var _effNow=isShort?null:projEffAt(p,y,mi,0,getEffectiveRate(p)||0);
  var _rateNow=isShort?(getEffectiveRate(p)||0):_effNow.rate; // 상환·연장·연 인상까지 반영된 최종 적용 수익률
  var rate=isShort?shortSummaryText(fp):('수익률 <b>'+_rateNow+'%</b>'+((_stp>0&&_effNow&&!_effNow.fixed)?(' <span style="color:var(--ac)">(매년 +'+_stp+'%p)</span>'):''));
  b.push(rate);
  var mo=Math.round(projMonthWon(p,y,mi)||0);
  var monthly=mo>0?('월 수령 <span class=\'rv\'>'+mo.toLocaleString()+'원</span>'):'';
  if(monthly)b.push(monthly);
  var ci=projCumInfo(p);
  var cumulative=(ci&&!ci.unknown&&ci.won>0)?('누적 <span class=\'rv\'>'+ci.won.toLocaleString()+'원</span> ('+(ci.months>0?(ci.months+(isShort?'회차':'개월')+' · '):'')+'원금 대비 '+(Math.round(ci.pct*10)/10)+'%)'):'';
  if(cumulative)b.push(cumulative);
  if(b.length>1||mo>0)out.push("<span class='proj-desktop-only'>"+b.join(' · ')+"</span><span class='proj-mobile-only'>"+rate+(monthly?'<br><span class=\'proj-mobile-sub\'>• '+monthly+'</span>':'')+(cumulative?'<br><span class=\'proj-mobile-sub\'>• '+cumulative+'</span>':'')+'</span>');
  else if(!isShort&&ci&&ci.unknown)out.push("<span style='color:#c08a3e'>운용기간을 입력하면 누적 수익이 계산돼요</span>");

  var changes=[];
  (projRepay[p.id]||[]).forEach(function(r){
    var pw=parseFloat(r.principal)||0; if(!r.from||!(pw>0))return;
    changes.push({date:r.from,desktop:'일부 상환 <b>'+r.from+'</b>부터 남은 원금 '+pw.toLocaleString()+'만원 · '+_projRateAtMk(p,r.from)+'%',mobile:'일부 상환<br><span class="proj-mobile-sub">• <b>'+r.from+'</b>부터 남은 원금 '+pw.toLocaleString()+'만원 · '+_projRateAtMk(p,r.from)+'%</span>'});
  });
  if(projExtRateOn[p.id]&&(parseFloat(projExtRate[p.id])||0)>0&&/^\d{4}-\d{2}$/.test(projExtFrom[p.id]||''))
    changes.push({date:projExtFrom[p.id],desktop:'연장 <b>'+projExtFrom[p.id]+'</b>부터 수익률 '+projExtRate[p.id]+'% 최종',mobile:'연장<br><span class="proj-mobile-sub">• <b>'+projExtFrom[p.id]+'</b>부터 수익률 '+projExtRate[p.id]+'% 최종</span>'});
  (projAddInv[p.id]||[]).forEach(function(r){
    var aw=parseFloat(r.amount)||0; if(!r.from||!(aw>0))return;
    changes.push({date:r.from,desktop:'추가 투자 <b>'+r.from+'</b>부터 원금 +'+aw.toLocaleString()+'만원',mobile:'추가 투자<br><span class="proj-mobile-sub">• <b>'+r.from+'</b>부터 원금 +'+aw.toLocaleString()+'만원</span>'});
  });
  if(projEarly[p.id]){var ei=projEarlyInfo(p);
    changes.push({date:projEarly[p.id],desktop:'조기상환 <b>'+projEarly[p.id]+'</b>'+(ei?(' · '+ei.mk+'에 '+ei.amtWon.toLocaleString()+'원 입금 후 종료'):''),mobile:'조기상환<br><span class="proj-mobile-sub">• <b>'+projEarly[p.id]+'</b>'+ (ei?(' · '+ei.mk+'에 '+ei.amtWon.toLocaleString()+'원 입금 후 종료'):'')+'</span>'});}
  changes.sort(function(a,b){return a.date<b.date?-1:(a.date>b.date?1:0);});
  changes.forEach(function(change){out.push("<span class='proj-desktop-only'>"+change.desktop+"</span><span class='proj-mobile-only'>"+change.mobile+'</span>');});

  var fw=projFutureWon(p);
  if(fw.y1>0||fw.fut>0)out.push('앞으로 1년 <span class=\'rv\'>'+_projWonShort(fw.y1)+'</span> · 만기까지 '
    +(fw.unknown?'<span style="color:#c08a3e">만기 미정</span>':('<span class=\'rv\'>'+_projWonShort(fw.fut)+'</span>')));

  var mm=(projMemo[p.id]||'').trim();
  if(mm)out.push('메모 · '+dlEsc(mm));

  return out.map(function(t){return "<div class='proj-read'>"+t+"</div>";}).join('');
}
/* ── 카드 편집 구역 (기본 접힘) — 수정 가능한 항목은 전부 여기 모인다 ── */
var projEditOpen={};   /* 휘발성: 새로고침하면 모두 닫힌다(정렬·필터와 같은 취급) */
function toggleProjEdit(id){projEditOpen[id]=!projEditOpen[id];renderSP();}
function _projSyncSP(pid){var i=SP.findIndex(function(x){return x.id===pid;});
  if(i>=0){var f=allP().find(function(x){return x.id===pid;});if(f)SP[i]={...f};}}
function setProjBase(pid,k,v){
  v=(v||'').trim();
  var up=userProjects.find(function(x){return x.id===pid;});
  if(up){up[k]=v;}
  else{var ov=projOverride[pid]||(projOverride[pid]={});ov[k]=v;}
  _projSyncSP(pid);saveSoon();
}
function setProjOwnerVal(pid,v){v=(v||'').trim();if(v)projOwner[pid]=v;else delete projOwner[pid];saveSoon();}
function setProjMemoVal(pid,v){v=(v||'').trim();if(v)projMemo[pid]=v;else delete projMemo[pid];saveSoon();}
function _projAfterStruct(pid){_projSyncSP(pid);renderSP();renderPOpts();renderShort();
  try{recalc();}catch(_){}
  if(typeof renderMoIncome==='function')try{renderMoIncome(dailyDate||todayStr());}catch(_){}
  save();}
function setProjIncludeOn(pid,on){if(on)delete projInclude[pid];else projInclude[pid]=false;_projAfterStruct(pid);}
function setExtRateOn(pid,on){if(on)projExtRateOn[pid]=true;else{delete projExtRateOn[pid];delete projExtRate[pid];delete projExtFrom[pid];}_projAfterStruct(pid);}
function setExtRate(pid,val){
  var n=parseFloat(val);
  projExtRate[pid]=(n>0)?n:null;
  saveSoon();
}
function setExtFrom(pid,val){
  if(val)projExtFrom[pid]=val;else delete projExtFrom[pid];
  renderSP();save();
}
function setRateStepOn(pid,on){if(on)projRateStepOn[pid]=true;else{delete projRateStepOn[pid];delete projRateStep[pid];}_projAfterStruct(pid);}
function setRateStep(pid,val){
  var n=parseFloat(val);
  projRateStep[pid]=(n>0)?n:null;
  saveSoon();
}
function setBonusOn(pid,on){if(on){projBonusOn[pid]=true;if(!projBonus[pid]||!projBonus[pid].length)projBonus[pid]=[{at:'',pct:''}];}else{delete projBonusOn[pid];delete projBonus[pid];}_projAfterStruct(pid);}
function setProjMonthsInline(pid,v){
  var n=parseInt(v,10)||0; if(n<1)n=1; if(n>24)n=24;
  var up=userProjects.find(function(x){return x.id===pid;});
  if(up)up.termMonths=n;else{var ov=projOverride[pid]||(projOverride[pid]={});ov.termMonths=n;}
  _projAfterStruct(pid);
}
function setProjTypeInline(pid,t){
  var base=allP().find(function(x){return x.id===pid;}); if(!base)return;
  if(((base.termMonths||0)>0?'short':'normal')===t)return;
  var up=userProjects.find(function(x){return x.id===pid;});
  if(t==='short'){
    var n=(base.termMonths||0)>0?base.termMonths:3;
    if(up){up.termMonths=n;up.monthlyRates=base.monthlyRates||[];delete up.fixedRate;delete up.rate;}
    else{var ov=projOverride[pid]||(projOverride[pid]={});ov.termMonths=n;ov.monthlyRates=base.monthlyRates||[];ov.fixedRate=false;ov.rate=0;}
    if(!projSchedule[pid])projSchedule[pid]={start:'',rates:[]};
  }else{
    var r=parseFloat(projRates[pid])||parseFloat(base.rate)||0;
    if(up){up.fixedRate=true;up.rate=r;delete up.termMonths;delete up.monthlyRates;}
    else{var ov2=projOverride[pid]||(projOverride[pid]={});ov2.termMonths=0;ov2.monthlyRates=[];ov2.fixedRate=true;ov2.rate=r;}
  }
  _projAfterStruct(pid);
}
function projHasCustom(pid){return !!projOverride[pid]||(parseFloat(projRates[pid])||0)>0||!!projRateStepOn[pid]||!!projExtRateOn[pid]||!!projBonusOn[pid];}
function resetProjOverrideInline(pid){
  if(!projHasCustom(pid))return;
  rsConfirm('이 프로젝트를 원래 공지 내용으로 되돌릴까요?\n(투자 금액·수익률 입력칸·상환 기록은 그대로 남아요)',function(){
    delete projOverride[pid];_projAfterStruct(pid);showToast('원래대로 되돌렸어요');
  });
}
/* 연장 수익률 입력줄 — 옵션을 켠 일반 프로젝트에만. 종료일은 위 「운용 종료」에서 직접 늘린다. */
function extInputs(p){
  var id=p.id; if(!projExtRateOn[id])return "";
  var fr=projExtFrom[id]||'', rt=projExtRate[id];
  var okRt=(parseFloat(rt)||0)>0, okFr=/^\d{4}-\d{2}$/.test(fr);
  var _tmE=getProjTerm(p),_endMk=(_tmE&&_tmE.end)?monthKey(_tmE.end):'';
  return "<div class='pe-row'>"
    +"<span class='pe-f pe-date'><span class='lb'>연장 적용 시작</span>"
    +"<input type='month' value='"+fr+"' class='invest-input segtip' data-tip='이 달부터 연장 수익률이 최종으로 적용돼요' onchange='setExtFrom("+id+",this.value)'></span>"
    +"<span class='pe-f pe-pct'><span class='lb'>연장 수익률</span>"
    +"<input type='number' min='0' max='50' step='0.5' placeholder='0' value='"+(okRt?rt:'')+"' class='invest-input segtip' data-tip='연장하면서 확정된 수익률(%)§§등급에 따라 올려받은 값을 그대로 적으면 돼요§§이 값이 최종 — 연 인상은 더 붙지 않아요' oninput='setExtRate("+id+",this.value)'>"
    +"<span class='lb' style='color:var(--ac)'>%</span></span>"
    +((okRt&&okFr)?"<span class='monthly-return'>→ "+fr+"부터 "+rt+"% 최종 적용</span>"
      :(!okRt?"<span style='color:#c0392b;white-space:nowrap'>⚠ 연장 수익률을 입력해야 반영돼요</span>"
              :"<span style='color:#c0392b;white-space:nowrap'>⚠ 적용 시작월을 선택해야 반영돼요</span>"))
    +((okFr&&_endMk&&fr>_endMk)?"<span style='flex-basis:100%;color:#c0392b;word-break:keep-all'>⚠ 적용 시작이 운용기간 밖이에요 — 위 「운용 종료」를 연장한 날짜로 먼저 늘려주세요</span>":"")
    +"</div>";
}
function projEditBox(p){
  var fp=_freshP(p),isShort=(fp.termMonths||0)>0,inv=projInvest[p.id]||'',id=p.id;
  var isCat=!fp.user, txt=function(v){return dlEsc(v||'');};
  var h="<div class='proj-edit-box'>";
  h+="<div class='pe-grp'><div class='pe-row'>"
    +"<span class='pe-f pe-name'><span class='lb'>이름</span><input type='text' class='invest-input' value='"+txt(fp.name)+"' onchange='setProjBase("+id+",&#34;name&#34;,this.value)'></span>"
    +"<span class='pe-f pe-mid'><span class='lb'>별칭</span><input type='text' class='invest-input' value='"+txt(fp.nick)+"' onchange='setProjBase("+id+",&#34;nick&#34;,this.value)'></span>"
    +"<span class='pe-f pe-num'><span class='lb'>번호</span><input type='text' class='invest-input' value='"+txt((fp.no&&fp.no!=='★')?fp.no:'')+"' onchange='setProjBase("+id+",&#34;no&#34;,this.value)'></span>"
    +"</div>"
    +"<div class='pe-row'>"
    +"<span class='pe-f pe-mid'><span class='lb'>명의</span><input type='text' class='invest-input segtip' data-tip='비우면 내 명의' value='"+txt(projOwnerOf(id))+"' onchange='setProjOwnerVal("+id+",this.value)'></span>"
    +"<span class='pe-f pe-long'><span class='lb'>메모</span><input type='text' class='invest-input' placeholder='예) 세후 12% · 2년차부터 +1%' value='"+txt(projMemo[id])+"' onchange='setProjMemoVal("+id+",this.value)'></span>"
    +"</div></div>";
  h+="<div class='pe-grp'><div class='proj-ef'><span class='lb'>유형</span>"
    +"<label class='proj-ck'><input type='radio' name='pty"+id+"' style='accent-color:var(--ac)' "+(isShort?'':'checked')+" onchange='setProjTypeInline("+id+",&#34;normal&#34;)'>일반 (연 수익률)</label>"
    +"<label class='proj-ck'><input type='radio' name='pty"+id+"' style='accent-color:var(--ac)' "+(isShort?'checked':'')+" onchange='setProjTypeInline("+id+",&#34;short&#34;)'>단기딜 (월차별)</label>"
    +(isShort?("<span class='lb'>운용 개월</span><input type='number' min='1' max='24' step='1' class='invest-input' style='width:84px' value='"+(fp.termMonths||'')+"' onchange='setProjMonthsInline("+id+",this.value)'>"):"")
    +"</div>";
  var _preAbs=null;
  if(!isShort){
    var _rl=_repaySorted(id);
    if(_rl.length){var _rf=_rl[0].from;_preAbs=parseInt(_rf.slice(0,4),10)*12+(parseInt(_rf.slice(5,7),10)-1)-1;} // 첫 상환 적용월의 직전 달
    else{var _tk=monthKey(todayStr());_preAbs=parseInt(_tk.slice(0,4),10)*12+(parseInt(_tk.slice(5,7),10)-1);}
  }
  var _preRate=(_preAbs==null)?(getEffectiveRate(p)||0):projEffAt(p,Math.floor(_preAbs/12),_preAbs%12,0,getEffectiveRate(p)||0).rate;
  var _pre=isShort?'':calcMonthly(inv,_preRate);
  h+="<div class='pe-row'>"
    +"<span class='pe-f pe-num'><span class='lb'>투자 금액</span><input type='number' style='width:48px' class='invest-input' value='"+inv+"' placeholder='만원' oninput='updateInvest("+id+",this.value)'><span class='lb'>만원</span></span>"
    +(isShort?"":("<span class='pe-f pe-pct'><span class='lb'>수익률</span><input type='number' min='0' max='50' step='0.5' style='width:23px' placeholder='15' value='"+(projRates[id]||getEffectiveRate(p)||'')+"' data-tip='현재 적용 수익률 직접 입력§§(이 값이 최종 적용)' class='invest-input segtip' oninput='setCustomRate("+id+",parseFloat(this.value)||0)'><span class='lb' style='color:var(--ac)'>%</span></span>"))
    +((!isShort&&projRateStepOn[id])?("<span class='pe-f pe-pct'><span class='lb' style='color:var(--ac)'>연 인상</span><input type='number' min='0' max='20' step='0.5' style='width:23px' placeholder='0' value='"+(projRateStep[id]||'')+"' data-tip='운용 1년이 지날 때마다§§수익률에 더해지는 폭(%p)§§예) 12%에 +1 → 13% → 14%' class='invest-input segtip' oninput='setRateStep("+id+",this.value)'><span class='lb' style='color:var(--ac)'>%p</span></span>"):"")
    +(projBonusOn[id]?bonusRowsHtml(id):"")
    +(_pre?("<span class='pe-note'>상환 전 월 수익 "+_pre+"</span>"):"")
    +"</div>";
  h+=(isShort?shortInputs(fp):(projTermInputs(p)+extInputs(p)))+"</div>";
  h+="<div class='proj-ef'>"
    +"<label class='proj-ck segtip' data-tip='끄면 이 탭에서 관리만 하고§§로드맵·자산 합계엔 넣지 않아요' style='margin-right:14px'><input type='checkbox' style='accent-color:var(--ac)' "+(projIncluded(id)?'checked':'')+" onchange='setProjIncludeOn("+id+",this.checked)'>로드맵·자산에 반영</label>"
    +(isShort?"":("<label class='proj-ck segtip' data-tip='켜면 연 인상 입력칸이 나타나요§§1년마다 수익률이 오르는 계약에 써요' style='margin-right:14px'><input type='checkbox' style='accent-color:var(--ac)' "+(projRateStepOn[id]?'checked':'')+" onchange='setRateStepOn("+id+",this.checked)'>연 수익률 인상</label>"))
    +(isShort?"":("<label class='proj-ck segtip' data-tip='연장하면서 수익률이 바뀔 때 써요§§적은 값이 최종이라 연 인상은 더 붙지 않아요' style='margin-right:14px'><input type='checkbox' style='accent-color:var(--ac)' "+(projExtRateOn[id]?'checked':'')+" onchange='setExtRateOn("+id+",this.checked)'>연장 수익률</label>"))
    +"<label class='proj-ck segtip' data-tip='켜면 만기 또는 지정 개월차에 보너스 수익률을 추가할 수 있어요'><input type='checkbox' style='accent-color:#c08a3e' "+(projBonusOn[id]?'checked':'')+" onchange='setBonusOn("+id+",this.checked)'>추가 수익률</label></div>";
  var resetBtn=(isCat&&projHasCustom(id))?("<span class='ln-delx' style='margin-left:auto' onclick='resetProjOverrideInline("+id+")'>수정 내용 원래대로</span>"):'';
  h+=repayInputs(p,resetBtn);
  return h+"</div>";
}
function projTermInputs(p){var t=getProjTerm(p);
  return "<div class='pe-row'>"
    +"<span class='pe-f pe-date'><span class='lb'>운용 시작</span><input type='date' value='"+(t.start||'')+"' class='invest-input segtip' data-tip='운용 시작일' onchange='setProjStart("+p.id+",this.value)'></span>"
    +"<span class='pe-f pe-date'><span class='lb'>운용 종료</span><input type='date' value='"+(t.end||'')+"' class='invest-input segtip' data-tip='운용 종료일§§(이 날 이후 로드맵 수익 제외)' onchange='setProjEnd("+p.id+",this.value)'></span>"
    +"<span class='pe-hint'>종료일까지 로드맵에 반영돼요</span>"
    +"</div>";}
function calcMonthly(invest,rate){
  const n=parseFloat(invest)||0;
  if(!n)return "";
  const monthly=Math.round(n*10000*rate/100/12);  // 투자금 만원→원
  return monthly.toLocaleString()+"원";
}

function updateInvest(id,val){
  projInvest[id]=parseFloat(val)||0;
  saveSoon();  // 렌더링은 change(칸 이탈)에서, 저장은 입력 즉시
}
// 만기 임박 알림: 만기월(단기딜 마지막 회차월/운용 종료월)이 이번 달·다음 달인 딜 (조기상환·정리된 딜 제외)
function renderMatNotice(){
  var mn=g("projMatNotice"); if(!mn)return;
  var _mk=monthKey(todayStr());
  var cur=parseInt(_mk.slice(0,4),10)*12+(parseInt(_mk.slice(5,7),10)-1);
  var items=[];
  SP.forEach(function(p){
    if(projAssetHide[p.id]||projEarly[p.id])return;
    var fp=_freshP(p);var isS=(fp.termMonths||0)>0;var mat=null;
    if(isS){var sa=shortStartAbs(fp);if(sa==null)return;mat=sa+fp.termMonths;}
    else{var tm=getProjTerm(p);if(!tm.end)return;var ek=monthKey(tm.end);mat=parseInt(ek.slice(0,4),10)*12+(parseInt(ek.slice(5,7),10)-1);}
    if(mat===cur)items.push({nm:fp.name,when:"이번 달",isS:isS,won:projPrincipalAt(p,mat)});
    else if(mat===cur+1)items.push({nm:fp.name,when:"다음 달",isS:isS,won:projPrincipalAt(p,mat)});
  });
  mn.innerHTML=items.length?("<div style='background:var(--ac-light);border-left:3px solid var(--ac);border-radius:2px;padding:8px 12px;margin:10px 0;font-size:13px;color:#111;word-break:keep-all'>⏰&nbsp;<b style='color:var(--ac)'>만기 임박</b>"
    +items.map(function(it){return "<div style='margin-top:3px'>"+dlEsc(it.nm)+" — <span style='white-space:nowrap'>"+it.when+(it.isS?" 마지막 회차":" 만기")+"</span>"
      +(it.won>0?(" · <b style='white-space:nowrap'>원금 "+_projWonShort(it.won)+"</b>"):"")+"</div>";}).join("")
    +"</div>"):"";
}
// ── 완료(만기·조기상환) 프로젝트 분류 — 표시 전용. SP·계산은 그대로 (§프로젝트 완료 분류)
var projDoneOpen=false;
var projDoneEdit={};
function projDoneInfo(p){
  var st=projMaturityStatus(p);if(!st)return null;
  var when='',sk=0;
  if(st==='조기상환'){when=projEarly[p.id]||'';sk=when?parseInt(when.replace(/-/g,''),10):0;}
  else{var fp=_freshP(p);
    if((fp.termMonths||0)>0){var sa=shortStartAbs(fp);
      if(sa!=null){var abs=sa+fp.termMonths,y=Math.floor(abs/12),m=abs%12+1;when=y+'-'+('0'+m).slice(-2);sk=y*10000+m*100+31;}}
    else{var tm=getProjTerm(p);when=tm.end||'';sk=when?parseInt(when.replace(/-/g,''),10):0;}}
  return {status:st,when:when,sk:sk};
}
function projSplitSP(){var live=[],done=[];
  SP.forEach(function(p){var di=projDoneInfo(p);if(di)done.push({p:p,d:di});else live.push(p);});
  done.sort(function(a,b){return b.d.sk-a.d.sk;});
  return {live:live,done:done};
}
function toggleProjDone(){projDoneOpen=!projDoneOpen;renderSP();}
function toggleProjDoneCard(pid){var _on=!projDoneEdit[pid];projDoneEdit[pid]=_on;if(_on)projEditOpen[pid]=true;else delete projEditOpen[pid];projDoneOpen=true;renderSP();}
function projDoneMobileMetricsHtml(p){
  var principal=projPrincipalNow(p),ci=projCumInfo(p),out=[];
  if(principal>0)out.push("<span class='proj-done-mobile-metric'>원금 <b>"+Math.round(principal/10000).toLocaleString()+"만</b></span>");
  if(ci&&!ci.unknown&&ci.won>0){
    out.push("<span class='proj-done-mobile-metric'>누적 수익 <b>"+Math.round(ci.won/10000).toLocaleString()+"만</b></span>");
    out.push("<span class='proj-done-mobile-metric'><b>"+(Math.round(ci.pct*10)/10)+"%</b></span>");
  }
  return out.length?"<div class='proj-done-mobile-metrics'>"+out.join("<span class='proj-done-sep'>·</span>")+"</div>":'';
}
function projDoneCompactHtml(p,d){
  var inv=parseFloat(projInvest[p.id])||0,ci=projCumInfo(p);
  var nm=dlEsc(p.name)+(p.nick?(" <span style='font-size:13px;color:var(--gray);font-weight:400'>/ "+dlEsc(p.nick)+"</span>"):'');
  var badge="<span class='proj-done-badge' style='flex:0 0 auto;white-space:nowrap;font-size:12px;font-weight:600;color:var(--ac);background:var(--ac-light);border-radius:10px;padding:2px 9px'>"+d.status+(d.when?(' '+d.when):'')+"</span>";
  var meta=[];
  if(inv>0)meta.push("투자 원금 <b style='white-space:nowrap'>"+inv.toLocaleString()+"만원</b>");
  if(ci&&!ci.unknown&&ci.won>0)meta.push("누적 수익 <b style='color:var(--ac);white-space:nowrap'>"+ci.won.toLocaleString()+"원</b> · 원금 대비 "+(Math.round(ci.pct*10)/10)+"%");
  return "<div class='proj-row' data-done-pid='"+p.id+"' style='opacity:.85'>"
    +"<div class='proj-done-desktop'><div class='proj-row-header'>"
      +"<span class='proj-hd-mid' style='font-weight:700;font-size:14.5px;word-break:keep-all'>"+nm+"</span>"+badge
      +"<span class='proj-hd-act'><button class='btn btn-ol' style='white-space:nowrap;padding:3px 10px;font-size:12px' onclick='toggleProjDoneCard("+p.id+")'>수정</button>"
      +"<button class='rm-btn' onclick='rmP("+p.id+")'>×</button></span>"
    +"</div>"+(meta.length?("<div style='font-size:13px;color:var(--gray);word-break:keep-all;line-height:1.5'>"+meta.join(' · ')+"</div>"):'')+"</div>"
    +"<div class='proj-done-mobile'><div class='proj-done-mobile-head'><span class='proj-done-mobile-name'>"+nm+"</span><span class='proj-hd-act'><button class='btn btn-ol' style='white-space:nowrap;padding:3px 10px;font-size:12px' onclick='toggleProjDoneCard("+p.id+")'>수정</button><button class='rm-btn' onclick='rmP("+p.id+")'>×</button></span></div><div class='proj-done-mobile-status'>"+badge+"</div>"+projDoneMobileMetricsHtml(p)+"</div>"
  +"</div>";
}
function projDoneSection(doneArr){
  if(!doneArr||!doneArr.length)return '';
  var body=doneArr.map(function(it){
    if(projDoneEdit[it.p.id])return projCardHtml(it.p,"<button class='btn btn-ol' style='flex:0 0 auto;white-space:nowrap;padding:3px 10px;font-size:12px' onclick='toggleProjDoneCard("+it.p.id+")'>접기</button>");
    return projDoneCompactHtml(it.p,it.d);
  }).join('');
  return "<div style='margin-top:18px'>"
    +"<button type='button' onclick='toggleProjDone()' style='display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;background:none;border:0;border-top:1px solid var(--border);padding:12px 2px 8px;font-family:inherit;font-size:13px;font-weight:600;color:var(--gray);cursor:pointer;text-align:left'>"
      +"<span style='white-space:nowrap'>🍯&nbsp;완료 "+doneArr.length+"개</span>"
      +"<span style='white-space:nowrap;font-weight:400'>"+(projDoneOpen?'▴':'▾')+"</span></button>"
    +"<div id='projDoneBody' style='display:"+(projDoneOpen?'block':'none')+"'>"
      +"<p class='hint help-toggle' style='font-size:13px;color:#666;margin:0 0 10px;padding:6px 10px;background:var(--ac-light);border-left:3px solid var(--ac);border-radius:2px;word-break:keep-all'>💡&nbsp;<b>「수정」</b>을 누르면 투자금·수익률 등 원래 입력 내용을 그대로 보고 고칠 수 있어요.</p>"
      +body+"</div></div>";
}
/* ── 수익금 수령 달력 (rs_complete 전용) ───────────────────────────
   수령일 = 운용 시작일의 '일'을 매달, 첫 회는 시작 다음 달부터.
   주말·공휴일이면 다음 영업일(고정지출 납부일과 완전히 같은 nextBusinessDay 규칙).
   금액은 그 회차가 귀속된 정산월의 projMonthWon 그대로 — 일할 계산 안 함(§2.5). */
function projPayoutStart(p){var fp=_freshP(p);
  return ((fp.termMonths||0)>0)?shortStartDate(fp):((getProjTerm(p)||{}).start||'');}
function projPayoutsInMonth(y,m1){
  var out=[];
  SP.forEach(function(p){
    var sd=projPayoutStart(p);if(!sd)return;
    var day=parseInt(sd.slice(8,10),10)||1;
    for(var back=1;back>=0;back--){   /* 전달 기준일이 순연돼 이번 달로 넘어오는 경우까지 */
      var ry=y,rm=m1-back;if(rm<1){rm+=12;ry--;}
      var raw=effDueDate(ry,rm,day,false);
      var ds=nextBusinessDay(raw);
      if(parseInt(ds.slice(0,4),10)!==y||parseInt(ds.slice(5,7),10)!==m1)continue;
      var mk=monthKey(raw);
      var won=Math.round(projMonthWon(p,parseInt(mk.slice(0,4),10),parseInt(mk.slice(5,7),10)-1)||0);
      if(won<=0)continue;
      out.push({ds:ds,raw:raw,shifted:(ds!==raw),won:won,name:(_freshP(p).name||'')});
    }
  });
  out.sort(function(a,b){return a.ds<b.ds?-1:(a.ds>b.ds?1:0);});
  return out;
}
function projCalMove(step){
  var ym=renderProjCal._ym||todayStr().slice(0,7);
  var y=parseInt(ym.slice(0,4),10),m=parseInt(ym.slice(5,7),10)+step;
  while(m<1){m+=12;y--;}while(m>12){m-=12;y++;}
  renderProjCal._ym=y+'-'+String(m).padStart(2,'0');
  renderProjCal();
}
function projCalToday(){renderProjCal._ym=todayStr().slice(0,7);renderProjCal();}
function toggleProjCalPick(){renderProjCal._ymPick=!renderProjCal._ymPick;renderProjCal();}
function projCalPick(v){if(!/^\d{4}-\d{2}$/.test(v||''))return;renderProjCal._ym=v;renderProjCal._ymPick=false;renderProjCal();}
function toggleProjCal(){renderProjCal._open=(renderProjCal._open===false);renderProjCal();}
/* ===== 프로젝트 상단 요약 · 만기 타임라인 · 목록 필터 (세션 57 — 표시 전용, 새 계산 규칙 0개) =====
   전부 기존 함수(projMonthWon·projCumInfo·projStartAbsOf·getProjTerm·getEffectiveRate)를 읽기만 한다.
   로드맵·자산·누적 수익에는 어떤 경우에도 영향을 주지 않는다. */
function projOwnerOf(id){var v=projOwner[id];return (v==null?'':String(v).trim());}
/* 로드맵·자산에 반영할 프로젝트인가 — 기본 true(기존 데이터 완전 하위호환). 명의 자동 판정이 아니라 사용자가 고른다 */
function projIncluded(p){var id=(p&&typeof p==='object')?p.id:p;return projInclude[id]!==false;}
function projOwnerNames(){var seen={},out=[];SP.forEach(function(p){var n=projOwnerOf(p.id);if(n&&!seen[n]){seen[n]=1;out.push(n);}});out.sort();return out;}
/* ── 상태 3분류 · 만기 D-day (세션 58 · 표시 전용, 새 계산 규칙 0개) ──
   완료 판정은 기존 projDoneInfo(단일 진실 §2.5)를 그대로 쓰고 여기선 남은 일수만 센다.
   로드맵·자산·누적 수익에는 어떤 경우에도 영향을 주지 않는다. */
function _projAddMonths(ds,n){
  var y=parseInt(ds.slice(0,4),10),m=parseInt(ds.slice(5,7),10),d=parseInt(ds.slice(8,10),10);
  var t=(m-1)+n,ny=y+Math.floor(t/12),nm=((t%12)+12)%12;
  var last=new Date(ny,nm+1,0).getDate();
  return ny+'-'+String(nm+1).padStart(2,'0')+'-'+String(Math.min(d,last)).padStart(2,'0');
}
function _projDayDiff(a,b){
  var pa=new Date(parseInt(a.slice(0,4),10),parseInt(a.slice(5,7),10)-1,parseInt(a.slice(8,10),10));
  var pb=new Date(parseInt(b.slice(0,4),10),parseInt(b.slice(5,7),10)-1,parseInt(b.slice(8,10),10));
  return Math.round((pb-pa)/86400000);
}
function projStartDateOf(p){
  var fp=_freshP(p);
  if((fp.termMonths||0)>0)return shortStartDate(p)||'';
  var tm=getProjTerm(p);return (tm&&tm.start)||'';
}
function projEndDateOf(p){
  var fp=_freshP(p),e='';
  if((fp.termMonths||0)>0){var sd=shortStartDate(p);if(sd)e=_projAddMonths(sd,fp.termMonths);}
  else{var tm=getProjTerm(p);e=(tm&&tm.end)||'';}
  return e;
}
function projDayInfo(p){
  var di=projDoneInfo(p),t=todayStr(),s=projStartDateOf(p),e=projEndDateOf(p),early=false;
  var ed=projEarly[p.id];
  if(ed&&(!e||ed<e)){e=ed;early=true;}
  if(s&&e&&e<s)return {state:'날짜 확인!',start:s,end:e,dday:null,kind:'bad'};
  if(di)return {state:(di.status==='조기상환')?'조기상환':'만기완료',start:s,end:e,dday:null,kind:''};
  if(s&&t<s)return {state:'투자전',start:s,end:e,dday:_projDayDiff(t,s),kind:'start'};
  return {state:'운용중',start:s,end:e,dday:(e?_projDayDiff(t,e):null),kind:(early?'early':'end')};
}
function _projDdayBare(i){if(!i||i.dday==null)return '';return (i.dday===0)?'D-DAY':(i.dday>0?('D-'+i.dday):('D+'+(-i.dday)));}
function projDdayText(i){if(i&&i.kind==='bad')return '날짜 확인!';
  var b=_projDdayBare(i);if(!b)return '';
  /* 만기는 기본값이라 말없이 D-330 — 시작 전·조기상환일 때만 무엇까지인지 밝힌다 */
  return (i.kind==='start')?('시작 '+b):((i.kind==='early')?('상환 '+b):b);}
/* 운용기간(개월) — 시작~만기 사이의 온전한 개월 수 */
function _projMonthSpan(a,b){
  var m=(parseInt(b.slice(0,4),10)-parseInt(a.slice(0,4),10))*12+(parseInt(b.slice(5,7),10)-parseInt(a.slice(5,7),10));
  if(parseInt(b.slice(8,10),10)<parseInt(a.slice(8,10),10))m--;
  return m;
}
/* 카드 한 줄 요약 — 운용기간 · 정산일(§2.27 기준일 = 운용 시작일의 「일」) */
function projTermSummaryLine(p){
  var fp=_freshP(p),i=projDayInfo(p),out=[];
  var mo=((fp.termMonths||0)>0)?fp.termMonths:((i.start&&i.end)?_projMonthSpan(i.start,i.end):null);
  if(mo>0)out.push(mo+'개월');
  if(i.start)out.push("매월 <b class='proj-term-day'>"+parseInt(i.start.slice(8,10),10)+'일</b> 수령');
  return out.join(' · ');
}
/* 앞으로 받을 돈 — 카드·표가 같은 값을 쓰도록 한 곳에서 센다(세션 58).
   새 계산 규칙은 없다: 로드맵이 쓰는 projMonthWon 을 미래 달에 그대로 물어볼 뿐이다. */
function projFutureWon(p){
  var cur=projCurAbs(),ea=projEndAbs(p),y1=0,ft=0,a,b;
  for(var k=1;k<=12;k++){a=cur+k;y1+=Math.round(projMonthWon(p,Math.floor(a/12),a%12)||0);}
  if(ea!=null)for(b=cur+1;b<=ea;b++)ft+=Math.round(projMonthWon(p,Math.floor(b/12),b%12)||0);
  return {y1:y1,fut:ft,unknown:(ea==null)};
}
function projDdaySoon(i){return !!(i&&i.kind!=='start'&&i.dday!=null&&i.dday>=0&&i.dday<=90);}
/* ── 전체 목록(표) 보기 (세션 58) — 카드 목록과 같은 정렬·명의 필터를 그대로 받는다 */
function setProjView(v){renderSP._view=(v==='table')?'table':'card';renderSP();}
function _projDate2(ds){return ds?ds.slice(2).replace(/-/g,'.'):'—';}
function projTableHtml(live,done){
  var mk=monthKey(todayStr()),y=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1;
  var rows=[],tp=0,tm=0,ty=0,tf=0;
  var add=function(p,isDone){
    var fp=_freshP(p),info=projDayInfo(p),fw=projFutureWon(p);
    var pr=projPrincipalNow(p),mo=Math.round(projMonthWon(p,y,mi)||0);
    if(!isDone){tp+=pr;tm+=mo;ty+=fw.y1;tf+=fw.fut;}
    var mos=((fp.termMonths||0)>0)?fp.termMonths:((info.start&&info.end)?_projMonthSpan(info.start,info.end):null);
    var term=(info.start&&info.end)?(_projDate2(info.start)+'~'+_projDate2(info.end)+(mos>0?(' ('+mos+'개월)'):'')):'—';
    var payd=info.start?('매월 '+parseInt(info.start.slice(8,10),10)+'일'):'—';
    rows.push("<tr class='"+(isDone?"ptbl-done":"")+"'>"
      +"<td><span class='ptbl-nm'>"+dlEsc(fp.name||'')+"</span>"
        +(projOwnerOf(p.id)?("<span class='ptl-own'>"+dlEsc(projOwnerOf(p.id))+"</span>"):"")
        +(projIncluded(p.id)?"":"<span class='ptbl-ex'>관리만</span>")+"</td>"
      +"<td class='"+((!isDone&&projDdaySoon(info))?"ptbl-soon":"")+"'>"+(_projDdayBare(info)||'—')+"</td>"
      +"<td>"+info.state+"</td>"
      +"<td>"+(pr?(Math.round(pr/10000).toLocaleString()+'만'):'—')+"</td>"
      +"<td>"+(((fp.termMonths||0)>0)?'회차별':((getEffectiveRate(p)||0)+'%'))+"</td>"
      +"<td>"+term+"</td>"
      +"<td>"+payd+"</td>"
      +"<td>"+(mo?_projWonShort(mo):'—')+"</td>"
      +"<td>"+(fw.y1?_projWonShort(fw.y1):'—')+"</td>"
      +"<td>"+(fw.unknown?'만기 미정':(fw.fut?_projWonShort(fw.fut):'—'))+"</td></tr>");
  };
  live.forEach(function(p){add(p,false);});
  done.forEach(function(it){add(it.p,true);});
  if(!rows.length)return "<p style='font-size:13px;color:#bbb;padding:8px 0'>표시할 프로젝트가 없어요.</p>";
  return "<div class='ptbl-wrap'><table class='ptbl'><thead><tr>"
    +"<th>프로젝트</th><th>D-day</th><th>상태</th><th>원금</th><th>수익률</th>"
    +"<th>운용</th><th>정산일</th><th>월 수령</th><th>앞으로 1년</th><th>만기까지</th>"
    +"</tr></thead><tbody>"+rows.join('')
    +"<tr class='ptbl-tot'><td>합계 (진행 중)</td>"
    +"<td colspan='2'></td>"
    +"<td>"+(tp?(Math.round(tp/10000).toLocaleString()+'만'):'—')+"</td>"
    +"<td colspan='3'></td>"
    +"<td>"+(tm?_projWonShort(tm):'—')+"</td>"
    +"<td>"+(ty?_projWonShort(ty):'—')+"</td>"
    +"<td>"+(tf?_projWonShort(tf):'—')+"</td></tr>"
    +"</tbody></table></div>";
}
function projCurAbs(){var mk=monthKey(todayStr());return parseInt(mk.slice(0,4),10)*12+(parseInt(mk.slice(5,7),10)-1);}
/* 만기(마지막 수익월)의 절대월 — 모르면 null. projCumInfo가 종료월을 정하는 규칙과 동일하게 맞춘다. */
function projEndAbs(p){
  var fp=_freshP(p),sa=projStartAbsOf(p),end=null;
  if((fp.termMonths||0)>0){if(sa==null)return null;end=sa+fp.termMonths;}
  else{var tm=getProjTerm(p);if(!tm||!tm.end)return null;var ek=monthKey(tm.end);end=parseInt(ek.slice(0,4),10)*12+(parseInt(ek.slice(5,7),10)-1);}
  var ed=projEarly[p.id];
  if(ed){var em=monthKey(ed),ea=parseInt(em.slice(0,4),10)*12+(parseInt(em.slice(5,7),10)-1);if(ea<end)end=ea;}
  return end;
}
/* 일부 상환을 반영한 오늘 기준 남은 투자원금(원). projCurrentPrincipalWon과 같은 규칙이되
   「자산에서 정리」 여부는 보지 않는다(프로젝트 탭은 관리 화면이라 정리한 것도 계속 센다). */
/* 그 정산월 시점의 남은 투자원금(원) — 일부 상환은 정산월 경계로만 반영(§2.5 일할 금지) */
function projPrincipalAt(p,abs){
  var base=(parseFloat(projInvest[p.id])||0)*10000;
  if(!_repaySorted(p.id).length&&!_addInvSorted(p.id).length)return base;
  return projEffAt(p,Math.floor(abs/12),abs%12,base,0).principalWon;
}
/* 그 정산월에 돈이 묶여 있는가 — 시작 정산월~만기 정산월(만기월 포함).
   시작일 불명은 타임라인과 같은 이유로 제외(놓을 시점이 없다). */
function projHeldAt(p,abs){
  var sa=projStartAbsOf(p);if(sa==null||abs<sa)return false;
  var ea=projEndAbs(p);
  return (ea==null)||(abs<=ea);
}
function projPrincipalNow(p){return projPrincipalAt(p,projCurAbs());}
function _projWonShort(won){
  won=Math.round(won||0);
  if(won===0)return '0원';
  var neg=won<0?'-':'',a=Math.abs(won);
  if(a>=100000000)return neg+(Math.round(a/10000000)/10)+'억';
  if(a>=10000)return neg+Math.round(a/10000).toLocaleString()+'만';
  return neg+a.toLocaleString()+'원';
}
function _projWonExact(won){return Math.round(won||0).toLocaleString()+'원';}
var PROJ_SUM_KEYS=[['inv','투자 원금'],['mo','이번 달 수령'],['cum','누적 수령'],['y1','앞으로 1년 수령'],['fut','만기까지 받을 수익'],['mat3','3개월 내 만기'],['rate','평균 수익률'],['cnt','현재 진행 건수'],['conc','최대 집중도']];
function projSumLabel(k){for(var i=0;i<PROJ_SUM_KEYS.length;i++)if(PROJ_SUM_KEYS[i][0]===k)return PROJ_SUM_KEYS[i][1];return k;}
/* 요약 합산 대상 — 「가족 명의 포함」이 꺼져 있으면 명의가 적힌 프로젝트를 뺀다(목록 필터와 무관) */
function projSummaryList(){return SP.filter(function(p){return projSummaryFamily||!projOwnerOf(p.id);});}
function projSummaryVal(key){
  var arr=projSummaryList(),mk=monthKey(todayStr());
  var y=parseInt(mk.slice(0,4),10),mi=parseInt(mk.slice(5,7),10)-1,cur=projCurAbs(),t=0;
  if(key==='inv'){arr.forEach(function(p){t+=projPrincipalNow(p);});return {txt:_projWonShort(t),sub:_projWonExact(t)};}
  if(key==='mo'){arr.forEach(function(p){t+=Math.round(projMonthWon(p,y,mi)||0);});return {txt:_projWonShort(t),sub:_projWonExact(t)};}
  if(key==='cum'){arr.forEach(function(p){var ci=projCumInfo(p);if(ci&&ci.won>0)t+=ci.won;});return {txt:_projWonShort(t),sub:_projWonExact(t)};}
  if(key==='cnt'){arr.forEach(function(p){if(!projDoneInfo(p))t++;});return {txt:t+'건',sub:'누적 진행 건수 '+arr.length+'건'};}
  /* 앞으로 받을 돈 — 이번 달 다음 정산월부터 앞으로 굴려서 더한다.
     새 계산 규칙은 없다: 로드맵이 쓰는 projMonthWon 을 미래 달에 그대로 물어볼 뿐이다(세션 58). */
  if(key==='y1'){arr.forEach(function(p){for(var k=1;k<=12;k++){var a=cur+k;t+=Math.round(projMonthWon(p,Math.floor(a/12),a%12)||0);}});
    return {txt:_projWonShort(t),sub:_projWonExact(t)};}
  if(key==='fut'){var unk=0;arr.forEach(function(p){var e=projEndAbs(p);
      if(e==null){unk++;return;}
      for(var a=cur+1;a<=e;a++)t+=Math.round(projMonthWon(p,Math.floor(a/12),a%12)||0);});
    return {txt:_projWonShort(t),sub:_projWonExact(t)+(unk?(' · 만기 미상 '+unk+'건 제외'):'')};}
  /* 평균 수익률 — 본값은 단기딜 제외(연 이율 원금가중). 부제는 단기딜의 월차별 수익률을 연환산(합/개월수×12)해 함께 가중평균 */
  if(key==='rate'){var w=0,ws=0,ts=0;arr.forEach(function(p){var fp=_freshP(p);var iv=(parseFloat(projInvest[p.id])||0)*10000;if(!(iv>0))return;
      if((fp.termMonths||0)>0){var _n=fp.termMonths||1,_sr=shortRates(fp);var _an=_sr.reduce(function(a,b){return a+(parseFloat(b)||0);},0)/_n*12;ws+=iv;ts+=iv*_an;return;}
      w+=iv;t+=iv*(getEffectiveRate(p)||0);});
    var _all=(w+ws)?(Math.round((t+ts)/(w+ws)*10)/10):null;
    return {txt:w?((Math.round(t/w*10)/10)+'%'):'—',sub:ws?('단기딜 포함 '+_all+'%'):''};}
  if(key==='mat3'){var c=0;arr.forEach(function(p){if(projAssetHide[p.id]||projEarly[p.id])return;var e=projEndAbs(p);if(e==null)return;if(e>=cur&&e<=cur+2){c++;t+=projPrincipalAt(p,e);}});
    return {txt:c?(c+'건'):'없음',sub:c?('원금 '+_projWonShort(t)):''};}
  if(key==='conc'){var mx=0,nm='';arr.forEach(function(p){var iv=projPrincipalNow(p);t+=iv;if(iv>mx){mx=iv;nm=_freshP(p).name||'';}});
    return {txt:t?(Math.round(mx/t*100)+'%'):'—',sub:nm};}
  return {txt:'—'};
}
function toggleProjPick(){renderProjTop._pick=!renderProjTop._pick;renderProjTop();}
function projPickSet(key,on){
  var i=projSummaryPick.indexOf(key);
  if(on){if(i<0)projSummaryPick.push(key);}
  else{if(i>=0&&projSummaryPick.length>1)projSummaryPick.splice(i,1);}
  save();renderProjTop();
}
function setProjSummaryFamily(on){projSummaryFamily=!!on;save();renderProjTop();}
function toggleProjConc(){renderProjTop._conc=!renderProjTop._conc;renderProjTop();}
function setProjTopView(v){renderProjTop._view=(v==='tl')?'tl':'cal';renderProjTop();}
function projSummaryHtml(){
  /* 고른 순서가 아니라 항상 같은 순서로 늘어놓는다(체크를 껐다 켜면 자리가 바뀌던 문제) */
  var cards=PROJ_SUM_KEYS.map(function(kv){return kv[0];}).filter(function(k){return projSummaryPick.indexOf(k)>=0;}).map(function(k){
    var r=projSummaryVal(k),tap=(k==='conc');
    return "<div class='psum-c"+(tap?" psum-tap":"")+"'"+(tap?" onclick='toggleProjConc()'":"")+">"
      +"<div class='psum-l'>"+projSumLabel(k)+(tap?(renderProjTop._conc?" ▴":" ▾"):"")+"</div>"
      +"<div class='psum-v'>"+r.txt+"</div>"
      +(r.sub?("<div class='psum-s'>"+dlEsc(r.sub)+"</div>"):"")+"</div>";
  }).join('');
  var hidden=projSummaryFamily?0:SP.filter(function(p){return !!projOwnerOf(p.id);}).length;
  var _exN=SP.filter(function(p){return !projIncluded(p.id);}).length;   /* 요약은 전부 세고 로드맵은 빼므로 기준 차이를 캡션으로 알린다 */
  var pick='';
  if(renderProjTop._pick){
    pick="<div class='psum-pick'>"
      +PROJ_SUM_KEYS.map(function(kv){
        var on=projSummaryPick.indexOf(kv[0])>=0;
        return "<label><input type='checkbox' style='accent-color:var(--ac)'"+(on?" checked":"")
          +" onchange='projPickSet(\""+kv[0]+"\",this.checked)'>"+kv[1]+"</label>";
      }).join('')
      +"<div style='border-top:1px solid var(--tbl-border);margin:4px 0 7px'></div>"
      +"<label><input type='checkbox' style='accent-color:var(--ac)'"+(projSummaryFamily?" checked":"")
      +" onchange='setProjSummaryFamily(this.checked)'>요약에 가족 명의 포함</label>"
      +"<div class='psum-hint'>보고 싶은 만큼 고를 수 있어요. 명의는 각 프로젝트의 ✏️에서 정합니다.</div></div>";
  }
  var conc='';
  if(renderProjTop._conc&&projSummaryPick.indexOf('conc')>=0){   /* 항목에서 빼면 펼침도 함께 닫힌다(닫을 방법이 없어지는 것 방지) */
    var arr=projSummaryList(),tot=0,rows=[];
    arr.forEach(function(p){var iv=projPrincipalNow(p);if(iv>0){tot+=iv;rows.push({nm:_freshP(p).name||'',iv:iv});}});
    rows.sort(function(a,b){return b.iv-a.iv;});
    conc="<div class='psum-conc'>"+(rows.length?rows.map(function(r){
      var pc=tot?(r.iv/tot*100):0;
      return "<div class='psum-cr'><span class='psum-cn'>"+dlEsc(r.nm)+"</span>"
        +"<span class='psum-cb'><i style='width:"+(Math.round(pc*10)/10)+"%'></i></span>"
        +"<span class='psum-cp'>"+(Math.round(pc))+"%</span></div>";
    }).join(''):"<div class='psum-hint'>투자 금액을 넣으면 비중이 보여요.</div>")+"</div>";
  }
  return "<div class='psum-hd'><span class='psum-cap'>"
    +(function(){var _c=[];if(hidden)_c.push("가족 명의 "+hidden+"건은 요약에서 빠져 있어요");
      if(_exN)_c.push(_exN+"건은 로드맵·자산에 반영되지 않아요");
      return _c.length?_c.join(" · "):"선택한 프로젝트 전체 기준";})()
    +"</span><button type='button' class='psum-gear' onclick='toggleProjPick()'>"+(renderProjTop._pick?"닫기":"항목 고르기")+"</button></div>"
    +pick+"<div class='psum'>"+cards+"</div>"+conc;
}
function renderProjTop(){
  var box=g('projSummary');if(!box)return;
  var seg=g('projSeg'),cal=g('projCal'),tl=g('projTimeline');
  if(!SP.length){box.innerHTML='';if(seg)seg.innerHTML='';if(tl)tl.innerHTML='';if(cal)cal.innerHTML='';return;}
  var view=(renderProjTop._view==='tl')?'tl':'cal';
  box.innerHTML=projSummaryHtml();
  if(seg)seg.innerHTML="<div class='pseg'>"
    +"<button type='button' class='pseg-b"+(view==='cal'?" on":"")+"' onclick=\"setProjTopView('cal')\">이번 달</button>"
    +"<button type='button' class='pseg-b"+(view==='tl'?" on":"")+"' onclick=\"setProjTopView('tl')\">1년</button></div>";
  if(view==='cal'){if(tl)tl.innerHTML='';renderProjCal();}
  else{if(cal)cal.innerHTML='';renderProjTimeline();}
}
function renderProjTimeline(){
  var box=g('projTimeline');if(!box)return;
  if(!SP.length){box.innerHTML='';return;}
  var cur=projCurAbs(),N=12,last=cur+N-1,rows=[],later=[],undated=[];
  SP.forEach(function(p){
    if(projDoneInfo(p))return;                       /* 완료는 목록의 완료 섹션이 담당 */
    var nm=_freshP(p).name||'',sa=projStartAbsOf(p),ea=projEndAbs(p);
    if(sa==null){undated.push(nm);return;}
    if(sa>last){later.push(nm);return;}
    var e=(ea==null)?last:ea;
    if(e<cur)return;
    var s0=Math.max(sa,cur),e0=Math.min(e,last);
    rows.push({nm:nm,own:projOwnerOf(p.id),p:p,ea:ea,l:(s0-cur)/N*100,w:(e0-s0+1)/N*100,
      soon:(ea!=null&&ea<=cur+2),open:(ea==null),
      endTxt:(ea==null)?'미정':(String(Math.floor(ea/12)).slice(2)+'.'+('0'+(ea%12+1)).slice(-2)),
      sortk:(ea==null)?9e9:ea});
  });
  rows.sort(function(a,b){return a.sortk-b.sortk;});
  /* 축은 12칸 격자 — 라벨을 「그 달 칸의 가운데」에 둔다.
     예전엔 라벨이 달의 시작선에 붙어, 10월까지인 막대의 끝(=11월 시작선)이 「11월」과 겹쳐 보였다. */
  var ax='';
  for(var t=0;t<N;t++){var am=cur+t;ax+="<span>"+((t%3===0)?((am%12+1)+"월"):"")+"</span>";}
  var body=rows.map(function(r){
    return "<div class='ptl-row'><div class='ptl-nm'>"+dlEsc(r.nm)
      +(r.own?("<span class='ptl-own'>"+dlEsc(r.own)+"</span>"):"")+"</div>"
      +"<div class='ptl-track'><div class='ptl-bar"+(r.soon?" ptl-soon":"")+(r.open?" ptl-open":"")
      +"' style='left:"+(Math.round(r.l*100)/100)+"%;width:"+(Math.round(r.w*100)/100)+"%'></div></div>"
      +"<div class='ptl-end'>"+r.endTxt+"</div></div>";
  }).join('');
  var soonN=0,soonWon=0;
  rows.forEach(function(r){if(r.soon){soonN++;soonWon+=projPrincipalAt(r.p,r.ea);}});
  /* 다음 정산월부터 12개월 수령 예정 — 요약 스트립 y1과 같은 창(합산 대상만 달력·타임라인 기준으로 전체 SP) */
  var y1Won=0;
  SP.forEach(function(p){for(var _k=1;_k<=12;_k++){var _a=cur+_k;y1Won+=Math.round(projMonthWon(p,Math.floor(_a/12),_a%12)||0);}});
  box.innerHTML="<div class='ptl'>"
    +"<div class='ptl-hd'><span style='white-space:nowrap'>진행 "+rows.length+"건</span>"
    +(soonN?("<span style='white-space:nowrap;color:var(--ac);font-weight:600'>3개월 내 만기 "+soonN+"건</span>"):"")
    +(soonWon>0?("<span class='segtip' style='white-space:nowrap' data-tip='3개월 내 만기 건의§§만기월 기준 남은 원금'>상환 예정 원금 <b style='color:#111'>"+_projWonShort(soonWon)+"</b></span>"):"")
    +(y1Won>0?("<span class='segtip' style='white-space:nowrap' data-tip='다음 달부터 12개월간§§받을 수익금 합계'>1년 수령 예정 <b style='color:#111'>"+_projWonShort(y1Won)+"</b></span>"):"")+"</div>"
    +"<div id='projMatNotice'></div>"
    +(rows.length?("<div class='ptl-ax'>"+ax+"</div>"+body):"<div class='ptl-note'>이 기간에 표시할 진행 중인 프로젝트가 없어요.</div>")
    +(later.length?("<div class='ptl-note'>1년 뒤에 시작 — "+dlEsc(later.join(', '))+"</div>"):"")
    +(undated.length?("<div class='ptl-note'>운용 시작일을 넣으면 타임라인에 표시돼요 — "+dlEsc(undated.join(', '))+"</div>"):"")
    +"</div>";
  renderMatNotice();
}
function setProjSort(v){renderSP._sort=v||'';renderSP();}
function setProjOwnerFilter(v){renderSP._owner=v||'';renderSP();}
function renderProjFilter(){
  var box=g('projFilterBar');if(!box)return;
  if(!SP.length){box.innerHTML='';return;}
  var srt=renderSP._sort||'',own=renderSP._owner||'',names=projOwnerNames();
  var vw=(renderSP._view==='table')?'table':'card';
  var opt=function(v,l,cur){return "<option value='"+v+"'"+(cur===v?" selected":"")+">"+l+"</option>";};
  box.innerHTML="<div class='pflt'><span class='pflt-l'>목록 정렬</span>"
    +"<select onchange='setProjSort(this.value)'>"
      +opt('','기본순',srt)+opt('mat','만기 임박순',srt)+opt('inv','투자금 많은순',srt)+opt('rate','수익률 높은순',srt)
    +"</select>"
    +"<span class='pflt-l'>명의</span>"
    +"<select onchange='setProjOwnerFilter(this.value)'>"
      +opt('','전체',own)+opt('__mine','내 명의',own)
      +names.map(function(n){return opt(n,dlEsc(n),own);}).join('')
    +"</select>"
    +"<span class='pflt-l'>보기</span>"
    +"<div class='pseg' style='margin:0'>"
      +"<button type='button' class='pseg-b"+(vw==='card'?' on':'')+"' onclick=\"setProjView('card')\">카드</button>"
      +"<button type='button' class='pseg-b"+(vw==='table'?' on':'')+"' onclick=\"setProjView('table')\">표</button>"
    +"</div></div>";
}
function renderProjCal(){
  var box=g('projCal');if(!box)return;
  if(!SP.length){box.innerHTML='';return;}
  var today=todayStr();
  var ym=renderProjCal._ym||today.slice(0,7);renderProjCal._ym=ym;
  var y=parseInt(ym.slice(0,4),10),m1=parseInt(ym.slice(5,7),10);
  var list=projPayoutsInMonth(y,m1);
  var byDay={};list.forEach(function(it){var d=parseInt(it.ds.slice(8,10),10);(byDay[d]=byDay[d]||[]).push(it);});
  var tot=list.reduce(function(a,b){return a+b.won;},0);
  var first=new Date(y,m1-1,1).getDay(),dim=new Date(y,m1,0).getDate();
  var cells='';
  ['일','월','화','수','목','금','토'].forEach(function(w){cells+="<div class='pcal-wd'>"+w+"</div>";});
  for(var i=0;i<first;i++)cells+="<div class='pcal-c pcal-out'></div>";
  for(var d=1;d<=dim;d++){
    var ds=y+'-'+String(m1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var hit=byDay[d];
    var cls='pcal-c'+(hit?' pcal-pay':'')+(ds===today?' pcal-today':'');
    var dot=hit?("<span class='pcal-dot'>"+new Array(Math.min(hit.length,3)+1).join('●')+"</span>"):'';
    cells+="<div class='"+cls+"'><span class='pcal-d'>"+d+"</span>"+dot+"</div>";
  }
  var rows=list.map(function(it){
    return "<div class='pcal-row'><span class='pcal-day'>"+parseInt(it.ds.slice(5,7),10)+"/"+parseInt(it.ds.slice(8,10),10)
      +"("+dlWeekdayKo(it.ds)+")</span><span class='pcal-nm'>"+dlEsc(it.name)
      +(it.shifted?" <span style='font-size:12px;color:var(--gray);white-space:nowrap'>휴일 순연</span>":"")
      +"</span><span class='pcal-amt'>"+it.won.toLocaleString()+"원</span></div>";
  }).join('');
  var undated=[];
  SP.forEach(function(p){if(!projPayoutStart(p)&&!projDoneInfo(p))undated.push(_freshP(p).name||'');});
  var isCur=(ym===today.slice(0,7));
  var open=(renderProjCal._open!==false);
  /* 보는 달 기준 원금 — 달을 넘기면 함께 바뀐다(요약 스트립의 「투자 원금」은 오늘 기준이라 기준이 다르다) */
  var _pAbs=y*12+(m1-1),_heldWon=0;
  SP.forEach(function(p){if(projHeldAt(p,_pAbs))_heldWon+=projPrincipalAt(p,_pAbs);});
  box.innerHTML="<div class='pcal'>"
    +"<div class='pcal-head'>"
      +"<button type='button' class='pcal-nav segtip' onclick='projCalMove(-1)' data-tip='지난달'>◀</button>"
      +"<button type='button' class='pcal-ttl segtip' onclick='toggleProjCalPick()' data-tip='달을 골라서 이동'>"+y+"년 "+m1+"월</button>"
      +"<button type='button' class='pcal-nav segtip' onclick='projCalMove(1)' data-tip='다음달'>▶</button>"
      +(isCur?'':"<button type='button' class='pcal-nav' onclick='projCalToday()'>이번 달</button>")
      +"<span class='pcal-sum'>"+(list.length?("수령 예정 "+list.length+"건 · 합계 <b style='color:var(--ac);white-space:nowrap'>"+tot.toLocaleString()+"원</b>"):"이 달에 받을 수익금이 없어요")
        +(_heldWon>0?("<span class='segtip' style='white-space:nowrap' data-tip='이 달에 운용 중인§§프로젝트의 남은 원금 합계'> · 운용 원금 <b style='color:#111'>"+_projWonShort(_heldWon)+"</b></span>"):"")
      +"</span>"
      +"<button type='button' class='pcal-nav pcal-fold' style='flex:0 0 auto' onclick='toggleProjCal()'>"+(open?"접기 ▾":"펼치기 ▸")+"</button>"
    +"</div>"
    +(renderProjCal._ymPick?("<div class='pcal-pick'><input type='month' value='"+ym+"' onchange='projCalPick(this.value)'></div>"):"")
    +"<div id='pcalBody'"+(open?"":" style='display:none'")+">"
      +"<div class='pcal-grid'>"+cells+"</div>"
      +"<div id='projMatNotice'></div>"
      +(rows?("<div class='pcal-list'>"+rows+"</div>"):'')
      +(undated.length?("<div class='pcal-note'>운용 시작일을 넣으면 달력에 표시돼요 — "+dlEsc(undated.join(', '))+"</div>"):'')
    +"</div>"
    +"</div>";
  renderMatNotice();   /* 슬롯이 달력 안에 있으므로 다시 그린 뒤 채운다 */
}
function renderSP(){
  const el=g("projList");if(!el)return;  /* 모두용엔 프로젝트 탭이 없음 — 지뢰 제거 */
  renderProjTop();renderProjFilter();
  if(!SP.length){el.innerHTML="<p style='font-size:13px;color:#bbb;padding:8px 0'>선택된 프로젝트가 없습니다.</p>";var _c0=g("projCount");if(_c0)_c0.textContent="";var _fb0=g("projFilterBar");if(_fb0)_fb0.innerHTML="";var _mn0=g("projMatNotice");if(_mn0)_mn0.innerHTML="";return;}
  var _sp=projSplitSP(),_liveArr=_sp.live,_doneArr=_sp.done;
  var _liveAll=_liveArr.length,_doneAll=_doneArr.length;
  var _ownF=renderSP._owner||"";   /* 명의 필터 — 카드 목록에만 적용(달력·타임라인·요약은 별도) */
  if(_ownF){var _keep=function(p){var o=projOwnerOf(p.id);return _ownF==="__mine"?!o:(o===_ownF);};
    _liveArr=_liveArr.filter(_keep);_doneArr=_doneArr.filter(function(it){return _keep(it.p);});}
  var _srt=renderSP._sort||"";
  if(_srt==="mat")_liveArr=_liveArr.slice().sort(function(a,b){var ea=projEndAbs(a),eb=projEndAbs(b);if(ea==null)ea=9e9;if(eb==null)eb=9e9;return ea-eb;});
  else if(_srt==="inv")_liveArr=_liveArr.slice().sort(function(a,b){return projPrincipalNow(b)-projPrincipalNow(a);});
  else if(_srt==="rate")_liveArr=_liveArr.slice().sort(function(a,b){return (getEffectiveRate(b)||0)-(getEffectiveRate(a)||0);});
  const cnt=g("projCount");
  if(cnt)cnt.textContent=_liveAll+"개 진행 중"+(_doneAll?" · 완료 "+_doneAll+"개":"");
  renderMatNotice();
  if((renderSP._view||'card')==='table'){el.innerHTML=projTableHtml(_liveArr,_doneArr);return;}
  el.innerHTML=(_liveArr.length?_liveArr.map(function(p){return projCardHtml(p);}).join(""):"<p style='font-size:13px;color:#bbb;padding:8px 0'>"+((_ownF&&_liveAll)?"이 명의로 진행 중인 프로젝트가 없어요.":"진행 중인 프로젝트가 없어요.")+"</p>")+projDoneSection(_doneArr);
}
function projCardHtml(p,hdrBtn){
    const accessible=canAccess(p);
    const inv=projInvest[p.id]||"";
    const fp=allP().find(function(x){return x.id===p.id;})||p;const isShort=(fp.termMonths||0)>0;
    const _dinf=projDayInfo(p),_dtx=projDdayText(_dinf);
    const _dbadge=_dtx?("<span class='proj-dday"+(_dinf.kind==='bad'?" pd-bad":(projDdaySoon(_dinf)?" pd-soon":""))+"'>"+_dtx+"</span>"):"";
    const _open=!!projEditOpen[p.id];   /* 편집 구역 열림은 오직 projEditOpen — 완료 카드의 「수정」이 이 값을 켠다(「편집 닫기」와 「접기」는 서로 독립) */
    return `<div class='proj-row' data-pid='${p.id}' style='${accessible?"":"opacity:.5"}'>
      <div class='proj-row-header'>
        <span class='proj-hd-no' style='color:${(p.user&&(!p.no||p.no==="★"))?"var(--ac)":"var(--gray)"}'><span>${(p.user&&(!p.no||p.no==="★"))?"직접":"No."+dlEsc(p.no)}</span><span class='proj-mobile-dday'>${_dbadge}</span></span>
        <div class='proj-card-main'>
          <span class='proj-hd-mid'><span style='font-weight:700;font-size:14.5px;word-break:keep-all'>${dlEsc(p.name)}${p.nick?` <span style="font-size:13px;color:var(--gray);font-weight:400">· ${dlEsc(p.nick)}</span>`:""}</span>${projOwnerOf(p.id)?`<span class='proj-own'>${dlEsc(projOwnerOf(p.id))}</span>`:""}${projIncluded(p.id)?"":`<span class='proj-excl segtip' tabindex='0' data-tip='로드맵·자산 합계에 넣지 않고 이 탭에서 관리만 해요'>관리만</span>`}<span class='proj-desktop-dday'>${_dbadge}</span></span>
          ${p.rateNote?`<div class='proj-read'>${p.rateNote}</div>`:""}
          ${projReadHtml(p)}
          <button type='button' class='proj-edit-t${_open?" on":""}' onclick='toggleProjEdit(${p.id})'>${_open?"편집 닫기 ∧":"편집 ∨"}</button>
          ${_open?projEditBox(p):""}
        </div>
        <span class='proj-hd-act'>${hdrBtn||""}<button class='rm-btn' onclick='rmP(${p.id})'>×</button></span>
      </div>
    </div>`;
}
function rmP(id){var _p=_freshP({id:id});if(_p&&!confirm('「'+(_p.name||'')+'」을 로드맵에서 삭제할까요?\n(다시 추가하면 이전 투자금·설정으로 복원돼요)'))return;SP=SP.filter(p=>p.id!==id);delete projInvest[id];delete projSchedule[id];delete projRepay[id];delete projEarly[id];delete projAssetHide[id];delete projBonus[id];delete projBonusOn[id];delete projRateStep[id];delete projRateStepOn[id];delete projAddInv[id];delete projExtRateOn[id];delete projExtRate[id];delete projExtFrom[id];delete projOwner[id];delete projInclude[id];delete projMemo[id];renderSP();save();}
function _ensureAddInv(pid){if(!projAddInv[pid])projAddInv[pid]=[];return projAddInv[pid];}
function addAddInv(pid){var _mk=(typeof monthKey==='function')?monthKey(todayStr()):todayStr().slice(0,7);_ensureAddInv(pid).push({from:_mk,amount:''});renderSP();save();}
function setAddInvFrom(pid,idx,val){var a=_ensureAddInv(pid);if(a[idx])a[idx].from=val||'';saveSoon();}
function setAddInvAmt(pid,idx,val){var a=_ensureAddInv(pid);if(a[idx])a[idx].amount=val;
  saveSoon();
}
function delAddInv(pid,idx){var a=_ensureAddInv(pid);a.splice(idx,1);if(!a.length)delete projAddInv[pid];renderSP();renderShort();if(typeof renderMoIncome==='function')renderMoIncome(dailyDate||todayStr());save();}
function _ensureRepay(pid){if(!projRepay[pid])projRepay[pid]=[];return projRepay[pid];}
function addRepay(pid){var _mk=(typeof monthKey==='function')?monthKey(todayStr()):todayStr().slice(0,7);_ensureRepay(pid).push({from:_mk,principal:'',rate:''});renderSP();save();}
function setRepayFrom(pid,idx,val){var a=_ensureRepay(pid);if(a[idx])a[idx].from=val||'';/* 재계산은 change(invest-input) 리스너 */}
function setRepayPrincipal(pid,idx,val){var a=_ensureRepay(pid);if(a[idx])a[idx].principal=val;
  saveSoon();
}
function setRepayRate(pid,idx,val){var a=_ensureRepay(pid);if(a[idx])a[idx].rate=val;
  saveSoon();
}
function delRepay(pid,idx){var a=_ensureRepay(pid);a.splice(idx,1);if(!a.length)delete projRepay[pid];renderSP();renderShort();if(typeof renderMoIncome==='function')renderMoIncome(dailyDate||todayStr());save();}
// 조기상환 UI — 일반·단기딜 카드 공용 (단기딜은 earlyInputs로 단독 렌더)
function _earlyChunk(p){return (projEarly[p.id]
      ?("<span class='lb'>조기상환일</span>"
        +"<input type='date' value='"+projEarly[p.id]+"' class='invest-input' style='width:150px' onchange='setEarly("+p.id+",this.value)'>"
        +"<button class='rm-btn segtip' data-tip='조기상환 해제' onclick='clearEarly("+p.id+")'>×</button>"
        +(function(){var _i=projEarlyInfo(p);return _i?"<div class='pe-note' style='flex-basis:100%'>→ "+_i.mk+"에 "+_i.amtWon.toLocaleString()+"원 입금 ("+(_i.detail||_i.days+"일치")+"), 이후 수익 0 · 자산 탭에서 「정리」로 확정</div>":"";})())
      :"<button type='button' onclick='startEarly("+p.id+")' class='pe-btn'>조기상환</button>");}
function repayInputs(p,resetBtn){
  var fp=_freshP(p);var isShort=(fp.termMonths||0)>0;
  var arr=projRepay[p.id]||[];var effRate=isShort?0:getEffectiveRate(p);var _tmE=getProjTerm(p);var _endMk=(_tmE&&_tmE.end)?monthKey(_tmE.end):'';
  var rows=arr.map(function(r,idx){
    var rr=isShort?0:(r.from?_projRateAtMk(p,r.from):((r.rate!=null&&r.rate!==''&&parseFloat(r.rate)>0)?parseFloat(r.rate):effRate));
    var prev=(!isShort&&r.from&&(parseFloat(r.principal)||0)>0)?calcMonthly(r.principal,rr):'';
    return "<div class='pe-row'>"
      +"<span class='pe-f pe-date'><span class='lb'>적용 시작</span>"
      +"<input type='month' value='"+(r.from||'')+"' class='invest-input segtip' data-tip='이 달부터 줄어든 금액이 적용돼요' onchange='setRepayFrom("+p.id+","+idx+",this.value)'></span>"
      +"<span class='pe-f pe-num'><span class='lb'>남은 원금</span>"
      +"<input type='number' value='"+(r.principal!=null?r.principal:'')+"' placeholder='만원' class='invest-input segtip' data-tip='상환 후 남은 투자원금(만원)' oninput='setRepayPrincipal("+p.id+","+idx+",this.value)'>"
      +"<span class='lb'>만원</span>"
      +(isShort?"<button class='rm-btn segtip' data-tip='이 상환 삭제' onclick='delRepay("+p.id+","+idx+")'>×</button>":"")+"</span>"
      +(isShort?"":("<span class='pe-f pe-pct'><span class='lb'>수익률</span>"
        +"<input type='number' min='0' max='50' step='0.5' value='"+(r.rate!=null?r.rate:'')+"' placeholder='"+effRate+"' class='invest-input segtip' data-tip='수익률(비우면 기존 "+effRate+"% 유지)' oninput='setRepayRate("+p.id+","+idx+",this.value)'>"
        +"<span class='lb' style='color:var(--ac)'>%</span>"
        +"<button class='rm-btn segtip' data-tip='이 상환 삭제' onclick='delRepay("+p.id+","+idx+")'>×</button></span>"))
      +(prev?"<span class='monthly-return'>→ "+(r.from||'')+"부터 월 "+prev+"</span>":(((parseFloat(r.principal)||0)>0&&!r.from)?"<span style='color:#c0392b;white-space:nowrap'>⚠ 적용 시작월을 선택해야 반영돼요</span>":((!( (parseFloat(r.principal)||0)>0))?"<span style='color:#c0392b;white-space:nowrap'>⚠ 남은 원금을 입력해야 반영돼요</span>":"")))
      +((r.from&&_endMk&&r.from>_endMk)?"<span style='flex-basis:100%;color:#c0392b;word-break:keep-all'>⚠ 적용 시작이 운용기간 밖이에요 — 운용기간은 계약 종료일 그대로 두세요</span>":"")
      +"</div>";
  }).join('');
  var aArr=projAddInv[p.id]||[];
  var aRows=aArr.map(function(r,idx){
    var aw=parseFloat(r.amount)||0;
    return "<div class='pe-row'>"
      +"<span class='pe-f pe-date'><span class='lb'>넣은 달</span>"
      +"<input type='month' value='"+(r.from||'')+"' class='invest-input segtip' data-tip='이 달부터 늘어난 원금이 적용돼요' onchange='setAddInvFrom("+p.id+","+idx+",this.value)'></span>"
      +"<span class='pe-f pe-num'><span class='lb'>추가 금액</span>"
      +"<input type='number' value='"+(r.amount!=null?r.amount:'')+"' placeholder='만원' class='invest-input segtip' data-tip='이번에 더 넣은 금액(만원)§§남은 원금이 아니라 늘린 금액이에요' oninput='setAddInvAmt("+p.id+","+idx+",this.value)'>"
      +"<span class='lb'>만원</span>"
      +"<button class='rm-btn segtip' data-tip='이 추가 투자 삭제' onclick='delAddInv("+p.id+","+idx+")'>×</button></span>"
      +((r.from&&aw>0)?"<span class='monthly-return'>→ "+r.from+"부터 원금 +"+aw.toLocaleString()+"만원</span>":((aw>0&&!r.from)?"<span style='color:#c0392b;white-space:nowrap'>⚠ 넣은 달을 선택해야 반영돼요</span>":"<span style='color:#c0392b;white-space:nowrap'>⚠ 추가 금액을 입력해야 반영돼요</span>"))
      +((r.from&&_endMk&&r.from>_endMk)?"<span style='flex-basis:100%;color:#c0392b;word-break:keep-all'>⚠ 넣은 달이 운용기간 밖이에요</span>":"")
      +"</div>";
  }).join('');
  return "<div class='pe-grp'><div class='proj-ef'>"
    +"<button type='button' onclick='addRepay("+p.id+")' class='pe-btn'>＋ 일부 상환</button>"
    +"<button type='button' onclick='addAddInv("+p.id+")' class='pe-btn'>＋ 추가 투자</button>"
    +"<span class='hlp' style='text-transform:none;letter-spacing:0;margin-left:5px' onclick='event.stopPropagation();this.classList.toggle(&#39;on&#39;)'><span style='font-size:14px'>ⓘ</span><span class='hlp-pop'><b style='display:block;margin-bottom:8px;font-size:13px;color:#ffd2da;border-bottom:1px solid rgba(255,255,255,.18);padding-bottom:6px'>일부 상환</b><span style='display:block;color:#e8e8e8'>일부만 돌려받고 계속 투자할 때 써요. <b style=\'color:#fff\'>적용 시작 달</b>부터 줄어든 원금·수익률로 계산되고, 상환을 또 받으면 줄을 추가하면 그 달부터 다시 덮어써요.<br><br><b style=\'color:#fff\'>운용기간은 그대로</b> 두고, 상환된 달부터 <b style=\'color:#fff\'>남은 원금</b>만 적으면 돼요.<br><br><b style=\'color:#fff\'>＋ 추가 투자</b>는 반대로 돈을 더 넣을 때 써요. <b style=\'color:#fff\'>더 넣은 금액</b>만 적으면 그 달부터 원금에 더해져요.</span></span></span>"
    +_earlyChunk(p)
    +(resetBtn||'')
    +"</div>"
    +rows
    +aRows
    +"</div>";
}



// ── 단기 진행률 배지 ────────────────────────────────────
function updateShortBadge(yr){
  const badge=g("shortBadge");
  if(!badge)return;
  let ps=0,pc=0,done=0;
  const now=new Date();
  const curMo=now.getFullYear()===yr?now.getMonth():-1; // 현재 달 인덱스
  MONTHS.forEach((_,mi)=>{
    const tot=(shData.savings[yr+"_"+mi]||0)+(shData.income[yr+"_"+mi]||0)+getMonthlyProjectWon(yr,mi);
    const tgt=shData.target[yr+"_"+mi]||0;
    if(tgt>0){const p=Math.round(tot/tgt*100);ps+=p;pc++;if(p>=100)done++;}
  });
  if(pc===0){badge.style.display="flex";badge.innerHTML="📊 달성률 <span style='font-size:13px;color:var(--gray);margin-left:4px'>목표액을 입력하면 달성률이 표시됩니다</span>";return;}
  const avg=Math.round(ps/pc);
  badge.style.display="flex";
  badge.innerHTML="📊 달성률 <strong style='margin:0 5px'>"+avg+"%</strong>"+
    " <span style='font-size:13px;color:var(--gray)'>("+done+"/"+pc+"개월 목표 달성)</span>";
}

// ── 단기 연도 이동 ─────────────────────────────────────
function shiftYear(dir){
  const inp=g("shYear");
  inp.value=parseInt(inp.value)+dir;
  renderShort();save();
}

// ── 올해 목표 수익 배지 (장기 섹션용) ──────────────────
function fmtWon(n){
  if(n>=1e8)return (Math.floor(n/1e7)/10).toLocaleString()+"억";
  if(n>=1e4)return Math.round(n/1e4).toLocaleString()+"만";
  return Math.round(n).toLocaleString()+"원";
}
/* §4.2-20 STEP3 승인된 예외 — updateProgressBadge() 안에 있던 복리 루프를 값 반환 함수로 분리 (G4 예외, 세션 67 명시 승인, 이 함수 하나뿐) */
function progressVals(){
  const sy=parseInt(g("sY").value)||2026;
  const sv=(parseFloat(g("sV").value)||0)*10000;  // 만원→원
  if(!sv)return null;
  const now=new Date().getFullYear();
  const period=parseInt(g("period").value)||30;
  const elapsed=now-sy;
  if(elapsed<0||elapsed>period)return null;
  let asset=sv;
  for(let i=0;i<elapsed;i++){
    const y=sy+i,sv2=getSv(i,y),inv=asset+sv2,r=getRate(y)/100;
    asset=inv*(1+r);
  }
  const thisY=sy+elapsed;
  const sv2=getSv(elapsed,thisY);
  const inv=asset+sv2;
  const rate=getRate(thisY);
  const profit=inv*rate/100;
  return {now:now,thisY:thisY,inv:inv,rate:rate,profit:profit};
}
function updateProgressBadge(){
  try{

  const badge=g("longYearBadge");
  if(!badge)return;
  const pv=progressVals();
  if(!pv){badge.style.display="none";return;}
  badge.style.display="flex";
  badge.innerHTML=
    "💰 "+pv.now+"년 목표 수익 <strong style='margin:0 6px;font-size:13px'>"+fmtWon(pv.profit)+"</strong>"+
    "<span style='font-size:13px;color:var(--gray);margin-left:2px'>(투자금 "+fmtWon(pv.inv)+" × "+pv.rate+"% · 연 "+Math.round(pv.profit).toLocaleString()+"원)</span>";

  }catch(e){console.error("updateProgressBadge error:",e);}
}

// ── 시나리오 비교 ────────────────────────────────────────
let scenarioChart=null;
function renderScenario(){
  try{

  const sy=parseInt(g("sY").value)||2026;
  const sv=((parseFloat(g("scV").value)||parseFloat(g("sV").value)||0))*10000;  // 만원→원
  const period=parseInt(g("scP").value)||30;
  // 위기 설정
  const crisisYrs=[parseInt(g("sc_cy1").value)||2030,parseInt(g("sc_cy2").value)||2040,parseInt(g("sc_cy3").value)||2050];
  const crisisDur=parseInt(g("sc_cd").value)||2;
  const crisisRate=(parseFloat(g("sc_cr").value)||5)/100;
  const isCrisis=y=>crisisYrs.some(cy=>y>=cy&&y<cy+crisisDur);
  const rates=[
    {rate:parseFloat(g("scA").value)||18,label:"A ("+g("scA").value+"%)",color:"var(--ac)"},
    {rate:parseFloat(g("scB").value)||15,label:"B ("+g("scB").value+"%)",color:"#555"},
    {rate:parseFloat(g("scC").value)||10,label:"C ("+g("scC").value+"%)",color:"#aaa"},
  ];
  const years=[];for(let i=0;i<=period;i+=5)years.push(sy+i);
  if(years[years.length-1]!==sy+period)years.push(sy+period);
  const datasets=rates.map(sc=>{
    let asset=sv;
    const data=[];
    for(let i=0;i<=period;i++){
      const y=sy+i,savings=getSv(i,y),inv=asset+savings;
      const r=isCrisis(y)?crisisRate:sc.rate/100;
      asset=inv*(1+r);
      if(years.includes(y))data.push(parseFloat((asset/1e8).toFixed(1)));
    }
    return{label:sc.label+(isCrisis(sy+period)?"":""),data,borderColor:sc.color,backgroundColor:"transparent",borderWidth:2.5,pointRadius:4,fill:false,tension:0.4};
  });
  // 위기 구간 표시용 annotation 대신 labels에 ⚠ 표시
  const chartLabels=years.map(y=>crisisYrs.some(cy=>y>=cy&&y<cy+crisisDur)?y+"년⚠":y+"년");
  // Chart
  if(scenarioChart){scenarioChart.destroy();scenarioChart=null;}
  const ctx=document.getElementById("scenarioChart");
  if(ctx){
    const nc=document.createElement("canvas");nc.id="scenarioChart";nc.style="width:100%!important;height:260px!important";
    ctx.parentNode.replaceChild(nc,ctx);
    scenarioChart=new Chart(nc,{
      platform:RsZoomPlatform||undefined,
      type:"line",
      data:{labels:chartLabels,datasets},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{position:"top",labels:{font:{family:"DM Sans",size:12},boxWidth:14}},
          tooltip:{callbacks:{label:ctx=>ctx.dataset.label+": "+ctx.parsed.y.toFixed(longUnit<1?1:2)+"억원"}}
        },
        scales:{
          x:{ticks:{font:{size:11}},grid:{display:false}},
          y:{ticks:{font:{size:11},callback:v=>v+"억"},grid:{color:"#f0f0f0"}}
        }
      }
    });
  }
  // 요약 표
  const milestones=[5,10,15,20,25,30].filter(m=>m<=period);
  const scenarioResults=rates.map(sc=>{
    const vals={};
    milestones.forEach(m=>{
      let asset=sv;
      for(let i=0;i<=m;i++){
        const y=sy+i,savings=getSv(i,y),inv=asset+savings,r=isCrisis(y)?crisisRate:sc.rate/100;
        asset=inv*(1+r);
      }
      vals[m]=asset;
    });
    return{...sc,vals};
  });
  let th="<table class='xl'><tbody><tr><td class='rl col-hdr'>시나리오</td>";
  milestones.forEach(m=>th+="<td style='background:var(--tbl-hdr-bg);color:var(--tbl-hdr-color);font-weight:700;text-align:center'>"+m+"년 후</td>");
  th+="</tr>";
  scenarioResults.forEach(sc=>{
    th+="<tr class='r-asset'><td class='rl'>"+sc.label+"</td>";
    milestones.forEach(m=>{
      const v=sc.vals[m];
      const eok=(v/1e8).toFixed(1);
      th+="<td style='text-align:right;font-weight:500'>"+parseFloat(eok).toLocaleString()+"억</td>";
    });
    th+="</tr>";
  });
  // 차이 행 (A vs C)
  th+="<tr class='r-total'><td class='rl'>A-C 차이</td>";
  milestones.forEach(m=>{
    const diff=((scenarioResults[0].vals[m]-scenarioResults[2].vals[m])/1e8).toFixed(1);
    th+="<td style='text-align:right;color:var(--ac);font-weight:700'>+"+parseFloat(diff).toLocaleString()+"억</td>";
  });
  th+="</tr></tbody></table>";
  g("scTableWrap").innerHTML=th;

  }catch(e){console.error("renderScenario error:",e);}
}
