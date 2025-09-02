let provider, signer, contract, token, currentWallet;

const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340";
const TOKEN_ADDRESS = "0x1657e623c89d3b8ebcf18e6dd2c0a16d37668de8";

// Replace with your ABI + token ABI
const ABI = [...]; 
const TOKEN_ABI = [...];

// =================== Wallet ===================
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
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    currentWallet = accounts[0];

    localStorage.setItem("frenwheel_wallet", currentWallet);

    document.getElementById("walletAddress").innerText = `Connected: ${currentWallet}`;
    document.getElementById("spinButton").disabled = false;
    document.getElementById("connectButton").style.display = "none";
    document.getElementById("disconnectButton").style.display = "inline-block";

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert("Wallet connect failed. Please check MetaMask popup.");
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

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("disconnectButton").addEventListener("click", disconnectWallet);

// =================== Wheel Drawing ===================
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const prizes = ["Nothing", "20K FRENS", "50K FRENS", "100K FRENS"];
const colors = ["#2e003e", "#4b0082", "#6a0dad", "#9400d3"];

function drawWheel(rotation = 0) {
  const arc = (2 * Math.PI) / prizes.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  prizes.forEach((prize, i) => {
    const angle = i * arc + rotation;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, angle, angle + arc);
    ctx.fill();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(prize, 180, 10);
    ctx.restore();
  });
}

drawWheel();

// =================== Spin Button ===================
document.getElementById("spinButton").addEventListener("click", async () => {
  if (!contract || !signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    document.getElementById("status").innerText = "Spinning...";
    const tx = await contract.spin();
    await tx.wait();
    document.getElementById("status").innerText = "Spin complete! Check rewards.";
  } catch (err) {
    console.error("Spin failed:", err);
    document.getElementById("status").innerText = "Spin failed. Check console.";
  }
});
