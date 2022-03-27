const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        // const ret = await axios(url);
        let proxyToInfo;
        let proxyRes;
        let proxyMode;
        try {
            proxyToInfo = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
            const { url, method, data, body, headers, mode } = proxyToInfo;
            if (url) {
                try {
                    const res = await axios(
                        {
                            method: method || 'get',
                            url: url,
                            headers: headers || event.headers,
                            data: method === "post" || method === "put" ? data || body : undefined,
                        }
                    );
                    proxyRes = { body: res.data, headers: res.headers, status: res.status, statusText: res.statusText, mode: mode };
                } catch (e) {
                    console.log(`proxy error ${e}`);
                }
            }
        } catch (e) {
            console.log(`body is not json`);
        }
        const headers = Object.keys(proxyRes.headers || []).reduce((h, k) => {
            if (typeof proxyRes.headers[k] === "string") h.headers[k] = proxyRes.headers[k];
            else h.multiValueHeaders[k] = proxyRes.headers[k];
            return h;
        }, { headers: {}, multiValueHeaders: {} });
        response = proxyRes && proxyRes.mode !== "debug"
            ? {
                'statusCode': proxyRes.status,
                'body': proxyRes.body,
                'headers': headers.headers,
                'multiValueHeaders': headers.multiValueHeaders,
            }
            : {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: 'echo',
                    proxyTo:
                        proxyToInfo
                            ? {
                                url: proxyToInfo.url,
                                body: proxyToInfo.body || '',
                                headers: proxyToInfo.headers || {},
                                userAgent: event.headers['User-Agent'],
                                result: proxyRes,
                            }
                            : "body is not json",
                    incoming: event
                    // location: ret.data.trim()
                })
            }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
