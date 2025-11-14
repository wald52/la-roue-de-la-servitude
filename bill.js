function createBills(x, y) {
  const wheelArea = document.getElementById("wheelArea");

  const count = 8 + Math.floor(Math.random() * 6); // 8 à 14 billets

  for (let i = 0; i < count; i++) {
    const bill = document.createElement("div");
    bill.className = "bill";
    bill.textContent = "💶";

    // légère dispersion
    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = (Math.random() - 0.5) * 80;

    bill.style.left = `${x + offsetX}px`;
    bill.style.top = `${y + offsetY}px`;

    wheelArea.appendChild(bill);

    // suppression automatique
    setTimeout(() => bill.remove(), 1700);
  }
}
