let provider, signer, contract, token, currentWallet;
let spinCount = 0;

const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340"; // SpinWheel
const TOKEN_ADDRESS = "0x1657e623c89d3b8ebcf18e6dd2c0a16d37668de8";   // FRENS
const SPIN_COST = ethers.parseUnits("30000", 18);

// Replace with your real ABIs
const ABI = [
  { "inputs": [], "name": "spin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
const TOKEN_ABI = [
  { "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ================= WALLET =================
async function connectWallet() {
  const connectBtn = document.getElementById("connectButton");
  connectBtn.disabled = true;

  if (!window.ethereum) {
    alert("Please install MetaMask!");
    connectBtn.disabled = false;
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) throw new Error("No accounts");

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    currentWallet = accounts[0];

    document.getElementById("walletAddress").innerText = `Connected: ${currentWallet}`;
    document.getElementById("spinButton").disabled = false;
    document.getElementById("connectButton").style.display = "none";
    document.getElementById("disconnectButton").style.display = "inline-block";

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert("Wallet connect failed. Please check MetaMask.");
  }

  connectBtn.disabled = false;
}

function disconnectWallet() {
  currentWallet = null;
  signer = null;
  provider = null;
  document.getElementById("walletAddress").innerText = "";
  document.getElementById("connectButton").style.display = "inline-block";
  document.getElementById("disconnectButton").style.display = "none";
  document.getElementById("spinButton").disabled = true;
}

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("disconnectButton").addEventListener("click", disconnectWallet);

// ================= SPIN =================
async function spinWheel() {
  if (!currentWallet) {
    alert("Connect your wallet first!");
    return;
  }

  try {
    // Approve if needed
    const allowance = await token.allowance(currentWallet, CONTRACT_ADDRESS);
    if (allowance < SPIN_COST) {
      const tx1 = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await tx1.wait();
    }

    // Call spin on contract
    const tx2 = await contract.spin();
    await tx2.wait();

    spinCount++;
    let reward;

    const random = Math.random();
    if (spinCount >= 10 && random < 0.05) {
      reward = "🎉 100K FRENS (Unlocked!)";
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

  } catch (err) {
    console.error("Spin failed:", err);
    alert("Spin failed. Check MetaMask.");
  }
}

document.getElementById("spinButton").addEventListener("click", spinWheel);

// ================= DRAW WHEEL =================
function drawWheel(highlightReward = "") {
  const canvas = document.getElementById("wheelCanvas");
  const ctx = canvas.getContext("2d");
  const prizes = ["Nothing","Nothing","Nothing","20K FRENS","50K FRENS","100K FRENS","Nothing","Nothing"];
  const colors = ["#222","#5f27cd","#10ac84","#ee5253","#341f97","#009688","#6c5ce7","#ff6b6b"];

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
    ctx.font = "14px Arial";
    ctx.textAlign = "right";
    ctx.fillText(prize, 180, 10);
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

drawWheel();
