import { fetchTask, fetchDeal } from "../iexec/explorer/fetch.js";
import { connectSDK } from "../iexec/sdk/connect.js";

let _appData;

// local
let wallet; // wallet will only be used to run 1 task
const flags = {waiting: false}; // easy way to disable user input

function hexUint256(hexString) {
    const intString = BigInt(hexString);
    return intString;
    }

function showTaskDetails(){
    const taskContainer = this.parentNode;
    // hide/show details
    const subDiv = taskContainer.getElementsByClassName("task-details")[0];
    subDiv.classList.toggle("task-hide");
    subDiv.classList.toggle("task-show");
    //logo
    const expandOption = this.querySelector('.task-expand-span');
    if(expandOption.dataset.show == "true"){
        expandOption.dataset.show = "false";
        expandOption.innerHTML = "Details ▼";

    }else{
        expandOption.dataset.show = "true";
        expandOption.innerHTML = "   Hide ▲";
    }

}

function addCompletedTasks(data, elementId="tasksContainer"){
    const table = document.getElementById(elementId);

    const currentTaskCount = table.querySelectorAll('.task-container').length;

    // build new entries
    let newTaskCount = 1;
    data.forEach(entry => {

        const newEntry = document.createElement("div");
        const entryId = currentTaskCount + newTaskCount;

        newEntry.id = `task-id-${entryId}`;
        newEntry.classList.add("task-container");

        if(entryId % 2 == 0){
            newEntry.classList.add("task-even");
        }else{
            newEntry.classList.add("task-odd");
        }

        if(entryId == 1){
            //only id 1 has task-start
            newEntry.classList.add("task-start");
        }else{
            // remove previous task as end
            // this will allow for transition
            const previousTask = document.getElementById(`task-id-${entryId-1}`);
            previousTask.classList.remove("task-end");
            if(entryId != 2){
                previousTask.classList.add("task-middle");
            }
        }

        let dataHTML;

        //main
        const mainData = document.createElement("div");
        mainData.classList.add("task-results");
        mainData.onclick = showTaskDetails;

        // visual display results how smart contract sees callbackResult
        const processedResults = hexUint256(entry.resultsCallback);
        const entryDate = new Date(entry.timestamp).toLocaleString("en-US")

        dataHTML = `
            <div class="task-results-header">
                <div class="task-results-header-left">
                    <div class="task-results-callback-label">smart contract address</div>
                    <div class="task-results-callback-data">${entry.callback}</div>
                </div>
                <div class="task-results-header-right">
                    <div class="task-results-timestamp">
                        <div class="task-results-timestamp-label">timestamp</div>
                        <div class="task-results-timestamp-data">${entryDate}</div>
                    </div>
                </div>
            </div>
            <div class="task-results-body">
                <div class="task-results-body-left">
                    <div class="task-results-result">
                        <div class="task-results-result-label">result</div>
                        <div class="task-results-result-data">
                            <span class="uint256-span">${processedResults}</span>
                        </div>
                    </div>
                </div>
                <div class="task-results-body-right">
                    <span class="task-expand-span" data-show="false">Details ▼</span>
                </div>
            </div>
            `;
        mainData.innerHTML = dataHTML;
        newEntry.appendChild(mainData);

        // details
        const subData = document.createElement("div");
        subData.classList.add("task-details");
        subData.classList.add("task-hide");

        dataHTML = `
            <div class="task-details-left">
                <div class="task-details-requester">
                    <div class="task-details-requester-label">requester</div>
                    <div class="task-details-requester-data">${entry.requester}</div>
                </div>
                <div class="task-details-resultsCallback">
                    <div class="task-details-resultsCallback-label">callback hex</div>
                    <div class="task-details-resultsCallback-data">
                    <span class="uint256-span">${entry.resultsCallback}</span>
                    </div>
                </div>
                <div class="task-details-resultType">
                    <div class="task-details-resultType-label">result type</div>
                    <div class="task-details-resultType-data">random uint256</div>
                </div>
                <div class="task-details-deal">
                    <div class="task-details-deal-label">deal</div>
                    <div class="task-details-deal-data"><a class="white-link" href="https://explorer.iex.ec/viviani/deal/${entry.dealid}" target="_blank">${entry.dealid}</a></div>
                </div>
                <div class="task-details-task">
                    <div class="task-details-task-label">task</div>
                    <div class="task-details-task-data"><a class="white-link" href="https://explorer.iex.ec/viviani/task/${entry.taskid}" target="_blank">${entry.taskid}</a></div>
                </div>
           </div>
            `;
        subData.innerHTML = dataHTML;
        newEntry.appendChild(subData);
        newEntry.classList.add("task-end");

        table.appendChild(newEntry);

        ++newTaskCount;

        });

    //const tableTitleText = document.getElementById("tableTitle");
    //tableTitleText.innerHTML = `Randomness Since: ${new Date(lastDate).toLocaleString("en-US")}`;

}

