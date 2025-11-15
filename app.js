// 內建題庫（fetch 失敗時做 fallback）
const builtinQuestions = [
  { q: 'AI 是用來模擬或增強人類智慧的技術嗎？', a: true, hint: 'AI 的目標之一是模擬、輔助或自動化人類的智能行為。', explain: 'AI 包含許多技術與方法，目標包括模擬與擴增人類在感知、推理、決策等方面的能力。' },
  { q: '深度學習 (Deep Learning) 通常使用神經網路。', a: true, hint: '深度學習利用多層神經網路來學習資料中的抽象特徵。', explain: '深度學習是以多層（深度）神經網路為核心來自動學習資料表示，特別適合影像、語音等資料。' },
  { q: '監督式學習不需要任何標註資料。', a: false, hint: '監督式學習需要標註（輸入-輸出）配對來訓練模型。', explain: '監督式學習依賴已標註的訓練資料（輸入與正確輸出），模型從中學習映射關係。' },
  { q: '強化學習 (Reinforcement Learning) 是透過獎勵學習策略。', a: true, hint: '強化學習透過反覆試錯、獎勵與懲罰來學習決策策略。', explain: '強化學習讓代理在環境中透過行動獲得回饋（獎勵或懲罰），逐步學會提高總回報的策略。' },
  { q: '過度配適（overfitting）是指模型在訓練資料上表現很好，但在未見過的資料上表現差。', a: true, hint: '過度配適通常因模型過於複雜或訓練時間過長造成。', explain: '過度配適發生於模型記住訓練資料的雜訊而非學到泛化規則，常用正則化或更多資料來改善。' },
  { q: '監督式學習比非監督式學習一定更好。', a: false, hint: '哪種方法較好取決於問題與可用資料；兩者各有用途。', explain: '監督或非監督各有優缺點，選擇取決於是否有標註資料以及問題類型（分類、聚類等）。' },
  { q: '資料前處理（例如正規化）對於訓練機器學習模型通常很重要。', a: true, hint: '標準化、正規化與清洗資料常常能提升模型效果。', explain: '資料前處理能消除尺度差異、處理遺失值與異常值，使模型更容易收斂並得到較佳結果。' },
  { q: 'AI 模型的可解釋性（explainability）在所有應用中都不是必要的。', a: false, hint: '在醫療、金融等高風險領域，可解釋性常常非常重要。', explain: '雖然某些應用可接受黑箱模型，但在高風險或需合規的場景中，可解釋性十分重要以追蹤與檢查決策依據。' },
  { q: '生成式對抗網路（GANs）可用於生成逼真的影像或資料。', a: true, hint: 'GANs 由生成器與判別器對抗訓練，能生成逼真樣本。', explain: 'GANs 透過生成器與判別器的對抗過程，能學到資料分布並產生高品質的合成樣本。' },
  { q: '在大多數情況下，更多資料對模型的性能沒有幫助。', a: false, hint: '通常更多且多樣的資料能改善模型性能，但資料品質也很重要。', explain: '更多且多樣的高品質資料通常能改善模型的泛化能力，但資料標註與品質也很關鍵。' }
];

let questions = builtinQuestions; // 會在 fetch 成功時被覆寫

let state = {
  score: 0,
  current: 0,
  hintsLeft: 3,
};

// 元件
const btnStart = document.getElementById('btn-start');
const home = document.getElementById('home');
const game = document.getElementById('game');
const questionEl = document.getElementById('question');
const choices = document.querySelectorAll('.choice');
const scoreEl = document.getElementById('score');
const resultEl = document.getElementById('result');
const hintBuddy = document.getElementById('hint-buddy');
const hintBox = document.getElementById('hint-box');
const finalScreen = document.getElementById('final');
const finalScoreEl = document.getElementById('final-score');
const btnRestart = document.getElementById('btn-restart');
const btnBackHome = document.getElementById('btn-backhome');
const finalAnim = document.getElementById('final-anim');
const finalMessage = document.getElementById('final-message');

function showHome(){
  home.classList.remove('hidden');
  game.classList.add('hidden');
  finalScreen.classList.add('hidden');
  // 顯示開始按鈕，隱藏提示小人物
  btnStart.classList.remove('hidden');
  hintBuddy.classList.add('hidden');
}
function startGame(){
  state.score = 0;
  state.current = 0;
  state.hintsLeft = 3;
  updateScore();
  home.classList.add('hidden');
  finalScreen.classList.add('hidden');
  game.classList.remove('hidden');
  // 遊戲中隱藏開始按鈕並顯示提示小人物
  btnStart.classList.add('hidden');
  hintBuddy.classList.remove('hidden');
  resultEl.textContent = '';
  showQuestion();
}

function showQuestion(){
  const q = questions[state.current];
  // 動畫：重置 fade-in
  const qa = document.getElementById('question-area');
  qa.classList.remove('fade-in');
  void qa.offsetWidth; // force reflow
  qa.classList.add('fade-in');
  questionEl.textContent = `${state.current + 1}. ${q.q}`;
  resultEl.textContent = '';
  // 若有提示機會，啟用提示按鈕；否則禁用
  if(state.hintsLeft > 0){
    hintBuddy.classList.remove('disabled');
  } else {
    hintBuddy.classList.add('disabled');
  }
}

