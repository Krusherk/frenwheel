import { usePrivy } from "https://cdn.jsdelivr.net/npm/@privy-io/react-auth/+esm";

export function ConnectWalletButton({ onConnected }) {
  const { connectWallet } = usePrivy();

  const button = document.createElement("button");
  button.innerText = "Connect Wallet";
  button.style.backgroundColor = "#3182ce";
  button.style.color = "#fff";
  button.onclick = async () => {
    const wallet = await connectWallet();
    if (wallet?.address) {
      onConnected(wallet.address);
    }
  };

  return button;
}