async function fetchLatest(appAddress, chainId, lastDate=null){
    if(lastDate === null){
        lastDate = new Date().toISOString();
    }

    let newLastDate;
    const latest = [];
    // using bene filter over {"app": {"pointer":"${appAddress}"}}
    const fetchDealJSON = `{"limit":20, "chainId":${chainId}, "find": {"beneficiary": "${appAddress}"} }`;
    const deals = await fetchDeal(fetchDealJSON);

    if(!deals){
        return [null, null];
    }

    const fetchTaskJSON = `{"limit":20, "chainId":${chainId}, "find": {"beneficiary": "${appAddress}"} }`;
    const tasks = await fetchTask(fetchTaskJSON);

    if(!tasks){
        return [null, null];
    }

    // compare lists to get matches
    const taskDeals = {};

    for (const i in deals){
        if(deals[i].app == appAddress){
            let params;
            if(deals[i].params){
                params = deals[i].params;
            }else{
                params = "default"; // manually entering default... lazy
            }
            taskDeals[deals[i].dealid] = {params: params, callback: deals[i].callback, requester: deals[i].requester };
        }
    }

    const resultMatches = [];

    for (const i in tasks){
        if(tasks[i].status != "3"){
            continue;
        }

        if(taskDeals[tasks[i].dealid]){
            //format results as needed here or later
            const resultsHex = tasks[i].results;
            const resultsString = decodeURIComponent(resultsHex.substring(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));

            let results;
            if(resultsString.length > 0){
                const resultsJSON = JSON.parse(resultsJSONString);
                results = resultsJSON.location.substring(6); // remove /ipfs/
           }else{
                results = null
            }

            resultMatches.push({
                taskid: tasks[i].taskid,
                dealid: tasks[i].dealid,
                callback: taskDeals[tasks[i].dealid].callback,
                requester: taskDeals[tasks[i].dealid].requester,
                timestamp: tasks[i].timestamp,
                results: results,
                resultsHex: resultsHex,
                resultsCallback: tasks[i].resultsCallback
                });

            newLastDate = tasks[i].timestamp; // last result
        }
    }

    let lastDateOffset;
    if (!newLastDate){
        newLastDate = lastDate;
    }

    return [resultMatches, newLastDate];
}

// trigger IPFS storage prompt with metamask
async function pushStorage(){
    const web3Status = document.getElementById("web3Status");
    // sign with metamask
    try {
        web3Status.innerHTML = 'Sign remote storage message';
        const defaultStorageToken = await wallet.iexec.storage.defaultStorageLogin();
        web3Status.innerHTML = 'Send message to initialize remote storage';
        const { isPushed } = await wallet.iexec.storage.pushStorageToken(defaultStorageToken);
        // console.log(isPushed); // true
        web3Status.innerHTML = 'remote storage initialized, click run task';

        // hide button in html or can add
        const taskButton = document.getElementById("runTaskButton");
        taskButton.classList.toggle("task-block");
        taskButton.classList.toggle("task-allow");
        taskButton.disabled = false;
        taskButton.onclick = (d) => { taskSend(); };

        const ipfsButton = document.getElementById("ipfsButton");
        ipfsButton.classList.toggle("display-none");
        ipfsButton.classList.toggle("task-block");
        ipfsButton.classList.toggle("task-allow");
        ipfsButton.disabled = true;
        ipfsButton.onclick = "";



      } catch (error) {
        //throw Error('User denied access', error);
        web3Status.innerHTML = error.message;
      }

}

