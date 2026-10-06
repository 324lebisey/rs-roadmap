var _navFoldOpen=null,_navPinned=false;
function openNav(){var d=document.getElementById("navDrawer");if(d)d.classList.add("open");if(window.matchMedia&&window.matchMedia("(hover:none)").matches){var dim=document.getElementById("navDim");if(dim)dim.classList.add("open");}}
function closeNav(){if(_navPinned)return;var d=document.getElementById("navDrawer");if(d)d.classList.remove("open");var dim=document.getElementById("navDim");if(dim)dim.classList.remove("open");}
function applyNavFoldState(){["roadmap","assets","menu"].forEach(function(k){var sub=document.getElementById("navSub-"+k),btn=document.getElementById("navFoldBtn-"+k);var on=(_navFoldOpen===k);if(sub){if(on)sub.classList.add("open");else sub.classList.remove("open");}if(btn){if(on)btn.classList.add("open");else btn.classList.remove("open");}});}
function openNavFold(key){_navFoldOpen=key;applyNavFoldState();}
function toggleNavFold(key){_navFoldOpen=(_navFoldOpen===key)?null:key;applyNavFoldState();if(key==="menu"&&_navFoldOpen==="menu"){var _ws=document.getElementById("weekStartSel");if(_ws)_ws.value=String(weekStartDay);var _ss=document.getElementById("settleStartSel");if(_ss){if(!_ss.options.length){var _o="";for(var _i=1;_i<=31;_i++){_o+="<option value='"+_i+"'>"+(_i===1?"매월 1일 (달력월)":(_i+"일"))+"</option>";}_ss.innerHTML=_o;}_ss.value=String(settleStartDay);}var _dt=document.getElementById("defaultTabSel");if(_dt)_dt.value=getDefaultTab();}}
function toggleNavPin(){var on=!_navPinned;try{lsSet("rs_nav_pin",on?"1":"0");}catch(e){}applyNavPin();}
function applyNavPin(){var on=false;try{on=localStorage.getItem("rs_nav_pin")==="1";}catch(e){}_navPinned=on;if(document.body){if(on)document.body.classList.add("nav-pinned");else document.body.classList.remove("nav-pinned");}var b=document.getElementById("navPinBtn");if(b){if(on)b.classList.add("on");else b.classList.remove("on");}if(on){var d=document.getElementById("navDrawer");if(d)d.classList.add("open");}}
(function(){
  var rm=document.getElementById("rmTabBtn"),as=document.getElementById("navAssetsBtn");
  if(rm)rm.addEventListener("click",function(){openNavFold("roadmap");});
  if(as)as.addEventListener("click",function(){openNavFold("assets");});
  var handle=document.getElementById("navHandle");
  if(handle)handle.addEventListener("mouseenter",function(){if(window.matchMedia&&window.matchMedia("(hover:hover)").matches)openNav();});
  var drawer=document.getElementById("navDrawer");
  if(drawer)drawer.addEventListener("mouseleave",function(){if(window.matchMedia&&window.matchMedia("(hover:hover)").matches)closeNav();});
})();


