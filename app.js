import { ConnectWalletButton } from './privy.js';
import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers/+esm';

const root = document.getElementById("root");

let walletAddress = null;

// Add wallet connect button
const connectBtn = ConnectWalletButton({ onConnected: (addr) => {
  walletAddress = addr;
  root.removeChild(connectBtn);
  renderGame();
}});
root.appendChild(connectBtn);

function renderGame() {
  const container = document.createElement("div");

  const wheel = document.createElement("div");
  wheel.className = "wheel";
  const segments = ["Prize 1", "Prize 2", "Prize 3", "Prize 4"];
  const colors = ["#364C62", "#F1C40F", "#E67E22", "#E74C3C"];

  segments.forEach((seg, i) => {
    const div = document.createElement("div");
    div.className = "segment";
    div.style.background = colors[i];
    div.style.transform = `rotate(${i * 90}deg) skewY(-45deg)`;
    wheel.appendChild(div);
  });

  const spinBtn = document.createElement("button");
  spinBtn.innerText = "Spin";
  spinBtn.style.backgroundColor = "#38a169";

  spinBtn.onclick = async () => {
    if (!walletAddress) return alert("Connect wallet first!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      "0x8D478F0B6B60bedEe070041fa829486Fe371C340",
      ["function spin() public returns (uint256 prizeIndex)"],
      signer
    );

    const tx = await contract.spin();
    const receipt = await tx.wait();
    const prizeIndex = receipt.events?.[0].args?.prizeIndex.toNumber() ?? Math.floor(Math.random() * segments.length);

    const rotation = Math.floor(Math.random() * 360) + 360 * 3 + (360 / segments.length) * prizeIndex;
    wheel.style.transition = "transform 3s ease-out";
    wheel.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => alert(`You won ${segments[prizeIndex]}!`), 3000);
  };

  container.appendChild(wheel);
  container.appendChild(spinBtn);
  root.appendChild(container);
}
