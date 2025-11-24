/* dashboard.js
   - Uses app.js's functions/contract if available.
   - If app.js defines `contract`, `loadContract`, `loadCandidates`, we will use them.
*/

let chart = null;

// helper: short address
function short(addr){ if(!addr) return ''; return addr.slice(0,6)+'...'+addr.slice(-4); }

async function initUI(){
  document.getElementById('connectBtn').onclick = async ()=>{
    if(typeof connectWallet === 'function') {
      await connectWallet();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const net = await provider.getNetwork();
        document.getElementById('networkInfo').innerText = net.name + ' ('+net.chainId+')';
        const signer = await provider.getSigner();
        const a = await signer.getAddress();
        document.getElementById('account').innerText = short(a);
      } catch(e){}
    } else {
      alert('connectWallet() not found in app.js. Make sure app.js defines connectWallet.');
    }
  };

  document.getElementById('loadBtn').onclick = async ()=>{
    const addr = document.getElementById('contractAddress').value.trim();
    if(!ethers.isAddress(addr)){ alert('Invalid address'); return; }
    // call the user's loadContract() if available
    if(typeof loadContract === 'function') {
      // ensure signer is ready
      try{
        await loadContract(); // this should set global `contract`
        await refreshAll();
      }catch(e){ console.error(e); alert('Error loading contract: '+e.message); }
    } else {
      alert('loadContract() not found in app.js. Please ensure app.js exposes loadContract() that sets `contract` global.');
    }
  };

  document.getElementById('refreshBtn').onclick = refreshAll;
  document.getElementById('clearBtn').onclick = ()=>{
    document.getElementById('contractAddress').value = '';
    document.getElementById('candidatesList').innerHTML = '';
    document.getElementById('totalVotes').innerText = '0';
    document.getElementById('votersCount').innerText = '0';
    document.getElementById('candidatesCount').innerText = '0';
    if(chart){ chart.destroy(); chart = null; }
  };

  document.getElementById('autoVoteBtn').onclick = async ()=>{
    // demo: vote for the first candidate via contract if available
    if(!contract){ alert('Load contract first'); return; }
    try{
      const tx = await contract.vote(0);
      document.getElementById('txStatus').innerText = 'Sent tx ' + tx.hash;
      await tx.wait();
      document.getElementById('txStatus').innerText = 'Confirmed ' + tx.hash;
      await refreshAll();
    }catch(e){
      document.getElementById('txStatus').innerText = 'Tx failed';
      console.error(e);
      alert('Auto-vote failed: ' + (e?.message || e));
    }
  };

  // keyboard: Enter to load
  document.getElementById('contractAddress').addEventListener('keydown', (e)=>{ if(e.key==='Enter') document.getElementById('loadBtn').click(); });

  // try to auto-fill account if connected
  if(window.ethereum && window.ethereum.selectedAddress){
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const a = await signer.getAddress();
      document.getElementById('account').innerText = short(a);
      const net = await provider.getNetwork();
      document.getElementById('networkInfo').innerText = net.name + ' ('+net.chainId+')';
    }catch(e){}
  }
}

async function refreshAll(){
  if(!window.contract){
    document.getElementById('txStatus').innerText = 'No contract loaded';
    return;
  }
  try{
    document.getElementById('txStatus').innerText = 'Fetching candidates...';
    const cands = await window.contract.getCandidates();
    // cands is tuple[] [{name, voteCount}]
    const normalized = cands.map(c => ({ name: c.name || c[0], votes: (c.voteCount ? Number(c.voteCount.toString()) : Number(c[1] || 0)) }));
    // build list
    const list = document.getElementById('candidatesList');
    list.innerHTML = '';
    let total = 0;
    normalized.forEach((c,i)=>{
      total += c.votes;
      const div = document.createElement('div');
      div.className = 'candidate-card';
      div.innerHTML = `
        <div class="candidate-left">
          <div class="candidate-avatar">${c.name.slice(0,2).toUpperCase()}</div>
          <div class="candidate-meta">
            <div class="candidate-name">${c.name}</div>
            <div class="candidate-votes">${c.votes} votes</div>
          </div>
        </div>
        <div>
          <button class="vote-btn" onclick="voteFromDashboard(${i})">Vote</button>
        </div>
      `;
      list.appendChild(div);
    });

    document.getElementById('totalVotes').innerText = total;
    document.getElementById('candidatesCount').innerText = normalized.length;
    // votersCount - attempt to estimate (if contract keeps mapping of voted addresses it's hard to count on-chain cheaply).
    document.getElementById('votersCount').innerText = '-';

    renderChart(normalized);
    document.getElementById('txStatus').innerText = 'Fetched ' + normalized.length + ' candidates';
  }catch(e){
    console.error(e);
    document.getElementById('txStatus').innerText = 'Fetch failed';
  }
}

async function voteFromDashboard(index){
  if(!window.contract){ alert('Load contract first'); return; }
  try{
    const tx = await window.contract.vote(index);
    document.getElementById('txStatus').innerText = 'Sent ' + tx.hash;
    await tx.wait();
    document.getElementById('txStatus').innerText = 'Confirmed ' + tx.hash;
    await refreshAll();
    // small success animation
    const el = document.querySelector('.panel-chart');
    el.animate([{ transform:'scale(1)'},{ transform:'scale(1.02)'},{ transform:'scale(1)'}], { duration:400, easing:'ease' });
  }catch(e){
    console.error(e);
    alert('Vote failed: '+(e?.message||e));
  }
}

function renderChart(data){
  const labels = data.map(d=>d.name);
  const values = data.map(d=>d.votes);
  const ctx = document.getElementById('voteChart').getContext('2d');
  if(chart){ chart.destroy(); chart = null; }
  chart = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels,
      datasets:[{
        label:'Votes',
        data: values,
        backgroundColor: [
          '#377dff','#00bfa6','#ff7a7a','#f7b500','#9b59ff','#5aa1ff'
        ]
      }]
    },
    options:{
      plugins:{ legend:{ position:'bottom' } },
      maintainAspectRatio:false,
    }
  });
  // resize container
  document.querySelector('.chart-wrap')?.style?.setProperty('height','320px');
}

window.addEventListener('load', initUI);
