const app = (function () {
  const canvas = document.getElementById("canvas-bg");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("drawBtn");
  const modal = document.getElementById("resultModal");
  const overlay = document.getElementById("overlay");
  const amountEl = document.getElementById("luckyAmount");
  const wishEl = document.getElementById("luckyWish");

  // CẤU HÌNH TỈ LỆ (Total = 100%)
  const prizeConfiguration = [
    { percent: 50, amount: "10.000 Đ", wish: "Ăn no chóng lớn" }, // 50%
    { percent: 30, amount: "20.000 Đ", wish: "Tiền vào như nước" }, // 30%
    { percent: 10, amount: "50.000 Đ", wish: "Sức khỏe dồi dào" }, // 10%
    { percent: 5, amount: "100.000 Đ", wish: "Mã đáo thành công" }, // 5%
    { percent: 5, amount: "200.000 Đ", wish: "Vạn sự như ý" }, // 5%
  ];

  // Thuật toán Random theo trọng số (Weighted Random)
  function getWeightedRandom(items) {
    // Tính tổng trọng số (để đảm bảo tính toán đúng dù tổng > 100 hay < 100)
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

  // --- Phần Animation Canvas (Giữ nguyên hoặc tinh chỉnh) ---
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

  // --- Xử lý sự kiện ---
  function drawLuckyMoney() {
    // Gọi hàm random có trọng số
    const result = getWeightedRandom(prizeConfiguration);

    amountEl.textContent = result.amount;
    wishEl.textContent = result.wish;

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
