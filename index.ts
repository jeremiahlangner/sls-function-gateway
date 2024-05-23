import { Router } from './router.ts';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"

const config = {};
const client = new LambdaClient(config);

async function invoke(FunctionName: string, payload: any) {
  return await client.send(new InvokeCommand({
    FunctionName,
    Payload: Buffer.from(payload),
    LogType: 'Tail'
  }));
};

export async function handler(event: AWSLambdaEvent) {
  const router = new Router([]);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
}
