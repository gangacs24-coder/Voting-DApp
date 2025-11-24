# Voting-DApp
📊 Voting DApp — Professional Dashboard (Pink + Purple Gradient UI)

A modern, elegant Ethereum Voting DApp featuring a Pink-Purple Gradient Dashboard, MetaMask integration, real-time charts, and premium UI components.
Built using Solidity, Ethers.js, Chart.js, and Vanilla HTML/CSS/JS.

🌟 Features

🗳 Decentralized Voting Smart Contract (Solidity)

💜 Premium Dashboard UI (Pink + Purple Web3 gradient)

📊 Live Vote Visualization using Chart.js

🔐 MetaMask Integration (connect wallet, sign transactions)

🔄 Auto-Refresh Vote Counts

👤 Candidate Cards with Vote Buttons

💫 Smooth Animations & Modern UI Components

📱 Responsive Layout

⚡ Super lightweight — no frameworks required

📂 Project Structure
voting-dapp/
│
├── index.html        # Frontend UI
├── style.css         # Pink & Purple Gradient Styles
├── dashboard.js      # Chart + UI logic
├── app.js            # MetaMask + Contract interaction
├── abi.json          # Contract ABI
└── contracts/
      └── Voting.sol  # Solidity Smart Contract

🛠 Tech Stack
Layer	Technology
Smart Contract	Solidity
Frontend	HTML, CSS, JavaScript
Blockchain	Ethereum / Sepolia
Wallet	MetaMask
Charts	Chart.js
Web3 Library	Ethers.js v6
📌 1. Smart Contract

Your contract goes in:

contracts/Voting.sol

pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory _candidateNames) {
        for(uint i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate(_candidateNames[i], 0));
        }
    }

    function vote(uint index) public {
        require(!hasVoted[msg.sender], "Already voted");
        candidates[index].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}

🚀 2. Deploying the Smart Contract
✔ Option A — Deploy Using Remix

Go to: https://remix.ethereum.org

Create Voting.sol

Compile using compiler 0.8.x

Deploy using:

Injected Provider – MetaMask

Select Sepolia Testnet

Enter candidates:

["Alice", "Bob", "Charlie"]


Copy deployed contract address

✔ Option B — Deploy Using Hardhat
Install Hardhat
npm install --save-dev hardhat
npx hardhat init

Add contract to contracts/Voting.sol
Write deploy script (scripts/deploy.js)
const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const contract = await Voting.deploy(["Alice", "Bob", "Charlie"]);
  await contract.deployed();

  console.log("Voting Contract deployed at:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

Deploy to Sepolia:
npx hardhat run scripts/deploy.js --network sepolia

🎨 3. Frontend Setup (VS Code)
✔ Step 1 — Open Folder in VS Code

Place these files:

index.html
style.css
dashboard.js
app.js
abi.json

✔ Step 2 — Run Frontend

You can use:

Option A — Live Server (Recommended)

Install VS Code extension Live Server

Right-click index.html

Click Open with Live Server

Option B — Simple Local Server
npx http-server

🔌 4. Connect MetaMask

Your DApp will:

✔ Ask user to connect wallet
✔ Detect network
✔ Load contract
✔ Allow voting
✔ Update chart in real-time

Make sure MetaMask is on Sepolia Testnet and has test ETH:

🎁 Sepolia Faucet:
https://sepoliafaucet.com

https://www.alchemy.com/faucets/ethereum-sepolia

📊 5. Dashboard Preview

Your build looks like this:

🌈 Pink + Purple Gradient UI

🖼 Add your screenshot here (same as the one you uploaded)

![Voting DApp Dashboard](screenshot.png)

🧠 6. How Voting Works

Load contract

Candidates appear with:

Name

Vote count

Vote button

Users vote → MetaMask pops up

Transaction confirms

Chart updates instantly
