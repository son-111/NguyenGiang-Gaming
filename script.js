// ======================================================
// 🧩 NguyenGiang Gaming - Script chỉnh giá & chữ (admin)
// ======================================================

let adminLevel = 0;
let hasChanges = false; // 🆕 Theo dõi có thay đổi chữ hoặc giá

const statusBox = document.getElementById("statusBox");
const saveAllBtn = document.getElementById("saveAllBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const submitLogin = document.getElementById("submitLogin");
const loginMsg = document.getElementById("loginMsg");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");

const API_URL = "/api/data"; // Dùng local hoặc deploy URL

let currentData = {};
let editingItem = "";

// ======================================================
// 🕒 Cập nhật thời gian thực
// ======================================================
function updateDateTime() {
  const now = new Date();
  document.getElementById("datetime").textContent = now.toLocaleString("vi-VN");
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ======================================================
// 📥 Lấy dữ liệu từ server
// ======================================================
async function getDataFromServer() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu từ server:", err);
    return null;
  }
}

// ======================================================
// 💾 Gửi dữ liệu lên server
// ======================================================
async function saveDataToServer(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("✅ Dữ liệu đã lưu lên server thành công!");
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi lưu dữ liệu lên server:", err);
    return null;
  }
}

// ======================================================
// 🟢 Hiển thị trạng thái ONLINE / OFFLINE
// ======================================================
function setStatus(state) {
  if (state === "ONLINE") {
    statusBox.textContent = "🟢 ONLINE";
    statusBox.style.color = "#0f0";
  } else {
    statusBox.textContent = "🔴 OFFLINE";
    statusBox.style.color = "red";
  }
}

// ======================================================
// 🚀 Khi tải trang
// ======================================================
window.addEventListener("load", async () => {
  const data = await getDataFromServer();
  currentData = data || { status: "ONLINE", items: {}, texts: {} };

  if (data && data.status) {
    setStatus(data.status);
  }

  // 💰 Hiển thị giá
  if (data && data.items) {
    for (const [key, price] of Object.entries(data.items)) {
      document.querySelectorAll(".price").forEach((el) => {
        const itemKey =
          el.previousElementSibling?.textContent.trim() || el.dataset.editId;
        if (itemKey === key) el.textContent = price;
      });
    }
  }

  // 📝 Hiển thị chữ
  if (data && data.texts) {
    for (const [key, value] of Object.entries(data.texts)) {
      const el = document.querySelector(`[data-edit-id='${key}']`);
      if (el) el.textContent = value;
    }
  }
});

// ======================================================
// 🟢 Click đổi trạng thái
// ======================================================
statusBox.addEventListener("click", async () => {
  if (adminLevel === 0) {
    loginModal.style.display = "flex";
  } else {
    const newStatus = statusBox.textContent.includes("ONLINE")
      ? "OFFLINE"
      : "ONLINE";
    setStatus(newStatus);
    await saveDataToServer({ ...currentData, status: newStatus });
  }
});

// ======================================================
// 🔐 Xử lý đăng nhập
// ======================================================
closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
});

function handleLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = passwordInput.value.trim();

  if (user === "a" && pass === "a") {
    adminLevel = 1;
    showCustomAlert("✅ Đăng nhập thành công!");
    afterLogin();
  } else {
    loginMsg.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
  }
}

submitLogin.addEventListener("click", handleLogin);
document.getElementById("loginModal").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleLogin();
  }
});

togglePass?.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  togglePass.innerHTML =
    passwordInput.type === "text"
      ? '<i class="fa-solid fa-eye-slash"></i>'
      : '<i class="fa-solid fa-eye"></i>';
});

// ======================================================
// 💾 Hiển thị nút Lưu khi có thay đổi
// ======================================================
function showSaveButton() {
  saveAllBtn.style.display = "block";
}

// ======================================================
// Sau khi đăng nhập
// ======================================================
function afterLogin() {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
  enableTextEditing();
  enablePriceEditing();
  saveAllBtn.style.display = "block";
}