async function connectWallet(){
    const web3Status = document.getElementById("web3Status");
    // disable button
    this.disabled = true;

    // change sms address if needed
    let smsURL = {};
    if(_appData.sms){
        smsURL = _appData.sms;
    }

    const walletConnection = await connectSDK(_appData.chainId, smsURL);

    if(walletConnection.error){
        // display error
        console.log(walletConnection.error);
        web3Status.innerHTML = walletConnection.error;
        this.disabled = false;
        return false;
    }

    wallet = walletConnection;

    web3Status.innerHTML = `Connected to ${wallet.chain.nameFull}`;
    this.classList.toggle("connection-inactive");
    this.classList.toggle("connection-active");
    this.onclick = null;
    this.innerHTML = `${wallet.user.address.substring(0, 6)}...${wallet.user.address.substring(wallet.user.address.length-4)} Connected!`;

    // check for storage
    const isIpfsStorageInitialized = await wallet.iexec.storage.checkStorageTokenExists(wallet.user.address);

    if(isIpfsStorageInitialized){
        // hide button in html or can add
        const taskButton = document.getElementById("runTaskButton");
        taskButton.classList.toggle("task-block");
        taskButton.classList.toggle("task-allow");
        taskButton.disabled = false;
        taskButton.onclick = (d) => { taskSend(); };
    }else{
        web3Status.innerHTML = 'Please initialize storage';

        const ipfsButton = document.getElementById("ipfsButton");
        ipfsButton.classList.toggle("display-none");
        ipfsButton.classList.toggle("task-block");
        ipfsButton.classList.toggle("task-allow");
        ipfsButton.disabled = false;
        ipfsButton.onclick = (d) => { pushStorage(); };
    }

}

