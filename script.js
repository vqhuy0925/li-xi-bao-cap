const app = (function () {
  const canvas = document.getElementById("canvas-bg");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("drawBtn");
  const modal = document.getElementById("resultModal");
  const overlay = document.getElementById("overlay");
  const amountEl = document.getElementById("luckyAmount");
  const wishEl = document.getElementById("luckyWish");

  // 1. DANH SÁCH CÂU CHÚC (Decoupled Data)
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

  // 2. CẤU HÌNH TỈ LỆ TIỀN (Total = 100%)
  const prizeConfiguration = [
    { percent: 50, amount: "10.000 Đ" }, // 50%
    { percent: 30, amount: "20.000 Đ" }, // 30%
    { percent: 10, amount: "50.000 Đ" }, // 10%
    { percent: 5, amount: "100.000 Đ" }, // 5%
    { percent: 5, amount: "200.000 Đ" }, // 5%
  ];

  // Thuật toán Random theo trọng số (Weighted Random)
  function getWeightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.percent, 0);
    let randomNum = Math.random() * totalWeight;

    for (const item of items) {
      if (randomNum < item.percent) {
        return item;
      }
      randomNum -= item.percent;
    }
    return items[0]; // Fallback an toàn
  }

  // Hàm lấy câu chúc ngẫu nhiên
  function getRandomWish() {
    const randomIndex = Math.floor(Math.random() * listWishes.length);
    return listWishes[randomIndex];
  }

  // --- Phần Animation Canvas (Giữ nguyên) ---
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
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
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

  // --- Xử lý sự kiện (Đã update logic random) ---
  function drawLuckyMoney() {
    // 1. Gọi hàm random tiền
    const result = getWeightedRandom(prizeConfiguration);

    // 2. Gọi hàm random câu chúc riêng biệt
    const wish = getRandomWish();

    // 3. Render ra màn hình
    amountEl.textContent = result.amount;
    wishEl.textContent = wish;

    overlay.style.display = "block";
    modal.classList.add("active");

    // Hiệu ứng pháo giấy nổ nhẹ khi trúng
    particles.forEach((p) => (p.vy += 8));
    setTimeout(() => particles.forEach((p) => (p.vy -= 8)), 300);
  }

  function closeModal() {
    overlay.style.display = "none";
    modal.classList.remove("active");
  }

  window.addEventListener("resize", () => {
    resize();
    initParticles();
  });
  btn.addEventListener("click", drawLuckyMoney);
  overlay.addEventListener("click", closeModal);

  resize();
  initParticles();
  animate();

  return { closeModal };
})();
