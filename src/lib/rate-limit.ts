interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit({
  interval = 60 * 1000,
  uniqueTokenPerInterval = 100,
} = {}) {
  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = store[token] || {
          count: 0,
          resetTime: Date.now() + interval,
        };

        if (Date.now() > tokenCount.resetTime) {
          tokenCount.count = 0;
          tokenCount.resetTime = Date.now() + interval;
        }

        if (tokenCount.count >= limit) {
          reject(new Error("Rate limit exceeded"));
          return;
        }

        tokenCount.count++;
        store[token] = tokenCount;
        resolve();
      }),
  };
}

// middleware function for api routes
export async function withRateLimit(
  req: Request,
  limit = 100,
  interval = 60 * 1000
) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const limiter = rateLimit({ interval, uniqueTokenPerInterval: 500 });

  try {
    await limiter.check(limit, ip);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
    };
  }
}