async function taskSend(app=null, dataset=null, workerpool=null){
    // using iexec v6 sdk.js
    // running task starts metamask process
    // message is built
    // user asked to sign message
    // user asked to send tx
    // waits
    // returns results

    //////
    // DETERMINE BEST WAY TO BRING ORDERBOOKS INTO APP
    //////
    const web3Status = document.getElementById("web3Status");

    if(!wallet){
        // wallet should always be generated before enabling runTask button
        web3Status.innerHTML = `connect web3 wallet`;
        return false
    }

    // easier to manage status messages and doesnt break metamask app
    flags.waiting = true;
    const taskButton = document.getElementById("runTaskButton");
    taskButton.disabled = true;
    taskButton.classList.toggle("task-block");
    taskButton.classList.toggle("task-allow");
    //taskButton.onclick = "";

    try{
        // in this case since app and dataset are constant only need to download workerpool order
        // modify to download all presigns
        //workerpool: '0xEb6c3FA8522f2C342E94941C21d3947c099e6Da0'
        let signedWorkerpoolOrder = null;
        let signedAppOrder = null;
        let signedDatasetOrder = null;

        // select defaults here or have user select then verify
        let taskWorkerpool;

        if (workerpool){
            taskWorkerpool = _appData.workerpools[workerpool];
        }else{
            taskWorkerpool = _appData.workerpools[_appData.default.workerpool];
        }

        if(!taskWorkerpool.order){
            web3Status.innerHTML =`Searching for a workerpool`;
            const workerpoolSearch = await wallet.iexec.orderbook.fetchWorkerpoolOrderbook({workerpool: taskWorkerpool.address, minTag: _appData.request.required.tag, category:_appData.request.required.category });
            // or workerpoolSearch.ok === false
            if(workerpoolSearch.error){
                throw workerpoolSearch.error;
                }
            if(workerpoolSearch.orders === undefined || workerpoolSearch.orders.length == 0){
             throw {message: "No TEE workerpool orders found"};
            }
            signedWorkerpoolOrder = workerpoolSearch.orders[0].order;
            web3Status.innerHTML =`Workerpool order found`;
        }else{
            signedWorkerpoolOrder = taskWorkerpool.order;
        }

        let taskApp;
        if (app){
            taskApp = _appData.apps[app];
        }else{
            taskApp = _appData.apps[_appData.default.app];
        }

        if(!taskApp.order){
            // code to get signed app order from API
            signedAppOrder = null;
        }else{
            signedAppOrder = taskApp.order;
            web3Status.innerHTML =`App order found`;
        }

        let taskDataset;
        if (dataset){
            taskDataset = _appData.datasets[dataset];
        }else{
            if(_appData.default.dataset != null){
                taskDataset = _appData.datasets[_appData.default.dataset];
            }else{
                taskDataset = {order: null, address: null}
            }
        }

        if(!taskDataset.order){
            // code to get signed dataset order from API
            signedDatasetOrder = {};
        }else{
            signedDatasetOrder = taskDataset.order
            web3Status.innerHTML =`Dataset order found`;
        }

        // check if app workerpool dataset valid

        // request order

        // get smart contract address within div "coin-selection"
        const userCallback = document.getElementById("userSmartContract").value;
        ////
        // add better check / give message or have sdk handle it
        ////

        // dont need to define ips since callback
        const iexec_args = [];
        const iexec_args_string = iexec_args.join(' ');

        const newRequestOrder = {};
        newRequestOrder["app"] = taskApp.address;
        newRequestOrder["callback"] = userCallback;
        newRequestOrder["workerpool"] = taskWorkerpool.address;
        newRequestOrder["volume"] = 1;
        newRequestOrder["category"] = _appData.request.required.category;
        newRequestOrder["trust"] = _appData.request.required.trust;
        newRequestOrder["tag"] = _appData.request.required.tag;
        newRequestOrder["beneficiary"] = taskApp.address;

        if(iexec_args_string){
            newRequestOrder["params"] = iexec_args_string;
        }

        if(taskDataset.address){
            newRequestOrder["dataset"] = taskDataset.address;
        }

        const requestOrderToSign = await wallet.iexec.order.createRequestorder(newRequestOrder);

        // 1 sign order
        web3Status.innerHTML = `Sign your new request order with web3 wallet [1/2]`;
        const signedRequestOrder = await wallet.iexec.order.signRequestorder(requestOrderToSign);

        // 2 send order
        if(signedRequestOrder.error){ throw signedRequestOrder.error; }

          web3Status.innerHTML =`Confirm your transaction on web3 wallet [2/2]`;

          // ERC1538

          // look up how to null dataset and get rid of IF
          // datasetorder = order.NULL_DATASETORDER,
          let sentOrder;
          if(Object.keys(signedDatasetOrder).length != 0){
            sentOrder = await wallet.iexec.order.matchOrders({
                apporder: signedAppOrder,
                datasetorder: signedDatasetOrder,
                workerpoolorder: signedWorkerpoolOrder,
                requestorder: signedRequestOrder
            });
          }else{
            sentOrder = await wallet.iexec.order.matchOrders({
                apporder: signedAppOrder,
                workerpoolorder: signedWorkerpoolOrder,
                requestorder: signedRequestOrder
            });

          }
          // promise waits for txn to be mined... how to interact with??

          if(sentOrder.error){
            throw sentOrder.error;
          }

            //flags.newTaskOn = false;
            web3Status.innerHTML = `<a href="https://explorer.iex.ec/viviani/deal/${sentOrder.dealid}" target="_blank">[Monitor iExec Task Status]</a>`;

        } catch (e) {
            if(e.message){
                web3Status.innerHTML = `error: ${e.message}`;
              }else{
                web3Status.innerHTML = `error: general web3 error, reload page`;
              }

              console.log(e);
              flags.waiting = false;
              taskButton.disabled = false;
              taskButton.classList.toggle("task-block");
              taskButton.classList.toggle("task-allow");
    }

    }


