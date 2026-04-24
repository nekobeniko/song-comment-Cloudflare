document.getElementById('submitBtn').addEventListener('click', async () => {
  const title = document.getElementById('title').value;
  const genre = document.getElementById('genre').value;
  const lyrics = document.getElementById('lyrics').value;
  // 追加：セレクトボックスから選択されたタイプを取得
  const tone = document.getElementById('toneSelect').value;

  const btn = document.getElementById('submitBtn');
  const outputContainer = document.getElementById('outputContainer');
  const outX = document.getElementById('outX');
  const outReview = document.getElementById('outReview');

  if (!title || !genre || !lyrics) {
      alert('全部入力してね！');
      return;
  }

  // 画面の準備
  btn.disabled = true;
  btn.innerText = 'AIが熱唱中...';
  outputContainer.style.display = 'none';

  try {
      // Workersへ送信（bodyに tone を追加）
      const response = await fetch('https://music-fan-comment.nekobeniko.workers.dev', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, genre, lyrics, tone }),
      });

      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.text || '通信エラーが発生しました');
      }

      const fullText = data.text;

      // AIの回答を「X用」と「感想」に切り分ける
      let xText = "";
      let reviewText = "";

      // Workers側で「X用：〜 感想：〜」の形式で出力されることを想定
      if (fullText.includes('感想：')) {
          const parts = fullText.split('感想：');
          xText = parts[0].replace('X用：', '').trim();
          reviewText = parts[1] ? parts[1].trim() : "";
      } else {
          xText = fullText;
          reviewText = "（感想の取得に失敗しました）";
      }

      // 画面に表示
      outX.innerText = xText;
      outReview.innerText = reviewText;
      outputContainer.style.display = 'block';

  } catch (e) {
      console.error('エラー詳細:', e);
      alert('エラーが発生しました：' + e.message);
  } finally {
      btn.disabled = false;
      btn.innerText = '✨ おすすめ文を作成！';
  }
});

// コピー機能（HTML側のボタンから呼び出し）
window.copyText = function(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text).then(() => {
      alert('コピーしたよ！');
  }).catch(err => {
      console.error('コピー失敗:', err);
  });
};
