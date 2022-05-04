import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult,
  ClientContext,
} from "aws-lambda";

import * as AWS from "aws-sdk";

const S3 = new AWS.S3();

export const handler = async (
  event: APIGatewayProxyEvent,
  context: ClientContext
): Promise<APIGatewayProxyResult> => {

  return {
    statusCode: 200,
    body: "hello world"
  };
}