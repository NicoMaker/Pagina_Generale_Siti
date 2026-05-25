function showMessage(text, type = "success") {
  const messageDiv = document.getElementById("message");
  messageDiv.className = `${type}-message show`;
  messageDiv.textContent = text;

  setTimeout(() => {
    messageDiv.classList.remove("show");
  }, 3000);
}

function setLoading(isLoading) {
  const btn = document.querySelector(".generate-btn");
  const btnText = document.querySelector(".btn-text");
  const icon = document.querySelector(".icon");

  if (isLoading) {
    btn.disabled = true;
    icon.innerHTML = '<div class="loading"></div>';
    btnText.textContent = "Generando...";
    btn.style.opacity = "0.7";
  } else {
    btn.disabled = false;
    icon.innerHTML = "🚀";
    btnText.textContent = "Genera File Nomi";
    btn.style.opacity = "1";
  }
}

function generaFile() {
  const numNomiInput = document.getElementById("numNomi");
  const number = parseInt(numNomiInput.value);

  // Validate the input number
  if (isNaN(number) || number < 1 || number > 100) {
    showMessage("⚠️ Per favore, inserisci un numero tra 1 e 100.", "error");
    return;
  }

  setLoading(true);

  // Simulate some processing time for better UX
  setTimeout(() => {
    const nomi = [];
    for (let i = 1; i <= number; i++) {
      nomi.push(`Nome${i}`);
    }

    const contenuto = nomi.join("\n");
    const blob = new Blob([contenuto], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nomi_${number}.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    setLoading(false);
    showMessage(`✅ File con ${number} nomi generato con successo!`, "success");

    // Clear input after successful generation
    numNomiInput.value = "";
  }, 800);
}

// Add enter key support
document.getElementById("numNomi").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    generaFile();
  }
});

// Add input validation on typing
document.getElementById("numNomi").addEventListener("input", function (e) {
  const value = parseInt(e.target.value);
  if (value > 100) {
    e.target.value = 100;
  } else if (value < 1 && e.target.value !== "") {
    e.target.value = 1;
  }
});
