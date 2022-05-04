import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult 
} from "aws-lambda";

import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk';

const patchedAWS = AWSXRay.captureAWS(AWS);
const dynamo = new patchedAWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const invocations = event?.pathParameters?.invocations;
  console.log(`Reading id: 16 ${invocations} times`);
  try {
    const item = await dynamo
      .get({
        TableName: process.env.TABLE || '',
        Key: {
          id: event?.pathParameters?.id
        }
      })
      .promise();
      return {
        statusCode: 200,
        body: JSON.stringify(item) || 'No Items returned',
        headers: {
          'content-type': 'application/json'
        }
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: error.toString()
      };
    }
}