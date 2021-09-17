const explorerURL = 'https://v6.gateway.iex.ec';

export async function fetchTask(bodyJSON) {
    const results = {};

    const apiResponse = await fetch( explorerURL + "/tasks", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0",
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.5",
            "content-type": "application/json"
        },
        "referrer": explorerURL,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": bodyJSON,
        "method": "POST",
        "mode": "cors"
    }).then(response => response.json());

    if (apiResponse) {
        for (const i in apiResponse.tasks) {
            results[apiResponse.tasks[i].taskid] = {
                taskid: apiResponse.tasks[i].taskid,
                dealid: apiResponse.tasks[i].dealid,
                requester: apiResponse.tasks[i].requester,
                beneficiary: apiResponse.tasks[i].beneficiary,
                results: apiResponse.tasks[i].results,
                resultsCallback: apiResponse.tasks[i].resultsCallback,
                status: apiResponse.tasks[i].status,
                timestamp: apiResponse.tasks[i].finalizeBlockTimestamp,
            };
        }
    }

    return results;
}

export async function fetchDeal(bodyJSON) {
    const results = {};

    const apiResponse = await fetch( explorerURL + "/deals", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0",
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.5",
            "content-type": "application/json"
        },
        "referrer": explorerURL,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": bodyJSON,
        "method": "POST",
        "mode": "cors"
    }).then(response => response.json());

    if(apiResponse){
        for(const i in apiResponse.deals){
            const paramsJSONString = apiResponse.deals[i].params;
            const paramsJSON = JSON.parse(paramsJSONString.replace('/', ''));
            let dealParams;
            if(paramsJSON.iexec_args){
                dealParams = paramsJSON.iexec_args.split(" ");
            }else{
                dealParams = null;
            }

            results[apiResponse.deals[i].dealid] = {
                dealid: apiResponse.deals[i].dealid,
                requester: apiResponse.deals[i].requester,
                beneficiary: apiResponse.deals[i].beneficiary,
                callback: apiResponse.deals[i].callback,
                app: apiResponse.deals[i].app.pointer,
                dataset: apiResponse.deals[i].dataset.pointer,
                workerpool: apiResponse.deals[i].workerpool.pointer,
                params: dealParams,
                timestamp: apiResponse.deals[i].blockTimestamp
            };
        }
    }

    return results;

}