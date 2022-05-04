import fetch from 'node-fetch';

export const handler = async (event: any): Promise<void> => {
  // Fetch all endpoint we want to drive traffic to for this demo
  const apiGatewayEndpoint = process.env.API_ENDPOINT || '';
  const dynamoEndpoint = apiGatewayEndpoint + 'xraydemo/read_dynamo/400';
  const remoteAPIEndpoint = apiGatewayEndpoint + 'xraydemo/call_api';
  const unreliableEndpoint = apiGatewayEndpoint + 'xraydemo/unreliable';
  const s3Endpoint = apiGatewayEndpoint + 'xraydemo/read_s3';
  const remoteAPITimeOut = apiGatewayEndpoint + 'xraydemo/call_api_timeout';

  const callApi = async (endpoint: string) => {
    console.log(`Fetching ${endpoint}`);
    try {
      await fetch(endpoint, { method: 'get'});
    } catch (ex) {
      console.log(ex);
    }
  }

  console.log('begin fake traffic requests');
  await Promise.all([
    callApi(apiGatewayEndpoint),
    callApi(dynamoEndpoint),
    callApi(unreliableEndpoint),
    callApi(s3Endpoint),
    callApi(remoteAPIEndpoint),
    callApi(remoteAPITimeOut),
  ]);
  
  console.log('end fake traffic requests');
  return;
}