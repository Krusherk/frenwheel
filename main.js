import { usePrivy } from "https://cdn.jsdelivr.net/npm/@privy-io/react-auth/+esm";

// Wallet connection
const connectWalletButton = document.getElementById("connect-wallet");
const walletAddressText = document.getElementById("wallet-address");
const spinButton = document.getElementById("spin-button");

connectWalletButton.addEventListener("click", async () => {
  const { connectWallet } = usePrivy();
  const wallet = await connectWallet();
  if (wallet?.address) {
    walletAddressText.innerText = `Connected: ${wallet.address}`;
    spinButton.disabled = false;
  }
});

// Spin wheel logic
const wheel = document.getElementById("wheel");
const resultText = document.getElementById("result");
const segments = wheel.querySelectorAll(".segment");

spinButton.addEventListener("click", () => {
  const randomDegree = Math.floor(Math.random() * 360) + 720; // Spins 2+ rounds
  wheel.style.transform = `rotate(${randomDegree}deg)`;

  setTimeout(() => {
    const normalizedDegree = randomDegree % 360;
    const segmentIndex = Math.floor(normalizedDegree / (360 / segments.length));
    resultText.innerText = `You won ${segments[segments.length - 1 - segmentIndex].innerText}!`;
  }, 4000);
});
