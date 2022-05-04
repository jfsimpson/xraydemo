import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';

export class XRayDemoService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    /**** S3 BUCKET ****/
    const bucket = new s3.Bucket(this, "XRayDemoBucket");

    /**** DYNAMODB TABLE ****/
    const table = new dynamodb.Table(this, "XRayDemoTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    /**** LAMBDA ****/
    // Base Lambda
    const baseAPILambda = new lambda.Function(this, "baseAPI", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "base.handler",
      tracing: lambda.Tracing.ACTIVE, // Turn tracing on in the lambda (Active trading)
    });

    // A Lambda Function which will return errors where the minutes on the clock are between hh:m0->h:m5 (eg. 3:30, 4:34)
    const unreliableLambda = new lambda.Function(this, "unreliableLambda", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "unreliable.handler",
      tracing: lambda.Tracing.ACTIVE, // Turn tracing on in the lambda (Active trading)
    });

    // A Lambda Function which will call 3rd party endpoints
    const remoteAPICallLambda = new lambda.Function(this, "remoteAPICall", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "remoteAPICall.handler",
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(20)
    });

      // A Lambda Function which will time out
      const remoteLambdaTimeout = new lambda.Function(this, "brokenRemoteAPI", {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("../code/build"),
        handler: "brokenRemoteAPI.handler",
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(35)
      });

    // A lambda function which will read a record from an s3 bucket
    const readS3Lambda = new lambda.Function(this, "readS3", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "readS3.handler",
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        BUCKET: bucket.bucketName
      }
    });

    // A lambda function which will read a record from a dynamodb table
    const readDynamoLambda = new lambda.Function(this, "readDynamo", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "readDynamo.handler",
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        TABLE: table.tableName
      },
      timeout: cdk.Duration.seconds(20)
    });

    bucket.grantReadWrite(readS3Lambda);
    table.grantReadWriteData(readDynamoLambda);
  
    /**** API GATEWAY ****/
    const api = new apigateway.RestApi(this, "xray-demo-api", {
      restApiName: "XRayDemo",
      description: "This API will demonstrate the Xray Functionality",
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true, // Turn tracing on in API Gateway
        stageName: 'dev'
      }
    });

    // Add base API - healthy
    api.root.addMethod("GET", new apigateway.LambdaIntegration(baseAPILambda, {proxy:true}));

    // Create /xraydemo/ API
    const demoApi = api.root.addResource("xraydemo");

    // Create GET /xraydemo/call_api
    const remoteAPICallApi = demoApi.addResource("call_api");
    remoteAPICallApi.addMethod('GET', new apigateway.LambdaIntegration(remoteAPICallLambda, {proxy:true}));

    // Create GET /xraydemo/call_api_timeout
    const timeoutApi = demoApi.addResource("call_api_timeout");
    timeoutApi.addMethod('GET', new apigateway.LambdaIntegration(remoteLambdaTimeout, {proxy:true}));

    // Create GET /xraydemo/read_s3
    const readS3Api = demoApi.addResource("read_s3");
    readS3Api.addMethod('GET', new apigateway.LambdaIntegration(readS3Lambda, {proxy:true}));

    // Create GET /xraydemo/unrealiable
    const unreliableApi = demoApi.addResource("unreliable");
    unreliableApi.addMethod('GET', new apigateway.LambdaIntegration(unreliableLambda, {proxy:true}));

    // Create GET /xraydemo/read_dynamo
    const readDynamoApi = demoApi.addResource("read_dynamo").addResource("{id}");
    readDynamoApi.addMethod('GET', new apigateway.LambdaIntegration(readDynamoLambda, {proxy:true}));


    /**** FAKE TRAFFIC ****/
    const fakeTrafficLambda = new lambda.Function(this, "fakeTraffic", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../code/build"),
      handler: "fakeTraffic.handler",
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        API_ENDPOINT: `https://${api.restApiId}.execute-api.ap-southeast-2.amazonaws.com/dev/`
      },
      timeout: cdk.Duration.seconds(50)
    });

    // CloudWatch Event to create fake traffic
    const eventRule = new events.Rule(this, 'scheduleRule', {
      schedule: events.Schedule.expression('rate(1 minute)'),
    });

    eventRule.addTarget(new eventTargets.LambdaFunction(fakeTrafficLambda));
  }
}