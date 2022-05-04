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
  const id = event?.pathParameters?.id || '1';
  console.log(`Passed id: ${id}`);
  try {
    const item = await getItem(id);

      let counter = parseInt(id);
      if (counter > 400) {
        do {
          console.log(`current iteration: ${counter}`);
          counter -= 400;
          await getItem("400");
        } while (counter > 400);
      }

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

const getItem = async (id: string) => {
  const item = await dynamo
    .get({
    TableName: process.env.TABLE || '',
    Key: {
      id: id
    }
  })
  .promise();
  return item;
}