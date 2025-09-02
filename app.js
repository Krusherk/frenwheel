// ================= CONFIG =================
const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340"; // SpinWheel
const TOKEN_ADDRESS = "0x1657e623c89d3b8ebcf18e6dd2c0a16d37668de8";   // FRENS token
const SPIN_COST = 30000; // 30K FRENS
let provider, signer, contract, token, currentWallet;
let spinCount = 0;

// Minimal ABIs so app doesn't crash
const ABI = [
  { "inputs": [], "name": "spin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
const TOKEN_ABI = [
  { "inputs": [ { "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" } ],
    "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// ================= WALLET CONNECT =================
async function connectWallet() {
  const connectBtn = document.getElementById("connectButton");
  connectBtn.disabled = true;

  if (!window.ethereum) {
    alert("Please install MetaMask");
    connectBtn.disabled = false;
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = await provider.getSigner();
    currentWallet = accounts[0];

    localStorage.setItem("frenwheel_wallet", currentWallet);

    document.getElementById("walletAddress").innerText = `Connected: ${currentWallet}`;
    document.getElementById("spinButton").disabled = false;

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

    document.getElementById("connectButton").style.display = "none";
    document.getElementById("disconnectButton").style.display = "inline-block";
  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert("Wallet connect failed. Check MetaMask.");
  }

  connectBtn.disabled = false;
}

function disconnectWallet() {
  localStorage.removeItem("frenwheel_wallet");
  currentWallet = null;
  signer = null;
  provider = null;
  document.getElementById("walletAddress").innerText = "";
  document.getElementById("connectButton").style.display = "inline-block";
  document.getElementById("disconnectButton").style.display = "none";
  document.getElementById("spinButton").disabled = true;
}

// Auto reconnect on refresh
window.addEventListener("load", async () => {
  const savedWallet = localStorage.getItem("frenwheel_wallet");
  if (savedWallet) {
    await connectWallet();
  }
});

// ================= SPIN LOGIC =================
async function spinWheel() {
  if (!currentWallet) {
    alert("Connect wallet first!");
    return;
  }

  // Fake rewards for now (replace with contract logs parsing later)
  spinCount++;
  let reward;
  const random = Math.random();

  if (spinCount >= 10 && random < 0.05) {
    reward = "🎉 100K FRENS (Unlocked after 10 spins!)";
    spinCount = 0;
  } else if (random < 0.8) {
    reward = "20K FRENS";
  } else if (random < 0.85) {
    reward = "50K FRENS";
  } else {
    reward = "Nothing 😢";
  }

  document.getElementById("result").innerText = `You won: ${reward}`;
  drawWheel(reward);
}

// ================= WHEEL DRAWING =================
function drawWheel(highlightReward = "") {
  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const prizes = ["Nothing", "20K FRENS", "50K FRENS", "100K FRENS"];
  const colors = ["#222", "#5f27cd", "#10ac84", "#ee5253"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const arc = (2 * Math.PI) / prizes.length;
  prizes.forEach((prize, i) => {
    const angle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i];
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, angle, angle + arc);
    ctx.lineTo(200, 200);
    ctx.fill();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(prize, 60, 10);
    ctx.restore();
  });

  // Pointer
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(190, 30);
  ctx.lineTo(210, 30);
  ctx.closePath();
  ctx.fill();
}

// ================= EVENT LISTENERS =================
document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("disconnectButton").addEventListener("click", disconnectWallet);
document.getElementById("spinButton").addEventListener("click", spinWheel);

drawWheel();
