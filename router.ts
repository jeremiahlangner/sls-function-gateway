import { URLPattern } from 'urlpattern-polyfill';

type  Handler =  (event: AWSLambdaEvent) => any;

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

export { Handler, Router, Route }