// 嘗試從 questions.json 載入題庫（有失敗則使用內建）
fetch('questions.json')
  .then(r => {
    if(!r.ok) throw new Error('network');
    return r.json();
  })
  .then(data => {
    if(Array.isArray(data) && data.length > 0){
      questions = data;
      console.log('Loaded questions.json');
    }
  })
  .catch(err => {
    console.warn('Failed to load questions.json, using builtin questions.', err);
  });

function updateScore(){
  scoreEl.textContent = state.score;
}

choices.forEach(btn => {
  btn.addEventListener('click', () => {
    // 防止重複點選
    if(resultEl.dataset.locked === '1') return;
    const choice = btn.dataset.choice === 'true';
    const q = questions[state.current];
    if(choice === q.a){
      state.score += 10;
      resultEl.style.color = 'green';
      // 顯示正確 + 解釋
      resultEl.innerHTML = `答對！+10 分<br><small>${q.explain}</small>`;
    } else {
      resultEl.style.color = 'red';
      // 顯示錯誤 + 解釋
      resultEl.innerHTML = `答錯！<br><small>${q.explain}</small>`;
    }
  // 答題後暫時禁用提示按鈕，避免在解釋顯示時再次點提示
  hintBuddy.classList.add('disabled');
  resultEl.dataset.locked = '1';
    updateScore();
    setTimeout(() => {
      resultEl.dataset.locked = '0';
      state.current++;
      if(state.current >= questions.length){
        // 顯示結算頁而不是直接回首頁
        finalScoreEl.textContent = state.score;
        game.classList.add('hidden');
        finalScreen.classList.remove('hidden');
        // 結算時隱藏提示小人物，開始按鈕不顯示（使用結算的按鈕）
        hintBuddy.classList.add('hidden');
        btnStart.classList.add('hidden');
        // show final with tiered animation
        showFinalScreen(state.score);
      } else {
        showQuestion();
      }
    }, 3000);
  });
});

function clearFinalAnim(){
  finalAnim.innerHTML = '';
  finalAnim.className = 'final-anim';
  finalMessage.textContent = '';
}

function showFinalScreen(score){
  clearFinalAnim();
  // score range: 0..(questions.length * 10)
  const max = questions.length * 10;
  const pct = Math.round((score / max) * 100);
  // Tier rules: >=80% fireworks, 60-79 encourage, <60 sad
  if(pct >= 80){
    finalAnim.classList.add('tier-fireworks');
    finalMessage.textContent = '太棒了！煙火慶祝你的好成績！';
    // create confetti-like dots with random directions
    for(let i=0;i<20;i++){
      const s = document.createElement('span');
      s.className = 'confetti-dot';
      s.style.background = `hsl(${Math.floor(Math.random()*360)},70%,60%)`;
      const tx = (Math.random()*300 - 150) + 'px';
      const ty = (Math.random()*-220 - 40) + 'px';
      s.style.setProperty('--tx', tx);
      s.style.setProperty('--ty', ty);
      s.style.left = '50%';
      s.style.top = '50%';
      // randomize delay and duration for nicer effect
      s.style.animationDelay = (Math.random()*0.3) + 's';
      s.style.animationDuration = (0.9 + Math.random()*0.8) + 's';
      finalAnim.appendChild(s);
    }
  } else if(pct >= 60){
    finalAnim.classList.add('tier-encourage');
    const div = document.createElement('div');
    div.className = 'encourage';
    div.textContent = '不錯喔！加油，再接再厲！';
    finalAnim.appendChild(div);
    finalMessage.textContent = '持續努力，你可以更好！';
  } else {
    finalAnim.classList.add('tier-sad');
    const div = document.createElement('div');
    div.className = 'sad';
    div.textContent = '有點可惜，再試一次吧。';
    finalAnim.appendChild(div);
    finalMessage.textContent = '別氣餒，下一次會更好。';
  }
}

btnStart.addEventListener('click', startGame);

// 小人物提示行為
hintBuddy.addEventListener('click', () => {
  // 如果處於 disabled 狀態，忽略點擊
  if(hintBuddy.classList.contains('disabled')) return;
  if(state.hintsLeft <= 0){
    hintBox.textContent = '沒有提示機會了！';
  } else {
    const q = questions[state.current];
    hintBox.innerHTML = `<div>${q.hint}</div><small class="hint-meta">剩餘提示：${state.hintsLeft - 1}</small>`;
    state.hintsLeft--;
  }
  hintBox.classList.remove('hidden');
  // 自動隱藏提示框在 3 秒後
  setTimeout(()=> hintBox.classList.add('hidden'), 3000);
});

// 初始化
showHome();
updateScore();

// 結算畫面按鈕行為
btnRestart.addEventListener('click', () => {
  // 重新開始遊戲
  finalScreen.classList.add('hidden');
  startGame();
});

btnBackHome.addEventListener('click', () => {
  // 回首頁（不保留遊戲畫面）
  finalScreen.classList.add('hidden');
  // 使用現有 showHome() 以確保按鈕顯示/隱藏邏輯一致
  btnStart.textContent = '開始遊戲';
  showHome();
});
