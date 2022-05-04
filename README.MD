# XRAY Demo
* A demonstration of AWS X-ray with a variety of different scenarios demonstrated 
* (S3, Dynamo, slow end points, non-resposive endpoints)
* Created with CDK

## Quick start Commands
* `cd code`
* `pnpm install`
* `pnpm build`
* `pnpm postbuild`
* `cd infrastructure`
* `pnpm install`
* `cdk bootstrap`
* `cdk syth`
* `cdk deploy`

## Infrastructure
* In the /infrastructure/ folder
* Built with CDK
* CDK commands (to run from within /infrastructure)
* set your local environment variables to the correct AWS account (export AWS_ACCESS_KEY_ID="....")
* `cdk bootstrap`             Creates the necessary bootstrapping in current account to allow CDK to deploy
* `cdk synth`                 Creates the cloudformation for deployment and validates the stack
* `cdk deploy`                Deploy this stack to your current AWS account
* `cdk diff`                  Compare deployed stack with current state
* `cdk destroy XRayStack`     Destroys the stack
* 
* It was deployed in a rush. The way this is setup will deploy the code for all lambdas with each lambda
* A proper build process should individually bundle the lambdas up to keep size down.

### Code
* In the /code/ folder
* `npm run build` Compiles the typescript files in the /build/ folder, which is used by the cdk stack       
* Looks like Typescript isn't quite configured right and the .ts file are there too.