// ======================================================
// 💰 Chỉnh giá vật phẩm
// ======================================================
function enablePriceEditing() {
  const priceModal = document.getElementById("priceModal");
  const priceItemName = document.getElementById("priceItemName");
  const newPriceInput = document.getElementById("newPriceInput");
  const savePrice = document.getElementById("savePrice");
  const cancelPrice = document.getElementById("cancelPrice");
  let currentPriceEl = null;

  document.querySelectorAll(".price").forEach((el) => {
    el.addEventListener("click", () => {
      if (adminLevel < 1) {
        alert("❌ Bạn cần đăng nhập Admin để chỉnh giá!");
        return;
      }
      currentPriceEl = el;
      priceItemName.textContent =
        el.previousElementSibling?.textContent || "Sản phẩm";
      newPriceInput.value = el.textContent;
      priceModal.style.display = "flex";
      document.body.style.overflow = "hidden";
      setTimeout(() => newPriceInput.focus(), 100);
    });
  });

  newPriceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      savePrice.click();
    }
  });

  savePrice.addEventListener("click", () => {
    const newPrice = newPriceInput.value.trim();
    if (newPrice && currentPriceEl) {
      const itemKey =
        currentPriceEl.previousElementSibling?.textContent.trim() ||
        currentPriceEl.dataset.editId;
      currentPriceEl.textContent = newPrice;
      hasChanges = true;
      showSaveButton(); // ✅ Đã có hàm, không còn lỗi
    }
    closeModal();
  });

  cancelPrice.addEventListener("click", closeModal);
  priceModal.addEventListener("click", (e) => {
    if (e.target === priceModal) closeModal();
  });

  function closeModal() {
    priceModal.style.display = "none";
    document.body.style.overflow = "";
    newPriceInput.value = "";
  }
}

// ======================================================
// ✏️ Chỉnh chữ trực tiếp
// ======================================================
function enableTextEditing() {
  const selector =
    "h1, h2, h3, p.subtitle, .item, .section-title, .trade-box li, .trade-box h2";
  document.querySelectorAll(selector).forEach((el, index) => {
    if (!el.dataset.editId)
      el.dataset.editId = `${el.tagName.toLowerCase()}_${index}`;
    el.setAttribute("data-original", el.textContent);
  });

  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener("click", () => {
      if (adminLevel === 0) return;
      if (el.isContentEditable) return;
      el.contentEditable = "true";
      el.style.outline = "2px dashed #00eaff";
      el.focus();
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
        }
      });
      el.addEventListener(
        "blur",
        () => {
          el.contentEditable = "false";
          el.style.outline = "none";
          hasChanges = true;
          showSaveButton(); // ✅ Đã có hàm, không còn lỗi
        },
        { once: true }
      );
    });
  });
}

// ======================================================
// 💾 Lưu toàn bộ thay đổi (cả chữ và giá)
// ======================================================
saveAllBtn.addEventListener("click", async () => {
  try {
    const items = {};
    document.querySelectorAll(".price").forEach((el) => {
      const itemKey =
        el.previousElementSibling?.textContent.trim() || el.dataset.editId;
      items[itemKey] = el.textContent.trim();
    });

    const texts = {};
    document.querySelectorAll("[data-edit-id]").forEach((el) => {
      texts[el.dataset.editId] = el.textContent.trim();
    });

    currentData.items = items;
    currentData.texts = texts;

    await saveDataToServer(currentData);

    const newData = await getDataFromServer();
    if (newData) {
      currentData = newData;
      setStatus(newData.status);

      if (newData.items) {
        document.querySelectorAll(".price").forEach((el) => {
          const itemKey =
            el.previousElementSibling?.textContent.trim() ||
            el.dataset.editId;
          if (newData.items[itemKey]) {
            el.textContent = newData.items[itemKey];
          }
        });
      }

      if (newData.texts) {
        for (const [key, value] of Object.entries(newData.texts)) {
          const el = document.querySelector(`[data-edit-id='${key}']`);
          if (el) el.textContent = value;
        }
      }
    }

    hasChanges = false;
    saveAllBtn.style.display = "none";
    showCustomAlert("✅ Đã lưu thay đổi thành công!");
  } catch (err) {
    console.error("❌ Lỗi khi lưu dữ liệu:", err);
    showCustomAlert("❌ Không thể lưu dữ liệu!");
  }
});

// ======================================================
// 🔔 Custom Alert
// ======================================================
function showCustomAlert(msg) {
  const alertBox = document.getElementById("customAlert");
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.textContent = msg;
  alertBox.classList.remove("hidden");
  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 2500);
}