var HELP_CONTENT={
daily:{t:'일일 기록',b:'<div>하루에 쓴 돈을 적는 곳이에요. 금액을 넣고, 분류는 <b>고정·변동에서 세부</b>까지 골라요. 그날 기분과 한 줄 메모도 같이 남길 수 있어요.</div><div>여러 건을 한꺼번에 적을 땐 <b>+담기</b>로 모았다가 저장하면 돼요.</div><div>맨 위 <b>오늘·이번 주 예산</b>은 직접 적거나, 오늘은 <b>「주간에서 가져오기」</b>·주간은 <b>「월간에서 가져오기」</b>로 불러와요.</div><div><b>일일·주간·월간</b>을 눌러 쓴 돈과 남은 예산, 분류별 정산을 한눈에 봐요.</div><div><b>캐시백</b>은 금액 옆 칸에 적어요. <b>지출 차감</b>을 켜면 그 분류 지출에서 빼서 보여주고, 끄면 받은 금액만 따로 기록돼요.</div><div><b>고정지출 납부일</b>: 월간에서 고정 세부 항목에 <b>납부일</b>을 정하면, 그 주 주간 화면 위 <b>📅 이번 주 예정 고정지출</b>에 <b>납부 전/완료</b>로 떠요(날짜 미정 항목도 그 주 예산에 불러오면 함께 표시돼요).</div><div><b>🍚 이번 주 식단 &amp; 장보기</b>: 주간 화면에서 한 주 식단을 <b>아침·점심·저녁</b>으로 짜고, 그 아래 <b>🛒 장보기</b> 줄에 <b>살 것과 예상 금액</b>을 요일별로 적어요. 맨 아랫줄에 <b>일별 예상 합계</b>, 카드 위에 <b>주간 예상 합계</b>가 자동으로 나와요.</div><div><b>+ 줄 추가</b>를 누르면 <b>메모 줄</b>(간식처럼 글만 적는 줄)과 <b>금액 줄</b>(생필품처럼 돈이 드는 줄) 중에 고를 수 있어요. 추가·이름 바꾸기·삭제는 모두 <b>그 주에만</b> 적용돼요. 줄을 지울 땐 구분 칸 왼쪽 위의 <b>✕</b>를 누르세요(장보기 첫 줄은 지울 수 없어요). <b>지난주 불러오기</b>로 지난주 내용을 금액까지 그대로 가져와요.</div><div><b>예산 연동</b>: <b>주간 예산에 반영</b>을 누르면 금액 줄마다 <b>어느 분류에 넣을지 고르는 창</b>이 먼저 떠요(장보기는 <b>식비 › 식재료</b>가 기본, 지난번에 고른 분류가 맨 위에 나와요). 고른 뒤 확인하면 그 줄의 <b>주간 합계</b>가 <b>보고 있는 그 주</b>의 그 분류 예산으로 들어가요. 다른 주·다른 분류는 건드리지 않아요.</div><div>여기 적은 금액은 <b>계획(예산)</b>이라 <b>지출로는 기록되지 않아요</b>. 실제로 장을 본 날엔 <b>일일 기록</b>에 남겨야 「썼어요」에 반영돼요(그래야 예산과 지출이 두 번 계산되지 않아요).</div><div>식단표는 <b>기본 숨김</b>이에요. 쓰시려면 오른쪽 위 <b>⚙ 메뉴 › 식단표</b>를 <b>표시</b>로 바꿔주세요.</div><div>납부일 <b>당일 일일 탭</b>에서 <b>분류 선택</b>을 열면 「오늘 예정 고정지출」을 눌러 분류·금액이 자동으로 채워져요. 금액을 확인·수정한 뒤 저장하면 기록돼요(자동으로 기록되진 않아요).</div><div>카드·세금·보험처럼 주말/휴일이면 다음 영업일에 빠지는 건 <b>주말/휴일이면 다음 영업일</b>을 켜고, 공휴일은 오른쪽 위 <b>⚙ 메뉴 › 📅 공휴일 관리</b>에 등록하세요.</div><div><b>오늘 나의 소비는?</b> 하루를 <b>🥕 당근</b>(잘했어요)이나 <b>__WHIP__ 채찍!</b>(아쉬웠어요)으로 가볍게 남겨요. 지출한 날은 자동으로 당근, 누르면 채찍으로 바꿀 수 있어요. 그 주 우세는 <b>주간 되돌아보기</b> 맨 위에 크게 떠요.</div><div>「오늘 나의 소비는?」 옆 <b>무지출 데이도 당근</b>을 켜면 돈을 안 쓴 날도 당근이 돼요(<b>기본 켜짐</b>).</div><div><b>기분</b>을 함께 남기면 <b>분석</b> 탭에서 기분에 따라 하루 평균 얼마나 쓰는지 연결해 볼 수 있어요. <b>고정지출은 빼고 변동지출만</b> 봐요(고정비는 기분과 상관없이 나가니까요).</div><div>일일 화면 위쪽에는 <b>이번 달 무지출 일수</b>와 <b>연속 무지출</b>이 응원으로 떠요(기록을 시작한 뒤부터 세요).</div><div><b>월간</b> 화면 그래프 아래엔 그 달 하루하루의 <b>당근·채찍</b>이 색 띠로 모여, 한 달 소비 분위기가 한눈에 보여요.</div><div><b>월간 되돌아보기</b>의 <b>📸 이번 달 결산 카드</b>를 누르면 당근·채찍·무지출·총지출을 담은 그림 한 장으로 저장할 수 있어요.</div>'},
assets:{t:'자산',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">지금 가진 자산을 <b>유형별</b>로 정리하는 곳이에요. 먼저 채워두면 로드맵·예산에 자동 반영돼요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🗂️&nbsp;유형별 정리</div><div style="font-size:13.5px;line-height:1.5">현금·예적금·국내/해외 주식·금처럼 나눠 <b>원 단위</b>로 정확히 넣어요(표시는 만원). 같은 유형끼리 소계+도넛, 없는 유형은 <b>+ 새 유형 직접 입력</b>.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📈&nbsp;투자 수익 기록</div><div style="font-size:13.5px;line-height:1.5">항목 오른쪽 <b>📈</b>로 <b>투자원금·수익률(%)</b>을 넣으면 현재 평가액이 자동 계산되고, 원금 대비 <b>평가손익</b>이 막대로 보여요(항목마다 켜고 꺼요).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🌎&nbsp;해외주식 양도세</div><div style="font-size:13.5px;line-height:1.5">해외주식으로 기록한 차익을 합쳐 <b>예상 양도세</b>를 보여줘요(차익 − 250만원, ×22% · 연 합산 <b>참고용 추정</b>).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🏦&nbsp;대출</div><div style="font-size:13.5px;line-height:1.6;word-break:keep-all"><b>대출</b> 유형으로 넣고 <b>상환 방식</b>(원리금균등·원금균등·만기일시)과 이자율·상환 기간·첫 상환월을 설정하세요.<br>· 매달 납입액이 월간 <b>예산</b>의 <b>고정지출 › 대출이자 › 대출 이름</b>에 <b>자동</b>으로 채워져요. 버튼을 누를 필요 없어요.<br>· 실제 지출은 다른 고정지출과 똑같이, 세부 항목에 <b>납부일</b>을 넣어두면 주간 예산에 잡히고 <b>일일 기록에서 「예산 가져오기」</b>로 기록하면 돼요.<br>· 원금이 갚아질수록 <b>대출 잔액이 자동으로 줄어들어요</b>.<br>· <b>「지출 반영」</b>에서 <b>원리금 전액</b>과 <b>이자만</b> 중에 고를 수 있어요.<br>· <b>「상환 기록」</b>에 중도·전액 상환을 날짜와 함께 넣으면 <b>그 날까지의 이자를 일수로 계산</b>해서 반영하고, 남은 스케줄도 다시 잡아요. 전액상환하면 <b>다음 달부터 고정지출 목록에서 자동으로 빠져요</b>.<br>· 금리가 바뀌면 <b>「금리 변경 이력」</b>에 <span style="white-space:nowrap">적용월</span>과 새 금리만 넣으면 그 달부터 반영돼요.<br>· 월간 예산에서 그 대출의 <b>납부일</b>을 넣으면 이자 계산이 더 정확해져요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📌&nbsp;로드맵 반영</div><div style="font-size:13.5px;line-height:1.5"><b>장기 로드맵 시작 자산에 반영</b>을 누르면 이 합계가 장기 로드맵의 현재 자산으로 들어가요.</div></div>'/*@comm-start*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔗&nbsp;프로젝트 연동</div><div style="font-size:13.5px;line-height:1.5">프로젝트 탭에 넣은 투자금은 여기에 <b>자동으로 합쳐져요</b>.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🗓️&nbsp;만기·조기상환 정리</div><div style="font-size:13.5px;line-height:1.5">운용이 끝났거나 조기상환된 프로젝트는 <b>「만기·조기상환」 배지</b>가 붙어 표시돼요. 실제 돈을 돌려받았으면 <b>「정리」</b>를 눌러 자산에서 빼요. 프로젝트 기록과 지난 수익은 그대로 남아요.</div></div>'/*@comm-end*/+'</div>'},
short:{t:'단기 로드맵',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">올 <b>한 해</b>의 저축·수입·목표를 <b>달별(1~12월)</b>로 그려 보는 곳이에요.</div>'/*@comm-start*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📂&nbsp;엑셀·시트로 채우기</div><div style="font-size:13.5px;line-height:1.5">기존 <b>엑셀·CSV·구글시트</b>를 한 번에 불러와요. <b>가장 빠르게</b> 채우는 방법이에요.</div></div>'/*@comm-end*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">✏️&nbsp;표 편집</div><div style="font-size:13.5px;line-height:1.5"><b>+ 항목 추가</b>로 줄 추가, <b>✕</b> 삭제, <b>▲▼</b> 순서 변경, 이름은 <b>더블클릭</b>으로 수정해요. <b>급여·기타소득·목표액</b>도 <b>✕</b>로 숨길 수 있고(값은 지워지지 않아요), <b>⚙ 표 설정 → 숨긴 항목</b>에서 다시 표시해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">➖&nbsp;지출 입력</div><div style="font-size:13.5px;line-height:1.5">지출은 금액 앞에 <b>마이너스(−)</b>를 붙여요(예: −50). 합계에서 빠지고 그래프엔 반투명으로 떠요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔄&nbsp;일일 연동</div><div style="font-size:13.5px;line-height:1.5">일일 기록을 켠 달은 그달 지출이 <b>자동 반영</b>돼요(달마다 켜고 꺼요).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📈&nbsp;그래프 보는 법</div><div style="font-size:13.5px;line-height:1.5"><b>막대=총수입</b>, <b>진한 색=순저축</b>, <b>반투명=지출</b>, <b>점선=목표액</b>이에요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⚙️&nbsp;표 설정</div><div style="font-size:13.5px;line-height:1.5"><b>원/만원</b> 표시 전환 · <b>금액 모자이크</b>로 가리기 · <b>표 복사</b>로 그대로 붙여넣기('/*@comm-start*/+'커뮤니티'/*@comm-end*//*@pub +'SNS' @pub*/+' 인증 시).</div></div></div>'},
mid:{t:'중기 로드맵',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55"><b>10년</b> 자산 흐름을 계획하는 곳이에요. 현재 자산·연 저축·수익률만 넣으면 나머지는 <b>자동 계산</b>돼요.</div>'/*@comm-start*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📂&nbsp;엑셀·시트로 채우기</div><div style="font-size:13.5px;line-height:1.5">기존 <b>엑셀·CSV·구글시트</b>를 한 번에 불러와요. <b>가장 빠르게</b> 채우는 방법이에요.</div></div>'/*@comm-end*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">✏️&nbsp;표 편집</div><div style="font-size:13.5px;line-height:1.5"><b>+ 항목 추가</b>로 줄 추가, <b>✕</b> 삭제, <b>▲▼</b> 순서 변경, 이름은 <b>더블클릭</b>으로 수정해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;수익률</div><div style="font-size:13.5px;line-height:1.5">입력 후 칸을 벗어나면 자산이 <b>즉시</b> 다시 계산돼요. <b>📊 수익률 일괄 변경</b>으로 여러 해에 한 번에 적용해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⚠️&nbsp;위기 연도</div><div style="font-size:13.5px;line-height:1.5">표의 <b>연도</b>를 누르면 그 해를 위기 연도로 지정하거나 해제해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⚙️&nbsp;표 설정</div><div style="font-size:13.5px;line-height:1.5"><b>원/만원</b> 표시 전환 · <b>금액 모자이크</b>로 가리기 · <b>표 복사</b>로 그대로 붙여넣기('/*@comm-start*/+'커뮤니티'/*@comm-end*//*@pub +'SNS' @pub*/+' 인증 시).</div></div></div>'},
long:{t:'장기 로드맵',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55"><b>30년</b> 뒤까지 자산이 어떻게 불어나는지 그려 보는 곳이에요. 결혼·이사 같은 큰 <b>이벤트</b>도 적어 둬요.</div>'/*@comm-start*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📂&nbsp;엑셀·시트로 채우기</div><div style="font-size:13.5px;line-height:1.5">기존 <b>엑셀·CSV·구글시트</b>를 한 번에 불러와요. <b>가장 빠르게</b> 채우는 방법이에요.</div></div>'/*@comm-end*/+'<div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">✏️&nbsp;표 편집</div><div style="font-size:13.5px;line-height:1.5"><b>+ 항목 추가</b>로 줄 추가, <b>✕</b> 삭제, <b>▲▼</b> 순서 변경, 이름은 <b>더블클릭</b>으로 수정해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;수익률</div><div style="font-size:13.5px;line-height:1.5">입력 후 칸을 벗어나면 <b>즉시</b> 다시 계산돼요. <b>📊 수익률 일괄 변경</b>으로 여러 해에 한 번에.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⚠️&nbsp;위기 연도</div><div style="font-size:13.5px;line-height:1.5">표의 <b>연도</b>를 누르면 위기 연도로 지정/해제해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🖼️&nbsp;이벤트/목표 행</div><div style="font-size:13.5px;line-height:1.5">칸의 <b>+</b>로 사진을 불러오거나, 복사한 사진을 칸에서 <b>Ctrl+V</b>로 붙여요. 핸들로 크기 조절, <b>✕</b> 삭제.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📉&nbsp;자산 추이</div><div style="font-size:13.5px;line-height:1.5">30년 <b>자산 추이 차트</b>가 자동으로 그려지고, 세로축 단위를 고를 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🎯&nbsp;마일스톤&nbsp;·&nbsp;📐&nbsp;민감도</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all">차트 아래에서 <b>목표 금액</b>(만원, 10000=1억)을 추가하면 <b>도달 연도·나이</b>를 알려주고 표의 연도 칸에 🎯로 표시돼요. <b>수익률 민감도</b>는 매년 수익률이 ±0.5~3%p 다를 때 기간 끝 자산과 목표 도달 시점이 어떻게 바뀌는지 보여줘요(보기 전용, 표엔 반영 안 됨).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔗&nbsp;시작 자산</div><div style="font-size:13.5px;line-height:1.5">자산 탭에서 정리한 합계를 <b>시작 자산</b>으로 불러올 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⚙️&nbsp;표 설정</div><div style="font-size:13.5px;line-height:1.5"><b>원/만원</b> 표시 전환 · <b>금액 모자이크</b>로 가리기 · <b>표 복사</b>로 그대로 붙여넣기('/*@comm-start*/+'커뮤니티'/*@comm-end*//*@pub +'SNS' @pub*/+' 인증 시).</div></div></div>'},
monthly:{t:'월간 회고',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">한 달에 한 번, 질문을 따라 이번 달을 돌아보는 곳이에요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">✍️&nbsp;질문에 답하기</div><div style="font-size:13.5px;line-height:1.5">영역별 질문이 이어져요. <b>마음이 가는 질문만</b> 골라 짧게 답해도 충분해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💾&nbsp;저장·불러오기</div><div style="font-size:13.5px;line-height:1.5"><b>「이달 저장」</b>으로 그 달 회고를 남기고, <b>「📂 불러오기」</b>에서 지난 회고를 다시 봐요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📋&nbsp;복사·비우기</div><div style="font-size:13.5px;line-height:1.5"><b>「전체 복사」</b>는 작성한 답변만 모아 복사해요. <b>「전체 비우기」</b>는 지금 화면의 답만 비우고, 저장해 둔 지난 회고는 그대로예요.</div></div></div>'},
scenario:{t:'시나리오 비교',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">가정을 바꿔 결과가 어떻게 달라지는지 <b>나란히 비교</b>하는 곳이에요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔀&nbsp;비교</div><div style="font-size:13.5px;line-height:1.5">‘수익률을 높이면?’, ‘저축을 늘리면?’ 같은 가정을 바꿔 가며 비교해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💡&nbsp;위기 팁</div><div style="font-size:13.5px;line-height:1.5">위기는 곧 기회! 위기 시 수익률 기본 <b>50%</b>, <b>1~2년</b> 기간으로 설정해 보세요.</div></div></div>'},
/*@comm-start*/projects:{t:'프로젝트',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">참여할 RS 프로젝트를 고르고 <b>투자금</b>을 넣는 곳이에요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🎯&nbsp;선택·투자금</div><div style="font-size:13.5px;line-height:1.5">등급을 고르면 예상 수익률이 자동으로 잡히고, 직접 입력하면 그 값이 쓰여요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔗&nbsp;자동 반영</div><div style="font-size:13.5px;line-height:1.5">투자금과 수익은 <b>로드맵·자산 탭</b>에 자동으로 반영돼요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🍯&nbsp;완료 프로젝트</div><div style="font-size:13.5px;line-height:1.5">만기가 지나거나 조기상환한 프로젝트는 목록 아래 <b>「🍯 완료」</b>로 따로 모여요. 펼친 뒤 <b>「수정」</b>을 누르면 투자금·수익률 등 원래 입력 내용을 그대로 보고 고칠 수 있고, <b>누적 수익은 계속 합산</b>돼요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">✂️&nbsp;일부 상환</div><div style="font-size:13.5px;line-height:1.5">원금 일부만 돌려받고 계속 투자할 때 써요. <b>「＋ 일부 상환」</b>으로 <b>적용 시작 달·남은 원금</b>을 넣으면 그 달부터 줄어든 수익으로 계산돼요. 또 받으면 줄을 추가하면 그 달부터 다시 덮어써요. <b>운용기간은 계약 그대로</b> 두세요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">⏱️&nbsp;조기상환</div><div style="font-size:13.5px;line-height:1.5">만기 전에 상환됐을 때 <b>「조기상환」</b>으로 <b>상환일</b>을 넣으면, 그 달은 지급일(기준일) 정기분 + 다음 회차 수익률로 <b>남은 일수만 일할</b> 계산해 입금하고 이후 수익은 0이 돼요. 단기딜도 같아요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">➕&nbsp;내&nbsp;프로젝트&nbsp;직접&nbsp;추가</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all">목록에 없는 투자는 <b>「＋ 프로젝트 선택」 › 「＋ 내 프로젝트 직접 추가」</b>로 만들 수 있어요. <b>일반</b>(연 수익률)과 <b>단기딜</b>(월차별 수익률) 둘 다 되고, 만든 프로젝트는 투자금·상환·자산 연동이 기존과 똑같이 동작해요. 목록의 <b>✏️</b>로 수정, <b>🗑️</b>로 완전 삭제할 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;누적&nbsp;수익&nbsp;·&nbsp;⏰&nbsp;만기&nbsp;알림</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all">각 딜 카드엔 <b>지금까지 받은 누적 수익</b>과 원금 대비 %가 표시돼요 (일부·조기상환까지 반영, 이번 정산월 포함). 시작일이 없는 딜은 운용기간(단기딜은 시작월)을 입력하면 계산돼요. 만기가 <b>이번 달·다음 달</b>인 딜은 목록 위에 ⏰ 알림으로 미리 알려줘요.</div></div></div>'},/*@comm-end*/
dashboard:{t:'대시보드',b:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">여기서 <b>직접 입력하는 칸은 없어요</b>. 다른 탭에 이미 넣은 내용을 모아 한눈에 보여주는 곳이에요. 카드를 누르면 <b>그 내용이 있는 탭</b>으로 바로 이동해요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💰&nbsp;총자산</div><div style="font-size:13.5px;line-height:1.5">자산 탭 합계가 유형별 비중과 함께 맨 위에 떠요. 누르면 <b>자산 탭</b>으로 이동해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🚀&nbsp;진행 현황</div><div style="font-size:13.5px;line-height:1.5">'/*@comm-start*/+'프로젝트 이번 달 이자·1년 내 받을 돈, '/*@comm-end*/+'목표 도달 예상 연도, 미래 자산 미리보기(5·10·20·30년 뒤), 갈아타기 현황이 모여요. <b>해당하는 것만</b> 떠요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🎯&nbsp;올해 목표 · 이번 달 소비</div><div style="font-size:13.5px;line-height:1.5">올해 목표 수익과 저축 달성률(일일 기록이 있어야 떠요), 이번 달 총 지출과 월말 예상 지출을 같은 칸에 위아래로 모아 보여줘요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔔&nbsp;알림</div><div style="font-size:13.5px;line-height:1.5">백업 상태, 이달의 집중, 이번 달 자산 기록, 쓸쓰안쓰, 이번 주 식단이 <b>켜져 있고 내용이 있을 때만</b> 떠요.</div></div><div style="font-size:13px;color:var(--gray);word-break:keep-all">값을 넣은 게 없는 구역은 통째로 숨겨져요. 숫자를 고치려면 카드를 눌러 원래 탭에서 바꿔주세요.</div></div>'}
};
var HELP_DAILY={daily:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">하루에 쓴 돈을 <b>한 건씩</b> 적는 곳이에요. 손으로 적으며 소비를 <b>의식</b>하는 게 핵심이에요.</div><div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13px"><span style="display:inline-block;background:rgba(0,0,0,.06);border-radius:999px;padding:3px 11px;font-weight:700;white-space:nowrap">① 금액</span><span style="color:var(--ac);font-weight:700">→</span><span style="display:inline-block;background:rgba(0,0,0,.06);border-radius:999px;padding:3px 11px;font-weight:700;white-space:nowrap">② 분류</span><span style="color:var(--ac);font-weight:700">→</span><span style="display:inline-block;background:rgba(0,0,0,.06);border-radius:999px;padding:3px 11px;font-weight:700;white-space:nowrap">③ 기분·메모</span><span style="color:var(--ac);font-weight:700">→</span><span style="display:inline-block;background:rgba(0,0,0,.06);border-radius:999px;padding:3px 11px;font-weight:700;white-space:nowrap">④ 저장</span></div><div style="font-size:13px;color:var(--gray);margin-top:-4px">여러 건은 <b>+담기</b>로 모았다가 한 번에 저장해요. 분류는 <b>고정·변동 → 세부</b>까지 골라요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💰&nbsp;예산</div><div style="font-size:13.5px;line-height:1.5">맨 위에서 <b>오늘·이번 주 예산</b>을 봐요. 오늘 예산은 <b>「주간에서 가져오기」</b>로 한 번에 채울 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🥕&nbsp;오늘의 소비</div><div style="font-size:13.5px;line-height:1.5"><b>당근♥ / 채찍</b>으로 그날 소비를 평가해요. 안 쓴 날도 당근으로 둘 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💳&nbsp;캐시백</div><div style="font-size:13.5px;line-height:1.5">금액 옆에 캐시백을 적고 <b>「지출 차감」</b>을 켜면 <b>순지출</b>로 반영돼요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📅&nbsp;예정 고정지출</div><div style="font-size:13.5px;line-height:1.5">납부일 당일이면 분류 선택창 위에 <b>오늘 예정 고정지출</b>이 떠요. 눌러서 바로 담아요.<br>대출을 중도상환한 날에는 <b>정산분</b>이 따로 떠서, 납부일에 낸 정기분과 <b>각각</b> 기록할 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🗂️&nbsp;분류 정리</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all"><b>분류 선택 › 관리</b>에서 정리해요.<br><b>세부 항목</b>은 왼쪽 <b>⋮⋮ 손잡이를 끌어</b> 다른 대분류 위에 놓으면 옮겨져요(<b>고정↔변동</b>도 돼요). 예산·납부일·지난 기록이 함께 따라가요.<br><b>대분류 전체</b>를 고정↔변동으로 옮길 땐 오른쪽 <b>「옮기기」</b>를 누르세요.<br>실수로 등록한 고정지출은 <b>주간 화면 예정 목록의 ×</b>로 예정에서만 빼요(분류·지난 기록은 그대로 남아요).</div></div></div>',week:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">한 주 동안 쓴 돈과 남은 예산을 정산하는 곳이에요. <b>주 시작 요일</b>은 오른쪽 위 <b>⚙ 메뉴</b>에서 바꿀 수 있어요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💰&nbsp;주간 예산</div><div style="font-size:13.5px;line-height:1.5">분류별 예산을 세워요. <b>주마다 따로</b> 저장돼요. <b>지난주 예산 불러오기</b>·<b>월간에서 가져오기</b>로 빠르게 채워요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;정산 비교</div><div style="font-size:13.5px;line-height:1.5">이번 주 지출을 <b>🔒 고정·🔄 변동</b>으로 나눠 지난주와 비교해요(각 「계」와 「총계」).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📅&nbsp;예정 고정지출</div><div style="font-size:13.5px;line-height:1.5">그 주 납부 예정 고정지출이 <b>납부 전/완료</b>로 떠요. 예정일이 되면 그 주 예산에 <b>자동으로</b> 들어가요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🍚&nbsp;이번 주 식단 &amp; 장보기</div><div style="font-size:13.5px;line-height:1.5">한 주 식단을 <b>아침·점심·저녁</b>으로 짜고, <b>🛒 장보기</b> 줄에 살 것과 예상 금액을 요일별로 적어요. 여기 적은 금액은 <b>계획</b>이라 지출로 기록되진 않아요 — 장을 본 날 <b>일일 기록</b>에 남겨야 반영돼요. 기본은 숨김이라 쓰려면 <b>⚙ 메뉴 › 식단표</b>를 표시로 바꿔주세요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🥕&nbsp;되돌아보기</div><div style="font-size:13.5px;line-height:1.5">그 주 <b>당근·채찍</b> 우세가 맨 위에 크게 떠요. 베스트·워스트도 함께 봐요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px"><img src="assets/ico-camera.png" alt="" style="height:1em;vertical-align:-2px">&nbsp;인증 캡처</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all"><b style="white-space:nowrap">「오늘로」</b> 옆 <b style="white-space:nowrap">인증 버튼</b>을 누르면 <b style="white-space:nowrap">정산</b>과 <b style="white-space:nowrap">예산</b> 중 골라 그림 한 장으로 만들어 클립보드에 담아요.<br><b style="white-space:nowrap">정산 인증</b>엔 전체 예산 사용률 · 요일별 지출 흐름 · 고정/변동 분류별 사용률 · 되돌아보기(당근·채찍 일수와 메모·베스트·워스트)가 들어가요.<br><b style="white-space:nowrap">예산 인증</b>은 이번 주 예산을 분류별 비중으로 담아요.<br>어느 쪽이든 <b>금액은 가려지고 비율(%)만</b> 보여요. 붙여넣기만 하면 바로 공유돼요.</div></div></div>',month:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">한 달 수입과 예산을 세우고, 한 달 소비를 정산하는 곳이에요. <b>월 시작일</b>은 오른쪽 위 <b>⚙ 메뉴</b>에서 바꿀 수 있어요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💵&nbsp;월간 수입</div><div style="font-size:13.5px;line-height:1.5"><b>「+ 수입 추가」</b>로 이 달 수입을 적어요. 위의 <b>수입·지출·순액 카드</b>와 <b>「이 달의 돈의 흐름」</b> 그래프, 지난달 비교표가 자동으로 채워져요. 항목 이름은 <b>✏️ 카테고리 편집</b>에서 바꿔요.'/*@comm-start*/+' 프로젝트 수익은 <b>프로젝트 이자(자동연결)</b> 행으로 저절로 들어와요.'/*@comm-end*/+'</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔗&nbsp;로드맵 연결</div><div style="font-size:13.5px;line-height:1.5">수입을 <b>단기 로드맵</b>(급여·기타소득 행)에 자동으로 옮겨 적어요. <b>기본은 꺼짐</b> — 켜기 전엔 직접 적은 로드맵 값을 건드리지 않아요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">💰&nbsp;월간 예산</div><div style="font-size:13.5px;line-height:1.5">분류별 예산을 세워요. 이번 달에 세우면 <b>다음 달로 이어져요</b>(그 달만 바꾸면 그 달만 독립). 고정 세부엔 <b>납부일</b>도 정할 수 있어요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📥&nbsp;엑셀·CSV로 채우기</div><div style="font-size:13.5px;line-height:1.5"><b>「+ 예산 세우기」</b>를 누르면 나오는 <b>📥 엑셀·CSV로 채우기</b>로, 기존 엑셀·구글시트(구분·대분류·소분류·예산 열)를 <b>이 달 예산</b>에 한 번에 불러와요. <b>그 달만</b> 반영되고 기존 예산은 그대로예요. 지난 여러 달의 <b>기록·수입</b>까지 통째로 옮기려면 ⚙ 메뉴의 <b>🧾 가계부 가져오기</b>를 쓰세요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🧾&nbsp;가계부 가져오기</div><div style="font-size:13.5px;line-height:1.5">오른쪽 위 <b>⚙ 메뉴 › 🧾 가계부 가져오기</b>에서 엑셀로 써온 <b>주간 인증표·월간 정산표</b>를 올리면 지난 기록이 자동으로 채워져요. 여러 파일·여러 달을 한 번에 올릴 수 있고, <b>미리보기에서 확인 후</b> 저장돼요. 주간표는 날짜별 기록으로, 월간표는 매월 1일의 요약으로 들어가고, <b>직접 입력한 기록은 절대 건드리지 않아요</b>. 이번 달 <b>예산만</b> 빠르게 채우려면 예산 세우기의 <b>📥 엑셀·CSV로 채우기</b>가 간편해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🍩&nbsp;지출 그래프</div><div style="font-size:13.5px;line-height:1.5"><b>일별 | 카테고리</b> 탭으로 막대와 도넛을 오가요. 도넛은 조각을 누르면 튀어나오며 그 분류의 금액이 떠요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;정산 비교</div><div style="font-size:13.5px;line-height:1.5">지출을 <b>🔒 고정·🔄 변동</b>으로 나눠 지난달과 비교해요(각 「계」와 「총계」).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🥕&nbsp;소비 분위기</div><div style="font-size:13.5px;line-height:1.5">그래프 아래에 그 달 하루하루의 <b>당근·채찍</b>이 색 띠로 모여, 한 달 분위기가 한눈에 보여요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📸&nbsp;결산 카드</div><div style="font-size:13.5px;line-height:1.5">되돌아보기의 <b>📸 이번 달 결산 카드</b>로 당근·채찍·무지출·총지출을 그림 한 장으로 저장해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📅&nbsp;공휴일 관리</div><div style="font-size:13.5px;line-height:1.5">주말·휴일이면 다음 영업일로 미루는 고정지출을 위해, 오른쪽 위 <b>⚙ 메뉴 › 📅 공휴일 관리</b>에 공휴일을 등록해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px"><img src="assets/ico-camera.png" alt="" style="height:1em;vertical-align:-2px">&nbsp;인증 캡처</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all"><b style="white-space:nowrap">「정산 ▾」</b> 옆 <b style="white-space:nowrap">인증 버튼</b>을 누르면 <b style="white-space:nowrap">정산</b>과 <b style="white-space:nowrap">예산</b> 중 골라 그림 한 장으로 만들어 클립보드에 담아요.<br><b style="white-space:nowrap">정산 인증</b>엔 전체 예산 사용률 · 일별 지출 흐름 · 카테고리 비중 · 고정/변동 분류별 사용률 · 되돌아보기(당근·채찍 일수와 잘한 점·아쉬운 점·베스트·워스트)가 들어가고, <b style="white-space:nowrap">「정산 ▾」</b>을 펼쳐두면 <b>수입 흐름과 정산 비교</b>까지 함께 담겨요.<br><b style="white-space:nowrap">예산 인증</b>은 지금 보는 달의 예산을 분류별 비중으로 담아요.<br>어느 쪽이든 <b>금액은 가려지고 비율(%)만</b> 보여서 카페에 그대로 붙여넣어도 안전해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px;white-space:nowrap">📥&nbsp;가져온 월 요약</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all">가계부 가져오기로 <b>월간 정산표</b>를 불러오면, 그 달의 <b>요약 한 벌</b>로 저장돼요(하루하루 내역이 아니므로 그 달 1일에 모아둠).<br>그래서 <b>일별 그래프·주간 합계·요일별 분석에는 나오지 않아요.</b> 대신 <b>월 총액·카테고리·월 예산 사용률에는 모두 반영</b>되고, 기록 목록에서 「월 요약」 표시로 확인·수정할 수 있어요.<br>가져온 달의 일별 그래프 아래에도 같은 안내가 떠요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px;white-space:nowrap">🔄&nbsp;초기화</div><div style="font-size:13.5px;line-height:1.5;word-break:keep-all">월간 화면에서 오른쪽 위 <b style="white-space:nowrap">⚙ 메뉴 › 🔄 초기화</b>를 누르면 <b>지금 보고 있는 달</b>만 지워요.<br>기록·당근/채찍·예산(월간·주간·일일)·수입·회고 메모 중 <b>지울 항목을 골라</b> 체크해요. 체크를 풀면 그대로 남아요.<br>다른 달과 <b>월간회고 탭</b>의 기록은 건드리지 않아요. <b style="color:#c0392b">되돌릴 수 없어요.</b></div></div></div>',analysis:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">쌓인 기록을 그래프로 분석하는 곳이에요. <b>좌우로 넘겨</b> 슬라이드를 봐요(← → 또는 아래 점).</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🗓️&nbsp;기간</div><div style="font-size:13.5px;line-height:1.5">이번 달·지난 달·최근 3개월·올해·직접 설정 중에 골라요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📊&nbsp;요일·기분</div><div style="font-size:13.5px;line-height:1.5">요일별 <b>하루 평균</b> 지출과, 기분에 따라 얼마나 쓰는지 봐요(<b>변동지출만</b>).</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔎&nbsp;어디에 많이 쓰나</div><div style="font-size:13.5px;line-height:1.5">분류 순위를 보여줘요. 항목을 누르면 <b>세부</b>까지 펼쳐요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🔮&nbsp;월말 예상·추세</div><div style="font-size:13.5px;line-height:1.5">이번 달 <b>월말 예상 지출</b>과 <b>최근 6개월</b> 추세를 봐요. 맨 아래엔 최근 6개월 <b>수입·지출·순액</b> 추세 선이 떠요.</div></div></div>',calendar:'<div style="display:flex;flex-direction:column;gap:12px"><div style="font-size:15px;line-height:1.55">한 달을 달력으로 겹쳐보는 곳이에요. <b>읽기 전용</b>이라 여기서 직접 기록하진 않아요.</div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">🎛️&nbsp;레이어</div><div style="font-size:13.5px;line-height:1.5">위 칩(<b>'/*@comm-start*/+'수익금·'/*@comm-end*/+'고정지출·실제 지출·당근·채찍</b>)을 눌러 켜고 꺼요. 끈 항목은 달력·목록·합계에서 함께 빠져요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">👆&nbsp;날짜 누르기</div><div style="font-size:13.5px;line-height:1.5">날짜 칸을 누르면 그 날 <b>일일 기록</b>으로 바로 이동해요.</div></div><div style="border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)"><div style="font-weight:700;font-size:14px;margin-bottom:3px">📅&nbsp;공휴일</div><div style="font-size:13.5px;line-height:1.5"><b>⚙ 메뉴 › 공휴일 관리</b>에서 등록하면 달력에 표시돼요.</div></div></div>',special:'<div style=\"display:flex;flex-direction:column;gap:12px\"><div style=\"font-size:15px;line-height:1.55\">경조사·명절·여행처럼 <b>매년 있지만 매달은 아닌</b> 지출을 미리 계획하는 곳이에요. <b>◀ ▶</b>로 연도를 옮겨요.</div><div style=\"border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)\"><div style=\"font-weight:700;font-size:14px;margin-bottom:3px\">🗓️&nbsp;연간 계획표</div><div style=\"font-size:13.5px;line-height:1.5\">항목별로 <b>월마다 예산</b>을 적고, 맨 위 <b>이벤트</b> 줄엔 그 달에 있는 일(결혼식·명절 등)을 메모해요. 좁은 화면에선 월별 카드로 보여요.</div></div><div style=\"border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)\"><div style=\"font-weight:700;font-size:14px;margin-bottom:3px\">💰&nbsp;월간 예산 연동</div><div style=\"font-size:13.5px;line-height:1.5\">여기서 적은 그 달 금액이 <b>월간 예산 화면의 「특별지출」</b>에 자동으로 채워져요. 지출은 다른 변동지출처럼 <b>일일 기록</b>에 남기면 돼요 — 자동으로 채워지진 않아요.</div></div><div style=\"border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)\"><div style=\"font-weight:700;font-size:14px;margin-bottom:3px\">🗂️&nbsp;항목 추가·이름 수정</div><div style=\"font-size:13.5px;line-height:1.5\"><b>+ 항목 추가</b>로 경조사·명절·여행 같은 대분류를 새로 만들어요. <b>항목 이름을 더블클릭</b>하면 그 자리에서 이름을 바꿀 수 있고, 예산·기록·납부일이 모두 새 이름으로 따라가요. <b>분류 관리</b>에서 고정·변동·특별 사이로 옮길 수도 있어요.</div></div><div style=\"border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)\"><div style=\"font-weight:700;font-size:14px;margin-bottom:3px\">📊&nbsp;연간 정산</div><div style=\"font-size:13.5px;line-height:1.5\">아래 <b>연간 정산</b>은 실제 지출 기록에서 <b>매번 계산</b>돼요(따로 저장하지 않음) — 계획한 예산과 바로 비교할 수 있어요.</div></div><div style=\"border:1px solid var(--tbl-border);border-radius:10px;padding:11px 13px;background:rgba(0,0,0,.02)\"><div style=\"font-weight:700;font-size:14px;margin-bottom:3px;white-space:nowrap\">🔄&nbsp;초기화</div><div style=\"font-size:13.5px;line-height:1.5\">오른쪽 위 <b style=\"white-space:nowrap\">⚙ 메뉴 › 🔄 초기화</b>를 누르면 <b>지금 보고 있는 연도</b>의 계획(이벤트·예산)만 지워요. 실제 지출 기록은 그대로 남고, 다른 연도도 건드리지 않아요. <b style=\"color:#c0392b\">되돌릴 수 없어요.</b></div></div></div>'};
function openHelp(){var tab=(typeof getActiveTab==='function')?getActiveTab():'daily';var h=HELP_CONTENT[tab]||HELP_CONTENT.daily;var _ht=h.t,_hb=h.b;if(tab==='daily'&&typeof HELP_DAILY!=='undefined'){var _sv=(typeof dailyView!=='undefined'&&dailyView)?dailyView:'daily';var _hd=HELP_DAILY[_sv];var _svl={daily:'일일',week:'주간',month:'월간',special:'특별',analysis:'분석',calendar:'달력'}[_sv]||'일일';if(_hd){_ht='일일 기록 · '+_svl;_hb=_hd;}}var tt=g('helpTitle');if(tt)tt.textContent='❓ '+_ht+' 사용법';var bd=g('helpBody');var _hasInfo={daily:1,short:1,long:1}[tab];var _foot='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--tbl-border);font-size:13px;color:var(--gray)">'+(_hasInfo?'💡 화면 곳곳의 <b>ⓘ</b>를 누르면 그 자리에서 설명이 떠요.<br>':'')+'안내가 익숙해지면 <b>⚙ 메뉴 › 도움말</b>에서 켜고 끌 수 있어요.</div>';if(bd)bd.innerHTML=(_hb||'').replace(/__WHIP__/g,'<img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">')+_foot;var m=g('helpModal');if(m)m.classList.add('open');if(typeof closeHeaderMenu==='function')closeHeaderMenu();}
function applyHelpHidden(){var on=false;try{on=localStorage.getItem('rs_help_hidden')==='1';}catch(e){}if(document.body){if(on)document.body.classList.add('help-off');else document.body.classList.remove('help-off');}['helpToggleBtn','helpToggleBtn2'].forEach(function(id){var b=g(id);if(b)b.textContent=on?'숨김':'표시';});}
function toggleHelpHidden(){var on=false;try{on=localStorage.getItem('rs_help_hidden')==='1';}catch(e){}on=!on;try{lsSet('rs_help_hidden',on?'1':'0');}catch(e){}applyHelpHidden();}
function toggleHeaderMenu(){var m=document.getElementById("headerMenu");if(!m)return;m.style.display=(m.style.display==="block")?"none":"block";if(m.style.display==="block"){var _ws=g("weekStartSel2");if(_ws)_ws.value=String(weekStartDay);var _ss=g("settleStartSel2");if(_ss){if(!_ss.options.length){var _o="";for(var _i=1;_i<=31;_i++){_o+="<option value='"+_i+"'>"+(_i===1?"매월 1일 (달력월)":(_i+"일"))+"</option>";}_ss.innerHTML=_o;}_ss.value=String(settleStartDay);}var _dt=g("defaultTabSel2");if(_dt)_dt.value=getDefaultTab();}}
function closeHeaderMenu(){var m=document.getElementById("headerMenu");if(m)m.style.display="none";}
document.addEventListener("click",function(e){var d=document.getElementById("navDrawer"),h=document.getElementById("navHandle");if(d&&d.classList.contains("open")&&!_navPinned&&!d.contains(e.target)&&h&&!h.contains(e.target))closeNav();});
function toggleTblSet(k){var m=document.getElementById("tblSet-"+k);if(!m)return;var op=m.style.display==="block";var ps=document.querySelectorAll(".tbl-set-panel");for(var i=0;i<ps.length;i++)ps[i].style.display="none";m.style.display=op?"none":"block";if(!op){var btn=document.getElementById("tblSetBtn-"+k);if(btn){var r=btn.getBoundingClientRect();
  /* ★ 부모 섹션 zoom:1.25 때문에 position:fixed 자식의 left/top도 줌만큼 다시 배율이 걸린다(RsZoomPlatform과 동일 원인).
     btn의 줌 반영 크기 대 줌 미반영 크기 비율로 되돌린 뒤 style에 넣는다. */
  var z=(btn.offsetWidth>0&&r.width>0)?(r.width/btn.offsetWidth):1;
  var pw=(m.offsetWidth||200)*z;var left=r.right-pw;var maxLeft=window.innerWidth-pw-8;if(left>maxLeft)left=maxLeft;if(left<8)left=8;
  var ph=(m.offsetHeight||0)*z;var vh=window.innerHeight;var top=r.bottom+6;
  if(ph&&top+ph>vh-8){var above=r.top-6-ph;top=(above>=8)?above:Math.max(8,vh-8-ph);}
  m.style.top=(top/z)+"px";m.style.left=(left/z)+"px";}}}
document.addEventListener("click",function(e){var ps=document.querySelectorAll(".tbl-set-panel");for(var i=0;i<ps.length;i++){var p=ps[i];if(p.style.display==="block"){var b=document.getElementById("tblSetBtn-"+p.id.replace("tblSet-",""));if(!p.contains(e.target)&&b&&!b.contains(e.target))p.style.display="none";}}});




let CRISIS=[2030,2040,2050];
const CLABELS=["첫째","둘째","셋째","넷째","다섯째"];
const MONTHS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DS=[];

/*@comm-start*/const APS=[
  // ── 1~14번: 세후 12%→13%→14% 고정 수익 (등급 무관) ──
  // 갤러리·블랙 명칭 프로젝트: 블랙/트리니티만 참여 가능
  {id:1,  no:"1",      name:"시에나 파트너스 1",          nick:"",               fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"5/9"},
  {id:2,  no:"2",      name:"시에나 파트너스 2",           nick:"제주 아파트",      fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"7/20"},
  {id:3,  no:"3",      name:"시에나 파트너스 3",           nick:"뉴욕 1차",         fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"10/19"},
  {id:4,  no:"4",      name:"시에나 파트너스 4",           nick:"뉴욕 2차",         fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"11/15"},
  {id:5,  no:"5-1",   name:"시에나 파트너스 5-1",          nick:"벨루토 1차",       fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.11.20~26.11.20 (2년)", date:"24.11.20"},
  {id:6,  no:"5-2",   name:"시에나 파트너스 5-2",          nick:"벨루토 2차",       fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.11.20~26.11.20 (2년)", date:"24.11.20"},
  {id:7,  no:"6",      name:"나인 파트너스",               nick:"삼성동 한강 고급빌라",fixedRate:true, rate:12,                  minGrade:"rs",    period:"",                    date:"5/29"},
  {id:8,  no:"7",      name:"카사 드 파트너스 2",          nick:"제주 타운하우스",   fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"7/11"},
  {id:9,  no:"8",      name:"케이타운 파트너스 1-1",       nick:"뉴욕 케이타운 1차", fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"1/28"},
  {id:10, no:"9",      name:"케이타운 파트너스 1-2",       nick:"뉴욕 케이타운 2차", fixedRate:true, rate:12,                   minGrade:"rs",    period:"",                    date:"4/4"},
  {id:11, no:"10",     name:"SIENA PARTNERS 1-2차",       nick:"시에나 삼척2",      fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.06.24~27.06.24 (3년)", date:"24.06.24"},
  {id:12, no:"11",     name:"SIENA PARTNERS 6-1",         nick:"사우스스프링스 골프",fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.07.24~27.07.24 (3년)", date:"24.07.24"},
  {id:13, no:"4-1",   name:"SIENA PARTNERS 4-1",          nick:"",               fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.10.28~26.10.28 (2년)", date:"24.10.28"},
  {id:14, no:"5-3",   name:"SIENA PARTNERS 5-3",          nick:"",               fixedRate:true, rate:12,                   minGrade:"rs",    period:"24.11.27~26.11.27 (2년)", date:"24.11.27"},
  // 갤러리 (블랙/트리니티 전용)
  {id:15, no:"갤러리3", name:"GALLERY PARTNERS 3",        nick:"",               fixedRate:true, rate:12,      minGrade:"black", period:"",                    date:"9/1"},
  {id:16, no:"갤러리2", name:"GALLERY PARTNERS 2",        nick:"시에나 갤러리",    fixedRate:true, rate:12,           minGrade:"black", period:"",                    date:""},
  // 블랙 명칭 (블랙/트리니티 전용)
  {id:17, no:"BLACK 1", name:"RESORT & GOLF PARTNERS 1", nick:"",               fixedRate:true, rate:12,           minGrade:"black", period:"",                    date:"12/30"},
  {id:18, no:"BLACK 2", name:"YK PARTNER",               nick:"",               fixedRate:true, rate:12,           minGrade:"black", period:"",                    date:"3/6"},
  {id:19, no:"BLACK 3", name:"UAE PARTNER",              nick:"",               fixedRate:true, rate:12,           minGrade:"black", period:"",                    date:"5/19"},
  // TRS 명칭
  {id:20, no:"TRS 4",   name:"YK PARTNER 2",             nick:"",               fixedRate:true, rate:12,                        minGrade:"rs",    period:"",                    date:"3/23"},
  {id:21, no:"TRS 5",   name:"SIENA PARTNERS 1-3",       nick:"",               fixedRate:true, rate:12,                        minGrade:"rs",    period:"",                    date:"4/24"},
  // 12: RESORT & GOLF PARTNERS 1-2
  {id:22, no:"12",      name:"RESORT & GOLF PARTNERS 1-2",nick:"",              fixedRate:true, rate:12,minGrade:"rs", period:"25.02.09~27.02.09 (2년)", date:"25.02.09"},
  // 13: YK PARTNER 3
  {id:23, no:"13",      name:"YK PARTNER 3",             nick:"",               fixedRate:true, rate:12,     minGrade:"rs",    period:"25.03.30~27.03.30 (2년)", date:"25.03.30"},
  // 15 이후: 등급별 수익률
  {id:24, no:"15",      name:"시에나 파트너스 6-3",        nick:"SIENA PARTNERS 6-3",fixedRate:false, rate:16, rateNote:"등급별 수익률 / 1년 후 상환 가능",   minGrade:"rs",    period:"25.06.15~27.06.15 (2년)", date:"25.06.15"},
  {id:25, no:"16",      name:"UAE PARTNERS 2",            nick:"유에이 샘플하우스",fixedRate:false, rate:16, rateNote:"등급별 수익률",                      minGrade:"rs",    period:"",                    date:""},
  {id:26, no:"17",      name:"H3 PARTNERS",               nick:"",              fixedRate:false, rate:16, rateNote:"등급별 수익률",                      minGrade:"rs",    period:"",                    date:""},
  {id:27, no:"18",      name:"H3 PARTNERS 2",             nick:"시에나 서울 C.C", fixedRate:false, rate:16, rateNote:"등급별 수익률",                      minGrade:"rs",    period:"",                    date:""},
  {id:28, no:"갤러리P2",name:"GALLERY PARTNERS 2",        nick:"시에나 갤러리",   fixedRate:false, rate:17, rateNote:"등급별 수익률 (블랙/트리니티 전용)",      minGrade:"black", period:"",                    date:""},
  // RS이상 (21~24)
  {id:29, no:"21",      name:"SIENA CHUNGDAM 1",          nick:"상장사 프로젝트1", fixedRate:false, rate:15, rateNote:"등급별 수익률 (RS이상)",               minGrade:"rs",    period:"26.01.23~27.01.23 (1년)", date:"26.01.23"},
  {id:30, no:"22",      name:"SIENA CHUNGDAM 2",          nick:"상장사 프로젝트2", fixedRate:false, rate:15, rateNote:"등급별 수익률 (RS이상)",               minGrade:"rs",    period:"26.02.09~27.02.09 (1년)", date:"26.02.09"},
  {id:31, no:"23",      name:"TOB SIENA 1",               nick:"RS 타운",        fixedRate:false, rate:15, rateNote:"등급별 수익률 (RS이상)",               minGrade:"rs",    period:"26.03.03~27.03.03 (1년)", date:"26.03.03"},
  {id:32, no:"24",      name:"TOB SIENA 2",               nick:"RS 타운 - 시에나 논현",fixedRate:false, rate:15, rateNote:"등급별 수익률 (RS이상)",         minGrade:"rs",    period:"26.03.16~27.03.16 (1년)", date:"26.03.16"},
  {id:33, no:"26",      name:"SIENA NINE",                nick:"시에나 나인",       fixedRate:false, rate:16, gradeOverride:{rs:16,trs:17,black:17,trinity:17}, rateNote:"TRS이상 17% / RS 16% (법인: 본인 등급 기준)", minGrade:"rs",    period:"26.06.01~27.06.01 (1년)", date:"26.06.01"},
  {id:34, no:"27",      name:"GREEN SIENA",               nick:"",              fixedRate:false, rate:15, gradeOverride:{rs:15,trs:16,black:17,trinity:17}, rateNote:"BLACK이상 17% / TRS 16% / RS 15% (법인: 본인 등급 기준)", minGrade:"rs",    period:"26.06.15~27.06.15 (1년)", date:"26.06.15"},
  {id:35, no:"28",      name:"HDDMC",                     nick:"",              fixedRate:false, rate:15, gradeOverride:{rs:15,trs:16,black:17,trinity:17}, rateNote:"BLACK이상 17% / TRS 16% / RS 15% (법인: 본인 등급 기준)", minGrade:"rs",    period:"26.06.21~27.06.21 (1년)", date:"26.06.21"},
  {id:36, no:"29",      name:"SIENA SAMCHEOK",            nick:"",              fixedRate:false, rate:15, gradeOverride:{rs:15,trs:16,black:17,trinity:17}, rateNote:"BLACK이상 17% / TRS 16% / RS 15% (법인: 본인 등급 기준)", minGrade:"rs",    period:"26.06.26~27.06.26 (1년)", date:"26.06.26"},
  {id:37, no:"TRS10",   name:"CAPE SIENA 3",              nick:"",              fixedRate:false, rate:3, termMonths:2, monthlyRates:[2.5,3], rateNote:"2개월 월차별(TRS 기준) 2.5% / 3% · BLACK·TRINITY는 더 높음(직접 입력)", minGrade:"trs",   period:"2개월 (선착순 150억 마감 후 공지)", date:""},
  {id:38, no:"S-7",     name:"SIENA ONE 7",               nick:"",              fixedRate:false, rate:3, termMonths:3, monthlyRates:[2.5,2.5,3], rateNote:"3개월 월차별(TRS 세후 8% 기준) 2.5% / 2.5% / 3% · BLACK·TRINITY는 더 높음(직접 입력)", minGrade:"trs",   period:"26.04.03~26.07.03 (3개월)", date:"26.04.03"},
];/*@comm-end*/

let userProjects=[]; /*@comm-start*/ /* 사용자 직접 추가 프로젝트: [{id:10001+,user:true,no:'★',name,minGrade:'rs', fixedRate:true+rate(일반) 또는 termMonths+monthlyRates(단기딜)}] — rs7 블롭 저장 */ /*@comm-end*/
/*@comm-start*/function allP(){var base=APS.concat(userProjects);
  if(!projOverride||!Object.keys(projOverride).length)return base;
  return base.map(function(p){var o=projOverride[p.id];return o?Object.assign({},p,o):p;});} /* 프로젝트 전체 목록 = 기본 APS + 내 프로젝트 (조회는 항상 이걸로) *//*@comm-end*/

let rowLabels={};
let _preventSave=false;
let YR={},ET={},EI={},CS={},children=[],SP=[],pImg=null,fImg=null,longUnit=0.1,tTimer=null;
let shData={savings:{},income:{},target:{}}; var shUnit=parseInt(localStorage.getItem("rs_shunit"))||1; /* 1=원,10000=만원: 표시전용, 저장은 항상 원 */
var mdUnit=parseInt(localStorage.getItem("rs_mdunit"))||1; var lgUnit=parseInt(localStorage.getItem("rs_lgunit"))||1; /* 중기·장기 표 단위(표시전용) */
var rmTab=(function(){var v=localStorage.getItem("rs_rmtab");return (v==="short"||v==="mid"||v==="long")?v:"long";})(); /* §4.2-27 로드맵 드롭다운 마지막 선택 — 표 단위 토글과 같은 방식으로 기억, 셋 중 하나가 아니면 장기 */
let mdYR={};
let monthlyArchive={};
let charts={shortChart:null,midChart:null,longChart:null};
let customRows=[{id:'et_default',label:'이벤트/목표'}];
let customRowsMid=[];
let customRowsShort=[];
let shRowOrder=[]; let shHiddenBase=[];
/* 📋 단기 표 「넣기/빼기」(세션 66 · §2.37 단기 이식) — total 행 기준 위/아래로 월 총계 포함 여부를 정한다(중기·장기와 같은 규칙).
   비어 있으면 전부 「넣기」(=기존 동작, 커스텀 행은 무조건 합계에 들어갔다) — 기존 사용자 숫자 불변이 하드룰. */
let shExclIds=[];
/* 📋 장기 표 행 순서 (세션 65) — 커스텀 행을 투자금(A+B) 위/아래로 옮겨 15% 복리 포함 여부를 정한다(중기 mdRowOrder와 같은 규칙).
   비어 있으면 커스텀 행 전부를 L_invest 위에 놓는다 = 기존 동작(포함) 그대로. */
let lgRowOrder=[];
let shCustomOnly=false;
let mdRowOrder=[];
let customData={};
let customNotes={}; /* 로드맵 셀 메모(엑셀 셀 노트 같은 것) — 계산엔 반영 안 됨. key는 customData와 같은 형식 */
let customSectionName='인생 계획';
let lastCalcRows=[];
let milestones=[]; /* 🎯 목표 마일스톤(만원 단위 금액 배열) — rs7 저장 */
/* 🏢 부동산·갈아타기 (rs_complete 전용 G3 · 기본 OFF) — 전부 원 저장, 현금/부동산/총자산 합계는 저장하지 않고 computeRows에서 파생(§2.2) */
let reOn=false; let reP={}; let reL={}; let reR={}; let aptTargets=[]; let reView='full'; /* full=자세히(그룹 표) · simple=간단히 */
/* 💰 사용자 정의 자산 구역(블록) (세션 65 · rs_complete 전용 G3) — 현금 자산·부동산 자산과 나란한 한 덩어리.
   assetBlocks=[{id,name,rate,rows:[{id,label,neg}]}] · abV[행id_연도]=금액(원). 합계는 저장하지 않고 computeRows에서 파생(§2.2).
   블록 안 자산은 15% 복리에 들어가지 않고 자기 상승률로만 큰다. neg 행(대출·차감)은 합계에서 뺀다. */
let assetBlocks=[]; let abV={};
var _msYearCache={}; /* 도달 연도 → 라벨 (표 헤더 🎯 배지용, recalc마다 갱신) */
var sensDelta=1; /* 📐 수익률 민감도 델타(%p) — 탐색용 표시 전용, 저장 안 함 */
let dailyData=[]; let dailyDate=''; let dailyEditId=null; let dailyMood=''; let dailyCats=null; let dailyMoods=null; let weeklyBudgetMap={}; let monthlyBudgetMap={}; let dailyBudgetMap={}; let catWeeklyBudget={}; let catMonthlyBudget={}; let catWeeklyPast={}; let catMonthlyPast={}; let catMonthlyMk=null; let dailyView='daily'; let dailyLinkMonths={}; let dailyRecentExpanded=false; let dailyTree=null; var dlSelGroup='',dlSelCat='',dlSelSub='',dlTreeOpenCat={},dlPending=[]; var dlSearchQuery=''; var dlRollupYear=0; var specialPlanData=null; var specialOvVer=0,specialOvCache={}; var dailyReview=null,dlMoRevTab='carrot',dlReviewOpen=false,dlRecentOpen=true,dlAnalysisPreset='thisMonth',dlAnalysisStart='',dlAnalysisEnd='',dlAnaCatOpen={},dlOffBudgetOpen=false,dlDelCatOpen=false,dlPlanAll=false,dlPullScope='day',dlPullSel={},dlCatManage=false; /* 일일 기록(rs_daily, rs7과 분리) */
var weekStartDay=1; /* 주 정산 시작 요일 0=일~6=토, 기본 월요일(1). localStorage rs_week_start */
let lastImportLog=null;

const g=id=>document.getElementById(id);
function ar(el){el.style.height="auto";el.style.height=el.scrollHeight+"px";}
function fmt(n,bl){var dv=(lgUnit>1)?(n/lgUnit):n;var s=(lgUnit>1)?fmtUnitDisp(dv):fmtSh(dv);return bl?"<span class='blurred'>"+s+"</span>":s;}
function openYearRollup(){dlRollupYear=parseInt(monthKey(todayStr()).slice(0,4),10);renderYearRollup();var m=g('yearRollupModal');if(m)m.classList.add('open');}
function shiftRollupYear(dir){dlRollupYear+=dir;renderYearRollup();}
function renderYearRollup(){
  var yl=g('yrRollupYearLabel');if(yl)yl.textContent=String(dlRollupYear);
  var yri=g('yrRollupIcon');if(yri)yri.innerHTML=yearRollupIconHtml();
  var box=g('yearRollupBody');if(!box)return;
  var todayMk=monthKey(todayStr());
  var first=dlFirstRecDate();
  var months=[];
  for(var mi=0;mi<12;mi++){
    var mk=dlRollupYear+'-'+String(mi+1).padStart(2,'0');
    if(mk>todayMk)break;
    months.push(mk);
  }
  if(!months.length){box.innerHTML='<div style="color:var(--gray);font-size:13px;padding:16px 0;text-align:center;word-break:keep-all">아직 이 해의 기록이 없어요.</div>';return;}
  var yearTotal=0,yearCarrot=0,yearWhip=0,yearNoSpend=0,yearResist=0;
  var monthStats=[];
  months.forEach(function(mk){
    var y=parseInt(mk.slice(0,4),10),mi0=parseInt(mk.slice(5,7),10)-1;
    var fd=monthFirstDate(mk),ld=monthLastDate(mk);
    var hasEntries=monthEntries(fd).length>0;
    var total=dailyMonthTotal(y,mi0);
    var tal=monthConsumeTally(fd);
    var rt=resistMonthTotal(fd);
    var ns=0;var _c=new Date(fd+'T00:00:00'),_e=new Date(ld+'T00:00:00'),_g=0,_t=todayStr();
    while(_c<=_e&&_g<40){var ds=localDateStr(_c);if(ds<=_t&&(!first||ds>=first)&&dayNoSpend(ds))ns++;_c.setDate(_c.getDate()+1);_g++;}
    var rv=monthReviewOf(fd);
    var hasReview=!!((rv.best||rv.worst||rv.carrot||rv.whip||'').toString().trim());
    var hasData=hasEntries||hasReview||rt>0;
    monthStats.push({mk:mk,mi:mi0,total:total,tal:tal,ns:ns,rt:rt,rv:rv,hasData:hasData,hasEntries:hasEntries});
    if(hasData){yearTotal+=total;yearCarrot+=tal.carrot;yearWhip+=tal.whip;yearNoSpend+=ns;yearResist+=rt;}
  });
  var withEntries=monthStats.filter(function(s){return s.hasEntries;});
  var head='<div style="background:#f6f4ef;border-radius:8px;padding:13px 14px;margin-bottom:14px">';
  head+='<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">';
  head+='<div><div style="font-size:13px;color:var(--gray)">총지출</div><div style="font-size:17px;font-weight:700;color:#111">'+fmtComma(yearTotal)+'원</div></div>';
  head+='<div><div style="font-size:13px;color:var(--gray)">무지출</div><div style="font-size:15px;font-weight:600;color:#111">'+yearNoSpend+'일</div></div>';
  head+='<div><div style="font-size:13px;color:var(--gray)">🥕 / <img src="'+WHIP_IMG+'" alt="채찍" style="height:.9em;vertical-align:-1px"></div><div style="font-size:15px;font-weight:600;color:#111">'+yearCarrot+' / '+yearWhip+'</div></div>';
  head+='</div>';
  if(yearResist>0)head+='<div style="font-size:13px;color:var(--carrot-mk,#3f9a68);margin-top:8px">💪 올해 지켜낸 금액 <b>'+fmtComma(yearResist)+'원</b></div>';
  if(withEntries.length>=2){
    var lean=withEntries.slice().sort(function(a,b){return a.total-b.total;})[0];
    var most=withEntries.slice().sort(function(a,b){return b.total-a.total;})[0];
    if(lean.mk!==most.mk){head+='<div style="font-size:13px;color:#333;margin-top:8px;word-break:keep-all">가장 아낀 달 <b>'+(lean.mi+1)+'월</b>('+fmtComma(lean.total)+'원)</div>';head+='<div style="font-size:13px;color:#333;margin-top:3px;word-break:keep-all">가장 많이 쓴 달 <b>'+(most.mi+1)+'월</b>('+fmtComma(most.total)+'원)</div>';}
  }
  head+='</div>';
  var _yrCharts='';
  (function(){
    var wdata=monthStats.filter(function(s){return s.hasData;});
    if(wdata.length<2)return;
    function _yrColChart(title,cols,avgRatio,legendHtml,captionHtml){
      var H=96;
      var barRow=cols.map(function(c){
        var inner=(c.segs||[]).map(function(sg){return '<div style="width:100%;height:'+(sg.h*100).toFixed(1)+'%;background:'+sg.color+';opacity:'+(sg.op==null?1:sg.op)+'"></div>';}).join('');
        return '<div style="flex:1 1 0;min-width:0;display:flex;justify-content:center;align-items:flex-end;height:100%"><div style="width:70%;max-width:20px;height:100%;display:flex;flex-direction:column-reverse;border-radius:3px 3px 0 0;overflow:hidden;background:transparent">'+inner+'</div></div>';
      }).join('');
      var labelRow=cols.map(function(c){return '<div style="flex:1 1 0;min-width:0;text-align:center;font-size:11px;color:'+(c.hot?'#111':'var(--gray)')+';font-weight:'+(c.hot?'700':'400')+';white-space:nowrap">'+c.lbl+'</div>';}).join('');
      var avg=(avgRatio>0)?'<div style="position:absolute;left:0;right:0;bottom:'+(avgRatio*H).toFixed(1)+'px;height:0;border-top:1px dashed #888;pointer-events:none"></div>':'';
      return '<div style="margin-bottom:16px;word-break:keep-all"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--gray);margin-bottom:10px">'+title+'</div><div style="position:relative;height:'+H+'px;display:flex;align-items:flex-end;gap:2px">'+barRow+avg+'</div><div style="display:flex;gap:2px;margin-top:4px">'+labelRow+'</div>'+(legendHtml?'<div style="margin-top:8px;font-size:12px;color:var(--gray);display:flex;flex-wrap:wrap;gap:10px">'+legendHtml+'</div>':'')+(captionHtml?'<div style="font-size:12px;color:var(--gray);margin-top:6px;word-break:keep-all">'+captionHtml+'</div>':'')+'</div>';
    }
    function _sw(color){return '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:'+color+';vertical-align:middle;margin-right:4px"></span>';}
    var GRN='var(--carrot-mk,#3f9a68)',BRN='var(--whip-mk,#d9534f)',BLU='#6b9bd1';
    var out='<div style="margin-bottom:6px;padding:14px;border:1px solid var(--tbl-border);border-radius:8px">';
    out+='<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:14px;word-break:keep-all">한 해 흐름</div>';
    if(yearTotal>0){
      var maxTot=Math.max.apply(null,monthStats.map(function(s){return s.total;}).concat([1]));
      var avgTot=wdata.length?Math.round(wdata.reduce(function(a,s){return a+s.total;},0)/wdata.length):0;
      var mostTot=0,mostMi=-1;monthStats.forEach(function(s){if(s.total>mostTot){mostTot=s.total;mostMi=s.mi;}});
      var colsA=monthStats.map(function(s){var hot=(s.mi===mostMi&&s.total>0);return {lbl:(s.mi+1),hot:hot,segs:[{h:s.total/maxTot,color:'var(--ac)',op:hot?1:0.7}]};});
      var capA=(mostMi>=0?'가장 많이 쓴 달 <b style="color:#111">'+(mostMi+1)+'월</b> · ':'')+'점선은 월 평균 '+fmtComma(avgTot)+'원';
      out+=_yrColChart('월별 지출 흐름',colsA,avgTot/maxTot,'',capA);
    }
    if(yearCarrot+yearWhip>0){
      var maxCW=Math.max.apply(null,monthStats.map(function(s){return s.tal.carrot+s.tal.whip;}).concat([1]));
      var colsB=monthStats.map(function(s){var c=s.tal.carrot,w=s.tal.whip,tt=c+w,fr=tt/maxCW;return {lbl:(s.mi+1),segs:[{h:tt?fr*(c/tt):0,color:GRN},{h:tt?fr*(w/tt):0,color:BRN}]};});
      out+=_yrColChart('월별 마음의 흐름',colsB,0,_sw(GRN)+'당근 &nbsp;'+_sw(BRN)+'채찍','칸 높이는 그 달 당근·채찍을 남긴 수, 색은 그 비율이에요.');
    }
    if(yearNoSpend>0){
      var maxNs=Math.max.apply(null,monthStats.map(function(s){return s.ns;}).concat([1]));
      var colsC=monthStats.map(function(s){return {lbl:(s.mi+1),segs:[{h:s.ns/maxNs,color:BLU,op:0.9}]};});
      out+=_yrColChart('월별 무지출일',colsC,0,'','무지출일이 많을수록 좋아요 · 올해 합계 <b style="color:#111">'+yearNoSpend+'일</b>');
    }
    out+='</div>';
    _yrCharts=out;
  })();
  var cards=monthStats.map(function(s){
    var lbl=(s.mi+1)+'월';
    if(!s.hasData)return '<div style="display:flex;justify-content:space-between;padding:6px 2px;color:var(--gray);font-size:13px;border-bottom:1px solid var(--tbl-border)"><span>'+lbl+'</span><span>기록 없음</span></div>';
    var note='';
    var ex=(s.rv.best||s.rv.worst||s.rv.carrot||s.rv.whip||'').toString().trim();
    if(ex)note='<div style="font-size:13px;color:var(--gray);margin-top:3px;word-break:keep-all">📝 '+dlEsc(ex.length>40?ex.slice(0,40)+'…':ex)+'</div>';
    return '<div style="border:1px solid var(--tbl-border);border-radius:8px;padding:10px 12px;margin-bottom:8px">'+
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">'+
      '<span style="font-size:13px;font-weight:700;color:#111">'+lbl+'</span>'+
      '<span style="font-size:13px;color:var(--gray)">총지출 <b style="color:#111">'+fmtComma(s.total)+'</b></span></div>'+
      '<div style="font-size:13px;color:var(--gray);margin-top:3px;word-break:keep-all">🥕'+s.tal.carrot+' <img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">'+s.tal.whip+' · 무지출 '+s.ns+'일'+(s.rt>0?' · 💪'+fmtComma(s.rt):'')+'</div>'+note+'</div>';
  }).join('');
  var reviewMonths=monthStats.filter(function(s){var rv=s.rv||{};return !!((rv.carrot||rv.whip||rv.best||rv.worst||'').toString().trim());});
  var spendSection=(reviewMonths.length>=2)?yrSpendSectionHtml(monthStats):'';
  box.innerHTML=head+_yrCharts+cards+spendSection;
  if(reviewMonths.length>=2){
    renderYrSpendReading(monthStats);
    var p1=g('yrSpendPraiseBtn'),p2=g('yrSpendRegretBtn');
    if(p1){p1.style.background=(yrSpendBucket==='praise')?'var(--carrot-mk,#3f9a68)':'';p1.style.borderColor=(yrSpendBucket==='praise')?'var(--carrot-mk,#3f9a68)':'';p1.style.color=(yrSpendBucket==='praise')?'#fff':'';}
    if(p2){p2.style.background=(yrSpendBucket==='regret')?'var(--whip-mk,#d9534f)':'';p2.style.borderColor=(yrSpendBucket==='regret')?'var(--whip-mk,#d9534f)':'';p2.style.color=(yrSpendBucket==='regret')?'#fff':'';}
  }
}
var yrSpendBucket='praise';
var yrSpendMonthStats=[];
function yrSpendKeywords(monthStats){
  var texts=[];
  monthStats.forEach(function(s){
    var rv=s.rv||{};
    ['carrot','whip','best','worst'].forEach(function(k){
      var t=(rv[k]||'').toString().trim();
      if(t)texts.push(t);
    });
  });
  return extractKeywordsFromTexts(texts,2,8);
}
function yrWorstRepeats(monthStats){
  var texts=[];
  monthStats.forEach(function(s){
    var t=((s.rv&&s.rv.worst)||'').toString().trim();
    if(t)texts.push(t);
  });
  return extractKeywordsFromTexts(texts,3,3);
}
function yrSpendEntries(monthStats,bucket){
  var out=[];
  monthStats.forEach(function(s){
    var rv=s.rv||{};
    var mLabel=(s.mi+1)+'월';
    if(bucket==='regret'){
      var w=(rv.whip||'').toString().trim();if(w)out.push({m:mLabel,icon:'whip',text:w});
      var o=(rv.worst||'').toString().trim();if(o)out.push({m:mLabel,icon:'💸',text:o});
    }else{
      var c=(rv.carrot||'').toString().trim();if(c)out.push({m:mLabel,icon:'🥕',text:c});
      var b=(rv.best||'').toString().trim();if(b)out.push({m:mLabel,icon:'🏆',text:b});
    }
  });
  return out;
}
function renderYrSpendReading(monthStats){
  var box=g('yrSpendReadBody');if(!box)return;
  var entries=yrSpendEntries(monthStats,yrSpendBucket);
  if(!entries.length){box.innerHTML='<div style="font-size:13px;color:var(--gray);padding:10px 0;text-align:center">아직 작성된 내용이 없어요.</div>';return;}
  box.innerHTML=entries.map(function(e){
    var iconHtml=(e.icon==='whip')?'<img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px">':e.icon;
    return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--tbl-border)">'
      +'<span style="flex-shrink:0;font-size:13px;font-weight:700;color:var(--ac);width:44px;white-space:nowrap">'+e.m+'</span>'
      +'<span style="flex-shrink:0">'+iconHtml+'</span>'
      +'<span style="font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:keep-all">'+dlEsc(e.text)+'</span>'
      +'</div>';
  }).join('');
}
function setYrSpendBucket(b){
  yrSpendBucket=b;
  renderYrSpendReading(yrSpendMonthStats);
  var p1=g('yrSpendPraiseBtn'),p2=g('yrSpendRegretBtn');
  if(p1){p1.style.background=(b==='praise')?'var(--carrot-mk,#3f9a68)':'';p1.style.borderColor=(b==='praise')?'var(--carrot-mk,#3f9a68)':'';p1.style.color=(b==='praise')?'#fff':'';}
  if(p2){p2.style.background=(b==='regret')?'var(--whip-mk,#d9534f)':'';p2.style.borderColor=(b==='regret')?'var(--whip-mk,#d9534f)':'';p2.style.color=(b==='regret')?'#fff':'';}
}
function yrSpendSectionHtml(monthStats){
  yrSpendMonthStats=monthStats;
  var kws=yrSpendKeywords(monthStats);
  var worstRepeat=yrWorstRepeats(monthStats);
  var html='<div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--tbl-border)">';
  html+='<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:10px;word-break:keep-all">올해 나의 소비</div>';
  if(kws.length){
    var kwPal=['var(--ac)','var(--dcal-pay,#3E7CB1)','var(--dcal-fix,#C97B3C)','var(--dcal-rec,#4FA36F)','var(--dcal-hol,#D2547A)','var(--dcal-sat,#4A7C93)'];
    html+='<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:600;color:var(--gray);margin-bottom:6px;word-break:keep-all">🔑 자주 나온 단어</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
      +kws.map(function(k,i){var c=kwPal[i%kwPal.length];return '<span style="display:inline-block;padding:4px 10px;background:#fff;border:1px solid '+c+';color:'+c+';border-radius:999px;font-size:12px;white-space:nowrap">'+dlEsc(k.word)+' ×'+k.n+'</span>';}).join('')
      +'</div></div>';
  }
  if(worstRepeat.length){
    html+='<div style="background:#fff;border:1px solid #d9534f;border-radius:8px;padding:10px 12px;margin-bottom:14px">'
      +worstRepeat.map(function(k){return '<div style="font-size:13px;color:#d9534f;word-break:keep-all">💸 올해 워스트에 <b>「'+dlEsc(k.word)+'」</b>이(가) <b>'+k.n+'번</b> 등장했어요</div>';}).join('')
      +'</div>';
  }
  html+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'
    +'<button type="button" id="yrSpendPraiseBtn" onclick="setYrSpendBucket(\'praise\')" class="btn btn-ol" style="font-size:12px;padding:6px 12px;white-space:nowrap">🥕 칭찬한 말들</button>'
    +'<button type="button" id="yrSpendRegretBtn" onclick="setYrSpendBucket(\'regret\')" class="btn btn-ol" style="font-size:12px;padding:6px 12px;white-space:nowrap"><img src="'+WHIP_IMG+'" alt="채찍" style="height:1em;vertical-align:-2px"> 아쉬웠던 것들</button>'
    +'</div>'
    +'<div id="yrSpendReadBody"></div>'
    +'</div>';
  return html;
}
function closeM(id){g(id).classList.remove("open");}
function openPrivacyMod(){var m=g('privacyMod');if(m)m.classList.add('open');}
function ac(){return getComputedStyle(document.body).getPropertyValue("--chart1").trim()||"#A01035";}
function specialColor(){return getComputedStyle(document.body).getPropertyValue("--special-mk").trim()||"#D9A54B";}
/*@comm-start*/function ac2(){return getComputedStyle(document.body).getPropertyValue("--chart2").trim()||"#e8b0bc";}/*@comm-end*/

// ── 월간 회고: 올해 돌아보기 ──────────────────────────
var RECAP_MIN_MONTHS=2;
var recapYear=null,recapQIdx=0;
function recapQuestionList(){
  var out=[];
  var qbs=document.querySelectorAll('#monthly .qb');
  qbs.forEach(function(qb,i){
    var qt=qb.querySelector('.qt'),qa=qb.querySelector('.qa');
    var numEl=qt?qt.querySelector('.qn'):null;
    var num=numEl?numEl.textContent.trim():String(i+1).padStart(2,'0');
    var text=qt?qt.textContent.trim():'';
    if(numEl)text=text.replace(numEl.textContent,'').trim();
    out.push({idx:i,num:num,text:text,label:qa?qa.dataset.q:''});
  });
  return out;
}
function recapFindIdx(label){
  var list=recapQuestionList();
  for(var i=0;i<list.length;i++)if(list[i].label===label)return list[i].idx;
  return -1;
}
function recapTotalHasDataMonths(){
  return Object.keys(monthlyArchive).filter(function(k){
    var ans=monthlyArchive[k];
    return ans&&ans.some(function(a){return a&&a.trim();});
  }).length;
}
function updateYearRecapButtonState(){
  var btn=g('yearRecapBtn');
  if(!btn)return;
  var n=recapTotalHasDataMonths();
  var ic1=g('yearRecapIcon'),ic2=g('mmRecapIcon');
  if(ic1)ic1.innerHTML=recapBookIconHtml();
  if(ic2)ic2.innerHTML=recapBookIconHtml();
  var mmRow=g('mmRecapRow');
  if(n>=RECAP_MIN_MONTHS){
    btn.style.opacity='';
    btn.classList.remove('segtip');
    btn.removeAttribute('data-tip');
    if(mmRow)mmRow.style.color='';
  }else{
    btn.style.opacity='.5';
    btn.classList.add('segtip');
    btn.setAttribute('data-tip','💡 '+(RECAP_MIN_MONTHS-n)+'개월 더 기록하면 열려요');
    if(mmRow)mmRow.style.color='var(--gray)';
  }
}
function toggleMonthlyMobileMenu(){
  var d=g('monthlyMobileMenu');
  if(!d)return;
  var open=d.style.display==='block';
  d.style.display=open?'none':'block';
  if(!open){
    setTimeout(function(){
      function _c(e){
        if(!d.contains(e.target)&&e.target.id!=='monthlyMobileMenuBtn'){
          d.style.display='none';
          document.removeEventListener('click',_c);
        }
      }
      document.addEventListener('click',_c);
    },0);
  }
}
function handleMobileMonthlyAction(action){
  var d=g('monthlyMobileMenu');if(d)d.style.display='none';
  if(action==='copy')copyAnswers();
  else if(action==='save')saveMonthly();
  else if(action==='clear')clearMonthly();
  else if(action==='history')toggleMonthHistory();
  else if(action==='recap'){
    if(recapTotalHasDataMonths()<RECAP_MIN_MONTHS){
      showToast('💡 '+(RECAP_MIN_MONTHS-recapTotalHasDataMonths())+'개월 더 기록하면 열려요');
      return;
    }
    openYearRecap();
  }
}
function yearRecapMonths(year){
  var now=new Date(),curY=now.getFullYear(),curM=now.getMonth()+1;
  var out=[];
  for(var mi=1;mi<=12;mi++){
    if(year>curY||(year===curY&&mi>curM))break;
    var key=year+'-'+String(mi).padStart(2,'0');
    var ans=monthlyArchive[key]||null;
    var hasData=!!(ans&&ans.some(function(a){return a&&a.trim();}));
    out.push({key:key,m:mi,ans:ans,hasData:hasData});
  }
  return out;
}
function recapDefaultQIdx(){
  var i=recapFindIdx('다음 달 핵심 행동');
  return i>=0?i:0;
}
var RECAP_STOPWORDS=['그리고','그래서','그런데','하지만','그냥','정말','너무','조금','많이','아직','다시','계속','오늘','이번','저번','다음','한번','이제','거의','전혀','매우','진짜','약간','정도','부분','생각','자체'];
function extractKeywordsFromTexts(texts,minCount,maxN){
  minCount=minCount||2;maxN=maxN||8;
  var freq={};
  var josaRe=/(이라도|으로서|으로써|에게서|한테서|까지는|부터는|이라서|이나마|나마|이라|으로|에서|에게|한테|하고|이고|이며|이는|은|는|이|가|을|를|에|의|와|과|도|만|로|나|랑|고|요|다)$/;
  texts.forEach(function(a){
    if(!a)return;
    var toks=a.replace(/[.,!?~()\[\]"'“”‘’·…\n\r]/g,' ').split(/\s+/);
    toks.forEach(function(t){
      if(!t)return;
      var w=t;
      for(var i=0;i<2;i++){
        var stripped=w.replace(josaRe,'');
        if(stripped===w||stripped.length<2)break;
        w=stripped;
      }
      if(w.length<2)return;
      if(RECAP_STOPWORDS.indexOf(w)>=0)return;
      if(/^[0-9]+$/.test(w))return;
      freq[w]=(freq[w]||0)+1;
    });
  });
  var arr=Object.keys(freq).map(function(k){return {word:k,n:freq[k]};});
  arr.sort(function(a,b){return b.n-a.n;});
  return arr.filter(function(x){return x.n>=minCount;}).slice(0,maxN);
}
function recapExtractKeywords(months){
  var texts=[];
  months.forEach(function(m){
    if(!m.ans)return;
    m.ans.forEach(function(a){if(a)texts.push(a);});
  });
  return extractKeywordsFromTexts(texts,2,8);
}
function openYearRecap(){
  if(recapTotalHasDataMonths()<RECAP_MIN_MONTHS)return;
  var now=new Date();
  recapYear=now.getFullYear();
  var hasCurYData=yearRecapMonths(recapYear).some(function(m){return m.hasData;});
  if(!hasCurYData){
    var yrs=Object.keys(monthlyArchive)
      .filter(function(k){var ans=monthlyArchive[k];return ans&&ans.some(function(a){return a&&a.trim();});})
      .map(function(k){return parseInt(k.slice(0,4),10);});
    if(yrs.length)recapYear=Math.max.apply(null,yrs);
  }
  recapQIdx=recapDefaultQIdx();
  var m=g('yearRecapModal');if(m)m.classList.add('open');
  renderYearRecap();
}
function shiftRecapYear(dir){recapYear+=dir;renderYearRecap();}
function renderYearRecap(){
  var yl=g('recapYearLabel');if(yl)yl.textContent=String(recapYear);
  var ti=g('recapTitleIcon');if(ti)ti.innerHTML=recapBookIconHtml('1.1em');
  var box=g('recapBody');if(!box)return;
  var months=yearRecapMonths(recapYear);
  var withData=months.filter(function(m){return m.hasData;});
  if(!withData.length){
    box.innerHTML='<div style="color:var(--gray);font-size:13px;padding:16px 0;text-align:center;word-break:keep-all">이 해에는 작성된 회고가 없어요.</div>';
    return;
  }
  var totalAnswers=0;
  withData.forEach(function(m){totalAnswers+=m.ans.filter(function(a){return a&&a.trim();}).length;});
  // D. 작성 발자취
  var dots='';
  for(var mi=1;mi<=12;mi++){
    var mm=null;for(var j=0;j<months.length;j++)if(months[j].m===mi){mm=months[j];break;}
    var future=!mm,filled=mm&&mm.hasData;
    dots+='<span class="segtip" data-tip="'+mi+'월'+(filled?' · 작성됨':'')+'" style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:'+(filled?'var(--ac)':'transparent')+';border:1.5px solid var(--ac);opacity:'+(future?'.3':'1')+'"></span>';
  }
  var html='<div style="margin-bottom:18px">'
    +'<div style="font-size:14px;font-weight:700;color:#111;word-break:keep-all">올해 <b style="color:var(--ac)">'+withData.length+'</b>달 작성 · 총 <b style="color:var(--ac)">'+totalAnswers+'</b>개 답변</div>'
    +'<div style="margin-top:8px;line-height:1">'+dots+'</div>'
    +'</div>';
  // C. 자주 나온 단어 (보조 · 조사 제거 휴리스틱)
  var kw=recapExtractKeywords(months);
  if(kw.length){
    html+='<div style="margin-bottom:18px">'
      +'<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;word-break:keep-all">🔑 이 해 자주 나온 단어</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
      +kw.map(function(k){return '<span style="display:inline-block;padding:4px 10px;background:var(--ac-light);color:var(--ac);border-radius:999px;font-size:12px;white-space:nowrap">'+dlEsc(k.word)+'</span>';}).join('')
      +'</div></div>';
  }
  // B. 감정 온도 흐름
  var emoIdx=recapFindIdx('감정 온도');
  var emoLabels=[],emoData=[],hasEmoPoint=false;
  if(emoIdx>=0){
    months.forEach(function(m){
      emoLabels.push(m.m+'월');
      var raw=(m.ans&&m.ans[emoIdx])?String(m.ans[emoIdx]):'';
      var mt=raw.match(/\d{1,3}/);
      var v=mt?parseInt(mt[0],10):NaN;
      var ok=!isNaN(v)&&v>=0&&v<=100;
      if(ok)hasEmoPoint=true;
      emoData.push(ok?v:null);
    });
  }
  html+='<div style="margin-bottom:18px">'
    +'<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;word-break:keep-all">🌡️ 감정 온도 흐름</div>';
  if(hasEmoPoint){
    html+='<div id="recapEmoWrap" style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:12px;height:180px"><canvas id="recapEmoChart"></canvas></div>';
  }else{
    html+='<div style="font-size:13px;color:var(--gray);padding:8px 0">아직 숫자로 답한 감정 온도가 없어요.</div>';
  }
  html+='</div>';
  // A. 질문별 모아읽기
  var pinLabels=['다음 달 핵심 행동','이번 달 나를 칭찬한다면','되새긴 원칙'];
  var list=recapQuestionList();
  var pinsHtml='';
  pinLabels.forEach(function(lbl){
    var idx=recapFindIdx(lbl);
    if(idx<0)return;
    var meta=list[idx];
    pinsHtml+='<button type="button" class="btn btn-ol recapPin" data-idx="'+idx+'" onclick="selectRecapQ('+idx+')" style="font-size:12px;padding:5px 10px;white-space:nowrap">Q'+meta.num+' '+dlEsc(meta.text.length>14?meta.text.slice(0,14)+'…':meta.text)+'</button>';
  });
  var selectHtml='<select id="recapQSelect" onchange="selectRecapQ(parseInt(this.value,10))" style="font-size:12px;padding:5px 8px;border:1px solid var(--border);border-radius:2px;font-family:inherit;color:#111;max-width:100%">';
  list.forEach(function(q){
    selectHtml+='<option value="'+q.idx+'">Q'+q.num+' '+dlEsc(q.text.length>26?q.text.slice(0,26)+'…':q.text)+'</option>';
  });
  selectHtml+='</select>';
  html+='<div>'
    +'<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px;word-break:keep-all">'+recapBookIconHtml()+' 질문별 모아읽기</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'+pinsHtml+'</div>'
    +'<div style="margin-bottom:10px">'+selectHtml+'</div>'
    +'<div id="recapQBody"></div>'
    +'</div>';
  box.innerHTML=html;
  if(hasEmoPoint){
    mkChart('recapEmoChart',{
      type:'line',
      data:{labels:emoLabels,datasets:[{label:'감정 온도',data:emoData,borderColor:ac(),backgroundColor:'transparent',borderWidth:2.5,pointRadius:4,pointBackgroundColor:ac(),spanGaps:false,tension:0.3}]},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ct){return ct.parsed.y+'도';}}}},
        scales:{y:{min:0,max:100,ticks:{stepSize:20,font:{size:11}}},x:{ticks:{font:{size:11}},grid:{display:false}}}
      }
    });
  }
  renderRecapQuestion();
}
function selectRecapQ(idx){recapQIdx=idx;renderRecapQuestion();}
function renderRecapQuestion(){
  var body=g('recapQBody');if(!body)return;
  var months=yearRecapMonths(recapYear);
  var rows=months.filter(function(m){return m.ans&&m.ans[recapQIdx]&&m.ans[recapQIdx].trim();})
    .map(function(m){
      return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--tbl-border)">'
        +'<span style="flex-shrink:0;font-size:13px;font-weight:700;color:var(--ac);width:34px;white-space:nowrap">'+m.m+'월</span>'
        +'<span style="font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:keep-all">'+dlEsc(m.ans[recapQIdx].trim())+'</span>'
        +'</div>';
    }).join('');
  body.innerHTML=rows||'<div style="font-size:13px;color:var(--gray);padding:10px 0;text-align:center">이 질문에는 아직 작성된 답변이 없어요.</div>';
  document.querySelectorAll('.recapPin').forEach(function(btn){
    var on=parseInt(btn.dataset.idx,10)===recapQIdx;
    btn.style.background=on?'var(--ac)':'';
    btn.style.color=on?'#fff':'';
    btn.style.borderColor=on?'var(--ac)':'';
  });
  var sel=g('recapQSelect');if(sel)sel.value=String(recapQIdx);
}

/* ★ 테마 클래스는 「교체」다 — 통째 대입 금지.
   className=t 로 덮으면 body에 함께 걸려 있던 다른 상태 클래스(help-off 등)가 같이 날아가
   테마만 바꿔도 「도움말 숨김」이 풀린 것처럼 보인다(저장값은 멀쩡). */
function _applyThemeClass(el,t){
  if(!el)return;
  var TH=['crimson','mint','clay','clay2','fiesta'];
  var keep=String(el.className||'').split(/\s+/).filter(function(c){return c&&TH.indexOf(c)<0;});
  keep.unshift(t);
  el.className=keep.join(' ');
}
function setTheme(t){
  _applyThemeClass(document.body,t);_applyThemeClass(document.documentElement,t);
  document.querySelectorAll(".swatch").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".sw-"+t).forEach(s=>s.classList.add("active"));
  lsSet("rs_theme",t);
  // 테마 변경: 차트 전부 초기화 후 활성 뷰·로드맵 차트 모두 재생성(새로고침 없이 즉시 반영)
  // ★ 대시보드 차트(도넛·막대)도 반드시 여기 포함할 것 — 빠뜨리면 테마 바꿀 때 그 탭 보고 있지 않아도 차트 destroy만 되고 다시 안 그려져서 다음에 열면 빈 캔버스로 남는다(재발 금지)
  Object.keys(charts).forEach(k=>{if(charts[k]){charts[k].destroy();charts[k]=null;}});
  setTimeout(()=>{try{renderActiveView();}catch(e){}renderShort();renderMid();recalc();try{renderDashboard();}catch(e){}try{applyHelpHidden();}catch(e){}try{applyNavPin();}catch(e){}},50);
}

var _lsWarnAt=0;
/* 모든 저장의 단일 관문. 실패(용량초과 등)를 조용히 삼키지 않고 사용자에게 알린다.
   quiet=true 는 기기 로컬 메타(백업 알림용)라 실패해도 경고하지 않음. */
function lsSet(k,v,quiet){
  try{localStorage.setItem(k,v);return true;}
  catch(e){
    if(quiet)return false;
    var q=!!(e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014));
    var now=Date.now();
    if(now-_lsWarnAt>30000){
      _lsWarnAt=now;
      try{showToast(q?'⚠️ 저장 공간이 가득 차 저장하지 못했어요. 사진을 줄이고 백업을 받아 주세요.':'⚠️ 저장에 실패했어요. 백업을 받아 주세요.');}catch(_){}
    }
    return false;
  }
}

/* ── 저장공간 (localStorage 는 브라우저 사양상 origin당 약 5MiB 고정. 늘릴 수 없음) ──
   file:// 로 여는 배포 형태라 IndexedDB 를 쓸 수 없어, 5MiB 안에서 최대한 담는 전략:
   ① 사진을 사용률에 따라 더 세게 압축(적응형)  ② 사용량을 눈에 보이게  ③ 기존 사진 일괄 재압축 */
var CAB_IMG='assets/ico-cabinet.png';
var BKP_IMG='assets/ico-inbox.png';
/* 이모지는 기기·브라우저마다 모양이 달라(맥/윈도/안드로이드) 이미지로 고정한다 (WHIP_IMG 와 같은 방식) */
function icoBkp(){return '<img src="'+BKP_IMG+'" alt="백업" style="height:1em;vertical-align:-2px">';}
var LS_CAP=5*1024*1024;  // 약 5MiB
function lsBytes(){
  var n=0;
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);var v=localStorage.getItem(k)||'';n+=(k.length+v.length)*2;}}catch(e){}
  return n;  // localStorage 는 UTF-16 → 글자당 2바이트
}
function lsPct(){return Math.min(100,Math.round(lsBytes()/LS_CAP*100));}
function fmtKB(b){return (b>=1048576)?((b/1048576).toFixed(1)+'MB'):(Math.round(b/1024)+'KB');}
/* 사진 용량·장수 (EI = 연도별 인증샷) */
function imgStats(){
  var cnt=0,bytes=0;
  try{Object.keys(EI||{}).forEach(function(y){
    var arr=EI[y];if(!Array.isArray(arr))return;
    arr.forEach(function(it){var src=(it&&it.src)||'';if(!src)return;cnt++;bytes+=src.length*2;});
  });}catch(e){}
  return {count:cnt,bytes:bytes};
}
/* 사용률이 높을수록 더 세게 압축. 인증샷은 화면에서 120px 로 보여줘 작아도 충분. */
function imgProfile(){
  var p=lsPct();
  if(p>=75)return {maxW:420,q:0.55};
  if(p>=50)return {maxW:520,q:0.65};
  return {maxW:640,q:0.72};
}

var _saveSoonT=null;
/* 입력 중(oninput)에도 마지막 타이핑 400ms 뒤 저장 — 칸을 벗어나지 않고
   메뉴/백업/앱종료로 넘어가도 값이 유실되지 않게 함 */
function saveSoon(){clearTimeout(_saveSoonT);_saveSoonT=setTimeout(function(){save();},400);}
function _gv(id){var el=g(id);return el?el.value:undefined;} // 요소가 없어도 save 전체가 죽지 않게
function save(){
  clearTimeout(_saveSoonT);
  if(window._rsLoadError){ // 불러오기 실패 상태에서 저장하면 부분 상태로 기존 데이터를 덮어쓴다 — 잠금
    try{showToast("⚠️ 데이터를 불러오지 못한 상태라 저장을 잠갔어요. 메뉴 › 백업으로 먼저 내보낸 뒤 새로고침해 주세요.");}catch(_){}
    return false;
  }
  var _saveOk=false;
  try{
    localStorage.setItem("rs7",JSON.stringify({
    sY:_gv("sY"),sA:_gv("sA"),sV:_gv("sV"),
    mdY:_gv("mdY"),mdA:_gv("mdA"),mdV:_gv("mdV"),
    shYear:_gv("shYear"),period:_gv("period"),YR,ET,EI,CS,children,SP,shData,mdYR,monthlyArchive,userGrade,projInvest,projRates,projSchedule,projTerm,projRepay,projEarly,projAssetHide,projOverride,projBonus,projBonusOn,projRateStep,projRateStepOn,projAddInv,projExtRateOn,projExtRate,projExtFrom,projOwner,projInclude,projMemo,projSummaryPick,projSummaryFamily,userProjects,milestones,customRows,customRowsMid,customRowsShort,shRowOrder,shHiddenBase,shExclIds,mdRowOrder,shCustomOnly,customData,customNotes,nyHide,customSectionName,rowLabels,CRISIS,longUnit,reOn,reP,reL,reR,aptTargets,reView,assetBlocks,abV,lgRowOrder
    }));
    if(arguments[0]!==true)showToast("자동 저장됨");   // save(true)=조용히(백업 경고 기준값용). 이벤트 인자가 넘어와도 켜지지 않게 === true
    _saveOk=true;
  }catch(e){
    // 용량 초과 등 저장 실패 시 사용자에게 명확히 안내
    if(e&&(e.name==="QuotaExceededError"||e.code===22||e.code===1014)){
      showToast("⚠️ 저장 공간이 가득 차 저장하지 못했어요. 사진을 정리해야 '/*@comm-start*/+'프로젝트·'/*@comm-end*/+'로드맵 입력이 저장돼요.");
      try{if(typeof openStorageMod==="function")openStorageMod();}catch(_){} // 실패를 못 지나치게 저장공간 모달 즉시 오픈
    }else{
      showToast("⚠️ 저장에 실패했어요. 사진 크기를 줄여보세요.");
    }
  }
  // 저장 성공/실패와 무관하게 토글 갱신 (try 밖, DOM 갱신 후 실행)
/*@comm-start*/  try{syncImportToggle();}catch(_){}
  setTimeout(function(){try{syncImportToggle();}catch(_){}},0);/*@comm-end*/
  return _saveOk;
}
/* (제거됨) 죽은 load() — 호출부 없음. 실제 복원은 initApp() 내부. 세션 43 */
function showToast(msg){
  const t=g("toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(tTimer);tTimer=setTimeout(()=>t.classList.remove("show"),1600);
}


// ── 이벤트 핸들러 (escaping 없이 전역 함수로) ────────────
function crInput(el){
  var k=el.getAttribute('data-k');
  if(el.value)customData[k]=el.value;else delete customData[k];
  el.style.height='auto';el.style.height=el.scrollHeight+'px';
}
function crBlur(el){
  // 칸을 벗어날 때: 내용이 순수 숫자면 쉼표 찍기 (텍스트면 그대로)
  var k=el.getAttribute('data-k');
  var raw=(el.value||'').trim();
  var digits=raw.replace(/,/g,'');
  if(digits!==''&&/^-?\d+(\.\d+)?$/.test(digits)){
    var formatted=fmtComma(parseFloat(digits));
    el.value=formatted;
    customData[k]=formatted;
  }
  pImg=null;
  save();
}

function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",(t.getAttribute("onclick")||"").indexOf("'"+id+"'")>=0));
  document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
  if(id==="daily"){renderDaily();renderActiveView();}
  if(id==="short")renderShort();
  if(id==="assets")renderAssets();
/*@comm-start*/  setTimeout(function(){try{syncImportToggle();}catch(_){}},0);  // 탭 전환 시 토글 갱신/*@comm-end*/
  if(id==="mid")renderMid();
  /*@comm-start*/if(id==="projects")renderSP();/*@comm-end*/
  if(id==="monthly")initMonthlySelectors();
  if(id==="dashboard")renderDashboard();
  if(id==="roadmap"){
    showRmSub(rmTab);
    toggleRmTabDrop();  // 한 번 클릭으로 이동 + 팝업 오픈(다시 누르면 토글로 닫힘)
  } else closeRmTabDrop();
  if(id==="scenario"){
    // 장기탭 값이 있으면 자동 연동
    var svVal=g("sV").value;
    var pVal=g("period").value;
    if(svVal&&!g("scV").value)g("scV").placeholder=svVal+"만원 (장기탭 연동)";
    if(pVal)g("scP").value=pVal;
    renderScenario();
  }
}

// ── 그래프 헬퍼 ───────────────────────────────────────
/* ★ 줌 보정 크기: 데스크톱 섹션은 zoom:1.25인데, Chart.js 4.4.1 getMaximumSize는 부모의 getBoundingClientRect(=줌 반영 크기)로
   캔버스를 잡아 그래프가 1.25배 넓게 그려지고 페이지에 가로 스크롤이 생겼다. 공식 platform 옵션(BasePlatform)으로
   부모의 줌 미반영 내용 크기(clientWidth − 좌우 padding)로 되돌린다. 줌이 없으면(비율 1) 기본 동작 그대로. */
var RsZoomPlatform=(typeof Chart!=="undefined"&&Chart.DomPlatform)?class extends Chart.DomPlatform{
  getMaximumSize(canvas,w,h,ar){
    const r=super.getMaximumSize(canvas,w,h,ar);
    const p=canvas&&canvas.parentNode;
    if(w!==undefined||h!==undefined||!p||!p.offsetWidth||!p.getBoundingClientRect)return r;
    const z=p.getBoundingClientRect().width/p.offsetWidth;
    if(!(z>0)||Math.abs(z-1)<0.01)return r;
    const cs=getComputedStyle(p);
    const pw=p.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
    const ph=p.clientHeight-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0);
    const W=Math.max(0,Math.floor(Math.min(pw,r.width)));
    const H=ar?Math.floor(W/ar):Math.max(0,Math.floor(ph>0?Math.min(ph,r.height):r.height/z));
    return {width:W,height:H};
  }
}:null;
function mkChart(id,config){
  if(charts[id]){charts[id].destroy();charts[id]=null;}
  const el=g(id);
  if(!el)return;
  // 캔버스를 교체해서 완전히 초기화
  const parent=el.parentNode;
  const newCanvas=document.createElement("canvas");
  newCanvas.id=id;newCanvas.className=el.className;
  parent.replaceChild(newCanvas,el);
  if(RsZoomPlatform&&!config.platform)config.platform=RsZoomPlatform;
  charts[id]=new Chart(newCanvas,config);
  if(id==='dlMonthChart'||id==='dlWeekChart'||id==='spMonthChart'||id==='spCatChart')dlBindChartHover(charts[id]);
  if(id==='dlMonthDonut'||id==='assetChart')dlBindDonutHover(charts[id]);
}
/* ── 줌 보정 hover (★ 부모 컨테이너 zoom:1.25 때문에 Chart.js 기본 히트테스트가 한두 칸 밀림) ──
   getBoundingClientRect(=줌 반영) 대 offsetWidth(=줌 미반영) 비율로 누적 배율을 구해 캔버스 좌표로 되돌린다. */
function dlChartScale(cv){var r=cv.getBoundingClientRect();var sx=(cv.offsetWidth>0&&r.width>0)?(r.width/cv.offsetWidth):1;var sy=(cv.offsetHeight>0&&r.height>0)?(r.height/cv.offsetHeight):1;return {r:r,sx:sx||1,sy:sy||1};}
function dlChartHitIndex(chart,clientX){
  var cv=chart.canvas,xs=chart.scales&&chart.scales.x;if(!cv||!xs)return -1;
  var n=(chart.data&&chart.data.labels)?chart.data.labels.length:0;if(!n)return -1;
  var s=dlChartScale(cv);
  var x=(clientX-s.r.left)/s.sx;
  var i=Math.round(xs.getValueForPixel(x));
  if(isNaN(i))return -1;
  return Math.max(0,Math.min(n-1,i));
}
function dlBindChartHover(chart){
  if(!chart||!chart.canvas)return;
  var cv=chart.canvas;cv._dlChart=chart;
  if(cv._dlHoverBound)return;cv._dlHoverBound=true;
  var last=-1;
  function hide(){var c=cv._dlChart;if(!c||last<0)return;last=-1;try{c.setActiveElements([]);if(c.tooltip)c.tooltip.setActiveElements([],{x:0,y:0});c.update();}catch(e){}}
  function show(clientX,clientY,force){
    var c=cv._dlChart;if(!c)return;
    var i=dlChartHitIndex(c,clientX);
    if(i<0){hide();return;}
    if(i===last&&!force)return;
    var act=[];
    (c.data.datasets||[]).forEach(function(ds,di){
      var v=ds.data?ds.data[i]:null;
      if(v==null||!(parseFloat(v)>0))return;
      try{if(!c.isDatasetVisible(di))return;}catch(e){}
      act.push({datasetIndex:di,index:i});
    });
    if(!act.length){hide();return;}
    last=i;
    var s=dlChartScale(cv);
    var px=(clientX-s.r.left)/s.sx,py=(clientY-s.r.top)/s.sy;
    try{c.setActiveElements(act);if(c.tooltip)c.tooltip.setActiveElements(act,{x:px,y:py});c.update();}catch(e){}
  }
  cv.addEventListener('mousemove',function(e){show(e.clientX,e.clientY,false);});
  cv.addEventListener('mouseleave',hide);
  cv.addEventListener('click',function(e){show(e.clientX,e.clientY,true);});
  cv.addEventListener('touchstart',function(e){if(e.touches&&e.touches[0])show(e.touches[0].clientX,e.touches[0].clientY,true);},{passive:true});
  cv.addEventListener('touchmove',function(e){if(e.touches&&e.touches[0])show(e.touches[0].clientX,e.touches[0].clientY,false);},{passive:true});
  cv.addEventListener('touchend',hide);
}
/* ── 도넛(월간 카테고리) 줌 보정 hover ──
   막대와 같은 이유(부모 zoom:1.25로 Chart.js 기본 히트테스트가 엉뚱한 조각을 잡음).
   dlChartScale로 화면 좌표를 캔버스 좌표로 되돌린 뒤, 각 조각의 arc.inRange로 직접 판정한다. */
function dlBindDonutHover(chart){
  if(!chart||!chart.canvas)return;
  var cv=chart.canvas;cv._dlDonut=chart;
  if(cv._dlDonutBound)return;cv._dlDonutBound=true;
  var last=-1;
  function dnHide(){var c=cv._dlDonut;if(!c||last<0)return;last=-1;try{c.setActiveElements([]);if(c.tooltip)c.tooltip.setActiveElements([],{x:0,y:0});c.update();}catch(e){}}
  function dnShow(clientX,clientY,force){
    var c=cv._dlDonut;if(!c)return;
    var meta=c.getDatasetMeta?c.getDatasetMeta(0):null;var arcs=(meta&&meta.data)||[];
    if(!arcs.length){dnHide();return;}
    // 조각이 튀어나오지 않은 '쉬는 상태'의 기하(중심·반지름·각도)를 캐시해서 판정 기준을 안정화
    if(last<0||!cv._dlGeo){var a0=arcs[0];cv._dlGeo={cx:a0.x,cy:a0.y,ri:a0.innerRadius,ro:a0.outerRadius,seg:arcs.map(function(a){return {s:a.startAngle,e:a.endAngle};})};}
    var geo=cv._dlGeo;
    var s=dlChartScale(cv);
    var px=(clientX-s.r.left)/s.sx,py=(clientY-s.r.top)/s.sy;
    var dx=px-geo.cx,dy=py-geo.cy,dist=Math.sqrt(dx*dx+dy*dy);
    var hit=-1;
    if(dist>=geo.ri&&dist<=geo.ro){
      var ang=Math.atan2(dy,dx),TAU=Math.PI*2;
      for(var i=0;i<geo.seg.length;i++){
        var d=ang-geo.seg[i].s;d=d-Math.floor(d/TAU)*TAU;                 // 시작각 기준 0~2π
        var span=geo.seg[i].e-geo.seg[i].s;span=span-Math.floor(span/TAU)*TAU;if(span<=0)span+=TAU;
        if(d<span){hit=i;break;}                                          // 경계는 다음 조각 소유
      }
    }
    if(hit<0){dnHide();return;}
    if(hit===last&&!force)return;
    last=hit;
    try{c.setActiveElements([{datasetIndex:0,index:hit}]);if(c.tooltip)c.tooltip.setActiveElements([{datasetIndex:0,index:hit}],{x:px,y:py});c.update();}catch(e){}
  }
  cv.addEventListener('mousemove',function(e){dnShow(e.clientX,e.clientY,false);});
  cv.addEventListener('mouseleave',dnHide);
  cv.addEventListener('click',function(e){dnShow(e.clientX,e.clientY,true);});
  cv.addEventListener('touchstart',function(e){if(e.touches&&e.touches[0])dnShow(e.touches[0].clientX,e.touches[0].clientY,true);},{passive:true});
  cv.addEventListener('touchmove',function(e){if(e.touches&&e.touches[0])dnShow(e.touches[0].clientX,e.touches[0].clientY,false);},{passive:true});
  cv.addEventListener('touchend',dnHide);
}
var ASSET_TYPES=['현금','예적금','달러/외화','국내주식','해외주식','채권','금','펀드/ETF','부동산','연금','대출','기타'];
var assets=null;
function loadAssets(){var raw=localStorage.getItem('rs_assets');if(raw===null){var t=Date.now();assets=[{id:t+'_a',name:'',type:'현금',amount:0},{id:t+'_b',name:'',type:'예적금',amount:0},{id:t+'_c',name:'',type:'국내주식',amount:0},{id:t+'_c2',name:'',type:'해외주식',amount:0},{id:t+'_d',name:'',type:'금',amount:0},{id:t+'_e',name:'',type:'대출',amount:0}];saveAssets();return;}try{var v=JSON.parse(raw);assets=Array.isArray(v)?v:[];}catch(e){assets=[];}}
function saveAssets(){try{lsSet('rs_assets',JSON.stringify(assets));}catch(e){}loanOvVer++;}
function assetTotal(){if(!assets)loadAssets();return assets.reduce(function(s,a){var amt=parseFloat(a.amount)||0;if(a.type==='대출'){var la=assetAmt(a);return s+(a.incl?la:-la);}return s+amt;},0)+projectAssetTotalWon();}
/*@comm-start*/function projectAssetItems(){var out=[];try{if(typeof SP!=='undefined'&&SP&&SP.length){SP.forEach(function(p){var won=projCurrentPrincipalWon(p);if(won>0)out.push({name:p.name||('No.'+p.no),nick:p.nick||'',won:won,pid:p.id,status:projMaturityStatus(p),rate:(typeof projCurrentRatePct==='function'?projCurrentRatePct(p):(typeof getEffectiveRate==='function'?getEffectiveRate(p):p.rate)),short:(typeof _freshP==='function'?(_freshP(p).termMonths||0)>0:(p.termMonths||0)>0)});});}}catch(e){}return out;}
function projectAssetTotalWon(){return projectAssetItems().reduce(function(s,it){return s+it.won;},0);}/*@comm-end*//*@pub function projectAssetItems(){return [];} function projectAssetTotalWon(){return 0;} @pub*/
function addAsset(){if(!assets)loadAssets();assets.push({id:Date.now()+'_'+Math.random().toString(36).slice(2,7),name:'',type:ASSET_TYPES[0],amount:0});saveAssets();renderAssets();}
function delAsset(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;var nm=(a.name||'').trim()||'이름 없는 항목';var isLoan=a.type==='대출';rsConfirm('「'+nm+'」'+(isLoan?' 대출':'')+'을 지울까요?§§'+(isLoan?'금리·결제일·상환 기록도 함께 지워져요. 지난 가계부 기록과 다른 자산은 그대로예요.':'이 항목만 지워져요. 다른 자산과 지난 자산 흐름 기록은 그대로예요.'),function(){assets=assets.filter(function(x){return x.id!==id;});saveAssets();renderAssets();showToast('「'+nm+'」을 지웠어요');});}
function setAssetField(id,field,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;if(field==='amount'){a.amount=Math.round(parseFloat((''+val).replace(/,/g,''))||0);}else a[field]=val;saveAssets();renderAssetSummary();}
/* 자산 메모(셀 노트 같은 용도) — 열림/닫힘은 화면 상태라 저장 안 함(패널 접힘과 같은 관례 §2.23), 내용(a.note)은 setAssetField로 기존 저장 경로 그대로 재사용 */
var assetNoteOpen={};
function toggleAssetNote(id){assetNoteOpen[id]=!assetNoteOpen[id];renderAssets();}
function assetMemoHtml(a){var id=jsArg(a.id);if(!a.note&&!assetNoteOpen[a.id])return '<button type="button" class="ln-add" onclick="toggleAssetNote('+id+')">+ 메모 추가</button>';return '<div class="ln-memo-wrap"><div class="ln-k">메모 <span class="ln-u">· 계산엔 반영 안 돼요</span></div><textarea class="ln-memo" rows="2" placeholder="이 금액에 합쳐 넣은 항목이나 헷갈리기 쉬운 내용" onchange="setAssetField('+id+',\'note\',this.value)">'+dlEsc(a.note||'')+'</textarea></div>';}
function assetDelBtn(a,label){return '<button type="button" class="ln-delx" onclick="delAsset('+jsArg(a.id)+')">'+label+'</button>';}
/* 자산 항목 공용 설정 조각(대출 포함) — 글상자 없이 줄·밑줄만 */
function lnRow(k,ctl,hint){return '<div class="ln-row"><span class="ln-k">'+k+'</span><span class="ln-ctl">'+ctl+'</span>'+(hint?'<div class="ln-hint">'+hint+'</div>':'')+'</div>';}
function lnSeg(label,opts,cur,call,hint){return lnRow(label,'<span class="ln-seg">'+opts.map(function(o){return '<button type="button"'+(o[0]===cur?' class="on" aria-pressed="true"':' onclick="'+call+'"')+'>'+o[1]+'</button>';}).join('')+'</span>',hint);}
function lnToggle(label,summary,open,call){return '<div class="ln-adv-tg'+(open?' open':'')+'" onclick="'+call+'"><span class="nw">'+label+'</span><span class="ln-ctl">'+(summary?('<span class="ln-u">'+dlEsc(summary)+'</span>'):'')+'<span class="ln-chev">▾</span></span></div>';}
function assetTypeRow(a){return lnRow('자산 유형','<select class="ln-in" onchange="assetTypeChange('+jsArg(a.id)+',this.value)">'+assetTypeOpts(a)+'</select>');}
function updateAssetMotto(){var _mt=g('assetMotto');if(!_mt)return;if(!assets)loadAssets();var hv=(assets||[]).some(function(a){return (parseFloat(a.amount)||0)>0||(parseFloat(a.principal)||0)>0;});_mt.textContent=hv?'나의 자산 파악은 부자로서의 기본 덕목.':'부자되는 길의 첫걸음은 나의 자산 파악부터!';}
function recalcAssetAmount(a){var p=parseFloat(a.principal)||0;var r=parseFloat(a.rate)||0;a.amount=Math.round(p*(1+r/100));}
function toggleAssetTrack(id){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.track=!a.track;if(a.track){if(a.principal==null||a.principal==='')a.principal=parseFloat(a.amount)||0;if(a.rate==null||a.rate==='')a.rate=0;recalcAssetAmount(a);}saveAssets();renderAssets();renderAssetSummary();}
function setAssetPrincipal(id,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.principal=Math.round(parseFloat((''+val).replace(/,/g,''))||0);recalcAssetAmount(a);saveAssets();renderAssets();renderAssetSummary();}
function setAssetRate(id,val){if(!assets)loadAssets();var a=assets.filter(function(x){return x.id===id;})[0];if(!a)return;a.rate=parseFloat(val)||0;recalcAssetAmount(a);saveAssets();renderAssets();renderAssetSummary();}
function assetGainHtml(a){if(!a.track)return '';var pn=parseFloat(a.principal)||0;if(pn<=0)return '<span class="ln-none">원금을 넣으면 손익이 보여요</span>';var gain=(parseFloat(a.amount)||0)-pn;var gpct=Math.round(gain/pn*1000)/10;var up=gain>=0;return '<span class="as-gain '+(up?'up':'dn')+'">'+(up?'▲':'▼')+' '+(up?'+':'')+fmtComma(Math.round(gain/10000))+'만원 ('+(up?'+':'')+gpct+'%)</span>'+(a.type==='해외주식'?'<span class="as-taxn">양도세는 아래 합산</span>':'');}
function assetGenRows(a){var id=jsArg(a.id);var h=assetTypeRow(a)+lnSeg('투자 수익 기록',[['off','안 함'],['on','기록']],a.track?'on':'off','toggleAssetTrack('+id+')',a.track?'':'투자원금과 수익률을 넣으면 평가손익을 보여줘요');if(a.track){var pr=parseFloat(a.principal)||0;var rt=(a.rate!=null&&a.rate!=='')?a.rate:'';h+=lnRow('투자원금','<input class="ln-in num" style="width:110px" type="text" inputmode="numeric" value="'+(pr?fmtComma(pr):'')+'" placeholder="0" oninput="commaInput(this)" onchange="setAssetPrincipal('+id+',this.value)"><span class="ln-u">원</span>')+lnRow('수익률','<input class="ln-in num asrt" type="number" step="0.1" value="'+rt+'" placeholder="0" onchange="setAssetRate('+id+',this.value)"><span class="ln-u">%</span>','현재 금액은 원금 × (1+수익률)로 자동 계산돼요 → '+fmtComma(Math.round((parseFloat(a.amount)||0)/10000))+'만원');}return '<div class="ln-rows">'+h+'</div>';}
function assetSetSummary(a,parts){parts=parts||[];if(a.track)parts.unshift('수익 기록');if(a.note)parts.push('메모');return parts.join(' · ');}
function renderAssetTrackSummary(){var box=g('assetTrackSummary');if(!box)return;if(!assets)loadAssets();var tracked=assets.filter(function(a){return a.track&&(parseFloat(a.principal)||0)>0;});if(!tracked.length){box.innerHTML='';return;}var tp=0,tc=0,osGain=0;tracked.forEach(function(a){var p=parseFloat(a.principal)||0;var c=parseFloat(a.amount)||0;tp+=p;tc+=c;if(a.type==='해외주식')osGain+=(c-p);});var gain=tc-tp;var gpct=tp>0?Math.round(gain/tp*1000)/10:0;var pos=gain>=0;var gc=pos?'var(--carrot-mk,#3f9a68)':'#d9534f';var mx=Math.max(tp,tc,1);var pw=Math.round(tp/mx*100);var cw=Math.round(tc/mx*100);var bar=function(label,w,col,amt){return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-size:13px;color:var(--gray);width:32px">'+label+'</span><div style="flex:1;background:#eee;border-radius:99px;height:14px;overflow:hidden"><div style="height:100%;width:'+w+'%;background:'+col+';border-radius:99px"></div></div><span style="font-size:13px;color:#111;width:72px;text-align:right">'+fmtComma(Math.round(amt/10000))+'만원</span></div>';};var bars='<div style="margin-top:11px">'+bar('원금',pw,'var(--ac-mid,#bbb)',tp)+bar('현재',cw,gc,tc)+'</div>';var tax='';if(osGain>0){var taxable=Math.max(0,osGain-2500000);var t=Math.round(taxable*0.22);tax='<div style="font-size:13px;color:var(--gray);margin-top:11px;padding-top:9px;border-top:1px solid var(--tbl-border)">해외주식 예상 양도세 ≈ <b style="color:#111">'+fmtComma(Math.round(t/10000))+'만원</b><div style="font-size:13px;margin-top:2px">양도차익 '+fmtComma(Math.round(osGain/10000))+'만원 − 기본공제 250만원, ×22% · 연 합산 기준 참고용 추정</div></div>';}box.innerHTML='<div class="as-chartcap" style="margin-bottom:6px">투자 수익</div><div style="background:#fff;border:1px solid var(--tbl-border);border-radius:8px;padding:13px;margin-bottom:18px"><div style="font-size:13px;color:#111">투자원금 <b>'+fmtComma(Math.round(tp/10000))+'만원</b> → 현재 평가 <b>'+fmtComma(Math.round(tc/10000))+'만원</b></div><div style="font-size:13px;font-weight:700;color:'+gc+';margin-top:3px">평가손익 '+(pos?'+':'')+fmtComma(Math.round(gain/10000))+'만원 ('+(pos?'+':'')+gpct+'%)</div>'+bars+tax+'</div>';}
function assetTypeOpts(a){var inList=ASSET_TYPES.indexOf(a.type)>=0;var opts=ASSET_TYPES.map(function(x){return '<option'+(x===a.type?' selected':'')+'>'+x+'</option>';}).join('');if(!inList&&a.type)opts+='<option selected>'+dlEsc(a.type)+'</option>';opts+='<option value="__new__">+ 새 유형…</option>';return opts;}
function assetHeadHtml(a,ph){var id=jsArg(a.id);return '<div class="as-head"><input class="as-name" value="'+dlEsc(a.name||'')+'" placeholder="'+ph+'" onchange="setAssetField('+id+',\'name\',this.value)"><span class="as-amt"><input type="text" inputmode="numeric" value="'+(a.amount?fmtComma(a.amount):'')+'" placeholder="0" oninput="commaInput(this)" onchange="setAssetField('+id+',\'amount\',this.value)"><span class="ln-u">원</span></span></div>';}
function assetItemRow(a,dim){var cardBg=dim?'#fdf6f6':'#fff';var body;if(a.type==='대출'){body=assetHeadHtml(a,'대출 이름')+loanRowMobile(a);}else{var open=!!assetPrOpen[a.id];var gain=a.track?('<div class="as-gainline">'+assetGainHtml(a)+'</div>'):'';body=assetHeadHtml(a,'항목명(예: 청약통장)')+gain+lnToggle('설정',assetSetSummary(a),open,'toggleAssetPrOpen('+jsArg(a.id)+')')+(open?('<div class="ln-panel">'+assetGenRows(a)+'<div class="ln-foot">'+assetMemoHtml(a)+assetDelBtn(a,'이 항목 삭제')+'</div></div>'):'');}return '<div class="ln ln-card" style="background:'+cardBg+'">'+body+'</div>';}
function assetItemRowDesktop(a,dim){if(a.type==='대출')return loanRowDesktop(a,dim);var bg=dim?'#fdf6f6':'#fff';var id=jsArg(a.id);var open=!!assetPrOpen[a.id];var inSt='border:none;background:transparent;font-family:inherit;color:#111;width:100%;box-sizing:border-box;padding:2px 0';var dataRow='<tr class="data-row ln-drow" style="background:'+bg+'"><td class="row-name"><input class="ln-nm" value="'+dlEsc(a.name||'')+'" placeholder="항목명" onchange="setAssetField('+id+',\'name\',this.value)" style="'+inSt+';font-weight:700;font-size:13.5px"></td><td class="num amt-strong"><span class="as-dnum"><input type="text" inputmode="numeric" value="'+(a.amount?fmtComma(a.amount):'')+'" placeholder="0" oninput="commaInput(this)" onchange="setAssetField('+id+',\'amount\',this.value)" style="'+inSt+';text-align:right">원</span></td><td style="white-space:nowrap">'+(a.track?assetGainHtml(a):'<span class="d-empty">—</span>')+'</td><td class="as-act">'+(a.note?'<span class="as-memo-dot segtip" data-tip="메모 있음">📝</span>':'')+'<button type="button" class="d-chev-btn ln-dbtn'+(open?' open':'')+'" onclick="toggleAssetPrOpen('+id+')">설정 <span class="chev">▾</span></button></td></tr>';var panel=open?('<div class="ln ln-desk"><div><div class="ln-colh">설정</div>'+assetGenRows(a)+'</div><div class="ln-dcol"><div class="ln-colh">메모 <span style="font-weight:400">· 계산엔 반영 안 돼요</span></div>'+assetMemoHtml(a)+assetDelBtn(a,'이 항목 삭제')+'</div></div>'):'';return dataRow+'<tr class="expand-row'+(open?' open':'')+'"><td colspan="4" class="ln-exp">'+panel+'</td></tr>';}
function assetSectionDesktop(rowsHtml,cols){return '<div class="dtable-wrap"><table class="dtable"><thead><tr>'+cols.map(function(c){return '<th'+(c.num?' class="num"':'')+(c.w?' style="width:'+c.w+'"':'')+'>'+c.label+'</th>';}).join('')+'</tr></thead><tbody>'+rowsHtml+'</tbody></table></div>';}
function renderAssets(){var t=g('assetTable');if(!t)return;if(!assets)loadAssets();updateAssetMotto();if(!assets.length&&!projectAssetItems().length){t.innerHTML='<div style="padding:14px 2px;font-size:13px;color:var(--gray)">+ 항목 추가로 자산을 등록하세요.</div>';renderAssetSummary();return;}var order=ASSET_TYPES.filter(function(x){return x!=='대출';});assets.forEach(function(a){if(a.type!=='대출'&&order.indexOf(a.type)<0)order.push(a.type);});var h='',hd='';var first=true,firstD=true;var sectionLabel=function(label){var s='<div style="font-size:13px;font-weight:700;color:var(--ac);padding:9px 2px 10px'+(first?'':';margin-top:10px')+'">'+label+'</div>';first=false;return s;};var sectionLabelD=function(label){var s='<div style="font-size:13px;font-weight:700;color:var(--ac);padding:9px 2px 10px'+(firstD?'':';margin-top:10px;border-top:1px solid var(--tbl-border)')+'">'+label+'</div>';firstD=false;return s;};var loanCols=[{label:'대출명',w:'18%'},{label:'상환 방식',w:'14%'},{label:'대출총액',num:1,w:'15%'},{label:'이자율',num:1,w:'10%'},{label:'이번 달 납입',num:1,w:'14%'},{label:'잔액',num:1,w:'15%'},{label:'',w:'14%'}];var genCols=[{label:'항목',w:'30%'},{label:'금액',num:1,w:'22%'},{label:'평가손익',w:'32%'},{label:'',w:'16%'}];var renderType=function(tp){var items=assets.filter(function(a){return a.type===tp&&!(a.type==='대출'&&a.dismissed);});if(!items.length)return;var sub=items.reduce(function(s,a){var v=assetAmt(a);return s+((a.type==='대출'&&!a.incl)?-v:v);},0);var label=dlEsc(tp)+'  ·  소계 '+fmtComma(Math.round(sub/10000))+'만원';h+=sectionLabel(label);hd+=sectionLabelD(label);var activeItems=(tp==='대출')?items.filter(function(a){return !loanPaidOff(a);}):items;var archivedItems=(tp==='대출')?items.filter(function(a){return loanPaidOff(a);}):[];activeItems.forEach(function(a){h+=assetItemRow(a,false);});var rowsD=activeItems.map(function(a){return assetItemRowDesktop(a,false);}).join('');hd+=assetSectionDesktop(rowsD,tp==='대출'?loanCols:genCols);if(tp==='대출'&&archivedItems.length){var archLbl='지난 대출 (상환 완료 '+archivedItems.length+'건) '+(loanArchiveOpen?'▴':'▾');h+='<div onclick="toggleLoanArchive()" style="padding:7px 2px;cursor:pointer;font-size:13px;color:var(--gray);white-space:nowrap">'+archLbl+'</div>';hd+='<div onclick="toggleLoanArchive()" style="padding:7px 2px;cursor:pointer;font-size:13px;color:var(--gray);white-space:nowrap">'+archLbl+'</div>';if(loanArchiveOpen){archivedItems.forEach(function(a){h+=assetItemRow(a,true);});var rowsDA=archivedItems.map(function(a){return assetItemRowDesktop(a,true);}).join('');hd+=assetSectionDesktop(rowsDA,loanCols);}}};order.forEach(renderType);/*@comm-start*/var pj=projectAssetItems();if(pj.length){var pjLabel='RS 프로젝트 <span style="font-weight:400;font-size:13px;color:var(--gray)">· 프로젝트 탭 연동</span>  ·  소계 '+fmtComma(Math.round(projectAssetTotalWon()/10000))+'만원';h+=sectionLabel(pjLabel);hd+=sectionLabelD(pjLabel);var pjRows='';pj.forEach(function(it){var _mt=it.status;pjRows+='<tr class="data-row"'+(_mt?' style="background:#fdf6f6"':'')+'><td style="white-space:normal;word-break:keep-all;overflow-wrap:break-word;color:#111">'+dlEsc(it.name)+(it.nick?' <span style="font-weight:400;color:var(--gray)">/ '+dlEsc(it.nick)+'</span>':'')+(_mt?' <span style="font-size:12px;color:#c0392b;border:1px solid #c0392b;border-radius:9px;padding:0 6px;white-space:nowrap">'+_mt+'</span>':'')+'</td><td class="num" style="white-space:nowrap;color:#111">'+fmtComma(Math.round(it.won/10000))+'<span style="color:var(--gray)"> 만원</span></td><td style="text-align:right;white-space:nowrap;overflow:visible;text-overflow:clip">'+(_mt?'<button type="button" onclick="dismissProjAsset('+it.pid+')" style="font-size:12px;padding:2px 10px;border:1px solid #c0392b;border-radius:12px;background:#fff;color:#c0392b;white-space:nowrap">정리</button>':'<span style="font-size:12px;color:var(--gray)">자동</span>')+'</td></tr>';});h+=assetSectionDesktop(pjRows,[{label:'프로젝트',w:'62%'},{label:'원금',num:1,w:'24%'},{label:'',w:'14%'}]).replace('class="dtable"','class="dtable pj-tbl"');var pjRowsD=pj.map(function(it){var _mt=it.status;var rt=parseFloat(it.rate);return '<tr class="data-row ln-drow"'+(_mt?' style="background:#fdf6f6"':'')+'><td class="row-name" style="white-space:normal;word-break:keep-all;overflow-wrap:break-word">'+dlEsc(it.name)+(it.nick?' <span style="font-weight:400;color:var(--gray)">/ '+dlEsc(it.nick)+'</span>':'')+(_mt?' <span style="font-size:12px;font-weight:400;color:#c0392b;border:1px solid #c0392b;border-radius:9px;padding:0 6px;white-space:nowrap">'+_mt+'</span>':'')+'</td><td class="num amt-strong" style="white-space:nowrap">'+fmtComma(it.won)+' 원</td><td style="white-space:nowrap">'+(rt>0?((it.short?'월 ':'연 ')+rt+'%'):'<span class="d-empty">—</span>')+'</td><td class="as-act">'+(_mt?'<button type="button" onclick="dismissProjAsset('+it.pid+')" style="font-size:12px;padding:2px 10px;border:1px solid #c0392b;border-radius:12px;background:#fff;color:#c0392b;white-space:nowrap">정리</button>':'<span style="font-size:12px;color:var(--gray)">자동</span>')+'</td></tr>';}).join('');hd+=assetSectionDesktop(pjRowsD,[{label:'프로젝트',w:'30%'},{label:'금액',num:1,w:'22%'},{label:'수익률',w:'32%'},{label:'',w:'16%'}]);}/*@comm-end*/renderType('대출');t.innerHTML='<div class="asset-mobile-only">'+h+'</div><div class="asset-desktop-only">'+hd+'</div>';renderAssetSummary();maybeAutoSnapshot();renderAssetHistory();}
var assetTypeTarget=null;
function assetTypeChange(id,val){if(val==='__new__'){assetTypeTarget=id;var inp=g('assetTypeInput');if(inp)inp.value='';var m=g('assetTypeModal');if(m)m.classList.add('open');if(inp)setTimeout(function(){try{inp.focus();}catch(e){}},30);return;}setAssetField(id,'type',val);renderAssets();}
function confirmAssetType(){var inp=g('assetTypeInput');var n=inp?(inp.value||'').trim():'';if(n&&assetTypeTarget)setAssetField(assetTypeTarget,'type',n);var m=g('assetTypeModal');if(m)m.classList.remove('open');assetTypeTarget=null;renderAssets();}
function renderAssetSummary(){if(!assets)loadAssets();renderAssetTrackSummary();updateAssetMotto();var tot=assetTotal();var te=g('assetTotal');if(te)te.innerHTML=fmtComma(Math.round(tot/10000))+'<span class="as-top-u">만원</span>';var byType={};assets.forEach(function(a){var amt=parseFloat(a.amount)||0;var _av=(a.type==='대출')?assetAmt(a):amt;if(_av>0&&(a.type!=='대출'||a.incl))byType[a.type]=(byType[a.type]||0)+_av;});/*@comm-start*/var pjt=projectAssetTotalWon();if(pjt>0)byType['RS프로젝트']=(byType['RS프로젝트']||0)+pjt;/*@comm-end*/var names=[],data=[];Object.keys(byType).forEach(function(tp){names.push(tp);data.push(byType[tp]);});var gross=data.reduce(function(s,v){return s+v;},0);var labels=names.map(function(n,i){return n+' '+(gross>0?Math.round(data[i]/gross*100):0)+'%';});var debt=0;assets.forEach(function(a){if(a.type==='대출'&&!a.incl&&!a.dismissed)debt+=assetAmt(a);});var cap=g('assetChartCap');if(cap)cap.innerHTML=names.length?('자산 구성 <b>'+fmtComma(Math.round(gross/10000))+'만원</b>'):'';var tsub=g('assetTotalSub');if(tsub)tsub.innerHTML=(names.length&&debt>0)?('<span class="nw">자산 '+fmtComma(Math.round(gross/10000))+'만원</span> · <span class="nw">대출 −'+fmtComma(Math.round(debt/10000))+'만원</span>'):'';if(!g('assetChart'))return;if(!labels.length){if(charts['assetChart']){charts['assetChart'].destroy();charts['assetChart']=null;}return;}var colors=themePalette(labels.length);mkChart('assetChart',{type:'doughnut',data:{labels:labels,datasets:[{data:data,backgroundColor:colors,borderWidth:1,borderColor:'#fff',hoverOffset:0,hoverBorderColor:'#fff',hoverBorderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,events:['click'],onClick:function(){},plugins:{legend:{position:'right',labels:{font:{size:12},boxWidth:12}},tooltip:{position:'nearest',displayColors:true,padding:9,callbacks:{title:function(it){return it.length?names[it[0].dataIndex]:'';},label:function(ct){var v=ct.parsed||0;var pc=gross>0?Math.round(v/gross*100):0;return fmtComma(Math.round(v/10000))+'만원 ('+pc+'%)';}}}}}});}
function hexToHsl(hex){hex=(hex||'').trim();var m=/^#?([0-9a-fA-F]{6})$/.exec(hex);if(!m)return null;var num=parseInt(m[1],16);var r=(num>>16&255)/255,gr=(num>>8&255)/255,b=(num&255)/255;var mx=Math.max(r,gr,b),mn=Math.min(r,gr,b),l=(mx+mn)/2,hh,s;if(mx===mn){hh=s=0;}else{var dd=mx-mn;s=l>0.5?dd/(2-mx-mn):dd/(mx+mn);if(mx===r)hh=(gr-b)/dd+(gr<b?6:0);else if(mx===gr)hh=(b-r)/dd+2;else hh=(r-gr)/dd+4;hh*=60;}return {h:Math.round(hh),s:Math.round(s*100),l:Math.round(l*100)};}
function themePalette(n){var ac='';try{ac=getComputedStyle(document.body).getPropertyValue('--ac');}catch(e){}var hsl=hexToHsl(ac)||{h:344,s:80,l:35};var out=[];n=Math.max(1,n);for(var i=0;i<n;i++){var tt=n>1?i/(n-1):0;var l=Math.round((hsl.l-6)+tt*48);if(l>72)l=72;if(l<24)l=24;var hue=(hsl.h+i*16)%360;var sat=Math.max(28,hsl.s-i*4);out.push('hsl('+hue+','+sat+'%,'+l+'%)');}return out;}
function reflectAssetsToRoadmap(){if(!assets)loadAssets();if(!assets.length&&!projectAssetItems().length){showToast('등록된 자산이 없어요');return;}var tot=assetTotal();if(tot<=0){showToast('총 자산이 0원 이하라 반영하지 않았어요');return;}var man=Math.round(tot/10000);var cur=g('sV')?g('sV').value:'';rsConfirm('장기 로드맵 시작 자산을 '+fmtComma(man)+'만원으로 바꿀까요?§§지금 값: '+(cur!==''?fmtComma(cur)+'만원':'비어 있음')+'. 시작 자산 한 칸만 바뀌고, 로드맵의 다른 연도 입력은 그대로예요.',function(){if(g('sV')){g('sV').value=man;if(typeof recalc==='function')recalc();if(typeof save==='function')save();}showToast('장기 로드맵 시작 자산에 반영했어요');});}
var assetHistory=null;
function loadAssetHistory(){try{var v=JSON.parse(localStorage.getItem('rs_asset_history')||'null');assetHistory=Array.isArray(v)?v:[];}catch(e){assetHistory=[];}}
function saveAssetHistory(){try{lsSet('rs_asset_history',JSON.stringify(assetHistory));}catch(e){}}
function currentYM(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2);}
function assetByType(){if(!assets)loadAssets();var bt={};assets.forEach(function(a){var amt=parseFloat(a.amount)||0;if(amt>0)bt[a.type]=(bt[a.type]||0)+amt;});/*@comm-start*/var pjt=projectAssetTotalWon();if(pjt>0)bt['RS프로젝트']=(bt['RS프로젝트']||0)+pjt;/*@comm-end*/return bt;}
function snapshotAssets(manual){if(!assetHistory)loadAssetHistory();var ym=currentYM();var snap={ym:ym,total:assetTotal(),byType:assetByType()};var idx=-1;for(var i=0;i<assetHistory.length;i++){if(assetHistory[i].ym===ym){idx=i;break;}}if(idx>=0&&assetHistory[idx].md)snap.md=assetHistory[idx].md;if(manual)snap.md=todayStr();if(idx>=0)assetHistory[idx]=snap;else assetHistory.push(snap);assetHistory.sort(function(a,b){return a.ym<b.ym?-1:1;});saveAssetHistory();if(manual){renderAssetHistory();try{dlRenderAsnapBanners();}catch(e){}showToast('이번 달('+ym+') 자산을 기록했어요');}}
function maybeAutoSnapshot(){if(!assetHistory)loadAssetHistory();var ym=currentYM();var has=assetHistory.some(function(s){return s.ym===ym;});if(!has&&(assets&&assets.length||projectAssetItems().length))snapshotAssets(false);}
function renderAssetHistory(){if(!assetHistory)loadAssetHistory();var box=g('assetHistBox');if(box){if(assetHistory.length<1){box.innerHTML='<div style="font-size:13px;color:var(--gray);margin-bottom:10px">📸 이번 달 기록을 누르면 자산 흐름이 쌓여서 추이를 볼 수 있어요.</div>';}else{var last=assetHistory[assetHistory.length-1];var prev=assetHistory.length>=2?assetHistory[assetHistory.length-2]:null;var html='<div style="font-size:13px;margin-bottom:10px">최근 기록 <b>'+last.ym+'</b> · 총 <b style="color:var(--ac)">'+fmtComma(Math.round(last.total/10000))+'만원</b>';if(prev){var df=last.total-prev.total;var pc=prev.total!==0?Math.round(df/Math.abs(prev.total)*1000)/10:null;var up=df>=0;html+=' <span style="color:'+(up?'#1B6E4F':'#d9534f')+';font-weight:600">'+(up?'▲':'▼')+' '+fmtComma(Math.abs(Math.round(df/10000)))+'만원'+(pc===null?'':(' ('+(up?'+':'')+pc+'%)'))+'</span> <span style="font-size:13px;color:var(--gray)">직전 대비</span>';}html+='</div>';box.innerHTML=html;}}if(g('assetTrendChart')){if(assetHistory.length<2){if(charts['assetTrendChart']){charts['assetTrendChart'].destroy();charts['assetTrendChart']=null;}}else{var labels=assetHistory.map(function(s){return s.ym;});var data=assetHistory.map(function(s){return Math.round(s.total/10000);});mkChart('assetTrendChart',{type:'line',data:{labels:labels,datasets:[{label:'총자산(만원)',data:data,borderColor:ac(),backgroundColor:'transparent',borderWidth:2.5,pointRadius:3,pointBackgroundColor:ac(),tension:0.2,fill:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ct){return fmtComma(ct.parsed.y)+'만원';}}}},scales:{y:{ticks:{callback:function(v){return fmtComma(v);}}}}}});}}}


// ── 단기 그래프 (막대) ────────────────────────────────
function updateShortChart(yr,projMo){
  const sal=MONTHS.map((_,i)=>Math.round((shData.savings[yr+"_"+i]||0)/10000));
  const inc=MONTHS.map((_,i)=>Math.round((shData.income[yr+"_"+i]||0)/10000));
/*@comm-start*/  const prj=MONTHS.map((_,i)=>Math.round((getMonthlyProjectWon(yr,i)||0)/10000));/*@comm-end*/
  const tgt=MONTHS.map((_,i)=>Math.round((shData.target[yr+"_"+i]||0)/10000));
  var custPalette=["#7B8FA1","#B5838D","#6D9886","#C9A66B","#9A8C98","#8E7DBE","#5C8374","#BC9F8B"];
  // 수입 항목 목록 만들기 (라벨, 색, 월별값)
  var incomeItems=[
    {label:"급여", color:ac(), data:sal},
    {label:"기타소득", color:ac(), alpha:"88", data:inc}/*@comm-start*/,
    {label:"프로젝트", color:ac2(), data:prj}/*@comm-end*/
  ];
  var expenseArr=MONTHS.map(()=>0);
  customRowsShort.forEach(function(cr,ci){
    if(cr.label==="목표액"||cr.id.indexOf("target")>=0)return;
    var arr=MONTHS.map((_,i)=>Math.round((pcd(cr.id+"_sh_"+yr+"_"+i)||0)/10000));
    if(arr.every(v=>v===0))return;
    var col=custPalette[ci%custPalette.length];
    var posArr=arr.map(v=>v>0?v:0);
    arr.forEach((v,i)=>{ if(v<0)expenseArr[i]+=(-v); });
    if(posArr.some(v=>v>0))incomeItems.push({label:cr.label||"항목", color:col, data:posArr});
  });
  MONTHS.forEach(function(_,i){var _dlw=dailyLinkExpenseWon(yr,i);if(_dlw>0)expenseArr[i]+=Math.round(_dlw/10000);});
  var totalIncome=MONTHS.map((_,i)=>incomeItems.reduce((s,it)=>s+(it.data[i]||0),0));
  var chartMax=Math.max.apply(null, totalIncome.concat(tgt).concat([0]))*1.1;
  var netSave=MONTHS.map((_,i)=>Math.max(0,totalIncome[i]-expenseArr[i])); // 순저축 경계
  var hasExpense=expenseArr.some(v=>v>0);
  // 각 항목을 순저축 경계로 진한/반투명 조각 분리. 아래부터 누적.
  var cum=MONTHS.map(()=>0);
  var datasets=[];
  incomeItems.forEach(function(it){
    var solidArr=[], fadeArr=[];
    MONTHS.forEach(function(_,i){
      var v=it.data[i]||0;
      var bottom=cum[i], top=cum[i]+v;
      var net=netSave[i];
      // 순저축 경계(net) 기준 분리
      var solid=Math.max(0, Math.min(top,net)-bottom);      // net 이하 부분
      var fade=Math.max(0, top-Math.max(bottom,net));        // net 초과 부분(지출 구간)
      solidArr.push(solid);
      fadeArr.push(fade);
      cum[i]=top;
    });
    var base=it.color+(it.alpha||"dd");
    if(solidArr.some(v=>v>0))datasets.push({label:it.label, data:solidArr, stack:"a", backgroundColor:base});
    if(hasExpense&&fadeArr.some(v=>v>0))datasets.push({label:it.label+" (지출분)", data:fadeArr, stack:"a", backgroundColor:it.color+"33", borderColor:it.color+"66", borderWidth:0.5});
  });
  datasets.push({label:"목표액 (점선)", data:tgt, type:"line", yAxisID:"yGoal", borderColor:"#444",borderWidth:1.8,borderDash:[6,4],pointRadius:2,pointBackgroundColor:"#444",fill:false,tension:0.1});
  if(charts.shortChart){charts.shortChart.destroy();charts.shortChart=null;}
  var _shFs=dlFontScale();
  mkChart("shortChart",{
    type:"bar",
    data:{labels:MONTHS, datasets:datasets},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:"top",labels:{font:{family:"DM Sans",size:Math.round(11*_shFs)},boxWidth:12,
        filter:function(item){return item.text.indexOf("(지출분)")<0;}}},
        tooltip:{titleFont:{size:Math.round(12*_shFs)},bodyFont:{size:Math.round(12*_shFs)},
          filter:function(item){return item.dataset.label.indexOf("(지출분)")<0;},
          callbacks:{
            beforeBody:function(items){
              if(!items.length)return [];
              var i=items[0].dataIndex, exp=expenseArr[i]||0;
              return exp>0?["지출 "+Math.round(exp).toLocaleString()+"만원"]:[];
            },
            label:function(c){
              var i=c.dataIndex, base=c.dataset.label;
              var fadeDs=c.chart.data.datasets.find(function(d){return d.label===base+" (지출분)";});
              var total=(c.parsed.y||0)+(fadeDs?(fadeDs.data[i]||0):0);
              return base+": "+Math.round(total).toLocaleString()+"만원";
            }
          }}},
      scales:{
        x:{ticks:{font:{size:Math.round(10*_shFs)}},grid:{display:false},stacked:true},
        y:{ticks:{font:{size:Math.round(10*_shFs)},callback:v=>v.toLocaleString()},grid:{color:"#f0f0f0"},stacked:true,beginAtZero:true,min:0,max:chartMax},
        yGoal:{display:false,stacked:false,beginAtZero:true,min:0,max:chartMax,position:"left",grid:{display:false}}
      }
    }
  });
}

// ── 중기 그래프 (라인) ────────────────────────────────
function updateMidChart(rs){
  const totals=rs.map(r=>Math.round(r.tot/10000));
  const assets=rs.map(r=>Math.round(r.asset/10000));
  const labels=rs.map(r=>r.y+"년");
  if(charts.midChart){
    charts.midChart.data.labels=labels;
    charts.midChart.data.datasets[0].data=totals;
    charts.midChart.data.datasets[1].data=assets;
    charts.midChart.update("none");
    return;
  }
  var _miFs=dlFontScale();
  mkChart("midChart",{
    type:"line",
    data:{
      labels,
      datasets:[
        {label:"총 합계",data:totals,borderColor:ac(),backgroundColor:ac()+"22",borderWidth:2,pointRadius:3,fill:true,tension:0.3},
        {label:"투자원금",data:assets,borderColor:"#aaa",backgroundColor:"transparent",borderWidth:1.5,pointRadius:1,borderDash:[4,3],tension:0.3}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:"top",labels:{font:{family:"DM Sans",size:Math.round(11*_miFs)},boxWidth:12}},
        tooltip:{titleFont:{size:Math.round(12*_miFs)},bodyFont:{size:Math.round(12*_miFs)},callbacks:{label:ctx=>ctx.dataset.label+": "+ctx.parsed.y.toLocaleString()+"만원"}}},
      scales:{
        x:{ticks:{font:{size:Math.round(10*_miFs)}},grid:{display:false}},
        y:{ticks:{font:{size:Math.round(10*_miFs)},callback:v=>v.toLocaleString()+"만"},grid:{color:"#f0f0f0"}}
      }
    }
  });
}

