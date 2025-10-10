let adminLevel = 0;
let hasChanges = false;

const statusBox = document.getElementById("statusBox");
const saveAllBtn = document.getElementById("saveAllBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const submitLogin = document.getElementById("submitLogin");
const loginMsg = document.getElementById("loginMsg");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");

const API_URL = "https://nguyengiang-gaming-pf90.onrender.com/api/data";

let currentData = {};
let editingItem = "";

function updateDateTime() {
  const now = new Date();
  document.getElementById("datetime").textContent = now.toLocaleString("vi-VN");
}
setInterval(updateDateTime, 1000);
updateDateTime();

async function getDataFromServer() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    return await res.json();
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu từ server:", err);
    return null;
  }
}

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

function setStatus(state) {
  if (!statusBox) return;

  if (state === "ONLINE") {
    statusBox.textContent = "🟢 ONLINE";
    statusBox.classList.remove("offline");
    statusBox.classList.add("online");
  } else {
    statusBox.textContent = "🔴 OFFLINE";
    statusBox.classList.remove("online");
    statusBox.classList.add("offline");
  }
}

window.addEventListener("load", async () => {
  const data = await getDataFromServer();
  currentData = data || { status: "ONLINE", items: {}, texts: {} };

  if (data && data.status) {
    setStatus(data.status);
  }

  if (data && data.items) {
    for (const [key, price] of Object.entries(data.items)) {
      document.querySelectorAll(".price").forEach((el) => {
        const itemKey =
          el.previousElementSibling?.textContent.trim() || el.dataset.editId;
        if (itemKey === key) el.textContent = price;
      });
    }
  }

  if (data && data.texts) {
    for (const [key, value] of Object.entries(data.texts)) {
      const el = document.querySelector(`[data-edit-id='${key}']`);
      if (el) el.textContent = value;
    }
  }
});

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

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
});

function handleLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = passwordInput.value.trim();

  if (user === "abcdef80" && pass === "Zxc1230@@") {
    adminLevel = 1;
    showCustomAlert("✅ Đăng nhập thành công!");
    afterLogin();
  } else {
    loginMsg.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
  }
}

submitLogin.addEventListener("click", handleLogin);
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && loginModal.style.display === "flex") {
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

function showSaveButton() {
  saveAllBtn.style.display = "block";
}

function afterLogin() {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
  enableTextEditing();
  enablePriceEditing();
  saveAllBtn.style.display = "block";
}

  const priceModal = document.getElementById("priceModal");
  const priceItemName = document.getElementById("priceItemName");
  const newPriceInput = document.getElementById("newPriceInput");
  const savePrice = document.getElementById("savePrice");
  const cancelPrice = document.getElementById("cancelPrice");
  let currentPriceEl = null;

  document.querySelectorAll(".price").forEach((el) => {
    el.addEventListener("click", () => {
      if (adminLevel < 1) {
        alert("❌Không có quyền!");
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
      showSaveButton();
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
          showSaveButton();
        },
        { once: true }
      );
    });
  });
}

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

    await saveDataToServer({
      ...currentData,
      items,
      texts
    });

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

function showCustomAlert(msg) {
  const alertBox = document.getElementById("customAlert");
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.textContent = msg;
  alertBox.classList.remove("hidden");
  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 2500);
}
function showCustomAlert(message) {
  document.getElementById("alertText").innerText = message;
  document.getElementById("customAlertBox").style.display = "flex";
}

function closeCustomAlert() {
  document.getElementById("customAlertBox").style.display = "none";
}





