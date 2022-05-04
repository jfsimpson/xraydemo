import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyResult 
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const queries = JSON.stringify(event.queryStringParameters);

  const minutes = new Date().getMinutes();
  const minuteArray = minutes.toString().split('');
  if (minuteArray.length < 2 || parseInt(minuteArray[1]) < 5) {
    // Let's throw errors every 5 minutes to make this interesting
    throw Error('unhandled exception');
  }
  return {
    statusCode: 200,
    body: `Queries: ${queries}`
  }
}