// --- Contract addresses ---
const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340"; // SpinWheel
const TOKEN_ADDRESS = "0x1657e623c89d3b8ebcf18e6dd2c0a16d37668de8";  // FRENS token

// --- ABIs ---
const ABI = [
  {
    type: "function",
    name: "spin",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Spin",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
];
const TOKEN_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

// --- State ---
let provider, signer, contract, token;
let currentWallet = null;
let spinCount = 0;

// --- Wallet connect/disconnect ---
async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = await provider.getSigner();
    currentWallet = accounts[0];

    // Save wallet for auto-reconnect
    localStorage.setItem("frenwheel_wallet", currentWallet);

    // Check correct network
    const { chainId } = await provider.getNetwork();
    if (chainId !== 0x279f) {
      alert("Please switch MetaMask to Monad Testnet (chainId 0x279f)");
      return;
    }

    // Update UI
    document.getElementById("walletAddress").innerText = `Connected: ${currentWallet}`;
    document.getElementById("spinButton").disabled = false;
    document.getElementById("connectButton").style.display = "none";
    document.getElementById("disconnectButton").style.display = "inline-block";

    // Load contracts
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  } catch (err) {
    console.error("Wallet connect failed:", err);
    alert("Wallet connect failed. Check console.");
  }
}

function disconnectWallet() {
  localStorage.removeItem("frenwheel_wallet");
  currentWallet = null;
  signer = null;
  provider = null;
  contract = null;
  token = null;

  document.getElementById("walletAddress").innerText = "Not connected";
  document.getElementById("spinButton").disabled = true;
  document.getElementById("connectButton").style.display = "inline-block";
  document.getElementById("disconnectButton").style.display = "none";
}

// Auto-reconnect if wallet was connected before
window.addEventListener("load", async () => {
  const savedWallet = localStorage.getItem("frenwheel_wallet");
  if (savedWallet) {
    await connectWallet();
  }
});

// --- Game logic ---
async function spinWheel() {
  if (!contract || !token) {
    alert("Please connect wallet first.");
    return;
  }

  try {
    // Approve SpinWheel to spend 30K FRENS
    const amount = ethers.parseUnits("30000", 18);
    const approveTx = await token.approve(CONTRACT_ADDRESS, amount);
    await approveTx.wait();

    // Call spin()
    const spinTx = await contract.spin();
    const receipt = await spinTx.wait();

    let reward = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed.name === "Spin") {
          reward = parsed.args.reward.toString();
        }
      } catch {}
    }

    spinCount++;
    document.getElementById("spinCount").innerText = `Spins: ${spinCount}`;

    if (reward == 0) {
      document.getElementById("resultText").innerText = "💀 Nothing this time!";
    } else {
      document.getElementById("resultText").innerText = `🎉 You won ${reward} FRENS!`;
    }

    drawWheel();
  } catch (err) {
    console.error(err);
    alert("Spin failed.");
  }
}

// --- UI buttons ---
document.getElementById("connectButton").onclick = connectWallet;
document.getElementById("disconnectButton").onclick = disconnectWallet;
document.getElementById("spinButton").onclick = spinWheel;

// --- Wheel drawing ---
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const prizes = ["Nothing", "20K", "50K", "100K"];
const colors = ["#220033", "#330066", "#440099", "#5500cc"];

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const angle = (2 * Math.PI) / prizes.length;

  prizes.forEach((prize, i) => {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.arc(200, 200, 200, i * angle, (i + 1) * angle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.translate(200, 200);
    ctx.rotate(i * angle + angle / 2);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(prize, 60, 10);
    ctx.restore();
  });

  // pointer
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(190, 30);
  ctx.lineTo(210, 30);
  ctx.closePath();
  ctx.fill();
}

drawWheel();
