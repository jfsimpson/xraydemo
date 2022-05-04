import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult,
  ClientContext,
} from "aws-lambda";

import * as AWS from "aws-sdk";
const AWSXRay = require('aws-xray-sdk');

const patchedAWS = AWSXRay.captureAWS(AWS);

const S3 = new patchedAWS.S3();

export const handler = async (
  event: APIGatewayProxyEvent,
  context: ClientContext
): Promise<APIGatewayProxyResult> => {

  const bucketName: string = process.env.BUCKET || '';
  console.log(`listing objects in ${bucketName}`);

  try {
    const data = await S3.listObjectsV2({ Bucket: bucketName }).promise();
    const body = {
      objects: data?.Contents?.map(function(e: any) { return e.Key })
    };
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify(body)
    };
  } catch (ex) {
    console.log(ex);
    return {
      statusCode: 200,
      headers: {},
      body: ex.toString()
    };
  }
}