export async function loadApp(ipfsRateLimit=0){
    const tasksInfo = document.getElementById("tasksContainer");

    // check for required js
    if (typeof appData == "undefined"){
        tasksInfo.innerHTML = "missing data.js";
        return false;
    }else{
        _appData = appData;
    }

    // load recent random numbers
    const [latestTasks, lastDate] = await fetchLatest(_appData.default.app, _appData.chainId);

    if(latestTasks != null && latestTasks.length != 0){
        tasksInfo.innerHTML = "";
        await addCompletedTasks(latestTasks, "tasksContainer");
    }else{
        tasksInfo.innerHTML = "no results found";
    }

    const web3Status = document.getElementById("web3Status");
    //add metamask connection
    let web3Connect = document.getElementById("web3Connect");
    web3Connect.setAttribute("class", "connect-button connection-inactive");
    web3Status.innerHTML = `<span>Connect Web3 Wallet</span>`;
    web3Connect.onclick = connectWallet;

}

export async function loadSample(){
    const tasksInfo = document.getElementById("tasksContainer");

    // check for required js
    if (typeof appData == "undefined"){
        tasksInfo.innerHTML = "missing data.js";
        return false;
    }else{
        _appData = appData;
    }

    //use sample data
    const latestTasks = [
  {
    "taskid": "0x201d915fce714f3bb92c4ac6daf4e48a1db322e0ddccae6acd4fbff15175513f",
    "dealid": "0xf56d9d632f232c2c87f63bc47fadf2f9b5bae03e5be64b99589ed0118f2cb15c",
    "callback": "0x0000000000000000000000000000000000000001",
    "requester": "0xcbb9780f050F3EA7b290Ec5D6Cd4a32D23f81eeb",
    "timestamp": "2021-08-25T00:03:30.000Z",
    "results": null,
    "resultsHex": "0x",
    "resultsCallback": "0xb7726e2a8a97a0706d48b618d60bbe170f35a833fa0e1663451927ab4d857dc2"
  },
  {
    "taskid": "0x39f82c8cfab5f7b1489b88b3e0d6d32a91071e08a1eb249e16b596ab2d499f43",
    "dealid": "0x49c4b8350878f18f951cf5ea6dfbf7dec38ebb2ec901633d9f5de3717d2d74a8",
    "callback": "0x0000000000000000000000000000000000000001",
    "requester": "0xcbb9780f050F3EA7b290Ec5D6Cd4a32D23f81eeb",
    "timestamp": "2021-08-24T23:04:00.000Z",
    "results": null,
    "resultsHex": "0x",
    "resultsCallback": "0x11a7967f357663c91ac5d5abed7bebfc5d3ecc879aef269f96421c91405f8ea5"
  },
  {
    "taskid": "0x9ffbc6aee68bbf55a6bfbdbd6cb3019ee4194e0be26a2fe2f1cf159b7c77fa9e",
    "dealid": "0x6d2f4f9b1d0a2c98149341a356563fd2c0f09df1efadf017ba40b526268c7236",
    "callback": "0x0000000000000000000000000000000000000001",
    "requester": "0xcbb9780f050F3EA7b290Ec5D6Cd4a32D23f81eeb",
    "timestamp": "2021-08-24T06:49:30.000Z",
    "results": null,
    "resultsHex": "0x",
    "resultsCallback": "0xd587d053f6a28e5a8b143e9c137ae7260f02a69c6310a545cd1747757603304c"
  }
];
    const lastDate = "2021-08-24T06:49:30.000Z";

    if(latestTasks != null && latestTasks.length != 0){
        document.getElementById("tasksContainer").innerHTML="";
        await addCompletedTasks(latestTasks, "tasksContainer");
    }

    // generate new task box
    const web3Status = document.getElementById("web3Status");
    //add metamask connection
    let web3Connect = document.getElementById("web3Connect");
    web3Connect.setAttribute("class", "connect-button connection-inactive");
    web3Status.innerHTML = `<span>Connect Web3 Wallet</span>`;
    web3Connect.onclick = connectWallet;
    //web3Status.innerHTML = "<span>Ready</span>";

}