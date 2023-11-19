const openBtn = document.getElementById("open-modal");
const closeBtn = document.getElementById("close-modal");
const modal = document.getElementById("modal");

openBtn.addEventListener("click", () => {
    modal.showModal()
})

closeBtn.addEventListener("click", () => {
    modal.close()
})