function invertiFrase() {
  let input = document.getElementById("input").value;
  document.getElementById("output").innerHTML = input
    .split("")
    .reverse()
    .join("");
}