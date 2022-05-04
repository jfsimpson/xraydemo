import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult 
} from "aws-lambda";

import * as AWSXRay from 'aws-xray-sdk';
import fetch from 'node-fetch';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const segment = AWSXRay.getSegment(); //returns the facade segment

  // Google
  await fetchEndpoint('https://google.com/', segment);

  // Portal
  await fetchEndpoint('https://genesis.dev.reckoncloud.com.au', segment);

  // Slow return
  await fetchEndpoint('http://httpstat.us/200?sleep=30000', segment);

  return {
    statusCode: 200,
    body: `Remote API returned successfully`
  }
}

const fetchEndpoint = async (url: string, segment: any) => {
  console.log(`fetching ${url}`);
  const subsegment = segment.addNewSubsegment('node-fetch');
  subsegment.addAnnotation('url', url);
  subsegment.addMetadata('external', '1');

  const data = await fetch(url, { method: 'get'});

  subsegment.close();
  return data;
}