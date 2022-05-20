# iExec randomness

---
## uint256 version

*returns [uint256] callback*

## full version
*returns [bytes32, uint256] callback*

---
## Setup

####Install the iExec SDK cli'
```
npm i -g iexec        # sudo <cmd> if needed
```

####Create a new Wallet file
```
iexec wallet create
```
You will be asked to choose a password to protect your wallet, don't forget it since there is no way to recover it. The SDK creates a wallet file that contains a randomly generated private key encrypted by the chosen password and the derived public address. Make sure to back up the wallet file in a safe place and write down your address.
Your wallet is stored in the ethereum keystore, the location depends on your OS:
>On Linux: ~/.ethereum/keystore
>On Mac: ~/Library/Ethereum/keystore
>On Windows: ~/AppData/Roaming/Ethereum/keystore
>Wallet file name follow the pattern:
>UTC--{CREATION_DATE}--{ADDRESS}

iExec SDK uses standard Ethereum wallet, you can reuse or import existing Ethereum wallet.

If you would like to reuse your existing wallet
```
iexec wallet import {PRIVATE_KEY}
```

####Initialize the iExec app
In the app root directory initialize the app, being sure to skip wallet creation, as we've already done this. Answer No if it asks to replace iexec.json and/or chain.json
```
iexec init --skip-wallet 
? "iexec.json" already exists, replace it with new one? No
? "chain.json" already exists, replace it with new one? No
✔ iExec project is ready
```
You can now check your wallet content on Viviani (iExec sidechain testnet)
```
iexec wallet show --chain viviani
```
Initialize IPFS remote storage, to store outputs
```
iexec storage init --chain viviani
```

####Build Docker Image
```
./build
```

####Verify Proper Result
```
bash ./run
```

####Sconify Image
```
./sconify.sh
```

####Tag Docker Image***
```
    docker tag {DOCKER_ID}/iexec-offchain-python-randomness-uint256:{IMAGE_TAG} {DOCKER_ID}/iexec-offchain-python-randomness-uint256:tee-debug-6.0.1
```
####Push to Docker Hub
```
    docker push {DOCKER_ID}/iexec-offchain-python-randomness-uint256:tee-debug-6.0.1
```

####Modify app Configuration
Change the owner address in iexec.json to the wallet address you just created.
```
...
    "app": {
    "owner": "{YOUR_ADDRESS}",
    "name": "tee randomness uint256 v6.0.1",
    "type": "DOCKER",
    "multiaddr": "{DOCKER_ID}/iexec-offchain-python-randomness-uint256:tee-debug-6.0.1",
    "checksum": "0x{SHA256_FROM_DOCKER_PUSH}",
    "mrenclave": {
      "provider": "SCONE",
      "version": "v5",
      "entrypoint": "python3 /app/app.py",
      "heapSize": 1073741824,
      "fingerprint": "{MRENCLAVE_FINGERPRINT_FROM_SCONIFY.SH}"
    }
    },
```

####Deploy app
```
iexec app deploy --chain viviani
```
Check last deployed app
```
iexec app show --chain viviani
```
The app is now ready to run on iExec!

####Run app
iExec allows us to run docker applications on decentralized infrastructure with payment in RLC tokens (native cryptocurrency of iExec). To get some RLC 
```
iexec wallet get-RLC --chain viviani
iexec wallet show --chain viviani # confirm deposit from faucet
```
>Your iExec account is your credit ready to use to pay for computation, it is managed by smart contracts (and not owned by iExec).
>When you request an execution the price for the task is locked from your account's stake then transferred to the workers contributing to the task.
>At any time you can:
>-deposit RLC from your wallet to your iExec Account
>-withdraw RLC from your iExec account to your wallet (only stake can be withdrawn)

Top up your iExec Account
```
iexec account deposit 200 --chain viviani
```
You can check the transfer with the following
```
iexec account show --chain viviani
iexec wallet show --chain viviani
```

####Run app
Now that the app is deployed and we have RLC in our account to pay the workers, we are ready to run with the following command. You will be asked to confirm the run. Answer Yes to continue.
```
iexec app run {APP_ADDRESS} --tag tee --workerpool 0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe --callback 0x0000000000000000000000000000000000000001 --args "1 10" --watch --chain viviani
? Do you want to spend 0.0 RLC to execute the following request: 
...
 Yes
```
This will take some time to run. Once the task is completed copy the Taskid (a 32Bytes hexadecimal string) from the ` iexec run` output.

Download the result of your task
```
iexec task show <TASK_ID> --download my-result --chain viviani
```

####View Result
```
unzip my-result.zip -d my-result
cat my-result/result.txt
```

If the task fails, enter the following command to get a refund
```
iexec task claim
```

####Publish app
```
iexec app publish {APP_ADDRESS} --volume 1000 --tag tee
```
