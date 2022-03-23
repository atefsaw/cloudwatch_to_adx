const IngestClient = require("azure-kusto-ingest").IngestClient;
const IngestionProps = require("azure-kusto-ingest").IngestionProperties;
const KustoConnectionStringBuilder = require("azure-kusto-data").KustoConnectionStringBuilder;
const { DataFormat } = require("azure-kusto-ingest");

const Readable = require('stream').Readable;

const clusterName = process.env.ADX_CLUSTER_NAME;
const appId = process.env.AAD_APP_ID;
const appKey = process.env.AAD_APP_KEY;
const authorityId = process.env.AAD_AUTHORITY_ID;

const kcsb = KustoConnectionStringBuilder.withAadApplicationKeyAuthentication(`https://ingest-${clusterName}.kusto.windows.net`, appId, appKey, authorityId);

const ADX_DATABASE_NAME = "CloudWatchDatabase";
const ADX_TABLE_NAME = "SourceTable";
const ADX_TABLE_REFERENCE_MAPPING = "SourceTableReferenceMapping";

const ingestionProps = new IngestionProps({
    database: ADX_DATABASE_NAME,
    table: ADX_TABLE_NAME,
    format: DataFormat.SINGLEJSON,
    ingestionMappingReference: ADX_TABLE_REFERENCE_MAPPING
});

const ingestClient = new IngestClient(kcsb, ingestionProps);

async function IngestStream(stream) {
    try 
    {
        await ingestClient.ingestFromStream(stream, null);
    } 
    catch (err) 
    {
        console.log(err);
    }
}

exports.handler = async function(input, context) {
    var payloadJson = JSON.stringify({'payload': input.awslogs.data});
    var s = new Readable();
    s._read = () => {};
    s.push(payloadJson);
    s.push(null);
    await IngestStream(s);
    context.succeed();
}