// ── 장기 그래프 (로그 스케일, 억원 단위) ─────────────
function setLongUnit(u){
  longUnit=u;
  ["0.1","1","10"].forEach(function(k){
    var b=g("lu-"+k); if(b)b.className="lu-btn"+(parseFloat(k)===u?" lu-on":"");
  });
  var lbl=g("longUnitLabel"); if(lbl)lbl.textContent="로그 스케일 · 단위: "+(u<1?u+"억":u+"억");
  if(charts.longChart){charts.longChart.destroy();charts.longChart=null;}  // 축 재생성
  if(lastCalcRows)updateLongChart(lastCalcRows);
}
function updateLongChart(rows){
  try{var bl=g('blur')&&g('blur').checked;var sumEl=g('longSummary'),msEl=g('longMilestones');if(rows&&rows.length){var _st=rows[0].asset||0,_fn=rows[rows.length-1].tot||0,_yr=rows.length-1,_mu=_st>0?(_fn/_st):0;var B=function(t){return bl?"<span class='blurred'>"+t+"</span>":t;};if(sumEl)sumEl.innerHTML="시작 <b>"+B(fmtEok(_st))+"</b> <span style='color:var(--gray)'>\u2192</span> "+_yr+"년 후 <b style='color:var(--ac)'>"+B(fmtEok(_fn))+"</b>"+(_mu>0?" <span style='color:var(--gray)'>\u00b7 약 "+(Math.round(_mu*10)/10)+"배</span>":"");var _sm=rows.filter(function(_,i){return i%5===0||i===rows.length-1;});if(msEl)msEl.innerHTML=_sm.map(function(r){return "<div class='ms-chip'><div class='ms-y'>"+r.y+(r.age!=null?" \u00b7 "+r.age+"세":"")+"</div><div class='ms-v'>"+B(fmtEok(r.tot))+"</div></div>";}).join('');}else{if(sumEl)sumEl.innerHTML='';if(msEl)msEl.innerHTML='';}}catch(e){}
  const sampled=rows.filter((_,i)=>i%5===0||i===rows.length-1);
  const toEok=v=>parseFloat((v/1e8).toFixed(3));
  const minV=longUnit;  // 최소 표시값 = 선택 단위
  const totals=sampled.map(r=>Math.max(minV,toEok(r.tot)));
  const assets=sampled.map(r=>Math.max(minV,toEok(r.asset)));
  const labels=sampled.map(r=>r.y+"년");
  if(charts.longChart){
    charts.longChart.data.labels=labels;
    charts.longChart.data.datasets[0].data=totals;
    charts.longChart.data.datasets[1].data=assets;
    charts.longChart.update("none");
    return;
  }
  var _loFs=dlFontScale();
  mkChart("longChart",{
    type:"line",
    data:{
      labels,
      datasets:[
        {label:"총자산",data:totals,borderColor:ac(),backgroundColor:ac()+"18",borderWidth:2.5,pointRadius:4,pointHoverRadius:6,fill:true,tension:0.4},
        {label:"투자원금",data:assets,borderColor:"#bbb",backgroundColor:"transparent",borderWidth:1.5,pointRadius:2,borderDash:[5,4],tension:0.4}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:"top",labels:{font:{family:"DM Sans",size:Math.round(11*_loFs)},boxWidth:12}},
        tooltip:{titleFont:{size:Math.round(12*_loFs)},bodyFont:{size:Math.round(12*_loFs)},callbacks:{label:ctx=>ctx.dataset.label+": "+ctx.parsed.y.toFixed(longUnit<1?1:2)+"억원"}}
      },
      scales:{
        x:{ticks:{font:{size:Math.round(10*_loFs)}},grid:{display:false}},
        y:{
          type:"logarithmic",
          ticks:{
            font:{size:Math.round(10*_loFs)},
            callback:v=>{
              const base=[1,5,10,50,100,500,1000,5000,10000];
              const candidates=base.map(b=>b*longUnit);
              if(candidates.some(cv=>Math.abs(v-cv)<cv*0.001))return (longUnit<1?v.toFixed(1):v)+"억";
              return "";
            },
            maxTicksLimit:8
          },
          grid:{color:"#f0f0f0"}
        }
      }
    }
  });
}
