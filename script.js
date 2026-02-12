const app = (function () {
  "use strict";

  const CONFIG_KEY = "lixi_user_config";
  const HISTORY_KEY = "lixi_user_history";

  const canvas = document.getElementById("canvas-bg");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("drawBtn");
  const modal = document.getElementById("resultModal");
  const overlay = document.getElementById("overlay");
  const amountEl = document.getElementById("luckyAmount");
  const wishEl = document.getElementById("luckyWish");

  const listWishes = [
    "Sổ gạo đầy ắp, cả năm ấm no",
    "Tem phiếu rủng rỉnh, mua gì cũng có",
    "Tình duyên bền chặt như lốp xe thồ",
    "Công danh tấn tới, không cần đặt gạch",
    "Tiêu chuẩn phân phối, gấp năm gấp mười",
    "Khỏe như Phượng Hoàng, lướt êm mọi nẻo",
    "Mậu dịch mở cửa, không phải xếp hàng",
    "Tết này rực rỡ, mì chính cánh gà",
    "Lộc lá dồi dào, khỏi lo mất sổ",
    "Vạn sự hanh thông, ưu tiên diện một",
  ];

  const prizeConfiguration = [
    { percent: 50, amount: "10.000 Đ" }, // 50%
    { percent: 30, amount: "20.000 Đ" }, // 30%
    { percent: 10, amount: "50.000 Đ" }, // 10%
    { percent: 5, amount: "100.000 Đ" }, // 5%
    { percent: 5, amount: "200.000 Đ" }, // 5%
  ];

  function getWeightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.percent, 0);
    let randomNum = Math.random() * totalWeight;

    for (const item of items) {
      if (randomNum < item.percent) {
        return item;
      }
      randomNum -= item.percent;
    }
    return items[0];
  }

  function getRandomWish() {
    const randomIndex = Math.floor(Math.random() * listWishes.length);
    return listWishes[randomIndex];
  }

  let particles = [];
  let w, h;

  class Envelope {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * -h;
      this.vx = Math.random() - 0.5;
      this.vy = Math.random() * 2 + 1;
      this.size = Math.random() * 20 + 30;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.05 - 0.025;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      if (this.y > h) {
        this.y = -50;
        this.x = Math.random() * w;
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = "#b83b3b";
      ctx.fillRect(
        -this.size / 2,
        -this.size / 1.4,
        this.size,
        this.size * 1.4,
      );
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(
        -this.size / 4,
        -this.size / 2,
        this.size / 2,
        this.size / 4,
      );
      ctx.restore();
    }
  }

  function resize() {
    const screen = document.querySelector(".tv-screen");
    if (screen) {
      w = canvas.width = screen.clientWidth;
      h = canvas.height = screen.clientHeight;
    } else {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 600 ? 25 : 50;
    for (let i = 0; i < count; i++) particles.push(new Envelope());
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  // --- Fireworks System ---
  const fwCanvas = document.getElementById("fireworks-canvas");
  const fwCtx = fwCanvas.getContext("2d");
  let fwW, fwH;
  let fireworks = [];
  let fwParticles = [];
  let fwAnimationId = null;

  function resizeFireworks() {
    fwW = fwCanvas.width = window.innerWidth;
    fwH = fwCanvas.height = window.innerHeight;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Firework {
    constructor(tx, ty) {
      this.x = fwW / 2;
      this.y = fwH;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = Math.sqrt(
        Math.pow(tx - this.x, 2) + Math.pow(ty - this.y, 2),
      );
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = Math.atan2(ty - this.y, tx - this.x);
      this.speed = 2;
      this.acceleration = 1.05;
      this.brightness = random(50, 70);
      this.targetRadius = 1;
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);

      if (this.targetRadius < 8) {
        this.targetRadius += 0.3;
      } else {
        this.targetRadius = 1;
      }

      this.speed *= this.acceleration;
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;

      this.distanceTraveled = Math.sqrt(
        Math.pow(this.x + vx - this.x, 2) + Math.pow(this.y + vy - this.y, 2),
      );

      if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty);
        fireworks.splice(index, 1);
      } else {
        this.x += vx;
        this.y += vy;
      }
    }

    draw() {
      fwCtx.beginPath();
      fwCtx.moveTo(
        this.coordinates[this.coordinates.length - 1][0],
        this.coordinates[this.coordinates.length - 1][1],
      );
      fwCtx.lineTo(this.x, this.y);
      fwCtx.strokeStyle =
        "hsl(" + random(0, 360) + ", 100%, " + this.brightness + "%)";
      fwCtx.stroke();
    }
  }

  class FwParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.coordinates = [];
      this.coordinateCount = 5;
      while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
      }
      this.angle = random(0, Math.PI * 2);
      this.speed = random(1, 10);
      this.friction = 0.95;
      this.gravity = 1;
      this.hue = random(0, 360);
      this.brightness = random(50, 80);
      this.alpha = 1;
      this.decay = random(0.015, 0.03);
    }

    update(index) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;

      if (this.alpha <= this.decay) {
        fwParticles.splice(index, 1);
      }
    }

    draw() {
      fwCtx.beginPath();
      fwCtx.moveTo(
        this.coordinates[this.coordinates.length - 1][0],
        this.coordinates[this.coordinates.length - 1][1],
      );
      fwCtx.lineTo(this.x, this.y);
      fwCtx.strokeStyle =
        "hsla(" +
        this.hue +
        ", 100%, " +
        this.brightness +
        "%, " +
        this.alpha +
        ")";
      fwCtx.stroke();
    }
  }

  function createParticles(x, y) {
    let particleCount = 70;
    while (particleCount--) {
      fwParticles.push(new FwParticle(x, y));
    }
  }

  function animateFireworks() {
    fwAnimationId = requestAnimationFrame(animateFireworks);
    fwCtx.globalCompositeOperation = "destination-out";
    fwCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
    fwCtx.fillRect(0, 0, fwW, fwH);
    fwCtx.globalCompositeOperation = "lighter";

    let i = fireworks.length;
    while (i--) {
      fireworks[i].draw();
      fireworks[i].update(i);
    }

    let j = fwParticles.length;
    while (j--) {
      fwParticles[j].draw();
      fwParticles[j].update(j);
    }
  }

  function startFireworks() {
    // Stop previous if any
    if (fwAnimationId) cancelAnimationFrame(fwAnimationId);

    // Clear canvas
    fwCtx.clearRect(0, 0, fwW, fwH);
    fireworks = [];
    fwParticles = [];

    animateFireworks();

    // Launch random fireworks
    let launchCount = 0;
    const launchInterval = setInterval(() => {
      // Launch multiple per tick for more density
      fireworks.push(new Firework(random(0, fwW), random(0, fwH / 2)));
      fireworks.push(new Firework(random(0, fwW), random(0, fwH / 2)));
      launchCount++;
      // Stop launching after some shots but keep animation running for particles to fade
      if (launchCount > 20) clearInterval(launchInterval);
    }, 200);

    // Stop animation loop after 5 seconds to ensure cleanup
    setTimeout(() => {
      clearInterval(launchInterval);
      setTimeout(() => {
        cancelAnimationFrame(fwAnimationId);
        fwCtx.clearRect(0, 0, fwW, fwH); // Clear final frame
      }, 3000); // 3s for particles to fade
    }, 4500); // Increased duration slightly
  }

  function drawLuckyMoney() {
    // Check if already drawn
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY));
    if (config && config.hasDrawn) {
      // Show saved result without animation/sound
      amountEl.textContent = config.savedAmount;
      wishEl.textContent = config.savedWish;
      overlay.style.display = "block";
      modal.classList.add("active");
      return;
    }

    const result = getWeightedRandom(prizeConfiguration);
    const wish = getRandomWish();

    // Save result to localStorage
    if (config) {
      config.hasDrawn = true;
      config.savedAmount = result.amount;
      config.savedWish = wish;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

      // Save to Global History (Persistent)
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const normalizedName = config.userName.toLowerCase();
      if (!history.includes(normalizedName)) {
        history.push(normalizedName);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    }

    amountEl.textContent = result.amount;
    wishEl.textContent = wish;

    // Trigger Firework & Sound
    const audio = new Audio("assets/firecracker.wav");
    audio.volume = 0.5;
    audio
      .play()
      .catch((e) => console.log("Audio play failed (Autoplay policy):", e));

    startFireworks(); // <--- Trigger Fireworks Here

    // Delay modal show slightly to see fireworks start
    setTimeout(() => {
      overlay.style.display = "block";
      modal.classList.add("active");
    }, 500);

    particles.forEach((p) => (p.vy += 8));
    setTimeout(() => particles.forEach((p) => (p.vy -= 8)), 300);

    // Update UI button text
    const drawBtn = document.getElementById("drawBtn");
    if (drawBtn) drawBtn.textContent = "XEM KẾT QUẢ";
  }

  function closeModal() {
    overlay.style.display = "none";
    modal.classList.remove("active");
  }

  window.addEventListener("resize", () => {
    resize();
    initParticles();
    resizeFireworks(); // Resize fireworks canvas
  });

  // Init fireworks size
  resizeFireworks();

  btn.addEventListener("click", drawLuckyMoney);
  overlay.addEventListener("click", closeModal);

  // --- User Session Logic ---

  function checkSession() {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY));
    const registerScreen = document.getElementById("registerScreen");
    const gameScreen = document.getElementById("gameScreen");
    const userGreeting = document.getElementById("userGreeting");
    const drawBtn = document.getElementById("drawBtn");

    if (config && config.userName) {
      // Show Game
      registerScreen.style.display = "none";
      gameScreen.style.display = "block";
      userGreeting.textContent = `Đồng chí: ${config.userName}`;

      if (config.hasDrawn) {
        drawBtn.textContent = "XEM KẾT QUẢ";
      } else {
        drawBtn.textContent = "RÚT THĂM";
      }
    } else {
      // Show Register
      registerScreen.style.display = "block";
      gameScreen.style.display = "none";
    }
  }

  function registerUser() {
    const nameInput = document.getElementById("userNameInput");
    const name = nameInput.value.trim();

    if (!name) {
      alert("Vui lòng nhập danh tính!");
      return;
    }

    // Check if user already played in history
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const normalizedName = name.toLowerCase();
    if (history.includes(normalizedName)) {
      showAlert(
        `Đồng chí "${name}" đã nhận lì xì rồi!<br>Vui lòng nhường cơ hội cho người khác.`,
      );
      return;
    }

    const config = { userName: name };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    checkSession();
  }

  function resetSession() {
    // Show custom confirm modal instead of native confirm
    const confirmModal = document.getElementById("confirmModal");
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    confirmModal.classList.add("active");
  }

  function confirmReset() {
    localStorage.removeItem(CONFIG_KEY);
    location.reload();
  }

  function closeConfirm() {
    const confirmModal = document.getElementById("confirmModal");
    const overlay = document.getElementById("overlay");

    // Check if result modal is open beneath (it usually is when clicking reset)
    const resultModal = document.getElementById("resultModal");

    confirmModal.classList.remove("active");

    // If result modal was active, keep overlay, otherwise hide
    if (resultModal.classList.contains("active")) {
      // do nothing, keep overlay
    } else {
      overlay.style.display = "none";
    }
  }

  // --- Alert System ---
  function showAlert(msg) {
    const alertModal = document.getElementById("alertModal");
    const alertMsg = document.getElementById("alertMessage");
    const overlay = document.getElementById("overlay");

    alertMsg.innerHTML = msg;
    overlay.style.display = "block";
    alertModal.classList.add("active");
  }

  function closeAlert() {
    const alertModal = document.getElementById("alertModal");
    const overlay = document.getElementById("overlay");

    overlay.style.display = "none";
    alertModal.classList.remove("active");
  }

  // --- Init ---
  function init() {
    resize();
    initParticles();
    resizeFireworks();
    animate();

    checkSession(); // Check on load

    // Events
    window.addEventListener("resize", resize);

    // Register Button
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) registerBtn.addEventListener("click", registerUser);

    // Register Input (Enter key)
    const nameInput = document.getElementById("userNameInput");
    if (nameInput) {
      nameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          registerUser();
        }
      });
    }

    // --- Shake to Draw (Lắc để nhận lì xì) ---
    let lastShakeTime = 0;
    const shakeThreshold = 15;
    const shakeCooldown = 2000;

    function handleShake(event) {
      if (document.getElementById("resultModal").style.display === "block")
        return;
      if (document.getElementById("registerScreen").style.display !== "none")
        return; // No shake on register

      const currentCheck = Date.now();
      if (currentCheck - lastShakeTime < shakeCooldown) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      if (!x || !y || !z) return;

      const acceleration = Math.sqrt(x * x + y * y + z * z);

      if (acceleration > shakeThreshold) {
        lastShakeTime = currentCheck;
        drawLuckyMoney();
      }
    }

    // Permission Logic
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      const btn = document.createElement("button");
      btn.textContent = "Bật Lắc Tay";
      btn.className = "btn-retro btn-retro-small";
      btn.style.marginTop = "1rem";

      // Append to game screen only
      document.getElementById("gameScreen").appendChild(btn);

      btn.onclick = () => {
        DeviceMotionEvent.requestPermission()
          .then((response) => {
            if (response == "granted") {
              window.addEventListener("devicemotion", handleShake);
              btn.remove();
            }
          })
          .catch(console.error);
      };
    } else if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", handleShake);
    }
  }

  init();

  return {
    drawLuckyMoney,
    closeModal,
    resetSession,
    closeAlert,
    confirmReset,
    closeConfirm,
  };
})();
