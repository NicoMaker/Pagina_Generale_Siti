function generateAnagrams(word) {
  if (word.length === 1) return [word];

  const anagrams = [];
  for (let i = 0; i < word.length; i++) {
    const char = word[i],
      remainingChars = word.slice(0, i) + word.slice(i + 1);
    for (const subAnagram of generateAnagrams(remainingChars))
      anagrams.push(char + subAnagram);
  }
  return [...new Set(anagrams)]; // Rimuove duplicati
}

function displayResults(word, anagrams) {
  const resultsDiv = document.getElementById("results"),
    anagramsDiv = document.querySelector(".anagrams"),
    countDiv = document.querySelector(".count");

  resultsDiv.style.display = "block";
  anagramsDiv.innerHTML = `<strong>Anagrammi:</strong><ol>${anagrams
    .map((anagram, index) => `<li>${anagram}</li>`)
    .join("")}</ol>`;
  countDiv.textContent = `Totale Anagrammi: ${anagrams.length}`;
}

function handleSubmit(event) {
  event.preventDefault();

  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  const anagrams = generateAnagrams(word);
  displayResults(word, anagrams);
}

document.getElementById("anagramForm").addEventListener("submit", handleSubmit);