import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as xRayDemo_service from './xRayDemo_service';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class XRayDemoServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create our Demo Service Stack
    new xRayDemo_service.XRayDemoService(this, 'XRayDemo');
  }
}
