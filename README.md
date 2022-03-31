# AWS Lambda sample for exporting AWS CloudWatch Logs to Azure Data Explorer 

If you’re working in Amazon Web Services (AWS) or have a multi-cloud environment that includes AWS, a solid logging and monitoring solution should be an essential part of your deployment and monitoring strategy. In AWS, this takes the form of CloudWatch, a service designed to collect diagnostic logging, utilization metrics, and events inside your service(s). However, if you’re looking for a fast, scalable solution to query your logs, it is possible to take the data collected in your CloudWatch log groups and send that data over to Azure Data Explorer (ADX) and then use the power of ADX to provide powerful analysis and reporting over any volume of your logging data for all your log groups. 

[Azure Data Explorer](https://azure.microsoft.com/en-us/services/data-explorer/) is a fully managed, high-performance, big data analytics platform that makes it easy to analyze high volumes of data in near real time. The Azure Data Explorer toolbox gives you an end-to-end solution for data ingestion, query, visualization, and management.

We can leverage AWS CloudWatch [subscription filters](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Subscriptions.html) feature to get access to a real-time feed of log events from CloudWatch Logs and have it delivered to a deployed AWS Lambda function. The stream of log events will be delieverd to your Lambda's [handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) and from there we can connect to an ADX cluster and ingest this data into one of your databases in the cluster. In this sample, we are using [Azure Data Explorer's NodeJS SDK](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/api/node/kusto-node-client-library).

## Deploy the AWS Lambda
1. After you clone this repoistory into one of your local folders, install the required npm packages by running `npm install` in the same folder.

2. Create a .zip file that contains the contents of your lambda folder: `zip -r kusto_exporter_function.zip .` (We use the -r option to ensure that zip compresses the subfolders).

3. Create the lambda function by uploading the package using the [AWS CLI](https://aws.amazon.com/cli/) create-function command: 

`aws lambda create-function --function-name kusto-exporter-function --zip-file fileb://kusto_exporter_function.zip --role lambda-execution-role-arn --handler index.handler --runtime nodejs12.x --timeout 30`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Note: Make sure that the NodeJS runtime of the function matches your local environment runtime.

4. Grant CloudWatch Logs the permission to execute your function, replacing the placeholder account with your own account and the placeholder log group with the log group to process:

`aws lambda add-permission --function-name "kusto-exporter-function" --statement-id "kusto-exporter-function" --principal "logs.region.amazonaws.com" --action "lambda:InvokeFunction" --source-arn "arn:aws:logs:region:123456789123:log-group:kusto_log_group:" --source-account "123456789012"`
 
 5. Create a subscription filter using the following command, replacing the placeholder account with your own account and the placeholder log group with the log group to process:
 
 `aws logs put-subscription-filter --log-group-name kusto_log_group --filter-name demo --filter-pattern "" --destination-arn arn:aws:lambda:region:123456789123:function:kusto-exporter-function`

After we've set the subscription filter to stream log events from the log group `kusto_log_group`, the lambda will accept the events as base64 encoded and compressed with the gzip format object. 

If you have already set up your Azure Data Explorer database to accept data from this function, you should be able to see your logs in ADX after they get ingested.


## Sample Code Disclaimer

This Sample Code is provided for the purpose of illustration only and is not intended to be used in a production environment. THIS SAMPLE CODE AND ANY RELATED INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.