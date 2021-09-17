// manual pre-signs or download
// https://v6.api.market.iex.ec/workerpoolorders?category=${appCategory}&chainId=${chainId}&workerpool=${workerpoolAddress}
// https://v6.api.market.iex.ec/apporders?app=${appAddress}&chainId=${chainId}
// https://v6.api.market.iex.ec/datasetorders?app=${appAddress}&chainId=${chainId}

// presigns
const appOrder = {"sign":"0x2327d7d7c9321412930505745ef2935e71782d6862f2c0badec2a6dbb9b94e5e23f1ea8b2aed2a2caa251e617a1e7402ddd85dcf10a0b0613a0dea673fc219711c","salt":"0x00312ce7c1b7b3a6d9731dd873c3c59113a0e5f11639eb1d295281613b7cf321","requesterrestrict":"0x0000000000000000000000000000000000000000","workerpoolrestrict":"0x0000000000000000000000000000000000000000","datasetrestrict":"0x0000000000000000000000000000000000000000","tag":"0x0000000000000000000000000000000000000000000000000000000000000001","volume":9999,"appprice":0,"app":"0xAA3B06Ee962381bDd18Cbe0d2Fb067cA99611982"}
const datasetOrder = {}

// set any order defaults
const requestOrder = {
    category: 0,
    appmaxprice:0,
    workerpoolmaxprice:0,
    datasetmaxprice:0,
    tag: "tee",
    trust: 1
}

// used by app
const appData = {
    apps: { "0xAA3B06Ee962381bDd18Cbe0d2Fb067cA99611982": { order: appOrder, address: "0xAA3B06Ee962381bDd18Cbe0d2Fb067cA99611982"}},
    datasets: {},
    workerpools: { "0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe": {order:  null, address: "0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe"} },
    request: {required: requestOrder},
    default: {app: "0xAA3B06Ee962381bDd18Cbe0d2Fb067cA99611982",  dataset: null, workerpool:"0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe"},
    sms:"https://v6.sms.debug-tee-services.viviani.iex.ec",
    chainId: 133
}