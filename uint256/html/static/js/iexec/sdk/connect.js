const chains = {
    1: {
        name: "Mainnet",
        nameFull: "iExec Mainnet",
        symbol: "RLC",
        chainNo: 1,
        native: false,
        gas: true
    },
    5: {
        name: "Goerli",
        nameFull: "iExec Testnet",
        symbol: "RLC",
        chainNo: 5,
        native: false,
        gas: true
    },
    133: {
        name: "Viviani",
        nameFull: "iExec Sidechain Testnet",
        symbol: "xRLC",
        rpc: "https://viviani.iex.ec",
        chainNo: 133,
        icon: "",
        native: true,
        gas: false
    },
    134: {
        name: "Bellecour",
        nameFull: "iExec Sidechain",
        symbol: "xRLC",
        rpc: "https://bellecour.iex.ec",
        chainNo: 134,
        icon: "",
        native: true,
        gas: false
    }
}

const chainHex = (num) => { return '0x' + Number(num).toString(16) }

// cant update info box while adding sdk
export async function connectSDK(chainName='viviani', smsURL=null) {
    if (typeof iexec == 'undefined') {
        return {
            error: "iExec SDK missing from script"
        };
        return false
    }

    const {IExec, utils} = iexec;
    const chain = chains[chainName];
    chain.chainId = chainHex(chain.chainNo);

    if (!chain) {
        return {
            error: `Invalid chain JSON, please contact admin to fix`
        };
    }

    const wallet = {
        chain: {
            name: chain.name,
            nameFull: chain.nameFull,
            symbol: chain.symbol,
            rpc: chain.rpc,
            chainNo: chain.chainNo,
            chainId: chain.chainId
        }
    };

    // check if web3 wallet
    if (window.ethereum) {
        try {
            let chainId = await ethereum.request({
                method: "eth_chainId"
            });
            // check web3 chain = required app chain
            if (chainId != wallet.chain.chainId) {
                // ask to change network
                try{
                    await ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: chain.chainId }],
                          });
                   } catch(switchError){
                    // need to catch all errors
                    if (switchError.code === 4902) {
                        try {
                          await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{ chainId: chain.chainId,
                            chainName: chain.nameFull,
                            nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
                            rpcUrls: [chain.rpc],
                            //blockExplorerUrls: [chain.explorer],
                            //iconUrls: chain.icon
                            }]
                            });
                        } catch (addError) {
                              return {
                                error: `Please add ${wallet.chain.nameFull} Chain`
                                    };
                        }

                    }else if (switchError.code === -32002) {
                        return {
                                error: `Accept or deny chain change to ${wallet.chain.nameFull} `
                                    };

                    }else if (switchError.code === 4001) {
                        return {
                                error: `Please switch to ${wallet.chain.nameFull} chain `
                                    };

                    }

                    // assume network switched and then connected here
                    // or verify 1 more time?
                    chainId = await ethereum.request({
                        method: "eth_chainId"
                        });
                    if (chainId != wallet.chain.chainId) {
                        return {
                                error: `Please connect to ${wallet.chain.nameFull} chain `
                                };
                    }
                }
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            //setAccounts(accounts);
        } catch (error) {
            if (error.code === 4001) {
                return {
                    error: "User Rejected MetaMask Request"
                };
            }
            return {
                error: "MetaMask error"
            };
        }
    } else {
        return ({
            error: "Need to install Web3 Wallet/MetaMask"
        })

    }

    // iexec sdk uses int id, new metamask uses hex id
    wallet.iexec = new IExec(
        {
        ethProvider: window.ethereum,
        },
        {
        isNative: chain.native, // iExec sidechain use RLC as native token
        useGas: chain.gas,
        smsURL: ((smsURL) ? smsURL: {})
        }
    );
    wallet.utils = utils;
    // need to getAddress() each time or can store? what if user switches
    // just going to use getAddress() each time and use this for display
    const userAddress = await wallet.iexec.wallet.getAddress();
    wallet.user = { address: userAddress };

    return wallet;
}