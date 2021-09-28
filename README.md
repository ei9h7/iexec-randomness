# iExec randomness

---
## uint256 version

*returns [uint256] callback*

##### Demo IPFS URL

http://iexec.dev/ipfs/random-uint256

## full version
*returns [bytes32, uint256] callback*

---
## Setup
***build docker image***

    ./build

***verify proper result***

    bash ./run

***sconify image***

    ./sconify.sh

***tag docker image***

    docker tag {IMAGE_TAG} {DOCKER_ID}/offchain-python-randomness-uint256:tee-debug-6.0.1

***push to docker hub***

    docker push {DOCKER_ID}/offchain-python-randomness-uint256:tee-debug-6.0.1

***modify iexec.json***


    "app": {
    "owner": "{YOUR_ADDRESS}",
    "name": "tee randomness uint256 v6.0.1",
    "type": "DOCKER",
    "multiaddr": "{DOCKER_ID}/offchain-python-randomness-uint256:tee-debug-6.0.1",
    "checksum": "0x{SHA256_FROM_DOCKER_PUSH}",
    "mrenclave": {
      "provider": "SCONE",
      "version": "v5",
      "entrypoint": "python3 /app/app.py",
      "heapSize": 1073741824,
      "fingerprint": "{MRENCLAVE_FINGERPRINT_FROM_SCONIFY.SH}"
    }
    },


***deploy app***

    iexec app deploy

***test app***

*needs non-0x0 callback or won't finalize*

    iexec app run {APP_ADDRESS} --tag tee --workerpool 0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe --callback 0x0000000000000000000000000000000000000001 --chain viviani

***publish app***

    iexec app publish {APP_ADDRESS} --volume 1000 --tag tee


