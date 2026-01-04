/* ================= DATABASE (AUTO RELOAD) ================= */
const DB_URL = "Database.txt?reload=" + Date.now();
let database = {};
let selectedSize = "";
let selectedShipping = "";

/* ================= ELEMENTS ================= */
const slider = document.getElementById("imageSlider");
const buyerName = document.getElementById("buyerName");
const sizeSelect = document.getElementById("sizeSelect");
const stockInfo = document.getElementById("stockInfo");
const shippingRadios = document.querySelectorAll('input[name="shipping"]');
const addressForm = document.getElementById("addressForm");
const waButton = document.getElementById("whatsappButton");

/* Address */
const fullName = document.getElementById("fullName");
const phoneNumber = document.getElementById("phoneNumber");
const street = document.getElementById("street");
const district = document.getElementById("district");
const city = document.getElementById("city");
const province = document.getElementById("province");
const postalCode = document.getElementById("postalCode");

/* Summary */
const summaryBuyer = document.getElementById("summaryBuyer");
const summaryProduct = document.getElementById("summaryProduct");
const summaryPrice = document.getElementById("summaryPrice");
const summarySize = document.getElementById("summarySize");
const summaryShipping = document.getElementById("summaryShipping");
const summaryAddress = document.getElementById("summaryAddress");

/* ================= WARNING TEXT ================= */
let warningText = document.getElementById("formWarning");
if (!warningText) {
  warningText = document.createElement("div");
  warningText.id = "formWarning";
  warningText.style.color = "#c62828";
  warningText.style.fontSize = "0.8rem";
  warningText.style.marginTop = "10px";
  waButton.parentNode.insertBefore(warningText, waButton);
}

/* ================= LOAD DATABASE ================= */
fetch(DB_URL)
  .then(res => res.text())
  .then(text => {
    text.split("\n").forEach(line => {
      const [k, v] = line.split("=");
      if (k && v) database[k.trim()] = v.trim();
    });

    document.getElementById("productName").innerText =
      database.product || "Nama Produk";

    document.getElementById("productPrice").innerText =
      database.price
        ? "Rp " + Number(database.price).toLocaleString("id-ID")
        : "Rp 0";

    updateSummary();
  });

/* ================= SLIDER SWIPE ================= */
let index = 0;
let startX = 0;
const totalSlides = slider.children.length;

function updateSlide() {
  slider.style.transform = `translateX(-${index * 100}%)`;
}

slider.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > 50 && index < totalSlides - 1) index++;
  if (diff < -50 && index > 0) index--;

  updateSlide();
});

/* ================= EVENTS ================= */
buyerName.addEventListener("input", updateSummary);

sizeSelect.addEventListener("change", () => {
  selectedSize = sizeSelect.value;

  if (database[selectedSize]) {
    stockInfo.innerText = `Stok tersedia: ${database[selectedSize]} pcs`;
  } else {
    stockInfo.innerText = "Stok tidak tersedia";
  }
  updateSummary();
});

shippingRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    selectedShipping = radio.value;
    addressForm.style.display = selectedShipping === "Kirim" ? "block" : "none";
    updateSummary();
  });
});

[
  fullName,
  phoneNumber,
  street,
  district,
  city,
  province,
  postalCode
].forEach(el => el.addEventListener("input", updateSummary));

/* ================= VALIDATION ================= */
function getMissingFields() {
  let missing = [];

  if (!buyerName.value) missing.push("Nama Pembeli");
  if (!selectedSize) missing.push("Ukuran");
  if (!selectedShipping) missing.push("Metode Pengiriman");

  if (selectedShipping === "Kirim") {
    if (!phoneNumber.value) missing.push("Nomor WhatsApp");
    if (!street.value) missing.push("Alamat Jalan");
    if (!district.value) missing.push("Kecamatan");
    if (!city.value) missing.push("Kota");
    if (!province.value) missing.push("Provinsi");
    if (!postalCode.value) missing.push("Kode Pos");
  }

  return missing;
}

/* ================= UPDATE SUMMARY ================= */
function updateSummary() {
  summaryBuyer.innerText = buyerName.value || "-";
  summaryProduct.innerText = database.product || "-";
  summaryPrice.innerText = database.price
    ? "Rp " + Number(database.price).toLocaleString("id-ID")
    : "-";
  summarySize.innerText = selectedSize || "-";
  summaryShipping.innerText = selectedShipping || "-";

  if (selectedShipping === "Kirim") {
    const addr = [
      fullName.value,
      phoneNumber.value,
      street.value,
      district.value,
      city.value,
      province.value,
      postalCode.value
    ].filter(Boolean).join(", ");
    summaryAddress.innerText = addr || "-";
  } else if (selectedShipping === "COD") {
    summaryAddress.innerText = "COD";
  } else {
    summaryAddress.innerText = "-";
  }

  const missing = getMissingFields();

  if (missing.length > 0) {
    waButton.style.opacity = "0.5";
    waButton.style.cursor = "not-allowed";
    warningText.innerText = "Harap lengkapi: " + missing.join(", ");
  } else {
    waButton.style.opacity = "1";
    waButton.style.cursor = "pointer";
    warningText.innerText = "";
  }
}

/* ================= WHATSAPP ================= */
waButton.addEventListener("click", () => {
  const missing = getMissingFields();

  if (missing.length > 0) {
    warningText.innerText = "Harap lengkapi: " + missing.join(", ");
    return;
  }

  const message = `
*PESANAN AGRITA ONLINE JASTIP*
Nama   : ${buyerName.value}
Produk : ${database.product}
Harga  : Rp ${Number(database.price).toLocaleString("id-ID")}
Ukuran : ${selectedSize}
Metode : ${selectedShipping}
Alamat : ${summaryAddress.innerText}

Terima kasih 🙏
  `;

  const waURL = `https://wa.me/${database.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(waURL, "_blank");
});