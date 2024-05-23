import { URLPattern } from 'urlpattern-polyfill';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"

type Handler = (event: AWSLambdaEvent) => any;

type Method = "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

type Route = {
  path: URLPattern;
  method: Method;
  handler: Handler;
}

class Router {
  routes: Route[] = [];

  constructor(routes: [string, Handler, Method?][] = []) {
    this.setup(routes);
  }

  setup(routes: [string, Handler, Method?][]) {
    for (const route of routes) {
      this.register(...route);
    }
  }

  register(path: string, handler: Handler, method: Method = "GET") {
    this.routes.push({
      path: new URLPattern({ pathname: path }),
      method,
      handler,
    });
  }

  handle(event: AWSLambdaEvent) {
    const { request } = event;

    for (const route of this.routes) {
      if (route.method !== request.method) continue;
      const match = route.path.exec({
        pathname: new URL(request.url).pathname,
      });
      if (match) return route.handler({ ...event, route: match });
    }
    return new Response("Not found", { status: 404 });
  }
}

const invoke = async (funcName: string, payload: any) => {
  const client = new LambdaClient({});
  const command = new InvokeCommand({
    FunctionName: funcName,
    Payload: JSON.stringify(payload),
    LogType: LogType.Tail,
  });

  const { Payload, LogResult } = await client.send(command);
  const result = Buffer.from(Payload).toString();
  const logs = Buffer.from(LogResult, "base64").toString();
  return { logs, result };
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
