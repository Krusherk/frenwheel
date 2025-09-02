const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340";
const TOKEN_ADDRESS = "0x1657e623c89d3b8ebcf18e6dd2c0a16d37668de8";

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

let provider, signer, contract, token;
let spinCount = 0;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found!");
    return;
  }

  try {
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x279f") {
      alert("Please switch MetaMask to Monad Testnet (chainId 0x279f)");
      return;
    }

    await ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    document.getElementById("walletAddress").innerText = `Connected: ${address}`;
    document.getElementById("spinButton").disabled = false;

    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

document.getElementById("connectButton").onclick = connectWallet;

async function spinWheel() {
  if (!contract || !token) {
    alert("Please connect wallet first.");
    return;
  }

  try {
    const amount = ethers.utils.parseUnits("30000", 18);
    const approveTx = await token.approve(CONTRACT_ADDRESS, amount);
    await approveTx.wait();

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
      document.getElementById(
        "resultText"
      ).innerText = `🎉 You won ${reward} FRENS!`;
    }

    drawWheel();
  } catch (err) {
    console.error(err);
    alert("Spin failed.");
  }
}

document.getElementById("spinButton").onclick = spinWheel;

// Wheel drawing
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

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(190, 30);
  ctx.lineTo(210, 30);
  ctx.closePath();
  ctx.fill();
}

drawWheel();
