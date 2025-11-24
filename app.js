let provider, signer, contract;
let abi;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const addr = await signer.getAddress();
  document.getElementById("account").innerText = "Connected: " + addr;
}

async function loadABI() {
  const res = await fetch("abi.json");
  abi = await res.json();
}

async function loadContract() {
  const address = document.getElementById("contractAddress").value;

  if (!ethers.isAddress(address)) {
    alert("Invalid Contract Address");
    return;
  }

  if (!abi) await loadABI();

  contract = new ethers.Contract(address, abi, signer);

  alert("Contract Loaded!");
  loadCandidates();
}

async function loadCandidates() {
  const candidates = await contract.getCandidates();
  const container = document.getElementById("candidates");

  container.innerHTML = "";

  candidates.forEach((c, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><b>${c.name}</b> — ${c.voteCount} votes 
      <button onclick="vote(${i})">Vote</button></p>
    `;
    container.appendChild(div);
  });
}

async function vote(i) {
  const tx = await contract.vote(i);
  alert("Transaction sent: " + tx.hash);
  await tx.wait();
  alert("Vote confirmed!");
  loadCandidates();
}
