document.addEventListener('DOMContentLoaded', () => {
  // 1. 主题切换与持久化逻辑
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  const sunIcon = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`;

  const moonIcon = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;

  function applyTheme(theme) {
    if (theme === 'theme-obsidian') {
      body.classList.remove('theme-gallery');
      body.classList.add('theme-obsidian');
      if (themeToggleBtn) themeToggleBtn.innerHTML = sunIcon;
    } else {
      body.classList.remove('theme-obsidian');
      body.classList.add('theme-gallery');
      if (themeToggleBtn) themeToggleBtn.innerHTML = moonIcon;
    }
    try {
      localStorage.setItem('optic-theme', theme);
    } catch (_) {
      // 容错: 无痕模式或禁用了 Storage
    }
  }

  // 初始化主题检查
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('optic-theme');
  } catch (_) {}

  if (!savedTheme) {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'theme-obsidian' 
      : 'theme-gallery';
  }
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = body.classList.contains('theme-gallery') ? 'theme-obsidian' : 'theme-gallery';
      applyTheme(nextTheme);
    });
  }

  // 2. 格式塔接近律交互实验
  const proximitySlider = document.getElementById('proximity-slider');
  const demoBox = document.getElementById('proximity-demo');
  const proximityLabel = document.getElementById('proximity-value');

  if (proximitySlider && demoBox) {
    proximitySlider.addEventListener('input', (e) => {
      const val = e.target.value;
      demoBox.style.setProperty('--demo-gap', `${val}px`);
      if (val < 16) {
        proximityLabel.textContent = `${val}px (感知为单一混沌块)`;
      } else if (val < 40) {
        proximityLabel.textContent = `${val}px (感知为清晰两组)`;
      } else {
        proximityLabel.textContent = `${val}px (感知为完全解耦的独立孤岛)`;
      }
    });
  }

  // 3. 3D 视差倾斜 (Parallax Tilt)
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = -(y / (rect.height / 2)) * 6; // max 6 deg
      const tiltY = (x / (rect.width / 2)) * 6;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // 4. Token 点击复制微交互 (带 fallback 与全异常捕获)
  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fallback below
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (_) {
      return false;
    }
  }

  const tokenPills = document.querySelectorAll('.token-pill');
  tokenPills.forEach(pill => {
    pill.addEventListener('click', async () => {
      const text = pill.getAttribute('data-token') || pill.textContent;
      const copied = await copyText(text);
      if (copied) {
        const originalText = pill.textContent;
        pill.textContent = '已复制!';
        pill.style.color = '#10b981';
        setTimeout(() => {
          pill.textContent = originalText;
          pill.style.color = '';
        }, 1200);
      }
    });
  });
});
