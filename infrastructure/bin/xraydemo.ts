#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { XRayDemoServiceStack } from '../lib/xRayDemo_service-stack';

const app = new cdk.App();
new XRayDemoServiceStack(app, 'XRayStack', {});