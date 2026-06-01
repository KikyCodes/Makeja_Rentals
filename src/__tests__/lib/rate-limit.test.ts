import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", async () => {
    const limiter = rateLimit({ interval: 60_000 });
    const result = await limiter.check(5, "test-ip-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding limit", async () => {
    const limiter = rateLimit({ interval: 60_000 });
    const ip = "test-ip-block";

    for (let i = 0; i < 3; i++) {
      await limiter.check(3, ip);
    }

    const result = await limiter.check(3, ip);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", async () => {
    const limiter = rateLimit({ interval: 60_000 });

    // Exhaust IP A
    for (let i = 0; i < 2; i++) await limiter.check(2, "ip-a");
    const resultA = await limiter.check(2, "ip-a");
    expect(resultA.success).toBe(false);

    // IP B should still have budget
    const resultB = await limiter.check(2, "ip-b");
    expect(resultB.success).toBe(true);
  });
});
