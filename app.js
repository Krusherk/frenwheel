const CONTRACT_ADDRESS = "0x8D478F0B6B60bedEe070041fa829486Fe371C340";


async function spinWheel() {
if (!contract || !token) {
alert("Please connect your wallet first.");
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
document.getElementById("resultText").innerText = `🎉 You won ${reward} FRENS!`;
}


drawWheelSegment(reward);
} catch (err) {
console.error(err);
alert("Spin failed.");
}
}


document.getElementById("spinButton").onclick = spinWheel;


// Wheel animation (simplified)
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const prizes = ["Nothing", "20K FRENS", "50K FRENS", "100K FRENS"];


function drawWheelSegment(highlight) {
const colors = ["#220033", "#330066", "#440099", "#5500cc"];
ctx.clearRect(0, 0, canvas.width, canvas.height);


const angle = (2 * Math.PI) / prizes.length;
prizes.forEach((prize, i) => {
ctx.beginPath();
ctx.moveTo(250, 250);
ctx.arc(250, 250, 250, i * angle, (i + 1) * angle);
ctx.fillStyle = colors[i % colors.length];
ctx.fill();
ctx.save();
ctx.translate(250, 250);
ctx.rotate(i * angle + angle / 2);
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText(prize, 60, 10);
ctx.restore();
});


ctx.fillStyle = "yellow";
ctx.beginPath();
ctx.moveTo(250, 0);
ctx.lineTo(240, 30);
ctx.lineTo(260, 30);
ctx.closePath();
ctx.fill();
}


drawWheelSegment();
